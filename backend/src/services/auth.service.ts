import bcrypt from "bcryptjs";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { Types } from "mongoose";
import { env } from "../config/env";
import { SubjectModel } from "../models/subject.model";
import { UserModel } from "../models/user.model";
import type { JwtPayload, UserRole } from "../types/auth.types";

const googleClient = new OAuth2Client(env.googleClientId);

const signupSchema = z.object({
	name: z.string().min(2).max(80),
	email: z.string().email(),
	password: z.string().min(6).max(128).optional(),
	role: z.enum(["student", "guide", "admin"]),
	branch: z.string().trim().optional(),
	division: z.string().trim().optional(),
	rollNo: z.string().trim().optional()
}).superRefine((data, ctx) => {
	if (data.role !== "student") return;

	if (!data.branch?.trim()) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Branch is required for students", path: ["branch"] });
	}
	if (!data.division?.trim()) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Division is required for students", path: ["division"] });
	}
	if (!data.rollNo?.trim()) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Roll number is required for students", path: ["rollNo"] });
	}
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6).max(128)
});

interface SignupInput {
	name: string;
	email: string;
	password?: string;
	role: UserRole;
	branch?: string;
	division?: string;
	rollNo?: string;
}

interface LoginInput {
	email: string;
	password?: string;
}

interface AuthResult {
	token: string;
	user: {
		id: string;
		name: string;
		email: string;
		role: UserRole;
		hasCreatedGroup: boolean;
		branch?: string;
		division?: string;
		rollNo?: string;
		teachingSubjectIds: string[];
	};
}

class AppError extends Error {
	statusCode: number;

	constructor(statusCode: number, message: string) {
		super(message);
		this.statusCode = statusCode;
	}
}

const createToken = (payload: JwtPayload): string => {
	const secret = env.jwtSecret as Secret;
	const options: SignOptions = {
		expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"]
	};

	return jwt.sign(payload, secret, options);
};

const toTeachingSubjectIds = (subjects: unknown): string[] => {
	if (!Array.isArray(subjects)) return [];
	return subjects
		.map((subject) => {
			if (typeof subject === "string") return subject;
			if (subject && typeof subject === "object" && "_id" in subject) return String((subject as { _id?: unknown })._id ?? "");
			return String(subject ?? "");
		})
		.filter(Boolean);
};

const assertValidSubjectIds = async (subjectIds: string[]) => {
	const uniqueIds = [...new Set(subjectIds.map((subjectId) => subjectId.trim()).filter(Boolean))];
	for (const subjectId of uniqueIds) {
		if (!Types.ObjectId.isValid(subjectId)) {
			throw new AppError(400, "Invalid subject ID");
		}
	}

	if (uniqueIds.length === 0) return uniqueIds;

	const existingSubjects = await SubjectModel.find({ _id: { $in: uniqueIds } }).select("_id").lean();
	if (existingSubjects.length !== uniqueIds.length) {
		throw new AppError(404, "One or more selected subjects were not found");
	}

	return uniqueIds;
};

export const updateGuideSubjects = async (userId: string, subjectIds: string[]): Promise<AuthResult> => {
	const user = await UserModel.findById(userId);
	if (!user) {
		throw new AppError(404, "User not found");
	}

	if (user.role !== "guide") {
		throw new AppError(403, "Only guides can update teaching subjects");
	}

	const validSubjectIds = await assertValidSubjectIds(subjectIds);
	user.teachingSubjects = validSubjectIds.map((subjectId) => new Types.ObjectId(subjectId));
	await user.save();

	return toAuthResult(user);
};

const toAuthResult = (user: any): AuthResult => {
	const token = createToken({ userId: String(user._id), role: user.role });

	return {
		token,
		user: {
			id: String(user._id),
			name: user.name,
			email: user.email,
			role: user.role,
			hasCreatedGroup: user.hasCreatedGroup ?? false,
			branch: user.branch,
			division: user.division,
			rollNo: user.rollNo,
			teachingSubjectIds: toTeachingSubjectIds(user.teachingSubjects)
		}
	};
};

const enforceVitDomain = (email: string) => {
	if (!email.toLowerCase().endsWith("@vit.edu")) {
		throw new AppError(403, "Only @vit.edu emails are allowed.");
	}
};

export const registerUser = async (input: SignupInput): Promise<AuthResult> => {
	const payload = signupSchema.parse(input);
	enforceVitDomain(payload.email);

	const existingUser = await UserModel.findOne({ email: payload.email.toLowerCase() });
	if (existingUser) {
		throw new AppError(409, "Email already registered");
	}

	let hashedPassword = undefined;
	if (payload.password) {
		hashedPassword = await bcrypt.hash(payload.password, 10);
	}

	const user = await UserModel.create({
		name: payload.name,
		email: payload.email.toLowerCase(),
		password: hashedPassword,
		role: payload.role,
		hasCreatedGroup: false,
		branch: payload.role === "student" ? payload.branch?.trim() : undefined,
		division: payload.role === "student" ? payload.division?.trim() : undefined,
		rollNo: payload.role === "student" ? payload.rollNo?.trim() : undefined,
		teachingSubjects: []
	});

	return toAuthResult(user);
};

export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
	if (!input.password) {
		throw new AppError(400, "Password is required for traditional login");
	}
	const payload = loginSchema.parse(input);

	const user = await UserModel.findOne({ email: payload.email.toLowerCase() });
	if (!user) {
		throw new AppError(401, "Invalid email or password");
	}

	if (!user.password) {
		throw new AppError(401, "Account was created with Google. Use 'Sign in with Google' instead.");
	}

	const isPasswordValid = await bcrypt.compare(payload.password, user.password);
	if (!isPasswordValid) {
		throw new AppError(401, "Invalid email or password");
	}

	return toAuthResult(user);
};

export const googleAuthLogin = async (credential: string, role: UserRole): Promise<AuthResult> => {
	const ticket = await googleClient.verifyIdToken({
		idToken: credential,
		audience: env.googleClientId,
	});
	
	const payload = ticket.getPayload();
	if (!payload || !payload.email) {
		throw new AppError(400, "Invalid Google token");
	}

	const email = payload.email.toLowerCase();
	enforceVitDomain(email);

	let user = await UserModel.findOne({ email });
	if (!user) {
		// Auto-create user if they don't exist
		user = await UserModel.create({
			name: payload.name || email.split("@")[0],
			email,
			role,
			hasCreatedGroup: false,
			teachingSubjects: []
		});
	} else if (user.role !== role) {
		throw new AppError(403, `Account exists with a different role (${user.role})`);
	}

	return toAuthResult(user);
};

export const getUserById = async (userId: string) => {
	const user = await UserModel.findById(userId).lean();

	if (!user) {
		throw new AppError(404, "User not found");
	}

	return {
		id: String(user._id),
		name: user.name,
		email: user.email,
		role: user.role,
		hasCreatedGroup: user.hasCreatedGroup ?? false,
		branch: user.branch,
		division: user.division,
		rollNo: user.rollNo,
		teachingSubjectIds: toTeachingSubjectIds(user.teachingSubjects)
	};
};

export { AppError };

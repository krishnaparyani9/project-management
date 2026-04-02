import bcrypt from "bcryptjs";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import { UserModel } from "../models/user.model";
import type { JwtPayload, UserRole } from "../types/auth.types";

const signupSchema = z.object({
	name: z.string().min(2).max(80),
	email: z.string().email(),
	password: z.string().min(6).max(128),
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
	password: string;
	role: UserRole;
	branch?: string;
	division?: string;
	rollNo?: string;
}

interface LoginInput {
	email: string;
	password: string;
}

interface AuthResult {
	token: string;
	user: {
		id: string;
		name: string;
		email: string;
		role: UserRole;
		branch?: string;
		division?: string;
		rollNo?: string;
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

const toAuthResult = (user: {
	_id: string;
	name: string;
	email: string;
	role: UserRole;
	branch?: string;
	division?: string;
	rollNo?: string;
}): AuthResult => {
	const token = createToken({ userId: String(user._id), role: user.role });

	return {
		token,
		user: {
			id: String(user._id),
			name: user.name,
			email: user.email,
			role: user.role,
			branch: user.branch,
			division: user.division,
			rollNo: user.rollNo
		}
	};
};

export const registerUser = async (input: SignupInput): Promise<AuthResult> => {
	const payload = signupSchema.parse(input);

	const existingUser = await UserModel.findOne({ email: payload.email.toLowerCase() });
	if (existingUser) {
		throw new AppError(409, "Email already registered");
	}

	const hashedPassword = await bcrypt.hash(payload.password, 10);
	const user = await UserModel.create({
		name: payload.name,
		email: payload.email.toLowerCase(),
		password: hashedPassword,
		role: payload.role,
		branch: payload.role === "student" ? payload.branch?.trim() : undefined,
		division: payload.role === "student" ? payload.division?.trim() : undefined,
		rollNo: payload.role === "student" ? payload.rollNo?.trim() : undefined
	});

	return toAuthResult(user);
};

export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
	const payload = loginSchema.parse(input);

	const user = await UserModel.findOne({ email: payload.email.toLowerCase() });
	if (!user) {
		throw new AppError(401, "Invalid email or password");
	}

	const isPasswordValid = await bcrypt.compare(payload.password, user.password);
	if (!isPasswordValid) {
		throw new AppError(401, "Invalid email or password");
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
		branch: user.branch,
		division: user.division,
		rollNo: user.rollNo
	};
};

export { AppError };

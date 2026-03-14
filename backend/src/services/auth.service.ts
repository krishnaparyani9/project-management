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
	role: z.enum(["student", "guide"])
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

const toAuthResult = (user: { _id: string; name: string; email: string; role: UserRole }): AuthResult => {
	const token = createToken({ userId: String(user._id), role: user.role });

	return {
		token,
		user: {
			id: String(user._id),
			name: user.name,
			email: user.email,
			role: user.role
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
		role: payload.role
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
		role: user.role
	};
};

export { AppError };

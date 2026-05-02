import type { Request } from "express";

export type UserRole = "student" | "guide" | "admin";

export interface JwtPayload {
	userId: string;
	role: UserRole;
}

export interface AuthenticatedRequest extends Request {
	user?: JwtPayload;
	file?: Express.Multer.File;
}

import type { Request } from "express";

export type UserRole = "student" | "guide";

export interface JwtPayload {
	userId: string;
	role: UserRole;
}

export interface AuthenticatedRequest extends Request {
	user?: JwtPayload;
}

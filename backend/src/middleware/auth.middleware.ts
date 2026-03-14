import type { NextFunction, Response } from "express";
import jwt, { type JwtPayload as DefaultJwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthenticatedRequest, JwtPayload } from "../types/auth.types";

const parseToken = (headerValue?: string): string | null => {
	if (!headerValue) return null;
	const [scheme, token] = headerValue.split(" ");
	if (scheme !== "Bearer" || !token) return null;
	return token;
};

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
	const cookieToken = (req.cookies as Record<string, string> | undefined)?.accessToken;
	const headerToken = parseToken(req.headers.authorization);
	const token = cookieToken ?? headerToken;

	if (!token) {
		res.status(401).json({ success: false, message: "Unauthorized" });
		return;
	}

	try {
		const decoded = jwt.verify(token, env.jwtSecret) as DefaultJwtPayload & JwtPayload;
		req.user = { userId: decoded.userId, role: decoded.role };
		next();
	} catch {
		res.status(401).json({ success: false, message: "Invalid or expired token" });
	}
};

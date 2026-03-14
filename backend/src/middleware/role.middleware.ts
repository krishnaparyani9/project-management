import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest, UserRole } from "../types/auth.types";

export const authorizeRoles = (...roles: UserRole[]) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
		if (!req.user || !roles.includes(req.user.role)) {
			res.status(403).json({ success: false, message: "Forbidden" });
			return;
		}

		next();
	};
};

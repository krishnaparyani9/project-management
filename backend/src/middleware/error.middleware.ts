import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../services/auth.service";

export const errorHandler = (
	error: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
): void => {
	if (error instanceof ZodError) {
		res.status(400).json({
			success: false,
			message: "Validation failed",
			errors: error.issues.map((issue) => ({
				field: issue.path.join("."),
				message: issue.message
			}))
		});
		return;
	}

	if (error instanceof AppError) {
		res.status(error.statusCode).json({ success: false, message: error.message });
		return;
	}

	res.status(500).json({ success: false, message: "Internal server error" });
};

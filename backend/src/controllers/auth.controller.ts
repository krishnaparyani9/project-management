import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { env } from "../config/env";
import { getUserById, loginUser, registerUser, googleAuthLogin } from "../services/auth.service";
import type { AuthenticatedRequest } from "../types/auth.types";

const accessCookieName = "accessToken";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export const signup = asyncHandler(async (req: Request, res: Response) => {
	const result = await registerUser(req.body);
	res.cookie(accessCookieName, result.token, cookieOptions);
	res.status(201).json(new ApiResponse(true, "Signup successful", { user: result.user }));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
	const result = await loginUser(req.body);
	res.cookie(accessCookieName, result.token, cookieOptions);
	res.status(200).json(new ApiResponse(true, "Login successful", { user: result.user }));
});

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
	const { credential, role } = req.body;
	if (!credential || !role) {
		res.status(400).json(new ApiResponse(false, "Google credential and role are required", null));
		return;
	}
	const result = await googleAuthLogin(credential, role);
	res.cookie(accessCookieName, result.token, cookieOptions);
	res.status(200).json(new ApiResponse(true, "Google login successful", { user: result.user }));
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const userId = req.user?.userId;
	const user = await getUserById(String(userId));
	res.status(200).json(new ApiResponse(true, "Current user fetched", { user }));
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
	res.clearCookie(accessCookieName, {
		httpOnly: true,
		sameSite: "lax",
		secure: env.clientUrl.startsWith("https://")
	});

	res.status(200).json(new ApiResponse(true, "Logged out", null));
});

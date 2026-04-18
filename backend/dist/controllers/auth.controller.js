"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.updateProfile = exports.me = exports.googleLogin = exports.login = exports.signup = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const env_1 = require("../config/env");
const auth_service_1 = require("../services/auth.service");
const accessCookieName = "accessToken";
const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
};
exports.signup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, auth_service_1.registerUser)(req.body);
    res.cookie(accessCookieName, result.token, cookieOptions);
    res.status(201).json(new ApiResponse_1.ApiResponse(true, "Signup successful", { user: result.user }));
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, auth_service_1.loginUser)(req.body);
    res.cookie(accessCookieName, result.token, cookieOptions);
    res.status(200).json(new ApiResponse_1.ApiResponse(true, "Login successful", { user: result.user }));
});
exports.googleLogin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { credential, role } = req.body;
    if (!credential || !role) {
        res.status(400).json(new ApiResponse_1.ApiResponse(false, "Google credential and role are required", null));
        return;
    }
    const result = await (0, auth_service_1.googleAuthLogin)(credential, role);
    res.cookie(accessCookieName, result.token, cookieOptions);
    res.status(200).json(new ApiResponse_1.ApiResponse(true, "Google login successful", { user: result.user }));
});
exports.me = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const user = await (0, auth_service_1.getUserById)(String(userId));
    res.status(200).json(new ApiResponse_1.ApiResponse(true, "Current user fetched", { user }));
});
exports.updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const { teachingSubjectIds } = req.body;
    const user = await (0, auth_service_1.updateGuideSubjects)(String(userId), Array.isArray(teachingSubjectIds) ? teachingSubjectIds : []);
    res.status(200).json(new ApiResponse_1.ApiResponse(true, "Profile updated", { user: user.user }));
});
exports.logout = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.clearCookie(accessCookieName, {
        httpOnly: true,
        sameSite: "lax",
        secure: env_1.env.clientUrl.startsWith("https://")
    });
    res.status(200).json(new ApiResponse_1.ApiResponse(true, "Logged out", null));
});

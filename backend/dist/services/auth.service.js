"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const env_1 = require("../config/env");
const user_model_1 = require("../models/user.model");
const signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(80),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(128),
    role: zod_1.z.enum(["student", "guide"])
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(128)
});
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
const createToken = (payload) => {
    const secret = env_1.env.jwtSecret;
    const options = {
        expiresIn: env_1.env.jwtExpiresIn
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
const toAuthResult = (user) => {
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
const registerUser = async (input) => {
    const payload = signupSchema.parse(input);
    const existingUser = await user_model_1.UserModel.findOne({ email: payload.email.toLowerCase() });
    if (existingUser) {
        throw new AppError(409, "Email already registered");
    }
    const hashedPassword = await bcryptjs_1.default.hash(payload.password, 10);
    const user = await user_model_1.UserModel.create({
        name: payload.name,
        email: payload.email.toLowerCase(),
        password: hashedPassword,
        role: payload.role
    });
    return toAuthResult(user);
};
exports.registerUser = registerUser;
const loginUser = async (input) => {
    const payload = loginSchema.parse(input);
    const user = await user_model_1.UserModel.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
        throw new AppError(401, "Invalid email or password");
    }
    const isPasswordValid = await bcryptjs_1.default.compare(payload.password, user.password);
    if (!isPasswordValid) {
        throw new AppError(401, "Invalid email or password");
    }
    return toAuthResult(user);
};
exports.loginUser = loginUser;
const getUserById = async (userId) => {
    const user = await user_model_1.UserModel.findById(userId).lean();
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
exports.getUserById = getUserById;

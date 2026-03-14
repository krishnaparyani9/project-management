"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const parseToken = (headerValue) => {
    if (!headerValue)
        return null;
    const [scheme, token] = headerValue.split(" ");
    if (scheme !== "Bearer" || !token)
        return null;
    return token;
};
const authenticate = (req, res, next) => {
    const cookieToken = req.cookies?.accessToken;
    const headerToken = parseToken(req.headers.authorization);
    const token = cookieToken ?? headerToken;
    if (!token) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    }
    catch {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};
exports.authenticate = authenticate;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const errorHandler = (error, _req, res, _next) => {
    if (error instanceof zod_1.ZodError) {
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
    if (error instanceof auth_service_1.AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
    }
    // eslint-disable-next-line no-console
    console.error("Internal Error:", error);
    res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
    });
};
exports.errorHandler = errorHandler;

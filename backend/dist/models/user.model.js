"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    role: {
        type: String,
        enum: ["student", "guide", "admin"],
        default: "student",
        required: true
    },
    hasCreatedGroup: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: false,
        minlength: 6
    },
    branch: {
        type: String,
        trim: true,
        default: undefined
    },
    division: {
        type: String,
        trim: true,
        default: undefined
    },
    rollNo: {
        type: String,
        trim: true,
        default: undefined
    }
}, { timestamps: true });
exports.UserModel = (0, mongoose_1.model)("User", userSchema);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.getUserById = exports.googleAuthLogin = exports.loginUser = exports.registerUser = exports.updateGuideSubjects = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const google_auth_library_1 = require("google-auth-library");
const mongoose_1 = require("mongoose");
const env_1 = require("../config/env");
const subject_model_1 = require("../models/subject.model");
const user_model_1 = require("../models/user.model");
const googleClient = new google_auth_library_1.OAuth2Client(env_1.env.googleClientId);
const signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(80),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(128).optional(),
    role: zod_1.z.enum(["student", "guide", "admin"]),
    branch: zod_1.z.string().trim().optional(),
    division: zod_1.z.string().trim().optional(),
    rollNo: zod_1.z.string().trim().optional()
}).superRefine((data, ctx) => {
    if (data.role !== "student")
        return;
    if (!data.branch?.trim()) {
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: "Branch is required for students", path: ["branch"] });
    }
    if (!data.division?.trim()) {
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: "Division is required for students", path: ["division"] });
    }
    if (!data.rollNo?.trim()) {
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: "Roll number is required for students", path: ["rollNo"] });
    }
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
const toTeachingSubjectIds = (subjects) => {
    if (!Array.isArray(subjects))
        return [];
    return subjects
        .map((subject) => {
        if (typeof subject === "string")
            return subject;
        if (subject && typeof subject === "object" && "_id" in subject)
            return String(subject._id ?? "");
        return String(subject ?? "");
    })
        .filter(Boolean);
};
const assertValidSubjectIds = async (subjectIds) => {
    const uniqueIds = [...new Set(subjectIds.map((subjectId) => subjectId.trim()).filter(Boolean))];
    for (const subjectId of uniqueIds) {
        if (!mongoose_1.Types.ObjectId.isValid(subjectId)) {
            throw new AppError(400, "Invalid subject ID");
        }
    }
    if (uniqueIds.length === 0)
        return uniqueIds;
    const existingSubjects = await subject_model_1.SubjectModel.find({ _id: { $in: uniqueIds } }).select("_id").lean();
    if (existingSubjects.length !== uniqueIds.length) {
        throw new AppError(404, "One or more selected subjects were not found");
    }
    return uniqueIds;
};
const updateGuideSubjects = async (userId, subjectIds) => {
    const user = await user_model_1.UserModel.findById(userId);
    if (!user) {
        throw new AppError(404, "User not found");
    }
    if (user.role !== "guide") {
        throw new AppError(403, "Only guides can update teaching subjects");
    }
    const validSubjectIds = await assertValidSubjectIds(subjectIds);
    user.teachingSubjects = validSubjectIds.map((subjectId) => new mongoose_1.Types.ObjectId(subjectId));
    await user.save();
    return toAuthResult(user);
};
exports.updateGuideSubjects = updateGuideSubjects;
const toAuthResult = (user) => {
    const token = createToken({ userId: String(user._id), role: user.role });
    return {
        token,
        user: {
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            hasCreatedGroup: user.hasCreatedGroup ?? false,
            branch: user.branch,
            division: user.division,
            rollNo: user.rollNo,
            teachingSubjectIds: toTeachingSubjectIds(user.teachingSubjects)
        }
    };
};
const enforceVitDomain = (email) => {
    if (!email.toLowerCase().endsWith("@vit.edu")) {
        throw new AppError(403, "Only @vit.edu emails are allowed.");
    }
};
const registerUser = async (input) => {
    const payload = signupSchema.parse(input);
    enforceVitDomain(payload.email);
    const existingUser = await user_model_1.UserModel.findOne({ email: payload.email.toLowerCase() });
    if (existingUser) {
        throw new AppError(409, "Email already registered");
    }
    let hashedPassword = undefined;
    if (payload.password) {
        hashedPassword = await bcryptjs_1.default.hash(payload.password, 10);
    }
    const user = await user_model_1.UserModel.create({
        name: payload.name,
        email: payload.email.toLowerCase(),
        password: hashedPassword,
        role: payload.role,
        hasCreatedGroup: false,
        branch: payload.role === "student" ? payload.branch?.trim() : undefined,
        division: payload.role === "student" ? payload.division?.trim() : undefined,
        rollNo: payload.role === "student" ? payload.rollNo?.trim() : undefined,
        teachingSubjects: []
    });
    return toAuthResult(user);
};
exports.registerUser = registerUser;
const loginUser = async (input) => {
    if (!input.password) {
        throw new AppError(400, "Password is required for traditional login");
    }
    const payload = loginSchema.parse(input);
    const user = await user_model_1.UserModel.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
        throw new AppError(401, "Invalid email or password");
    }
    if (!user.password) {
        throw new AppError(401, "Account was created with Google. Use 'Sign in with Google' instead.");
    }
    const isPasswordValid = await bcryptjs_1.default.compare(payload.password, user.password);
    if (!isPasswordValid) {
        throw new AppError(401, "Invalid email or password");
    }
    return toAuthResult(user);
};
exports.loginUser = loginUser;
const googleAuthLogin = async (credential, role) => {
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: env_1.env.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new AppError(400, "Invalid Google token");
    }
    const email = payload.email.toLowerCase();
    enforceVitDomain(email);
    let user = await user_model_1.UserModel.findOne({ email });
    if (!user) {
        // Auto-create user if they don't exist
        user = await user_model_1.UserModel.create({
            name: payload.name || email.split("@")[0],
            email,
            role,
            hasCreatedGroup: false,
            teachingSubjects: []
        });
    }
    else if (user.role !== role) {
        throw new AppError(403, `Account exists with a different role (${user.role})`);
    }
    return toAuthResult(user);
};
exports.googleAuthLogin = googleAuthLogin;
const getUserById = async (userId) => {
    const user = await user_model_1.UserModel.findById(userId).lean();
    if (!user) {
        throw new AppError(404, "User not found");
    }
    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        hasCreatedGroup: user.hasCreatedGroup ?? false,
        branch: user.branch,
        division: user.division,
        rollNo: user.rollNo,
        teachingSubjectIds: toTeachingSubjectIds(user.teachingSubjects)
    };
};
exports.getUserById = getUserById;

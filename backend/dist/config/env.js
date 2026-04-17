"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default("5000"),
    NODE_ENV: zod_1.z.string().default("development"),
    AUTO_FREE_PORT: zod_1.z.enum(["true", "false"]).default("true"),
    MONGODB_URI: zod_1.z.string().min(1, "MONGODB_URI is required"),
    JWT_SECRET: zod_1.z.string().min(8, "JWT_SECRET must be at least 8 chars"),
    JWT_EXPIRES_IN: zod_1.z.string().default("7d"),
    CLIENT_URL: zod_1.z.string().url().default("http://localhost:5173"),
    GOOGLE_CLIENT_ID: zod_1.z.string().default("test-client-id")
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    const issues = parsed.error.issues.map((item) => `${item.path.join(".")}: ${item.message}`).join("; ");
    throw new Error(`Invalid environment configuration: ${issues}`);
}
exports.env = {
    port: Number(parsed.data.PORT),
    nodeEnv: parsed.data.NODE_ENV,
    autoFreePort: parsed.data.AUTO_FREE_PORT === "true",
    mongoUri: parsed.data.MONGODB_URI,
    jwtSecret: parsed.data.JWT_SECRET,
    jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
    clientUrl: parsed.data.CLIENT_URL,
    googleClientId: parsed.data.GOOGLE_CLIENT_ID
};

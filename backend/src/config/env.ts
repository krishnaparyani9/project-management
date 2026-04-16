import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	PORT: z.string().default("5000"),
	MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
	JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 chars"),
	JWT_EXPIRES_IN: z.string().default("7d"),
	CLIENT_URL: z.string().url().default("http://localhost:5173"),
	GOOGLE_CLIENT_ID: z.string().default("test-client-id")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	const issues = parsed.error.issues.map((item) => `${item.path.join(".")}: ${item.message}`).join("; ");
	throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = {
	port: Number(parsed.data.PORT),
	mongoUri: parsed.data.MONGODB_URI,
	jwtSecret: parsed.data.JWT_SECRET,
	jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
	clientUrl: parsed.data.CLIENT_URL,
	googleClientId: parsed.data.GOOGLE_CLIENT_ID
};

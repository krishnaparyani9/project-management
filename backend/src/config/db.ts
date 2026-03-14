import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async (): Promise<void> => {
	await mongoose.connect(env.mongoUri, {
		serverSelectionTimeoutMS: 8000
	});

	// eslint-disable-next-line no-console
	console.log(`MongoDB connected: ${mongoose.connection.name}`);

	mongoose.connection.on("error", (error) => {
		// eslint-disable-next-line no-console
		console.error("MongoDB runtime error:", error.message);
	});
};

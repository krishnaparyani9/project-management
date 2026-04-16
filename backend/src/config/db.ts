import mongoose from "mongoose";
import { env } from "./env";
import { MongoMemoryServer } from "mongodb-memory-server";

export const connectDB = async (): Promise<void> => {
	let mongoUri = env.mongoUri;
	let mongod: MongoMemoryServer | null = null;

	try {
		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: 2000
		});
		// eslint-disable-next-line no-console
		console.log(`MongoDB connected: ${mongoose.connection.name}`);
	} catch (err: any) {
		// eslint-disable-next-line no-console
		console.warn("Local MongoDB not found, falling back to in-memory MongoDB...");
		mongod = await MongoMemoryServer.create();
		mongoUri = mongod.getUri();
		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: 8000
		});
		// eslint-disable-next-line no-console
		console.log(`MongoDB (Memory Server) connected: ${mongoose.connection.name}`);
	}

	mongoose.connection.on("error", (error) => {
		// eslint-disable-next-line no-console
		console.error("MongoDB runtime error:", error.message);
	});
};

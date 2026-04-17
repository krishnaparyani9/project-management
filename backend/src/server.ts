import http from "node:http";
import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { ensurePortIsFreeForDev } from "./utils/portRecovery";

const startServer = async (): Promise<void> => {
	try {
		await connectDB();
		await ensurePortIsFreeForDev(env.port, env.autoFreePort && env.nodeEnv !== "production");
		const server = http.createServer(app);

		server.on("error", (error: NodeJS.ErrnoException) => {
			if (error.code === "EADDRINUSE") {
				// eslint-disable-next-line no-console
				console.error(`Port ${env.port} is already in use. Stop the existing process or change PORT in backend/.env.`);
				process.exit(1);
			}

			// eslint-disable-next-line no-console
			console.error("Server error:", error.message);
			process.exit(1);
		});

		server.listen(env.port, () => {
			// eslint-disable-next-line no-console
			console.log(`Backend server running on port ${env.port}`);
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("Failed to start server", error);
		process.exit(1);
	}
};

void startServer();

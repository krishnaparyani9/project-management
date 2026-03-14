import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import progressRoutes from "./routes/progress.routes";
import groupRoutes from "./routes/group.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(
	cors({
		origin: env.clientUrl,
		credentials: true
	})
);
app.use(cookieParser());
app.use(express.json());

app.get("/api/health", (_req, res) => {
	res.status(200).json({ success: true, message: "Server is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/groups", groupRoutes);

app.use(errorHandler);

export default app;

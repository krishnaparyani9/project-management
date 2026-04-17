"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const portRecovery_1 = require("./utils/portRecovery");
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        await (0, portRecovery_1.ensurePortIsFreeForDev)(env_1.env.port, env_1.env.autoFreePort && env_1.env.nodeEnv !== "production");
        const server = node_http_1.default.createServer(app_1.default);
        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                // eslint-disable-next-line no-console
                console.error(`Port ${env_1.env.port} is already in use. Stop the existing process or change PORT in backend/.env.`);
                process.exit(1);
            }
            // eslint-disable-next-line no-console
            console.error("Server error:", error.message);
            process.exit(1);
        });
        server.listen(env_1.env.port, () => {
            // eslint-disable-next-line no-console
            console.log(`Backend server running on port ${env_1.env.port}`);
        });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to start server", error);
        process.exit(1);
    }
};
void startServer();

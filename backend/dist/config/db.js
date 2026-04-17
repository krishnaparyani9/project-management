"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const mongodb_memory_server_1 = require("mongodb-memory-server");
const connectDB = async () => {
    let mongoUri = env_1.env.mongoUri;
    let mongod = null;
    try {
        await mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 2000
        });
        // eslint-disable-next-line no-console
        console.log(`MongoDB connected: ${mongoose_1.default.connection.name}`);
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Local MongoDB not found, falling back to in-memory MongoDB...");
        mongod = await mongodb_memory_server_1.MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        await mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 8000
        });
        // eslint-disable-next-line no-console
        console.log(`MongoDB (Memory Server) connected: ${mongoose_1.default.connection.name}`);
    }
    mongoose_1.default.connection.on("error", (error) => {
        // eslint-disable-next-line no-console
        console.error("MongoDB runtime error:", error.message);
    });
};
exports.connectDB = connectDB;

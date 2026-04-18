"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModel = void 0;
const mongoose_1 = require("mongoose");
const taskSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    assignee: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    group: { type: mongoose_1.Schema.Types.ObjectId, ref: "ProjectGroup" },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    dueDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ["todo", "in-progress", "done"],
        default: "todo",
        required: true
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
        required: true
    },
    completionNote: { type: String, trim: true, default: "" },
    completionCommitUrls: [{ type: String, trim: true }],
    completedAt: { type: Date, default: null }
}, { timestamps: true });
exports.TaskModel = (0, mongoose_1.model)("Task", taskSchema);

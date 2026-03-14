"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressUpdateModel = void 0;
const mongoose_1 = require("mongoose");
const progressUpdateSchema = new mongoose_1.Schema({
    student: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    task: { type: mongoose_1.Schema.Types.ObjectId, ref: "Task" },
    summary: { type: String, required: true, trim: true },
    completionPercent: { type: Number, min: 0, max: 100, default: 0, required: true },
    documentationUrl: { type: String }
}, { timestamps: true });
exports.ProgressUpdateModel = (0, mongoose_1.model)("ProgressUpdate", progressUpdateSchema);

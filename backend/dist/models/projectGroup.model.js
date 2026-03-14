"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectGroupModel = void 0;
const mongoose_1 = require("mongoose");
const projectGroupSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    guide: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }],
    milestone: { type: String, default: "Initial planning" }
}, { timestamps: true });
exports.ProjectGroupModel = (0, mongoose_1.model)("ProjectGroup", projectGroupSchema);

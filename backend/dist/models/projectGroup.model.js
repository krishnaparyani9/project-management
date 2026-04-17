"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectGroupModel = void 0;
const mongoose_1 = require("mongoose");
const projectGroupSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    repositoryUrl: { type: String, trim: true, default: null },
    isEdiRegistered: { type: Boolean, default: false },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    ediGuide: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: null },
    cpGuide: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: null },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    pendingInvites: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });
exports.ProjectGroupModel = (0, mongoose_1.model)("ProjectGroup", projectGroupSchema);

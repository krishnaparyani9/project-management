"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuideProgressUpdates = exports.getMyProgressUpdates = void 0;
const projectGroup_model_1 = require("../models/projectGroup.model");
const progressUpdate_model_1 = require("../models/progressUpdate.model");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getMyProgressUpdates = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const updates = await progressUpdate_model_1.ProgressUpdateModel.find({ student: userId }).sort({ createdAt: -1 }).limit(20).lean();
    const formatted = updates.map((update) => ({
        id: String(update._id),
        summary: update.summary,
        completionPercent: update.completionPercent,
        documentationUrl: update.documentationUrl,
        createdAt: update.createdAt
    }));
    res.status(200).json(new ApiResponse_1.ApiResponse(true, "Progress updates fetched", formatted));
});
exports.getGuideProgressUpdates = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const groups = await projectGroup_model_1.ProjectGroupModel.find({ guide: userId }).select("members").lean();
    const studentIds = groups.flatMap((group) => group.members);
    const updates = await progressUpdate_model_1.ProgressUpdateModel.find({ student: { $in: studentIds } })
        .populate("student", "name email")
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();
    const formatted = updates.map((update) => ({
        id: String(update._id),
        summary: update.summary,
        completionPercent: update.completionPercent,
        documentationUrl: update.documentationUrl,
        createdAt: update.createdAt,
        student: update.student
    }));
    res.status(200).json(new ApiResponse_1.ApiResponse(true, "Guide progress updates fetched", formatted));
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuideGroups = exports.getMyGroup = void 0;
const projectGroup_model_1 = require("../models/projectGroup.model");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getMyGroup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const group = await projectGroup_model_1.ProjectGroupModel.findOne({ members: userId })
        .populate("guide", "name email")
        .populate("members", "name email role")
        .lean();
    if (!group) {
        res.status(200).json(new ApiResponse_1.ApiResponse(true, "No group assigned", null));
        return;
    }
    res.status(200).json(new ApiResponse_1.ApiResponse(true, "Group fetched", {
        id: String(group._id),
        name: group.name,
        milestone: group.milestone,
        guide: group.guide,
        members: group.members
    }));
});
exports.getGuideGroups = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const groups = await projectGroup_model_1.ProjectGroupModel.find({ guide: userId })
        .populate("guide", "name email")
        .populate("members", "name email role")
        .sort({ createdAt: -1 })
        .lean();
    const formatted = groups.map((group) => ({
        id: String(group._id),
        name: group.name,
        milestone: group.milestone,
        guide: group.guide,
        members: group.members
    }));
    res.status(200).json(new ApiResponse_1.ApiResponse(true, "Guide groups fetched", formatted));
});

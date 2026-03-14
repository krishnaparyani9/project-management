"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuideTasks = exports.getMyTasks = void 0;
const projectGroup_model_1 = require("../models/projectGroup.model");
const task_model_1 = require("../models/task.model");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getMyTasks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const tasks = await task_model_1.TaskModel.find({ assignee: userId }).sort({ dueDate: 1 }).lean();
    const formatted = tasks.map((task) => ({
        id: String(task._id),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority
    }));
    res.status(200).json(new ApiResponse_1.ApiResponse(true, "Tasks fetched", formatted));
});
exports.getGuideTasks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const groups = await projectGroup_model_1.ProjectGroupModel.find({ guide: userId }).select("_id").lean();
    const groupIds = groups.map((group) => group._id);
    const tasks = await task_model_1.TaskModel.find({ group: { $in: groupIds } })
        .populate("assignee", "name email")
        .populate("group", "name")
        .sort({ createdAt: -1 })
        .lean();
    const formatted = tasks.map((task) => ({
        id: String(task._id),
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        group: task.group
    }));
    res.status(200).json(new ApiResponse_1.ApiResponse(true, "Guide tasks fetched", formatted));
});

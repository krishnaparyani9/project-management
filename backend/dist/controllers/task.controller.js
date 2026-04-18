"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyTaskStatus = exports.createGuideTask = exports.getGuideTasks = exports.getMyTasks = void 0;
const mongoose_1 = require("mongoose");
const projectGroup_model_1 = require("../models/projectGroup.model");
const progressUpdate_model_1 = require("../models/progressUpdate.model");
const task_model_1 = require("../models/task.model");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const isValidCommitUrl = (value) => /^https?:\/\/(www\.)?github\.com\/.+\/commit\/[a-f0-9]{7,40}$/i.test(value.trim());
const formatTask = (task, includeRelations = false) => {
    const formatted = {
        id: String(task._id),
        title: task.title,
        description: task.description ?? "",
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        completionNote: task.completionNote ?? "",
        completionCommitUrls: task.completionCommitUrls ?? [],
        completedAt: task.completedAt ?? null
    };
    if (!includeRelations)
        return formatted;
    return {
        ...formatted,
        assignee: task.assignee,
        group: task.group,
        createdBy: task.createdBy
    };
};
exports.getMyTasks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const tasks = await task_model_1.TaskModel.find({ assignee: userId }).populate("group", "name").sort({ dueDate: 1 }).lean();
    const formatted = tasks.map((task) => ({
        ...formatTask(task),
        group: task.group
    }));
    res.status(200).json(new ApiResponse_1.ApiResponse(true, "Tasks fetched", formatted));
});
exports.getGuideTasks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const groups = await projectGroup_model_1.ProjectGroupModel.find({ ediGuide: userId }).select("_id").lean();
    const groupIds = groups.map((group) => group._id);
    const tasks = await task_model_1.TaskModel.find({ group: { $in: groupIds } })
        .populate("assignee", "name email")
        .populate("group", "name")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .lean();
    const formatted = tasks.map((task) => formatTask(task, true));
    res.status(200).json(new ApiResponse_1.ApiResponse(true, "Guide tasks fetched", formatted));
});
exports.createGuideTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const guideId = req.user?.userId;
    if (!guideId) {
        res.status(401).json(new ApiResponse_1.ApiResponse(false, "Unauthorized", null));
        return;
    }
    const { groupId, assigneeId, title, description, dueDate, priority } = req.body;
    if (!groupId || !mongoose_1.Types.ObjectId.isValid(groupId)) {
        res.status(400).json(new ApiResponse_1.ApiResponse(false, "Valid groupId is required", null));
        return;
    }
    if (!assigneeId || !mongoose_1.Types.ObjectId.isValid(assigneeId)) {
        res.status(400).json(new ApiResponse_1.ApiResponse(false, "Valid assigneeId is required", null));
        return;
    }
    if (!title?.trim()) {
        res.status(400).json(new ApiResponse_1.ApiResponse(false, "Task title is required", null));
        return;
    }
    if (!dueDate) {
        res.status(400).json(new ApiResponse_1.ApiResponse(false, "Task dueDate is required", null));
        return;
    }
    const parsedDueDate = new Date(dueDate);
    if (Number.isNaN(parsedDueDate.getTime())) {
        res.status(400).json(new ApiResponse_1.ApiResponse(false, "Valid dueDate is required", null));
        return;
    }
    const group = await projectGroup_model_1.ProjectGroupModel.findOne({ _id: groupId, ediGuide: guideId }).select("name members").lean();
    if (!group) {
        res.status(404).json(new ApiResponse_1.ApiResponse(false, "Group not found for this guide", null));
        return;
    }
    const isAssigneeInGroup = group.members.some((memberId) => String(memberId) === assigneeId);
    if (!isAssigneeInGroup) {
        res.status(400).json(new ApiResponse_1.ApiResponse(false, "Assignee must be a member of the selected group", null));
        return;
    }
    const task = await task_model_1.TaskModel.create({
        title: title.trim(),
        description: description?.trim() ?? "",
        assignee: new mongoose_1.Types.ObjectId(assigneeId),
        group: new mongoose_1.Types.ObjectId(groupId),
        createdBy: new mongoose_1.Types.ObjectId(guideId),
        dueDate: parsedDueDate,
        status: "todo",
        priority: priority ?? "medium",
        completionNote: "",
        completionCommitUrls: [],
        completedAt: null
    });
    const populated = await task.populate([
        { path: "assignee", select: "name email" },
        { path: "group", select: "name" },
        { path: "createdBy", select: "name email" }
    ]);
    res.status(201).json(new ApiResponse_1.ApiResponse(true, "Task created", formatTask(populated.toObject(), true)));
});
exports.updateMyTaskStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const studentId = req.user?.userId;
    if (!studentId) {
        res.status(401).json(new ApiResponse_1.ApiResponse(false, "Unauthorized", null));
        return;
    }
    const { id } = req.params;
    const { status, completionNote, completionCommitUrls } = req.body;
    if (!status || !["todo", "in-progress", "done"].includes(status)) {
        res.status(400).json(new ApiResponse_1.ApiResponse(false, "Valid status is required", null));
        return;
    }
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        res.status(400).json(new ApiResponse_1.ApiResponse(false, "Invalid task id", null));
        return;
    }
    const task = await task_model_1.TaskModel.findOne({ _id: id, assignee: studentId });
    if (!task) {
        res.status(404).json(new ApiResponse_1.ApiResponse(false, "Task not found", null));
        return;
    }
    const commitUrls = Array.isArray(completionCommitUrls)
        ? completionCommitUrls.map((url) => url.trim()).filter(Boolean)
        : [];
    if (commitUrls.some((url) => !isValidCommitUrl(url))) {
        res.status(400).json(new ApiResponse_1.ApiResponse(false, "completionCommitUrls must contain valid GitHub commit URLs", null));
        return;
    }
    const previousStatus = task.status;
    task.status = status;
    if (status === "done") {
        task.completionNote = completionNote?.trim() ?? "";
        task.completionCommitUrls = commitUrls;
        task.completedAt = new Date();
    }
    else {
        task.completedAt = null;
        if (status === "todo") {
            task.completionNote = "";
            task.completionCommitUrls = [];
        }
    }
    await task.save();
    if (status === "done" && previousStatus !== "done") {
        await progressUpdate_model_1.ProgressUpdateModel.create({
            student: new mongoose_1.Types.ObjectId(studentId),
            task: task._id,
            summary: task.completionNote || `Completed task: ${task.title}`,
            completionPercent: 100,
            documentationUrl: task.completionCommitUrls[0]
        });
    }
    const populated = await task.populate("group", "name");
    res.status(200).json(new ApiResponse_1.ApiResponse(true, "Task status updated", {
        ...formatTask(populated.toObject()),
        group: populated.group
    }));
});

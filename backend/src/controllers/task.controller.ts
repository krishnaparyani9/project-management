import type { Response } from "express";
import { ProjectGroupModel } from "../models/projectGroup.model";
import { TaskModel } from "../models/task.model";
import type { AuthenticatedRequest } from "../types/auth.types";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getMyTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const userId = req.user?.userId;

	const tasks = await TaskModel.find({ assignee: userId }).sort({ dueDate: 1 }).lean();

	const formatted = tasks.map((task) => ({
		id: String(task._id),
		title: task.title,
		description: task.description,
		dueDate: task.dueDate,
		status: task.status,
		priority: task.priority
	}));

	res.status(200).json(new ApiResponse(true, "Tasks fetched", formatted));
});

export const getGuideTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const userId = req.user?.userId;

	const groups = await ProjectGroupModel.find({ ediGuide: userId }).select("_id").lean();
	const groupIds = groups.map((group) => group._id);

	const tasks = await TaskModel.find({ group: { $in: groupIds } })
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
		assignee: task.assignee as unknown as { name: string; email: string },
		group: task.group as unknown as { name: string }
	}));

	res.status(200).json(new ApiResponse(true, "Guide tasks fetched", formatted));
});

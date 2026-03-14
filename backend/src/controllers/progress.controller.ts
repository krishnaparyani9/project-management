import type { Response } from "express";
import { ProjectGroupModel } from "../models/projectGroup.model";
import { ProgressUpdateModel } from "../models/progressUpdate.model";
import type { AuthenticatedRequest } from "../types/auth.types";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getMyProgressUpdates = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const userId = req.user?.userId;

	const updates = await ProgressUpdateModel.find({ student: userId }).sort({ createdAt: -1 }).limit(20).lean();

	const formatted = updates.map((update) => ({
		id: String(update._id),
		summary: update.summary,
		completionPercent: update.completionPercent,
		documentationUrl: update.documentationUrl,
		createdAt: update.createdAt
	}));

	res.status(200).json(new ApiResponse(true, "Progress updates fetched", formatted));
});

export const getGuideProgressUpdates = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const userId = req.user?.userId;

	const groups = await ProjectGroupModel.find({ guide: userId }).select("members").lean();
	const studentIds = groups.flatMap((group) => group.members);

	const updates = await ProgressUpdateModel.find({ student: { $in: studentIds } })
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
		student: update.student as unknown as { name: string; email: string }
	}));

	res.status(200).json(new ApiResponse(true, "Guide progress updates fetched", formatted));
});

import type { Response } from "express";
import { ProjectGroupModel } from "../models/projectGroup.model";
import type { AuthenticatedRequest } from "../types/auth.types";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getMyGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const userId = req.user?.userId;

	const group = await ProjectGroupModel.findOne({ members: userId })
		.populate("guide", "name email")
		.populate("members", "name email role")
		.lean();

	if (!group) {
		res.status(200).json(new ApiResponse(true, "No group assigned", null));
		return;
	}

	res.status(200).json(
		new ApiResponse(true, "Group fetched", {
			id: String(group._id),
			name: group.name,
			milestone: group.milestone,
			guide: group.guide,
			members: group.members
		})
	);
});

export const getGuideGroups = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const userId = req.user?.userId;

	const groups = await ProjectGroupModel.find({ guide: userId })
		.populate("guide", "name email")
		.populate("members", "name email role")
		.sort({ createdAt: -1 })
		.lean();

	const formatted = groups.map((group) => ({
		id: String(group._id),
		name: group.name,
		milestone: group.milestone,
		guide: group.guide as unknown as { name: string; email: string },
		members: group.members as unknown as Array<{ name: string; email: string; role: string }>
	}));

	res.status(200).json(new ApiResponse(true, "Guide groups fetched", formatted));
});

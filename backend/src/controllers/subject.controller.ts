import type { Request, Response } from "express";
import { Types } from "mongoose";
import { SubjectModel } from "../models/subject.model";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthenticatedRequest } from "../types/auth.types";

export const addSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const adminId = req.user!.userId;
	const { name, description } = req.body;

	if (!name || !name.trim()) {
		res.status(400).json(new ApiResponse(false, "Subject name is required", null));
		return;
	}

	const exists = await SubjectModel.findOne({ name: name.trim() });
	if (exists) {
		res.status(409).json(new ApiResponse(false, "Subject already exists", null));
		return;
	}

	const subject = await SubjectModel.create({
		name: name.trim(),
		description: description?.trim(),
		adminId: new Types.ObjectId(adminId)
	});

	res.status(201).json(new ApiResponse(true, "Subject added", subject));
});

export const removeSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
	const id = req.params.id as string;

	if (!Types.ObjectId.isValid(id)) {
		res.status(400).json(new ApiResponse(false, "Invalid subject ID", null));
		return;
	}

	const subject = await SubjectModel.findByIdAndDelete(id);
	if (!subject) {
		res.status(404).json(new ApiResponse(false, "Subject not found", null));
		return;
	}

	res.status(200).json(new ApiResponse(true, "Subject removed", null));
});

export const getAllSubjects = asyncHandler(async (_req: Request, res: Response) => {
	const subjects = await SubjectModel.find({}).sort({ createdAt: -1 }).lean();
	
	const result = subjects.map(sub => ({
		id: String(sub._id),
		name: sub.name,
		description: sub.description
	}));

	res.status(200).json(new ApiResponse(true, "Subjects fetched", result));
});

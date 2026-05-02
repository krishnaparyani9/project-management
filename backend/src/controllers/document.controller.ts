import type { AuthenticatedRequest } from "../types/auth.types";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { DocumentService } from "../services/document.service";
import type { Response } from "express";

export const uploadDocument = asyncHandler(
	async (req: AuthenticatedRequest, res: Response) => {
		const { groupId, description, documentType } = req.body;
		const file = req.file;

		if (!file) {
			return res
				.status(400)
				.json(new ApiResponse(false, "No file provided"));
		}

		if (!groupId) {
			return res
				.status(400)
				.json(new ApiResponse(false, "Group ID is required"));
		}

		if (!req.user) {
			return res
				.status(401)
				.json(new ApiResponse(false, "Unauthorized"));
		}

		const document = await DocumentService.uploadDocument(
			groupId,
			req.user.userId,
			req.user.role,
			file,
			description || "",
			documentType || "other"
		);

		res.status(201).json(
			new ApiResponse(true, "Document uploaded successfully", document)
		);
	}
);

export const getGroupDocuments = asyncHandler(
	async (req: AuthenticatedRequest, res: Response) => {
		const { groupId } = req.params;

		if (!req.user) {
			return res
				.status(401)
				.json(new ApiResponse(false, "Unauthorized"));
		}

		const documents = await DocumentService.getGroupDocuments(
			groupId as string,
			req.user.userId,
			req.user.role
		);

		res.status(200).json(
			new ApiResponse(true, "Documents retrieved successfully", documents)
		);
	}
);

export const getAllAccessibleDocuments = asyncHandler(
	async (req: AuthenticatedRequest, res: Response) => {
		if (!req.user) {
			return res
				.status(401)
				.json(new ApiResponse(false, "Unauthorized"));
		}

		const documents = await DocumentService.getAllAccessibleDocuments(
			req.user.userId,
			req.user.role
		);

		res.status(200).json(
			new ApiResponse(true, "Documents retrieved successfully", documents)
		);
	}
);

export const deleteDocument = asyncHandler(
	async (req: AuthenticatedRequest, res: Response) => {
		const { documentId } = req.params;

		if (!req.user) {
			return res
				.status(401)
				.json(new ApiResponse(false, "Unauthorized"));
		}

		const result = await DocumentService.deleteDocument(
			documentId as string,
			req.user.userId,
			req.user.role
		);

		res.status(200).json(
			new ApiResponse(true, "Document deleted successfully", result)
		);
	}
);

export const getDocumentDownloadUrl = asyncHandler(
	async (req: AuthenticatedRequest, res: Response) => {
		const { documentId } = req.params;

		if (!req.user) {
			return res
				.status(401)
				.json(new ApiResponse(false, "Unauthorized"));
		}

		const document = await DocumentService.getDocumentFile(
			documentId as string,
			req.user.userId,
			req.user.role
		);

		// Return the secure URL from Cloudinary
		res.status(200).json(
			new ApiResponse(true, "Download URL retrieved successfully", { url: document.filePath })
		);
	}
);

import { Types } from "mongoose";
import { Document } from "../models/document.model";
import { IProjectGroup, ProjectGroupModel } from "../models/projectGroup.model";
import type { UserRole } from "../types/auth.types";
import cloudinary from "../config/cloudinary";
import { Readable } from "stream";
import type * as Multer from "multer";

export class DocumentService {
	static async uploadDocument(
		groupId: string,
		userId: string,
		userRole: UserRole,
		file: Express.Multer.File,
		description: string,
		documentType: "project" | "report" | "presentation" | "other"
	) {
		// Verify user has access to this group
		await this.verifyGroupAccess(groupId, userId, userRole);

		// Upload to Cloudinary
		const result = await new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: `academic-projects/${groupId}`,
					resource_type: "auto",
					original_filename: file.originalname
				},
				(error, result) => {
					if (error) reject(error);
					else resolve(result);
				}
			);

			const stream = Readable.from(file.buffer);
			stream.pipe(uploadStream);
		});

		const uploadResult = result as any;

		// Create document record
		const document = new Document({
			groupId: new Types.ObjectId(groupId),
			uploadedBy: new Types.ObjectId(userId),
			fileName: uploadResult.public_id,
			originalFileName: file.originalname,
			fileSize: file.size,
			fileType: file.mimetype,
			filePath: uploadResult.secure_url,
			description,
			documentType
		});

		await document.save();

		return document;
	}

	static async getGroupDocuments(groupId: string, userId: string, userRole: UserRole) {
		// Verify user has access to view documents of this group
		await this.verifyGroupAccess(groupId, userId, userRole);

		const documents = await Document.find({ groupId: new Types.ObjectId(groupId) })
			.populate("uploadedBy", "name email")
			.sort({ createdAt: -1 })
			.lean();

		return documents;
	}

	static async getAllAccessibleDocuments(userId: string, userRole: UserRole) {
		let query: any = {};

		if (userRole === "admin") {
			// Admin can see all documents
			query = {};
		} else if (userRole === "guide") {
			// Guide can see documents from groups they guide
			const guidedGroups = await ProjectGroupModel.find({
				$or: [
					{ ediGuide: new Types.ObjectId(userId) },
					{ cpGuide: new Types.ObjectId(userId) }
				]
			}).select("_id");

			const groupIds = guidedGroups.map(g => g._id);
			query = { groupId: { $in: groupIds } };
		} else if (userRole === "student") {
			// Student can see documents from their own groups
			const myGroups = await ProjectGroupModel.find({
				$or: [
					{ owner: new Types.ObjectId(userId) },
					{ members: new Types.ObjectId(userId) }
				]
			}).select("_id");

			const groupIds = myGroups.map(g => g._id);
			query = { groupId: { $in: groupIds } };
		}

		const documents = await Document.find(query)
			.populate("groupId", "name")
			.populate("uploadedBy", "name email")
			.sort({ createdAt: -1 })
			.lean();

		return documents;
	}

	static async deleteDocument(documentId: string, userId: string, userRole: UserRole) {
		const document = await Document.findById(documentId);

		if (!document) {
			throw new Error("Document not found");
		}

		// Verify access
		if (userRole !== "admin" && document.uploadedBy.toString() !== userId) {
			throw new Error("Unauthorized to delete this document");
		}

		// Delete from Cloudinary
		try {
			await cloudinary.uploader.destroy(document.fileName);
		} catch (err) {
			console.error("Error deleting file from Cloudinary:", err);
		}

		// Delete document record
		await Document.findByIdAndDelete(documentId);

		return { success: true, message: "Document deleted successfully" };
	}

	static async getDocumentFile(documentId: string, userId: string, userRole: UserRole) {
		const document = await Document.findById(documentId);

		if (!document) {
			throw new Error("Document not found");
		}

		// Verify access
		await this.verifyGroupAccess(document.groupId.toString(), userId, userRole);

		return document;
	}

	private static async verifyGroupAccess(groupId: string, userId: string, userRole: UserRole) {
		const group = await ProjectGroupModel.findById(groupId);

		if (!group) {
			throw new Error("Group not found");
		}

		if (userRole === "admin") {
			// Admin has access to all groups
			return true;
		}

		if (userRole === "guide") {
			// Guide can access only if they are assigned to the group
			const isGuide =
				group.ediGuide?.toString() === userId || group.cpGuide?.toString() === userId;

			if (!isGuide) {
				throw new Error("Unauthorized: You are not assigned to this group");
			}
			return true;
		}

		if (userRole === "student") {
			// Student can access only if they are member or owner
			const isMember =
				group.owner.toString() === userId ||
				group.members.some(m => m.toString() === userId);

			if (!isMember) {
				throw new Error("Unauthorized: You are not a member of this group");
			}
			return true;
		}

		throw new Error("Unauthorized");
	}
}

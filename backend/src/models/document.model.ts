import { Schema, Types, model } from "mongoose";

export interface IDocument {
	_id: Types.ObjectId;
	groupId: Types.ObjectId;
	uploadedBy: Types.ObjectId;
	fileName: string;
	originalFileName: string;
	fileSize: number;
	fileType: string;
	filePath: string;
	description?: string;
	documentType: "project" | "report" | "presentation" | "other";
	createdAt: Date;
	updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
	{
		groupId: {
			type: Schema.Types.ObjectId,
			ref: "ProjectGroup",
			required: true
		},
		uploadedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		fileName: {
			type: String,
			required: true,
			trim: true
		},
		originalFileName: {
			type: String,
			required: true,
			trim: true
		},
		fileSize: {
			type: Number,
			required: true
		},
		fileType: {
			type: String,
			required: true,
			trim: true
		},
		filePath: {
			type: String,
			required: true,
			trim: true
		},
		description: {
			type: String,
			trim: true,
			default: ""
		},
		documentType: {
			type: String,
			enum: ["project", "report", "presentation", "other"],
			default: "project"
		}
	},
	{
		timestamps: true
	}
);

// Index for faster queries
documentSchema.index({ groupId: 1, createdAt: -1 });
documentSchema.index({ uploadedBy: 1 });

export const Document = model<IDocument>("Document", documentSchema);

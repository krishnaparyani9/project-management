import { Schema, Types, model } from "mongoose";

export interface ISubject {
	_id: Types.ObjectId;
	name: string;
	description?: string;
	adminId: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
	{
		name: { type: String, required: true, trim: true, unique: true },
		description: { type: String, trim: true },
		adminId: { type: Schema.Types.ObjectId, ref: "User", required: true }
	},
	{ timestamps: true }
);

export const SubjectModel = model<ISubject>("Subject", subjectSchema);

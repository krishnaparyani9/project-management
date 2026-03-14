import { Schema, Types, model } from "mongoose";

export interface IProgressUpdate {
	_id: Types.ObjectId;
	student: Types.ObjectId;
	task?: Types.ObjectId;
	summary: string;
	completionPercent: number;
	documentationUrl?: string;
	createdAt: Date;
	updatedAt: Date;
}

const progressUpdateSchema = new Schema<IProgressUpdate>(
	{
		student: { type: Schema.Types.ObjectId, ref: "User", required: true },
		task: { type: Schema.Types.ObjectId, ref: "Task" },
		summary: { type: String, required: true, trim: true },
		completionPercent: { type: Number, min: 0, max: 100, default: 0, required: true },
		documentationUrl: { type: String }
	},
	{ timestamps: true }
);

export const ProgressUpdateModel = model<IProgressUpdate>("ProgressUpdate", progressUpdateSchema);

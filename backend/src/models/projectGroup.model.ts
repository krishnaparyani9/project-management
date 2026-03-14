import { Schema, Types, model } from "mongoose";

export interface IProjectGroup {
	_id: Types.ObjectId;
	name: string;
	guide: Types.ObjectId;
	members: Types.ObjectId[];
	milestone: string;
	createdAt: Date;
	updatedAt: Date;
}

const projectGroupSchema = new Schema<IProjectGroup>(
	{
		name: { type: String, required: true, trim: true },
		guide: { type: Schema.Types.ObjectId, ref: "User", required: true },
		members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
		milestone: { type: String, default: "Initial planning" }
	},
	{ timestamps: true }
);

export const ProjectGroupModel = model<IProjectGroup>("ProjectGroup", projectGroupSchema);

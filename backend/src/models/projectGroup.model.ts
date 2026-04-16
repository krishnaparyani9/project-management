import { Schema, Types, model } from "mongoose";

export interface IProjectGroup {
	_id: Types.ObjectId;
	name: string;
	subject: string;
	repositoryUrl?: string | null;
	isEdiRegistered: boolean;
	owner: Types.ObjectId;
	ediGuide?: Types.ObjectId;
	cpGuide?: Types.ObjectId;
	members: Types.ObjectId[];
	pendingInvites: Types.ObjectId[];
	createdAt: Date;
	updatedAt: Date;
}

const projectGroupSchema = new Schema<IProjectGroup>(
	{
		name: { type: String, required: true, trim: true },
		subject: { type: String, required: true, trim: true },
		repositoryUrl: { type: String, trim: true, default: null },
		isEdiRegistered: { type: Boolean, default: false },
		owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
		ediGuide: { type: Schema.Types.ObjectId, ref: "User", default: null },
		cpGuide: { type: Schema.Types.ObjectId, ref: "User", default: null },
		members: [{ type: Schema.Types.ObjectId, ref: "User" }],
		pendingInvites: [{ type: Schema.Types.ObjectId, ref: "User" }]
	},
	{ timestamps: true }
);

export const ProjectGroupModel = model<IProjectGroup>("ProjectGroup", projectGroupSchema);

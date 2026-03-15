import { Schema, model } from "mongoose";
import type { UserRole } from "../types/auth.types";

export interface IUser {
	_id: string;
	name: string;
	email: string;
	password: string;
	role: UserRole;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true
		},
		password: {
			type: String,
			required: true,
			minlength: 6
		},
		role: {
			type: String,
			enum: ["student", "guide", "admin"],
			default: "student",
			required: true
		}
	},
	{ timestamps: true }
);

export const UserModel = model<IUser>("User", userSchema);

import { Schema, model } from "mongoose";
import type { UserRole } from "../types/auth.types";

export interface IUser {
	_id: string;
	name: string;
	email: string;
	password: string;
	role: UserRole;
	hasCreatedGroup: boolean;
	branch?: string;
	division?: string;
	rollNo?: string;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new Schema<IUser>(
       {
	       role: {
		       type: String,
		       enum: ["student", "guide", "admin"],
		       default: "student",
		       required: true
	       },
		      	hasCreatedGroup: {
		       		type: Boolean,
		       		default: false
		       	},
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
		       required: false,
		       minlength: 6
	       },
	       branch: {
		       type: String,
		       trim: true,
		       default: undefined
	       },
	       division: {
		       type: String,
		       trim: true,
		       default: undefined
	       },
	       rollNo: {
		       type: String,
		       trim: true,
		       default: undefined
	       }
       },
       { timestamps: true }
);

export const UserModel = model<IUser>("User", userSchema);

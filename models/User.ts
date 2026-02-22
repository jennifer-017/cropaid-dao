import { Schema, model, models, type Model } from "mongoose";
import { ALL_ROLES, type Role } from "@/lib/auth/roles";

export type UserDoc = {
	email: string;
	name: string;
	passwordHash: string;
	role: Role;
	stakeAmount: number;
	createdAt: Date;
	updatedAt: Date;
};

const UserSchema = new Schema<UserDoc>(
	{
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		name: { type: String, required: true, trim: true },
		passwordHash: { type: String, required: true },
		role: { type: String, required: true, enum: ALL_ROLES, default: "Farmer" },
		stakeAmount: { type: Number, required: true, default: 0 },
	},
	{ timestamps: true }
);

export const User: Model<UserDoc> = models.User ?? model<UserDoc>("User", UserSchema);


import mongoose, { Schema, InferSchemaType } from "mongoose";

const userSchema = new Schema(
	{
		email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
		passwordHash: { type: String, required: true },
		name: { type: String, required: true, trim: true },
		role: { type: String, enum: ["admin", "staff"], default: "admin", index: true }
	},
	{ timestamps: true }
);

export type User = InferSchemaType<typeof userSchema> & { _id: string };
export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);



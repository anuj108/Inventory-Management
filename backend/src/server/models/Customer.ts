import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const customerSchema = new Schema(
	{
		name: { type: String, required: true, trim: true, index: true },
		phone: { type: String, trim: true, index: true },
		address: { type: String, trim: true },
		openingBalance: { type: Number, default: 0 },
		currentBalance: { type: Number, default: 0, index: true }, // positive => owes to shop
		isActive: { type: Boolean, default: true, index: true }
	},
	{ timestamps: true }
);

customerSchema.index({ name: 1, phone: 1 });

export type Customer = InferSchemaType<typeof customerSchema> & { _id: string };

export const CustomerModel: Model<Customer> =
	mongoose.models.Customer || mongoose.model("Customer", customerSchema);

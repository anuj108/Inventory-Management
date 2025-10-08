import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const supplierSchema = new Schema(
	{
		name: { type: String, required: true, trim: true, index: true },
		phone: { type: String, trim: true, index: true },
		address: { type: String, trim: true },
		isActive: { type: Boolean, default: true, index: true }
	},
	{ timestamps: true }
);

supplierSchema.index({ name: 1, phone: 1 });

export type Supplier = InferSchemaType<typeof supplierSchema> & { _id: string };

export const SupplierModel: Model<Supplier> =
	mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);

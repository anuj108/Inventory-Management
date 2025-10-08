import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const productSchema = new Schema(
	{
		name: { type: String, required: true, trim: true, index: true },
		category: { type: String, required: true, trim: true, index: true },
		brand: { type: String, trim: true },
		unit: { type: String, required: true }, // e.g., kg, liter, packet
		purchasePrice: { type: Number, required: true, min: 0 },
		sellingPrice: { type: Number, required: true, min: 0 },
		stockQuantity: { type: Number, required: true, min: 0, index: true },
		lowStockThreshold: { type: Number, default: 0, min: 0 },
		barcode: { type: String, unique: true, sparse: true },
		isActive: { type: Boolean, default: true, index: true }
	},
	{ timestamps: true }
);

productSchema.index({ name: 1, brand: 1, category: 1 });

export type Product = InferSchemaType<typeof productSchema> & { _id: string };

export const ProductModel: Model<Product> =
	mongoose.models.Product || mongoose.model("Product", productSchema);

import mongoose, { Schema, InferSchemaType, Model, Types } from "mongoose";

const saleItemSchema = new Schema(
	{
		productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
		nameSnapshot: { type: String, required: true },
		quantity: { type: Number, required: true, min: 0 },
		unitPrice: { type: Number, required: true, min: 0 },
		lineTotal: { type: Number, required: true, min: 0 }
	},
	{ _id: false }
);

const saleSchema = new Schema(
	{
		customerId: { type: Schema.Types.ObjectId, ref: "Customer", index: true },
		invoiceNo: { type: String, unique: true, index: true },
		items: { type: [saleItemSchema], required: true },
		subtotal: { type: Number, required: true, min: 0 },
		discount: { type: Number, default: 0, min: 0 },
		tax: { type: Number, default: 0, min: 0 },
		total: { type: Number, required: true, min: 0 },
		paid: { type: Number, required: true, min: 0 },
		paymentMethod: { type: String, enum: ["cash", "upi", "card", "credit"], default: "cash" }
	},
	{ timestamps: true }
);

saleSchema.index({ createdAt: -1 });

export type SaleItem = InferSchemaType<typeof saleItemSchema>;
export type Sale = InferSchemaType<typeof saleSchema> & { _id: Types.ObjectId };

export const SaleModel: Model<Sale> =
	mongoose.models.Sale || mongoose.model("Sale", saleSchema);

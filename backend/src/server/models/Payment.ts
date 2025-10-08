import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const paymentSchema = new Schema(
	{
		customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
		amount: { type: Number, required: true, min: 0 },
		method: { type: String, enum: ["cash", "upi", "card"], default: "cash" },
		note: { type: String, trim: true }
	},
	{ timestamps: true }
);

paymentSchema.index({ createdAt: -1 });

export type Payment = InferSchemaType<typeof paymentSchema> & { _id: string };

export const PaymentModel: Model<Payment> =
	mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

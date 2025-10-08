import { Router } from "express";
import { z } from "zod";
import { ProductModel } from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";

export const router = Router();

const upsertSchema = z.object({
	name: z.string().min(1),
	category: z.string().min(1),
	brand: z.string().optional(),
	unit: z.string().min(1),
	purchasePrice: z.number().nonnegative(),
	sellingPrice: z.number().nonnegative(),
	stockQuantity: z.number().int().nonnegative(),
	lowStockThreshold: z.number().int().nonnegative().optional(),
	barcode: z.string().optional(),
	isActive: z.boolean().optional()
});

router.get("/", requireAuth, async (req, res) => {
	const page = Math.max(1, Number(req.query.page ?? 1));
	const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
	const q = (req.query.q as string) || "";
	const filter: any = {};
	if (q) filter.name = { $regex: q, $options: "i" };

	const [items, total] = await Promise.all([
		ProductModel.find(filter)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit),
		ProductModel.countDocuments(filter)
	]);
	res.json({ items, page, limit, total });
});

router.post("/", requireAuth, async (req, res) => {
	const parsed = upsertSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
	const product = await ProductModel.create(parsed.data);
	res.status(201).json(product);
});

router.put("/:id", requireAuth, async (req, res) => {
	const parsed = upsertSchema.partial().safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
	const updated = await ProductModel.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
	if (!updated) return res.status(404).json({ message: "Not Found" });
	res.json(updated);
});

router.delete("/:id", requireAuth, async (req, res) => {
	const deleted = await ProductModel.findByIdAndDelete(req.params.id);
	if (!deleted) return res.status(404).json({ message: "Not Found" });
	res.status(204).end();
});

import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { SaleModel } from "../models/Sale.js";
import { PaymentModel } from "../models/Payment.js";
import { CustomerModel } from "../models/Customer.js";
import { ProductModel } from "../models/Product.js";
import { z } from "zod";

export const router = Router();

// GET /api/sales/summary?from=iso&to=iso
router.get("/summary", requireAuth, async (req, res) => {
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;
  const match: any = {};
  if (from) match.createdAt = { ...match.createdAt, $gte: from };
  if (to) match.createdAt = { ...match.createdAt, $lte: to };

  const [byProduct, totals] = await Promise.all([
    SaleModel.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.nameSnapshot",
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.lineTotal" }
        }
      },
      { $project: { _id: 0, product: "$_id", quantitySold: 1, revenue: 1 } },
      { $sort: { revenue: -1 } }
    ]),
    SaleModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalPaid: { $sum: "$paid" }
        }
      },
      { $project: { _id: 0, totalRevenue: 1, totalPaid: 1 } }
    ])
  ]);

  res.json({ items: byProduct, totals: totals[0] || { totalRevenue: 0, totalPaid: 0 } });
});

// GET /api/sales/recent?limit=20
router.get("/recent", requireAuth, async (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  const sales = await SaleModel.find({}).sort({ createdAt: -1 }).limit(limit);
  res.json({ items: sales });
});

// GET /api/sales/payments?customerId=...
router.get("/payments", requireAuth, async (req, res) => {
  const customerId = String(req.query.customerId || "");
  const filter: any = {};
  if (customerId) filter.customerId = customerId;
  const payments = await PaymentModel.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ items: payments });
});

// POST /api/sales — create a simple sale of one product, update stock, upsert customer
const createSaleSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().optional().default(""),
  productId: z.string().min(1),
  quantity: z.number().positive(),
  sellingPrice: z.number().nonnegative(),
  paid: z.number().nonnegative().default(0)
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createSaleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { customerName, customerPhone, productId, quantity, sellingPrice, paid } = parsed.data;

  const product = await ProductModel.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.stockQuantity < quantity) return res.status(400).json({ message: "Insufficient stock" });

  // upsert customer by name+phone
  const customer = await CustomerModel.findOneAndUpdate(
    { name: customerName, phone: customerPhone || undefined },
    { $setOnInsert: { name: customerName, phone: customerPhone || undefined } },
    { new: true, upsert: true }
  );

  const lineTotal = quantity * sellingPrice;
  const invoiceNo = `INV-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const sale = await SaleModel.create({
    customerId: customer?._id,
    invoiceNo,
    items: [
      {
        productId: product._id,
        nameSnapshot: product.name,
        quantity,
        unitPrice: sellingPrice,
        lineTotal
      }
    ],
    subtotal: lineTotal,
    discount: 0,
    tax: 0,
    total: lineTotal,
    paid,
    paymentMethod: paid > 0 ? "cash" : "credit"
  });

  await ProductModel.findByIdAndUpdate(product._id, { $inc: { stockQuantity: -quantity } });

  res.status(201).json(sale);
});



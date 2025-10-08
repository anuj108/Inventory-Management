import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { CustomerModel } from "../models/Customer";
import { SaleModel } from "../models/Sale";
import { PaymentModel } from "../models/Payment";

export const router = Router();

// GET /api/customers/search?q=...&withBalances=1
router.get("/search", requireAuth, async (req, res) => {
  const q = String(req.query.q || "").trim();
  const withBalances = String(req.query.withBalances || "0") !== "0";
  const filter: any = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } }
    ];
  }
  const customers = await CustomerModel.find(filter).sort({ name: 1 }).limit(50);

  if (!withBalances || customers.length === 0) {
    return res.json({ items: customers });
  }

  const ids = customers.map((c) => c._id);
  const [salesAgg, paymentsAgg] = await Promise.all([
    SaleModel.aggregate([
      { $match: { customerId: { $in: ids } } },
      { $group: { _id: "$customerId", total: { $sum: "$total" }, paid: { $sum: "$paid" } } }
    ]),
    PaymentModel.aggregate([
      { $match: { customerId: { $in: ids } } },
      { $group: { _id: "$customerId", amount: { $sum: "$amount" } } }
    ])
  ]);

  const salesMap = new Map<string, { total: number; paid: number }>();
  for (const s of salesAgg) salesMap.set(String(s._id), { total: s.total, paid: s.paid });
  const payMap = new Map<string, number>();
  for (const p of paymentsAgg) payMap.set(String(p._id), p.amount);

  const items = customers.map((c) => {
    const s = salesMap.get(String(c._id)) || { total: 0, paid: 0 };
    const extraPaid = payMap.get(String(c._id)) || 0;
    const due = Math.max(0, s.total - (s.paid + extraPaid));
    return { ...c.toObject(), totals: { sold: s.total, paid: s.paid + extraPaid, due } };
  });

  res.json({ items });
});



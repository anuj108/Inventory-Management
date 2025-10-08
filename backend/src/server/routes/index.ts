import { Router } from "express";
import { router as health } from "./health.ts";
import { router as products } from "./products.ts";
import { router as auth } from "./auth.ts";
import { router as sales } from "./sales.ts";
import { router as customers } from "./customers.ts";

export const api = Router();

api.use("/health", health);
api.use("/auth", auth);
api.use("/products", products);
api.use("/sales", sales);
api.use("/customers", customers);

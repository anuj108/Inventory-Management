import { Router } from "express";
import { router as health } from "./health.js";
import { router as products } from "./products.js";
import { router as auth } from "./auth.js";
import { router as sales } from "./sales.js";
import { router as customers } from "./customers.js";

export const api = Router();

api.use("/health", health);
api.use("/auth", auth);
api.use("/products", products);
api.use("/sales", sales);
api.use("/customers", customers);

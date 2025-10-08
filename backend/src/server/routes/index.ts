import { Router } from "express";
import { router as health } from "./health";
import { router as products } from "./products";
import { router as auth } from "./auth";
import { router as sales } from "./sales";
import { router as customers } from "./customers";

export const api = Router();

api.use("/health", health);
api.use("/auth", auth);
api.use("/products", products);
api.use("/sales", sales);
api.use("/customers", customers);

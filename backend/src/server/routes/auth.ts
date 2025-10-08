import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.js";
import { getEnv } from "../config/env.js";

export const router = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post("/login", async (req, res) => {
	const parsed = loginSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
	const { email, password } = parsed.data;
	const user = await UserModel.findOne({ email });
	if (!user) return res.status(401).json({ message: "Invalid credentials" });
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) return res.status(401).json({ message: "Invalid credentials" });
	const { JWT_SECRET } = getEnv();
	const token = jwt.sign({ sub: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
	return res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});



import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getEnv } from "../config/env.ts";

export interface AuthRequest extends Request {
	user?: { sub: string; role: string; name: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
	const header = req.headers.authorization;
	if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
	const token = header.slice("Bearer ".length);
	try {
		const payload = jwt.verify(token, getEnv().JWT_SECRET) as any;
		req.user = { sub: payload.sub, role: payload.role, name: payload.name };
		return next();
	} catch {
		return res.status(401).json({ message: "Invalid token" });
	}
}



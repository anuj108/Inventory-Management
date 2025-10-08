import mongoose from "mongoose";

export async function connectMongo(uri: string, maxRetries = 10, delayMs = 2000): Promise<typeof mongoose> {
	mongoose.set("strictQuery", true);
	let lastError: unknown = undefined;
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await mongoose.connect(uri);
		} catch (err) {
			lastError = err;
			const isLast = attempt === maxRetries;
			console.error(`MongoDB connection failed (attempt ${attempt}/${maxRetries})`);
			if (isLast) break;
			await new Promise((r) => setTimeout(r, delayMs));
		}
	}
	throw lastError;
}

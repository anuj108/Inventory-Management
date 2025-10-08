export type AppEnv = {
	PORT: number;
	MONGODB_URI: string;
	JWT_SECRET: string;
	SEED_ADMIN: boolean;
	ADMIN_EMAIL?: string;
	ADMIN_PASSWORD?: string;
};

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
	if (value === undefined) return defaultValue;
	return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function getEnv(): AppEnv {
	const PORT = Number(process.env.PORT ?? 4000);
	const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb+srv://anuj108:anuj108@cluster0.8oqht7a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
	const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_me";
	const SEED_ADMIN = parseBoolean(process.env.SEED_ADMIN, false);
	const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
	const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

	if (!MONGODB_URI) throw new Error("MONGODB_URI is required");
	if (!JWT_SECRET) throw new Error("JWT_SECRET is required");
	if (SEED_ADMIN && (!ADMIN_EMAIL || !ADMIN_PASSWORD)) {
		throw new Error("SEED_ADMIN=true requires ADMIN_EMAIL and ADMIN_PASSWORD");
	}

	return { PORT, MONGODB_URI, JWT_SECRET, SEED_ADMIN, ADMIN_EMAIL, ADMIN_PASSWORD };
}

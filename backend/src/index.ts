import { config } from "dotenv";
config();

import http from "http";
import mongoose from "mongoose";
import { createApp } from "./server/app";
import { getEnv } from "./server/config/env";
import { connectMongo } from "./server/db/mongo";
import bcrypt from "bcryptjs";
import { UserModel } from "./server/models/User";

async function startServer() {
	const env = getEnv();
	const app = createApp();
	const server = http.createServer(app);
	server.listen(env.PORT, () => {
		console.log(`API listening on http://localhost:${env.PORT}`);
	});

    // connect to Mongo and seed admin if requested
    connectMongo(env.MONGODB_URI)
        .then(async () => {
            console.log("MongoDB connected");
            if (env.SEED_ADMIN && env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
                const existing = await UserModel.findOne({ email: env.ADMIN_EMAIL });
                if (!existing) {
                    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
                    await UserModel.create({ email: env.ADMIN_EMAIL, passwordHash, name: "Admin", role: "admin" });
                    console.log("Seeded admin user", env.ADMIN_EMAIL);
                }
            }
        })
		.catch((err) => {
			console.error("MongoDB connection failed after retries", err);
		});

	process.on("SIGINT", async () => {
		await mongoose.connection.close().catch(() => {});
		server.close(() => process.exit(0));
	});
}

startServer().catch((err) => {
	console.error("Failed to start server", err);
	process.exit(1);
});

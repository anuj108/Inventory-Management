import express from "express";
import cors from "cors";
import helmet from "helmet";
import { api } from "./routes/index.js";

export function createApp() {
	const app = express();
	app.use(helmet());
	app.use(cors());
	app.use(express.json());

	app.use("/api", api);

	app.use((req, res) => {
		res.status(404).json({ message: "Not Found" });
	});

	return app;
}

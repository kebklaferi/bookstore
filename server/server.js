import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import { initDb } from "./config/db.js";
import path from "path";

dotenv.config();
const app = express();

(async () => {
  try {
    await initDb();

    // CORS - allow requests from frontend
    const allowedOrigin = process.env.CORS_ORIGIN;
    app.use(cors({ origin: allowedOrigin }));

    // Parsanje JSON
    app.use(express.json());

    // Health check endpoint
    app.get("/health", (req, res) => res.json({ status: "ok" }));

    // API routes
    app.use("/api", authRoutes);
    app.use("/api", bookRoutes);

    // Start serverja
    const port = process.env.PORT;
    app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();

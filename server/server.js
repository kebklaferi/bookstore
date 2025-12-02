import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import { initDb } from "./config/db.js";

dotenv.config();
const app = express();

(async () => {
  try {
    await initDb();

    app.use(cors({ origin: "http://localhost:5173" }));
    app.use(express.json());

    // Health check
    app.get("/", (req, res) => res.json({ status: "ok", message: "Backend is running!" }));

    app.use("/api", authRoutes);
    app.use("/api", bookRoutes);

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();

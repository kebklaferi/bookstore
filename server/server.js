import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import { initDb } from "./config/db.js";
import path from "path";

dotenv.config();
const app = express();

const isProd = process.env.NODE_ENV === "production";

(async () => {
  try {
    await initDb();

<<<<<<< HEAD
    // CORS - allow requests from frontend
    const allowedOrigin = process.env.CORS_ORIGIN;
=======
    // CORS
    const allowedOrigin = process.env.CORS_ORIGIN || (isProd ? "*" : "http://localhost:5173");
>>>>>>> 5cc9b8a (Updated CI/CD pipeline)
    app.use(cors({ origin: allowedOrigin }));

    // Parsanje JSON
    app.use(express.json());

<<<<<<< HEAD
    // Health check endpoint
    app.get("/health", (req, res) => res.json({ status: "ok" }));

=======
    // Produkcija → strežemo frontend build
    if (isProd) {
      app.use(express.static(path.join(process.cwd(), "public")));

      // SPA routing – vse neznane poti pošlje index.html
      app.get("*", (req, res) => {
        res.sendFile(path.join(process.cwd(), "public", "index.html"));
      });
    } else {
      // Lokalni razvoj
      console.log("Running in development mode – frontend served by Vite at http://localhost:5173");
    }

    // Health check endpoint
    app.get("/health", (req, res) => res.json({ status: "ok" }));

>>>>>>> 5cc9b8a (Updated CI/CD pipeline)
    // API routes
    app.use("/api", authRoutes);
    app.use("/api", bookRoutes);

    // Start serverja
<<<<<<< HEAD
    const port = process.env.PORT;
=======
    const port = process.env.PORT || 3000;
>>>>>>> 5cc9b8a (Updated CI/CD pipeline)
    app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();

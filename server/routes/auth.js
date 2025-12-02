import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const router = express.Router();

/**
 * POST /api/register
 */
router.post("/register", async (req, res) => {
  const { name, surname, username, password } = req.body;
  if (!name || !surname || !username || !password)
    return res.status(400).json({ error: "All fields are required" });

  try {
    // Check if username exists
    const existing = await db.query("SELECT * FROM users WHERE username = $1", [username]); 
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query( 
      "INSERT INTO users (name, surname, username, password) VALUES ($1,$2,$3,$4) RETURNING id",
      [name, surname, username, hashed]
    );

    res.json({ success: true, message: "User registered successfully!", id: result.rows[0].id });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

/**
 * POST /api/login
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Failed to log in" });
  }
});

export default router;
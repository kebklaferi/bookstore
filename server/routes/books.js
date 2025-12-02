import express from "express";
import { verifyToken } from "../middleware/auth.js";
import db from "../config/db.js";

const router = express.Router();

// GET all books
router.get("/books", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// GET books saved by the logged-in user
router.get("/my-books", verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.* FROM books b
       JOIN user_books ub ON b.id = ub.book_id
       WHERE ub.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user books" });
  }
});

// POST add book to user's list
router.post("/my-books", verifyToken, async (req, res) => {
  try {
    const { bookId } = req.body;
    await db.query(
      "INSERT INTO user_books (user_id, book_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.user.id, bookId]
    );
    res.json({ success: true, message: "Book added to your list" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add book" });
  }
});

// DELETE remove a book from user's list
router.delete("/my-books/:id", verifyToken, async (req, res) => {
  try {
    const bookId = req.params.id;
    await db.query("DELETE FROM user_books WHERE user_id = $1 AND book_id = $2", [req.user.id, bookId]); // <-- CHANGED
    res.json({ success: true, message: "Book removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

/**
 * POST /api/books
 * Creates a new book in the database.
 * Requires user authentication.
 */
router.post("/books", verifyToken, async (req, res) => {
  const { title, author, publish_date, quote, description, image, genre } = req.body;

  // Simple validation
  if (!title || !author) {
    return res.status(400).json({ error: "Title and author are required fields." });
  }

  try {
    const result = await db.query(
      `INSERT INTO books 
        (title, author, publish_date, quote, description, image, genre) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [title, author, publish_date, quote, description, image, genre]
    );

    // Return the newly created book object
    res.status(201).json({ success: true, message: "Book created successfully.", book: result.rows[0] });
  } catch (err) {
    console.error("❌ Error creating book:", err);
    res.status(500).json({ error: "Failed to create book" });
  }
});
/**
 * DELETE /api/books/:id
 * Deletes a book by its ID.
 * Requires user authentication.
 */
router.delete("/books/:id", verifyToken, async (req, res) => {
  const bookId = req.params.id;

  try {
    // Optional: Add logic to also delete entries from the user_books table first
    await db.query("DELETE FROM user_books WHERE book_id = $1", [bookId]);

    const result = await db.query("DELETE FROM books WHERE id = $1 RETURNING id", [bookId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Book not found." });
    }

    res.json({ success: true, message: "Book deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting book:", err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});
export default router;
import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";
import express from "express";
import authRoutes from "../routes/auth.js";
import bookRoutes from "../routes/books.js";

// Mock JWT secret for testing
process.env.JWT_SECRET = "testsecret";

// Mock bcrypt before imports
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(async (password: string) => `hashed_${password}`),
    compare: vi.fn(async (password: string, hash: string) => hash === `hashed_${password}`),
  },
}));

// Mock db
vi.mock("../config/db.js", async () => {
  const registeredUsers: Set<string> = new Set();

  return {
    default: {
      query: vi.fn(async (sql: string, params?: any[]) => {
        if (sql.includes("INSERT INTO users")) {
          const username = params?.[2];
          if (username) registeredUsers.add(username);
          return { rows: [{ id: 1 }] };
        }
        if (sql.includes("SELECT * FROM users WHERE username")) {
          const username = params?.[0];
          if (username === "testuser" && registeredUsers.has(username)) {
            return { rows: [{ id: 1, username, password: "hashed_password123" }] };
          }
          return { rows: [] };
        }
        if (sql.includes("INSERT INTO books")) {
          return { rows: [{ id: 1, title: "Test Book" }] };
        }
        if (sql.includes("SELECT b.* FROM books b")) {
          return { rows: [{ id: 1, title: "Test Book" }] };
        }
        if (sql.includes("INSERT INTO user_books")) {
          return { rows: [{ id: 1 }] };
        }
        if (sql.includes("SELECT books FROM user_books")) {
          return { rows: [{ id: 1, book_id: 1 }] };
        }
        if (sql.includes("DELETE FROM user_books")) {
          return { rows: [{ id: 1 }] };
        }
        return { rows: [] };
      }),
    },
  };
});

// express app setup
const app = express();
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", bookRoutes);

let token: string;
let userId: number;
let bookId: number;

// ----------------- TESTS -----------------
describe("Auth API", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        name: "Test",
        surname: "User",
        username: "testuser",
        password: "password123",
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBeDefined();
    userId = res.body.id;
  });

  it("should login and return a token", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({
        username: "testuser",
        password: "password123",
      });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });
});

describe("Books API", () => {
  it("should create a new book", async () => {
    const res = await request(app)
      .post("/api/books")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Book",
        author: "Author Name",
        publish_date: "2025-01-01",
        quote: "A quote",
        description: "Book description",
        image: "image_url",
        genre: "Fiction",
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.book.id).toBeDefined();
    bookId = res.body.book.id;
  });

  it("should add book to user's list", async () => {
    const res = await request(app)
      .post("/api/my-books")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookId });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return user's books", async () => {
    const res = await request(app)
      .get("/api/my-books")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].title).toBe("Test Book");
  });

  it("should remove book from user's list", async () => {
    const res = await request(app)
      .delete(`/api/my-books/${bookId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should delete the book", async () => {
    const res = await request(app)
      .delete(`/api/books/${bookId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return 400 when registering with missing fields", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        name: "Test",
        surname: "User",
        // Missing username and password
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("required");
  });

  it("should return 400 when login with incorrect password", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({
        username: "testuser",
        password: "wrongpassword",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid");
  });

  it("should return 401 when creating book without authorization", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({
        title: "Unauthorized Book",
        author: "Author",
        publish_date: "2025-01-01",
        quote: "Quote",
        description: "Description",
        image: "image_url",
        genre: "Fiction",
      });
    expect(res.status).toBe(401);
  });

  it("should return 401 when accessing my-books without token", async () => {
    const res = await request(app).get("/api/my-books");
    expect(res.status).toBe(401);
  });

  it("should fetch all books without authentication", async () => {
    const res = await request(app).get("/api/books");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(0);
  });
});

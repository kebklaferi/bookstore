import pkg from "pg";
const { Pool } = pkg;

let pool;

export async function initDb() {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // REQUIRED on Render
    });

    // Wait for DB
    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL is ready");

    // Create tables (this IS allowed)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        publish_date TEXT,
        quote TEXT,
        description TEXT,
        image TEXT,
        genre TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_books (
        user_id BIGINT REFERENCES users(id),
        book_id BIGINT REFERENCES books(id),
        PRIMARY KEY (user_id, book_id)
      );
    `);

    console.log("✅ PostgreSQL tables initialized");

  } catch (err) {
    console.error("❌ Database init failed:", err);
    if (pool) await pool.end();
    throw err;
  }
}

const db = {
  query: (text, params) => {
    if (!pool) throw new Error("DB not initialized");
    return pool.query(text, params);
  },
};

export default db;

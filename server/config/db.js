import pkg from "pg";
const { Pool } = pkg;

// Top-level pool for app usage
let pool;

// Maintenance pool for DB creation / readiness check
const maintenancePool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DEFAULT,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: process.env.DB_SSL === "true"
});

// Wait for DB to be ready
async function waitForCockroach(retries = 30, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await maintenancePool.query("SELECT 1");
      console.log("✅ CockroachDB service is ready");
      return;
    } catch (err) {
      console.log(`⚠️ Waiting for CockroachDB... retry ${i + 1}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("❌ CockroachDB did not start in time");
}

export async function initDb() {
  try {
    await waitForCockroach();

    const dbName = process.env.DB_NAME;
    const canCreateDB = process.env.DB_CAN_CREATE_DATABASE !== "false";

    // Create application database if allowed
    if (canCreateDB) {
      await maintenancePool.query(`CREATE DATABASE IF NOT EXISTS "${dbName}";`);
      console.log(`✅ Database "${dbName}" checked/created.`);
    } else {
      console.log(`ℹ️ Skipping database creation for "${dbName}"`);
    }

    await maintenancePool.end();

    // Connect main pool to application DB
    pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: dbName,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
      ssl: process.env.DB_SSL === "true"
        ? { rejectUnauthorized: false } // allow self-signed / cloud certs
        : false
    });

    // Initialize tables (idempotent)
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

    console.log("✅ CockroachDB tables initialized!");

  } catch (err) {
    console.error("❌ Error initializing database:", err);
    await maintenancePool.end();
    if (pool) await pool.end();
    throw err;
  }
}

// Export helper methods to access pool after initialization
const db = {
  query: (text, params) => {
    if (!pool) throw new Error("Database pool not initialized. Call initDb() first.");
    return pool.query(text, params);
  },
  getPool: () => {
    if (!pool) throw new Error("Database pool not initialized. Call initDb() first.");
    return pool;
  }
};

export default db;

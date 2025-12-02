import pkg from "pg";
const { Pool } = pkg;

// This will hold the main application pool *after* initDb() runs
let pool;

// 1. Create a maintenance pool to connect to the 'defaultdb'
// This pool is just for checking readiness and creating our app database
const maintenancePool = new Pool({
  user: process.env.DB_USER || "root",
  host: process.env.DB_HOST || "cockroach",
  database: "defaultdb", // <-- Connect to the default database
  password: process.env.DB_PASSWORD || "",
  port: Number(process.env.DB_PORT) || 26257,
  ssl: false // <-- IMPORTANT: Must be false for --insecure
});

async function waitForCockroach(retries = 20, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      // 2. Use the maintenance pool to check if the service is up
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
    // 3. Wait for the service to be ready
    await waitForCockroach();

    // 4. Use the maintenance pool to create the application database
    const dbName = process.env.DB_NAME || "bookstore";
    await maintenancePool.query(`CREATE DATABASE IF NOT EXISTS "${dbName}";`);
    console.log(`✅ Database "${dbName}" checked/created.`);
    
    // We are done with the maintenance pool
    await maintenancePool.end();

    // 5. NOW, create the main application pool
    pool = new Pool({
      user: process.env.DB_USER || "root",
      host: process.env.DB_HOST || "cockroach",
      database: dbName, // <-- Connect to the 'bookstore' DB
      password: process.env.DB_PASSWORD || "",
      port: Number(process.env.DB_PORT) || 26257,
      ssl: false // <-- IMPORTANT: Must be false for --insecure
    });

    // 6. Run your table creation scripts using the main pool
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
    await maintenancePool.end(); // Ensure it closes on error
    if (pool) await pool.end(); // Close app pool if it was created
    throw err;
  }
}

// 7. Export an object with methods to access the pool.
// This ensures that other files get the pool *after* it's initialized,
// not the 'null' value from when the module was first imported.
const db = {
  // Convenience method for simple queries
  query: (text, params) => {
    if (!pool) {
      throw new Error("Database pool is not initialized. Ensure initDb() has completed.");
    }
    return pool.query(text, params);
  },
  // Method to get the whole pool (e.g., for transactions)
  getPool: () => {
    if (!pool) {
      throw new Error("Database pool is not initialized. Ensure initDb() has completed.");
    }
    return pool;
  }
};

export default db;
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { createClient } = require("redis");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

// ✅ Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/input", express.static(path.join(__dirname, "input")));

// ✅ Redis connection
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on("error", (err) => console.error("❌ Redis Client Error", err));

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("✅ Connected to Redis");
  }
}

// ✅ PostgreSQL connection
const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  user: process.env.POSTGRES_USER || "myuser",
  password: process.env.POSTGRES_PASSWORD || "mypassword",
  database: process.env.POSTGRES_DB || "mydb",
  port: 5432,
});

// Initialize table
async function initPostgres() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ PostgreSQL ready");
  } catch (err) {
    console.error("❌ Postgres init error:", err);
  }
}

// ✅ Get history
app.get("/history", async (req, res) => {
  try {
    await connectRedis();
    let history = await redisClient.get("history");

    if (history) {
      console.log("📌 History from Redis");
      return res.json(JSON.parse(history));
    }

    // Fallback to Postgres if Redis empty
    const result = await pool.query("SELECT data FROM history ORDER BY created_at DESC LIMIT 1");
    if (result.rows.length > 0) {
      console.log("📌 History from Postgres");
      return res.json(result.rows[0].data);
    }

    res.json({});
  } catch (err) {
    console.error("Error getting history:", err);
    res.status(500).send("Error fetching history");
  }
});

// ✅ Save history
app.post("/save-history", async (req, res) => {
  try {
    const data = JSON.stringify(req.body);

    // Save to Redis
    await connectRedis();
    await redisClient.set("history", data);

    // Save to Postgres
    await pool.query("INSERT INTO history (data) VALUES ($1)", [data]);

    res.status(200).send("Saved to Redis & Postgres ✅");
  } catch (err) {
    console.error("Error saving history:", err);
    res.status(500).send("Error saving history");
  }
});

// ✅ Start server
app.listen(PORT, async () => {
  await connectRedis();
  await initPostgres();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

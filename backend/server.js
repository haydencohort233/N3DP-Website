import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();

// If frontend + API are same domain, CORS can be minimal.
// If different domains, set origin explicitly.
app.use(
  cors({
    origin: true,
    credentials: false,
  })
);

app.use(express.json({ limit: "2mb" }));

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Health (process)
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Health (DB)
app.get("/api/db-health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, db: rows?.[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: "DB query failed" });
  }
});

// Quote submit (adjust columns to match your quotes table)
app.post("/api/quotes", async (req, res) => {
  const {
    name,
    email,
    phone,
    message,
    preferred_contact = "email",
    quantity = null,
    deadline = null,
    ref_type = "",
    ref_id = "",
    ref_name = "",
    ref_src = "",
  } = req.body || {};

  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ ok: false, error: "Name is required" });
  }
  if (!email || !String(email).includes("@")) {
    return res.status(400).json({ ok: false, error: "Valid email is required" });
  }
  if (!message || String(message).trim().length < 10) {
    return res.status(400).json({ ok: false, error: "Message is too short" });
  }

  try {
    // IMPORTANT: change these columns to match your actual quotes table schema.
    const sql = `
      INSERT INTO quotes
      (name, email, phone, preferred_contact, quantity, deadline, message, ref_type, ref_id, ref_name, ref_src)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      String(name).trim(),
      String(email).trim(),
      String(phone || "").trim(),
      preferred_contact === "phone" ? "phone" : "email",
      quantity === "" ? null : quantity,
      deadline === "" ? null : deadline,
      String(message).trim(),
      String(ref_type || "").trim(),
      String(ref_id || "").trim(),
      String(ref_name || "").trim(),
      String(ref_src || "").trim(),
    ];

    const [result] = await pool.execute(sql, params);
    return res.json({ ok: true, id: result.insertId });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Insert failed" });
  }
});

// cPanel provides PORT. Bind 0.0.0.0.
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

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

const UPLOAD_DIR =
  process.env.QUOTE_UPLOAD_DIR ||
  path.join(process.cwd(), "uploads", "quotes");

const FILE_LINK_SECRET = process.env.FILE_LINK_SECRET || ""; // set in cPanel env vars

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXT = new Set([
  ".stl", ".3mf", ".step", ".stp", ".obj", ".zip",
  ".png", ".jpg", ".jpeg", ".webp"
]);

function safeBaseName(name) {
  return String(name || "file")
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

function makeStoredName(original) {
  const ext = path.extname(original || "").toLowerCase();
  const base = safeBaseName(path.basename(original || "file", ext));
  const rand = crypto.randomBytes(10).toString("hex");
  return `${Date.now()}_${rand}_${base}${ext}`;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, makeStoredName(file.originalname)),
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return cb(new Error(`File type not allowed: ${ext}`));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 5,
    fileSize: 25 * 1024 * 1024, // 25MB each
  },
});

function signFileLink(fileId, expiresMs) {
  if (!FILE_LINK_SECRET) return "";
  const payload = `${fileId}.${expiresMs}`;
  return crypto.createHmac("sha256", FILE_LINK_SECRET).update(payload).digest("hex");
}

function verifyFileLink(fileId, expiresMs, sig) {
  if (!FILE_LINK_SECRET) return false;
  const expected = signFileLink(fileId, expiresMs);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(sig || "")));
  } catch {
    return false;
  }
}

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

/**
 * Cloudflare Turnstile verification
 * - Requires env: TURNSTILE_SECRET
 * - Frontend must send: turnstileToken (string)
 */
async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET;

  if (!secret) return { ok: false, reason: "Missing TURNSTILE_SECRET" };
  if (!token) return { ok: false, reason: "Missing token" };

  const form = new URLSearchParams();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  const resp = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    }
  );

  const data = await resp.json().catch(() => null);

  if (!data?.success) {
    const codes = Array.isArray(data?.["error-codes"])
      ? data["error-codes"].join(",")
      : "failed";
    return { ok: false, reason: codes };
  }

  return { ok: true };
}

async function notifyDiscordQuote(quote) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;

  // Prevent giant posts / Discord limits
  const msg = String(quote.message || "").trim();
  const shortMsg = msg.length > 600 ? `${msg.slice(0, 600)}…` : msg;

  const contentLines = [
    `**New Quote #${quote.id}**`,
    `**Name:** ${quote.name}`,
    `**Email:** ${quote.email}`,
    quote.phone ? `**Phone:** ${quote.phone}` : null,
    `**Preferred:** ${quote.preferred_contact}`,
    quote.quantity ? `**Qty:** ${quote.quantity}` : null,
    quote.deadline ? `**Deadline:** ${quote.deadline}` : null,
    quote.ref_name ? `**Ref:** ${quote.ref_name} (${quote.ref_id || "no id"})` : null,
    quote.ref_src ? `**Ref Photo:** ${quote.ref_src}` : null,
    "",
    `**Message:** ${shortMsg || "(none)"}`,
  ].filter(Boolean);

  // Timeout so Discord can’t slow your API
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 2500);

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ac.signal,
      body: JSON.stringify({
        content: contentLines.join("\n").slice(0, 1900), // stay under Discord content limits
      }),
    });
  } catch {
    // Intentionally ignore notification failures
  } finally {
    clearTimeout(t);
  }
}

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

    // NEW: Cloudflare Turnstile token from frontend
    turnstileToken = "",
  } = req.body || {};

  // NEW: Verify Turnstile (block bots)
  // Pull best-effort client IP (Cloudflare + proxies + direct)
  const ip =
    req.headers["cf-connecting-ip"] ||
    (typeof req.headers["x-forwarded-for"] === "string"
      ? req.headers["x-forwarded-for"].split(",")[0]?.trim()
      : "") ||
    req.socket?.remoteAddress;

  try {
    const t = await verifyTurnstile(String(turnstileToken || ""), ip);
    if (!t.ok) {
      return res.status(400).json({ ok: false, error: `Captcha failed: ${t.reason || "unknown"}` });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Captcha verification error" });
  }

  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ ok: false, error: "Name is required" });
  }
  if (!email || !String(email).includes("@")) {
    return res.status(400).json({ ok: false, error: "Valid email is required" });
  }
  
  const isCustomize = !!(ref_type || ref_id);
  if (!isCustomize && (!message || String(message).trim().length < 10)) {
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
  const id = result.insertId;

  // Fire-and-forget (don’t block response)
  notifyDiscordQuote({
    id,
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone || "").trim(),
    preferred_contact: preferred_contact === "phone" ? "phone" : "email",
    quantity: quantity === "" ? null : quantity,
    deadline: deadline === "" ? null : deadline,
    message: String(message).trim(),
    ref_id: String(ref_id || "").trim(),
    ref_name: String(ref_name || "").trim(),
    ref_src: String(ref_src || "").trim(),
  });

  return res.json({ ok: true, id });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Insert failed" });
  }
});

app.post("/api/quotes/:id/files", upload.array("files", 5), async (req, res) => {
  const quoteId = Number(req.params.id);
  if (!Number.isFinite(quoteId) || quoteId <= 0) {
    return res.status(400).json({ ok: false, error: "Invalid quote id" });
  }

  const files = Array.isArray(req.files) ? req.files : [];
  if (!files.length) {
    return res.status(400).json({ ok: false, error: "No files uploaded" });
  }

  // PUBLIC_API_BASE is required so Discord links are clickable and correct
  const base = String(process.env.PUBLIC_API_BASE || "").replace(/\/+$/, "");
  if (!base) {
    // cleanup saved files if we can't generate safe links
    for (const f of files) {
      try { fs.unlinkSync(f.path); } catch {}
    }
    return res.status(500).json({ ok: false, error: "Missing PUBLIC_API_BASE" });
  }

  try {
    // Ensure quote exists
    const [q] = await pool.query(
      "SELECT id FROM quotes WHERE id = ? LIMIT 1",
      [quoteId]
    );

    if (!q?.length) {
      // cleanup saved files if quote doesn't exist
      for (const f of files) {
        try { fs.unlinkSync(f.path); } catch {}
      }
      return res.status(404).json({ ok: false, error: "Quote not found" });
    }

    // Insert metadata
    const inserted = [];
    for (const f of files) {
      const sql = `
        INSERT INTO quote_files (quote_id, original_name, stored_name, mime_type, size_bytes)
        VALUES (?, ?, ?, ?, ?)
      `;
      const params = [
        quoteId,
        f.originalname,
        f.filename,
        f.mimetype || null,
        f.size || null,
      ];

      const [r] = await pool.execute(sql, params);
      inserted.push({
        id: r.insertId,
        original_name: f.originalname,
        stored_name: f.filename,
        size_bytes: f.size,
      });
    }

    // Build signed links (7 days)
    const expiresMs = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const links = inserted.map((it) => {
      const sig = signFileLink(it.id, expiresMs);
      return {
        ...it,
        url: `${base}/api/quotes/${quoteId}/files/${it.id}?exp=${expiresMs}&sig=${sig}`,
      };
    });

    // Discord notification for files
    try {
      const webhook = process.env.DISCORD_WEBHOOK_URL;
      if (webhook) {
        const lines = [
          `**Files uploaded for Quote #${quoteId}**`,
          ...links.map(
            (x) =>
              `• ${x.original_name} (${Math.round((x.size_bytes || 0) / 1024)} KB)\n${x.url}`
          ),
        ];

        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: lines.join("\n").slice(0, 1900) }),
        });
      }
    } catch {}

    return res.json({ ok: true, files: links });
  } catch (e) {
    // cleanup saved files if DB insert fails (prevents orphan files)
    for (const f of files) {
      try { fs.unlinkSync(f.path); } catch {}
    }
    return res.status(500).json({ ok: false, error: "Upload failed" });
  }
});

app.get("/api/quotes/:quoteId/files/:fileId", async (req, res) => {
  const quoteId = Number(req.params.quoteId);
  const fileId = Number(req.params.fileId);
  const exp = Number(req.query.exp);
  const sig = String(req.query.sig || "");

  if (!Number.isFinite(quoteId) || !Number.isFinite(fileId)) {
    return res.status(400).send("Bad request");
  }
  if (!Number.isFinite(exp) || exp < Date.now()) {
    return res.status(403).send("Link expired");
  }
  if (!verifyFileLink(fileId, exp, sig)) {
    return res.status(403).send("Invalid link");
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, quote_id, original_name, stored_name FROM quote_files WHERE id = ? AND quote_id = ? LIMIT 1",
      [fileId, quoteId]
    );

    const f = rows?.[0];
    if (!f) return res.status(404).send("Not found");

    const absPath = path.join(UPLOAD_DIR, f.stored_name);
    return res.download(absPath, f.original_name);
  } catch {
    return res.status(500).send("Download failed");
  }
});

// ---- Upload / Multer error handler (AFTER routes, BEFORE app.listen) ----
app.use((err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    const map = {
      LIMIT_FILE_SIZE: "File too large (max 25MB).",
      LIMIT_FILE_COUNT: "Too many files (max 5).",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field. Use field name 'files'.",
    };
    return res.status(400).json({ ok: false, error: map[err.code] || err.message || "Upload error." });
  }

  if (typeof err.message === "string" && err.message.startsWith("File type not allowed")) {
    return res.status(400).json({ ok: false, error: err.message });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ ok: false, error: "Server error." });
});

// cPanel provides PORT. Bind 0.0.0.0.
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});

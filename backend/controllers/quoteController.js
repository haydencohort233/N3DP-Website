// backend/controllers/quoteController.js
import { pool } from "../db.js";

function isEmail(v) {
  return /\S+@\S+\.\S+/.test(String(v || "").trim());
}

async function notifyDiscord(message) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;

  // Node 18+ has global fetch
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  }).catch(() => {});
}

export async function createQuote(req, res) {
  try {
    const b = req.body || {};

    const name = String(b.name || "").trim();
    const email = String(b.email || "").trim();
    const phone = b.phone ? String(b.phone).trim() : null;
    const preferred_contact = ["email", "phone"].includes(b.preferred_contact)
      ? b.preferred_contact
      : "email";

    const message = String(b.message || "").trim();
    const quantity = Number.isFinite(Number(b.quantity)) ? Number(b.quantity) : null;
    const deadline = b.deadline ? String(b.deadline) : null;

    const ref_type = b.ref_type ? String(b.ref_type) : null;
    const ref_id = b.ref_id ? String(b.ref_id) : null;
    const ref_name = b.ref_name ? String(b.ref_name) : null;
    const ref_src = b.ref_src ? String(b.ref_src) : null;

    if (name.length < 2) return res.status(400).json({ error: "Name is required." });
    if (!isEmail(email)) return res.status(400).json({ error: "Valid email is required." });
    if (message.length < 10) return res.status(400).json({ error: "Message is too short." });

    const [result] = await pool.execute(
      `INSERT INTO quotes
        (name, email, phone, preferred_contact, quantity, deadline, message, ref_type, ref_id, ref_name, ref_src)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone,
        preferred_contact,
        quantity,
        deadline,
        message,
        ref_type,
        ref_id,
        ref_name,
        ref_src,
      ]
    );

    const quoteId = result.insertId;

    await notifyDiscord(
      `New quote submitted (#${quoteId}) from ${name} (${email})${ref_name ? ` — Ref: ${ref_name}` : ""}`
    );

    return res.status(201).json({ ok: true, id: quoteId });
  } catch (err) {
    return res.status(500).json({ error: "Server error creating quote." });
  }
}

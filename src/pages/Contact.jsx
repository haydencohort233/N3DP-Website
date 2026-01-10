// src/pages/Contact.jsx
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { API_BASE } from "../config/api";
import SEO from "../components/SEO";
import seoConfig from "../config/Seo";
import config from "../config";
import "../css/Contact.css";

function getRefFromParams(params) {
  const refId = params.get("refId") || "";
  const refName = params.get("refName") || "";
  const refSrc = params.get("refSrc") || "";
  const hasRef = !!(refId || refName || refSrc);
  return { hasRef, refId, refName, refSrc };
}

function isValidEmail(v) {
  return /\S+@\S+\.\S+/.test(String(v || "").trim());
}

function parseQty1to99(v) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i < 1) return null;
  return Math.min(99, i);
}

export default function Contact() {
  const { site } = config;

  const [searchParams] = useSearchParams();
  const ref = useMemo(() => getRefFromParams(searchParams), [searchParams]);

  const [refExpanded, setRefExpanded] = useState(false);

  const [form, setForm] = useState(() => ({
    name: "",
    email: "",
    phone: "",
    preferredContact: "email",

    // IMPORTANT: blank by default, but required when ref exists
    quantity: "",

    deadline: "",
    message: ref.hasRef
      ? `I’d like a quote for: ${ref.refName || "this item"} (Ref ID: ${ref.refId || "n/a"}).\n\n`
      : "",
    company: "",
  }));

  const [status, setStatus] = useState({
    state: "idle",
    message: "",
    quoteId: null,
  });

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  // Quantity is required when coming from PhotoViewer (ref.hasRef)
  const qtyParsed = useMemo(() => parseQty1to99(form.quantity), [form.quantity]);
  const qtyRequiredOk = ref.hasRef ? qtyParsed !== null : true;

  const canSubmit =
    form.name.trim().length >= 2 &&
    isValidEmail(form.email) &&
    form.message.trim().length >= 10 &&
    qtyRequiredOk &&
    status.state !== "sending";

  const bumpQty = (delta) => {
    const cur = parseQty1to99(form.quantity);
    if (delta > 0) {
      // If blank, start at 1. Otherwise increment.
      const next = cur === null ? 1 : Math.min(99, cur + 1);
      setField("quantity", String(next));
      return;
    }

    // delta < 0
    if (cur === null) return; // blank stays blank
    if (cur <= 1) {
      // allow clearing back to blank (still required for submission)
      setField("quantity", "");
      return;
    }
    setField("quantity", String(cur - 1));
  };

  async function onSubmit(e) {
    e.preventDefault();

    if (form.company.trim()) return;

    if (!canSubmit) {
      let msg = "Please complete the required fields.";
      if (ref.hasRef && qtyParsed === null) msg = "Please choose a quantity (1–99).";
      setStatus({ state: "error", message: msg, quoteId: null });
      return;
    }

    setStatus({ state: "sending", message: "Submitting…", quoteId: null });

    const deadline = String(form.deadline || "").trim() || null;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      preferred_contact: form.preferredContact === "phone" ? "phone" : "email",

      // Only include quantity if we have a valid one; required for ref anyway
      quantity: qtyParsed,

      deadline,
      message: form.message.trim(),

      ref_type: ref.hasRef ? "gallery" : null,
      ref_id: ref.refId || null,
      ref_name: ref.refName || null,
      ref_src: ref.refSrc || null,
    };

    const url = API_BASE ? `${API_BASE}/api/quotes` : "/api/quotes";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Quote submission failed.");

      setStatus({
        state: "success",
        message: "Quote request sent. We’ll contact you soon.",
        quoteId: data?.id ?? null,
      });

      setForm((p) => ({
        ...p,
        deadline: "",
        message: "",
        company: "",
        // keep quantity so they can submit another reorder quickly (optional)
        // quantity: "",
      }));
    } catch (err) {
      setStatus({
        state: "error",
        message: err?.message || "Something went wrong. Please try again.",
        quoteId: null,
      });
    }
  }

  return (
    <main className="contact-page">
      <SEO
        title={`Get a Quote — ${site.name}`}
        description="Request a quote for 3D printing or CAD/design."
        keywords={seoConfig.keywords}
      />

      <header className="contact-hero">
        <h1 className="contact-title">Get a Quote</h1>
        <p className="contact-subtitle">
          Share dimensions, material preference, quantity, and timeline. We’ll respond with pricing and options.
        </p>
      </header>

      <section className="contact-shell">
        {ref.hasRef && (
          <aside className="contact-ref" aria-label="Reference print">
            <div className="contact-ref-row">
              {ref.refSrc ? (
                <button
                  type="button"
                  className="contact-ref-thumb"
                  onClick={() => setRefExpanded((v) => !v)}
                  aria-label={refExpanded ? "Hide reference image" : "View reference image"}
                >
                  <img src={ref.refSrc} alt={ref.refName || "Reference"} loading="lazy" />
                </button>
              ) : (
                <div className="contact-ref-thumb contact-ref-thumb--empty" aria-hidden="true" />
              )}

              <div className="contact-ref-meta">
                <div className="contact-ref-kicker">Reorder / Reference</div>
                <div className="contact-ref-name">{ref.refName || "Referenced item"}</div>
                {ref.refId ? <div className="contact-ref-id">ID: {ref.refId}</div> : null}
              </div>

              <div className="contact-ref-controls">
                {ref.refSrc ? (
                  <button
                    type="button"
                    className="contact-ref-toggle"
                    onClick={() => setRefExpanded((v) => !v)}
                  >
                    {refExpanded ? "Minimize" : "Expand"}
                  </button>
                ) : null}

                {/* Quantity stepper (required) */}
                <div className={`contact-qty ${qtyParsed === null ? "is-empty" : ""}`}>
                  <button
                    type="button"
                    className="contact-qty-btn"
                    onClick={() => bumpQty(-1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <input
                    className="contact-qty-input"
                    inputMode="numeric"
                    placeholder="Qty"
                    value={form.quantity}
                    onChange={(e) => {
                      // allow blank; clamp on submit + +/- buttons
                      const raw = e.target.value.replace(/[^\d]/g, "");
                      // hard cap length 2 digits
                      const trimmed = raw.slice(0, 2);
                      setField("quantity", trimmed);
                    }}
                    aria-label="Quantity (required)"
                  />

                  <button
                    type="button"
                    className="contact-qty-btn"
                    onClick={() => bumpQty(1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {ref.refSrc && refExpanded && (
              <div className="contact-ref-expanded">
                <img src={ref.refSrc} alt={ref.refName || "Reference"} loading="lazy" />
              </div>
            )}

            <div className="contact-ref-note">
              This will include the referenced photo information so we can quote it faster.
            </div>
          </aside>
        )}

        <form className="contact-form" onSubmit={onSubmit} aria-label="Quote request form">
          <div className="contact-grid">
            <label className="contact-field">
              <span className="contact-label">Name *</span>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                autoComplete="name"
                placeholder="John Doe"
                required
              />
            </label>

            <label className="contact-field">
              <span className="contact-label">Email *</span>
              <input
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="contact-field">
              <span className="contact-label">Phone (optional)</span>
              <input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                type="tel"
                autoComplete="tel"
                placeholder="(###) ###-####"
              />
            </label>

            <label className="contact-field">
              <span className="contact-label">Preferred contact</span>
              <select
                value={form.preferredContact}
                onChange={(e) => setField("preferredContact", e.target.value)}
              >
                <option value="email">Email</option>
                <option value="phone">Phone/Text</option>
              </select>
            </label>

            {/* Quantity field only when NOT coming from PhotoViewer */}
            {!ref.hasRef && (
              <label className="contact-field">
                <span className="contact-label">Quantity</span>
                <input
                  value={form.quantity}
                  onChange={(e) => setField("quantity", e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g., 1"
                />
              </label>
            )}

            <label className="contact-field">
              <span className="contact-label">Deadline (optional)</span>
              <input
                value={form.deadline}
                onChange={(e) => setField("deadline", e.target.value)}
                type="date"
              />
            </label>

            <label className="contact-field contact-field--full">
              <span className="contact-label">Project details *</span>
              <textarea
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
                rows={7}
                placeholder="Include dimensions, material (PLA/PETG/ABS/etc.), color, and any fit/tolerance notes."
                required
              />
            </label>

            <label className="contact-field contact-hp" aria-hidden="true">
              <span className="contact-label">Company</span>
              <input
                value={form.company}
                onChange={(e) => setField("company", e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          <div className="contact-actions">
            <button className="contact-submit" type="submit" disabled={!canSubmit}>
              {status.state === "sending" ? "Sending…" : "Submit Quote Request"}
            </button>

            {status.state !== "idle" && (
              <div
                className={`contact-status contact-status--${status.state}`}
                role={status.state === "error" ? "alert" : "status"}
              >
                <div>{status.message}</div>
                {status.state === "success" && status.quoteId ? (
                  <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 650 }}>
                    Quote ID: #{status.quoteId}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}

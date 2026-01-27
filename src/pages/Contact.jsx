// src/pages/Contact.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { API_BASE } from "../config/api";
import SEO from "../components/SEO";
import seoConfig from "../config/Seo";
import config from "../config";
import galleryData from "../config/galleryData";
import "../css/Contact.css";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizePhotos(item) {
  if (!item) return [];

  // Preferred: photos[]
  if (Array.isArray(item.photos) && item.photos.length) {
    return item.photos
      .filter((p) => p && p.src)
      .map((p) => ({
        src: p.src,
        label: p.label || "",
        title: p.title || "",
        description: p.description || "",
        tags: Array.isArray(p.tags) ? p.tags : [],
      }));
  }

  // Legacy: images[]
  if (Array.isArray(item.images) && item.images.length) {
    return item.images
      .map((im) => (typeof im === "string" ? { src: im } : im))
      .filter((p) => p && p.src)
      .map((p) => ({
        src: p.src,
        label: p.label || "",
        title: p.title || "",
        description: p.description || "",
        tags: Array.isArray(p.tags) ? p.tags : [],
      }));
  }

  // Fallback: src only
  if (item.src) {
    return [{ src: item.src, label: "", title: "", description: "", tags: [] }];
  }

  return [];
}

function getRefFromParams(params) {
  const refId = params.get("refId") || "";
  const rawIndex = params.get("refPhotoIndex");
  const refPhotoIndex = Number.isFinite(Number(rawIndex)) ? Number(rawIndex) : 0;

  if (!refId) {
    return {
      hasRef: false,
      refId: "",
      refPhotoIndex: 0,
      refName: "",
      refSrc: "",
      refPhotoLabel: "",
      refTags: [],
    };
  }

  const item = galleryData.find((x) => String(x.id) === String(refId));
  if (!item) {
    // keep hasRef so you can show "unknown item" if desired
    return {
      hasRef: true,
      refId,
      refPhotoIndex: 0,
      refName: "",
      refSrc: "",
      refPhotoLabel: "",
      refTags: [],
    };
  }

  const photos = normalizePhotos(item);
  const idx = clamp(refPhotoIndex, 0, Math.max(0, photos.length - 1));
  const p = photos[idx] || null;

  const refName = (p?.title?.trim() || item.title || "");
  const refSrc = (p?.src || item.src || "");
  const refPhotoLabel = (p?.label || "");

  const refTags = [
    ...(Array.isArray(item.tags) ? item.tags : []),
    ...(Array.isArray(p?.tags) ? p.tags : []),
    ...(p?.label ? [p.label] : []),
  ];

  return {
    hasRef: true,
    refId,
    refPhotoIndex: idx,
    refName,
    refSrc,
    refPhotoLabel,
    refTags,
  };
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

function findRefByIdAndPhoto(refId, refPhotoIndex) {
  const item = galleryData.find((x) => String(x.id) === String(refId));
  if (!item) return null;

  const photos = Array.isArray(item.photos) && item.photos.length
    ? item.photos
    : item.src
    ? [{ src: item.src }]
    : [];

  const i = Number.isFinite(refPhotoIndex) ? refPhotoIndex : 0;
  const p = photos[Math.max(0, Math.min(i, photos.length - 1))] || null;

  return {
    refName: (p?.title?.trim() || item.title || ""),
    refSrc: (p?.src || item.src || ""),
    refPhotoLabel: (p?.label || ""),
    refTags: [
      ...(Array.isArray(item.tags) ? item.tags : []),
      ...(Array.isArray(p?.tags) ? p.tags : []),
      ...(p?.label ? [p.label] : []),
    ],
  };
}


export default function Contact() {
  const { site } = config;

  const [searchParams, setSearchParams] = useSearchParams();
  const ref = useMemo(() => getRefFromParams(searchParams), [searchParams]);

  const [refExpanded, setRefExpanded] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  // --- Turnstile (Cloudflare Captcha) ---
  const TURNSTILE_SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY || "";
  const turnstileElRef = useRef(null);
  const turnstileWidgetIdRef = useRef(null);

  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState("");

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    if (!turnstileElRef.current) return;

    let cancelled = false;

    const tryRender = () => {
      if (cancelled) return false;
      if (!window.turnstile) return false;

      // Render once
      if (turnstileWidgetIdRef.current == null) {
        turnstileWidgetIdRef.current = window.turnstile.render(turnstileElRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => {
            setTurnstileToken(token || "");
            setTurnstileError("");
          },
          "expired-callback": () => {
            setTurnstileToken("");
            setTurnstileError("");
          },
          "error-callback": () => {
            setTurnstileToken("");
            setTurnstileError("Captcha failed");
          },
        });
      }
      return true;
    };

    // Try now, otherwise poll until script loads
    if (tryRender()) return;

    const id = setInterval(() => {
      if (tryRender()) clearInterval(id);
    }, 200);

    return () => {
      cancelled = true;
      clearInterval(id);
      try {
        if (window.turnstile && turnstileWidgetIdRef.current != null) {
          window.turnstile.remove(turnstileWidgetIdRef.current);
          turnstileWidgetIdRef.current = null;
        }
      } catch {}
    };
  }, [TURNSTILE_SITE_KEY]);

  const [form, setForm] = useState(() => ({
    name: "",
    email: "",
    phone: "",
    preferredContact: "email",

    // If coming from "Get Quote" (ref exists), default to 1
    quantity: ref.hasRef ? "1" : "",

    // KEEP the textarea; you're just not auto-filling it anymore
    message: "",

    // keeping for later features
    deadline: "",
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
    const next = cur === null ? 1 : Math.min(99, cur + 1);
    setField("quantity", String(next));
    return;
  }

  // delta < 0
  if (cur === null) {
    // if ref exists and they hit "-", keep it at 1
    if (ref.hasRef) setField("quantity", "1");
    return;
  }

  if (cur <= 1) {
    // If ref exists, do NOT allow clearing (always keep >=1)
    if (ref.hasRef) {
      setField("quantity", "1");
    } else {
      setField("quantity", "");
    }
    return;
  }

  setField("quantity", String(cur - 1));
};

  async function onSubmit(e) {
  e.preventDefault();

  if (form.company.trim()) return;

  if (TURNSTILE_SITE_KEY && !turnstileToken) {
    setStatus({
      state: "error",
      message: "Please complete the captcha to submit.",
      quoteId: null,
    });
    return;
  }

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
    quantity: qtyParsed,
    deadline,
    message: form.message.trim(),

    ref_type: ref.hasRef ? "gallery" : null,
    ref_id: ref.refId || null,
    ref_name: ref.refName || null,
    ref_src: ref.refSrc || null,

    // keep these if you plan to store them later; harmless otherwise
    ref_variant_label: ref.refVariantLabel || null,
    ref_options: ref.refOptions || null,

    turnstileToken,
  };

  const url = API_BASE ? `${API_BASE}/api/quotes` : "/api/quotes";

  try {
    // 1) Create quote
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Quote submission failed.");

    const quoteId = data?.id ?? null;

    // 2) Upload files (optional; does not block quote success)
    if (quoteId && Array.isArray(files) && files.length) {
      const fd = new FormData();
      for (const f of files.slice(0, 5)) fd.append("files", f);

      const uploadUrl = API_BASE
        ? `${API_BASE}/api/quotes/${quoteId}/files`
        : `/api/quotes/${quoteId}/files`;

      try {
        const upRes = await fetch(uploadUrl, { method: "POST", body: fd });

        // read as text first (works for JSON or HTML)
        const upText = await upRes.text();
        let upData = {};
        try { upData = JSON.parse(upText); } catch {}

        if (!upRes.ok) {
          const msg =
            upData?.error ||
            upRes.statusText ||
            (upText ? upText.slice(0, 140) : "Upload failed.");
          setStatus({
            state: "success",
            message: `Quote request sent. (Files upload failed: ${msg})`,
            quoteId,
          });
        } else {
          setStatus({
            state: "success",
            message: "Quote request sent. We’ll contact you soon.",
            quoteId,
          });
        }

        if (!upRes.ok) {
          setStatus({
            state: "success",
            message: `Quote request sent. (Files upload failed: ${upData?.error || "unknown"})`,
            quoteId,
          });
        } else {
          setStatus({
            state: "success",
            message: "Quote request sent. We’ll contact you soon.",
            quoteId,
          });
        }
      } catch (e) {
        setStatus({
          state: "success",
          message: "Quote request sent. (Files upload failed.)",
          quoteId,
        });
      }
    } else {
      setStatus({
        state: "success",
        message: "Quote request sent. We’ll contact you soon.",
        quoteId,
      });
    }

    // Clear form fields (keep quantity optional)
    setForm((p) => ({
      ...p,
      deadline: "",
      message: "",
      company: "",
    }));

    // Clear captcha token (forces re-check next time)
    if (TURNSTILE_SITE_KEY) {
      setTurnstileToken("");
      setTurnstileError("");
      try {
        if (window.turnstile && turnstileWidgetIdRef.current != null) {
          window.turnstile.reset(turnstileWidgetIdRef.current);
        }
      } catch {}
    }

    // Clear selected files
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  } catch (err) {
    setStatus({
      state: "error",
      message: err?.message || "Something went wrong. Please try again.",
      quoteId: null,
    });
  }
}

  const clearReference = () => {
    setRefExpanded(false);

    // quantity no longer required once reference is removed
    setForm((p) => ({ ...p, quantity: "" }));

    // Remove ONLY ref-related params (leave other params intact)
    const next = new URLSearchParams(searchParams);

    next.delete("refId");
    next.delete("refPhotoIndex");

    // Optional cleanup if any older params might exist:
    next.delete("refName");
    next.delete("refSrc");
    next.delete("refPhotoLabel");
    next.delete("refTags");
    next.delete("refVariantLabel");
    next.delete("refOptions");

    setSearchParams(next, { replace: true });
  };

  return (
    <main className="contact-page">
      <SEO
        title={`Get a Quote — ${site.name}`} // Has to match the <h1> for better readability
        description="Request a 3D printing or CAD/design quote in Nashville. Share dimensions, material, quantity, and timeline—we’ll reply with pricing and options."
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

              {/* Controls: Expand, Qty, Remove */}
              <div className="contact-ref-controls">
                {ref.refSrc ? (
                  <button
                    type="button"
                    className="contact-ref-toggle"
                    onClick={() => setRefExpanded((v) => !v)}
                  >
                    {refExpanded ? "Minimize Image" : "Expand Image"}
                  </button>
                ) : null}

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
                      const raw = e.target.value.replace(/[^\d]/g, "");
                      setField("quantity", raw.slice(0, 2));
                    }}
                    aria-label="Quantity"
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

                {/* Remove ref (clears URL params + form message + qty) */}
                <button
                  type="button"
                  className="contact-ref-remove contact-ref-remove--danger"
                  aria-label="Remove item"
                  title="Remove item"
                  onClick={clearReference}
                >
                  ×
                </button>
              </div>
            </div>

            {ref.refSrc && refExpanded && (
              <div className="contact-ref-expanded">
                <img src={ref.refSrc} alt={ref.refName || "Reference"} loading="lazy" />
              </div>
            )}

            <div className="contact-ref-note">
              <div className="contact-ref-note-title">
                {ref.refName || "Referenced item"}
              </div>

              {ref.refId ? <div className="contact-ref-note-sub">ID: {ref.refId}</div> : null}

              {ref.refVariantLabel ? (
                <div className="contact-ref-note-sub">Variant: {ref.refVariantLabel}</div>
              ) : null}

              {ref.refOptions ? (
                <div className="contact-ref-note-sub">
                  {Object.entries(ref.refOptions)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" • ")}
                </div>
              ) : null}
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

            <label className="contact-field contact-field--full">
              <span className="contact-label">Files (optional)</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".stl,.3mf,.step,.stp,.obj,.zip,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))}
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

            <label className="contact-field contact-field--full">
              <span className="contact-label">Project details *</span>
              <textarea
                value={form.message ?? ""}
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

        {/* Actions / Captcha / Submit / Status */}
          <div className="contact-actions">
            {/* Turnstile: hide as much as possible (hide after it succeeds, and hide on success submit) */}
            {!TURNSTILE_SITE_KEY ? (
              <div className="contact-status contact-status--error" role="alert">
                Missing REACT_APP_TURNSTILE_SITE_KEY in frontend .env
              </div>
            ) : status.state !== "success" && !turnstileToken ? (
              <div className="contact-turnstile" aria-label="Spam protection">
                <div ref={turnstileElRef} />
              </div>
            ) : null}

            <button className="contact-submit" type="submit" disabled={!canSubmit}>
              {status.state === "sending"
                ? "Sending…"
                : !TURNSTILE_SITE_KEY
                ? "Submit Quote Request"
                : !turnstileToken
                ? "Complete Captcha to Submit"
                : "Submit Quote Request"}
            </button>

            {/* Only show the hint when captcha is required and incomplete */}
            {TURNSTILE_SITE_KEY && status.state !== "sending" && status.state !== "success" && !turnstileToken && (
              <div className="contact-status" role="status">
                Please complete the captcha above to submit.
              </div>
            )}

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

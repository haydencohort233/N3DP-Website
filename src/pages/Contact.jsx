// src/pages/Contact.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE } from "../config/api";
import SEO from "../components/SEO";
import seoConfig from "../config/Seo";
import config from "../config";
import galleryData from "../config/galleryData";
import productsData from "../config/productsData";
import "../css/Contact.css";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizePhotos(item) {
  if (!item) return [];
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
  if (item.src) {
    return [{ src: item.src, label: "", title: "", description: "", tags: [] }];
  }
  return [];
}

function findItem(refId) {
  return (
    galleryData.find((x) => String(x.id) === String(refId)) ||
    productsData.find((x) => String(x.id) === String(refId)) ||
    null
  );
}

function getRefFromParams(params) {
  const refId = params.get("refId") || "";
  const rawIndex = params.get("refPhotoIndex");
  const refPhotoIndex = Number.isFinite(Number(rawIndex)) ? Number(rawIndex) : 0;

  if (!refId) {
    return { hasRef: false, refId: "", refPhotoIndex: 0, refName: "", refSrc: "", refPhotoLabel: "", refTags: [] };
  }

  const item = findItem(refId);
  if (!item) {
    return { hasRef: true, refId, refPhotoIndex: 0, refName: "", refSrc: "", refPhotoLabel: "", refTags: [] };
  }

  const photos = normalizePhotos(item);
  const idx = clamp(refPhotoIndex, 0, Math.max(0, photos.length - 1));
  const p = photos[idx] || null;

  return {
    hasRef: true,
    refId,
    refPhotoIndex: idx,
    refName: p?.title?.trim() || item.title || "",
    refSrc: p?.src || item.src || "",
    refPhotoLabel: p?.label || "",
    refTags: [
      ...(Array.isArray(item.tags) ? item.tags : []),
      ...(Array.isArray(p?.tags) ? p.tags : []),
      ...(p?.label ? [p.label] : []),
    ],
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

export default function Contact() {
  const { site } = config;
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const ref = useMemo(() => getRefFromParams(searchParams), [searchParams]);

  // Context: "customize" when arriving from a product, "quote" when arriving directly
  const isCustomize = ref.hasRef;

  const [refExpanded, setRefExpanded] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Advanced options — collapsed by default for customize, expanded for quote
  const [advOpen, setAdvOpen] = useState(!isCustomize);
  const [advHelp, setAdvHelp] = useState({
    material: false, strength: false, quality: false, deadline: false,
  });

  useEffect(() => {
    const anyOpen = Object.values(advHelp).some(Boolean);
    if (!anyOpen) return;
    const onDown = (e) => {
      if (e.target?.closest?.(".contact-adv-info")) return;
      if (e.target?.closest?.(".contact-adv-popover")) return;
      setAdvHelp({ material: false, strength: false, quality: false, deadline: false });
    };
    const onKey = (e) => {
      if (e.key === "Escape") setAdvHelp({ material: false, strength: false, quality: false, deadline: false });
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [advHelp]);

  useEffect(() => {
    if (!ref.hasRef) return;
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [ref.hasRef]);

  // --- Turnstile ---
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
      if (turnstileWidgetIdRef.current == null) {
        turnstileWidgetIdRef.current = window.turnstile.render(turnstileElRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => { setTurnstileToken(token || ""); setTurnstileError(""); },
          "expired-callback": () => { setTurnstileToken(""); setTurnstileError(""); },
          "error-callback": () => { setTurnstileToken(""); setTurnstileError("Captcha failed"); },
        });
      }
      return true;
    };
    if (tryRender()) return;
    const id = setInterval(() => { if (tryRender()) clearInterval(id); }, 200);
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
    quantity: ref.hasRef ? "1" : "",
    message: "",
    material: "PLA (Default)",
    strength: "15% (Default)",
    quality: "0.20mm (Default)",
    deadline: "",
    company: "",
  }));

  const [status, setStatus] = useState({ state: "idle", message: "", quoteId: null });
  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const qtyParsed = useMemo(() => parseQty1to99(form.quantity), [form.quantity]);
  const qtyRequiredOk = ref.hasRef ? qtyParsed !== null : true;

  // Customize mode: message optional (item ref is enough context)
  // Quote mode: message required (10+ chars)
  const canSubmit =
    form.name.trim().length >= 2 &&
    isValidEmail(form.email) &&
    (isCustomize ? true : form.message.trim().length >= 10) &&
    qtyRequiredOk &&
    status.state !== "sending";

  const bumpQty = (delta) => {
    const cur = parseQty1to99(form.quantity);
    if (delta > 0) {
      setField("quantity", String(cur === null ? 1 : Math.min(99, cur + 1)));
      return;
    }
    if (cur === null) { if (ref.hasRef) setField("quantity", "1"); return; }
    if (cur <= 1) {
      setField("quantity", ref.hasRef ? "1" : "");
      return;
    }
    setField("quantity", String(cur - 1));
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (form.company.trim()) return;
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setStatus({ state: "error", message: "Please complete the captcha to submit.", quoteId: null });
      return;
    }
    if (!canSubmit) {
      setStatus({ state: "error", message: ref.hasRef && qtyParsed === null ? "Please choose a quantity (1–99)." : "Please complete the required fields.", quoteId: null });
      return;
    }

    setStatus({ state: "sending", message: "Submitting…", quoteId: null });

    const deadline = String(form.deadline || "").trim() || null;
    const advLines = [];
    if (form.material && form.material !== "PLA (Default)") advLines.push(`Material: ${form.material}`);
    if (form.strength && form.strength !== "15% (Default)") advLines.push(`Strength: ${form.strength}`);
    if (form.quality && form.quality !== "0.20mm (Default)") advLines.push(`Quality: ${form.quality}`);
    if (deadline) advLines.push(`Deadline: ${deadline}`);

    const baseMsg = String(form.message || "").trim();
    const finalMsg = advLines.length > 0 ? `${baseMsg}\n\n[Advanced Options]\n${advLines.join("\n")}` : baseMsg;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      preferred_contact: form.preferredContact === "phone" ? "phone" : "email",
      quantity: qtyParsed,
      deadline,
      message: finalMsg,
      ref_type: ref.hasRef ? "gallery" : null,
      ref_id: ref.refId || null,
      ref_name: ref.refName || null,
      ref_src: ref.refSrc || null,
      ref_variant_label: ref.refVariantLabel || null,
      ref_options: ref.refOptions || null,
      turnstileToken,
    };

    const url = API_BASE ? `${API_BASE}/api/quotes` : "/api/quotes";

    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Submission failed.");

      const quoteId = data?.id ?? null;

      if (quoteId && Array.isArray(files) && files.length) {
        const fd = new FormData();
        for (const f of files.slice(0, 5)) fd.append("files", f);
        const uploadUrl = API_BASE ? `${API_BASE}/api/quotes/${quoteId}/files` : `/api/quotes/${quoteId}/files`;
        try {
          const upRes = await fetch(uploadUrl, { method: "POST", body: fd });
          const upText = await upRes.text();
          let upData = {};
          try { upData = JSON.parse(upText); } catch {}
          if (!upRes.ok) {
            setStatus({ state: "success", message: `Request sent! (Files upload failed: ${upData?.error || upRes.statusText})`, quoteId });
          } else {
            setStatus({ state: "success", message: isCustomize ? "Order request sent! We'll be in touch within 24 hours." : "Quote request sent! We'll be in touch within 24–72 hours.", quoteId });
          }
        } catch {
          setStatus({ state: "success", message: "Request sent. (Files upload failed.)", quoteId });
        }
      } else {
        setStatus({ state: "success", message: isCustomize ? "Order request sent! We'll be in touch within 24 hours." : "Quote request sent! We'll be in touch within 24–72 hours.", quoteId });
      }

      setForm((p) => ({ ...p, deadline: "", material: "PLA (Default)", strength: "15% (Default)", quality: "0.20mm (Default)", message: "", company: "" }));

      if (TURNSTILE_SITE_KEY) {
        setTurnstileToken(""); setTurnstileError("");
        try { if (window.turnstile && turnstileWidgetIdRef.current != null) window.turnstile.reset(turnstileWidgetIdRef.current); } catch {}
      }
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setStatus({ state: "error", message: err?.message || "Something went wrong. Please try again.", quoteId: null });
    }
  }

  const clearReference = () => {
    setRefExpanded(false);
    setForm((p) => ({ ...p, quantity: "" }));
    const next = new URLSearchParams(searchParams);
    ["refId","refPhotoIndex","refName","refSrc","refPhotoLabel","refTags","refVariantLabel","refOptions"].forEach((k) => next.delete(k));
    setSearchParams(next, { replace: true });
  };

  // ── Success screen ──
  if (status.state === "success") {
    const contactEmail = site?.contactEmail || seoConfig?.business?.email || "";
    const contactPhone = site?.contactPhone || seoConfig?.business?.telephone || "";
    const phoneHref = contactPhone ? `tel:${String(contactPhone).replace(/[^\d+]/g, "")}` : "";

    return (
      <main className="contact-page">
        <SEO title={`${isCustomize ? "Order" : "Quote"} Sent — ${site.name}`} description="Request successfully sent." />
        <header className="contact-hero">
          <h1 className="contact-title">{isCustomize ? "Order received!" : "Quote request sent!"}</h1>
          <p className="contact-subtitle">We'll be in touch within {isCustomize ? "24 hours" : "24–72 hours"} via your preferred contact method.</p>
        </header>
        <section className="contact-shell">
          <div className="contact-success-card" role="status" aria-live="polite">
            {status.quoteId ? <div className="contact-success-id">Reference ID: #{status.quoteId}</div> 
            : null
            }
              <p className="contact-success-email">
                We'll reach out to <strong>{form.email}</strong> within{" "}
                {isCustomize ? "24 hours" : "24–72 hours"}.
              </p>
            {(contactEmail || contactPhone) && (
              <div className="contact-success-contact">
                <div className="contact-success-contact-title">Need us sooner?</div>
                {contactEmail ? <a className="contact-success-link" href={`mailto:${contactEmail}`}>{contactEmail}</a> : null}
                {contactPhone ? <a className="contact-success-link" href={phoneHref}>{contactPhone}</a> : null}
              </div>
            )}
            <div className="contact-success-actions">
              <button type="button" className="contact-success-btn" onClick={() => navigate("/")}>Back to Home</button>
              <button type="button" className="contact-success-btn contact-success-btn--secondary" onClick={() => navigate("/shop")}>Shop</button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── Context-aware copy ──
  const pageTitle    = isCustomize ? "Customize Your Order" : "Request a Quote";
  const pageSubtitle = isCustomize
    ? "Tell us any changes you'd like — color, size, material. We'll confirm and get started."
    : "Describe what you need and we'll reply with pricing within 24–72 hours. Not sure what to include? Just tell us what it's for.";
  const submitLabel  = isCustomize ? "Send Order Request" : "Submit Quote";
  const messagePlaceholder = isCustomize
    ? "Any changes from the original? Different color, size, or material? Leave blank if you want it as-is."
    : "Include dimensions, material (PLA/PETG/ABS/etc.), infill %, layer height, color, and any fit/tolerance notes.";
  const messageLabel = isCustomize ? "Changes or notes (optional)" : "Project details *";

  return (
    <main className="contact-page">
      <SEO
        title={`${pageTitle} — ${site.name}`}
        description={isCustomize
          ? "Customize a 3D printed item from Nashville 3D Prints. Tell us your changes and we'll get started."
          : "Request a detailed 3D printing quote in Nashville. Share dimensions, material, and specs — we'll reply with pricing."}
      />

      <header className="contact-hero">
        {/* Mode pill */}
        <div className={`contact-mode-pill contact-mode-pill--${isCustomize ? "customize" : "quote"}`}>
          {isCustomize ? "✏️ Customizing a product" : "📐 Detailed quote request"}
        </div>
        <h1 className="contact-title">{pageTitle}</h1>
        <p className="contact-subtitle">{pageSubtitle}</p>
      </header>

      <section className="contact-shell">

        {/* ── Reference panel ── */}
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

              <div className="contact-ref-controls">
                {ref.refSrc && (
                  <button type="button" className="contact-ref-toggle" onClick={() => setRefExpanded((v) => !v)}>
                    {refExpanded ? "Minimize" : "Expand"}
                  </button>
                )}

                <div className={`contact-qty ${qtyParsed === null ? "is-empty" : ""}`}>
                  <button type="button" className="contact-qty-btn" onClick={() => bumpQty(-1)} aria-label="Decrease quantity">−</button>
                  <input
                    className="contact-qty-input"
                    inputMode="numeric"
                    placeholder="Qty"
                    value={form.quantity}
                    onChange={(e) => setField("quantity", e.target.value.replace(/[^\d]/g, "").slice(0, 2))}
                    aria-label="Quantity"
                  />
                  <button type="button" className="contact-qty-btn" onClick={() => bumpQty(1)} aria-label="Increase quantity">+</button>
                </div>

                <button type="button" className="contact-ref-remove contact-ref-remove--danger" aria-label="Remove item" onClick={clearReference}>×</button>
              </div>
            </div>

            {ref.refSrc && refExpanded && (
              <div className="contact-ref-expanded">
                <img src={ref.refSrc} alt={ref.refName || "Reference"} loading="lazy" />
              </div>
            )}

            <div className="contact-ref-note">
              <div className="contact-ref-note-title">{ref.refName || "Referenced item"}</div>
              {ref.refId && <div className="contact-ref-note-sub">ID: {ref.refId}</div>}
            </div>
          </aside>
        )}

        {/* ── Form ── */}
        <form className="contact-form" onSubmit={onSubmit} aria-label="Order request form">
          <div className="contact-grid">

            <label className="contact-field">
              <span className="contact-label">Name *</span>
              <input value={form.name} onChange={(e) => setField("name", e.target.value)} autoComplete="name" placeholder="John Doe" required />
            </label>

            <label className="contact-field">
              <span className="contact-label">Email *</span>
              <input value={form.email} onChange={(e) => setField("email", e.target.value)} type="email" autoComplete="email" placeholder="you@example.com" required />
            </label>

            <label className="contact-field">
              <span className="contact-label">Phone (optional)</span>
              <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} type="tel" autoComplete="tel" placeholder="(###) ###-####" />
            </label>

            <label className="contact-field">
              <span className="contact-label">Preferred contact</span>
              <select value={form.preferredContact} onChange={(e) => setField("preferredContact", e.target.value)}>
                <option value="email">Email</option>
                <option value="phone">Phone/Text</option>
              </select>
            </label>

            {/* File upload — shown in quote mode, hidden in customize mode */}
            {!isCustomize && (
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
            )}

            {/* Quantity — only shown when NOT coming from a ref (ref has its own qty control) */}
            {!ref.hasRef && (
              <label className="contact-field">
                <span className="contact-label">Quantity</span>
                <input value={form.quantity} onChange={(e) => setField("quantity", e.target.value)} inputMode="numeric" placeholder="e.g., 1" />
              </label>
            )}

            <label className="contact-field contact-field--full">
              <span className="contact-label">{messageLabel}</span>
              <textarea
                value={form.message ?? ""}
                onChange={(e) => setField("message", e.target.value)}
                rows={isCustomize ? 4 : 7}
                placeholder={messagePlaceholder}
                required={!isCustomize}
              />

              {/* Advanced options — collapsed in customize mode, open in quote mode */}
              <div className="contact-adv">
                <button
                  type="button"
                  className="contact-adv-toggle"
                  onClick={() => setAdvOpen((v) => !v)}
                  aria-expanded={advOpen}
                >
                  {isCustomize ? `Printing options ${advOpen ? "▴" : "▾"}` : `Advanced options ${advOpen ? "▴" : "▾"}`}
                </button>

                {!advOpen && isCustomize && (
                  <p className="contact-adv-hint contact-adv-hint--inline">
                    Material, strength, quality — we'll use sensible defaults unless you specify.
                  </p>
                )}

                {advOpen && (
                  <div className="contact-adv-panel" role="region" aria-label="Advanced options">
                    {isCustomize && <div className="contact-adv-hint">Leave defaults if you're unsure — we'll use the best settings for your item.</div>}

                    {/* Material */}
                    <div className="contact-adv-row">
                      <div className="contact-adv-label">
                        <span>Material</span>
                        <div className="contact-adv-info-wrap">
                          <button type="button" className="contact-adv-info" aria-label="Material info" aria-expanded={advHelp.material}
                            onClick={() => setAdvHelp({ material: !advHelp.material, strength: false, quality: false, deadline: false })}>ⓘ</button>
                          {advHelp.material && <div className="contact-adv-popover" role="dialog">PLA = most common. PETG = tougher. ABS/ASA = heat resistant. TPU = flexible.</div>}
                        </div>
                      </div>
                      <select value={form.material} onChange={(e) => setField("material", e.target.value)}>
                        <option value="PLA (Default)">PLA (Default)</option>
                        <option value="PETG">PETG</option>
                        <option value="ABS/ASA">ABS/ASA</option>
                        <option value="TPU">TPU</option>
                        <option value="Resin">Resin</option>
                      </select>
                    </div>

                    {/* Strength */}
                    <div className="contact-adv-row">
                      <div className="contact-adv-label">
                        <span>Strength</span>
                        <div className="contact-adv-info-wrap">
                          <button type="button" className="contact-adv-info" aria-label="Strength info" aria-expanded={advHelp.strength}
                            onClick={() => setAdvHelp({ material: false, strength: !advHelp.strength, quality: false, deadline: false })}>ⓘ</button>
                          {advHelp.strength && <div className="contact-adv-popover" role="dialog">Default is Triangle Infill. Strong is Gyroid Infill. Strong is for industrial or fragile pieces.</div>}
                        </div>
                      </div>
                      <select value={form.strength} onChange={(e) => setField("strength", e.target.value)}>
                        <option value="15% (Default)">15% (Default)</option>
                        <option value="Strong (30%)">Strong (30%)</option>
                      </select>
                    </div>

                    {/* Quality */}
                    <div className="contact-adv-row">
                      <div className="contact-adv-label">
                        <span>Quality</span>
                        <div className="contact-adv-info-wrap">
                          <button type="button" className="contact-adv-info" aria-label="Quality info" aria-expanded={advHelp.quality}
                            onClick={() => setAdvHelp({ material: false, strength: false, quality: !advHelp.quality, deadline: false })}>ⓘ</button>
                          {advHelp.quality && <div className="contact-adv-popover" role="dialog">0.40mm — Prototyping, 0.20mm — Default, 0.10mm — High Detail & Figurines</div>}
                        </div>
                      </div>
                      <select value={form.quality} onChange={(e) => setField("quality", e.target.value)}>
                        <option value="0.20mm (Default)">0.20mm (Default)</option>
                        <option value="0.40mm (Prototype)">0.40mm (Prototype)</option>
                        <option value="0.10mm (Figurines)">0.10mm (Figurines)</option>
                      </select>
                    </div>

                    {/* Deadline */}
                    <div className="contact-adv-row">
                      <div className="contact-adv-label">
                        <span>Deadline</span>
                        <div className="contact-adv-info-wrap">
                          <button type="button" className="contact-adv-info" aria-label="Deadline info" aria-expanded={advHelp.deadline}
                            onClick={() => setAdvHelp({ material: false, strength: false, quality: false, deadline: !advHelp.deadline })}>ⓘ</button>
                          {advHelp.deadline && <div className="contact-adv-popover" role="dialog">Optional. Rush deadlines may cost more. Details will be discussed.</div>}
                        </div>
                      </div>
                      <input type="date" value={form.deadline} onChange={(e) => setField("deadline", e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* Honeypot */}
            <label className="contact-field contact-hp" aria-hidden="true">
              <span className="contact-label">Company</span>
              <input value={form.company} onChange={(e) => setField("company", e.target.value)} tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {/* ── Quote mode only: link to shop for ready-made items ── */}
          {!isCustomize && (
            <p className="contact-shop-nudge">
              Looking for something ready to buy?{" "}
              <a href="/shop">Browse the shop</a> for fixed-price items.
            </p>
          )}

          <div className="contact-actions">
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
              {status.state === "sending" ? "Sending…"
                : !TURNSTILE_SITE_KEY ? submitLabel
                : !turnstileToken ? "Complete Captcha to Submit"
                : submitLabel}
            </button>

            {TURNSTILE_SITE_KEY && status.state !== "sending" && status.state !== "success" && !turnstileToken && (
              <div className="contact-status" role="status">Please complete the captcha above to submit.</div>
            )}

            {status.state !== "idle" && (
              <div className={`contact-status contact-status--${status.state}`} role={status.state === "error" ? "alert" : "status"}>
                <div>{status.message}</div>
                {status.state === "success" && status.quoteId && (
                  <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 650 }}>
                    Reference ID: #{status.quoteId}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
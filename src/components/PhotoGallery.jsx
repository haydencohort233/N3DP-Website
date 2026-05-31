// src/components/PhotoGallery.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import galleryData from "../config/galleryData";
import GalleryModal from "./GalleryModal";
import "../css/PhotoGallery.css";

function normalizeArr(v) {
  if (!v) return [];
  return Array.isArray(v) ? v.filter(Boolean) : [v].filter(Boolean);
}

function bySort(sort) {
  return (a, b) => {
    if (sort === "newest" || sort === "oldest") {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      if (Number.isNaN(da) || Number.isNaN(db)) return 0;
      return sort === "newest" ? db - da : da - db;
    }
    const ta = (a.title || "").toLowerCase();
    const tb = (b.title || "").toLowerCase();
    if (sort === "title-asc") return ta.localeCompare(tb);
    if (sort === "title-desc") return tb.localeCompare(ta);
    return 0;
  };
}

function floorToMultiple(n, m) {
  if (!m || m <= 0) return n;
  return Math.floor(n / m) * m;
}

function readColsFromGrid(el) {
  if (!el) return 5;

  const cs = window.getComputedStyle(el);

  // Primary: read CSS variable --pg-cols
  const v = cs.getPropertyValue("--pg-cols")?.trim();
  const n = parseInt(v, 10);
  if (Number.isFinite(n) && n > 0) return n;

  // Fallback: attempt to infer from gridTemplateColumns
  const gtc = cs.gridTemplateColumns;
  if (!gtc) return 5;
  const parts = gtc.split(" ").filter(Boolean);
  return Math.max(1, parts.length);
}

export default function PhotoGallery({
  title = "Gallery",
  subtitle,
  categories, // string | string[]
  tags, // string | string[]
  tagMatch = "any", // "any" | "all"
  sort = "newest", // newest | oldest | title-asc | title-desc
  rows = 2,
  
  // Optional hard cap of images shown
  limit,

  showViewAll = true,
  viewAllTo = "/gallery",
  viewAllLabel = "View all",
  enableLightbox = true,
}) {
  const cats = useMemo(() => normalizeArr(categories), [categories]);
  const tgs = useMemo(
    () => normalizeArr(tags).map((t) => String(t).toLowerCase()),
    [tags]
  );

  const filtered = useMemo(() => {
    const categoryFiltered =
      cats.length === 0
        ? galleryData
        : galleryData.filter((img) =>
            cats.includes(img.category || "Uncategorized")
          );

    const tagFiltered =
      tgs.length === 0
        ? categoryFiltered
        : categoryFiltered.filter((img) => {
            const imgTags = (img.tags || []).map((x) => String(x).toLowerCase());
            if (tagMatch === "all") return tgs.every((t) => imgTags.includes(t));
            return tgs.some((t) => imgTags.includes(t));
          });

    return [...tagFiltered].sort(bySort(sort));
  }, [cats, tgs, tagMatch, sort]);

  const gridRef = useRef(null);
  const [cols, setCols] = useState(5);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const measure = () => setCols(readColsFromGrid(el));

    measure();

    // React to container / layout changes
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);

    // React to viewport changes
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Compute how many to show so last row is always full
  const visibleCount = useMemo(() => {
    const total = filtered.length;
    if (total <= 0) return 0;

    const maxByRows =
      typeof rows === "number" && rows > 0 ? rows * cols : total;

    const capped =
      typeof limit === "number" && limit > 0
        ? Math.min(limit, maxByRows, total)
        : Math.min(maxByRows, total);

    let floored = floorToMultiple(capped, cols);

    // If flooring drops to 0 but we do have items, show 1 full row
    if (floored === 0) floored = Math.min(cols, total);

    return floored;
  }, [filtered.length, rows, cols, limit]);

  const visible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );

  // Lightbox
  const [lbIndex, setLbIndex] = useState(null);
  const lbOpen = enableLightbox && lbIndex !== null && filtered[lbIndex];

  useEffect(() => {
    if (!lbOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") setLbIndex(null);
      if (e.key === "ArrowRight" && lbIndex < filtered.length - 1) {
        setLbIndex((p) => (p === null ? p : p + 1));
      }
      if (e.key === "ArrowLeft" && lbIndex > 0) {
        setLbIndex((p) => (p === null ? p : p - 1));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lbOpen, lbIndex, filtered.length]);

  const openLightboxFromVisible = (visibleIdx) => {
    if (!enableLightbox) return;
    const img = visible[visibleIdx];
    if (!img) return;

    const realIdx =
      img.id != null
        ? filtered.findIndex((x) => x.id === img.id)
        : filtered.findIndex((x) => x.src === img.src);

    if (realIdx >= 0) setLbIndex(realIdx);
  };

  return (
    <section className="pg">
      <div className="pg-head">
        <div className="pg-titles">
          <h2 className="pg-title">{title}</h2>
          {subtitle ? <p className="pg-subtitle">{subtitle}</p> : null}
        </div>

        {showViewAll && (
          <NavLink className="pg-viewall" to={viewAllTo}>
            {viewAllLabel}
          </NavLink>
        )}
      </div>

      <div className="pg-grid" ref={gridRef}>
        {visible.map((img, idx) => (
        <div
          key={img.id || `${img.src}-${idx}`}
          className="pg-card"
          onClick={() => openLightboxFromVisible(idx)}
          aria-label={`Open photo: ${img.title || "Photo"}`}
        >
            <div className="pg-media">
              <img src={img.src} alt={img.title || ""} loading="lazy" />
            </div>

            <div className="pg-meta">
              <div className="pg-name">{img.title}</div>

              {(img.category || img.tags?.length) && (
                <div className="pg-submeta">
                  {img.category ? <span>{img.category}</span> : null}
                  {img.tags?.length ? <span className="pg-dot">•</span> : null}
                  {img.tags?.length ? <span>{img.tags[0]}</span> : null}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {enableLightbox && lbIndex !== null && (
        <GalleryModal
          images={filtered}
          index={lbIndex}
          onClose={() => setLbIndex(null)}
          onIndexChange={(i) => setLbIndex(i)}
        />
      )}
    </section>
  );
}

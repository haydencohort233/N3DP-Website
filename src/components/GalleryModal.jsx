// src/components/GalleryModal.jsx
// Gallery lightbox built on the same layout as ProductModal.
// Reuses ProductModal.css — no new stylesheet needed.
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ProductModal.css";

function normalizePhotos(item) {
  if (!item) return [];
  const p = Array.isArray(item.photos) ? item.photos : null;
  if (p && p.length) {
    return p.filter((x) => x?.src).map((x) => ({
      src: x.src, label: x.label || "", title: x.title || "",
      description: x.description || "", tags: Array.isArray(x.tags) ? x.tags : [],
    }));
  }
  const imgs = Array.isArray(item.images) ? item.images : [];
  if (imgs.length && typeof imgs[0] === "string")
    return imgs.map((src) => ({ src, label: "", title: "", description: "", tags: [] }));
  if (imgs.length && typeof imgs[0] === "object")
    return imgs.filter((x) => x?.src).map((x) => ({
      src: x.src, label: x.label || "", title: x.title || "",
      description: x.description || "", tags: Array.isArray(x.tags) ? x.tags : [],
    }));
  if (item.src) return [{ src: item.src, label: "", title: "", description: "", tags: [] }];
  return [];
}

function uniq(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

function clampIndex(i, len) {
  if (len <= 0) return null;
  if (i == null) return null;
  return Math.max(0, Math.min(i, len - 1));
}

export default function GalleryModal({
  // All gallery items (for prev/next navigation)
  images = [],
  // Index of currently open item
  index = null,
  initialPhotoIndex = 0,
  onClose,
  onIndexChange,
  // Tag click support
  allowTagClick = false,
  onTagClick,
  // Quote config
  quoteTo = "/order",
  quoteButtonLabel = "Request This",
  quoteAction = null, // if set, opens this URL directly instead of quote form
}) {
  const navigate = useNavigate();
  const closeBtnRef = useRef(null);

  const len = images.length;
  const safeIndex = useMemo(() => clampIndex(index, len), [index, len]);
  const isOpen = safeIndex !== null && images[safeIndex];
  const item = isOpen ? images[safeIndex] : null;

  const photos = useMemo(() => (item ? normalizePhotos(item) : []), [item]);
  const [photoIdx, setPhotoIdx] = useState(0);

  // Reset photo index when item changes
  useEffect(() => {
    if (!item) return;
    const max = Math.max(0, photos.length - 1);
    setPhotoIdx(Math.max(0, Math.min(Number(initialPhotoIndex) || 0, max)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex, item?.id]);

  const safePhotoIdx = Math.max(0, Math.min(photoIdx, Math.max(0, photos.length - 1)));
  const activePhoto = photos[safePhotoIdx] || null;
  const activeSrc = activePhoto?.src || item?.src || "";

  // Merged display values
  const displayTitle = (activePhoto?.title || "").trim() || item?.title || "";
  const displayDesc = (activePhoto?.description || "").trim() || item?.description || "";
  const baseTags = Array.isArray(item?.tags) ? item.tags : [];
  const displayTags = uniq([
    ...baseTags,
    ...(activePhoto?.label ? [activePhoto.label] : []),
    ...(Array.isArray(activePhoto?.tags) ? activePhoto.tags : []),
  ]);

  const canPrev = isOpen && safeIndex > 0;
  const canNext = isOpen && safeIndex < len - 1;
  const isQuotable = item?.quotable !== false;

  const close = () => onClose?.();

  // Newest-first: RIGHT = older (higher index), LEFT = newer (lower index)
  const goNext = () => { if (canNext) onIndexChange?.(safeIndex + 1); };
  const goPrev = () => { if (canPrev) onIndexChange?.(safeIndex - 1); };

  const goToQuote = () => {
    if (!item || !isQuotable) return;
    if (quoteAction) {
      const a = document.createElement("a");
      a.href = quoteAction;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
      return;
    }
    const params = new URLSearchParams();
    params.set("refId", String(item.id));
    params.set("refPhotoIndex", String(safePhotoIdx));
    close();
    navigate(`${quoteTo}?${params.toString()}`);
  };

  // Lock scroll + keyboard
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") close();
      // Arrow keys navigate between gallery items (newest-first)
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
      // Alt+Arrow navigates photos within item
      if (e.key === "ArrowRight" && e.altKey) setPhotoIdx((i) => Math.min(i + 1, photos.length - 1));
      if (e.key === "ArrowLeft"  && e.altKey) setPhotoIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, safeIndex, len, photos.length]);

  if (!isOpen || !item) return null;

  const date = item.date || "";
  const category = item.category || "Uncategorized";

  return (
    <div
      className="pm-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
      role="dialog"
      aria-modal="true"
      aria-label={displayTitle}
    >
      <div className="pm pm--gallery">

        {/* Close — inside the panel, never hidden by nav */}
        <button ref={closeBtnRef} className="pm-close" onClick={close} aria-label="Close">
          ✕
        </button>

        {/* ── Image side ── */}
        <div className="pm-img-side">
          <div className="pm-img-wrap">
            <img src={activeSrc} alt={displayTitle} className="pm-img" decoding="async" />

            {/* Prev/next ITEM navigation — on image edges */}
            {canPrev && (
              <button className="pm-item-nav pm-item-nav--prev" onClick={goPrev} aria-label="Newer item">
                ‹
              </button>
            )}
            {canNext && (
              <button className="pm-item-nav pm-item-nav--next" onClick={goNext} aria-label="Older item">
                ›
              </button>
            )}

            {/* Thumbnail strip — overlaid at bottom of image, never shifts layout */}
            {photos.length > 1 && (
              <div className="pm-thumbs-overlay">
                <button
                  className="pm-thumbs-prev"
                  onClick={() => setPhotoIdx((i) => Math.max(i - 1, 0))}
                  disabled={safePhotoIdx === 0}
                  aria-label="Previous photo"
                >‹</button>

                <div className="pm-thumbs-inner">
                  {photos.map((p, i) => (
                    <button
                      key={`${p.src}-${i}`}
                      className={`pm-thumb${i === safePhotoIdx ? " pm-thumb--active" : ""}`}
                      onClick={() => setPhotoIdx(i)}
                      aria-label={p.label || `Photo ${i + 1}`}
                      title={p.label || `Photo ${i + 1}`}
                    >
                      <img src={p.src} alt={p.label || ""} loading="lazy" />
                    </button>
                  ))}
                </div>

                <button
                  className="pm-thumbs-next"
                  onClick={() => setPhotoIdx((i) => Math.min(i + 1, photos.length - 1))}
                  disabled={safePhotoIdx === photos.length - 1}
                  aria-label="Next photo"
                >›</button>
              </div>
            )}

            {/* Counter — overlaid bottom right */}
            <div className="pm-gallery-counter">
              {safeIndex + 1} / {len}
            </div>
          </div>
        </div>

        {/* ── Content side ── */}
        <div className="pm-body">
          <div className="pm-top">
            <h2 className="pm-title">{displayTitle}</h2>
          </div>

          <div className="pm-category">{category}</div>

          {activePhoto?.label && (
            <div className="pm-photo-label">Viewing: {activePhoto.label}</div>
          )}

          {date && (
            <div className="pm-gallery-date">
              <span className="pm-gallery-date-label">Date:</span> {date}
            </div>
          )}

          <p className="pm-desc">{displayDesc}</p>

          {/* Tags — capped at 3, clickable if allowTagClick */}
          {displayTags.length > 0 && (
            <div className="pm-tags">
              {displayTags.slice(0, 3).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`pm-tag${allowTagClick ? " pm-tag--clickable" : ""}`}
                  onClick={(e) => {
                    if (!allowTagClick) return;
                    e.stopPropagation();
                    onTagClick?.(tag);
                    close();
                  }}
                  disabled={!allowTagClick}
                >
                  {tag}
                </button>
              ))}
              {displayTags.length > 3 && (
                <span className="pm-tag pm-tag--more">+{displayTags.length - 3}</span>
              )}
            </div>
          )}

          <div className="pm-actions">
            <button
              className={`pm-btn pm-btn--buy${!isQuotable ? " pm-btn--disabled" : ""}`}
              onClick={goToQuote}
              disabled={!isQuotable}
            >
              {isQuotable ? quoteButtonLabel : "Unavailable"}
            </button>
          </div>

          {isQuotable && (
            <p className="pm-note">
              We'll confirm details and pricing within 24 hours.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
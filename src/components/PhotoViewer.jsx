// src/components/PhotoViewer.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Gallery.css";
import "../css/PhotoViewer.css";

function clampIndex(i, len) {
  if (len <= 0) return null;
  if (i == null) return null;
  return Math.max(0, Math.min(i, len - 1));
}

function normalizePhotos(item) {
  // Preferred: photos: [{src,label,title,description,tags}]
  const p = Array.isArray(item?.photos) ? item.photos : null;
  if (p && p.length) {
    return p
      .filter((x) => x && x.src)
      .map((x) => ({
        src: x.src,
        label: x.label || "",
        title: x.title || "",
        description: x.description || "",
        tags: Array.isArray(x.tags) ? x.tags : [],
      }));
  }

  // Back-compat: images: ["..."] or [{src,...}]
  const imgs = Array.isArray(item?.images) ? item.images : [];
  if (imgs.length && typeof imgs[0] === "string") {
    return imgs.map((src) => ({ src, label: "", title: "", description: "", tags: [] }));
  }
  if (imgs.length && typeof imgs[0] === "object") {
    return imgs
      .filter((x) => x && x.src)
      .map((x) => ({
        src: x.src,
        label: x.label || "",
        title: x.title || "",
        description: x.description || "",
        tags: Array.isArray(x.tags) ? x.tags : [],
      }));
  }

  // Fallback: src -> single photo
  if (item?.src) return [{ src: item.src, label: "", title: "", description: "", tags: [] }];

  return [];
}

function uniq(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

export default function PhotoViewer({
  images = [],
  index = null,
  initialPhotoIndex = 0,
  onClose,
  onIndexChange,
  allowTagClick = false,
  onTagClick,
  quoteTo = "/quote",
  quoteButtonLabel = "Get Quote",
}) {
  const navigate = useNavigate();

  const len = images.length;
  const safeIndex = useMemo(() => clampIndex(index, len), [index, len]);
  const isOpen = safeIndex !== null && images[safeIndex];
  const item = isOpen ? images[safeIndex] : null;

  const closeBtnRef = useRef(null);

  const photos = useMemo(() => (item ? normalizePhotos(item) : []), [item]);
  const [angleIndex, setAngleIndex] = useState(0);

  // Reset when changing to a new gallery item
  useEffect(() => {
    if (!item) return;
    const max = Math.max(0, photos.length - 1);
    const initial = Math.max(0, Math.min(Number(initialPhotoIndex) || 0, max));
    setAngleIndex(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex, item, photos.length, initialPhotoIndex]);

  const safeAngleIndex = Math.max(0, Math.min(angleIndex, Math.max(0, photos.length - 1)));
  const activePhoto = photos[safeAngleIndex] || null;
  const activeSrc = activePhoto?.src || item?.src || "";

  const baseTitle = item?.title || "";
  const baseDesc = item?.description || "";
  const baseTags = Array.isArray(item?.tags) ? item.tags : [];

  const displayTitle = (activePhoto?.title || "").trim() || baseTitle;
  const displayDesc = (activePhoto?.description || "").trim() || baseDesc;

  // Tags: base + photo label + photo tags
  const displayTags = uniq([
    ...baseTags,
    ...(activePhoto?.label ? [activePhoto.label] : []),
    ...(Array.isArray(activePhoto?.tags) ? activePhoto.tags : []),
  ]);

  const canPrev = isOpen && safeIndex > 0;
  const canNext = isOpen && safeIndex < len - 1;

  const close = () => onClose?.();
  const nextItem = () => canNext && onIndexChange?.(safeIndex + 1);
  const prevItem = () => canPrev && onIndexChange?.(safeIndex - 1);

  const goToQuote = () => {
    if (!item) return;

    const params = new URLSearchParams();
    params.set("refId", String(item.id));
    params.set("refPhotoIndex", String(safeAngleIndex));

    close();
    navigate(`${quoteTo}?${params.toString()}`);
  };

  // Keyboard + scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus?.();

    const handleKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") nextItem();
      if (e.key === "ArrowLeft") prevItem();
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, safeIndex, len]);

  if (!isOpen || !item) return null;

  const date = item?.date || "";
  const category = item?.category || "Uncategorized";

  return (
    <div className="lightbox" onClick={close} role="dialog" aria-modal="true">
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-counter" style={{ textAlign: "center" }}>
          Photo {safeIndex + 1} of {len}
        </div>

        <div className="lightbox-media">
          <img src={activeSrc} alt={displayTitle} decoding="async" />
          <button
            type="button"
            className="lightbox-cta lightbox-cta--overlay"
            onClick={goToQuote}
          >
            {quoteButtonLabel}
          </button>
        </div>

        <h2 style={{ textAlign: "center" }}>{displayTitle}</h2>

        {/* One strip: photo 1 / photo 2 / photo 3 (selected = current) */}
        {photos.length > 1 && (
          <div className="pv-strip" aria-label="More photos">
            {photos.map((p, i) => (
              <button
                key={`${p.src}-${i}`}
                type="button"
                className={`pv-chip ${i === safeAngleIndex ? "is-selected" : ""}`}
                onClick={() => setAngleIndex(i)}
                aria-label={p.label ? `Select ${p.label}` : `View photo ${i + 1}`}
                title={p.label || `Photo ${i + 1}`}
              >
                <img src={p.src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        <div className="lightbox-info">
          <div className="lightbox-info-left">
            <h3 className="lightbox-section-title">Details</h3>

            {date ? (
              <p style={{ margin: "4px 0" }}>
                <span className="label">Upload Date:</span> {date}
              </p>
            ) : null}

            <p style={{ margin: "4px 0" }}>
              <span className="label">Category:</span> {category}
            </p>

            {displayTags.length > 0 && (
              <div className="tags">
                {displayTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={`tag-chip ${allowTagClick ? "tag-chip-clickable" : ""}`}
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
              </div>
            )}
          </div>

          <div className="lightbox-info-right">
            <h3 className="lightbox-section-title">Description</h3>
            <div className="lightbox-description">{displayDesc}</div>
          </div>
        </div>

        {canPrev && (
          <button className="lightbox-prev" onClick={prevItem} aria-label="Previous item">
            ⟵
          </button>
        )}

        {canNext && (
          <button className="lightbox-next" onClick={nextItem} aria-label="Next item">
            ⟶
          </button>
        )}

        <button ref={closeBtnRef} className="lightbox-close" onClick={close} aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  );
}

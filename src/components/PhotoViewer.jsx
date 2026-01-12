/* Reusable photoviewer for when any photo is opened
* Used in "PhotoGallery.jsx" and in "Gallery.jsx" */

import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Gallery.css";

function clampIndex(i, len) {
  if (len <= 0) return null;
  if (i == null) return null;
  return Math.max(0, Math.min(i, len - 1));
}

export default function PhotoViewer({
  images = [],
  index = null,
  onClose,
  onIndexChange,
  allowTagClick = false,
  onTagClick,
  quoteTo = "/contact",
  quoteButtonLabel = "Get Quote"
}) {
  const navigate = useNavigate();

  const len = images.length;
  const safeIndex = useMemo(() => clampIndex(index, len), [index, len]);
  const isOpen = safeIndex !== null && images[safeIndex];
  const img = isOpen ? images[safeIndex] : null;

  const closeBtnRef = useRef(null);

  const canPrev = isOpen && safeIndex > 0;
  const canNext = isOpen && safeIndex < len - 1;

  const close = () => onClose?.();
  const next = () => {
    if (!canNext) return;
    onIndexChange?.(safeIndex + 1);
  };
  const prev = () => {
    if (!canPrev) return;
    onIndexChange?.(safeIndex - 1);
  };

  const goToQuote = () => {
    if (!img) return;

    const refId = img.id ?? "";
    const refName = img.title ?? "";
    const refSrc = img.src ?? "";

    const params = new URLSearchParams();
    if (refId !== "") params.set("refId", String(refId));
    if (refName) params.set("refName", refName);
    if (refSrc) params.set("refSrc", refSrc);

    // Close the viewer first (prevents overlay flashing on next page)
    close();

    navigate(`${quoteTo}?${params.toString()}`);
  };

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus?.();

    const handleKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, safeIndex, len]);

  if (!isOpen) return null;

  const title = img.title || "";
  const date = img.date || "";
  const category = img.category || "Uncategorized";
  const description = img.description || "";
  const tags = Array.isArray(img.tags) ? img.tags : [];

  return (
    <div className="lightbox" onClick={close} role="dialog" aria-modal="true">
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-counter">
          Photo {safeIndex + 1} of {len}
        </div>

        <div className="lightbox-media">
          <img src={img.src} alt={title} loading="lazy" />
          <button type="button" className="lightbox-cta lightbox-cta--overlay" onClick={goToQuote}>
            {quoteButtonLabel}
          </button>
        </div>

        <h2>{title}</h2>

        <div className="lightbox-info">
          <div className="lightbox-info-left">
            <h3 className="lightbox-section-title">Details</h3>

            {date ? (
              <p>
                <span className="label">Date:</span> {date}
              </p>
            ) : null}

            <p>
              <span className="label">Category:</span> {category}
            </p>

            {tags.length > 0 && (
              <div className="tags">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`tag-chip ${allowTagClick ? "tag-chip-clickable" : ""}`}
                    onClick={(e) => {
                      if (!allowTagClick) return;
                      e.stopPropagation();
                      onTagClick?.(tag);
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="lightbox-info-right">
            <h3 className="lightbox-section-title">Description</h3>
            <div className="lightbox-description">{description}</div>
          </div>
        </div>

        {canPrev && (
          <button className="lightbox-prev" onClick={prev} aria-label="Previous">
            ⟵
          </button>
        )}

        {canNext && (
          <button className="lightbox-next" onClick={next} aria-label="Next">
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

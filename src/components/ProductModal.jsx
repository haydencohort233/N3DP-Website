// src/components/ProductModal.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ProductModal.css";

function getPhotos(product) {
  if (Array.isArray(product.photos) && product.photos.length > 0) {
    return product.photos.filter((p) => p?.src);
  }
  return product.src ? [{ src: product.src, label: "" }] : [];
}

export default function ProductModal({ product, onClose }) {
  const navigate = useNavigate();
  const closeBtnRef = useRef(null);
  const photos = getPhotos(product);
  const [photoIdx, setPhotoIdx] = useState(0);

  const safeIdx = Math.max(0, Math.min(photoIdx, photos.length - 1));
  const activePhoto = photos[safeIdx] || { src: product.src, label: "" };

  // Lock scroll, focus close button
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    try { closeBtnRef.current?.focus(); } catch {}
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ESC + arrow keys
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setPhotoIdx((i) => Math.min(i + 1, photos.length - 1));
      if (e.key === "ArrowLeft")  setPhotoIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, photos.length]);

    const handleBuyNow = () => {
    const a = document.createElement("a");
    a.href = product.buyUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
    };

  const handleCustomize = () => {
    onClose();
    navigate(`/order?refId=${product.id}`);
  };

  const { title, description, price, badge, inStock = true, tags = [], category } = product;

  return (
    <div
      className="pm-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="pm">
        {/* Close */}
        <button ref={closeBtnRef} className="pm-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Image side */}
        <div className="pm-img-side">
          <div className="pm-img-wrap">
            <img src={activePhoto.src} alt={activePhoto.label || title} className="pm-img" />

            {badge && (
              <span className={`pm-badge pm-badge--${badge.toLowerCase().replace(/\s+/g, "-")}`}>
                {badge}
              </span>
            )}

            {!inStock && (
              <div className="pm-oos-overlay"><span>Out of Stock</span></div>
            )}

            {/* Prev / Next arrows — only when multiple photos */}
            {photos.length > 1 && safeIdx > 0 && (
              <button
                className="pm-img-nav pm-img-nav--prev"
                onClick={() => setPhotoIdx((i) => i - 1)}
                aria-label="Previous photo"
              >‹</button>
            )}
            {photos.length > 1 && safeIdx < photos.length - 1 && (
              <button
                className="pm-img-nav pm-img-nav--next"
                onClick={() => setPhotoIdx((i) => i + 1)}
                aria-label="Next photo"
              >›</button>
            )}
          </div>

          {/* Thumbnail strip — only when multiple photos */}
          {photos.length > 1 && (
            <div className="pm-thumbs">
              {photos.map((p, i) => (
                <button
                  key={`${p.src}-${i}`}
                  className={`pm-thumb${i === safeIdx ? " pm-thumb--active" : ""}`}
                  onClick={() => setPhotoIdx(i)}
                  aria-label={p.label || `Photo ${i + 1}`}
                  title={p.label || `Photo ${i + 1}`}
                >
                  <img src={p.src} alt={p.label || ""} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content side */}
        <div className="pm-body">
          <div className="pm-top">
            <h2 className="pm-title">{title}</h2>
            <span className="pm-price">${price.toFixed(2)}</span>
          </div>

          {category && <div className="pm-category">{category}</div>}

          {activePhoto.label && (
            <div className="pm-photo-label">Viewing: {activePhoto.label}</div>
          )}

          <p className="pm-desc">{description}</p>

          {tags.length > 0 && (
            <div className="pm-tags">
              {tags.map((t) => (
                <span key={t} className="pm-tag">{t}</span>
              ))}
            </div>
          )}

          <div className="pm-actions">
            <button
              className={`pm-btn pm-btn--buy${!inStock ? " pm-btn--disabled" : ""}`}
              onClick={handleBuyNow}
              disabled={!inStock}
            >
              {inStock ? "Buy Now" : "Out of Stock"}
            </button>
            <button className="pm-btn pm-btn--customize" onClick={handleCustomize}>
              Customize This
            </button>
          </div>

          <p className="pm-note">
            Pricing confirmed at checkout. Want changes?{" "}
            <button className="pm-note-link" onClick={handleCustomize}>
              Request a custom quote.
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
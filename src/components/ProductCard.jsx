// src/components/ProductCard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductModal from "./ProductModal";
import "../css/ProductCard.css";

const DEFAULT_DESC_LINES = { mobile: 0, tablet: 2, desktop: 3 };

export default function ProductCard({
  product,
  descLines = DEFAULT_DESC_LINES,
}) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const { title, description, price, buyUrl, src, badge, inStock = true } = product;
  const lines = { ...DEFAULT_DESC_LINES, ...descLines };

  const descStyle = {
    "--desc-lines-tablet":  String(lines.tablet),
    "--desc-lines-desktop": String(lines.desktop),
  };

    const handleBuyNow = (e) => {
        e.stopPropagation();
        if (!inStock) return;
        const a = document.createElement("a");
        a.href = buyUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.click();
    };

  const handleCustomize = (e) => {
    e.stopPropagation();
    navigate(`/order?refId=${product.id}`);
  };

  return (
    <>
      <article
        className={`pc${!inStock ? " pc--oos" : ""}`}
        onClick={() => setModalOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${title}`}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setModalOpen(true); }}
      >
        {/* Image */}
        <div className="pc-img-wrap">
          <img src={src} alt={title} loading="lazy" className="pc-img" />

          {/* Badge — top left */}
          {badge && (
            <span className={`pc-badge pc-badge--${badge.toLowerCase().replace(/\s+/g, "-")}`}>
              {badge}
            </span>
          )}

          {/* Price bar — bottom of image */}
          <div className="pc-price-bar">${price.toFixed(2)}</div>

          {/* OOS overlay — on top of everything */}
          {!inStock && (
            <div className="pc-oos-overlay">
              <span>Out of Stock</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="pc-body">
          <h3 className="pc-title">{title}</h3>

          <p className="pc-desc" style={descStyle}>
            {description}
          </p>

          <div className="pc-actions">
            <button
              className={`pc-btn pc-btn--buy${!inStock ? " pc-btn--disabled" : ""}`}
              onClick={handleBuyNow}
              disabled={!inStock}
              aria-disabled={!inStock}
            >
              {inStock ? "Buy Now" : "Out of Stock"}
            </button>
            <button className="pc-btn pc-btn--customize" onClick={handleCustomize}>
              Customize This
            </button>
          </div>
        </div>
      </article>

      {modalOpen && (
        <ProductModal product={product} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
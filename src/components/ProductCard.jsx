// src/components/ProductCard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GalleryModal from "./GalleryModal";
import "../css/ProductCard.css";

const DEFAULT_DESC_LINES = { mobile: 0, tablet: 2, desktop: 3 };

export default function ProductCard({
  product,
  descLines = DEFAULT_DESC_LINES,
  forceOpen = false,
  onModalClose,
  onModalOpen,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const { title, description, price, buyUrl, src, badge, inStock = true } = product;
  const lines = { ...DEFAULT_DESC_LINES, ...descLines };
  const descStyle = {
    "--desc-lines-tablet":  String(lines.tablet),
    "--desc-lines-desktop": String(lines.desktop),
  };

    useEffect(() => {
    if (forceOpen) setModalOpen(true);
  }, [forceOpen]);

  const handleOpen = () => {
    setModalOpen(true);
    onModalOpen?.();
  };

  const handleClose = () => {
    setModalOpen(false);
    onModalClose?.();
  };

  // Shape product into gallery item format
  const asGalleryItem = {
    id: product.id,
    title,
    description,
    src,
    photos: Array.isArray(product.photos) && product.photos.length
      ? product.photos
      : [{ src, label: "" }],
    category: product.category || "",
    tags: product.tags || [],
    date: null,
    quotable: inStock,
    _buyUrl: buyUrl,
    _price: price,
  };

  return (
    <>
        <article
        className={`pc${!inStock ? " pc--oos" : ""}`}
        onClick={() => handleOpen(true)}
        aria-label={`View details for ${title}`}
        >
        <div className="pc-img-wrap">
          <img src={src} alt={title} loading="lazy" className="pc-img" />
          {badge && (
            <span className={`pc-badge pc-badge--${badge.toLowerCase().replace(/\s+/g, "-")}`}>
              {badge}
            </span>
          )}
          <div className="pc-price-bar">${price.toFixed(2)}</div>
          {!inStock && (
            <div className="pc-oos-overlay"><span>Out of Stock</span></div>
          )}
        </div>

        <div className="pc-body">
          <h3 className="pc-title">{title}</h3>
          <p className="pc-desc" style={descStyle}>{description}</p>
          <div className="pc-actions">
            <button
              className={`pc-btn pc-btn--buy${!inStock ? " pc-btn--disabled" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!inStock) return;
                const a = document.createElement("a");
                a.href = buyUrl;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.click();
              }}
              disabled={!inStock}
            >
              {inStock ? "Buy Now" : "Out of Stock"}
            </button>
            <button
              className="pc-btn pc-btn--customize"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/order?refId=${product.id}`;
              }}
            >
              Customize This
            </button>
          </div>
        </div>
      </article>

      {modalOpen && (
        <GalleryModal
          images={[asGalleryItem]}
          index={0}
          onClose={() => handleClose(true)}
          onIndexChange={() => {}}
          quoteButtonLabel={inStock ? "Buy Now" : "Out of Stock"}
          quoteAction={inStock ? buyUrl : null}
        />
      )}
    </>
  );
}
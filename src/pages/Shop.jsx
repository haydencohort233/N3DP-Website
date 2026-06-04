import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SEO from "../components/SEO";
import ProductCard from "../components/ProductCard";
import useShopProducts from "../hooks/useShopProducts";
import config from "../config";
import "../css/Shop.css";

const DESC_LINES = { mobile: 0, tablet: 2, desktop: 4 };
const COLUMNS    = { mobile: 2, tablet: 3, desktop: 4 };

export function toSlug(str = "") {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function Shop() {
  const products = useShopProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openProductId, setOpenProductId] = useState(null);
  const [itemNotFound, setItemNotFound] = useState(false);

useEffect(() => {
  const itemParam = searchParams.get("item");
  if (!itemParam || !products.length) return;
  const match = products.find(p => toSlug(p.title) === toSlug(itemParam));
  if (match) {
    setOpenProductId(match.id);
  } else {
    setItemNotFound(true);
    setSearchParams({}, { replace: true }); // clean the bad param from URL
  }
}, [products]);

  // Keep URL in sync with open modal
  useEffect(() => {
    if (openProductId) {
      const product = products.find(p => p.id === openProductId);
      if (product) {
        setSearchParams({ item: toSlug(product.title) }, { replace: true });
      }
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [openProductId]);

  const gridStyle = {
    "--shop-cols-mobile":  COLUMNS.mobile,
    "--shop-cols-tablet":  COLUMNS.tablet,
    "--shop-cols-desktop": COLUMNS.desktop,
  };

  const openProduct = products.find(p => p.id === openProductId) ?? null;

  return (
    <main className="shop-page">
    <SEO
        title={openProduct ? `${openProduct.title} — ${config.site.name}` : `Shop — ${config.site.name}`}
        description={openProduct ? openProduct.description : "Order 3D printed items directly from our Nashville shop. Fixed prices, ships fast."}
        image={openProduct ? (openProduct.src ?? openProduct.photos?.[0]?.src) : undefined}
    />
      <header className="shop-hero">
        <h1 className="shop-title">Shop</h1>
        <p className="shop-subtitle">
          Ready-to-order prints. Want something custom?{" "}
          <a href="/order">Get a quote.</a>
        </p>
      </header>
        {itemNotFound && (
            <div className="shop-not-found">
            <span>That item wasn't found — it may have been removed or renamed.</span>
            <button onClick={() => setItemNotFound(false)}>✕</button>
            </div>
        )}
      <section className="shop-grid-wrap">
        {products.length === 0 ? (
          <p className="shop-empty">No products available right now. Check back soon!</p>
        ) : (
          <div className="shop-grid" style={gridStyle}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                descLines={DESC_LINES}
                forceOpen={openProductId === product.id}
                onModalClose={() => setOpenProductId(null)}
                onModalOpen={() => setOpenProductId(product.id)}
              />
            ))}
          </div>
        )}
      </section>
      <section className="shop-cta">
        <div className="shop-cta-inner">
          <h2 className="shop-cta-title">Don't see what you need?</h2>
          <p className="shop-cta-sub">
            We print custom parts, prototypes, and one-of-a-kind pieces. Describe what you need and we'll make it.
          </p>
          <a className="shop-cta-btn" href="/order">Request a Custom Order</a>
        </div>
      </section>
    </main>
  );
}
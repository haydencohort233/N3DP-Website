// src/pages/Shop.jsx
// ---------------------------------------------------------------------------
// Props you can tweak directly here:
//   descLines  — { mobile, tablet, desktop } line clamp per breakpoint
//   columns    — { mobile, tablet, desktop } grid columns per breakpoint
// ---------------------------------------------------------------------------
import SEO from "../components/SEO";
import ProductCard from "../components/ProductCard";
import useShopProducts from "../hooks/useShopProducts";
import config from "../config";
import "../css/Shop.css";

const DESC_LINES = { mobile: 0, tablet: 2, desktop: 4 };
const COLUMNS    = { mobile: 2, tablet: 3, desktop: 4 };

export default function Shop() {
  const products = useShopProducts();

  const gridStyle = {
    "--shop-cols-mobile":  COLUMNS.mobile,
    "--shop-cols-tablet":  COLUMNS.tablet,
    "--shop-cols-desktop": COLUMNS.desktop,
  };

  return (
    <main className="shop-page">
      <SEO
        title={`Shop — ${config.site.name}`}
        description="Order 3D printed items directly from our Nashville shop. Fixed prices, ships fast."
      />

      <header className="shop-hero">
        <h1 className="shop-title">Shop</h1>
        <p className="shop-subtitle">
          Ready-to-order prints.
          Want something custom?{" "}
          <a href="/order">Get a quote.</a>
        </p>
      </header>

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
          <a className="shop-cta-btn" href="/order">
            Request a Custom Order
          </a>
        </div>
      </section>
    </main>
  );
}
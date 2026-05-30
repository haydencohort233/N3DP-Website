// src/pages/Home.jsx
// ---------------------------------------------------------------------------
// Shop section config — tweak these constants to control display:
//   HOME_LIMIT      — max products shown on home page
//   HOME_DESC_LINES — description line clamp per breakpoint
//   HOME_COLUMNS    — grid columns per breakpoint
// ---------------------------------------------------------------------------
import { NavLink } from "react-router-dom";
import SEO from "../components/SEO";
import config from "../config";
import PhotoGallery from "../components/PhotoGallery";
import ProductCard from "../components/ProductCard";
import useShopProducts from "../hooks/useShopProducts";
import "../css/Home.css";

const HOME_LIMIT      = 4;
const HOME_DESC_LINES = { mobile: 0, tablet: 1, desktop: 2 };
const HOME_COLUMNS    = { mobile: 2, tablet: 2, desktop: 4 };

export default function Home() {
  const { site } = config;
  const featuredProducts = useShopProducts({ limit: HOME_LIMIT });

  const gridStyle = {
    "--home-cols-mobile":  HOME_COLUMNS.mobile,
    "--home-cols-tablet":  HOME_COLUMNS.tablet,
    "--home-cols-desktop": HOME_COLUMNS.desktop,
  };

  return (
    <main className="home" id="about">
      <SEO
        title={site.name}
        description="3D printing and CAD design services for prototypes and custom parts in Nashville."
        image="/assets/logo.png"
      />

      {/* ── Shop Section ── */}
      {featuredProducts.length > 0 && (
        <section className="home-shop">
          <div className="home-section-head">
            <div>
              <h2 className="home-section-title">Shop</h2>
              <p className="home-section-sub">Ready to order — fixed prices</p>
            </div>
            <NavLink className="home-viewall" to="/shop">
              View all →
            </NavLink>
          </div>

          <div className="home-products-grid" style={gridStyle}>
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                descLines={HOME_DESC_LINES}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Gallery Section ── */}
      <section className="home-gallery">
        <PhotoGallery
          title="Print Gallery"
          subtitle="Browse all our recent and past work"
          sort="newest"
          rows={2}
          showViewAll
          viewAllTo="/gallery"
          viewAllLabel="View More"
          enableLightbox
        />
      </section>
    </main>
  );
}
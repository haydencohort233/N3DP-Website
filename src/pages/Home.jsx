// src/pages/Home.jsx
import SEO from "../components/SEO";
import seoConfig from "../config/Seo";
import config from "../config";
import PhotoGallery from "../components/PhotoGallery";
import "../css/Home.css";

export default function Home() {
  const { site } = config;

  return (
    <main className="home" id="about">
      <SEO
        title={`Home — ${site.name}`}
        description="3D printing and CAD/design services for prototypes and custom parts in Nashville."
        keywords={seoConfig.keywords}
      />

      {/* Featured gallery */}
      <PhotoGallery
        title="Featured Prints"
        subtitle="Latest from the shop"
        sort="newest"
        rows={2}
        showViewAll
        viewAllTo="/gallery"
        viewAllLabel="View Gallery"
        enableLightbox
      />
    </main>
  );
}

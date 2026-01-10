// src/pages/Home.jsx
import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import Button from "../components/Button";
import SEO from "../components/SEO";
import seoConfig from "../config/Seo";
import config from "../config";
import PhotoGallery from "../components/PhotoGallery";
import "../css/Home.css";

function buildSocialLinks(social = {}) {
  const facebook = social.facebook
    ? social.facebook.startsWith("http")
      ? social.facebook
      : `https://www.facebook.com/${social.facebook}`
    : null;

  const instagram = social.instagram
    ? social.instagram.startsWith("http")
      ? social.instagram
      : `https://www.instagram.com/${social.instagram}`
    : null;

  // Etsy can be either "shopname" or a full URL
  const etsy = social.etsy
    ? social.etsy.startsWith("http")
      ? social.etsy
      : social.etsy.includes("etsy.com")
      ? `https://${social.etsy.replace(/^https?:\/\//, "")}`
      : `https://www.etsy.com/shop/${social.etsy}`
    : null;

  return { facebook, instagram, etsy };
}

export default function Home() {
  const { site, social } = config;
  const { facebook, instagram, etsy } = useMemo(
    () => buildSocialLinks(social),
    [social]
  );

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

      {/* Social media */}
      <section className="home-social-inline" aria-label="Find us on social media">
        <h2 className="home-social-title">Find us on social media</h2>

        <div className="home-social-links">
          {instagram && (
            <a
              className="home-social-link"
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Instagram"
            >
              <img
                className="home-social-icon-img"
                src="/assets/social/instagram.png"
                alt=""
                aria-hidden="true"
              />
              <span className="home-social-text">Nashville3DPrints</span>
            </a>
          )}

          {etsy && (
            <a
              className="home-social-link"
              href={etsy}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Etsy"
            >
              <img
                className="home-social-icon-img"
                src="/assets/social/etsy.png"
                alt=""
                aria-hidden="true"
              />
              <span className="home-social-text">Nashville 3D Prints</span>
            </a>
          )}

          {facebook && (
            <a
              className="home-social-link"
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Facebook"
            >
              <img
                className="home-social-icon-img"
                src="/assets/social/facebook.png"
                alt=""
                aria-hidden="true"
              />
              <span className="home-social-text">Nashville 3D Prints</span>
            </a>
          )}
        </div>
      </section>
    </main>
  );
}

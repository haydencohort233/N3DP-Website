// src/components/Footer.jsx
import { useMemo, useState, useEffect } from "react";
import "../css/Footer.css";
import config from "../config";

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

  const etsy = social.etsy
    ? social.etsy.startsWith("http")
      ? social.etsy
      : social.etsy.includes("etsy.com")
      ? `https://${social.etsy.replace(/^https?:\/\//, "")}`
      : `https://www.etsy.com/shop/${social.etsy}`
    : null;

  return { facebook, instagram, etsy };
}

export default function Footer() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 200);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { facebook, instagram, etsy } = useMemo(
    () => buildSocialLinks(config?.social),
    []
  );

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="footer">
      <div className="footer-content">
                <div className="footer-right" aria-label="Social links">
          {instagram && (
            <a
              className="footer-social-link"
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Instagram"
            >
              <img
                className="footer-social-icon"
                src="/assets/social/instagram.png"
                alt="Instagram"
              />
              <span className="footer-social-text">Nashville3DPrints</span>
            </a>
          )}

          {etsy && (
            <a
              className="footer-social-link"
              href={etsy}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Etsy"
            >
              <img
                className="footer-social-icon"
                src="/assets/social/etsy.png"
                alt="Etsy"
              />
              <span className="footer-social-text">Nashville 3D Prints</span>
            </a>
          )}

          {facebook && (
            <a
              className="footer-social-link"
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Facebook"
            >
              <img
                className="footer-social-icon"
                src="/assets/social/facebook.png"
                alt="Facebook"
              />
              <span className="footer-social-text">Nashville 3D Prints</span>
            </a>
          )}
        </div>
      </div>
        <div className="footer-left">
          <p>© {config.site.year} {config.site.name} — All Rights Reserved</p>
          <p>
            Contact:{" "}
            <a href={`mailto:${config.site.email}`}>{config.site.email}</a>
          </p>
        </div>

      {showTop && (
        <button className="scroll-top" onClick={scrollToTop} aria-label="Scroll to top">
          ↑ Top
        </button>
      )}
    </footer>
  );
}

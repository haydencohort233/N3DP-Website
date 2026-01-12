import SEO from "../components/SEO";
import seoConfig from "../config/Seo";
import config from "../config";
import "../css/About.css";

export default function About() {
  const siteName = config?.site?.name || "Nashville 3D Prints";
  const { site } = config;

  // Placeholder (you said use this for now)
  const highlightImg = "/assets/gallery/photo5.png";
  const highlightImg2 = "/assets/gallery/photo10.png";

  return (
    <main className="about-page">
      <SEO
        title={`About — ${siteName}`}
        description="A little background on Nashville3DPrints and the kind of projects we take on."
        keywords={seoConfig.keywords}
      />

      <header className="about-hero">
        <h1>About</h1>
      </header>

      <section className="about-owner" aria-label="Owner">
        <div className="owner-card owner-card--simple">
          <div className="owner-kicker">Owner - Hayden Janes</div>

          <p className="owner-text">
            Nashville3DPrints started in <strong>June 2020</strong> during the pandemic selling things like door openers
            and straw toppers/covers. We grew to serve over 1,000 customers and over 35 businesses!
          <br />
          <br />
            We do Prototyping, 3D Printing Requests and CAD Work. We've also taught small classes on the
            basics of 3D Printing.
          </p>

          <p className="owner-text">
            The shop was called <strong>Valley3DPrints</strong> up until <strong>January 2026</strong>,
            when it became <strong>Nashville3DPrints</strong>.
          </p>
        </div>
      </section>

      <section className="about-proof" aria-label="Highlights">
        <div className="about-section-head">
          <h2>Highlights</h2>
          <p>Two projects I’m especially happy with.</p>
        </div>

        <div className="proof-grid">
          <article className="proof-card">
            <div className="proof-media">
              <img src={highlightImg} alt="Project highlight placeholder" loading="lazy" />
            </div>
            <div className="proof-title">The McHenry Museum — Horse Carousel</div>
            <div className="proof-text">
              They had a discontinued gear that broke on them and we had to recreate it.
              Thanks to this one gear their carousel in their exhibit can spin freely again.
            </div>
          </article>

          <article className="proof-card">
            <div className="proof-media">
              <img src={highlightImg2} alt="Project highlight placeholder" loading="lazy" />
            </div>
            <div className="proof-title">TheSoiCo Candle Company — Wick Holders</div>
            <div className="proof-text">
              Designed and printed candle wick holders for consistent placement and easier assembly.
              Simple part, big time-saver.
            </div>
          </article>
        </div>
      </section>

      <section className="about-bottom" aria-label="Next steps">
        <div className="bottom-card">
          <h2>Want something made?</h2>
          <p>
            Send a photo, rough dimensions, quantity, and when you need it. I’ll reply with options.
            Contact us and submit some information -- or give us a call {site.phone}
          </p>
          <div className="bottom-actions">
            <a className="about-cta" href="/contact">Get a Quote</a>
            <a className="about-link" href="/gallery">Gallery</a>
          </div>
        </div>
      </section>
    </main>
  );
}

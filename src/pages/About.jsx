import SEO from "../components/SEO";
import config from "../config";
import "../css/About.css";

export default function About() {
  const { site } = config;
  const highlightImg  = "/assets/gallery/photo5.png";
  const highlightImg2 = "/assets/gallery/photo10.png";

  return (
    <main className="about-page">
      <SEO
        title={`About — ${config.site.name}`}
        description="Nashville-based 3D printing and CAD design. Over 1,000 customers served since 2020."
      />

      {/* ── Hero ── */}
      <header className="about-hero">
        <p className="about-hero-kicker">Nashville, TN · Est. 2020</p>
        <h1>Made in Nashville,<br />printed for everyone.</h1>
        <p className="about-hero-sub">
          From a pandemic side project to a full 3D printing service — prototypes,
          custom parts, and one-of-a-kind pieces, made locally.
        </p>
      </header>

      {/* ── Stats ── */}
      <section className="about-stats" aria-label="By the numbers">
        <div className="about-stat">
          <span className="about-stat-num">1,500+</span>
          <span className="about-stat-label">Customers served</span>
        </div>
        <div className="about-stat">
          <span className="about-stat-num">35+</span>
          <span className="about-stat-label">Businesses helped</span>
        </div>
        <div className="about-stat">
          <span className="about-stat-num">6+</span>
          <span className="about-stat-label">Years printing</span>
        </div>
      </section>

      {/* ── Owner ── */}
      <section className="about-owner" aria-label="Owner">
        <div className="owner-card">
          <div className="owner-kicker">Owner — Hayden Janes</div>
          <p className="owner-text">
            Nashville3DPrints started in <strong>June 2020</strong> during the pandemic,
            selling door openers and straw covers. It grew into a full service covering
            prototyping, custom print requests, and CAD work. We've even taught small
            classes on the basics of 3D printing.
          </p>
          <p className="owner-text">
            The shop was known as <strong>Valley3DPrints</strong> until <strong>January 2026</strong>,
            when we rebranded as <strong>Nashville3DPrints</strong> to better reflect where we operate.
          </p>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="about-proof" aria-label="Project highlights">
        <div className="about-section-head">
          <h2>Notable Projects</h2>
          <p>A couple of projects we're especially proud of.</p>
        </div>
        <div className="proof-grid">
          <article className="proof-card">
            <div className="proof-media">
              <img src={highlightImg} alt="McHenry Museum horse carousel gear" loading="lazy" />
            </div>
            <div className="proof-body">
              <div className="proof-title">The McHenry Museum — Horse Carousel</div>
              <p className="proof-text">
                A discontinued gear broke on their exhibit carousel. We reverse-engineered
                and printed a replacement — the carousel spins freely again.
              </p>
            </div>
          </article>
          <article className="proof-card">
            <div className="proof-media">
              <img src={highlightImg2} alt="Candle wick holders for TheSoiCo" loading="lazy" />
            </div>
            <div className="proof-body">
              <div className="proof-title">TheSoiCo Candle Co. — Wick Holders</div>
              <p className="proof-text">
                Designed and printed custom wick holders for consistent placement
                during candle assembly. Simple part, significant time saved.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-bottom" aria-label="Get started">
        <div className="bottom-card">
          <h2>Want something made?</h2>
          <p>
            Send a photo, rough dimensions, and when you need it.
            We'll come back with options — usually within 1–2 days.
          </p>
          <div className="bottom-actions">
            <a className="about-cta" href="/order">Get a Quote</a>
            <a className="about-link" href="/gallery">View Gallery</a>
          </div>
        </div>
      </section>

    </main>
  );
}
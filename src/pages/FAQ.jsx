import { useState, useMemo, useEffect } from "react";
import { NavLink } from "react-router-dom";
import SEO from "../components/SEO";
import faqData from "../config/faqData";
import config from "../config";
import "../css/FAQ.css";

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openId, setOpenId] = useState(null);

  const sitePhone = config?.site?.phone || "(209) 202-3221";
  const siteEmail = config?.site?.email || "nashville3dprinting@gmail.com";
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredData = useMemo(() => {
    if (!normalizedSearch) return faqData;
    return faqData.filter(item =>
      item.question.toLowerCase().includes(normalizedSearch) ||
      item.answer.toLowerCase().includes(normalizedSearch)
    );
  }, [normalizedSearch]);

  // Deep-link support: /faq#some-id
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const match = faqData.find(item => item.id === hash);
    if (!match) return;
    setOpenId(hash);
    setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, []);

  const toggleQuestion = (id) => {
    setOpenId(prev => {
      const next = prev === id ? null : id;
      const base = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, "", next ? `${base}#${next}` : base);
      return next;
    });
  };

  const renderAnswer = (html) => {
    const safe = String(html || "")
      .replaceAll("{{PHONE}}", sitePhone)
      .replaceAll("{{EMAIL}}", siteEmail);
    return <div className="faq-answer" dangerouslySetInnerHTML={{ __html: safe }} />;
  };

  return (
    <main className="faq-page">
      <SEO
        title={`FAQ — ${config.site.name}`}
        description="Common questions about pricing, turnaround, materials, and ordering from Nashville 3D Prints."
      />

      <header className="faq-header">
        <h1>Frequently Asked Questions</h1>
        <p>Quick answers to the most common questions.</p>
        <div className="faq-search-wrapper">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setOpenId(null); }}
          />
        </div>
      </header>

      {normalizedSearch && filteredData.length === 0 && (
        <p className="faq-no-results">No questions matched. Try a different keyword.</p>
      )}

      <section className="faq-list">
        {filteredData.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} id={item.id} className={`faq-item${isOpen ? " faq-item--open" : ""}`}>
              <button
                className="faq-question"
                onClick={() => toggleQuestion(item.id)}
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <span className={`faq-question-chevron${isOpen ? " open" : ""}`}>▾</span>
              </button>
              {isOpen && (
                <div className="faq-answer-wrap">
                  {renderAnswer(item.answer)}
                  {item.cta && (
                    <div className="faq-answer-actions">
                      <NavLink className="faq-cta" to="/order">Get a Quote</NavLink>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="faq-contact">
        <h2>Still have questions?</h2>
        <p>Send us what you have — a photo, rough dimensions, anything — and we'll take it from there.</p>
        <NavLink className="faq-contact-button" to="/order">Contact Us</NavLink>
      </section>
    </main>
  );
}
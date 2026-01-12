import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../css/NavBar.css";
import ThemeToggle from "./ThemeToggle";
import config from "../config";
import BusinessHours from "./BusinessHours";

const LINKS = config.nav.links;

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const dropdownRef = useRef(null);
  const toggleRef = useRef(null);
  const innerRef = useRef(null);
  const brandRef = useRef(null);
  const measureRef = useRef(null);

  // Resize observer to recalc visible links
  useEffect(() => {
    const ro = new ResizeObserver(() => measure());
    if (innerRef.current) ro.observe(innerRef.current);
    if (measureRef.current) ro.observe(measureRef.current);
    window.addEventListener("orientationchange", measure);
    window.addEventListener("resize", measure);
    setTimeout(measure, 0);

    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", measure);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const NAV_BREAKPOINT_PX = 920;

  function isMobileView() {
    return window.matchMedia(`(max-width: ${NAV_BREAKPOINT_PX}px)`).matches;
  }

  function measure() {
    if (!innerRef.current || !brandRef.current || !measureRef.current) return;
    if (!isMobileView()) {
      setVisibleCount(LINKS.length);
      return;
    }

    const containerWidth = innerRef.current.clientWidth;
    const brandWidth = brandRef.current.clientWidth;
    const moreBtnWidth = 52; // button + gap
    let available = containerWidth - brandWidth - 24;

    const items = Array.from(
      measureRef.current.querySelectorAll(".nav-link-measure")
    );
    if (!items.length) return;

    let total = 0;
    let count = 0;
    const gap = 8;

    for (let i = 0; i < items.length; i++) {
      const w = Math.ceil(items[i].getBoundingClientRect().width);
      const willOverflow = i < items.length - 1;
      const reserve = willOverflow ? moreBtnWidth : 0;
      if (total + (count > 0 ? gap : 0) + w + reserve <= available) {
        total += (count > 0 ? gap : 0) + w;
        count++;
      } else break;
    }
    setVisibleCount(Math.max(1, count));
  }

  // Close dropdown on outside click or ESC
  useEffect(() => {
    function handleClickOutside(e) {
      const inDropdown = dropdownRef.current?.contains(e.target);
      const inToggle = toggleRef.current?.contains(e.target);
      if (!inDropdown && !inToggle) setOpen(false);
    }
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const primary = LINKS.slice(0, visibleCount);
  const overflow = LINKS.slice(visibleCount);

  const logoSrc = config?.site?.logoSrc;
  const logoAlt = config?.site?.logoAlt || `${config.site.name} logo`;
  const brandTo = config?.site?.logoLinkTo || "/";

// Navbar.jsx (only showing the relevant JSX section)

  return (
    <header className="nav" role="banner" data-navbar>
      <div className="nav-inner" ref={innerRef}>
        {/* Brand (left) */}
        <div className="nav-brand" ref={brandRef}>
          <NavLink
            to={brandTo}
            className="brand-home"
            aria-label={`Go to ${config.site.name} home`}
          >
            {logoSrc ? (
              <img className="brand-logo-img" src={logoSrc} alt={logoAlt} />
            ) : (
              <div className="brand-logo" aria-hidden="true" />
            )}
            <span className="brand-text">{config.site.name}</span>
          </NavLink>

          <ThemeToggle />
        </div>

        {/* Desktop: centered links */}
        <nav className="nav-links" aria-label="Primary navigation">
          {LINKS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-link">
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile: dynamic inline + More */}
        <nav className="nav-links-mobile" aria-label="Primary navigation (mobile)">
          {primary.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="nav-link"
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}

          {overflow.length > 0 && (
            <button
              ref={toggleRef}
              className="more-toggle"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              ☰
            </button>
          )}
        </nav>

        {/* Desktop-only BusinessHours pill */}
        <div className="nav-right">
          <BusinessHours variant="inline" desktopOnly breakpointPx={NAV_BREAKPOINT_PX} />
        </div>
      </div>

      {/* Mobile-only BusinessHours full-width bar */}
      <div className="nav-hours-bar">
        <BusinessHours variant="bar" mobileOnly breakpointPx={NAV_BREAKPOINT_PX} />
      </div>

      {/* Hidden measurement row */}
      <div className="nav-measure" aria-hidden="true" ref={measureRef}>
        {LINKS.map(({ label }) => (
          <span key={label} className="nav-link-measure">
            {label}
          </span>
        ))}
      </div>

      {/* Mobile overflow dropdown */}
      {open && overflow.length > 0 && (
        <nav ref={dropdownRef} className="nav-dropdown" aria-label="More navigation links">
          {overflow.map(({ to, label }) => (
            <NavLink key={to} to={to} className="nav-link" onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

// src/components/NavBar.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/NavBar.css";
import ThemeToggle from "./ThemeToggle";
import config from "../config";
import BusinessHours from "./BusinessHours";

const LINKS = config.nav.links;
const NAV_BREAKPOINT_PX = 868;

export default function NavBar() {
  const logoSrc = config?.site?.logoSrc;
  const logoAlt = config?.site?.logoAlt || `${config.site.name} logo`;
  const brandTo = config?.site?.logoLinkTo || "/";

  return (
    <header className="nav" role="banner" data-navbar>

      {/* ── Top row: brand + theme toggle (both desktop and mobile) ── */}
      <div className="nav-inner">
        {/* Brand */}
        <div className="nav-brand">
          <NavLink to={brandTo} className="brand-home" aria-label={`Go to ${config.site.name} home`}>
            {logoSrc ? (
              <img className="brand-logo-img" src={logoSrc} alt={logoAlt} />
            ) : (
              <div className="brand-logo" aria-hidden="true" />
            )}
            {/* Full name on desktop, short on mobile via CSS */}
            <span className="brand-text brand-text--full">{config.site.name}</span>
            <span className="brand-text brand-text--short">Nashville3D</span>
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

        {/* Right slot: business hours — visible on both desktop and mobile */}
        <div className="nav-right">
          <BusinessHours variant="inline" breakpointPx={NAV_BREAKPOINT_PX} />
        </div>
      </div>

      {/* ── Mobile tab bar: all links visible, no hamburger ── */}
      <nav className="nav-tabs" aria-label="Primary navigation">
        {LINKS.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} className="nav-tab">
            {label}
          </NavLink>
        ))}
      </nav>

    </header>
  );
}
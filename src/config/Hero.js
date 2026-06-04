// Hero.js
// Configuration for Hero section: overlay text, images, and slideshow behavior.
// Most users will only need to edit the "Overlay content" section below.

const heroConfig = {
  // -----------------------------
  // Overlay content (edit first)
  // -----------------------------
  overlay: {
    // If left null, the site name from config.site.name will be used
    title: null,

    subtitle: "Welcome to Nashville3DPrints — buy popular items or request your own below.",

    primaryCtaText: "Browse Shop",
    primaryCtaHref: "/shop", // Where clicking the text will redirect you

    secondaryCtaText: "Get Quote",
    secondaryCtaHref: "/quote", // Where clicking the text will redirect you
  },

  // -----------------------------
  // Slideshow timing
  // -----------------------------
  // Seconds between image changes (only used when more than one image is provided)
  cycleSeconds: 6,

  // Cross-fade duration (milliseconds)
  fadeMs: 600,

  // Restarts the slideshow when switching between mobile and desktop view
  restartOnBreakpointSwitch: true,

  // -----------------------------
  // Layout / sizing
  // -----------------------------
  // Mobile height (navbar height is subtracted via CSS variable)
  mobileHeight: "45vh",          // was: calc(100vh - var(--nav-h, 56px))
  desktopMinHeight: 360,         // was: 320  — slightly taller floor
  desktopMaxHeight: 700,         // was: 640  — a little more room on wide screens

  // Desktop banner sizing
  desktopAspectRatio: "21 / 9",
  desktopMinHeight: 320,
  desktopMaxHeight: 340,

  // -----------------------------
  // Image sources
  // -----------------------------
  // Replace these paths with your own assets
  paths: {
    mobile: [
      "/assets/hero1-tall.png",
    ],
    desktop: [
      "/assets/hero1-wide.png",
      "/assets/hero2-wide.png",
    ],
  },
};

export default heroConfig;

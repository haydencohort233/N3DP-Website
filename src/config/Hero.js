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

    subtitle:
      "Local and Quality prints for Music City. Get started by requesting a quote below or giving us a call! Got lots of questions? Try our FAQ below.",

    primaryCtaText: "Get a Quote",
    primaryCtaHref: "/contact", // Where clicking the text will redirect you

    secondaryCtaText: "FAQ",
    secondaryCtaHref: "/faq", // Where clicking the text will redirect you
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
  mobileHeight: "calc(100vh - var(--nav-h, 56px))",

  // Desktop banner sizing
  desktopAspectRatio: "21 / 9",
  desktopMinHeight: 320,
  desktopMaxHeight: 640,

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

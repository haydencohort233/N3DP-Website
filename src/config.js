const config = {
  site: {
    name: "Nashville 3D Prints",
    description: "Starter template for future sites.",
    year: 2026,                             // Year in Footer
    email: "nashville3dprinting@gmail.com", // Company Email Address
    phone: "(209) 202-3221",                // Company Phone Number
    logoSrc: "/assets/logo.png",            // Logo on Navbar
    logoAlt: "Nashville3DPrinting logo",    // Alt-text when hovering over Logo
    logoLinkTo: "/",                        // Where clicking the logo redirects you to
      hours: {
      timezone: "America/Chicago",          // Sites timezone
      closingSoonMinutes: 60,               // How many minutes away from closing until it shows "Closing Soon"
      weekly: {
        mon: { open: "10:00", close: "22:00" },
        tue: { open: "10:00", close: "22:00" },
        wed: { open: "10:00", close: "22:00" },
        thu: { open: "10:00", close: "22:00" },
        fri: { open: "10:00", close: "22:00" },
        sat: { open: "10:00", close: "22:00" },
        sun: { open: "10:00", close: "22:00" },
      },
    },
  },
  nav: {
    links: [
      { to: "/", label: "Home", end: true },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/faq", label: "FAQ" },
      { to: "/gallery", label: "Gallery" },
    ],
  },
  social: { 
    facebook: "nashville3dprints", 
    instagram: "nashville3dprints", 
    etsy: "valley3dprints.etsy.com" 
  },
  theme: { default: "dark" },
};

export default config;

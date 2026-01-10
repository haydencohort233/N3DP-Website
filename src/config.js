const config = {
  site: {
    name: "Nashville 3D Prints",
    description: "Starter template for future sites.",
    year: 2026,                             // Year in Footer
    email: "nashville3dprinting@gmail.com", // Company Email Address
    phone: "(209) 202-3221",              // Company Phone Number
    logoSrc: "/assets/logo.png",          // Logo on Navbar
    logoAlt: "Nashville3DPrinting logo",  // Alt-text when hovering over Logo
    logoLinkTo: "/",                      // Where clicking the logo redirects you to
      hours: {
      timezone: "America/Chicago",
      closingSoonMinutes: 60,             // How many minutes away from closing until it shows "Closing Soon"
      weekly: {
        mon: { open: "10:00", close: "24:00" },
        tue: { open: "10:00", close: "24:00" },
        wed: { open: "10:00", close: "22:00" },
        thu: { open: "10:00", close: "22:00" },
        fri: { open: "10:00", close: "22:00" },
        sat: { open: "10:00", close: "22:00" },
        sun: { open: "10:00", close: "24:00" },
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
    etsy: "nashville3dprints.etsy.com" 
  },
  theme: { default: "dark" },
  about: {
    showFounder: true,
    founder: {
      name: "Alex Founder",
      title: "Owner & Creative Lead",
      photo: "/assets/people/founder.png",
      email: "alex@mysite.com",
      bio:
        "Alex is the founder of MySite. Passionate about clean design, fast websites, and building products people love.",
      socials: {
        twitter: "https://twitter.com/",
        instagram: "https://instagram.com/",
        github: "https://github.com/",
      },
    },

    showTeam: true,
    team: [
      {
        name: "Jamie Dev",
        title: "Frontend Engineer",
        photo: "/assets/people/jamie.png",
        bio: "Focuses on React, accessibility, and performance.",
      },
      {
        name: "Riley Ops",
        title: "Operations",
        photo: "/assets/people/jamie.png",
        bio: "Keeps projects on time and budgets happy.",
      },
    ],
  },
};

export default config;

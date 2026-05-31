// src/config/Seo.js
const seoConfig = {
  title: "Nashville 3D Printing & Prototyping | Music City Prints",
  description:
    "High-quality 3D printing services in Nashville. From rapid prototyping to custom manufacturing, Music City Prints brings your ideas to life with precision and speed.",
  keywords:
    "3d printing nashville, custom 3d prints, rapid prototyping Tennessee, small batch manufacturing, 3d design services, Music City Prints, Nashville 3d printing company",
  author: "Hayden Janes",
  siteUrl: "https://nashville3dprints.com",
  ogImage: "/assets/logo.png",
  instagramUsername: "nashville3dprints",
  facebookUrl: "https://www.facebook.com/nashville3dprints",
  siteName: "Nashville 3D Prints",
  twitterHandle: "",

  // Local SEO (JSON-LD). Only fill what is accurate.
  // If you don't want to publish your address/phone, leave these blank and
  // the SEO component should NOT render LocalBusiness JSON-LD.
  business: {
    name: "Nashville 3D Prints",
    telephone: "209-202-3221", // e.g. "+1-615-555-5555"
    address: {
      streetAddress: "", // "123 Main St"
      addressLocality: "Nashville",
      addressRegion: "TN",
      postalCode: "37211",
      addressCountry: "US",
    },
    // Optional: only include if you have exact coordinates for your business
    geo: {
      latitude: null,
      longitude: null,
    },
    instagramUsername: "nashville3dprints",
    facebookUrl: "https://www.facebook.com/nashville3dprints",
  },
};

export default seoConfig;

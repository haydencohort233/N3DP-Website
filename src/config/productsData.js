// src/config/productsData.js
// ---------------------------------------------------------------------------
// Shop product catalog — Stripe-linked, directly orderable items.
// Only add items here that have a confirmed Stripe Payment Link.
//
// Fields:
//   id          — unique string slug (match galleryData id if item is also in gallery)
//   title       — display name
//   description — short (1-2 sentences max, shown on card)
//   price       — number, USD (e.g. 15.00)
//   buyUrl      — Stripe Payment Link URL
//   src         — image path under /assets/shop/
//   category    — for future filtering
//   tags        — array of strings
//   badge       — optional string shown as a pill (e.g. "New", "Best Seller") or null
// ---------------------------------------------------------------------------

const productsData = [
    {
        id: "little-tikes-turtle-sandbox",
        title: "Little Tike's Turtle Sandbox",
        description:
          "A detailed miniature replica of the classic Little Tikes Turtle Sandbox. A perfect nostalgic gift or desk piece.",
        price: 15.00,
        buyUrl: "https://buy.stripe.com/3cI14ogcB7vv1BJc981gs01", // correct
        src: "/assets/shop/turtlesandbox.jpg",
        category: "Decor",
        tags: ["Nostalgia", "Gift", "Toy"],
        badge: "Best Seller",
        featured: true,
        inStock: true,
        holidays: [],
    },
    {
        id: "soda-can-koozie",
        title: "Soda Can Koozie",
        description:
          "An Igloo-style insulated container shaped like a soda can koozie. Keeps your drink cold and looks great doing it.",
        price: 12.00,
        buyUrl: "https://buy.stripe.com/3cIbJ24tTdTT94b2yy1gs02", // correct
        src: "/assets/shop/sodakooziecooler.jpg",
        category: "Drinkware",
        tags: ["Koozie", "Drinks", "Igloo"],
        badge: null,
        featured: false,
        inStock: true,
        holidays: [],
    },
    {
        id: "n64-game-tower",
        title: "Nintendo 64 Game Tower Storage",
        description:
          "Stackable tower storage built specifically for N64 cartridges. Keeps your collection organized and on display.",
        price: 20.00,
        buyUrl: "https://buy.stripe.com/5kQ9AU5xX7vva8f4GG1gs00", // correct
        src: "/assets/shop/n64tower.jpg",
        photos: [
        { src: "/assets/shop/n64tower.jpg",      label: "Front" },
        { src: "/assets/shop/n64tower-side.jpg",  label: "Side view" },
        { src: "/assets/shop/n64tower-empty.jpg",  label: "Front empty" },
        ],
        category: "Gaming",
        tags: ["Nintendo", "N64", "Storage", "Retro"],
        badge: "Best Seller",
        featured: false,
        inStock: true,
        holidays: [],
    },
    {
        id: "oreo-stash-container",
        title: "Oreo Cookie Stash Container",
        description:
          "A sneaky stash container shaped like an Oreo cookie. Twist the top off to reveal hidden storage inside.",
        price: 10.00,
        buyUrl: "https://buy.stripe.com/9B6aEYf8x3ff1BJ8WW1gs03", // correct
        src: "/assets/shop/oreocookie.jpg",
        category: "Kitchen",
        tags: ["Oreo", "Storage", "Fun", "Gift"],
        badge: null,
        featured: false,
        inStock: true,
        holidays: [],
    },
    {
        id: "vhs-display-blockbuster",
        title: "Blockbuster VHS Display",
        description:
          "Stackable tower storage built specifically for N64 cartridges. Keeps your collection organized and on display.",
        price: 12.00,
        buyUrl: "https://buy.stripe.com/5kQdRa2lLcPPdkr2yy1gs04", // correct
        src: "/assets/shop/vhsdisplay.jpg",
        photos: [
        { src: "/assets/shop/vhsdisplay.jpg",      label: "Empty" },
        { src: "/assets/shop/vhsdisplay-vhs.jpg",  label: "With VHS Tape" }
        ],
        category: "Retro",
        tags: ["Retro", "VHS", "Household", "Gifts"],
        badge: null,
        featured: false,
        inStock: true,
        holidays: [],
    },
    {
        id: "donkey-kong-pencil-barrel",
        title: "Donkey Kong Pencil Holder",
        description:
          "Stackable tower storage built specifically for N64 cartridges. Keeps your collection organized and on display.",
        price: 20.00,
        buyUrl: "https://buy.stripe.com/5kQdRa2lLcPPdkr2yy1gs04", // 
        src: "/assets/shop/donkeykongbarrel.jpg",
        category: "Nintendo",
        tags: ["Donkey Kong", "Mario", "Household", "Gifts"],
        badge: null,
        featured: false,
        inStock: true,
        holidays: [],
    },
    {
        id: "gamecube-controller-stand",
        title: "GameCube Controller Stand",
        description:
        "Stackable tower storage built specifically for N64 cartridges. Keeps your collection organized and on display.",
        price: 10.00,
        buyUrl: "https://buy.stripe.com/5kQdRa2lLcPPdkr2yy1gs04", // correct
        src: "/assets/shop/gc-controller-stand.jpg",
        photos: [
        { src: "/assets/shop/gc-controller-stand.jpg",      label: "Empty" },
        { src: "/assets/shop/vhsdisplay-vhs.jpg",  label: "With VHS Tape" }
        ],
        category: "Retro",
        tags: ["Retro", "VHS", "Household", "Gifts"],
        badge: null,
        featured: false,
        inStock: true,
        holidays: [],
    },
];

export default productsData;
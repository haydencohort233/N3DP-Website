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
        category: "Retro",
        tags: ["Little Tikes", "Turtle Sandbox", "Nostalgia", "Retro Toy", "Desk Decor"],
        badge: "New",
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
        category: "Kitchen",
        tags: ["Koozie", "Drink Holder", "Soda Can", "Cooler", "Igloo"],
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
        alt: "Nintendo 64 cartridge storage tower organizer",
        photos: [
        { src: "/assets/shop/n64tower.jpg",      label: "Front" },
        { src: "/assets/shop/n64tower-side.jpg",  label: "Side view" },
        { src: "/assets/shop/n64tower-empty.jpg",  label: "Front empty" },
        ],
        category: "Nintendo",
        tags: ["Nintendo 64", "N64", "Game Storage", "Retro Gaming", "Cartridge Holder"],
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
        tags: ["Oreo", "Hidden Storage", "Stash Container", "Cookie", "Kitchen"],
        badge: null,
        featured: false,
        inStock: true,
        holidays: [],
    },
    {
        id: "vhs-display-blockbuster",
        title: "Blockbuster VHS Display",
        description: "Display your favorite VHS tapes, DVDs, Blu-rays, or movies with this Blockbuster-inspired display stand. Perfect for retro media collectors.",
        price: 12.00,
        buyUrl: "https://buy.stripe.com/5kQdRa2lLcPPdkr2yy1gs04", // correct
        src: "/assets/shop/vhsdisplay.jpg",
        alt: "Blockbuster VHS tape display stand",
        photos: [
        { src: "/assets/shop/vhsdisplay.jpg",      label: "Empty" },
        { src: "/assets/shop/vhsdisplay-vhs.jpg",  label: "With VHS Tape" }
        ],
        category: "Retro",
        tags: ["Blockbuster", "VHS", "Retro", "Movie Collection", "Display Stand"],
        badge: null,
        featured: false,
        inStock: true,
        holidays: [],
    },
    {
        id: "donkey-kong-pencil-barrel",
        title: "Donkey Kong Pencil Holder",
        description: "A Donkey Kong barrel-inspired pencil holder designed to organize pens, pencils, markers, and desk accessories.",
        price: 20.00,
        buyUrl: "https://buy.stripe.com/28EeVee4t5nndkrehg1gs06", // correct - pencil barrel
        src: "/assets/shop/donkeykongbarrel.jpg",
        alt: "Donkey Kong barrel pencil holder for desk organization",
        category: "Nintendo",
        tags: ["Donkey Kong", "Nintendo", "Desk Organizer", "Pencil Holder", "Gaming", "Gifts"],
        badge: null,
        featured: false,
        inStock: true,
        holidays: [],
    },
    {
        id: "gamecube-controller-stand",
        title: "GameCube Controller Stand",
        description: "A compact display stand designed to safely showcase your Nintendo GameCube controller while keeping your gaming setup organized.",
        price: 8.00,
        buyUrl: "https://buy.stripe.com/28EbJ26C1eXXbcja101gs05", // correct - gc stand
        src: "/assets/shop/gc-controller-stand.jpg", // add empty photo and side photo
        alt: "Nintendo GameCube controller display stand",
        category: "Nintendo",
        tags: ["GameCube", "Nintendo", "Controller Stand", "Gaming Setup", "Retro Gaming"],
        badge: null,
        featured: false,
        inStock: true,
        holidays: [],
    },
];

export default productsData;
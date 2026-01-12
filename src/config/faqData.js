// src/config/faqData.js

const faqData = [
  {
    category: "Getting Started",
    items: [
      {
        id: "gen-get-quote",
        question: "How do I get a quote?",
        answer: `
          Fastest way is our quote form.
          <br /><br />
          You can also reach us at:
          <br />
          <strong>Email:</strong> {{EMAIL}}
          <br />
          <strong>Call/Text:</strong> {{PHONE}}
        `,
      },
      {
        id: "gen-what-can-make",
        question: "What can you make?",
        answer: `
          Almost anything: props, toys, parts, jewelry making, storage organizers, mounts, ornaments, and custom prototypes.
          <br /><br />
          Need ideas or a model? Start here:
          <ol>
            <li><a href="https://www.printables.com" target="_blank" rel="noopener noreferrer">Printables</a></li>
            <li><a href="https://makerworld.com" target="_blank" rel="noopener noreferrer">MakerWorld</a></li>
            <li><a href="https://www.thingiverse.com" target="_blank" rel="noopener noreferrer">Thingiverse</a></li>
          </ol>
          You can also search across sites with
          <a href="https://www.yeggi.com" target="_blank" rel="noopener noreferrer"> Yeggi</a>.
          <br /><br />
          If you saw something on TikTok/Facebook/Instagram, send the link and we’ll track it down.
        `,
      },
      {
        id: "gen-how-big",
        question: "How big can it be?",
        answer: `
          In a single print, up to about <strong>10" x 10" x 10"</strong>.
          <br /><br />
          If it’s bigger, we can split it into multiple pieces that fit together.
        `,
      },
    ],
  },

  {
    category: "Materials & Quality",
    items: [
      {
        id: "mat-materials",
        question: "Which materials do you print in?",
        answer: `
          We mainly print in <strong>PLA</strong> and <strong>PETG</strong>.
          <br /><br />
          If you need something different, we can special-order materials on request.
        `,
      },
      {
        id: "mat-colors",
        question: "Which colors can I choose?",
        answer: `
          By default we offer <strong>black</strong> or <strong>white</strong>.
          <br /><br />
          Custom colors are available for a small surcharge (usually <strong>$5–$20</strong> depending on the request).
        `,
      },
      {
        id: "mat-strength",
        question: "Are 3D prints strong?",
        answer: `
          They can be. Strength depends on the material and how it’s printed (walls, infill, orientation).
          <br /><br />
          If you tell us what the part needs to handle, we’ll recommend settings/material (PETG is often better for functional parts).
        `,
      },
    ],
  },

  {
    category: "Pricing & Turnaround",
    items: [
      {
        id: "price-what-cost",
        question: "What does this cost?",
        answer: `
          Cost depends on size, print time, material, number of colors, quantity, and whether you need shipping.
          <br /><br />
          Most prints land around <strong>$20–$100</strong>, but we’ll quote it clearly before you commit.
        `,
      },
      {
        id: "turnaround-time",
        question: "How long will it take?",
        answer: `
          Most orders take about <strong>3–5 days</strong>.
          <br /><br />
          Bigger or more complex orders can take longer—your quote will include an estimate.
        `,
      },
      {
        id: "after-submit",
        question: "I submitted a quote, now what?",
        answer: `
          You should hear back within <strong>1–2 days</strong>.
          <br /><br />
          If it’s urgent, feel free to call/text: <strong>{{PHONE}}</strong>.
        `,
      },
    ],
  },

  {
    category: "Orders & Pickup",
    items: [
      {
        id: "ship-do-you-ship",
        question: "Do you offer shipping?",
        answer: `
          Yes — we ship throughout the <strong>USA</strong>.
          <br /><br />
          We pack items carefully (protective wrap + padding), and typically ship via <strong>USPS Ground Advantage</strong>.
        `,
      },
      {
        id: "no-quote-needed",
        question: "Do I have to submit a quote?",
        answer: `
          No. You can call or text us at <strong>{{PHONE}}</strong> or email <strong>{{EMAIL}}</strong>.
          <br /><br />
          The quote form is still the easiest way to make sure we get all the details right.
        `,
      },
    ],
  },
];

export default faqData;

const faqData = [
  {
    id: "what-can-make",
    question: "What can you make?",
    answer: `
      Almost anything: props, toys, parts, jewelry, organizers, mounts, ornaments, and custom prototypes.
      <br /><br />
      Need a model? Browse <a href="https://www.printables.com" target="_blank" rel="noopener noreferrer">Printables</a>,
      <a href="https://makerworld.com" target="_blank" rel="noopener noreferrer"> MakerWorld</a>, or
      <a href="https://www.thingiverse.com" target="_blank" rel="noopener noreferrer"> Thingiverse</a>.
      Saw something on TikTok or Instagram? Send the link and we'll track it down.
    `,
  },
  {
    id: "how-to-order",
    question: "How do I place an order or get a quote?",
    answer: `
      Use our quote form — it's the fastest way to make sure we get all the details right.
      <br /><br />
      You can also reach us directly:<br />
      <strong>Email:</strong> {{EMAIL}}<br />
      <strong>Call/Text:</strong> {{PHONE}}
    `,
    cta: true,
  },
  {
    id: "what-cost",
    question: "What does it cost?",
    answer: `
      Most prints land around <strong>$20–$100</strong> depending on size, material, colors, and quantity.
      We'll always quote you clearly before you commit to anything.
    `,
  },
  {
    id: "how-long",
    question: "How long does it take?",
    answer: `
      Most orders are ready in <strong>3–5 days</strong>. Larger or more complex orders may take longer —
      your quote will include an estimate. After submitting, expect to hear back within <strong>1–2 business days</strong>.
      If it's urgent, call or text us at <strong>{{PHONE}}</strong>.
    `,
  },
  {
    id: "how-big",
    question: "How big can it be?",
    answer: `
      Single prints up to about <strong>10" × 10" × 10"</strong>.
      Larger items can be split into multiple pieces that fit together seamlessly.
    `,
  },
  {
    id: "materials",
    question: "What materials and colors do you offer?",
    answer: `
      We primarily print in <strong>PLA</strong> and <strong>PETG</strong>. Other materials are available on request.
      <br /><br />
      Standard colors are <strong>black</strong> and <strong>white</strong>. Custom colors are available for a small
      surcharge (usually <strong>$5–$20</strong>).
    `,
  },
  {
    id: "strength",
    question: "Are 3D prints strong enough for functional parts?",
    answer: `
      Yes — strength depends on material, wall thickness, and infill settings.
      PETG is generally better for functional or outdoor parts. Just tell us what the part needs to handle
      and we'll recommend the right setup.
    `,
  },
  {
    id: "shipping",
    question: "Do you ship?",
    answer: `
      Yes, throughout the <strong>USA</strong>. We pack carefully with protective wrap and padding,
      and typically ship via <strong>USPS Ground Advantage</strong>.
    `,
  },
];

export default faqData;
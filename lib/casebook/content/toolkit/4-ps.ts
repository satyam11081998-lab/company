import type { Page } from "../../types";

/**
 * Toolkit - The 4 P's of Marketing
 * Reference card (Section C). Two inline SVGs (hero + how-to-deploy) to the locked v2 grammar (s9.14).
 */
export const fourPs: Page = {
  slug: "toolkit/4-ps",
  title: "The 4 P's of Marketing",
  titleEmphasize: "4 P's",
  subtitle: "Four decisions that must tell one story to one customer.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 9,
    tags: ["4ps", "marketing mix", "go-to-market", "positioning", "toolkit"],
    caseType: "marketing",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "one coherent story",
      md: "Product, price, place, promotion — the four P’s are easy to name and easy to set one at a time, which is exactly the mistake. The marketing mix only works when all four tell **one coherent story** to one clearly chosen customer. A single P out of step quietly breaks the whole offer.",
    },
    {
      type: "heading",
      level: 2,
      text: "The four decisions",
      emphasize: "four decisions",
    },
    {
      type: "prose",
      md: "The four P’s are the levers of the marketing mix. *Product* is what you sell and how it is made to feel. *Price* is what you charge and how — and it quietly signals quality. *Place* is where and how the customer can buy. *Promotion* is how you build awareness and demand. Each is a real decision; the discipline is making them point the same way.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 410" xmlns="http://www.w3.org/2000/svg" role="img">
<defs>
  <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="hsl(214 64% 19%)"/>
    <stop offset="1" stop-color="hsl(214 74% 11%)"/>
  </linearGradient>
  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="hsl(var(--card))"/>
    <stop offset="1" stop-color="hsl(var(--muted))"/>
  </linearGradient>
  <filter id="cs" x="-20%" y="-20%" width="140%" height="150%">
    <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#0b1220" flood-opacity="0.14"/>
  </filter>
  <filter id="rs" x="-30%" y="-30%" width="160%" height="170%">
    <feDropShadow dx="0" dy="5" stdDeviation="8" flood-color="#06101f" flood-opacity="0.34"/>
  </filter>
  <marker id="ar" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0.5,0.8 L9,5 L0.5,9.2" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>
  <!-- ROOT -->
  <rect x="200" y="14" width="360" height="54" rx="12" fill="url(#ng)" filter="url(#rs)"/>
  <text x="380" y="38" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">The marketing mix — four decisions</text>
  <text x="380" y="57" text-anchor="middle" fill="#b9c4d6" font-size="11">every P must serve one positioning, for one segment</text>

  <!-- 4 cards -->
  <g>
    <rect x="14" y="84" width="172" height="196" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
    <text x="100" y="108" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13.5" font-weight="700">Product</text>
    <text x="100" y="125" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">what we sell &amp; how it feels</text>
    <text x="28" y="150" fill="hsl(var(--primary))" font-size="8.5" font-weight="700" letter-spacing="0.05em">DECIDES</text>
    <circle cx="32" cy="167" r="2.6" fill="hsl(var(--primary))"/><text x="40" y="170" fill="hsl(var(--foreground))" font-size="10">Features &amp; quality</text>
    <circle cx="32" cy="189" r="2.6" fill="hsl(var(--primary))"/><text x="40" y="192" fill="hsl(var(--foreground))" font-size="10">Design &amp; packaging</text>
    <circle cx="32" cy="211" r="2.6" fill="hsl(var(--primary))"/><text x="40" y="214" fill="hsl(var(--foreground))" font-size="10">Range &amp; branding</text>
  </g>
  <g>
    <rect x="196" y="84" width="172" height="196" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
    <text x="282" y="108" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13.5" font-weight="700">Price</text>
    <text x="282" y="125" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">what we charge &amp; how</text>
    <text x="210" y="150" fill="hsl(var(--primary))" font-size="8.5" font-weight="700" letter-spacing="0.05em">DECIDES</text>
    <circle cx="214" cy="167" r="2.6" fill="hsl(var(--primary))"/><text x="222" y="170" fill="hsl(var(--foreground))" font-size="10">List price &amp; tiers</text>
    <circle cx="214" cy="189" r="2.6" fill="hsl(var(--primary))"/><text x="222" y="192" fill="hsl(var(--foreground))" font-size="10">Discounts &amp; terms</text>
    <circle cx="214" cy="211" r="2.6" fill="hsl(var(--primary))"/><text x="222" y="214" fill="hsl(var(--foreground))" font-size="10">Signals quality</text>
  </g>
  <g>
    <rect x="378" y="84" width="172" height="196" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
    <text x="464" y="108" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13.5" font-weight="700">Place</text>
    <text x="464" y="125" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">where &amp; how they buy</text>
    <text x="392" y="150" fill="hsl(var(--primary))" font-size="8.5" font-weight="700" letter-spacing="0.05em">DECIDES</text>
    <circle cx="396" cy="167" r="2.6" fill="hsl(var(--primary))"/><text x="404" y="170" fill="hsl(var(--foreground))" font-size="10">Channels &amp; reach</text>
    <circle cx="396" cy="189" r="2.6" fill="hsl(var(--primary))"/><text x="404" y="192" fill="hsl(var(--foreground))" font-size="10">Online / offline mix</text>
    <circle cx="396" cy="211" r="2.6" fill="hsl(var(--primary))"/><text x="404" y="214" fill="hsl(var(--foreground))" font-size="10">Logistics &amp; stock</text>
  </g>
  <g>
    <rect x="560" y="84" width="186" height="196" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
    <text x="653" y="108" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13.5" font-weight="700">Promotion</text>
    <text x="653" y="125" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">how we build demand</text>
    <text x="574" y="150" fill="hsl(var(--primary))" font-size="8.5" font-weight="700" letter-spacing="0.05em">DECIDES</text>
    <circle cx="578" cy="167" r="2.6" fill="hsl(var(--primary))"/><text x="586" y="170" fill="hsl(var(--foreground))" font-size="10">Messaging &amp; ads</text>
    <circle cx="578" cy="189" r="2.6" fill="hsl(var(--primary))"/><text x="586" y="192" fill="hsl(var(--foreground))" font-size="10">PR &amp; influencers</text>
    <circle cx="578" cy="211" r="2.6" fill="hsl(var(--primary))"/><text x="586" y="214" fill="hsl(var(--foreground))" font-size="10">Channel mix</text>
  </g>

  <!-- coherence strip -->
  <rect x="14" y="292" width="732" height="30" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.2" stroke-dasharray="5 4"/>
  <text x="380" y="311" text-anchor="middle" fill="hsl(var(--primary))" font-size="10.5" font-weight="600">One story: premium product · premium price · selective place · aspirational promotion</text>

  <!-- HOW TO USE -->
  <rect x="14" y="334" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="355" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="372" fill="hsl(var(--foreground))" font-size="11.5">Decide the positioning first, then set all four P’s to serve it. Check they cohere — a single P out of step undermines the rest.</text>
  <text x="28" y="388" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: the 4 P’s describe a plan, not a customer. Start from the segment, or you optimise a mix nobody asked for.</text>
</svg>`,
      caption: "The four levers — and the rule that they must serve one positioning.",
      maxWidth: 760,
      ariaLabel: "The four P's — product, price, place, promotion — each with what it decides, above a strip noting they must tell one coherent story.",
    },
    {
      type: "prose",
      md: "The test is coherence. A premium positioning demands a premium product, a price that signals quality, selective places to buy, and aspirational promotion. Put a discount price on that same product, or stock it in every corner shop, and the story collapses — customers feel the mismatch even if they can’t name it.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "start from the segment",
    },
    {
      type: "prose",
      md: "Don’t start from the product — start from the segment and the positioning you want to own. Then set each P to serve that positioning, pressure-test the four for coherence, and fix the one that is out of step. The weakest-aligned P caps the whole mix.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 470" xmlns="http://www.w3.org/2000/svg" role="img">
<defs>
  <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="hsl(214 64% 19%)"/>
    <stop offset="1" stop-color="hsl(214 74% 11%)"/>
  </linearGradient>
  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="hsl(var(--card))"/>
    <stop offset="1" stop-color="hsl(var(--muted))"/>
  </linearGradient>
  <filter id="cs" x="-20%" y="-20%" width="140%" height="150%">
    <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#0b1220" flood-opacity="0.14"/>
  </filter>
  <filter id="rs" x="-30%" y="-30%" width="160%" height="170%">
    <feDropShadow dx="0" dy="5" stdDeviation="8" flood-color="#06101f" flood-opacity="0.34"/>
  </filter>
  <marker id="ar" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0.5,0.8 L9,5 L0.5,9.2" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>
  <text x="24" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">USING THE 4 P’s — FOUR MOVES</text>
  <text x="474" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">SAY IT OUT LOUD</text>
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6">
    <path d="M239,108 L239,122" marker-end="url(#ar)"/>
    <path d="M239,190 L239,204" marker-end="url(#ar)"/>
    <path d="M239,272 L239,286" marker-end="url(#ar)"/>
  </g>
  <rect x="24" y="50" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="65" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="84" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">1</text>
  <text x="80" y="75" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Start from the segment, not the product</text>
  <text x="80" y="93" fill="hsl(var(--muted-foreground))" font-size="11">who is this for, and what do we want to own in their mind?</text>
  <text x="474" y="75" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“First — who exactly are we serving</text>
  <text x="474" y="91" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">and what should we stand for?”</text>
  <rect x="24" y="132" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="147" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="166" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">2</text>
  <text x="80" y="157" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Set each P to serve that positioning</text>
  <text x="80" y="175" fill="hsl(var(--muted-foreground))" font-size="11">product, price, place, promotion all answer one brief</text>
  <text x="474" y="157" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Premium position — so price high,</text>
  <text x="474" y="173" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">place selective, promotion aspirational.”</text>
  <rect x="24" y="214" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="229" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="248" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">3</text>
  <text x="80" y="239" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Pressure-test for coherence</text>
  <text x="80" y="257" fill="hsl(var(--muted-foreground))" font-size="11">one P out of step undermines the other three</text>
  <text x="474" y="239" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“A discount in a premium store</text>
  <text x="474" y="255" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">breaks the story — that’s the flaw.”</text>
  <rect x="24" y="296" width="430" height="58" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <rect x="38" y="311" width="28" height="28" rx="7" fill="hsl(var(--primary))"/><text x="52" y="330" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">4</text>
  <text x="80" y="321" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Fix the odd one out</text>
  <text x="80" y="339" fill="hsl(var(--muted-foreground))" font-size="11">the weakest-aligned P caps the whole mix</text>
  <text x="474" y="321" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“The mix holds except promotion</text>
  <text x="474" y="337" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">— that’s the one we change.”</text>
  <rect x="24" y="372" width="712" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="38" y="393" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="38" y="410" fill="hsl(var(--foreground))" font-size="11.5">The 4 P’s aren’t four separate calls: they tell one story to one segment. A single P out of step breaks it.</text>
  <text x="38" y="426" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: setting each P in isolation is the trap — premium product, discount channel sends a mixed signal.</text>
</svg>`,
      caption: "Four moves that turn the mix into a coherent go-to-market.",
      maxWidth: 620,
      ariaLabel: "A four-step flow for using the 4 P's: start from the segment, set each P to serve the positioning, pressure-test for coherence, and fix the odd one out, with a spoken script beside each step.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "Setting each P in isolation",
      md: "The trap is optimising each P on its own — the best product, the lowest price, the widest distribution, the loudest promotion — and ending with four decisions that contradict each other. ‘Widest distribution’ and ‘premium positioning’ cannot both be true. Decide the story first; let it constrain every P.",
    },
    {
      type: "heading",
      level: 2,
      text: "Worked example: launching a premium cold brew",
      emphasize: "premium cold brew",
    },
    {
      type: "prose",
      md: "A D2C brand is launching a premium bottled cold-brew coffee for urban professionals. The four P’s decide whether the launch lands as ‘specialty treat’ or ‘confused me-too’.",
    },
    {
      type: "dialogue",
      title: "Four P's, one story",
      turns: [
        { speaker: "interviewer", md: "A D2C brand is launching a premium bottled cold-brew coffee in Indian metros. How would you set the marketing mix?" },
        { speaker: "candidate", note: "Starts from segment and positioning, not the product.", md: "First the positioning, because everything hangs off it: a premium, specialty cold brew for urban professionals who already pay up for good coffee. Now the four P’s all have to serve that. Product: single-origin beans, no-added-sugar options, a glass bottle and design that look the part. Price: I’d hold it clearly premium — say in the range of a cafe pour, not an instant-coffee sachet — because the price itself signals quality. Place: selective — quick-commerce, premium cafes, and their own D2C site, not every kirana shelf. Promotion: Instagram, cafe sampling, and a few credible food influencers — aspirational, not discount-led." },
        { speaker: "interviewer", md: "What would break it?" },
        { speaker: "candidate", note: "Names the incoherence that would kill the story.", md: "The fastest way to wreck it would be a single P out of step — most likely promotion or place. If they chase volume with deep launch discounts and blanket kirana distribution, the price no longer signals premium and the specialty story dies. So the one thing I’d protect is coherence: a premium product sold cheaply, everywhere, is just an expensive commodity." },
        { speaker: "narrator", md: "The candidate set every P from a single positioning and then named the misalignment that would break it. That — not four independently ‘optimised’ P’s — is how the mix is actually scored." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "The 4 P’s are the execution layer beneath a **Market Entry** or **Growth** decision — once you’ve chosen where to play, the mix is how you play. And the Price P opens straight into the **Pricing** framework, where value, cost and competition set the actual number.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Treat the four P’s as one decision, not four — a single mix serving one positioning.",
        "Start from the segment and the positioning you want to own, then set each P to serve it.",
        "Pressure-test the four for coherence and find the P that is out of step.",
        "Recognise that price signals quality, so it must match the product and promotion story.",
        "Use the mix as the execution layer of a Market Entry or Growth choice, and hand price to the Pricing framework."
      ],
    }
  ],
};

export default fourPs;


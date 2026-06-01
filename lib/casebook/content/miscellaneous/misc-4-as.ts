import type { Page } from "../../types";

/**
 * Miscellaneous Frameworks - The 4 A's of Marketing
 * Light reference card (Section G). One inline SVG hero to the locked v2 grammar (s9.14).
 */
export const foura: Page = {
  slug: "miscellaneous/4-as",
  title: "The 4 A's of Marketing",
  titleEmphasize: "4 A's",
  subtitle: "Four gates a customer must clear to buy - find the one that's shut.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 5,
    tags: ["4as", "awareness", "affordability", "accessibility", "acceptability", "miscellaneous"],
    caseType: "marketing",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "the weakest gate",
      md: "A customer reaches your product only by clearing four gates in turn: they must know it exists, afford it, be able to get it, and be willing to accept it. Adoption is capped by **the weakest gate** — so the job is never to polish all four, but to find the one that's shut.",
    },
    {
      type: "heading",
      level: 2,
      text: "The four gates",
      emphasize: "a customer's view",
    },
    {
      type: "prose",
      md: "**Awareness** — do they know the product and brand exist? **Affordability** — can they pay, both economically (means) and psychologically (worth it)? **Accessibility** — can they actually get it; is it in stock and easy to reach? **Acceptability** — will they accept it, functionally (it works) and psychologically (they like it)? It's a customer-centric mirror of distribution and demand.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 384" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="24" y="28" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">THE 4 A's - A CUSTOMER-CENTRIC TEST OF MARKET REACH</text>
  <text x="24" y="44" fill="hsl(var(--muted-foreground))" font-size="10.5">Four gates a customer must clear to buy. A break at any one caps adoption - find the gate that is shut.</text>

  <!-- 4 gates in a row, arrow flow -->
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.5">
    <path d="M186,130 L200,130" marker-end="url(#ar)"/>
    <path d="M372,130 L386,130" marker-end="url(#ar)"/>
    <path d="M558,130 L572,130" marker-end="url(#ar)"/>
  </g>

  <rect x="14" y="64" width="172" height="132" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="100" y="88" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="700">Awareness</text>
  <text x="100" y="104" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">do they know it exists?</text>
  <circle cx="28" cy="126" r="2.6" fill="hsl(var(--primary))"/><text x="36" y="129" fill="hsl(var(--foreground))" font-size="9.5">Know the product</text>
  <circle cx="28" cy="148" r="2.6" fill="hsl(var(--primary))"/><text x="36" y="151" fill="hsl(var(--foreground))" font-size="9.5">Recognise the brand</text>
  <text x="100" y="180" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8.5" font-style="italic">break: nobody's heard of you</text>

  <rect x="200" y="64" width="172" height="132" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="286" y="88" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="700">Affordability</text>
  <text x="286" y="104" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">can they pay for it?</text>
  <circle cx="214" cy="126" r="2.6" fill="hsl(var(--primary))"/><text x="222" y="129" fill="hsl(var(--foreground))" font-size="9.5">Economic - have means</text>
  <circle cx="214" cy="148" r="2.6" fill="hsl(var(--primary))"/><text x="222" y="151" fill="hsl(var(--foreground))" font-size="9.5">Psychological - worth it</text>
  <text x="286" y="180" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8.5" font-style="italic">break: priced out of reach</text>

  <rect x="386" y="64" width="172" height="132" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="472" y="88" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="700">Accessibility</text>
  <text x="472" y="104" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">can they get it?</text>
  <circle cx="400" cy="126" r="2.6" fill="hsl(var(--primary))"/><text x="408" y="129" fill="hsl(var(--foreground))" font-size="9.5">In stock, available</text>
  <circle cx="400" cy="148" r="2.6" fill="hsl(var(--primary))"/><text x="408" y="151" fill="hsl(var(--foreground))" font-size="9.5">Easy to reach / buy</text>
  <text x="472" y="180" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8.5" font-style="italic">break: can't find or get it</text>

  <rect x="572" y="64" width="174" height="132" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="659" y="88" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="700">Acceptability</text>
  <text x="659" y="104" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">will they accept it?</text>
  <circle cx="586" cy="126" r="2.6" fill="hsl(var(--primary))"/><text x="594" y="129" fill="hsl(var(--foreground))" font-size="9.5">Functional - it works</text>
  <circle cx="586" cy="148" r="2.6" fill="hsl(var(--primary))"/><text x="594" y="151" fill="hsl(var(--foreground))" font-size="9.5">Psychological - they like it</text>
  <text x="659" y="180" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8.5" font-style="italic">break: won't or don't like it</text>

  <!-- weakest-link bar -->
  <rect x="14" y="210" width="732" height="28" rx="8" fill="url(#ng)"/>
  <text x="380" y="229" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">REACH is capped by the WEAKEST A - fix the shut gate, not the open ones</text>

  <!-- HOW TO USE -->
  <rect x="14" y="250" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="271" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="288" fill="hsl(var(--foreground))" font-size="11.5">Walk the four gates and find the one that is shut for your customer - that is what caps reach and what to fix first.</text>
  <text x="28" y="304" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: it's a chain, not a scorecard. Three strong A's and one broken one still means low adoption.</text>
</svg>`,
      caption: "Four gates in sequence; reach is capped by the weakest.",
      maxWidth: 760,
      ariaLabel: "The 4 A's as four gates — awareness, affordability, accessibility, acceptability — with reach capped by the weakest one.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "fix the shut gate",
    },
    {
      type: "prose",
      md: "Walk the four gates for your specific customer and find the one that's failing — that's what caps adoption and what to fix first. It is a chain, not a scorecard: three strong A's and one broken one still means low adoption.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "Treating it as a scorecard",
      md: "Averaging the four — ‘we're strong on three, so we're 75% there' — misses the point. A single shut gate stops the customer cold regardless of the others. Diagnose the binding constraint, don't tally a score.",
    },
    {
      type: "dialogue",
      title: "Finding the shut gate",
      turns: [
        { speaker: "interviewer", md: "A rural-focused solar-lamp maker has a great, affordable product and decent distribution, but sales are weak. How would you diagnose it?" },
        { speaker: "candidate", note: "Walks the gates to the shut one.", md: "I'd run the 4 A's. Affordability — they say it's strong, priced for the segment. Accessibility — decent distribution, so reachable. Acceptability — the product works and people like it where they've tried it. That leaves awareness: in dispersed rural markets, do customers even know the lamp and brand exist? My hypothesis is the shut gate is awareness — weak reach of marketing, not price or product. So the fix is local awareness-building (demos, word-of-mouth, retailer push), not another price cut." },
        { speaker: "narrator", md: "The candidate didn't tinker with the three working gates — they isolated the one that was shut, which is the entire value of the framework." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "The 4 A's overlap the **Customer Journey** (awareness and access are early-funnel stages) and pressure-test a **4 P's** plan from the customer's side rather than the firm's.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Test market reach through four customer-side gates: awareness, affordability, accessibility, acceptability.",
        "Find the single shut gate that caps adoption.",
        "Treat it as a chain, not a scorecard — one weak gate dominates.",
        "Point the fix at the binding constraint instead of the gates already working."
      ],
    }
  ],
};

export default foura;

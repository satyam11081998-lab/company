import type { Page } from "../../types";

/**
 * Miscellaneous Frameworks - The Five Senses Framework
 * Light reference card (Section G). One inline SVG hero to the locked v2 grammar (s9.14).
 */
export const fivesenses: Page = {
  slug: "miscellaneous/five-senses",
  title: "The Five Senses Framework",
  titleEmphasize: "Five Senses",
  subtitle: "A ready-made, MECE way to break down an experience problem.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 5,
    tags: ["five senses", "experience", "perception", "brand", "miscellaneous"],
    caseType: "experience analysis",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "how it's experienced",
      md: "Some problems aren't about numbers — they're about how something feels. Why does one cafe feel premium and the one next door feel cheap? When the question is about experience or perception, the five senses give you a ready-made, naturally MECE way to break down **how it's experienced**.",
    },
    {
      type: "heading",
      level: 2,
      text: "The five lenses",
      emphasize: "sight, sound, smell, taste, touch",
    },
    {
      type: "prose",
      md: "Sight (look, design, lighting), sound (music, noise, acoustics), smell (scent, freshness), taste (where relevant — food, drink), and touch (texture, materials, comfort). Together they form a complete, non-overlapping checklist of everything a person physically perceives in a moment — which is why they're a clean MECE split for an experience.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="24" y="28" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">THE FIVE SENSES - BREAK DOWN AN EXPERIENCE PROBLEM</text>
  <text x="24" y="44" fill="hsl(var(--muted-foreground))" font-size="10.5">When a problem is about experience or perception, the five senses are a ready-made, MECE way to split it.</text>

  <!-- wheel: center + 5 nodes around -->
  <g fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.3">
    <line x1="300" y1="200" x2="300" y2="96"/>
    <line x1="300" y1="200" x2="392" y2="158"/>
    <line x1="300" y1="200" x2="372" y2="270"/>
    <line x1="300" y1="200" x2="228" y2="270"/>
    <line x1="300" y1="200" x2="208" y2="158"/>
  </g>
  <circle cx="300" cy="200" r="44" fill="url(#ng)" filter="url(#rs)"/>
  <text x="300" y="196" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="700">The</text>
  <text x="300" y="211" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="700">experience</text>

  <!-- Sight (top) -->
  <circle cx="300" cy="96" r="34" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="300" y="94" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11" font-weight="700">Sight</text>
  <text x="300" y="107" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="7.5">look, design</text>
  <!-- Sound (upper right) -->
  <circle cx="392" cy="158" r="34" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="392" y="156" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11" font-weight="700">Sound</text>
  <text x="392" y="169" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="7.5">music, noise</text>
  <!-- Smell (lower right) -->
  <circle cx="372" cy="270" r="34" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="372" y="268" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11" font-weight="700">Smell</text>
  <text x="372" y="281" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="7.5">scent, air</text>
  <!-- Taste (lower left) -->
  <circle cx="228" cy="270" r="34" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="228" y="268" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11" font-weight="700">Taste</text>
  <text x="228" y="281" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="7.5">flavour</text>
  <!-- Touch (upper left) -->
  <circle cx="208" cy="158" r="34" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="208" y="156" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11" font-weight="700">Touch</text>
  <text x="208" y="169" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="7.5">feel, texture</text>

  <!-- right panel: where it fits -->
  <rect x="468" y="70" width="278" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="482" y="90" fill="hsl(var(--primary))" font-size="9.5" font-weight="700" letter-spacing="0.05em">USE IT WHEN</text>
  <text x="482" y="108" fill="hsl(var(--foreground))" font-size="10">The problem is about how something is</text>
  <text x="482" y="122" fill="hsl(var(--foreground))" font-size="10">experienced - a store, a product, a venue,</text>
  <text x="482" y="136" fill="hsl(var(--foreground))" font-size="10">a brand moment - rather than its numbers.</text>
  <text x="482" y="158" fill="hsl(var(--muted-foreground))" font-size="9.5">e.g. why does this cafe feel premium</text>
  <text x="482" y="172" fill="hsl(var(--muted-foreground))" font-size="9.5">but that one feels cheap?</text>

  <rect x="468" y="200" width="278" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="482" y="220" fill="hsl(var(--primary))" font-size="9.5" font-weight="700" letter-spacing="0.05em">WHY IT WORKS</text>
  <text x="482" y="238" fill="hsl(var(--foreground))" font-size="10">Five senses are naturally MECE - a</text>
  <text x="482" y="252" fill="hsl(var(--foreground))" font-size="10">complete, non-overlapping checklist.</text>

  <!-- HOW TO USE -->
  <rect x="14" y="318" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="339" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="356" fill="hsl(var(--foreground))" font-size="11.5">For an experience problem, walk all five senses to map what the customer perceives, then fix the one letting you down.</text>
  <text x="28" y="372" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: it's a niche lens. Reach for it on experience and perception cases, not on numbers-driven problems.</text>
</svg>`,
      caption: "The five senses as a complete checklist for an experience problem.",
      maxWidth: 760,
      ariaLabel: "A wheel of the five senses — sight, sound, smell, taste, touch — around a central experience, used to break down perception problems.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "a niche but sharp lens",
    },
    {
      type: "prose",
      md: "For an experience problem, walk all five senses to map what the customer actually perceives, then find the sense that's letting you down. It's a niche tool — reach for it on experience, retail-environment, and brand-moment cases, not on numbers-driven problems where it would just be decoration.",
    },
    {
      type: "callout",
      variant: "insight",
      title: "Why it's genuinely MECE",
      md: "Most ad-hoc breakdowns of ‘experience' overlap or leave gaps. The five senses don't — they're mutually exclusive and collectively exhaustive of physical perception, which is exactly why they make such a clean structuring device when the problem fits.",
    },
    {
      type: "dialogue",
      title: "Diagnosing a feel",
      turns: [
        { speaker: "interviewer", md: "A coffee chain's new outlet has great coffee and prices but customers say it feels ‘cheap' and don't linger. How would you break that down?" },
        { speaker: "candidate", note: "Uses the senses as the structure.", md: "Since this is an experience problem, I'd break it down by the five senses. Sight: lighting too bright or harsh, cluttered layout, cheap-looking finishes? Sound: no music, or noisy and echoey? Smell: is the coffee aroma actually reaching customers, or masked? Touch: hard seating, flimsy cups, sticky tables? Taste is fine — they said the coffee's good. My bet is the ‘cheap' feel is mostly sight and touch — lighting and materials — so I'd focus the diagnosis there." },
        { speaker: "narrator", md: "The senses gave the candidate an instant, complete structure for a fuzzy ‘it just feels off' problem — which is exactly when this niche lens earns its place." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "It's a specialised structuring device — a sibling to the broader structuring tools in **Structuring Fundamentals**, useful when a problem is sensory or experiential rather than financial.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Recognise when a problem is about experience or perception rather than numbers.",
        "Use the five senses as a ready-made MECE structure for that experience.",
        "Map what the customer perceives across all five, then isolate the failing sense.",
        "Keep it in reserve for experience and brand-moment cases, not general business problems."
      ],
    }
  ],
};

export default fivesenses;

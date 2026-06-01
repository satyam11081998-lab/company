import type { Page } from "../../types";

/**
 * Miscellaneous Frameworks - TAM, SAM & SOM
 * Light reference card (Section G). One inline SVG hero to the locked v2 grammar (s9.14).
 */
export const tamsamsom: Page = {
  slug: "miscellaneous/tam-sam-som",
  title: "TAM, SAM & SOM",
  titleEmphasize: "TAM / SAM / SOM",
  subtitle: "Three nested estimates: the market that exists, that you can serve, that you can win.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 6,
    tags: ["tam", "sam", "som", "market sizing", "opportunity", "miscellaneous"],
    caseType: "market sizing",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "the market you can win",
      md: "‘The market is worth ten thousand crore' sounds impressive and means almost nothing for a plan. TAM, SAM and SOM force the honesty: the market that *exists*, the slice you can *serve*, and — the number that actually matters — **the market you can win** in the near term.",
    },
    {
      type: "heading",
      level: 2,
      text: "The three rings",
      emphasize: "exists, serve, win",
    },
    {
      type: "prose",
      md: "**TAM** (Total Addressable Market) — total demand if there were no limits, across all geographies and segments; the ceiling on the opportunity, usually sized top-down. **SAM** (Serviceable Addressable Market) — the slice of TAM you can realistically target with your current offering and reach (TAM × penetration). **SOM** (Serviceable Obtainable Market) — the share of SAM you can actually capture near-term given brand, pricing and competition (SAM × your share), built bottom-up.",
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
  <text x="24" y="28" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">TAM / SAM / SOM - SIZING A MARKET IN THREE RINGS</text>
  <text x="24" y="44" fill="hsl(var(--muted-foreground))" font-size="10.5">Three nested estimates - the market that exists, the slice you can serve, and the share you can realistically win.</text>

  <!-- nested boxes -->
  <rect x="24" y="58" width="300" height="252" rx="8" fill="hsl(var(--muted))" opacity="0.55"/>
  <rect x="48" y="118" width="252" height="180" rx="8" fill="hsl(var(--muted))" opacity="0.8"/>
  <rect x="72" y="180" width="204" height="110" rx="8" fill="url(#ng)"/>
  <text x="40" y="86" fill="hsl(var(--foreground))" font-size="15" font-weight="800">TAM</text>
  <text x="86" y="86" fill="hsl(var(--muted-foreground))" font-size="9.5" font-style="italic">the market that exists</text>
  <text x="64" y="148" fill="hsl(var(--foreground))" font-size="15" font-weight="800">SAM</text>
  <text x="112" y="148" fill="hsl(var(--muted-foreground))" font-size="9.5" font-style="italic">what you can serve</text>
  <text x="88" y="210" fill="#ffffff" font-size="15" font-weight="800">SOM</text>
  <text x="136" y="210" fill="#b9c4d6" font-size="9.5" font-style="italic">what you can win</text>
  <text x="174" y="256" text-anchor="middle" fill="#ffffff" font-size="9.5">your realistic</text>
  <text x="174" y="271" text-anchor="middle" fill="#ffffff" font-size="9.5">near-term target</text>

  <!-- right: definitions + formulas -->
  <rect x="346" y="58" width="400" height="80" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="360" y="78" fill="hsl(var(--foreground))" font-size="11" font-weight="700">Total Addressable Market</text>
  <text x="360" y="95" fill="hsl(var(--muted-foreground))" font-size="9.5">Total demand if there were no limits - all geographies,</text>
  <text x="360" y="109" fill="hsl(var(--muted-foreground))" font-size="9.5">segments, use cases. Sized top-down from industry data.</text>
  <text x="360" y="128" fill="hsl(var(--primary))" font-size="9.5" font-weight="700">The ceiling on the opportunity</text>

  <rect x="346" y="146" width="400" height="80" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="360" y="166" fill="hsl(var(--foreground))" font-size="11" font-weight="700">Serviceable Addressable Market</text>
  <text x="360" y="183" fill="hsl(var(--muted-foreground))" font-size="9.5">The slice of TAM you can realistically target with your</text>
  <text x="360" y="197" fill="hsl(var(--muted-foreground))" font-size="9.5">current offering, reach and regulatory access.</text>
  <text x="360" y="216" fill="hsl(var(--primary))" font-size="9.5" font-weight="700">SAM = TAM x market penetration</text>

  <rect x="346" y="234" width="400" height="80" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="254" fill="hsl(var(--foreground))" font-size="11" font-weight="700">Serviceable Obtainable Market</text>
  <text x="360" y="271" fill="hsl(var(--muted-foreground))" font-size="9.5">The share of SAM you can actually capture near-term,</text>
  <text x="360" y="285" fill="hsl(var(--muted-foreground))" font-size="9.5">given brand, pricing and competition. Built bottom-up.</text>
  <text x="360" y="304" fill="hsl(var(--primary))" font-size="9.5" font-weight="700">SOM = SAM x your market share</text>

  <!-- HOW TO USE -->
  <rect x="24" y="318" width="722" height="58" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="38" y="337" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="38" y="354" fill="hsl(var(--foreground))" font-size="11">Size TAM top-down, then narrow to SAM and SOM. The honest number for a plan is SOM.</text>
  <text x="38" y="370" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: quoting TAM as "the opportunity" wildly oversells what you can actually win.</text>
</svg>`,
      caption: "Three nested estimates, narrowing from the whole market to the winnable slice.",
      maxWidth: 760,
      ariaLabel: "TAM, SAM and SOM as three nested boxes — the market that exists, the market you can serve, and the market you can win — with definitions and formulas.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "SOM is the honest number",
    },
    {
      type: "prose",
      md: "Size TAM top-down from industry data, then narrow to SAM and SOM. For any business plan or entry decision, **SOM is the honest number** — what you can realistically capture soon. TAM frames the ambition; quoting it as ‘the opportunity' wildly oversells what you'll actually win.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "Quoting TAM as the opportunity",
      md: "The classic pitch-deck move — ‘it's a $50bn market, we just need 1%' — inverts the logic. That 1% is a bottom-up SOM question (can you actually win it?), not a top-down handwave. Lead with a defensible SOM; use TAM only to frame the ceiling.",
    },
    {
      type: "dialogue",
      title: "From ambition to honest number",
      turns: [
        { speaker: "interviewer", md: "A startup pitches an electric-scooter subscription service and says the Indian two-wheeler market is huge, so the opportunity is enormous. How would you size it properly?" },
        { speaker: "candidate", note: "Narrows TAM down to a defensible SOM.", md: "I'd narrow that ‘huge market' through TAM-SAM-SOM. TAM: all two-wheeler users — large, but mostly people who buy petrol scooters outright, not the real target. SAM: narrow to urban users open to electric *and* to a subscription model rather than ownership — a much smaller slice, in the cities they'll actually operate. SOM: of that, what can they realistically capture in the first couple of years given a few cities, limited fleet, and competition — that's the honest planning number, and it's a tiny fraction of the headline TAM. I'd build the plan on SOM and use TAM only to show the long-run ceiling." },
        { speaker: "narrator", md: "The candidate converted an inflated ‘huge market' into a defensible, bottom-up SOM — the number a plan or investor case actually rests on." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "TAM/SAM/SOM is the sizing engine behind the attractiveness arm of **Market Entry**, and its bottom-up SOM is exactly the kind of build practised in **Guesstimates**.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Distinguish the market that exists (TAM), that you can serve (SAM), and that you can win (SOM).",
        "Size TAM top-down and SOM bottom-up.",
        "Lead a plan with SOM — the honest, near-term number.",
        "Use TAM to frame the ceiling, never as ‘the opportunity'.",
        "Connect the sizing to Market Entry attractiveness and guesstimate practice."
      ],
    }
  ],
};

export default tamsamsom;

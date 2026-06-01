import type { Page } from "../../types";

/**
 * Toolkit - PESTEL Analysis
 * Reference card (Section C). Two inline SVGs (hero + how-to-deploy) to the locked v2 grammar (s9.14).
 */
export const pestel: Page = {
  slug: "toolkit/pestel",
  title: "PESTEL Analysis",
  titleEmphasize: "PESTEL",
  subtitle: "Read the macro forces you can't control before betting on a market.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 9,
    tags: ["pestel", "macro environment", "market entry", "industry analysis", "toolkit"],
    caseType: "macro analysis",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "two or three",
      md: "PESTEL lists six macro forces — political, economic, social, technological, environmental, legal — and the trap is dutifully writing a paragraph on each. The point was never the six. It is finding the **two or three** that actually decide whether a market is worth entering, and which way they are moving.",
    },
    {
      type: "heading",
      level: 2,
      text: "What it scans",
      emphasize: "the world you can't control",
    },
    {
      type: "prose",
      md: "PESTEL is a scan of the macro environment — the forces that act on every player in a market and that no single company controls. It is the right lens when you are weighing an entry, an expansion, or a long-range bet, and you need to know what the wider world will do to your plan.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 404" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="24" y="28" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">PESTEL — SCAN THE MACRO ENVIRONMENT YOU CANNOT CONTROL</text>
  <text x="24" y="44" fill="hsl(var(--muted-foreground))" font-size="10.5">Six lenses on the world your strategy must survive — most matter little; two or three will decide the call.</text>

  <!-- P -->
  <rect x="14" y="52" width="236" height="128" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="26" y="64" width="26" height="26" rx="7" fill="hsl(var(--navy))"/><text x="39" y="82" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">P</text>
  <text x="62" y="82" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Political</text>
  <text x="26" y="108" fill="hsl(var(--muted-foreground))" font-size="10">Government &amp; policy — taxes,</text>
  <text x="26" y="123" fill="hsl(var(--muted-foreground))" font-size="10">tariffs, FDI rules, stability</text>
  <text x="26" y="160" fill="hsl(var(--foreground))" font-size="9.5" font-style="italic">e.g. PLI scheme, import duties</text>
  <!-- E economic -->
  <rect x="262" y="52" width="236" height="128" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="274" y="64" width="26" height="26" rx="7" fill="hsl(var(--navy))"/><text x="287" y="82" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">E</text>
  <text x="310" y="82" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Economic</text>
  <text x="274" y="108" fill="hsl(var(--muted-foreground))" font-size="10">The economy — growth, inflation,</text>
  <text x="274" y="123" fill="hsl(var(--muted-foreground))" font-size="10">interest rates, incomes</text>
  <text x="274" y="160" fill="hsl(var(--foreground))" font-size="9.5" font-style="italic">e.g. rate cycle, rupee, demand</text>
  <!-- S -->
  <rect x="510" y="52" width="236" height="128" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="522" y="64" width="26" height="26" rx="7" fill="hsl(var(--navy))"/><text x="535" y="82" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">S</text>
  <text x="558" y="82" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Social</text>
  <text x="522" y="108" fill="hsl(var(--muted-foreground))" font-size="10">People — demographics, culture,</text>
  <text x="522" y="123" fill="hsl(var(--muted-foreground))" font-size="10">lifestyle and taste shifts</text>
  <text x="522" y="160" fill="hsl(var(--foreground))" font-size="9.5" font-style="italic">e.g. young median age, urbanising</text>
  <!-- T -->
  <rect x="14" y="192" width="236" height="128" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="26" y="204" width="26" height="26" rx="7" fill="hsl(var(--navy))"/><text x="39" y="222" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">T</text>
  <text x="62" y="222" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Technological</text>
  <text x="26" y="248" fill="hsl(var(--muted-foreground))" font-size="10">Tech change — adoption, R&amp;D,</text>
  <text x="26" y="263" fill="hsl(var(--muted-foreground))" font-size="10">new channels and rails</text>
  <text x="26" y="300" fill="hsl(var(--foreground))" font-size="9.5" font-style="italic">e.g. UPI rails, smartphone reach</text>
  <!-- E environmental -->
  <rect x="262" y="192" width="236" height="128" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="274" y="204" width="26" height="26" rx="7" fill="hsl(var(--navy))"/><text x="287" y="222" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">E</text>
  <text x="310" y="222" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Environmental</text>
  <text x="274" y="248" fill="hsl(var(--muted-foreground))" font-size="10">Climate, resources and the</text>
  <text x="274" y="263" fill="hsl(var(--muted-foreground))" font-size="10">sustainability agenda</text>
  <text x="274" y="300" fill="hsl(var(--foreground))" font-size="9.5" font-style="italic">e.g. emission norms, water stress</text>
  <!-- L -->
  <rect x="510" y="192" width="236" height="128" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="522" y="204" width="26" height="26" rx="7" fill="hsl(var(--navy))"/><text x="535" y="222" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">L</text>
  <text x="558" y="222" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Legal</text>
  <text x="522" y="248" fill="hsl(var(--muted-foreground))" font-size="10">Law — labour, IP, safety,</text>
  <text x="522" y="263" fill="hsl(var(--muted-foreground))" font-size="10">sector-specific regulation</text>
  <text x="522" y="300" fill="hsl(var(--foreground))" font-size="9.5" font-style="italic">e.g. data law, licensing regime</text>

  <!-- HOW TO USE -->
  <rect x="14" y="330" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="351" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="368" fill="hsl(var(--foreground))" font-size="11.5">Run the six lenses fast, then keep only the two or three that bear on this call — and note which way they move.</text>
  <text x="28" y="384" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: PESTEL describes the weather, not your route. It sets up Market Entry and the ‘Context’ C — it doesn’t decide them.</text>
</svg>`,
      caption: "The six macro lenses — most matter little; two or three decide the call.",
      maxWidth: 760,
      ariaLabel: "A grid of the six PESTEL factors — political, economic, social, technological, environmental, legal — each with what it covers and an India example.",
    },
    {
      type: "prose",
      md: "Run the six quickly, but resist the urge to treat them equally. In most cases, four of them are background and only two or three genuinely bear on the decision. Your job is to find those, and to say which way each is trending — a tailwind today can be a headwind in two years.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "filter, don't list",
    },
    {
      type: "prose",
      md: "PESTEL is a scan, not a verdict. Walk the six, filter hard to the forces that actually move *this* decision, note their direction, and feed them into the real question — the attractiveness arm of a market-entry call, or the ‘Context’ in a 5 C’s analysis.",
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
  <text x="24" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">USING PESTEL — FOUR MOVES</text>
  <text x="474" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">SAY IT OUT LOUD</text>
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6">
    <path d="M239,108 L239,122" marker-end="url(#ar)"/>
    <path d="M239,190 L239,204" marker-end="url(#ar)"/>
    <path d="M239,272 L239,286" marker-end="url(#ar)"/>
  </g>
  <rect x="24" y="50" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="65" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="84" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">1</text>
  <text x="80" y="75" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Use it for the macro layer</text>
  <text x="80" y="93" fill="hsl(var(--muted-foreground))" font-size="11">forces you can’t control — entry, expansion, long-range bets</text>
  <text x="474" y="75" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Before we enter, which macro</text>
  <text x="474" y="91" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">forces could make or break this?”</text>
  <rect x="24" y="132" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="147" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="166" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">2</text>
  <text x="80" y="157" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Filter ruthlessly</text>
  <text x="80" y="175" fill="hsl(var(--muted-foreground))" font-size="11">for each factor ask: does this actually move THIS decision?</text>
  <text x="474" y="157" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Six headings, but only two</text>
  <text x="474" y="173" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">actually bear on this market.”</text>
  <rect x="24" y="214" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="229" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="248" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">3</text>
  <text x="80" y="239" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Keep the two or three that bind</text>
  <text x="80" y="257" fill="hsl(var(--muted-foreground))" font-size="11">note direction — tailwind or headwind, and how fast</text>
  <text x="474" y="239" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Regulation is a headwind and</text>
  <text x="474" y="255" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">tightening — that’s the binding one.”</text>
  <rect x="24" y="296" width="430" height="58" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <rect x="38" y="311" width="28" height="28" rx="7" fill="hsl(var(--primary))"/><text x="52" y="330" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">4</text>
  <text x="80" y="321" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Feed them into the decision</text>
  <text x="80" y="339" fill="hsl(var(--muted-foreground))" font-size="11">PESTEL feeds the ‘Context’ C and SWOT’s opportunities/threats</text>
  <text x="474" y="321" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“So the macro says enter, but</text>
  <text x="474" y="337" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">hedge the policy risk — here’s how.”</text>
  <rect x="24" y="372" width="712" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="38" y="393" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="38" y="410" fill="hsl(var(--foreground))" font-size="11.5">PESTEL is a scan, not a verdict: filter six headings to the two or three forces that swing the call.</text>
  <text x="38" y="426" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: don’t walk all six for show — an exhaustive PESTEL with no ‘so what’ is the checklist trap.</text>
</svg>`,
      caption: "Four moves that turn a six-factor scan into a decision input.",
      maxWidth: 620,
      ariaLabel: "A four-step flow for using PESTEL: use it for the macro layer, filter ruthlessly, keep the two or three that bind and note direction, and feed them into the decision, with a spoken script beside each step.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "The exhaustive-scan trap",
      md: "Listing all six factors at equal length, with no prioritisation and no ‘so what’, is the single most common PESTEL mistake. Six tidy paragraphs that don’t change the recommendation are worse than two sharp ones that do. Filter, rank, and connect each surviving factor to the decision.",
    },
    {
      type: "heading",
      level: 2,
      text: "Worked example: a global fashion brand eyes India",
      emphasize: "a global fashion brand",
    },
    {
      type: "prose",
      md: "A global fast-fashion retailer is weighing whether to set up manufacturing and retail in India. Before any financial model, they want a read on the macro environment — exactly PESTEL’s job.",
    },
    {
      type: "dialogue",
      title: "PESTEL, filtered",
      turns: [
        { speaker: "interviewer", md: "A global fast-fashion brand is considering entering India — both sourcing and retail. They want a macro read before committing. How would you approach it?" },
        { speaker: "candidate", note: "Runs the six, then filters to what binds.", md: "I’ll scan the six PESTEL factors but only dwell on the ones that move this decision. Politically, FDI in single-brand retail has eased and there are textile production incentives — a tailwind — though local-sourcing requirements are a real constraint. Economically and socially, there’s a large, young, increasingly fashion-conscious consuming class, but it is value-conscious — price matters. Technologically, the online and quick-commerce rails plus widespread digital payments make distribution far easier than a decade ago. Environmental scrutiny of textiles and labour law sit in the background as things to manage, not deal-breakers." },
        { speaker: "interviewer", md: "So which factors actually decide it?" },
        { speaker: "candidate", note: "Names the two that bind, with direction.", md: "Two bind. The political-legal one — sourcing and FDI rules — shapes *how* they enter and is tightening toward local production. And the social-economic one — a huge but price-sensitive young market — shapes *what* they sell and at what price. The technological factor is a clear tailwind that makes reaching that market cheap." },
        { speaker: "candidate", md: "So the macro verdict is: enter — the environment is favourable — but localise sourcing to satisfy the rules and protect margin, and pitch the price to a value-conscious shopper rather than copying the European price ladder. The two binding forces decide the entry model; the other four are context." },
        { speaker: "narrator", md: "The candidate scanned all six but spent their time on the two that bound the decision and stated which way each was moving. PESTEL gave the entry *shape*; it didn’t pretend to be the whole answer." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "PESTEL rarely stands alone. It feeds the attractiveness arm of **Market Entry** and *is* the ‘Context’ lens in the **5 C’s**. Pair it with a firm-level read — right-to-win, or the **Value Chain** — to move from ‘is the environment favourable?’ to ‘can this client win in it?’",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Use PESTEL as a macro scan for entry, expansion and long-range bets — not for a firm’s internal problems.",
        "Run all six factors quickly, then filter to the two or three that actually move the decision.",
        "State the direction of each binding factor — tailwind or headwind, and how fast.",
        "Feed the survivors into Market Entry attractiveness or the ‘Context’ C, rather than treating PESTEL as the answer.",
        "Avoid the exhaustive-scan trap of six equal paragraphs with no ‘so what’."
      ],
    }
  ],
};

export default pestel;


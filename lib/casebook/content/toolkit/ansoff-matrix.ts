import type { Page } from "../../types";

/**
 * Toolkit - Ansoff Matrix
 * Reference card (Section C). Two inline SVGs (hero + how-to-deploy) to the locked v2 grammar (s9.14).
 */
export const ansoffMatrix: Page = {
  slug: "toolkit/ansoff-matrix",
  title: "Ansoff Matrix",
  titleEmphasize: "Ansoff",
  subtitle: "Four growth options, read as a ladder of rising risk.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 9,
    tags: ["ansoff", "growth", "product-market", "risk", "toolkit"],
    caseType: "growth strategy",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "a ladder of risk",
      md: "The Ansoff matrix crosses products with markets to give four growth options — and treated as a flat menu, it quietly hides the most important thing about them. The four are really **a ladder of risk**. Selling more of what you have to who you already serve is safe; doing something new in somewhere new is a leap. Read the order, not just the boxes.",
    },
    {
      type: "heading",
      level: 2,
      text: "The four options",
      emphasize: "products x markets",
    },
    {
      type: "prose",
      md: "Ansoff maps two questions: are we selling *existing or new products*, into *existing or new markets*? **Market penetration** (existing/existing) means selling more of what works to who you already reach. **Product development** (new product, existing market) and **market development** (existing product, new market) each step into one unknown. **Diversification** (new/new) steps into two at once.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 432" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="248" y="44" text-anchor="middle" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">EXISTING PRODUCTS</text>
  <text x="566" y="44" text-anchor="middle" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">NEW PRODUCTS</text>
  <text x="30" y="121" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10.5" font-weight="700" letter-spacing="0.06em" transform="rotate(-90 30 121)">EXISTING MARKETS</text>
  <text x="30" y="263" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10.5" font-weight="700" letter-spacing="0.06em" transform="rotate(-90 30 263)">NEW MARKETS</text>

  <!-- risk legend -->

  <!-- Market penetration (top-left, lowest risk, highlighted as start) -->
  <rect x="70" y="56" width="332" height="130" rx="11" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.8" filter="url(#cs)"/>
  <text x="86" y="80" fill="hsl(var(--foreground))" font-size="13" font-weight="700">Market penetration</text>
  <rect x="300" y="66" width="92" height="20" rx="6" fill="hsl(var(--muted))"/><text x="346" y="80" text-anchor="middle" fill="hsl(var(--foreground))" font-size="9" font-weight="700">RISK: LOW</text>
  <text x="86" y="98" fill="hsl(var(--muted-foreground))" font-size="9.5">same products, same market - sell more of what works</text>
  <circle cx="90" cy="119" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="123" fill="hsl(var(--foreground))" font-size="10.5">More usage, more outlets, share gain</text>
  <circle cx="90" cy="141" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="145" fill="hsl(var(--foreground))" font-size="10.5">Cheapest to execute, best understood</text>
  <circle cx="90" cy="163" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="167" fill="hsl(var(--foreground))" font-size="10.5">Start here unless it is tapped out</text>

  <!-- Product development (top-right) -->
  <rect x="414" y="56" width="332" height="130" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="430" y="80" fill="hsl(var(--foreground))" font-size="13" font-weight="700">Product development</text>
  <rect x="624" y="66" width="106" height="20" rx="6" fill="hsl(var(--muted))"/><text x="677" y="80" text-anchor="middle" fill="hsl(var(--foreground))" font-size="9" font-weight="700">RISK: MEDIUM</text>
  <text x="430" y="98" fill="hsl(var(--muted-foreground))" font-size="9.5">new products, same market - sell more to who you know</text>
  <circle cx="434" cy="119" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="123" fill="hsl(var(--foreground))" font-size="10.5">New lines for existing customers</text>
  <circle cx="434" cy="141" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="145" fill="hsl(var(--foreground))" font-size="10.5">Needs R&amp;D, but the market is known</text>
  <circle cx="434" cy="163" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="167" fill="hsl(var(--foreground))" font-size="10.5">Leans on brand and relationships</text>

  <!-- Market development (bottom-left) -->
  <rect x="70" y="198" width="332" height="130" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="86" y="222" fill="hsl(var(--foreground))" font-size="13" font-weight="700">Market development</text>
  <rect x="290" y="208" width="106" height="20" rx="6" fill="hsl(var(--muted))"/><text x="343" y="222" text-anchor="middle" fill="hsl(var(--foreground))" font-size="9" font-weight="700">RISK: MEDIUM</text>
  <text x="86" y="240" fill="hsl(var(--muted-foreground))" font-size="9.5">same products, new market - take what works elsewhere</text>
  <circle cx="90" cy="261" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="265" fill="hsl(var(--foreground))" font-size="10.5">New geographies or segments</text>
  <circle cx="90" cy="283" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="287" fill="hsl(var(--foreground))" font-size="10.5">Product known, market unknown</text>
  <circle cx="90" cy="305" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="309" fill="hsl(var(--foreground))" font-size="10.5">Often a market-entry question</text>

  <!-- Diversification (bottom-right, highest risk) -->
  <rect x="414" y="198" width="332" height="130" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="430" y="222" fill="hsl(var(--foreground))" font-size="13" font-weight="700">Diversification</text>
  <rect x="636" y="208" width="94" height="20" rx="6" fill="hsl(var(--primary))"/><text x="683" y="222" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="700">RISK: HIGH</text>
  <text x="430" y="240" fill="hsl(var(--muted-foreground))" font-size="9.5">new products, new market - both unknowns at once</text>
  <circle cx="434" cy="261" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="265" fill="hsl(var(--foreground))" font-size="10.5">New product AND new market</text>
  <circle cx="434" cy="283" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="287" fill="hsl(var(--foreground))" font-size="10.5">Related (synergy) or unrelated (pure bet)</text>
  <circle cx="434" cy="305" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="309" fill="hsl(var(--foreground))" font-size="10.5">Highest reward, highest chance of failure</text>

  <!-- diagonal risk arrow -->
  <g fill="none" stroke="hsl(var(--primary))" stroke-width="1.6" opacity="0.6">
    <path d="M392,176 L424,196" marker-end="url(#ar)"/>
  </g>

  <!-- HOW TO USE -->
  <rect x="14" y="354" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="375" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="392" fill="hsl(var(--foreground))" font-size="11.5">Read it as a risk ladder: exhaust low-risk penetration first, then step out one axis at a time. Diversification is a last resort.</text>
  <text x="28" y="408" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: each step away from your home square adds an unknown. Moving on both axes at once doubles the risk.</text>
</svg>`,
      caption: "The four quadrants, ordered as a risk ladder from penetration to diversification.",
      maxWidth: 760,
      ariaLabel: "The Ansoff matrix: market penetration (low risk), product development and market development (medium risk), and diversification (high risk), arranged products against markets with a diagonal of rising risk.",
    },
    {
      type: "prose",
      md: "The further you move from your home square — existing product, existing market — the more unknowns you take on, and the higher the risk and the cost. Penetration leans on things you already know; diversification asks you to learn a new product *and* a new customer simultaneously, which is why it fails most often.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "climb, don't leap",
    },
    {
      type: "prose",
      md: "Start in the home square and ask whether penetration is really exhausted — it usually isn't. Then step out one axis at a time, price each move by its risk, and sequence rather than scatter. Diversification is a last resort reached deliberately, not the exciting first idea on the whiteboard.",
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
  <text x="24" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">USING THE ANSOFF MATRIX - FOUR MOVES</text>
  <text x="474" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">SAY IT OUT LOUD</text>
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6">
    <path d="M239,108 L239,122" marker-end="url(#ar)"/>
    <path d="M239,190 L239,204" marker-end="url(#ar)"/>
    <path d="M239,272 L239,286" marker-end="url(#ar)"/>
  </g>
  <rect x="24" y="50" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="65" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="84" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">1</text>
  <text x="80" y="75" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Start in the home square</text>
  <text x="80" y="93" fill="hsl(var(--muted-foreground))" font-size="11">existing product, existing market - is penetration really tapped out?</text>
  <text x="474" y="75" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Before anything new, how much room</text>
  <text x="474" y="91" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">is left selling what we have to who we have?”</text>
  <rect x="24" y="132" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="147" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="166" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">2</text>
  <text x="80" y="157" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Step out one axis at a time</text>
  <text x="80" y="175" fill="hsl(var(--muted-foreground))" font-size="11">new product OR new market - not both unless forced</text>
  <text x="474" y="157" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“The safer next step is a new region</text>
  <text x="474" y="173" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">with the same product, not a new bet.”</text>
  <rect x="24" y="214" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="229" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="248" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">3</text>
  <text x="80" y="239" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Price each move by risk</text>
  <text x="80" y="257" fill="hsl(var(--muted-foreground))" font-size="11">penetration is cheap and known; diversification is a leap</text>
  <text x="474" y="239" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Diversifying means two unknowns at</text>
  <text x="474" y="255" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">once - that’s the riskiest option here.”</text>
  <rect x="24" y="296" width="430" height="58" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <rect x="38" y="311" width="28" height="28" rx="7" fill="hsl(var(--primary))"/><text x="52" y="330" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">4</text>
  <text x="80" y="321" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Sequence, don’t scatter</text>
  <text x="80" y="339" fill="hsl(var(--muted-foreground))" font-size="11">ladder the moves; treat diversification as a last resort</text>
  <text x="474" y="321" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“So: max the core first, then a new</text>
  <text x="474" y="337" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">market - diversify only if both stall.”</text>
  <rect x="24" y="372" width="712" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="38" y="393" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="38" y="410" fill="hsl(var(--foreground))" font-size="11.5">Ansoff is a risk ladder, not a menu. Exhaust the low-risk home square first, then step out one axis at a time.</text>
  <text x="38" y="426" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: moving on both axes at once (diversification) multiplies risk - it’s where most ambitious growth plans quietly die.</text>
</svg>`,
      caption: "Four moves that turn the matrix into a sequenced growth plan.",
      maxWidth: 620,
      ariaLabel: "A four-step flow for using the Ansoff matrix: start in the home square, step out one axis at a time, price each move by risk, and sequence rather than scatter, with a spoken script beside each step.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "Leaping straight to diversification",
      md: "Ambitious growth conversations love diversification — a shiny new product in a shiny new market. But moving on both axes at once multiplies the unknowns and is where most growth plans die. If the home square still has room, that cheaper, safer growth almost always comes first.",
    },
    {
      type: "heading",
      level: 2,
      text: "Worked example: laddering a packaged-foods brand",
      emphasize: "packaged-foods brand",
    },
    {
      type: "prose",
      md: "A packaged-foods brand, strong with biscuits in north India, wants ambitious growth. Ansoff orders the options by risk so they climb instead of leap.",
    },
    {
      type: "dialogue",
      title: "Climbing the ladder",
      turns: [
        { speaker: "interviewer", md: "A packaged-foods company is a strong biscuit brand in north India and wants aggressive growth. The team is excited about launching a new snacks line nationally. How would you think about the options?" },
        { speaker: "candidate", note: "Lays out the four as a risk ladder.", md: "I'd lay the options on an Ansoff ladder by risk. Lowest risk — penetration: sell more biscuits in north India through more outlets and higher usage. Next — market development: take the same biscuits to new regions, south or east. Or product development: new products, like snacks, to their existing north-India customers and trade. Highest risk — diversification: a new snacks line in new regions at the same time, which is exactly what the team is excited about." },
        { speaker: "interviewer", md: "And your recommendation?" },
        { speaker: "candidate", note: "Sequences instead of leaping.", md: "I'd push back gently on leaping straight to the riskiest box. First, is penetration really tapped out? If they can still gain biscuit share in their home market, that's the cheapest growth and it funds everything else. Then step out one axis: I'd favour market development — same trusted biscuits into new regions — because the product is proven and only the market is new. Snacks (product development) can follow, to the customers who already trust them. Diversification — new snacks in new regions at once — only if the safer rungs are genuinely exhausted, and even then, staged. Climb the ladder; don't jump to the top." },
        { speaker: "narrator", md: "The candidate reframed an exciting but risky idea as the top of a ladder, and sequenced the safer rungs first. Reading Ansoff as risk-ordered — not as four equal choices — is what turned enthusiasm into a plan." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "Ansoff is a lens on the **Growth** decision — it sorts organic growth options by risk, where the Growth framework structures the full organic-plus-inorganic picture. Its ‘new market’ quadrants are **Market Entry** questions, and ‘diversification’ shades into the corporate-strategy logic behind **M&A**.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Read the Ansoff matrix as a risk ladder, not a flat menu of four equal options.",
        "Start in the home square and check whether penetration is genuinely exhausted first.",
        "Step out one axis at a time — new product or new market, rarely both.",
        "Price each move by its risk and sequence them rather than scattering.",
        "Treat diversification as a deliberate last resort, since it carries two unknowns at once."
      ],
    }
  ],
};

export default ansoffMatrix;

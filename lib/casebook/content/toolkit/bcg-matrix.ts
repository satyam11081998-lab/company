import type { Page } from "../../types";

/**
 * Toolkit - BCG Growth–Share Matrix
 * Reference card (Section C). Two inline SVGs (hero + how-to-deploy) to the locked v2 grammar (s9.14).
 */
export const bcgMatrix: Page = {
  slug: "toolkit/bcg-matrix",
  title: "BCG Growth–Share Matrix",
  titleEmphasize: "BCG",
  subtitle: "A portfolio tool for deciding where the cash should go - and what to let go of.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 9,
    tags: ["bcg", "growth-share matrix", "portfolio", "capital allocation", "toolkit"],
    caseType: "portfolio strategy",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "where the cash goes",
      md: "The BCG matrix looks like a way to label businesses — star, cash cow, question mark, dog — and that label-making is exactly how it gets misused. It is a **portfolio and cash-allocation** tool. The real output is not four labels; it is a decision about **where the cash goes**: which businesses you fund, which you milk, and which you let go.",
    },
    {
      type: "heading",
      level: 2,
      text: "What it maps",
      emphasize: "growth against share",
    },
    {
      type: "prose",
      md: "The matrix plots each business or product on two axes: how fast its *market* is growing, and the firm's *relative market share* within it. High growth needs cash to fund; high share generates cash. Cross the two and you get four cells — and, more usefully, a picture of which parts of the portfolio produce cash and which consume it.",
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
  <!-- column headers -->
  <text x="248" y="44" text-anchor="middle" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HIGH RELATIVE SHARE</text>
  <text x="566" y="44" text-anchor="middle" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">LOW RELATIVE SHARE</text>
  <!-- row labels -->
  <text x="30" y="121" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10.5" font-weight="700" letter-spacing="0.06em" transform="rotate(-90 30 121)">HIGH GROWTH</text>
  <text x="30" y="263" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10.5" font-weight="700" letter-spacing="0.06em" transform="rotate(-90 30 263)">LOW GROWTH</text>

  <!-- Star (top-left, highlighted) -->
  <rect x="70" y="56" width="332" height="130" rx="11" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.8" filter="url(#cs)"/>
  <text x="86" y="80" fill="hsl(var(--foreground))" font-size="13.5" font-weight="700">Star</text>
  <text x="86" y="97" fill="hsl(var(--muted-foreground))" font-size="9.5">high growth, high share - the leaders you protect</text>
  <circle cx="90" cy="118" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="122" fill="hsl(var(--foreground))" font-size="10.5">Market-leading and fast-growing</text>
  <circle cx="90" cy="140" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="144" fill="hsl(var(--foreground))" font-size="10.5">Hungry for cash to hold the lead</text>
  <circle cx="90" cy="162" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="166" fill="hsl(var(--foreground))" font-size="10.5">Tomorrow's cash cow - invest</text>

  <!-- Question mark (top-right) -->
  <rect x="414" y="56" width="332" height="130" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="430" y="80" fill="hsl(var(--foreground))" font-size="13.5" font-weight="700">Question mark</text>
  <text x="430" y="97" fill="hsl(var(--muted-foreground))" font-size="9.5">high growth, low share - the bets you must call</text>
  <circle cx="434" cy="118" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="122" fill="hsl(var(--foreground))" font-size="10.5">Growing market, but we are small</text>
  <circle cx="434" cy="140" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="144" fill="hsl(var(--foreground))" font-size="10.5">Invest hard to build a star...</text>
  <circle cx="434" cy="162" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="166" fill="hsl(var(--foreground))" font-size="10.5">...or exit before it drains cash</text>

  <!-- Cash cow (bottom-left) -->
  <rect x="70" y="198" width="332" height="130" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="86" y="222" fill="hsl(var(--foreground))" font-size="13.5" font-weight="700">Cash cow</text>
  <text x="86" y="239" fill="hsl(var(--muted-foreground))" font-size="9.5">low growth, high share - where the cash comes from</text>
  <circle cx="90" cy="260" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="264" fill="hsl(var(--foreground))" font-size="10.5">Leader in a mature market</text>
  <circle cx="90" cy="282" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="286" fill="hsl(var(--foreground))" font-size="10.5">Throws off more cash than it needs</text>
  <circle cx="90" cy="304" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="308" fill="hsl(var(--foreground))" font-size="10.5">Milk it - fund the stars and bets</text>

  <!-- Dog (bottom-right) -->
  <rect x="414" y="198" width="332" height="130" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="430" y="222" fill="hsl(var(--foreground))" font-size="13.5" font-weight="700">Dog</text>
  <text x="430" y="239" fill="hsl(var(--muted-foreground))" font-size="9.5">low growth, low share - the drag to prune</text>
  <circle cx="434" cy="260" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="264" fill="hsl(var(--foreground))" font-size="10.5">Small share of a slow market</text>
  <circle cx="434" cy="282" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="286" fill="hsl(var(--foreground))" font-size="10.5">Ties up cash for little return</text>
  <circle cx="434" cy="304" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="308" fill="hsl(var(--foreground))" font-size="10.5">Fix, divest, or quietly retire</text>

  <!-- cash-flow arrows: cow funds star + question mark; question mark -> star -->
  <g fill="none" stroke="hsl(var(--primary))" stroke-width="1.6" opacity="0.65">
    <path d="M236,198 L236,188" marker-end="url(#ar)"/>
    <path d="M402,121 L416,121" marker-end="url(#ar)"/>
  </g>
  <text x="250" y="195" fill="hsl(var(--primary))" font-size="8.5" font-style="italic">cash funds growth</text>
  <text x="300" y="113" text-anchor="middle" fill="hsl(var(--primary))" font-size="8.5" font-style="italic">win share</text>

  <!-- HOW TO USE -->
  <rect x="14" y="354" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="375" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="392" fill="hsl(var(--foreground))" font-size="11.5">Plot each business by market growth and relative share, then move cash: cows fund the stars and the question marks worth backing.</text>
  <text x="28" y="408" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: relative share is a rough proxy for advantage, not profit. A "dog" with loyal niche margins may be worth keeping.</text>
</svg>`,
      caption: "The four cells, and the cash that should flow between them.",
      maxWidth: 760,
      ariaLabel: "The BCG growth-share matrix: stars (high growth, high share), cash cows (low growth, high share), question marks (high growth, low share), and dogs (low growth, low share), with cash flowing from cows to fund stars and selected question marks.",
    },
    {
      type: "prose",
      md: "The cells tell a cash story. **Cash cows** — leaders in slow markets — throw off more cash than they need. **Stars** — leaders in fast markets — are tomorrow's cows but need heavy investment today. **Question marks** — small players in fast markets — are bets: fund them into stars or get out. **Dogs** — small players in slow markets — mostly tie up cash for little return. The art is routing the cows' cash to the stars and the question marks worth backing.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "a capital verdict",
    },
    {
      type: "prose",
      md: "Treat BCG as capital allocation, not taxonomy. Plot each unit honestly, follow the cash rather than the cute labels, and give every cell a verdict: invest, hold, harvest, or exit. A matrix that ends with four populated cells and no investment decision has missed its entire purpose.",
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
  <text x="24" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">USING THE BCG MATRIX - FOUR MOVES</text>
  <text x="474" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">SAY IT OUT LOUD</text>
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6">
    <path d="M239,108 L239,122" marker-end="url(#ar)"/>
    <path d="M239,190 L239,204" marker-end="url(#ar)"/>
    <path d="M239,272 L239,286" marker-end="url(#ar)"/>
  </g>
  <rect x="24" y="50" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="65" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="84" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">1</text>
  <text x="80" y="75" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Define the unit and the axes</text>
  <text x="80" y="93" fill="hsl(var(--muted-foreground))" font-size="11">one product / business per dot; pick a real growth and share measure</text>
  <text x="474" y="75" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Let me plot each business line by</text>
  <text x="474" y="91" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">market growth and relative share.”</text>
  <rect x="24" y="132" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="147" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="166" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">2</text>
  <text x="80" y="157" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Place each business honestly</text>
  <text x="80" y="175" fill="hsl(var(--muted-foreground))" font-size="11">star, cash cow, question mark or dog - no wishful thinking</text>
  <text x="474" y="157" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“This one looks like a star but its</text>
  <text x="474" y="173" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">share is third - it’s a question mark.”</text>
  <rect x="24" y="214" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="229" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="248" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">3</text>
  <text x="80" y="239" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Follow the cash, not the labels</text>
  <text x="80" y="257" fill="hsl(var(--muted-foreground))" font-size="11">cows fund stars and the question marks worth backing; prune dogs</text>
  <text x="474" y="239" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“The cow funds the two stars; we</text>
  <text x="474" y="255" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">back one question mark, exit the other.”</text>
  <rect x="24" y="296" width="430" height="58" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <rect x="38" y="311" width="28" height="28" rx="7" fill="hsl(var(--primary))"/><text x="52" y="330" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">4</text>
  <text x="80" y="321" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Decide invest / hold / harvest / exit</text>
  <text x="80" y="339" fill="hsl(var(--muted-foreground))" font-size="11">every box gets a capital verdict, not a description</text>
  <text x="474" y="321" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“So: invest here, harvest the cow,</text>
  <text x="474" y="337" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">and divest the dog this year.”</text>
  <rect x="24" y="372" width="712" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="38" y="393" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="38" y="410" fill="hsl(var(--foreground))" font-size="11.5">BCG is a capital-allocation tool, not a label-maker. The output is a fund-this / milk-that / exit-this decision across the portfolio.</text>
  <text x="38" y="426" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: relative share proxies advantage, not profit - a profitable niche ‘dog’ can be worth keeping. Don’t divest on the grid alone.</text>
</svg>`,
      caption: "Four moves that turn the grid into a capital-allocation decision.",
      maxWidth: 620,
      ariaLabel: "A four-step flow for using the BCG matrix: define the unit and axes, place each business honestly, follow the cash not the labels, and decide invest/hold/harvest/exit, with a spoken script beside each step.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "Share is not profit",
      md: "Relative market share is a *proxy* for advantage and cash generation — it is not the same as profitability. A small, loyal, high-margin niche business will sit in the ‘dog’ cell and yet be worth keeping. Never divest on grid position alone; check the actual economics before you act on a label.",
    },
    {
      type: "heading",
      level: 2,
      text: "Worked example: a conglomerate allocates capital",
      emphasize: "a conglomerate",
    },
    {
      type: "prose",
      md: "An Indian conglomerate spans several businesses and has limited capital to deploy next year. BCG is the fastest way to decide which units get fed and which get starved.",
    },
    {
      type: "dialogue",
      title: "Routing the cash",
      turns: [
        { speaker: "interviewer", md: "A diversified Indian group has five businesses and a fixed capital budget for next year. The chair wants a simple view of where to put the money. How would you frame it?" },
        { speaker: "candidate", note: "Plots on the two axes before judging.", md: "I'd map the five on a BCG grid — market growth on one axis, our relative share on the other. Say their legacy cement business is a cash cow: slow market, but they're a leader, so it throws off steady cash. Their consumer-electronics arm is a star: fast-growing and they're near the top, but it's hungry for investment. A new EV-components venture is a question mark — fast market, but they're a small player. And an old landline-equipment unit is a dog: shrinking market, tiny share." },
        { speaker: "interviewer", md: "So where does the money go?" },
        { speaker: "candidate", note: "Follows the cash, gives each a verdict.", md: "Follow the cash, not the labels. Milk the cement cow — don't over-invest in a slow market — and route that cash to two places: keep funding the electronics star so it stays a leader as the market grows, and make a real call on the EV question mark. That one's the live decision: either back it hard enough to build a genuine position, or exit before it quietly drains cash for years. The landline dog gets harvested or sold, and its capital redeployed." },
        { speaker: "candidate", md: "One caveat before anyone acts: I'd check the dog's actual margins. If it's a small but genuinely profitable niche, ‘dog’ is the wrong reason to kill it. The grid points; the P&L decides." },
        { speaker: "narrator", md: "The candidate used BCG as a cash-routing tool, not a labelling exercise — every unit got an invest/milk/exit verdict, and they checked profitability before trusting the grid. That is the difference between deploying the framework and decorating with it." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "BCG is a portfolio view — it sits above the **Growth** decision (which businesses to grow) and leans on **Profitability** to sanity-check each cell's real economics. The ‘market growth’ axis is exactly the kind of read a **PESTEL** or industry scan gives you, and ‘relative share’ is where a competitive look pays off.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Use BCG as a portfolio and cash-allocation tool, not a way to label businesses.",
        "Plot each unit by market growth and relative share, and read which cells produce vs consume cash.",
        "Route cash cows' surplus to the stars and the question marks worth backing.",
        "Give every cell a capital verdict — invest, hold, harvest, or exit.",
        "Remember relative share proxies advantage, not profit — check the economics before divesting a ‘dog’."
      ],
    }
  ],
};

export default bcgMatrix;

import type { Page } from "../../types";

/**
 * Toolkit - SWOT Analysis
 * Reference card (Section C). Two inline SVGs (hero + how-to-deploy) to the locked v2 grammar (s9.14).
 */
export const swot: Page = {
  slug: "toolkit/swot",
  title: "SWOT Analysis",
  titleEmphasize: "SWOT",
  subtitle: "A fast, honest read of where a business stands - and the discipline to turn it into action.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 9,
    tags: ["swot", "tows", "situation analysis", "strategy", "toolkit"],
    caseType: "situation analysis",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "into a move",
      md: "SWOT is the framework everyone can name and most people misuse: four boxes, a handful of bullets, and no decision at the end. Used well it is a fast, honest read of where a business stands — and, crucially, it does not stop at four lists. It pairs them. The whole skill is turning four boxes **into a move**.",
    },
    {
      type: "heading",
      level: 2,
      text: "What it maps",
      emphasize: "two simple axes",
    },
    {
      type: "prose",
      md: "SWOT sorts everything about a business onto two axes. One axis is *internal vs external*: strengths and weaknesses are yours and within your control; opportunities and threats belong to the outside world. The other is *helpful vs harmful*. Strengths and opportunities help; weaknesses and threats hurt. Keeping those axes honest is most of the discipline — a favourable new policy is an external opportunity, not a strength you can claim.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 420" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <!-- top axis labels -->
  <text x="236" y="50" text-anchor="middle" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HELPFUL — BUILD ON THESE</text>
  <text x="580" y="50" text-anchor="middle" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HARMFUL — MANAGE THESE</text>
  <!-- left axis labels (rotated) -->
  <text x="30" y="127" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10.5" font-weight="700" letter-spacing="0.07em" transform="rotate(-90 30 127)">INTERNAL</text>
  <text x="30" y="269" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10.5" font-weight="700" letter-spacing="0.07em" transform="rotate(-90 30 269)">EXTERNAL</text>

  <!-- S -->
  <rect x="70" y="62" width="332" height="130" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="86" y="86" fill="hsl(var(--foreground))" font-size="13.5" font-weight="700">Strengths</text>
  <text x="86" y="103" fill="hsl(var(--muted-foreground))" font-size="9.5">what we do better than rivals — ours, and in our control</text>
  <circle cx="90" cy="124" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="128" fill="hsl(var(--foreground))" font-size="10.5">Loyal, repeat customer base</text>
  <circle cx="90" cy="146" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="150" fill="hsl(var(--foreground))" font-size="10.5">Proprietary tech or process</text>
  <circle cx="90" cy="168" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="172" fill="hsl(var(--foreground))" font-size="10.5">Strong brand or distribution</text>

  <!-- W -->
  <rect x="414" y="62" width="332" height="130" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="430" y="86" fill="hsl(var(--foreground))" font-size="13.5" font-weight="700">Weaknesses</text>
  <text x="430" y="103" fill="hsl(var(--muted-foreground))" font-size="9.5">internal gaps holding us back from our potential</text>
  <circle cx="434" cy="124" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="128" fill="hsl(var(--foreground))" font-size="10.5">Thin balance sheet, high leverage</text>
  <circle cx="434" cy="146" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="150" fill="hsl(var(--foreground))" font-size="10.5">Patchy supply chain</text>
  <circle cx="434" cy="168" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="172" fill="hsl(var(--foreground))" font-size="10.5">Low brand awareness</text>

  <!-- O -->
  <rect x="70" y="204" width="332" height="130" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="86" y="228" fill="hsl(var(--foreground))" font-size="13.5" font-weight="700">Opportunities</text>
  <text x="86" y="245" fill="hsl(var(--muted-foreground))" font-size="9.5">external trends we could ride — within a time frame</text>
  <circle cx="90" cy="266" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="270" fill="hsl(var(--foreground))" font-size="10.5">Rising category demand</text>
  <circle cx="90" cy="288" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="292" fill="hsl(var(--foreground))" font-size="10.5">Favourable policy or tariffs</text>
  <circle cx="90" cy="310" r="2.8" fill="hsl(var(--primary))"/><text x="100" y="314" fill="hsl(var(--foreground))" font-size="10.5">New channel or geography</text>

  <!-- T -->
  <rect x="414" y="204" width="332" height="130" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="430" y="228" fill="hsl(var(--foreground))" font-size="13.5" font-weight="700">Threats</text>
  <text x="430" y="245" fill="hsl(var(--muted-foreground))" font-size="9.5">external forces that could harm the business</text>
  <circle cx="434" cy="266" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="270" fill="hsl(var(--foreground))" font-size="10.5">New low-cost entrants</text>
  <circle cx="434" cy="288" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="292" fill="hsl(var(--foreground))" font-size="10.5">Tighter regulation</text>
  <circle cx="434" cy="310" r="2.8" fill="hsl(var(--primary))"/><text x="444" y="314" fill="hsl(var(--foreground))" font-size="10.5">Input-cost inflation</text>

  <!-- HOW TO USE -->
  <rect x="14" y="346" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="367" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="384" fill="hsl(var(--foreground))" font-size="11.5">Left column is yours to act on; right column you must manage. Top row you control; bottom row you only respond to.</text>
  <text x="28" y="400" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: the quadrants are the start, not the answer — pair them into moves (see the next diagram).</text>
</svg>`,
      caption: "SWOT on two axes — internal vs external, helpful vs harmful.",
      maxWidth: 760,
      ariaLabel: "A two-by-two SWOT grid: strengths and weaknesses on the internal row, opportunities and threats on the external row, with helpful items on the left and harmful on the right.",
    },
    {
      type: "prose",
      md: "Fill each box with *facts*, not adjectives. “Strong brand” is an opinion; “42% of customers reorder within 90 days” is a strength you can build on. The more specific and evidenced each entry, the more useful the pairing step that follows.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "pair the boxes",
    },
    {
      type: "prose",
      md: "A SWOT that ends in four lists has done nothing. The value comes from *pairing* the boxes into action — often called TOWS. Use a strength to seize an opportunity; use a strength to defend against a threat; fix a weakness so you can capture an opportunity; and shore up where a weakness meets a threat. Then prioritise the one or two pairings that matter.",
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
  <text x="24" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">USING SWOT — FOUR MOVES</text>
  <text x="474" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">SAY IT OUT LOUD</text>
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6">
    <path d="M239,108 L239,122" marker-end="url(#ar)"/>
    <path d="M239,190 L239,204" marker-end="url(#ar)"/>
    <path d="M239,272 L239,286" marker-end="url(#ar)"/>
  </g>
  <rect x="24" y="50" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="65" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="84" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">1</text>
  <text x="80" y="75" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Fill each box with facts</text>
  <text x="80" y="93" fill="hsl(var(--muted-foreground))" font-size="11">specifics you can evidence, not vague adjectives</text>
  <text x="474" y="75" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Strength: 42% of buyers reorder</text>
  <text x="474" y="91" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">— that is concrete, not ‘good brand’.”</text>
  <rect x="24" y="132" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="147" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="166" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">2</text>
  <text x="80" y="157" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Keep internal vs external honest</text>
  <text x="80" y="175" fill="hsl(var(--muted-foreground))" font-size="11">strengths/weaknesses are ours; opportunities/threats are the world’s</text>
  <text x="474" y="157" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“A new tax break is an external</text>
  <text x="474" y="173" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">trend — an opportunity, not a strength.”</text>
  <rect x="24" y="214" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="229" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="248" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">3</text>
  <text x="80" y="239" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Pair the boxes into strategy (TOWS)</text>
  <text x="80" y="257" fill="hsl(var(--muted-foreground))" font-size="11">S×O seize · S×T defend · W×O fix-to-capture · W×T protect</text>
  <text x="474" y="239" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Our brand strength can ride the</text>
  <text x="474" y="255" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">premiumisation trend — that’s a move.”</text>
  <rect x="24" y="296" width="430" height="58" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <rect x="38" y="311" width="28" height="28" rx="7" fill="hsl(var(--primary))"/><text x="52" y="330" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">4</text>
  <text x="80" y="321" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Land two or three prioritised moves</text>
  <text x="80" y="339" fill="hsl(var(--muted-foreground))" font-size="11">a SWOT that ends in four lists has done nothing</text>
  <text x="474" y="321" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“So the priority is the strength-</text>
  <text x="474" y="337" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">opportunity play — here’s step one.”</text>
  <rect x="24" y="372" width="712" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="38" y="393" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="38" y="410" fill="hsl(var(--foreground))" font-size="11.5">SWOT only pays off when you convert it: pair the boxes into moves and prioritise. Four lists score nothing.</text>
  <text x="38" y="426" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: ‘good brand’ or ‘weak supply chain’ aren’t analysis — force every box to an evidenced fact.</text>
</svg>`,
      caption: "Four moves that turn a SWOT into a prioritised set of actions.",
      maxWidth: 620,
      ariaLabel: "A four-step flow for using SWOT: fill each box with facts, keep internal and external honest, pair the boxes into strategy with TOWS, and land two or three prioritised moves, with a spoken script beside each step.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "Four lists is not analysis",
      md: "The classic failure is presenting four neat lists and stopping. The interviewer is waiting for the *so what*. Always convert: “Our strength in X lets us capture the Y opportunity — here is the move.” A SWOT with no pairing and no priority reads as a school exercise, not a recommendation.",
    },
    {
      type: "heading",
      level: 2,
      text: "Worked example: a regional snack brand goes national",
      emphasize: "regional snack brand",
    },
    {
      type: "prose",
      md: "A well-loved South Indian snacks brand, strong in its home state, is debating a national push against far bigger players. A SWOT is the quickest way to see whether — and how — it can.",
    },
    {
      type: "dialogue",
      title: "SWOT, then a move",
      turns: [
        { speaker: "interviewer", md: "A regional snacks brand with a loyal following in Karnataka wants to go national. The founder asks for a quick read on their position and what they should actually do. How would you frame it?" },
        { speaker: "candidate", note: "Sorts onto the two axes with facts, not adjectives.", md: "I’ll run a quick SWOT, but with specifics. Strengths, internal: an authentic regional brand with a genuinely loyal base and an efficient supply network in the south. Weaknesses, internal: a thin marketing budget against the national giants, patchy cold-chain for some products, and almost no awareness outside the south. Opportunities, external: a clear premium and ‘nostalgia’ snacking trend, and quick-commerce giving small brands metro shelf space without a distributor war. Threats, external: national players who can outspend them many times over, and edible-oil cost inflation." },
        { speaker: "interviewer", md: "That is a tidy list. So what should they do?" },
        { speaker: "candidate", note: "Pairs strength × opportunity rather than listing.", md: "The honest read is they cannot win a broad national FMCG war — that pairs their biggest weakness (budget) against their biggest threat (giants outspending them). So I would not fight there. Instead I’d pair their strength — authentic regional specialities — with the opportunity — premiumisation plus quick-commerce. The move: launch a premium regional-speciality range on quick-commerce in metros with a large southern diaspora, where the brand already means something. It sidesteps the distributor war and the giants’ strength." },
        { speaker: "candidate", md: "And one defensive move from the weakness–threat corner: hedge the oil-cost exposure with forward contracts before scaling, so a margin shock doesn’t kill the launch." },
        { speaker: "narrator", md: "The candidate never stopped at four lists. They paired the boxes — found the war they’d lose and the niche they’d win — and came out with a prioritised move. That conversion is what turns a SWOT from a school answer into advice." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "SWOT’s opportunities and threats are really the output of a **PESTEL** scan and a read of industry forces; don’t re-derive them, reuse them. And the moves a SWOT surfaces usually feed a bigger decision — a **Market Entry** call or a **Growth** play — where you structure the chosen pairing properly.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Sort any business situation onto SWOT’s two axes — internal vs external, helpful vs harmful — without confusing the two.",
        "Fill each box with specific, evidenced facts instead of vague adjectives.",
        "Convert the four boxes into action by pairing them (TOWS): seize, defend, fix-to-capture, protect.",
        "Prioritise the one or two pairings that actually matter and lead with them.",
        "Recognise SWOT’s external boxes as PESTEL output, and reuse rather than re-derive them.",
        "Avoid the four-lists trap by always landing on a ‘so what’."
      ],
    }
  ],
};

export default swot;


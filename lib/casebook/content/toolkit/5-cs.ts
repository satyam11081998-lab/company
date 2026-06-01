import type { Page } from "../../types";

/**
 * Toolkit - The 5 C's of Marketing
 * Reference card (Section C). Two inline SVGs (hero + how-to-deploy) to the locked v2 grammar (s9.14).
 */
export const fiveCs: Page = {
  slug: "toolkit/5-cs",
  title: "The 5 C's of Marketing",
  titleEmphasize: "5 C's",
  subtitle: "A situation scan to run before you choose any strategy.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 9,
    tags: ["5cs", "situation analysis", "marketing", "strategy", "toolkit"],
    caseType: "situation analysis",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "before you prescribe",
      md: "The 5 C’s are not a strategy — they are the situation analysis you run **before you prescribe** one. Company, Customers, Competitors, Collaborators, Context: read them outside-in, find the one tension that matters, and only then reach for the framework that answers it.",
    },
    {
      type: "heading",
      level: 2,
      text: "The five lenses",
      emphasize: "map the situation",
    },
    {
      type: "prose",
      md: "The 5 C’s map a situation from five angles. *Company* — who we are, our capabilities and economics. *Customers* — who we serve, their segments and willingness to pay. *Competitors* — who else is in the market and how they’re positioned. *Collaborators* — the suppliers, distributors and partners we depend on. And *Context* — the macro and industry backdrop, which is really SWOT and PESTEL in another guise.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 392" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <rect x="190" y="14" width="380" height="54" rx="12" fill="url(#ng)" filter="url(#rs)"/>
  <text x="380" y="38" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">The 5 C’s — map before you move</text>
  <text x="380" y="57" text-anchor="middle" fill="#b9c4d6" font-size="11">a situation scan: read these five, then pick a strategy framework</text>

  <!-- 5 cards -->
  <g>
    <rect x="14" y="84" width="138" height="214" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
    <text x="83" y="106" text-anchor="middle" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Company</text>
    <text x="83" y="122" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">who are we?</text>
    <line x1="26" y1="132" x2="140" y2="132" stroke="hsl(var(--border-strong))"/>
    <circle cx="30" cy="152" r="2.6" fill="hsl(var(--primary))"/><text x="38" y="155" fill="hsl(var(--foreground))" font-size="9.5">Capabilities</text>
    <circle cx="30" cy="174" r="2.6" fill="hsl(var(--primary))"/><text x="38" y="177" fill="hsl(var(--foreground))" font-size="9.5">Value chain</text>
    <circle cx="30" cy="196" r="2.6" fill="hsl(var(--primary))"/><text x="38" y="199" fill="hsl(var(--foreground))" font-size="9.5">Brand &amp; assets</text>
    <circle cx="30" cy="218" r="2.6" fill="hsl(var(--primary))"/><text x="38" y="221" fill="hsl(var(--foreground))" font-size="9.5">Cost &amp; cash</text>
  </g>
  <g>
    <rect x="162" y="84" width="138" height="214" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
    <text x="231" y="106" text-anchor="middle" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Customers</text>
    <text x="231" y="122" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">who do we serve?</text>
    <line x1="174" y1="132" x2="288" y2="132" stroke="hsl(var(--border-strong))"/>
    <circle cx="178" cy="152" r="2.6" fill="hsl(var(--primary))"/><text x="186" y="155" fill="hsl(var(--foreground))" font-size="9.5">Segments</text>
    <circle cx="178" cy="174" r="2.6" fill="hsl(var(--primary))"/><text x="186" y="177" fill="hsl(var(--foreground))" font-size="9.5">Needs &amp; wants</text>
    <circle cx="178" cy="196" r="2.6" fill="hsl(var(--primary))"/><text x="186" y="199" fill="hsl(var(--foreground))" font-size="9.5">TAM/SAM/SOM</text>
    <circle cx="178" cy="218" r="2.6" fill="hsl(var(--primary))"/><text x="186" y="221" fill="hsl(var(--foreground))" font-size="9.5">Willingness to pay</text>
  </g>
  <g>
    <rect x="310" y="84" width="138" height="214" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
    <text x="379" y="106" text-anchor="middle" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Competitors</text>
    <text x="379" y="122" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">who’s in the way?</text>
    <line x1="322" y1="132" x2="436" y2="132" stroke="hsl(var(--border-strong))"/>
    <circle cx="326" cy="152" r="2.6" fill="hsl(var(--primary))"/><text x="334" y="155" fill="hsl(var(--foreground))" font-size="9.5">Direct &amp; indirect</text>
    <circle cx="326" cy="174" r="2.6" fill="hsl(var(--primary))"/><text x="334" y="177" fill="hsl(var(--foreground))" font-size="9.5">Share &amp; concentration</text>
    <circle cx="326" cy="196" r="2.6" fill="hsl(var(--primary))"/><text x="334" y="199" fill="hsl(var(--foreground))" font-size="9.5">Their strategy</text>
    <circle cx="326" cy="218" r="2.6" fill="hsl(var(--primary))"/><text x="334" y="221" fill="hsl(var(--foreground))" font-size="9.5">Their gaps</text>
  </g>
  <g>
    <rect x="458" y="84" width="138" height="214" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
    <text x="527" y="106" text-anchor="middle" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Collaborators</text>
    <text x="527" y="122" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">who do we work with?</text>
    <line x1="470" y1="132" x2="584" y2="132" stroke="hsl(var(--border-strong))"/>
    <circle cx="474" cy="152" r="2.6" fill="hsl(var(--primary))"/><text x="482" y="155" fill="hsl(var(--foreground))" font-size="9.5">Suppliers</text>
    <circle cx="474" cy="174" r="2.6" fill="hsl(var(--primary))"/><text x="482" y="177" fill="hsl(var(--foreground))" font-size="9.5">Distributors</text>
    <circle cx="474" cy="196" r="2.6" fill="hsl(var(--primary))"/><text x="482" y="199" fill="hsl(var(--foreground))" font-size="9.5">Partners</text>
    <circle cx="474" cy="218" r="2.6" fill="hsl(var(--primary))"/><text x="482" y="221" fill="hsl(var(--foreground))" font-size="9.5">Agencies</text>
  </g>
  <g>
    <rect x="606" y="84" width="138" height="214" rx="10" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.8" filter="url(#cs)"/>
    <text x="675" y="106" text-anchor="middle" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Context</text>
    <text x="675" y="122" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">what’s the climate?</text>
    <line x1="618" y1="132" x2="732" y2="132" stroke="hsl(var(--border-strong))"/>
    <circle cx="622" cy="152" r="2.6" fill="hsl(var(--primary))"/><text x="630" y="155" fill="hsl(var(--foreground))" font-size="9.5">Macro via PESTEL</text>
    <circle cx="622" cy="174" r="2.6" fill="hsl(var(--primary))"/><text x="630" y="177" fill="hsl(var(--foreground))" font-size="9.5">Industry dynamics</text>
    <circle cx="622" cy="196" r="2.6" fill="hsl(var(--primary))"/><text x="630" y="199" fill="hsl(var(--foreground))" font-size="9.5">Regulation</text>
    <circle cx="622" cy="218" r="2.6" fill="hsl(var(--primary))"/><text x="630" y="221" fill="hsl(var(--foreground))" font-size="9.5">Trends</text>
    <text x="675" y="246" text-anchor="middle" fill="hsl(var(--primary))" font-size="9" font-style="italic">= SWOT + PESTEL</text>
  </g>

  <!-- HOW TO USE -->
  <rect x="14" y="308" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="329" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="346" fill="hsl(var(--foreground))" font-size="11.5">Scan all five outside-in (customer and context first), then name the one tension that matters most before choosing a strategy.</text>
  <text x="28" y="362" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: the 5 C’s set up a decision; they don’t make one. Don’t stop at the scan — hand it to entry, growth or pricing.</text>
</svg>`,
      caption: "Five lenses for a situation scan — read outside-in before choosing a strategy.",
      maxWidth: 760,
      ariaLabel: "The five C's — company, customers, competitors, collaborators, context — each with what it asks, with context highlighted as a restatement of SWOT plus PESTEL.",
    },
    {
      type: "prose",
      md: "Read them outside-in: start with the customer and the context, not with your own company, so you see the situation as the market does. The goal isn’t five tidy descriptions — it’s to surface the central *tension*, the place where what the customer wants and what the company is built for pull apart.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "diagnose, then hand off",
    },
    {
      type: "prose",
      md: "The 5 C’s diagnose; they do not decide. Use them to read the landscape and name the tension, then hand that synthesis to a decision framework — market entry, growth, or pricing — which actually answers the question. And don’t re-derive Context from scratch; it is your SWOT and PESTEL work, reused.",
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
  <text x="24" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">USING THE 5 C’s — FOUR MOVES</text>
  <text x="474" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">SAY IT OUT LOUD</text>
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6">
    <path d="M239,108 L239,122" marker-end="url(#ar)"/>
    <path d="M239,190 L239,204" marker-end="url(#ar)"/>
    <path d="M239,272 L239,286" marker-end="url(#ar)"/>
  </g>
  <rect x="24" y="50" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="65" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="84" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">1</text>
  <text x="80" y="75" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Use it as a pre-strategy scan</text>
  <text x="80" y="93" fill="hsl(var(--muted-foreground))" font-size="11">diagnose the landscape before you prescribe a move</text>
  <text x="474" y="75" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Before I recommend anything, let me</text>
  <text x="474" y="91" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">read the situation across five lenses.”</text>
  <rect x="24" y="132" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="147" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="166" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">2</text>
  <text x="80" y="157" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Go outside-in</text>
  <text x="80" y="175" fill="hsl(var(--muted-foreground))" font-size="11">customers and context first, then company and competitors</text>
  <text x="474" y="157" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Start with the customer and the</text>
  <text x="474" y="173" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">market, not with our own company.”</text>
  <rect x="24" y="214" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="229" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="248" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">3</text>
  <text x="80" y="239" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Synthesise the central tension</text>
  <text x="80" y="257" fill="hsl(var(--muted-foreground))" font-size="11">where do the five C’s pull against each other?</text>
  <text x="474" y="239" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Customers want X, but we’re built</text>
  <text x="474" y="255" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">for Y — that gap is the real issue.”</text>
  <rect x="24" y="296" width="430" height="58" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <rect x="38" y="311" width="28" height="28" rx="7" fill="hsl(var(--primary))"/><text x="52" y="330" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">4</text>
  <text x="80" y="321" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Hand it to a decision framework</text>
  <text x="80" y="339" fill="hsl(var(--muted-foreground))" font-size="11">5 C’s sets up entry, growth or pricing — it doesn’t answer them</text>
  <text x="474" y="321" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“So the situation points to a growth</text>
  <text x="474" y="337" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">play — let me structure that next.”</text>
  <rect x="24" y="372" width="712" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="38" y="393" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="38" y="410" fill="hsl(var(--foreground))" font-size="11.5">The 5 C’s diagnose the situation; they don’t make the call — they surface the tension you then act on.</text>
  <text x="38" y="426" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: ‘Context’ is just SWOT + PESTEL — reuse it, and don’t let the scan replace a real decision.</text>
</svg>`,
      caption: "Four moves that turn a five-lens scan into a sharp setup for strategy.",
      maxWidth: 620,
      ariaLabel: "A four-step flow for using the 5 C's: use it as a pre-strategy scan, go outside-in, synthesise the central tension, and hand it to a decision framework, with a spoken script beside each step.",
    },
    {
      type: "callout",
      variant: "insight",
      title: "Context is SWOT + PESTEL, reused",
      md: "The ‘Context’ C trips people up because it overlaps everything else. Treat it as the home for your macro and industry read — the PESTEL scan and the opportunities/threats from SWOT — rather than a fresh analysis. Reusing that work keeps the 5 C’s fast and stops you saying the same thing twice.",
    },
    {
      type: "heading",
      level: 2,
      text: "Worked example: a fitness app eyes a new city",
      emphasize: "a fitness app",
    },
    {
      type: "prose",
      md: "A metro-born fitness app is deciding whether to launch in a Tier-2 city. Before choosing *how*, a 5 C’s scan tells them what they’re walking into.",
    },
    {
      type: "dialogue",
      title: "Five C's, one tension",
      turns: [
        { speaker: "interviewer", md: "A fitness app that’s done well in metros is considering launching in a Tier-2 city. How would you read the situation before recommending anything?" },
        { speaker: "candidate", note: "Runs the scan outside-in.", md: "I’ll run a quick 5 C’s, starting outside-in. Customers: Tier-2 young professionals with rising health awareness, but lower willingness to pay and a strong preference for an actual gym over an app. Context: the health-and-fitness trend is a tailwind, but price sensitivity is real. Competitors: cheap local gyms and trainers, very little digital competition. Collaborators: those same local gyms could be partners rather than rivals. Company: we have a strong app and content, an asset-light model, and a brand that’s really only known in metros." },
        { speaker: "interviewer", md: "And the takeaway?" },
        { speaker: "candidate", note: "Names the tension, then hands off.", md: "The central tension is clear: our model is a premium, app-first metro subscription, but the Tier-2 customer wants affordable, gym-first fitness. Forcing the metro model in would fail on both price and format. So the situation points to a specific decision — an entry-mode and pricing question — not an answer in itself. I’d hand it to a market-entry structure: most likely a lower-priced, partner-gym hybrid rather than the metro subscription. The 5 C’s told me which decision to go solve." },
        { speaker: "narrator", md: "The candidate didn’t stop at five descriptions — they surfaced the company-vs-customer tension and handed it to the right decision framework. That hand-off is the whole purpose of the 5 C’s." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "The 5 C’s are a front door, not a destination. Their ‘Context’ reuses **PESTEL** and **SWOT**; their output sets up **Market Entry**, **Growth** or **Pricing**. If a 5 C’s scan doesn’t end by pointing at one of those, it hasn’t finished its job.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Use the 5 C’s as a situation scan you run before choosing any strategy.",
        "Read the lenses outside-in — customer and context first, company last.",
        "Reuse SWOT and PESTEL for the ‘Context’ C instead of re-deriving it.",
        "Synthesise the central tension where customer needs and company strengths pull apart.",
        "Hand the synthesis to a decision framework — entry, growth or pricing — rather than treating the scan as the answer."
      ],
    }
  ],
};

export default fiveCs;


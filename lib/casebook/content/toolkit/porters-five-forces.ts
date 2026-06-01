import type { Page } from "../../types";

/**
 * Toolkit - Porter's Five Forces
 * First card in Section C (Toolkit). Tight reference-card shape: two inline SVGs
 * (hero + how-to-deploy diagnostic) authored to the locked v2 visual grammar (s9.14).
 */
export const portersFiveForces: Page = {
  slug: "toolkit/porters-five-forces",
  title: "Porter's Five Forces",
  titleEmphasize: "Five Forces",
  subtitle: "The fastest read on whether an industry can sustain profit - and which way that is heading.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 9,
    tags: ["porter", "five forces", "industry analysis", "attractiveness", "toolkit"],
    caseType: "industry analysis",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "one question",
      md: "Most candidates treat Porter's Five Forces as a checklist to recite — buyers, suppliers, entrants, substitutes, rivalry — and lose the room by minute three. The forces are not five separate analyses. They are five ways of answering **one question**: how much profit can this industry sustain, and which way is that heading? Use it as a lens, not a list, and it becomes the fastest read you own on whether an industry is worth entering, buying into, or defending.",
    },
    {
      type: "heading",
      level: 2,
      text: "What it actually asks",
      emphasize: "one question",
    },
    {
      type: "prose",
      md: "Picture an industry's profit as a pool. Each of the five forces is a way that pool drains. Powerful **buyers** bargain price down. Powerful **suppliers** push cost up. **New entrants** compete the surplus away. **Substitutes** cap what anyone can charge. And **rivalry** — the visible fight — is usually just the sum of the other four playing out on price. Read the forces and you are really reading how full the pool can stay, and for whom.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 484" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <!-- ROOT: the verdict the lens produces -->
  <rect x="200" y="16" width="360" height="58" rx="12" fill="url(#ng)" filter="url(#rs)"/>
  <text x="380" y="42" text-anchor="middle" fill="#ffffff" font-size="14.5" font-weight="700">How profitable can this industry be?</text>
  <text x="380" y="61" text-anchor="middle" fill="#b9c4d6" font-size="11">Five structural forces set the ceiling on margins — and which way it is moving</text>

  <!-- arrows: each force pushes UP on the profitability ceiling -->
  <g fill="none" stroke="hsl(var(--primary))" stroke-width="1.5" opacity="0.7">
    <path d="M83,120 C83,98 300,100 330,76" marker-end="url(#ar)"/>
    <path d="M225,120 C225,104 330,98 352,76" marker-end="url(#ar)"/>
    <path d="M380,120 L380,78" marker-end="url(#ar)"/>
    <path d="M535,120 C535,104 430,98 408,76" marker-end="url(#ar)"/>
    <path d="M677,120 C677,98 460,100 430,76" marker-end="url(#ar)"/>
  </g>

  <!-- FORCE CARD generator: 5 cards -->
  <!-- card 1: Buyer power -->
  <g>
    <rect x="14" y="120" width="138" height="214" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
    <text x="83" y="142" text-anchor="middle" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Buyer power</text>
    <text x="83" y="158" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">can they squeeze our price?</text>
    <line x1="26" y1="168" x2="140" y2="168" stroke="hsl(var(--border-strong))"/>
    <text x="26" y="184" fill="hsl(var(--primary))" font-size="8.5" font-weight="700" letter-spacing="0.05em">STRONGER WHEN</text>
    <circle cx="30" cy="201" r="2.6" fill="hsl(var(--primary))"/><text x="38" y="204" fill="hsl(var(--foreground))" font-size="9.5">Few, large buyers</text>
    <circle cx="30" cy="221" r="2.6" fill="hsl(var(--primary))"/><text x="38" y="224" fill="hsl(var(--foreground))" font-size="9.5">Low switching cost</text>
    <circle cx="30" cy="241" r="2.6" fill="hsl(var(--primary))"/><text x="38" y="244" fill="hsl(var(--foreground))" font-size="9.5">Undifferentiated</text>
    <circle cx="30" cy="261" r="2.6" fill="hsl(var(--primary))"/><text x="38" y="264" fill="hsl(var(--foreground))" font-size="9.5">Easy substitutes</text>
    <circle cx="30" cy="281" r="2.6" fill="hsl(var(--primary))"/><text x="38" y="284" fill="hsl(var(--foreground))" font-size="9.5">Can self-supply</text>
    <text x="83" y="320" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">e.g. a lone OEM</text>
  </g>
  <!-- card 2: Supplier power -->
  <g>
    <rect x="162" y="120" width="138" height="214" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
    <text x="231" y="142" text-anchor="middle" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Supplier power</text>
    <text x="231" y="158" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">can they raise our cost?</text>
    <line x1="174" y1="168" x2="288" y2="168" stroke="hsl(var(--border-strong))"/>
    <text x="174" y="184" fill="hsl(var(--primary))" font-size="8.5" font-weight="700" letter-spacing="0.05em">STRONGER WHEN</text>
    <circle cx="178" cy="201" r="2.6" fill="hsl(var(--primary))"/><text x="186" y="204" fill="hsl(var(--foreground))" font-size="9.5">Few suppliers</text>
    <circle cx="178" cy="221" r="2.6" fill="hsl(var(--primary))"/><text x="186" y="224" fill="hsl(var(--foreground))" font-size="9.5">Critical input</text>
    <circle cx="178" cy="241" r="2.6" fill="hsl(var(--primary))"/><text x="186" y="244" fill="hsl(var(--foreground))" font-size="9.5">High switch cost</text>
    <circle cx="178" cy="261" r="2.6" fill="hsl(var(--primary))"/><text x="186" y="264" fill="hsl(var(--foreground))" font-size="9.5">We are a small buyer</text>
    <circle cx="178" cy="281" r="2.6" fill="hsl(var(--primary))"/><text x="186" y="284" fill="hsl(var(--foreground))" font-size="9.5">Can sell direct</text>
    <text x="231" y="320" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">e.g. a chip maker</text>
  </g>
  <!-- card 3: Rivalry (center, highlighted) -->
  <g>
    <rect x="310" y="120" width="138" height="214" rx="10" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.8" filter="url(#cs)"/>
    <text x="379" y="142" text-anchor="middle" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Rivalry</text>
    <text x="379" y="158" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">how hard is the fight?</text>
    <line x1="322" y1="168" x2="436" y2="168" stroke="hsl(var(--border-strong))"/>
    <text x="322" y="184" fill="hsl(var(--primary))" font-size="8.5" font-weight="700" letter-spacing="0.05em">STRONGER WHEN</text>
    <circle cx="326" cy="201" r="2.6" fill="hsl(var(--primary))"/><text x="334" y="204" fill="hsl(var(--foreground))" font-size="9.5">Many equal players</text>
    <circle cx="326" cy="221" r="2.6" fill="hsl(var(--primary))"/><text x="334" y="224" fill="hsl(var(--foreground))" font-size="9.5">Slow growth</text>
    <circle cx="326" cy="241" r="2.6" fill="hsl(var(--primary))"/><text x="334" y="244" fill="hsl(var(--foreground))" font-size="9.5">High fixed cost</text>
    <circle cx="326" cy="261" r="2.6" fill="hsl(var(--primary))"/><text x="334" y="264" fill="hsl(var(--foreground))" font-size="9.5">Low differentiation</text>
    <circle cx="326" cy="281" r="2.6" fill="hsl(var(--primary))"/><text x="334" y="284" fill="hsl(var(--foreground))" font-size="9.5">High exit barriers</text>
    <text x="379" y="320" text-anchor="middle" fill="hsl(var(--primary))" font-size="9" font-style="italic">the net of the other four</text>
  </g>
  <!-- card 4: New entrants -->
  <g>
    <rect x="458" y="120" width="138" height="214" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
    <text x="527" y="142" text-anchor="middle" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">New entrants</text>
    <text x="527" y="158" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">can others pile in?</text>
    <line x1="470" y1="168" x2="584" y2="168" stroke="hsl(var(--border-strong))"/>
    <text x="470" y="184" fill="hsl(var(--primary))" font-size="8.5" font-weight="700" letter-spacing="0.05em">THREAT RISES WHEN</text>
    <circle cx="474" cy="201" r="2.6" fill="hsl(var(--primary))"/><text x="482" y="204" fill="hsl(var(--foreground))" font-size="9.5">Low capital need</text>
    <circle cx="474" cy="221" r="2.6" fill="hsl(var(--primary))"/><text x="482" y="224" fill="hsl(var(--foreground))" font-size="9.5">Weak scale economies</text>
    <circle cx="474" cy="241" r="2.6" fill="hsl(var(--primary))"/><text x="482" y="244" fill="hsl(var(--foreground))" font-size="9.5">Easy distribution</text>
    <circle cx="474" cy="261" r="2.6" fill="hsl(var(--primary))"/><text x="482" y="264" fill="hsl(var(--foreground))" font-size="9.5">No regulation</text>
    <circle cx="474" cy="281" r="2.6" fill="hsl(var(--primary))"/><text x="482" y="284" fill="hsl(var(--foreground))" font-size="9.5">Weak brands</text>
    <text x="527" y="320" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">e.g. a D2C category</text>
  </g>
  <!-- card 5: Substitutes -->
  <g>
    <rect x="606" y="120" width="138" height="214" rx="10" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
    <text x="675" y="142" text-anchor="middle" fill="hsl(var(--foreground))" font-size="12.5" font-weight="700">Substitutes</text>
    <text x="675" y="158" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">is there another way?</text>
    <line x1="618" y1="168" x2="732" y2="168" stroke="hsl(var(--border-strong))"/>
    <text x="618" y="184" fill="hsl(var(--primary))" font-size="8.5" font-weight="700" letter-spacing="0.05em">THREAT RISES WHEN</text>
    <circle cx="622" cy="201" r="2.6" fill="hsl(var(--primary))"/><text x="630" y="204" fill="hsl(var(--foreground))" font-size="9.5">Better price-value</text>
    <circle cx="622" cy="221" r="2.6" fill="hsl(var(--primary))"/><text x="630" y="224" fill="hsl(var(--foreground))" font-size="9.5">Low switch cost</text>
    <circle cx="622" cy="241" r="2.6" fill="hsl(var(--primary))"/><text x="630" y="244" fill="hsl(var(--foreground))" font-size="9.5">Same job, done cheaper</text>
    <circle cx="622" cy="261" r="2.6" fill="hsl(var(--primary))"/><text x="630" y="264" fill="hsl(var(--foreground))" font-size="9.5">Buyers open to it</text>
    <circle cx="622" cy="281" r="2.6" fill="hsl(var(--primary))"/><text x="630" y="284" fill="hsl(var(--foreground))" font-size="9.5">Tech shifting fast</text>
    <text x="675" y="320" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">e.g. video calls vs travel</text>
  </g>

  <!-- HOW TO USE THIS -->
  <rect x="14" y="350" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="371" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="388" fill="hsl(var(--foreground))" font-size="11.5">Rate each force strong or weak — and note its direction. The two strongest forces, not all five, set the verdict.</text>
  <text x="28" y="404" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: this reads the industry, not your client. A strong firm can still win in a brutal industry — and the reverse.</text>
</svg>`,
      caption: "The five forces as one lens: each, when strong, presses down on the industry's profit ceiling.",
      maxWidth: 760,
      ariaLabel: "Diagram of Porter's Five Forces arranged as five cards — buyer power, supplier power, rivalry, threat of new entrants, threat of substitutes — each listing what makes it stronger, all feeding a single question of how profitable the industry can be.",
    },
    {
      type: "prose",
      md: "The trick to reading it: a *strong* force means profit pressure, a *weak* force means breathing room, and the overall verdict is the net. Rivalry sits in the middle because it is rarely a root cause — when rivalry looks vicious, it is usually because buyers are powerful, the product is undifferentiated, or entrants keep arriving. Diagnose the upstream force, not just the symptom.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it in a case",
      emphasize: "a verdict, not a list",
    },
    {
      type: "prose",
      md: "Reach for Five Forces when the question is about an *industry*, not a single firm: should we enter this market, should we invest in this sector, or why is everyone's margin in this industry falling. It is the wrong tool for a company's internal problem — a broken supply chain or a failing product launch needs a different lens. When it does fit, the job is to produce a verdict, not a tour of all five.",
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
  <text x="24" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">DEPLOYING IT IN A CASE — FOUR MOVES</text>
  <text x="474" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">SAY IT OUT LOUD</text>

  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6">
    <path d="M239,108 L239,122" marker-end="url(#ar)"/>
    <path d="M239,190 L239,204" marker-end="url(#ar)"/>
    <path d="M239,272 L239,286" marker-end="url(#ar)"/>
  </g>

  <!-- STEP 1 -->
  <rect x="24" y="50" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="65" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="84" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">1</text>
  <text x="80" y="75" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Check it is the right tool</text>
  <text x="80" y="93" fill="hsl(var(--muted-foreground))" font-size="11">for industry attractiveness — entry, investment, falling margins</text>
  <text x="474" y="75" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“The real question is whether this</text>
  <text x="474" y="91" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">industry can sustain profit at all.”</text>

  <!-- STEP 2 -->
  <rect x="24" y="132" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="147" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="166" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">2</text>
  <text x="80" y="157" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Rate each force — and its direction</text>
  <text x="80" y="175" fill="hsl(var(--muted-foreground))" font-size="11">strong or weak today, rising or easing tomorrow</text>
  <text x="474" y="157" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Buyer power is high and climbing</text>
  <text x="474" y="173" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">as switching gets easier.”</text>

  <!-- STEP 3 -->
  <rect x="24" y="214" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="229" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="248" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">3</text>
  <text x="80" y="239" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Find the one or two that bind</text>
  <text x="80" y="257" fill="hsl(var(--muted-foreground))" font-size="11">do not weight all five equally — name the forces that decide it</text>
  <text x="474" y="239" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Two forces dominate here;</text>
  <text x="474" y="255" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">the other three are secondary.”</text>

  <!-- STEP 4 (red gate) -->
  <rect x="24" y="296" width="430" height="58" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <rect x="38" y="311" width="28" height="28" rx="7" fill="hsl(var(--primary))"/><text x="52" y="330" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">4</text>
  <text x="80" y="321" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Turn it into a verdict for the client</text>
  <text x="80" y="339" fill="hsl(var(--muted-foreground))" font-size="11">attractive or hostile, improving or worsening — then their decision</text>
  <text x="474" y="321" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“So the industry is structurally</text>
  <text x="474" y="337" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">tough — here is what that means.”</text>

  <!-- HOW TO USE THIS -->
  <rect x="24" y="372" width="712" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="38" y="393" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="38" y="410" fill="hsl(var(--foreground))" font-size="11.5">Never recite all five as a checklist — that is the tell of a weak candidate. Assess, prioritise, then land one verdict.</text>
  <text x="38" y="426" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: it is a snapshot. Regulation or technology can flip a force in a year, so always state which way each one is trending.</text>
</svg>`,
      caption: "Four moves that turn the framework into a verdict the client can act on.",
      maxWidth: 620,
      ariaLabel: "A four-step vertical flow for deploying Five Forces in a case: check it is the right tool, rate each force and its direction, find the one or two that bind, and turn it into a verdict for the client, with a spoken script beside each step.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "The checklist trap",
      md: "The single most common way to misuse this framework is to walk through all five forces at equal length and stop. That is a description, not an analysis. Strong candidates rate each force, then say which **one or two** actually set the ceiling, note which way they are **trending**, and land on a one-line verdict. The other three forces get a sentence each, not a paragraph.",
    },
    {
      type: "heading",
      level: 2,
      text: "Worked example: is quick-commerce a good industry?",
      emphasize: "quick-commerce",
    },
    {
      type: "prose",
      md: "A private-equity fund is weighing a minority stake in an Indian ten-minute grocery player. Before anyone touches valuation, they want a read on the industry itself — and that is exactly what Five Forces is for.",
    },
    {
      type: "dialogue",
      title: "Quick-commerce, through the lens",
      turns: [
        { speaker: "interviewer", md: "A PE fund is considering investing in one of India's ten-minute grocery (quick-commerce) companies. Before we value the company, they want to know whether this is a structurally attractive industry to be in at all. How would you think about it?" },
        { speaker: "candidate", note: "Confirms the right tool and the objective — move 1.", md: "Since the question is about the industry's structure rather than this one company's execution, Five Forces is the right lens. I'll rate each force and, just as importantly, which way it is trending, then land on whether the industry can sustain profit." },
        { speaker: "candidate", note: "Rates, then prioritises two forces — moves 2 and 3.", md: "Two forces dominate. Rivalry is brutal: several deeply funded players, near-identical assortments, and growth being bought with discounts and free delivery — so prices, and margins, stay suppressed. Buyer power is high too, because switching apps costs the customer nothing and most are coupon-driven. The other three I'd note briefly — supplier power is moderate (consumer brands plus gig labour), substitutes are real (the neighbourhood kirana and scheduled e-grocery), and the threat of new entrants is actually *lower* than it looks now, since dark-store density and the capital to fund it have become a genuine barrier." },
        { speaker: "interviewer", md: "So what is your verdict on the industry?" },
        { speaker: "candidate", note: "Verdict plus direction — move 4.", md: "Today it is structurally unprofitable: rivalry and buyer power cap prices while serving an order in ten minutes is expensive. But the direction is the real story — as weaker players run out of cash and the market consolidates, rivalry should ease and the survivors could finally earn a margin. The structure is poor now but improving." },
        { speaker: "candidate", md: "So for the fund, the bet is not on today's industry economics, which are bad. It is a bet on consolidation and on backing a likely survivor before the structure turns. I'd point the diligence at who outlasts the cash burn, not at current profitability." },
        { speaker: "narrator", md: "The candidate never recited five forces for their own sake. They rated all five, prioritised the two that bind, read the trend, and converted it into a verdict the investor could act on — the difference between using the framework and performing it." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "Five Forces is an *industry* lens, so it rarely travels alone. It feeds the attractiveness arm of **Market Entry** (is the market worth entering?) and explains the *why* behind a shrinking pool in **Profitability**. Pair it with a firm-level lens — right-to-win, or the **Value Chain** — to move from \"is this industry good?\" to \"can *this client* win in it?\"",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Use Five Forces to answer one question — can this industry sustain profit, and which way is it heading — instead of reciting a checklist.",
        "Rate each force as strong or weak and, crucially, note whether it is rising or easing.",
        "Prioritise the one or two forces that actually set the ceiling, and give the other three a sentence each.",
        "Recognise rivalry as usually a symptom of the other four, and diagnose the upstream cause.",
        "Apply it only to industry-level questions — entry, investment, falling margins — not to a single firm's internal problem.",
        "Convert the read into a one-line verdict tied to the client's decision."
      ],
    }
  ],
};

export default portersFiveForces;

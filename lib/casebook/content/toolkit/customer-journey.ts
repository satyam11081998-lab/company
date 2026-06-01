import type { Page } from "../../types";

/**
 * Toolkit - Customer Journey Map
 * Reference card (Section C). Two inline SVGs (hero + how-to-deploy) to the locked v2 grammar (s9.14).
 */
export const customerJourney: Page = {
  slug: "toolkit/customer-journey",
  title: "Customer Journey Map",
  titleEmphasize: "Journey",
  subtitle: "Follow the customer from first need to loyalty - and find where they leak away.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 9,
    tags: ["customer journey", "funnel", "retention", "growth", "toolkit"],
    caseType: "customer analysis",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "where you lose them",
      md: "A customer journey map is not a tidy diagram of stages to admire — it is a tool for finding **where you lose them**. Walk the journey from the customer’s side, put a drop-off number on every stage, and the map quietly points at the one place that is costing you the most.",
    },
    {
      type: "heading",
      level: 2,
      text: "The journey",
      emphasize: "from the customer's side",
    },
    {
      type: "prose",
      md: "Every customer moves through the same arc: a need is triggered, they become aware of options, they consider and compare, they buy, they use and seek support, and — if it went well — they come back and refer others. Mapping it from the customer’s point of view (their goal at each step), not your funnel or org chart, is what makes the leaks visible.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 408" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="24" y="28" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">CUSTOMER JOURNEY — FROM FIRST NEED TO LOYAL ADVOCATE</text>
  <text x="24" y="44" fill="hsl(var(--muted-foreground))" font-size="10.5">Map every stage from the customer’s side, then mark where they slip away — the leak is where the value is.</text>

  <!-- phase bands -->
  <rect x="14" y="56" width="358" height="26" rx="6" fill="hsl(var(--navy))"/>
  <text x="193" y="74" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">PRE-PURCHASE</text>
  <rect x="380" y="56" width="116" height="26" rx="6" fill="hsl(var(--navy))"/>
  <text x="438" y="74" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">PURCHASE</text>
  <rect x="504" y="56" width="242" height="26" rx="6" fill="hsl(var(--navy))"/>
  <text x="625" y="74" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">POST-PURCHASE</text>

  <!-- flow arrows between stage cards -->
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.5">
    <path d="M134,162 L142,162" marker-end="url(#ar)"/>
    <path d="M256,162 L264,162" marker-end="url(#ar)"/>
    <path d="M378,162 L386,162" marker-end="url(#ar)"/>
    <path d="M500,162 L508,162" marker-end="url(#ar)"/>
    <path d="M622,162 L630,162" marker-end="url(#ar)"/>
  </g>

  <!-- stage cards (6) -->
  <!-- 1 Need -->
  <rect x="14" y="96" width="118" height="132" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="73" y="118" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11.5" font-weight="700">Need / trigger</text>
  <text x="73" y="138" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">a problem to solve</text>
  <text x="24" y="168" fill="hsl(var(--foreground))" font-size="9">Wants: to notice</text>
  <text x="24" y="182" fill="hsl(var(--foreground))" font-size="9">the need at all</text>
  <text x="24" y="210" fill="hsl(var(--muted-foreground))" font-size="8.5" font-style="italic">leak: never aware</text>
  <!-- 2 Awareness -->
  <rect x="136" y="96" width="118" height="132" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="195" y="118" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11.5" font-weight="700">Awareness</text>
  <text x="195" y="138" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">finds the options</text>
  <text x="146" y="168" fill="hsl(var(--foreground))" font-size="9">Wants: to find</text>
  <text x="146" y="182" fill="hsl(var(--foreground))" font-size="9">us easily</text>
  <text x="146" y="210" fill="hsl(var(--muted-foreground))" font-size="8.5" font-style="italic">leak: invisible</text>
  <!-- 3 Consideration -->
  <rect x="258" y="96" width="118" height="132" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="317" y="118" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11.5" font-weight="700">Consider</text>
  <text x="317" y="138" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">compares choices</text>
  <text x="268" y="168" fill="hsl(var(--foreground))" font-size="9">Wants: a reason</text>
  <text x="268" y="182" fill="hsl(var(--foreground))" font-size="9">to pick us</text>
  <text x="268" y="210" fill="hsl(var(--muted-foreground))" font-size="8.5" font-style="italic">leak: loses to rival</text>
  <!-- 4 Buy (highlighted) -->
  <rect x="380" y="96" width="118" height="132" rx="9" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.8" filter="url(#cs)"/>
  <text x="439" y="118" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11.5" font-weight="700">Buy</text>
  <text x="439" y="138" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">decides &amp; pays</text>
  <text x="390" y="168" fill="hsl(var(--foreground))" font-size="9">Wants: a quick,</text>
  <text x="390" y="182" fill="hsl(var(--foreground))" font-size="9">painless checkout</text>
  <text x="390" y="210" fill="hsl(var(--primary))" font-size="8.5" font-weight="700">biggest leak here</text>
  <!-- 5 Use -->
  <rect x="502" y="96" width="118" height="132" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="561" y="118" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11.5" font-weight="700">Use &amp; support</text>
  <text x="561" y="138" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">lives with it</text>
  <text x="512" y="168" fill="hsl(var(--foreground))" font-size="9">Wants: it to work</text>
  <text x="512" y="182" fill="hsl(var(--foreground))" font-size="9">and easy help</text>
  <text x="512" y="210" fill="hsl(var(--muted-foreground))" font-size="8.5" font-style="italic">leak: churns early</text>
  <!-- 6 Loyalty -->
  <rect x="624" y="96" width="120" height="132" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <text x="684" y="118" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11.5" font-weight="700">Loyalty</text>
  <text x="684" y="138" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9">repeats &amp; refers</text>
  <text x="634" y="168" fill="hsl(var(--foreground))" font-size="9">Wants: a reason</text>
  <text x="634" y="182" fill="hsl(var(--foreground))" font-size="9">to come back</text>
  <text x="634" y="210" fill="hsl(var(--muted-foreground))" font-size="8.5" font-style="italic">leak: one &amp; done</text>

  <!-- HOW TO USE -->
  <rect x="14" y="246" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="267" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="284" fill="hsl(var(--foreground))" font-size="11.5">Put a drop-off number on each stage, find the one losing the most value, and fix that stage before touching the others.</text>
  <text x="28" y="300" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: it is the customer’s journey, not your funnel. The same map drives Growth (acquire vs retain) and Profitability.</text>
</svg>`,
      caption: "The journey from first need to loyalty — with the biggest leak marked.",
      maxWidth: 760,
      ariaLabel: "A horizontal customer journey across three phases — pre-purchase, purchase, post-purchase — with six stages from need to loyalty, the purchase stage highlighted as the biggest leak.",
    },
    {
      type: "prose",
      md: "At each stage the customer wants something simple — to find you, to have a reason to choose you, to check out without friction, to get help when it breaks, to be given a reason to return. Where that want is unmet, customers leak away. The art is putting a number on each leak so you can see which one actually matters.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "find the leak",
    },
    {
      type: "prose",
      md: "A journey map earns its keep by locating the single worst leak. Map it from the customer’s side, mark the drop-off at every stage with data where you have it and a clear hypothesis where you don’t, find the one stage losing the most value, fix that — then re-measure. Repainting the whole map helps no one.",
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
  <text x="24" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">USING THE JOURNEY MAP — FOUR MOVES</text>
  <text x="474" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">SAY IT OUT LOUD</text>
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6">
    <path d="M239,108 L239,122" marker-end="url(#ar)"/>
    <path d="M239,190 L239,204" marker-end="url(#ar)"/>
    <path d="M239,272 L239,286" marker-end="url(#ar)"/>
  </g>
  <rect x="24" y="50" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="65" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="84" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">1</text>
  <text x="80" y="75" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Map from the customer’s view</text>
  <text x="80" y="93" fill="hsl(var(--muted-foreground))" font-size="11">their goal and friction at each stage — not your funnel or org chart</text>
  <text x="474" y="75" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Walk it as the customer: what are</text>
  <text x="474" y="91" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">they trying to do at each step?”</text>
  <rect x="24" y="132" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="147" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="166" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">2</text>
  <text x="80" y="157" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Mark the drop-off at every stage</text>
  <text x="80" y="175" fill="hsl(var(--muted-foreground))" font-size="11">data where you have it, a clear hypothesis where you don’t</text>
  <text x="474" y="157" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“We lose 60% between cart and pay</text>
  <text x="474" y="173" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">— that stage is bleeding.”</text>
  <rect x="24" y="214" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="229" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="248" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">3</text>
  <text x="80" y="239" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Find the one stage losing the most</text>
  <text x="80" y="257" fill="hsl(var(--muted-foreground))" font-size="11">fixing the biggest leak beats polishing the whole map</text>
  <text x="474" y="239" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Three leaks, but checkout is the</text>
  <text x="474" y="255" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">one wrecking the economics.”</text>
  <rect x="24" y="296" width="430" height="58" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <rect x="38" y="311" width="28" height="28" rx="7" fill="hsl(var(--primary))"/><text x="52" y="330" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">4</text>
  <text x="80" y="321" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Fix that stage, then re-measure</text>
  <text x="80" y="339" fill="hsl(var(--muted-foreground))" font-size="11">tie the fix to conversion, repeat rate or retention</text>
  <text x="474" y="321" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“So we rebuild checkout first and</text>
  <text x="474" y="337" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">watch conversion — here’s the plan.”</text>
  <rect x="24" y="372" width="712" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="38" y="393" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="38" y="410" fill="hsl(var(--foreground))" font-size="11.5">A journey map earns its keep by finding the leak: fix the stage losing the most value, then measure.</text>
  <text x="38" y="426" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: a map with no drop-off data is decoration — the insight is always at the worst-performing stage.</text>
</svg>`,
      caption: "Four moves that turn a journey map into a single, high-value fix.",
      maxWidth: 620,
      ariaLabel: "A four-step flow for using a journey map: map from the customer's view, mark the drop-off at every stage, find the one stage losing the most, and fix it then re-measure, with a spoken script beside each step.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "A pretty map with no numbers",
      md: "The trap is a beautiful end-to-end map with no drop-off data — decoration, not analysis. The insight is always at the worst-performing stage, and you can only find it with numbers (or at least a sharp hypothesis). A map that doesn’t point at a leak hasn’t earned its place on the slide.",
    },
    {
      type: "heading",
      level: 2,
      text: "Worked example: an online used-car marketplace",
      emphasize: "used-car marketplace",
    },
    {
      type: "prose",
      md: "An online used-car platform is spending heavily on ads but growth is stalling. A journey map shows whether the problem is really at the top of the funnel — or somewhere far cheaper to fix.",
    },
    {
      type: "dialogue",
      title: "Mapping the leak",
      turns: [
        { speaker: "interviewer", md: "An online used-car marketplace is pouring money into ads, but sales aren’t growing in step. They’re about to spend even more on marketing. How would you sanity-check that?" },
        { speaker: "candidate", note: "Maps from the customer's side and marks drop-offs.", md: "Before spending more at the top, I’d map the buyer’s journey and find where they actually drop off. The arc is: need a car, become aware of the platform, browse and shortlist listings, then the purchase step — inspection, test drive, financing, checkout — then delivery and ownership, then resale or referral. I’d put a conversion number on each step. My hypothesis is that awareness and browsing are fine — the ads are working — and the real leak is in the purchase step." },
        { speaker: "interviewer", md: "Say the data backs that up. Then what?" },
        { speaker: "candidate", note: "Finds the worst stage, ties the fix to economics.", md: "If most buyers browse but few complete, the leak is at purchase — likely slow financing approval and clunky inspection scheduling. That’s the stage destroying the economics, and more ad spend just pours more people into a leaking bucket. So the recommendation flips: don’t raise the marketing budget — rebuild the financing and inspection flow first, because converting the traffic you already pay for is far cheaper than buying more. Then re-measure and only then revisit spend." },
        { speaker: "narrator", md: "The candidate used the map to challenge the premise. By numbering each stage they moved the fix from expensive top-of-funnel spend to the one mid-journey leak that mattered — which is exactly what a journey map is for." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "The journey map is the same funnel that sits inside **Growth** (is the problem acquisition or retention?) and **Profitability** (where does revenue leak before it lands?). The fix you find usually becomes a growth or cost lever — and the post-purchase stages feed straight into retention economics.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Map a customer journey from the customer’s goals at each stage, not from your funnel or org chart.",
        "Put a drop-off number (or a clear hypothesis) on every stage.",
        "Find the single stage losing the most value and fix that before anything else.",
        "Challenge ‘spend more at the top’ when the real leak is mid-journey.",
        "Tie the journey to Growth and Profitability — acquisition vs retention, and where revenue leaks."
      ],
    }
  ],
};

export default customerJourney;


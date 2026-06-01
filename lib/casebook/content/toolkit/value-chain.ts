import type { Page } from "../../types";

/**
 * Toolkit - Value Chain Analysis
 * Reference card (Section C). Two inline SVGs (hero + how-to-deploy) to the locked v2 grammar (s9.14).
 */
export const valueChain: Page = {
  slug: "toolkit/value-chain",
  title: "Value Chain Analysis",
  titleEmphasize: "Value Chain",
  subtitle: "Break the business into activities to find the few where you can truly win.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 9,
    tags: ["value chain", "competitive advantage", "cost", "differentiation", "toolkit"],
    caseType: "capability analysis",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "where advantage lives",
      md: "A value chain looks like a tidy left-to-right diagram of what a company does. Its real job is sharper than that: break the business into its activities and find **where advantage lives** — the one or two steps where you can be genuinely cheaper, or genuinely better, than rivals. Everything else just has to be good enough.",
    },
    {
      type: "heading",
      level: 2,
      text: "What it breaks down",
      emphasize: "activity by activity",
    },
    {
      type: "prose",
      md: "The value chain splits a business into the activities that create value. *Primary* activities are the flow that makes and sells the product — inbound logistics, operations, outbound logistics, marketing, and service. *Support* activities are the spine that lets the flow run — infrastructure, HR, technology, and procurement. The gap between what customers will pay and what the whole chain costs to run is the **margin**.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 440" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="24" y="28" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">VALUE CHAIN - WHERE COST IS ADDED AND ADVANTAGE IS BUILT</text>
  <text x="24" y="44" fill="hsl(var(--muted-foreground))" font-size="10.5">Break the business into the activities that create value, then find the one or two where you can be cheaper or better than rivals.</text>

  <!-- PRIMARY chevrons -->
  <text x="24" y="70" fill="hsl(var(--primary))" font-size="9" font-weight="700" letter-spacing="0.05em">PRIMARY ACTIVITIES - the flow that makes and sells the product</text>
  <g>
    <!-- 5 chevrons -->
    <path d="M14,80 H150 L168,108 L150,136 H14 L32,108 Z" fill="url(#cg)" stroke="hsl(var(--border-strong))"/>
    <text x="88" y="105" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10.5" font-weight="600">Inbound</text>
    <text x="88" y="120" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8.5">sourcing, RM</text>
    <path d="M160,80 H296 L314,108 L296,136 H160 L178,108 Z" fill="url(#cg)" stroke="hsl(var(--border-strong))"/>
    <text x="237" y="105" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10.5" font-weight="600">Operations</text>
    <text x="237" y="120" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8.5">make / assemble</text>
    <path d="M306,80 H442 L460,108 L442,136 H306 L324,108 Z" fill="url(#cg)" stroke="hsl(var(--border-strong))"/>
    <text x="383" y="105" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10.5" font-weight="600">Outbound</text>
    <text x="383" y="120" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8.5">warehouse, ship</text>
    <!-- marketing chevron highlighted -->
    <path d="M452,80 H588 L606,108 L588,136 H452 L470,108 Z" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.8"/>
    <text x="529" y="105" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10.5" font-weight="600">Marketing</text>
    <text x="529" y="120" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8.5">brand, sales</text>
    <path d="M598,80 H732 L750,108 L732,136 H598 L616,108 Z" fill="url(#cg)" stroke="hsl(var(--border-strong))"/>
    <text x="674" y="105" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10.5" font-weight="600">Service</text>
    <text x="674" y="120" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8.5">support, returns</text>
  </g>

  <!-- SUPPORT activities -->
  <text x="24" y="166" fill="hsl(var(--primary))" font-size="9" font-weight="700" letter-spacing="0.05em">SUPPORT ACTIVITIES - the spine that lets the primary flow run</text>
  <rect x="14" y="174" width="178" height="44" rx="8" fill="url(#cg)" stroke="hsl(var(--border-strong))"/>
  <text x="103" y="194" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10" font-weight="600">Firm infrastructure</text>
  <text x="103" y="209" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8.5">finance, planning, quality</text>
  <rect x="198" y="174" width="178" height="44" rx="8" fill="url(#cg)" stroke="hsl(var(--border-strong))"/>
  <text x="287" y="194" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10" font-weight="600">HR management</text>
  <text x="287" y="209" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8.5">hire, train, retain</text>
  <rect x="382" y="174" width="178" height="44" rx="8" fill="url(#cg)" stroke="hsl(var(--border-strong))"/>
  <text x="471" y="194" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10" font-weight="600">Technology</text>
  <text x="471" y="209" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8.5">R&amp;D, systems, automation</text>
  <rect x="566" y="174" width="180" height="44" rx="8" fill="url(#cg)" stroke="hsl(var(--border-strong))"/>
  <text x="656" y="194" text-anchor="middle" fill="hsl(var(--foreground))" font-size="10" font-weight="600">Procurement</text>
  <text x="656" y="209" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8.5">how inputs are bought</text>

  <!-- margin bar -->
  <rect x="14" y="230" width="732" height="30" rx="8" fill="url(#ng)"/>
  <text x="380" y="250" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="700">MARGIN  =  what the customer will pay  -  what the whole chain costs to run</text>

  <!-- two-lens callout strip -->
  <rect x="14" y="272" width="359" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="28" y="291" fill="hsl(var(--primary))" font-size="9.5" font-weight="700" letter-spacing="0.05em">COST LENS</text>
  <text x="28" y="308" fill="hsl(var(--foreground))" font-size="10.5">Which activity costs more than rivals',</text>
  <text x="28" y="324" fill="hsl(var(--foreground))" font-size="10.5">and which could we run cheaper?</text>
  <rect x="387" y="272" width="359" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="401" y="291" fill="hsl(var(--primary))" font-size="9.5" font-weight="700" letter-spacing="0.05em">DIFFERENTIATION LENS</text>
  <text x="401" y="308" fill="hsl(var(--foreground))" font-size="10.5">Which activity creates value a customer</text>
  <text x="401" y="324" fill="hsl(var(--foreground))" font-size="10.5">will pay extra for - and can we own it?</text>

  <!-- HOW TO USE -->
  <rect x="14" y="348" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="369" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="386" fill="hsl(var(--foreground))" font-size="11.5">Walk the chain activity by activity, then find the one or two where you win on cost or on something customers pay extra for.</text>
  <text x="28" y="402" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: don't audit all nine equally. Advantage lives in a couple of activities - the rest just need to be good enough.</text>
</svg>`,
      caption: "Primary and support activities — read through a cost lens and a differentiation lens.",
      maxWidth: 760,
      ariaLabel: "A value chain: primary activities as a chevron flow (inbound, operations, outbound, marketing, service) over a row of support activities (infrastructure, HR, technology, procurement), with margin defined as customer value minus total chain cost, read through a cost lens and a differentiation lens.",
    },
    {
      type: "prose",
      md: "Read the chain through two lenses. The **cost lens** asks: which activity costs us more than rivals, and which could we run cheaper? The **differentiation lens** asks: which activity creates something a customer will pay extra for, and can we own it? Advantage almost always concentrates in a couple of activities — not spread evenly across all nine.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "the activities that matter",
    },
    {
      type: "prose",
      md: "Walk the chain activity by activity, cost each step against rivals, then find the one or two where the real advantage sits. Invest there; fix, outsource, or simply hold the rest to ‘good enough’. The discipline is resisting the urge to audit all nine equally — that produces a tidy chart and no insight.",
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
  <text x="24" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">USING THE VALUE CHAIN - FOUR MOVES</text>
  <text x="474" y="34" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">SAY IT OUT LOUD</text>
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6">
    <path d="M239,108 L239,122" marker-end="url(#ar)"/>
    <path d="M239,190 L239,204" marker-end="url(#ar)"/>
    <path d="M239,272 L239,286" marker-end="url(#ar)"/>
  </g>
  <rect x="24" y="50" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="65" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="84" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">1</text>
  <text x="80" y="75" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Break the business into activities</text>
  <text x="80" y="93" fill="hsl(var(--muted-foreground))" font-size="11">primary flow plus the support spine - the real steps, not generic ones</text>
  <text x="474" y="75" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Let me lay out how this business</text>
  <text x="474" y="91" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">actually creates value, step by step.”</text>
  <rect x="24" y="132" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="147" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="166" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">2</text>
  <text x="80" y="157" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Cost each step vs rivals</text>
  <text x="80" y="175" fill="hsl(var(--muted-foreground))" font-size="11">where are we more expensive, and where cheaper, than competitors?</text>
  <text x="474" y="157" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Our logistics cost twice the</text>
  <text x="474" y="173" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">benchmark - that’s the cost leak.”</text>
  <rect x="24" y="214" width="430" height="58" rx="11" fill="url(#cg)" stroke="hsl(var(--border-strong))" filter="url(#cs)"/>
  <rect x="38" y="229" width="28" height="28" rx="7" fill="hsl(var(--navy))"/><text x="52" y="248" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">3</text>
  <text x="80" y="239" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Find where advantage really sits</text>
  <text x="80" y="257" fill="hsl(var(--muted-foreground))" font-size="11">the one or two activities a customer pays extra for, or we run cheaper</text>
  <text x="474" y="239" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“Our edge is sourcing and brand -</text>
  <text x="474" y="255" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">everything else just has to be fine.”</text>
  <rect x="24" y="296" width="430" height="58" rx="11" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <rect x="38" y="311" width="28" height="28" rx="7" fill="hsl(var(--primary))"/><text x="52" y="330" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">4</text>
  <text x="80" y="321" fill="hsl(var(--foreground))" font-size="13.5" font-weight="600">Act on the few that matter</text>
  <text x="80" y="339" fill="hsl(var(--muted-foreground))" font-size="11">invest in the advantage activities; fix or outsource the laggards</text>
  <text x="474" y="321" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">“So double down on sourcing, and</text>
  <text x="474" y="337" fill="hsl(var(--muted-foreground))" font-size="11" font-style="italic">outsource the warehousing that bleeds.”</text>
  <rect x="24" y="372" width="712" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="38" y="393" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="38" y="410" fill="hsl(var(--foreground))" font-size="11.5">The value chain finds where advantage lives. Locate the one or two activities that drive cost or differentiation, and act there.</text>
  <text x="38" y="426" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: don’t audit all nine activities equally. Most just need to be good enough; advantage hides in a couple of them.</text>
</svg>`,
      caption: "Four moves that turn the chain into a source of advantage.",
      maxWidth: 620,
      ariaLabel: "A four-step flow for using the value chain: break the business into activities, cost each step vs rivals, find where advantage really sits, and act on the few that matter, with a spoken script beside each step.",
    },
    {
      type: "callout",
      variant: "insight",
      title: "It pairs with Profitability — it doesn't replace it",
      md: "The value chain and a cost breakdown look at the same business from two angles: Profitability asks *where does the money leak?*, the value chain asks *where do we hold an edge?* Use the value chain to locate advantage and strategic cost position; use the Profitability cost tree when you need to quantify and attack a specific cost line. They are complements, not substitutes.",
    },
    {
      type: "heading",
      level: 2,
      text: "Worked example: a D2C brand's real margin lever",
      emphasize: "a D2C brand",
    },
    {
      type: "prose",
      md: "A D2C personal-care brand has healthy revenue but thin margins and wants to know where to focus. The value chain locates the lever — and rules out the activities that are merely fine.",
    },
    {
      type: "dialogue",
      title: "Finding the lever",
      turns: [
        { speaker: "interviewer", md: "A D2C personal-care brand is growing but its margins are thin. They want to know where in the business to focus to build a real edge. How would you approach it?" },
        { speaker: "candidate", note: "Lays out the chain, then costs it vs rivals.", md: "I'd lay out their value chain and cost each step against competitors. Sourcing and manufacturing — they outsource to contract manufacturers like everyone else, so no edge there. Operations and outbound logistics look roughly at benchmark. But two activities stand out. Their performance-marketing cost per acquisition is high and rising — that's a cost leak. And their brand and content — the thing that lets them charge a premium — is genuinely strong, a real differentiation activity." },
        { speaker: "interviewer", md: "So where should they focus?" },
        { speaker: "candidate", note: "Acts on the two that matter, holds the rest.", md: "Two moves, from the two lenses. On the cost lens: the margin leak is customer acquisition, so the priority is shifting from paid performance marketing toward the brand and organic channels they're already good at — that attacks the biggest cost line directly. On the differentiation lens: their brand is the activity customers actually pay extra for, so invest there to deepen it. Everything else — sourcing, fulfilment — just needs to stay competitive; there's no edge to chase in steps where they look like everyone else." },
        { speaker: "narrator", md: "The candidate didn't grade all nine activities equally — they found the one cost leak and the one differentiation source that mattered and pointed the focus there. That selectivity is what the value chain is for." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "The value chain feeds the right-to-win question in **Market Entry** (do we have an activity-level edge here?) and the cost side of **Profitability** (the same activities, viewed as cost lines). It also underpins the ‘Company’ lens of the **5 C’s**.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Break a business into primary and support activities rather than treating it as one block.",
        "Read the chain through a cost lens and a differentiation lens.",
        "Find the one or two activities where real advantage sits, and hold the rest to ‘good enough’.",
        "Use the value chain to locate advantage, and the Profitability cost tree to quantify and attack a cost line.",
        "Avoid the trap of auditing all nine activities equally."
      ],
    }
  ],
};

export default valueChain;

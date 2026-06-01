import type { Page } from "../../types";

/**
 * Miscellaneous Frameworks - VRIO Framework
 * Light reference card (Section G). One inline SVG hero to the locked v2 grammar (s9.14).
 */
export const vrio: Page = {
  slug: "miscellaneous/vrio",
  title: "VRIO Framework",
  titleEmphasize: "VRIO",
  subtitle: "Test whether a resource gives a real, lasting advantage - or none at all.",
  kind: "toolkit",
  meta: {
    readingTimeMin: 6,
    tags: ["vrio", "competitive advantage", "resources", "capability", "miscellaneous"],
    caseType: "capability analysis",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "where it first fails",
      md: "Companies love to claim advantages — ‘our brand', ‘our people', ‘our tech'. VRIO is the test that separates a real, durable edge from a comforting story. Run a resource through four gates — Valuable, Rare, Inimitable, Organised — and **where it first fails** tells you exactly how strong the advantage really is.",
    },
    {
      type: "heading",
      level: 2,
      text: "The four gates",
      emphasize: "in sequence",
    },
    {
      type: "prose",
      md: "**Valuable** — does it let you exploit an opportunity or counter a threat? **Rare** — do few rivals have it? **Inimitable** — is it hard or costly to copy? **Organised** — is the firm actually set up to capture its value? Each gate is harder than the last, and the first ‘no' you hit names the outcome.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 372" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="24" y="28" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">VRIO - DOES THIS RESOURCE GIVE A LASTING EDGE?</text>
  <text x="24" y="44" fill="hsl(var(--muted-foreground))" font-size="10.5">Run a resource or capability through four gates. The first "no" tells you exactly how strong the advantage really is.</text>

  <!-- 4 gate nodes left-to-right, each with a YES path right and a NO drop -->
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.5">
    <path d="M122,96 L168,96" marker-end="url(#ar)"/>
    <path d="M290,96 L336,96" marker-end="url(#ar)"/>
    <path d="M458,96 L504,96" marker-end="url(#ar)"/>
    <path d="M626,96 L664,96" marker-end="url(#ar)"/>
  </g>
  <text x="145" y="90" text-anchor="middle" fill="hsl(var(--primary))" font-size="8.5" font-weight="700">YES</text>
  <text x="313" y="90" text-anchor="middle" fill="hsl(var(--primary))" font-size="8.5" font-weight="700">YES</text>
  <text x="481" y="90" text-anchor="middle" fill="hsl(var(--primary))" font-size="8.5" font-weight="700">YES</text>
  <text x="645" y="90" text-anchor="middle" fill="hsl(var(--primary))" font-size="8.5" font-weight="700">YES</text>

  <!-- gate V -->
  <rect x="14" y="72" width="108" height="48" rx="10" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="68" y="92" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11" font-weight="700">Valuable?</text>
  <text x="68" y="108" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8">exploits opportunity</text>
  <!-- gate R -->
  <rect x="182" y="72" width="108" height="48" rx="10" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="236" y="92" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11" font-weight="700">Rare?</text>
  <text x="236" y="108" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8">few rivals have it</text>
  <!-- gate I -->
  <rect x="350" y="72" width="108" height="48" rx="10" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="404" y="92" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11" font-weight="700">Inimitable?</text>
  <text x="404" y="108" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8">hard to copy</text>
  <!-- gate O -->
  <rect x="518" y="72" width="108" height="48" rx="10" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="572" y="92" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11" font-weight="700">Organised?</text>
  <text x="572" y="108" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8">set up to use it</text>
  <!-- outcome (sustained) -->
  <rect x="664" y="68" width="82" height="56" rx="10" fill="url(#ng)" filter="url(#rs)"/>
  <text x="705" y="90" text-anchor="middle" fill="#ffffff" font-size="9.5" font-weight="700">Sustained</text>
  <text x="705" y="103" text-anchor="middle" fill="#ffffff" font-size="9.5" font-weight="700">advantage</text>
  <text x="705" y="116" text-anchor="middle" fill="#b9c4d6" font-size="7.5">the moat</text>

  <!-- NO drops -->
  <g fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.4" stroke-dasharray="4 3">
    <path d="M68,120 L68,168" marker-end="url(#ar)"/>
    <path d="M236,120 L236,168" marker-end="url(#ar)"/>
    <path d="M404,120 L404,168" marker-end="url(#ar)"/>
    <path d="M572,120 L572,168" marker-end="url(#ar)"/>
  </g>
  <text x="80" y="144" fill="hsl(var(--muted-foreground))" font-size="8" font-weight="700">NO</text>
  <text x="248" y="144" fill="hsl(var(--muted-foreground))" font-size="8" font-weight="700">NO</text>
  <text x="416" y="144" fill="hsl(var(--muted-foreground))" font-size="8" font-weight="700">NO</text>
  <text x="584" y="144" fill="hsl(var(--muted-foreground))" font-size="8" font-weight="700">NO</text>

  <!-- NO outcomes -->
  <rect x="14" y="172" width="108" height="50" rx="8" fill="hsl(var(--muted))"/>
  <text x="68" y="192" text-anchor="middle" fill="hsl(var(--foreground))" font-size="9" font-weight="600">Disadvantage</text>
  <text x="68" y="207" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8">it's a liability</text>
  <rect x="182" y="172" width="108" height="50" rx="8" fill="hsl(var(--muted))"/>
  <text x="236" y="192" text-anchor="middle" fill="hsl(var(--foreground))" font-size="9" font-weight="600">Parity</text>
  <text x="236" y="207" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8">everyone has it</text>
  <rect x="350" y="172" width="108" height="50" rx="8" fill="hsl(var(--muted))"/>
  <text x="404" y="188" text-anchor="middle" fill="hsl(var(--foreground))" font-size="9" font-weight="600">Temporary</text>
  <text x="404" y="201" text-anchor="middle" fill="hsl(var(--foreground))" font-size="9" font-weight="600">edge</text>
  <text x="404" y="214" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8">until copied</text>
  <rect x="518" y="172" width="108" height="50" rx="8" fill="hsl(var(--muted))"/>
  <text x="572" y="188" text-anchor="middle" fill="hsl(var(--foreground))" font-size="9" font-weight="600">Unused</text>
  <text x="572" y="201" text-anchor="middle" fill="hsl(var(--foreground))" font-size="9" font-weight="600">potential</text>
  <text x="572" y="214" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="8">not capturing it</text>

  <!-- HOW TO USE -->
  <rect x="14" y="240" width="732" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="261" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="278" fill="hsl(var(--foreground))" font-size="11.5">Run a resource through the four gates in order - where it first fails tells you if the edge is real, fleeting, or wasted.</text>
  <text x="28" y="294" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: test a concrete resource, not the whole company. "Our brand" is too vague - "our 40-year dealer network" is testable.</text>
</svg>`,
      caption: "Four gates; the first 'no' tells you the level of advantage.",
      maxWidth: 760,
      ariaLabel: "The VRIO decision flow: valuable, rare, inimitable, organised, where failing each gate yields disadvantage, parity, temporary edge, unused potential, or sustained advantage.",
    },
    {
      type: "heading",
      level: 2,
      text: "How to use it",
      emphasize: "test a concrete resource",
    },
    {
      type: "prose",
      md: "Pick a *specific* resource and run it through the gates in order. Fail ‘valuable' and it's a liability; pass valuable but fail ‘rare' and you have mere parity; rare but imitable gives only a temporary edge; all three but not organised means unused potential. Pass all four and you have a genuine, sustained advantage — a moat.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "Testing 'the company', not a resource",
      md: "VRIO only works on a concrete, nameable resource. ‘Our brand' is too vague to test; ‘our 40-year exclusive dealer network in Tier-2 towns' is specific enough to run through the gates. Vague inputs give vague, useless answers.",
    },
    {
      type: "dialogue",
      title: "Is the edge real?",
      turns: [
        { speaker: "interviewer", md: "A logistics firm claims its ‘technology platform' is its competitive advantage. How would you test that claim?" },
        { speaker: "candidate", note: "Forces a concrete resource through the gates.", md: "First I'd make it concrete — ‘technology platform' is too vague. Say the real asset is their route-optimisation software. Valuable? Yes, it cuts delivery cost. Rare? Maybe not — several competitors and vendors offer similar optimisation. If it's not rare, VRIO stops there: it's competitive parity, table stakes, not an advantage. But if instead the real asset is their proprietary last-mile network in specific regions — valuable, rare, genuinely hard to replicate, and they're organised to use it — that passes all four and is the actual moat. So I'd redirect them: the software isn't the edge; the network is." },
        { speaker: "narrator", md: "By forcing a vague claim into a specific resource and running the gates, the candidate found that the stated advantage was parity and the real one lay elsewhere." }
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "VRIO is the rigorous test behind ‘right to win' in **Market Entry** and the activities that matter in the **Value Chain**. It pairs naturally with the **Sustainable Competitive Advantage** moats — VRIO tests whether a moat is real.",
    },
    {
      type: "keyTakeaways",
      title: "What you will be able to do",
      items: [
        "Test a specific resource against four gates: valuable, rare, inimitable, organised.",
        "Read the first failed gate as the level of advantage — disadvantage, parity, temporary, or unused.",
        "Distinguish a genuine sustained moat from table-stakes parity.",
        "Force vague advantage claims into concrete, testable resources.",
        "Use it to validate a ‘right to win' or a claimed moat."
      ],
    }
  ],
};

export default vrio;

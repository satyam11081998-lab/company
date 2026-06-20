import type { Page } from "../../types";

/**
 * Core Frameworks — MECE.
 * The namesake principle: every clean structure is Mutually Exclusive and
 * Collectively Exhaustive. Pairs with `structuring-fundamentals` (how to build
 * a structure) — this page is the rule you test each layer against.
 * Reuses the locked v2 visual grammar (§9.14).
 */
export const meceFramework: Page = {
  slug: "core-frameworks/mece",
  title: "MECE",
  titleEmphasize: "MECE",
  subtitle: "The one rule behind every clean structure — Mutually Exclusive, Collectively Exhaustive.",
  kind: "framework",
  meta: {
    readingTimeMin: 7,
    tags: ["mece", "structuring", "issue tree", "foundations"],
    caseType: "structuring",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "no double-counting, and nothing missed",
      md: "MECE — **Mutually Exclusive, Collectively Exhaustive** — is the principle this whole product is named after, and the spine of every structure you will ever draw. It is a quiet promise to the interviewer: no double-counting, and nothing missed. Get this one idea right and your issue trees stop leaking; get it wrong and even perfect arithmetic sits on a broken frame.",
    },
    {
      type: "heading",
      level: 2,
      text: "What MECE actually means",
      emphasize: "MECE",
    },
    {
      type: "prose",
      md: "*Mutually exclusive* means no item can sit in two buckets — so you never count the same thing twice or argue with yourself about where something belongs. *Collectively exhaustive* means the buckets together cover the whole problem — so you cannot be ambushed by a factor you forgot. A split is MECE when the pieces **tile the whole**: no overlaps, no leftovers.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 372" xmlns="http://www.w3.org/2000/svg" role="img">
<defs>
  <linearGradient id="meceCg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="hsl(var(--card))"/>
    <stop offset="1" stop-color="hsl(var(--muted))"/>
  </linearGradient>
  <filter id="meceCs" x="-20%" y="-20%" width="140%" height="150%">
    <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#0b1220" flood-opacity="0.14"/>
  </filter>
</defs>
  <!-- CARD 1: MECE (good) -->
  <rect x="14" y="16" width="230" height="256" rx="12" fill="url(#meceCg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#meceCs)"/>
  <circle cx="33" cy="42" r="5" fill="hsl(var(--success))"/>
  <text x="46" y="46" fill="hsl(var(--success))" font-size="11.5" font-weight="700" letter-spacing="0.05em">MECE — DO THIS</text>
  <text x="29" y="66" fill="hsl(var(--muted-foreground))" font-size="10.5">covers the whole, no double-count</text>
  <rect x="29" y="104" width="200" height="46" rx="8" fill="hsl(var(--muted))"/>
  <rect x="31" y="106" width="64" height="42" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="63" y="131" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">A</text>
  <rect x="97" y="106" width="64" height="42" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="129" y="131" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">B</text>
  <rect x="163" y="106" width="64" height="42" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="195" y="131" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">C</text>
  <text x="29" y="190" fill="hsl(var(--foreground))" font-size="11.5" font-weight="600">Every part fits one bucket.</text>
  <text x="29" y="208" fill="hsl(var(--muted-foreground))" font-size="11">The pieces tile the whole with</text>
  <text x="29" y="224" fill="hsl(var(--muted-foreground))" font-size="11">no seams and no leftovers.</text>

  <!-- CARD 2: not mutually exclusive -->
  <rect x="257" y="16" width="230" height="256" rx="12" fill="url(#meceCg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#meceCs)"/>
  <circle cx="276" cy="42" r="5" fill="hsl(var(--primary))"/>
  <text x="289" y="46" fill="hsl(var(--primary))" font-size="11.5" font-weight="700" letter-spacing="0.05em">NOT EXCLUSIVE</text>
  <text x="272" y="66" fill="hsl(var(--muted-foreground))" font-size="10.5">buckets overlap → double-counting</text>
  <rect x="272" y="104" width="200" height="46" rx="8" fill="hsl(var(--muted))"/>
  <rect x="278" y="106" width="118" height="42" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="319" y="131" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">A</text>
  <rect x="350" y="106" width="118" height="42" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="429" y="131" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">B</text>
  <rect x="350" y="106" width="46" height="42" fill="hsl(var(--primary))" fill-opacity="0.20"/>
  <line x1="373" y1="100" x2="373" y2="158" stroke="hsl(var(--primary))" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="373" y="172" text-anchor="middle" fill="hsl(var(--primary))" font-size="10" font-weight="600">counted twice</text>
  <text x="272" y="200" fill="hsl(var(--foreground))" font-size="11.5" font-weight="600">“New vs lapsed customers”</text>
  <text x="272" y="217" fill="hsl(var(--muted-foreground))" font-size="11">— a reactivated user lands in</text>
  <text x="272" y="233" fill="hsl(var(--muted-foreground))" font-size="11">both. Pick one definition.</text>

  <!-- CARD 3: not collectively exhaustive -->
  <rect x="500" y="16" width="230" height="256" rx="12" fill="url(#meceCg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#meceCs)"/>
  <circle cx="519" cy="42" r="5" fill="hsl(var(--primary))"/>
  <text x="532" y="46" fill="hsl(var(--primary))" font-size="11.5" font-weight="700" letter-spacing="0.05em">NOT EXHAUSTIVE</text>
  <text x="515" y="66" fill="hsl(var(--muted-foreground))" font-size="10.5">a bucket is missing → blind spot</text>
  <rect x="515" y="104" width="200" height="46" rx="8" fill="hsl(var(--muted))"/>
  <rect x="521" y="106" width="62" height="42" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="552" y="131" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">A</text>
  <rect x="587" y="106" width="62" height="42" rx="6" fill="none" stroke="hsl(var(--primary))" stroke-width="1.4" stroke-dasharray="4 3"/>
  <text x="618" y="132" text-anchor="middle" fill="hsl(var(--primary))" font-size="15" font-weight="700">?</text>
  <rect x="653" y="106" width="56" height="42" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))"/>
  <text x="681" y="131" text-anchor="middle" fill="hsl(var(--foreground))" font-size="13" font-weight="600">C</text>
  <text x="515" y="200" fill="hsl(var(--foreground))" font-size="11.5" font-weight="600">Splitting cost into “fixed +</text>
  <text x="515" y="217" fill="hsl(var(--muted-foreground))" font-size="11">labour” forgets variable input</text>
  <text x="515" y="233" fill="hsl(var(--muted-foreground))" font-size="11">cost. Add the missing branch.</text>

  <!-- HOW TO USE THIS -->
  <rect x="14" y="292" width="716" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="28" y="313" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="28" y="330" fill="hsl(var(--foreground))" font-size="11.5">Pressure-test every split: can an item sit in two buckets (overlap)? Anything missing (gap)? Fix both, then drill.</text>
  <text x="28" y="346" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: perfect MECE on paper can still be useless — buckets must also be worth analysing.</text>
</svg>`,
      caption: "One clean split, and the two ways a split fails — overlap and gap.",
      maxWidth: 760,
      ariaLabel: "Three panels contrasting a clean MECE split with a not-mutually-exclusive split that overlaps and a not-collectively-exhaustive split with a missing bucket.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "The two ways a split goes wrong",
      md: "**Overlap (not ME)** — splitting customers into *new* and *lapsed* breaks the moment a lapsed customer returns: now they are both, and you double-count. **Gap (not CE)** — splitting cost into *fixed* and *labour* quietly forgets variable inputs like raw material, so a whole driver hides from you. Run both tests on every layer.",
    },
    {
      type: "heading",
      level: 2,
      text: "Five ways to split that stay MECE",
      emphasize: "MECE",
    },
    {
      type: "prose",
      md: "You rarely invent a MECE split from scratch — you reach for a natural axis that is MECE by construction. These five cover almost every case:",
    },
    {
      type: "table",
      headers: ["Split by", "Example", "Why it stays MECE"],
      firstColHeader: true,
      rows: [
        ["An equation", "Profit → Revenue − Cost; Revenue → Price × Volume", "Arithmetic identities can't overlap or leak."],
        ["A process / flow", "Awareness → Consideration → Purchase → Repeat", "Each stage owns one step in a sequence."],
        ["Segments", "By geography, customer type, or product line", "One mutually-exclusive axis at a time."],
        ["Stakeholders", "Company · Customer · Competitor · Channel", "Distinct actors that jointly cover the system."],
        ["A 2×2", "New vs existing × high vs low value", "Independent axes give four non-overlapping cells."],
      ],
      caption: "Borrow a MECE-by-construction axis instead of hand-listing buckets and hoping.",
    },
    {
      type: "callout",
      variant: "insight",
      title: "MECE is necessary, not sufficient",
      md: "A split can be flawlessly MECE and still useless if the buckets aren't worth analysing — e.g. splitting revenue by the first letter of the customer's name. Clean buys you trust; **insight** comes from choosing buckets that actually move the answer, then drilling only the one that matters.",
    },
    {
      type: "heading",
      level: 2,
      text: "The 10-second MECE check",
    },
    {
      type: "steps",
      ordered: true,
      items: [
        { title: "Overlap test", md: "Can any single item land in two buckets? If yes, tighten the definitions until it can't." },
        { title: "Gap test", md: "Is anything left out? Add the missing branch — and when unsure, an explicit *“Other”* bucket keeps you exhaustive." },
        { title: "Worth-it test", md: "Is each bucket worth analysing? Drop or merge the trivial ones." },
        { title: "Then drill", md: "Expand only the bucket that drives the answer — don't grow every branch equally." },
      ],
    },
    {
      type: "keyTakeaways",
      title: "Remember this",
      items: [
        "MECE = **Mutually Exclusive** (no overlaps, no double-counting) + **Collectively Exhaustive** (no gaps, nothing missed).",
        "Splits fail two ways: an item fits two buckets (overlap), or a factor is missing (gap). Test for both on every layer.",
        "Reach for a MECE-by-construction axis: an equation, a process, segments, stakeholders, or a 2×2.",
        "Clean is necessary, not sufficient — pick buckets that are actually worth analysing, then drill the one that matters.",
        "MECE is the check you run top-to-bottom on every issue tree. To see it in action, read [Structuring fundamentals](/learn/casebook/core-frameworks/structuring-fundamentals).",
      ],
    },
  ],
};

import type { Page } from "@/lib/casebook/types";

/**
 * Guesstimates — Page 4 — Pressure-Testing the Answer
 * Wholly invented scenarios/numbers (Indian-context). Inspired by the *patterns*
 * of the IIM/Bain/Wharton casebooks (sanity-check, cross-check top-down with
 * bottom-up, manage-your-zeroes) but no transcript or diagram is reproduced.
 * Trains the back half of the spine: Triangulate → Recommend, plus the trap list.
 */
export const pressureTesting: Page = {
  slug: "guesstimates/pressure-testing",
  title: "Pressure-Testing the Answer",
  titleEmphasize: "Pressure-Testing",
  subtitle: "The fifteen seconds that catch a 10× error — and the traps that cause them.",
  kind: "framework",
  meta: {
    readingTimeMin: 11,
    tags: ["guesstimates", "triangulation", "sanity-check", "sensitivity", "traps"],
    caseType: "market sizing",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "the cheapest insurance policy in the entire case",
      md: "A candidate finishes a clean, well-narrated solve and lands on ₹4,000 cr for premium dark chocolate. The structure scored. The arithmetic scored. Then one question — *isn't that a quarter of India's entire chocolate market?* — vaporises all of it. The tragedy is that a fifteen-second cross-check would have caught it. Triangulation and the sanity check are **the cheapest insurance policy in the entire case**: together worth 20% of the rubric, costing almost no time, and skipped by most candidates. This page makes them reflex.",
    },

    { type: "heading", level: 2, text: "Triangulate: re-derive from the diagonal", emphasize: "diagonal" },
    {
      type: "prose",
      md: "Triangulation is one rule: **solve it a second way and reconcile.** Page 2 gave you the map — if your first pass was Top-Down on the demand side, your second pass is Bottom-Up or supply-side. The casebook formulation is exactly this: *check a top-down answer with a bottom-up one, or vice versa.* You don't need a perfect second method; you need an *independent* one, built from different anchors, so the two errors don't cancel and hide.",
    },
    {
      type: "svg",
      maxWidth: 720,
      ariaLabel: "A reconciliation decision flow. Method A and Method B, built from independent anchors, both feed a comparison node. If the two estimates are within roughly twenty-five percent, take the branch that says state a central number with a range. If they diverge by several times, take the branch that says the gap is a diagnostic — find the broken assumption, do not average.",
      caption: "Two independent builds → reconcile. Agreement buys confidence; a large gap is a diagnostic, never an average.",
      svg: `<svg viewBox="0 0 720 400" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif" role="img">
<defs>
  <linearGradient id="pt-ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  <filter id="pt-cs" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#0b1220" flood-opacity="0.14"/></filter>
  <marker id="pt-ar" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0.5,0.8 L9,5 L0.5,9.2" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>
</defs>
  <text x="24" y="26" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">THE RECONCILIATION TEST</text>

  <rect x="40" y="50" width="240" height="74" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" filter="url(#pt-cs)"/>
  <text x="56" y="72" fill="hsl(var(--foreground))" font-size="11" font-weight="700">METHOD A — Top-Down · Demand</text>
  <text x="56" y="91" fill="hsl(var(--muted-foreground))" font-size="9.5">Filter a population down.</text>
  <text x="56" y="111" fill="hsl(var(--primary))" font-size="11" font-weight="700">≈ ₹1,000 cr</text>

  <rect x="440" y="50" width="240" height="74" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" filter="url(#pt-cs)"/>
  <text x="456" y="72" fill="hsl(var(--foreground))" font-size="11" font-weight="700">METHOD B — Supply-side</text>
  <text x="456" y="91" fill="hsl(var(--muted-foreground))" font-size="9.5">Count providers × output.</text>
  <text x="456" y="111" fill="hsl(var(--primary))" font-size="11" font-weight="700">≈ ₹800 cr</text>

  <path d="M 160 124 L 160 152 L 360 152 L 360 176" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.4"/>
  <path d="M 560 124 L 560 152 L 360 152" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.4"/>
  <path d="M 360 152 L 360 178" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.4" marker-end="url(#pt-ar)"/>

  <rect x="270" y="180" width="180" height="46" rx="9" fill="url(#pt-ng)" filter="url(#pt-cs)"/>
  <text x="360" y="200" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">Within ~25%?</text>
  <text x="360" y="216" text-anchor="middle" fill="#b9c4d6" font-size="9">compare the two builds</text>

  <path d="M 270 203 L 170 203 L 170 250" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.3" marker-end="url(#pt-ar)"/>
  <text x="210" y="197" text-anchor="middle" fill="hsl(var(--primary))" font-size="9.5" font-weight="700">YES</text>
  <path d="M 450 203 L 552 203 L 552 250" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.3" marker-end="url(#pt-ar)"/>
  <text x="512" y="197" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9.5" font-weight="700">NO — 5× apart</text>

  <rect x="40" y="252" width="260" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="56" y="274" fill="hsl(var(--primary))" font-size="10" font-weight="700" letter-spacing="0.05em">STATE WITH CONFIDENCE</text>
  <text x="56" y="294" fill="hsl(var(--foreground))" font-size="9.5">Central estimate ≈ ₹900 cr.</text>
  <text x="56" y="310" fill="hsl(var(--foreground))" font-size="9.5">Range ₹500–1,700 cr on the</text>
  <text x="56" y="326" fill="hsl(var(--foreground))" font-size="9.5">swing assumption. Then: so what?</text>

  <rect x="422" y="252" width="260" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
  <text x="438" y="274" fill="hsl(var(--foreground))" font-size="10" font-weight="700" letter-spacing="0.05em">THE GAP IS A DIAGNOSTIC</text>
  <text x="438" y="294" fill="hsl(var(--muted-foreground))" font-size="9.5">Don't average. Find the broken</text>
  <text x="438" y="310" fill="hsl(var(--muted-foreground))" font-size="9.5">term — usually a units slip or a</text>
  <text x="438" y="326" fill="hsl(var(--muted-foreground))" font-size="9.5">missing zero. Fix it, re-reconcile.</text>

  <text x="360" y="372" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="9.5" font-style="italic">Two methods that agree are worth more than one method that's exactly right — because you can defend them.</text>
</svg>`,
    },

    { type: "heading", level: 2, text: "Sanity check: does the number make sense?", emphasize: "make sense" },
    {
      type: "prose",
      md: "Before you say the number out loud, hold it against something you already know to be true. *Make sure your numbers make sense in the context of the case* — the simplest, most-skipped tip in every casebook. Three quick tests catch almost every blunder: the **share test** (is this a believable slice of a bigger total you know?), the **per-capita test** (does it imply something absurd per person or per day?), and the **magnitude test** (count the zeroes — are you in lakhs, crores, or lakh-crores?).",
    },
    {
      type: "drill",
      title: "Spot the order-of-magnitude error",
      instructions: "For each claimed answer, decide in five seconds whether it's plausible — and if not, which test it fails. Then reveal.",
      revealLabel: "Show the check",
      items: [
        {
          prompt: "\"Premium dark chocolate in India is a ₹4,000 cr / year market.\"",
          answer: "**Fails the share test.** India's *entire* chocolate market is ~₹15,000 cr; premium dark can't be a quarter of it. Expect ~₹500–1,000 cr. This is the chocolate trap from Page 1.",
        },
        {
          prompt: "\"There are about 8 lakh petrol pumps in India.\"",
          answer: "**Fails the magnitude test — a slipped zero.** It's ~80,000 (see Page 2's worked solve). 8 lakh would be one pump per ~1,750 people, absurdly dense. You added a zero.",
        },
        {
          prompt: "\"India does roughly 50 crore UPI transactions per day.\"",
          answer: "**Plausible.** ~50 cr/day implies ~0.35 transactions per person per day across 1.4B — reasonable given UPI ubiquity. The order of magnitude holds; you'd state it with a range.",
        },
        {
          prompt: "\"About 10 crore weddings happen in India each year.\"",
          answer: "**Fails the per-capita test.** 10 cr weddings = 20 cr people marrying yearly, ~14% of the population every year — impossible. With ~1% of people marrying annually it's closer to ~1 cr weddings. You're 10× high.",
        },
      ],
    },

    { type: "heading", level: 2, text: "Recommend: a number with bounds, and a 'so what'", emphasize: "bounds" },
    {
      type: "prose",
      md: "Don't end on a bare point estimate. End on a **central number plus a range driven by your swing assumption**, then tie it back to why anyone asked. \"≈ ₹900 cr, range ₹500–1,700 cr depending on the active-buyer ratio — so for a brand deciding whether to enter, even the floor clears the ₹300 cr threshold that usually justifies a launch.\" The range shows you know your estimate is a model, not a fact; the 'so what' shows you remember it was a business question, not an arithmetic one.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Name your swing assumption — then bound it",
      md: "Every guesstimate has one assumption that moves the answer more than all the others combined. Find it, say it, and flex it: \"if the ownership rate is 8% instead of 12%, the answer drops to ~4M; at 16% it's ~8M.\" A bounded answer with a named driver reads as senior; a single number read off the top of a calculation reads as junior.",
    },

    { type: "heading", level: 2, text: "The trap list", emphasize: "trap" },
    {
      type: "prose",
      md: "Most lost points cluster into a handful of repeat offenders. Learn them as a pre-flight checklist — a glance down this list in the last ten seconds catches the error that ends rounds.",
    },
    {
      type: "table",
      headers: ["Trap", "What it looks like", "The fix"],
      rows: [
        ["**Slipped zero**", "Answer is 10× or 100× off; lakhs muddled with crores.", "Work in powers of ten; say the magnitude aloud at each step."],
        ["**Unit drift**", "Per-day mixed with per-year; litres with bottles.", "Lock units in Clarify; write them next to every number."],
        ["**Flow vs stock**", "Counting the installed base when asked for annual sales.", "Re-read the prompt: is it 'how many exist' or 'how many sold'?"],
        ["**Over-segmentation**", "Six filters, each ±50%, compounding into noise.", "Stop at 3–4 splits; more precision is false precision."],
        ["**Borrowed anchor**", "A half-remembered statistic used as bedrock.", "Derive shaky numbers; only anchor on what you'd defend."],
        ["**Blind averaging**", "Two methods 5× apart, answer = the mean.", "A gap is a diagnostic — fix the broken term, don't split it."],
        ["**Forgotten utilisation**", "Assuming every asset runs at full capacity.", "Apply a utilisation/idle factor to supply-side counts."],
        ["**No 'so what'**", "A number with no link to the business question.", "Close by tying the estimate to the decision it informs."],
      ],
      firstColHeader: true,
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "This closes the method spine: Page 1 framed the rubric, **Page 2** gave the four approaches, **Page 3** trained the clarify-and-communicate flow, and this page drilled the triangulation, sanity check, and traps that protect your score. Next, the **India cheat sheet (Page 5)** hands you the anchors these checks lean on — population, households, incomes, the numbers worth memorising. Then the worked examples in this section let you run the full spine end-to-end; each one tags the approach and the swing assumption so you can pressure-test your own pass against it.",
    },
    {
      type: "keyTakeaways",
      title: "After this page, you will be able to",
      items: [
        "Triangulate every solve with an independent second method built from different anchors, and reconcile the two out loud.",
        "Run the share, per-capita, and magnitude tests in seconds to catch a 10× error before the interviewer does.",
        "Treat a large gap between two methods as a diagnostic to debug, never as something to average.",
        "Close on a central estimate with a range driven by a named swing assumption, tied back to the business 'so what'.",
        "Pre-flight the eight common traps — slipped zeros, unit drift, flow-vs-stock, over-segmentation, and the rest — as a final checklist.",
      ],
    },
  ],
};

export default pressureTesting;

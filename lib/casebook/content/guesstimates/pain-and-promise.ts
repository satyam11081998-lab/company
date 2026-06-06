import type { Page } from "@/lib/casebook/types";

/**
 * Guesstimates — The Pain & The Promise
 * On-ramp for the Guesstimates section. Names what guesstimates actually test
 * (the weighted rubric), names the three flavours, and lays out the 90-second
 * spine that the rest of the section expands.
 */
export const painAndPromise: Page = {
  slug: "guesstimates/pain-and-promise",
  title: "The Pain & The Promise",
  titleEmphasize: "Promise",
  subtitle: "Why most candidates lose this case before they touch a number.",
  kind: "framework",
  meta: {
    readingTimeMin: 9,
    tags: ["guesstimates", "overview", "scoring", "rubric"],
    caseType: "market sizing",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "trusted with a ₹40 cr decision without a spreadsheet",
      md: "Three minutes in, the candidate confidently delivers her number: ₹4,000 cr a year for premium dark chocolate in India. The interviewer leans back. *India's entire chocolate market is around ₹15,000 cr. You're saying premium dark alone is a quarter of that?* She freezes. The structure was right. The math was right. The order of magnitude was unforgivable. Guesstimates don't test arithmetic — they test whether you can be **trusted with a ₹40 cr decision without a spreadsheet**. And the candidates who can are not the ones who memorised India's population.",
    },

    { type: "heading", level: 2, text: "What's actually being graded", emphasize: "actually" },
    {
      type: "prose",
      md: "Most candidates train guesstimates the way they trained for board exams — drilling mental arithmetic. Then they walk into a case where the math is rounded to the nearest crore and a wrong-by-10× answer ends the round in 90 seconds. The grader's rubric tells a different story: **arithmetic is 15% of the score**. The other 85% is *what* to compute, *how* to split it, and *whether* you noticed when you were obviously wrong.",
    },
    {
      type: "table",
      headers: ["Dimension", "Weight", "What it tests"],
      rows: [
        ["Structure & Approach", "30%", "Did you write the equation BEFORE you started multiplying?"],
        ["Segmentation & Assumptions", "25%", "Is your split MECE? Is each number justified out loud?"],
        ["Sanity Check & Triangulation", "20%", "Did you cross-check with a second method?"],
        ["Arithmetic & Unit Discipline", "15%", "Right math, right units, no drift between steps."],
        ["Scoping & Clarification", "10%", "Did you lock the prompt before you solved it?"],
      ],
      firstColHeader: true,
    },
    {
      type: "prose",
      md: "Two-thirds of your score sits in moves that happen *before* you do any multiplication — picking the equation, picking the splits, choosing whether to triangulate. A candidate who lands a perfect arithmetic score but skips Triangulate forfeits twenty points she could have caught in fifteen seconds. **This is the leverage.**",
    },

    { type: "heading", level: 2, text: "Three flavours, one skill", emphasize: "Three flavours" },
    {
      type: "prose",
      md: "Interviewers ask guesstimates in three flavours, and the flavour you're handed sets your default approach. Mistake a Revenue prompt for a Sizing prompt and you'll burn ninety seconds estimating the wrong universe. Name the flavour out loud and the rest of the solve clicks into a known shape.",
    },
    {
      type: "comparison",
      headers: ["Market Sizing", "Revenue / Throughput", "Unconventional"],
      rows: [
        { cells: [
          "How big is this market?",
          "What does this do per day or year?",
          "Estimate the unestimatable.",
        ] },
        { cells: [
          "Demand for ACs in India this year",
          "Daily revenue of a Bandra café",
          "Tennis balls that fit in an IPL stadium",
        ] },
        { cells: [
          "Top-down → Demand",
          "Bottom-up → Supply or Demand",
          "Driver breakdown under ambiguity",
        ] },
        { cells: [
          "₹ value × unit volume",
          "₹ per period",
          "A defensible order of magnitude",
        ] },
      ],
    },
    {
      type: "prose",
      md: "Not every prompt fits cleanly. *Revenue of food-delivery apps in Delhi over the next five years* stacks sizing on throughput on growth. The discipline is to spot the stack and solve the layers separately — not to find a single perfect bucket and force-fit the prompt into it.",
    },

    { type: "heading", level: 2, text: "The 90-second spine", emphasize: "90-second" },
    {
      type: "prose",
      md: "Strip away the casebook noise and every guesstimate you'll ever solve travels the same five stops. The candidate who delivers the strongest answer is rarely the one with the cleverest split — she's the one who visited all five stops in order and stayed at each long enough to do the work.",
    },
    {
      type: "svg",
      svg: `<svg viewBox="0 0 760 384" xmlns="http://www.w3.org/2000/svg" role="img">
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
  <text x="24" y="28" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">THE 90-SECOND SPINE — FIVE STAGES EVERY GUESSTIMATE SHARES</text>
  <text x="24" y="44" fill="hsl(var(--muted-foreground))" font-size="10.5">Walk all five stops, in order. Stage 4 (Triangulate) is the one most candidates skip — and the easiest to score.</text>

  <rect x="20" y="78" width="120" height="200" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
  <text x="80" y="104" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10" font-weight="700" letter-spacing="0.1em">01</text>
  <text x="80" y="130" text-anchor="middle" fill="hsl(var(--foreground))" font-size="15" font-weight="800">Clarify</text>
  <line x1="40" y1="146" x2="120" y2="146" stroke="hsl(var(--border-strong))" stroke-width="0.7"/>
  <text x="80" y="172" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11">Lock objective</text>
  <text x="80" y="188" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11">and universe</text>
  <text x="80" y="240" text-anchor="middle" fill="hsl(var(--primary))" font-size="10" font-weight="700" letter-spacing="0.07em">→ SEE PAGE 3</text>
  <rect x="170" y="78" width="120" height="200" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
  <text x="230" y="104" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10" font-weight="700" letter-spacing="0.1em">02</text>
  <text x="230" y="130" text-anchor="middle" fill="hsl(var(--foreground))" font-size="15" font-weight="800">Set Up</text>
  <line x1="190" y1="146" x2="270" y2="146" stroke="hsl(var(--border-strong))" stroke-width="0.7"/>
  <text x="230" y="172" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11">Pick approach,</text>
  <text x="230" y="188" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11">write equation</text>
  <text x="230" y="240" text-anchor="middle" fill="hsl(var(--primary))" font-size="10" font-weight="700" letter-spacing="0.07em">→ SEE PAGE 2</text>
  <rect x="320" y="78" width="120" height="200" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
  <text x="380" y="104" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10" font-weight="700" letter-spacing="0.1em">03</text>
  <text x="380" y="130" text-anchor="middle" fill="hsl(var(--foreground))" font-size="15" font-weight="800">Estimate</text>
  <line x1="340" y1="146" x2="420" y2="146" stroke="hsl(var(--border-strong))" stroke-width="0.7"/>
  <text x="380" y="172" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11">Justify each</text>
  <text x="380" y="188" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11">split, compute</text>
  <text x="380" y="240" text-anchor="middle" fill="hsl(var(--primary))" font-size="10" font-weight="700" letter-spacing="0.07em">→ SEE PAGE 4</text>
  <rect x="470" y="78" width="120" height="200" rx="9" fill="url(#cg)" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#cs)"/>
  <text x="530" y="104" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10" font-weight="700" letter-spacing="0.1em">04</text>
  <text x="530" y="130" text-anchor="middle" fill="hsl(var(--foreground))" font-size="15" font-weight="800">Triangulate</text>
  <line x1="490" y1="146" x2="570" y2="146" stroke="hsl(var(--border-strong))" stroke-width="0.7"/>
  <text x="530" y="172" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11">Cross-check with</text>
  <text x="530" y="188" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11">a second method</text>
  <text x="530" y="240" text-anchor="middle" fill="hsl(var(--primary))" font-size="10" font-weight="700" letter-spacing="0.07em">→ SEE PAGE 4</text>
  <rect x="620" y="78" width="120" height="200" rx="9" fill="url(#cg)" stroke="hsl(var(--border-strong))" stroke-width="1" filter="url(#cs)"/>
  <text x="680" y="104" text-anchor="middle" fill="hsl(var(--muted-foreground))" font-size="10" font-weight="700" letter-spacing="0.1em">05</text>
  <text x="680" y="130" text-anchor="middle" fill="hsl(var(--foreground))" font-size="15" font-weight="800">Recommend</text>
  <line x1="640" y1="146" x2="720" y2="146" stroke="hsl(var(--border-strong))" stroke-width="0.7"/>
  <text x="680" y="172" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11">State number</text>
  <text x="680" y="188" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11">with bounds</text>
  <text x="680" y="240" text-anchor="middle" fill="hsl(var(--primary))" font-size="10" font-weight="700" letter-spacing="0.07em">→ SEE PAGE 6</text>

  <path d="M 140 178 C 155.0 172, 155.0 184, 170 178" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.4" marker-end="url(#ar)"/>
  <path d="M 290 178 C 305.0 172, 305.0 184, 320 178" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.4" marker-end="url(#ar)"/>
  <path d="M 440 178 C 455.0 172, 455.0 184, 470 178" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.4" marker-end="url(#ar)"/>
  <path d="M 590 178 C 605.0 172, 605.0 184, 620 178" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.4" marker-end="url(#ar)"/>
  <rect x="24" y="318" width="722" height="58" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="38" y="337" fill="hsl(var(--primary))" font-size="10.5" font-weight="700" letter-spacing="0.07em">HOW TO USE THIS</text>
  <text x="38" y="354" fill="hsl(var(--foreground))" font-size="11">Move through the stops in order. Don't start solving without setting up; don't recommend without triangulating.</text>
  <text x="38" y="370" fill="hsl(var(--muted-foreground))" font-size="10.5" font-style="italic">Watch-out: a strong answer that skips Triangulate gets graded as a weak answer — the rubric is unforgiving here.</text>
</svg>`,
      caption: "The minimum spine. Pages 2–5 expand each stage; Page 6 walks one full solve end-to-end with annotations.",
      maxWidth: 760,
      ariaLabel: "Five-stage horizontal flow showing Clarify, Set Up, Estimate, Triangulate, Recommend, with Triangulate highlighted as the stage most candidates skip.",
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "The skip that ends most cases",
      md: "Triangulate is the cheapest move on the page — a second method, even a quick supply-side check, takes fifteen seconds — and the move most candidates skip. The chocolate failure at the top of this page would have been caught by *any* cross-check. Make Triangulate a non-negotiable, not a flourish.",
    },
    {
      type: "dialogue",
      title: "The same prompt, twice — first without the spine, then with it",
      turns: [
        {
          speaker: "interviewer",
          md: "Estimate the annual demand for premium dark chocolate in India, in rupees.",
        },
        {
          speaker: "candidate",
          note: "Layered filters with no equation written first; numbers shift mid-stream and the candidate rebuilds the calc twice.",
          md: "OK — India is 1.4 billion people, urban India is ~30%, so 42 cr urban. Middle class is, say, 40% of urban — 17 cr. Premium-affording is 20% of that — 3.4 cr. Half eat chocolate at all, so 1.7 cr. Maybe 30% prefer dark — 50 lakh. At 6 bars a year times ₹400… wait, let me redo… 50 lakh times ₹2,400… about ₹1,200 cr. Actually let me re-check the urban share… about ₹4,000 cr per year.",
        },
        {
          speaker: "interviewer",
          md: "India's entire chocolate market — Dairy Milk, Munch, KitKat, the lot — is roughly ₹15,000 cr. You're saying premium dark alone is a quarter of that?",
        },
        {
          speaker: "candidate",
          note: "No second method, no anchor, no recovery path. This is where the case is lost.",
          md: "…I'd have to revisit my assumptions.",
        },
        {
          speaker: "narrator",
          md: "Same prompt, with the spine.",
        },
        {
          speaker: "candidate",
          note: "Fifteen seconds to clarify the prompt, name the approach, and flag the cross-check upfront. Three scoring moves before a single number is touched.",
          md: "Before I solve, let me lock it: *premium* dark chocolate, *India*, *annual*, in *rupees*. I'll work top-down — estimate buyers, then average spend — and sanity-check from the supply side at the end.",
        },
        {
          speaker: "candidate",
          md: "Urban India: ~50 cr. Top-10% premium-discretionary households: 5 cr people. Of those, dark-chocolate consumers — maybe 1 in 5 — so 1 cr active buyers. At 4 bars a year × ₹250: **₹1,000 cr**. Supply side: Lindt, Amul Dark, Bournville premium SKUs, Hershey's, imports — about six serious players. If the leader does ₹200 cr in India, total is plausibly 4× — **₹800 cr**. Two methods within 25%. Central estimate **₹900 cr**.",
        },
        {
          speaker: "interviewer",
          md: "Sensitivity?",
        },
        {
          speaker: "candidate",
          md: "The active-buyer ratio swings it. 1 in 3 instead of 1 in 5: ₹1,700 cr. 1 in 10: ₹500 cr. Range **₹500–1,700 cr**, central **₹900 cr**.",
        },
        {
          speaker: "narrator",
          md: "Same prompt. Same candidate. The redo scored on Structure (equation first), Triangulation (two methods reconciled), and Bounds (sensitivity explicit). Pages 2–5 train each of those moves.",
        },
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "This page is the on-ramp. **Page 2** unpacks the four approaches (Top-Down × Bottom-Up × Supply × Demand) and how to pick between them. **Page 3** trains the Ideal Flow — clarify, set up, communicate — with the live scripts. **Page 4** is Pressure-Testing — triangulation, magnitude checks, common traps. **Page 5** is the India cheat sheet — the numbers worth memorising and how to deploy them live. **Page 6** is one full solve, annotated. Outside this section: **Pricing** teaches willingness-to-pay estimation, **TAM / SAM / SOM** is the formal nest for sizing, and **the 5 C's** is the upstream lens for *who* you're sizing for.",
    },
    {
      type: "keyTakeaways",
      title: "After this page, you will be able to",
      items: [
        "Spot what the grader is actually scoring — and recognise that 75% of the score lives outside arithmetic.",
        "Name a guesstimate's flavour out loud (Market Sizing / Revenue / Unconventional) so your default approach is set before you start.",
        "Move through the five-stage spine in order — Clarify → Set Up → Estimate → Triangulate → Recommend — without skipping a stop.",
        "Triangulate every solve with a second method, even a rough one — skipping it is the single biggest source of unforced point loss.",
        "Recognise when a prompt blends flavours and solve the layers separately instead of forcing one bucket.",
      ],
    },
  ],
};

export default painAndPromise;

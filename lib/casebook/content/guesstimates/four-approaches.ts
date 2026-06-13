import type { Page } from "@/lib/casebook/types";

/**
 * Guesstimates — Page 2 — The Four Approaches
 * Wholly invented scenarios (Indian-context numbers). Inspired by the *patterns*
 * of the IIM/Bain/Wharton casebooks (extrapolation vs driver-breakdown,
 * top-down/bottom-up segmentation) but no scenario, transcript, or diagram is
 * reproduced. Expands the "Set Up" stage of the 90-second spine introduced on
 * the Pain & Promise page: how to pick the path before you write the equation.
 */
export const fourApproaches: Page = {
  slug: "guesstimates/four-approaches",
  title: "The Four Approaches",
  titleEmphasize: "Four",
  subtitle: "Two axes, four paths — and the one move that separates a good answer from a defensible one.",
  kind: "framework",
  meta: {
    readingTimeMin: 10,
    tags: ["guesstimates", "approach", "top-down", "bottom-up", "supply", "demand"],
    caseType: "market sizing",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "the path you pick in the first fifteen seconds",
      md: "Two candidates get the same prompt — *how many air conditioners are sold in India each year?* The first starts listing every AC brand she can name. The second says: *I'll go top-down from households, then sanity-check from the supply side.* She hasn't computed anything yet, and she's already ahead — because **the path you pick in the first fifteen seconds** decides whether the next three minutes are a clean walk or a scramble. There are only four paths. Knowing all four — and which one fits the prompt — is the whole game of the Set-Up stage.",
    },

    { type: "heading", level: 2, text: "Two axes, not four random tricks", emphasize: "Two axes" },
    {
      type: "prose",
      md: "People talk about \"approaches\" as a grab-bag of tricks. They're not. Every guesstimate path is a choice on two independent axes. Pick a point on each axis and you've picked your approach — and, just as usefully, you've named the *other* approach you'll triangulate against later.",
    },
    {
      type: "table",
      headers: ["Axis", "One end", "Other end", "The question it answers"],
      rows: [
        ["**Direction**", "Top-Down", "Bottom-Up", "Do I start from a big universe and filter down, or from one unit and scale up?"],
        ["**Lens**", "Demand-side", "Supply-side", "Do I count the people who *want* the thing, or the people/assets that *provide* it?"],
      ],
      firstColHeader: true,
    },
    {
      type: "prose",
      md: "Direction is about *where you start*. Lens is about *what you count*. They combine into a 2×2 — four quadrants, four defensible paths to the same number. The casebooks call the top-down move \"driver breakdown\" and the bottom-up move \"extrapolation\"; the names matter less than knowing both directions exist and that a strong solve usually walks one and checks the other.",
    },
    {
      type: "svg",
      maxWidth: 720,
      ariaLabel: "A two-by-two matrix. The horizontal axis runs Top-Down on the left to Bottom-Up on the right. The vertical axis runs Demand-side at the top to Supply-side at the bottom. Four quadrants each carry an India-context worked illustration: top-left Top-Down Demand sizes AC sales from households; top-right Bottom-Up Demand sizes chai cups from one stall scaled up; bottom-left Top-Down Supply sizes petrol pumps from national fuel demand; bottom-right Bottom-Up Supply sizes ATM cash from one machine scaled to the network.",
      caption: "Direction (where you start) × Lens (what you count) = four paths. Pick the quadrant your anchors are strongest in; triangulate from the diagonal.",
      svg: `<svg viewBox="0 0 720 500" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif" role="img">
<defs>
  <linearGradient id="fa-ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  <filter id="fa-cs" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#0b1220" flood-opacity="0.14"/></filter>
  <marker id="fa-ar" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0.5,0.8 L9,5 L0.5,9.2" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>
</defs>
  <text x="24" y="26" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">THE GUESSTIMATE 2×2 — FOUR PATHS TO THE SAME NUMBER</text>

  <!-- axis labels -->
  <text x="370" y="58" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11" font-weight="700">DEMAND-SIDE — count who wants it</text>
  <text x="370" y="486" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11" font-weight="700">SUPPLY-SIDE — count who provides it</text>
  <text x="64" y="272" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11" font-weight="700" transform="rotate(-90 64 272)">TOP-DOWN — start big, filter down</text>
  <text x="678" y="272" text-anchor="middle" fill="hsl(var(--foreground))" font-size="11" font-weight="700" transform="rotate(90 678 272)">BOTTOM-UP — start small, scale up</text>

  <!-- quadrant cards -->
  <rect x="108" y="72" width="252" height="180" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" filter="url(#fa-cs)"/>
  <text x="124" y="94" fill="hsl(var(--primary))" font-size="9.5" font-weight="700" letter-spacing="0.06em">TOP-DOWN · DEMAND</text>
  <text x="124" y="114" fill="hsl(var(--foreground))" font-size="12" font-weight="700">ACs sold in India / year</text>
  <text x="124" y="135" fill="hsl(var(--muted-foreground))" font-size="9.5">India 1.4B → ~300M households</text>
  <text x="124" y="151" fill="hsl(var(--muted-foreground))" font-size="9.5">× ~12% own an AC → ~36M</text>
  <text x="124" y="167" fill="hsl(var(--muted-foreground))" font-size="9.5">× replacement + new ≈ 1 in 6 / yr</text>
  <text x="124" y="187" fill="hsl(var(--primary))" font-size="11" font-weight="700">≈ 6–7M units / year</text>
  <text x="124" y="214" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">Filter a known universe down through</text>
  <text x="124" y="227" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">ownership and turnover rates.</text>

  <rect x="380" y="72" width="252" height="180" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" filter="url(#fa-cs)"/>
  <text x="396" y="94" fill="hsl(var(--primary))" font-size="9.5" font-weight="700" letter-spacing="0.06em">BOTTOM-UP · DEMAND</text>
  <text x="396" y="114" fill="hsl(var(--foreground))" font-size="12" font-weight="700">Chai cups at a station / day</text>
  <text x="396" y="135" fill="hsl(var(--muted-foreground))" font-size="9.5">1 stall ≈ 200 cups/day</text>
  <text x="396" y="151" fill="hsl(var(--muted-foreground))" font-size="9.5">× ~25 stalls on the concourse</text>
  <text x="396" y="167" fill="hsl(var(--muted-foreground))" font-size="9.5">× footfall-peak uplift ≈ 1.2</text>
  <text x="396" y="187" fill="hsl(var(--primary))" font-size="11" font-weight="700">≈ 6,000 cups / day</text>
  <text x="396" y="214" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">Measure one unit you can picture,</text>
  <text x="396" y="227" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">then multiply by how many exist.</text>

  <rect x="108" y="290" width="252" height="180" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" filter="url(#fa-cs)"/>
  <text x="124" y="312" fill="hsl(var(--primary))" font-size="9.5" font-weight="700" letter-spacing="0.06em">TOP-DOWN · SUPPLY</text>
  <text x="124" y="332" fill="hsl(var(--foreground))" font-size="12" font-weight="700">Petrol pumps in India</text>
  <text x="124" y="353" fill="hsl(var(--muted-foreground))" font-size="9.5">National petrol demand ≈ 40B L/yr</text>
  <text x="124" y="369" fill="hsl(var(--muted-foreground))" font-size="9.5">÷ throughput per pump ≈ 150k L/mo</text>
  <text x="124" y="385" fill="hsl(var(--muted-foreground))" font-size="9.5">= 40B ÷ ~1.8M L/yr per outlet</text>
  <text x="124" y="405" fill="hsl(var(--primary))" font-size="11" font-weight="700">≈ 80,000 outlets</text>
  <text x="124" y="432" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">Start from total output, divide by</text>
  <text x="124" y="445" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">what one provider supplies.</text>

  <rect x="380" y="290" width="252" height="180" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4" filter="url(#fa-cs)"/>
  <text x="396" y="312" fill="hsl(var(--primary))" font-size="9.5" font-weight="700" letter-spacing="0.06em">BOTTOM-UP · SUPPLY</text>
  <text x="396" y="332" fill="hsl(var(--foreground))" font-size="12" font-weight="700">Cash dispensed by city ATMs</text>
  <text x="396" y="353" fill="hsl(var(--muted-foreground))" font-size="9.5">1 ATM ≈ ₹15L refilled / week</text>
  <text x="396" y="369" fill="hsl(var(--muted-foreground))" font-size="9.5">× ~9,000 ATMs in the metro</text>
  <text x="396" y="385" fill="hsl(var(--muted-foreground))" font-size="9.5">× 52 weeks</text>
  <text x="396" y="405" fill="hsl(var(--primary))" font-size="11" font-weight="700">≈ ₹70,000 cr / year</text>
  <text x="396" y="432" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">Size one asset's output, then scale</text>
  <text x="396" y="445" fill="hsl(var(--muted-foreground))" font-size="9" font-style="italic">to the count of assets.</text>

  <!-- diagonal triangulation hint -->
  <path d="M 340 220 L 400 300" fill="none" stroke="hsl(var(--primary))" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#fa-ar)" marker-start="url(#fa-ar)" opacity="0.65"/>
  <text x="370" y="266" text-anchor="middle" fill="hsl(var(--primary))" font-size="8.5" font-weight="700" opacity="0.85">triangulate</text>
</svg>`,
    },

    { type: "heading", level: 2, text: "When each path wins", emphasize: "wins" },
    {
      type: "prose",
      md: "You don't pick a quadrant by taste — you pick it by where your *anchors* are strongest. An anchor is a number you can defend without flinching: India's population, a household's monthly grocery bill, the seats in a multiplex. Start where your anchors are solid; the path that forces you to invent a number you have no feel for is the wrong path.",
    },
    {
      type: "comparison",
      headers: ["Top-Down (filter down)", "Bottom-Up (scale up)", "Supply-side (count providers)"],
      rows: [
        { cells: [
          "You have a clean universe",
          "You can picture one unit clearly",
          "Output is easier to anchor than users",
        ] },
        { cells: [
          "\"Smartphones in India\" — start from population, filter by age, income, ownership.",
          "\"Revenue of a Bandra café\" — size one café's day, then don't even need to scale.",
          "\"Petrol pumps\" — national fuel demand ÷ per-pump throughput beats counting drivers.",
        ] },
        { cells: [
          "Risk: too many filters compound error.",
          "Risk: your one unit isn't representative.",
          "Risk: forgetting utilisation (assets sit idle).",
        ] },
      ],
    },
    {
      type: "callout",
      variant: "insight",
      title: "The flavour usually names the path",
      md: "Recall the three flavours from Page 1. **Market Sizing** prompts lean Top-Down + Demand (filter a population). **Revenue / Throughput** prompts lean Bottom-Up (size one unit per period). **Supply-side** is the contrarian's edge: when everyone reaches for demand, counting the providers often gives a cleaner, faster anchor — and instant triangulation.",
    },

    { type: "heading", level: 2, text: "The move that separates the answers", emphasize: "separates" },
    {
      type: "prose",
      md: "Here is the single highest-leverage habit on this page: **solve in one quadrant, then re-derive from the diagonal.** Top-Down Demand checked by Bottom-Up Supply. If the two land within ~25% of each other, you state the number with confidence. If they're 5× apart, you've found your own error before the interviewer did — which scores higher than a single lucky-perfect number ever could.",
    },
    {
      type: "dialogue",
      title: "Same prompt, two quadrants — and the reconciliation",
      turns: [
        {
          speaker: "interviewer",
          md: "How many petrol pumps are there in India?",
        },
        {
          speaker: "candidate",
          note: "Names both the path and the cross-check upfront — a Set-Up scoring move before any number.",
          md: "I'll go Top-Down from the supply side — national petrol demand divided by what one pump moves — and then cross-check Bottom-Up from vehicles. Let me start.",
        },
        {
          speaker: "candidate",
          md: "Petrol demand is roughly 40 billion litres a year. A busy outlet does maybe 150,000 litres a month, so ~1.8 million a year. 40B ÷ 1.8M ≈ **~22,000** — but many rural outlets do a fraction of that, so blend down the average and it's closer to **~80,000 outlets**.",
        },
        {
          speaker: "candidate",
          note: "The diagonal check. Two independent builds, reconciled out loud.",
          md: "Bottom-up sanity check: ~300 million vehicles, of which maybe a third are petrol two-wheelers and cars filling, say, weekly. If one pump can serve ~1,500 vehicles as regulars, you land in the same ~70–90k band. Two methods agree — I'll call it **~80,000**, with the per-pump throughput as the swing assumption.",
        },
        {
          speaker: "narrator",
          md: "The number was never the point. The score came from naming two paths, walking one, and reconciling the other — the exact discipline the rest of this section drills.",
        },
      ],
    },
    {
      type: "callout",
      variant: "pitfall",
      title: "Don't average two methods you don't believe",
      md: "Triangulation reconciles, it doesn't blend blindly. If Top-Down says 80k and Bottom-Up says 400k, the answer is *not* 240k — it's \"one of my assumptions is wrong, let me find which.\" The gap is a diagnostic, not an arithmetic mean. Page 4 turns this into a repeatable pressure-test.",
    },

    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "This page expanded the **Set Up** stage of the spine. **Page 3 — The Ideal Flow** trains the stages on either side of it: how to *Clarify* the prompt so you pick the right quadrant, and how to *communicate* the solve while you walk it. **Page 4 — Pressure-Testing** makes the diagonal cross-check and the sanity check non-negotiable. The India cheat sheet (Page 5) gives you the anchors these approaches lean on. Every worked example in this section is tagged with the quadrant it uses — read three and you'll start seeing the path before the prompt finishes.",
    },
    {
      type: "keyTakeaways",
      title: "After this page, you will be able to",
      items: [
        "Place any guesstimate on two axes — Direction (Top-Down vs Bottom-Up) and Lens (Demand vs Supply) — and name its quadrant out loud.",
        "Pick the path by where your anchors are strongest, not by habit, and recognise when too many filters will compound your error.",
        "Reach for the supply side when everyone else reaches for demand — often the faster anchor and an instant cross-check.",
        "Solve in one quadrant and re-derive from the diagonal, treating a large gap as a diagnostic rather than something to average away.",
        "Map each of the three flavours to its default path so your Set-Up is decided in the first fifteen seconds.",
      ],
    },
  ],
};

export default fourApproaches;

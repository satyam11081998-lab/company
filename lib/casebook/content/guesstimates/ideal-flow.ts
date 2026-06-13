import type { Page } from "@/lib/casebook/types";

/**
 * Guesstimates — Page 3 — The Ideal Flow
 * Wholly invented scripts/scenarios (Indian-context). Inspired by the *patterns*
 * of the IIM/Bain casebooks (communicate-your-approach-first, sanity-check tips,
 * round-and-manage-zeroes) but no transcript or diagram is reproduced. Trains the
 * Clarify / Set Up / Communicate stages of the 90-second spine with live scripts.
 */
export const idealFlow: Page = {
  slug: "guesstimates/ideal-flow",
  title: "The Ideal Flow",
  titleEmphasize: "Flow",
  subtitle: "What a clean solve sounds like — the words, the order, and the silences to avoid.",
  kind: "framework",
  meta: {
    readingTimeMin: 11,
    tags: ["guesstimates", "process", "clarify", "communication", "scripts"],
    caseType: "market sizing",
  },
  blocks: [
    {
      type: "hook",
      emphasize: "the interviewer is grading the narration, not the spreadsheet",
      md: "Two candidates land on the same number — ₹900 cr. One mumbled through ninety seconds of arithmetic, looked up, and said \"about nine hundred crore.\" The other narrated every fork in the road: *here's what I'm locking, here's the equation, here's why I'm splitting it this way, here's my cross-check.* Same number. Different scores — by a mile. Because in a guesstimate, **the interviewer is grading the narration, not the spreadsheet.** This page is the talk track: what to say, in what order, and where candidates go silent and lose the room.",
    },

    { type: "heading", level: 2, text: "The flow, stage by stage", emphasize: "stage by stage" },
    {
      type: "prose",
      md: "Page 1 gave you the five-stage spine — Clarify → Set Up → Estimate → Triangulate → Recommend. This page lives inside the first three and the communication that wraps all of them. Each stage has a job, a script, and a failure mode. Internalise the scripts until they're reflex; under pressure you fall back on rhythm, not improvisation.",
    },
    {
      type: "svg",
      maxWidth: 720,
      ariaLabel: "A horizontal talk-track rail across four stages. Stage one Clarify: lock four things in fifteen seconds. Stage two Set Up: write the equation and name the approach. Stage three Estimate: justify each number, round, manage zeroes. Stage four Communicate which runs underneath all stages: signpost, narrate, tie back. Each stage shows the line a candidate should say out loud.",
      caption: "The talk track. The top rail is what you DO; the quoted lines are what you SAY. Communication isn't a stage — it runs under all of them.",
      svg: `<svg viewBox="0 0 720 432" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif" role="img">
<defs>
  <linearGradient id="if-ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  <filter id="if-cs" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#0b1220" flood-opacity="0.14"/></filter>
  <marker id="if-ar" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0.5,0.8 L9,5 L0.5,9.2" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>
</defs>
  <text x="24" y="26" fill="hsl(var(--primary))" font-size="11" font-weight="700" letter-spacing="0.06em">THE TALK TRACK — WHAT YOU DO, AND WHAT YOU SAY</text>

  <!-- three DO cards -->
  <rect x="24" y="48" width="210" height="150" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" filter="url(#if-cs)"/>
  <text x="40" y="70" fill="hsl(var(--muted-foreground))" font-size="10" font-weight="700" letter-spacing="0.1em">01</text>
  <text x="40" y="90" fill="hsl(var(--foreground))" font-size="14" font-weight="800">Clarify</text>
  <text x="40" y="110" fill="hsl(var(--muted-foreground))" font-size="9.5">Lock 4 things, 15 seconds:</text>
  <text x="40" y="127" fill="hsl(var(--foreground))" font-size="9.5">• Objective — what exactly?</text>
  <text x="40" y="143" fill="hsl(var(--foreground))" font-size="9.5">• Universe — India? a metro?</text>
  <text x="40" y="159" fill="hsl(var(--foreground))" font-size="9.5">• Units — rupees? units? /day?</text>
  <text x="40" y="175" fill="hsl(var(--foreground))" font-size="9.5">• Timeframe — now? annual?</text>

  <rect x="255" y="48" width="210" height="150" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" filter="url(#if-cs)"/>
  <text x="271" y="70" fill="hsl(var(--muted-foreground))" font-size="10" font-weight="700" letter-spacing="0.1em">02</text>
  <text x="271" y="90" fill="hsl(var(--foreground))" font-size="14" font-weight="800">Set Up</text>
  <text x="271" y="110" fill="hsl(var(--muted-foreground))" font-size="9.5">Before any number:</text>
  <text x="271" y="127" fill="hsl(var(--foreground))" font-size="9.5">• Name the approach</text>
  <text x="271" y="143" fill="hsl(var(--foreground))" font-size="9.5">• Write the equation first</text>
  <text x="271" y="159" fill="hsl(var(--foreground))" font-size="9.5">• Pick MECE splits</text>
  <text x="271" y="175" fill="hsl(var(--muted-foreground))" font-size="9">→ see Page 2 for the four paths</text>

  <rect x="486" y="48" width="210" height="150" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1" filter="url(#if-cs)"/>
  <text x="502" y="70" fill="hsl(var(--muted-foreground))" font-size="10" font-weight="700" letter-spacing="0.1em">03</text>
  <text x="502" y="90" fill="hsl(var(--foreground))" font-size="14" font-weight="800">Estimate</text>
  <text x="502" y="110" fill="hsl(var(--muted-foreground))" font-size="9.5">Walk the equation:</text>
  <text x="502" y="127" fill="hsl(var(--foreground))" font-size="9.5">• Justify each number aloud</text>
  <text x="502" y="143" fill="hsl(var(--foreground))" font-size="9.5">• Round to ease the math</text>
  <text x="502" y="159" fill="hsl(var(--foreground))" font-size="9.5">• Manage your zeroes</text>
  <text x="502" y="175" fill="hsl(var(--foreground))" font-size="9.5">• Flag the swing assumption</text>

  <path d="M 234 123 L 255 123" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.4" marker-end="url(#if-ar)"/>
  <path d="M 465 123 L 486 123" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="1.4" marker-end="url(#if-ar)"/>

  <!-- communicate rail underneath -->
  <rect x="24" y="222" width="672" height="58" rx="10" fill="url(#if-ng)" filter="url(#if-cs)"/>
  <text x="40" y="246" fill="#ffffff" font-size="12" font-weight="800">Communicate</text>
  <text x="40" y="266" fill="#b9c4d6" font-size="9.5">Runs under every stage: signpost where you are · narrate the why, not just the what · tie the number back to the question.</text>

  <!-- SAY lines -->
  <rect x="24" y="300" width="210" height="108" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.2"/>
  <text x="38" y="320" fill="hsl(var(--primary))" font-size="8.5" font-weight="700" letter-spacing="0.06em">SAY</text>
  <text x="38" y="338" fill="hsl(var(--foreground))" font-size="9" font-style="italic">"Before I solve, let me lock</text>
  <text x="38" y="352" fill="hsl(var(--foreground))" font-size="9" font-style="italic">it: premium ACs, India,</text>
  <text x="38" y="366" fill="hsl(var(--foreground))" font-size="9" font-style="italic">annual, in units. I'll assume</text>
  <text x="38" y="380" fill="hsl(var(--foreground))" font-size="9" font-style="italic">window + split unless you'd</text>
  <text x="38" y="394" fill="hsl(var(--foreground))" font-size="9" font-style="italic">rather narrow it."</text>

  <rect x="255" y="300" width="210" height="108" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.2"/>
  <text x="269" y="320" fill="hsl(var(--primary))" font-size="8.5" font-weight="700" letter-spacing="0.06em">SAY</text>
  <text x="269" y="338" fill="hsl(var(--foreground))" font-size="9" font-style="italic">"I'll go top-down: households</text>
  <text x="269" y="352" fill="hsl(var(--foreground))" font-size="9" font-style="italic">× ownership × annual</text>
  <text x="269" y="366" fill="hsl(var(--foreground))" font-size="9" font-style="italic">turnover. Equals new units a</text>
  <text x="269" y="380" fill="hsl(var(--foreground))" font-size="9" font-style="italic">year. Let me fill each term."</text>

  <rect x="486" y="300" width="210" height="108" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.2"/>
  <text x="500" y="320" fill="hsl(var(--primary))" font-size="8.5" font-weight="700" letter-spacing="0.06em">SAY</text>
  <text x="500" y="338" fill="hsl(var(--foreground))" font-size="9" font-style="italic">"300M households, ~12% own</text>
  <text x="500" y="352" fill="hsl(var(--foreground))" font-size="9" font-style="italic">an AC — that's the number I'm</text>
  <text x="500" y="366" fill="hsl(var(--foreground))" font-size="9" font-style="italic">least sure of, so flag it —</text>
  <text x="500" y="380" fill="hsl(var(--foreground))" font-size="9" font-style="italic">replace 1 in 8, add new...</text>
  <text x="500" y="394" fill="hsl(var(--foreground))" font-size="9" font-style="italic">≈ 6–7M units."</text>
</svg>`,
    },

    { type: "heading", level: 2, text: "Clarify: lock four things, then stop", emphasize: "then stop" },
    {
      type: "prose",
      md: "The clarify stage is worth 10% of the score and takes fifteen seconds — but it's where nervous candidates self-sabotage in two opposite ways. Some skip it and solve the wrong prompt. Others hide in it, asking eight questions to delay the moment they have to commit to a number. The discipline is to lock exactly four things and then declare your own assumptions for the rest.",
    },
    {
      type: "steps",
      ordered: true,
      items: [
        { title: "Objective", md: "*What* are we counting? \"Premium\" dark chocolate, not all chocolate. New units sold, not the installed base. Pin the exact noun." },
        { title: "Universe", md: "*Where* — all of India, one metro, urban only? The universe is the single biggest source of 10× errors." },
        { title: "Units", md: "Rupees or volume? Per day, per year? Litres or bottles? State the unit you'll answer in before you compute it." },
        { title: "Timeframe", md: "A snapshot \"right now,\" an annual flow, or a five-year horizon? Flow vs stock is a classic trap." },
      ],
    },
    {
      type: "callout",
      variant: "tip",
      title: "Ask one, assume the rest",
      md: "You're allowed *one* genuine clarifying question — usually the universe or the objective, whichever is most ambiguous. For everything else, **declare your assumption instead of asking**: \"I'll assume urban India and a one-year window — stop me if you'd prefer otherwise.\" This shows judgement (a scored dimension) and keeps you in control of the clock. Interviewers reward a candidate who assumes-and-flags over one who interrogates.",
    },

    { type: "heading", level: 2, text: "Set Up: the equation comes before the arithmetic", emphasize: "before" },
    {
      type: "prose",
      md: "This is the highest-scoring fifteen seconds in the whole solve. *Write the equation first* — say it out loud, even sketch it: `units/year = households × ownership % × annual turnover`. Naming the structure before you touch a number does three things: it lets the interviewer redirect you cheaply if you're off-track, it stops you rebuilding the calculation mid-stream, and it is the literal definition of the 30%-weighted Structure dimension. The casebook rule is blunt — *communicate your approach before you dig into the details.*",
    },
    {
      type: "callout",
      variant: "warning",
      title: "The silent-calculation death spiral",
      md: "The most common failure isn't a wrong number — it's twenty seconds of silence while the candidate does mental math, then a bare answer. The interviewer can't follow, can't help, and can't award structure or assumption points for work they never saw. **If you're computing, you're talking.** Silence is the enemy.",
    },

    { type: "heading", level: 2, text: "Estimate & communicate: narrate every fork", emphasize: "narrate" },
    {
      type: "prose",
      md: "As you fill each term, do three things at once: justify the number (\"~12% own an AC because penetration is low outside the top income deciles\"), round aggressively so the arithmetic stays clean, and manage your zeroes deliberately — work in crores and lakhs, not strings of zeros, and say the magnitude aloud. When you flag the assumption you're least sure of *before* the interviewer asks, you convert a vulnerability into a scoring move.",
    },
    {
      type: "dialogue",
      title: "The full front-half, clean",
      turns: [
        { speaker: "interviewer", md: "Estimate how many air conditioners are sold in India in a year." },
        {
          speaker: "candidate",
          note: "Clarify — locks objective + universe + units + timeframe, asks one, assumes the rest. ~15 seconds.",
          md: "Quick lock: I'll count *new units sold across all of India in one year*, room ACs not industrial chillers. One question — should I include the replacement market, or only first-time buyers? I'll assume both unless you say otherwise.",
        },
        { speaker: "interviewer", md: "Include both." },
        {
          speaker: "candidate",
          note: "Set Up — names the approach and writes the equation before any number. This is the 30% Structure score.",
          md: "Then I'll go top-down on the demand side. Equation: *units per year = households × AC-ownership % × (new + replacement rate)*. Let me fill each term and I'll flag the one I trust least.",
        },
        {
          speaker: "candidate",
          note: "Estimate — justifies, rounds, manages zeroes, flags the swing assumption. Communication runs throughout.",
          md: "~1.4 billion people at ~4.5 per household ≈ 300 million households. AC ownership is low — I'll say ~12%, that's the number I'm least sure of, call it 36 million AC-owning households. They replace maybe 1 in 8 a year, plus new buyers add roughly the same again — so turnover near 1 in 6. 36M ÷ 6 ≈ **6 million units a year**, and I'd sanity-check that against industry numbers next.",
        },
        {
          speaker: "narrator",
          md: "Notice what scored: the prompt was locked, the equation was spoken before the arithmetic, every number was justified, and the weakest assumption was named first. The triangulation and recommendation that follow are Page 4's job.",
        },
      ],
    },
    {
      type: "callout",
      variant: "note",
      title: "Where this connects",
      md: "This page trained the front half of the spine. **Page 2 — The Four Approaches** is the menu you choose from in Set Up. **Page 4 — Pressure-Testing** picks up where this dialogue stops: the triangulation, the order-of-magnitude check, and the bounded recommendation that close the solve. **Communication under pressure** in Section A goes deeper on signposting and structure across all case types, not just guesstimates.",
    },
    {
      type: "keyTakeaways",
      title: "After this page, you will be able to",
      items: [
        "Lock the four clarifiers — Objective, Universe, Units, Timeframe — in about fifteen seconds, then commit.",
        "Ask exactly one real question and declare assumptions for the rest, signalling judgement instead of stalling.",
        "Write and speak the equation before touching a single number, capturing the 30%-weighted Structure score.",
        "Kill the silent-calculation habit — narrate every fork so the interviewer can follow, redirect, and award points.",
        "Justify each number, round to keep the math clean, manage your zeroes in lakhs and crores, and flag the swing assumption before you're asked.",
      ],
    },
  ],
};

export default idealFlow;

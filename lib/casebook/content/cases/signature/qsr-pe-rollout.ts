import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const qsrPeRollout: Page = {
  slug: 'cases/signature/qsr-pe-rollout',
  title: 'The PE Clock and the Biryani Chain',
  subtitle: 'Growth strategy under an owner whose fund expires in four years.',
  kind: 'case',
  meta: { difficulty: 'challenging', caseType: 'Signature · Growth × PE', readingTimeMin: 11, tags: ['qsr', 'private-equity', 'blended'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'A PE fund bought 70% of a 45-outlet biryani QSR chain (₹190 crore revenue, ₹23 crore EBITDA, South-India only) eighteen months ago, underwriting a 150-outlet national chain at exit. Progress: 12 new outlets, of which 7 are below plan — the new-city outlets especially. The fund exits in ~4 years. You\'re hired to fix the rollout. The twist: the operating partner wants to *accelerate* openings to hit 150; the founder-CEO wants to *pause* and fix the model.' },
    ]},
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Before taking sides: *where* are the 7 underperformers — new cities, or new outlets in home territory? And what does "below plan" mean — slow ramp (trending to plan late) or structurally weak (plateaued below breakeven)?', note: 'The pause-vs-accelerate fight is unresolvable until underperformance is decomposed into ramp-delay vs model-failure.' },
        { speaker: 'interviewer', md: 'All 7 are in two new cities — Hyderabad outlets are ramping slowly but trending up; the 3 Mumbai outlets have plateaued at 60% of plan after 12 months. Home-state additions are all at or above plan.' },
        { speaker: 'candidate', md: 'That\'s three different stories: the home model replicates fine; Hyderabad is a patience problem; Mumbai is a product-market problem. So neither executive is right — accelerating into Mumbai-like cities ships a broken model; pausing everywhere wastes the home model\'s proven runway. The structure: diagnose Mumbai, segment the national map by "distance" from the proven model, and rebuild the rollout sequence against the exit clock.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Separated slow-ramp from structurally-weak outlets by location, so neither ‘accelerate everywhere’ nor ‘pause everywhere’ wins outright.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier rollout tree: Mumbai diagnosis, model-distance rings and the exit clock, an exit-math tier comparing sprint-to-150 at 55 crore EBITDA and 11.5 times equal to 630 crore against quality-130 at 58 crore and 14.5 times equal to 840 crore, and a 210 crore delta verdict bar', caption: 'Diagnose, re-segment, re-sequence — and the exit-math tier prices the executive fight: the "missing" 20 outlets are worth −₹210 cr.', svg: `<svg viewBox="0 0 720 430" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="qpng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#qpng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">150 OUTLETS, 4 YEARS, ONE BROKEN CITY</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">diagnose → re-segment → re-sequence against the exit clock</text>
  <path d="M360 60 L360 70 M125 70 L595 70 M125 70 L125 82 M360 70 L360 82 M595 70 L595 82" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="30" y="84" width="190" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="125" y="103" font-size="9" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">1 · WHY IS MUMBAI FAILING?</text>
    <text x="125" y="120" font-size="8.5" fill="hsl(var(--muted-foreground))">₹280 ticket, 25% above local ·</text>
    <text x="125" y="134" font-size="8.5" fill="hsl(var(--muted-foreground))">delivery 70% vs 45% in South ·</text>
    <text x="125" y="148" font-size="8.5" fill="hsl(var(--muted-foreground))">brand unknown vs two strong rivals</text>
    <text x="125" y="172" font-size="10" font-weight="700" fill="hsl(var(--primary))">wrong format, not bad city</text>
    <text x="125" y="188" font-size="8" fill="hsl(var(--muted-foreground))">convert to delivery kitchens or exit</text>
    <rect x="265" y="84" width="190" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="103" font-size="9" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">2 · MODEL-DISTANCE MAP</text>
    <text x="360" y="120" font-size="8.5" fill="hsl(var(--muted-foreground))">RING 1: rest of South, ~60 sites —</text>
    <text x="360" y="134" font-size="8.5" fill="hsl(var(--muted-foreground))">proven · RING 2: biryani-strong</text>
    <text x="360" y="148" font-size="8.5" fill="hsl(var(--muted-foreground))">metros · RING 3: the Mumbais</text>
    <text x="360" y="172" font-size="10" font-weight="700" fill="hsl(var(--primary))">grow in rings, not leaps</text>
    <text x="360" y="188" font-size="8" fill="hsl(var(--muted-foreground))">home additions all at or above plan</text>
    <rect x="500" y="84" width="190" height="120" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="595" y="103" font-size="9" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">3 · THE EXIT CLOCK</text>
    <text x="595" y="120" font-size="8.5" fill="hsl(var(--muted-foreground))">buyers pay: outlet count ×</text>
    <text x="595" y="134" font-size="8.5" fill="hsl(var(--muted-foreground))">unit economics × proven replicability;</text>
    <text x="595" y="148" font-size="8.5" fill="hsl(var(--muted-foreground))">graveyards get discounted</text>
    <text x="595" y="172" font-size="10" font-weight="700" fill="hsl(var(--primary))">quality of growth IS the multiple</text>
    <text x="595" y="188" font-size="8" fill="hsl(var(--muted-foreground))">130 healthy &gt; 150 with failures</text>
  </g>
  <path d="M125 204 L125 222 M360 204 L360 222 M595 204 L595 222 M125 222 L595 222 M215 222 L215 236 M505 222 L505 236" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="238" width="240" height="64" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="215" y="256" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">SPRINT TO 150</text>
    <text x="215" y="272" font-size="8.5" fill="hsl(var(--muted-foreground))">~₹55 cr EBITDA, messy cohort data → 11.5×</text>
    <text x="215" y="292" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">≈ ₹630 cr EV</text>
    <rect x="385" y="238" width="240" height="64" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="256" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">QUALITY 130</text>
    <text x="505" y="272" font-size="8.5" fill="hsl(var(--muted-foreground))">~₹58 cr EBITDA, clean replication proof → 14.5×</text>
    <text x="505" y="292" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹840 cr EV</text>
  </g>
  <path d="M215 302 L215 318 M505 302 L505 318 M215 318 L505 318 M360 318 L360 332" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="334" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="353" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">Δ ≈ ₹210 CR — ACCELERATE RING 1 · PILOT RING 2 · FREEZE RING 3</text>
  <text x="360" y="370" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">the "missing" 20 outlets are worth −₹210 cr — show LPs the multiple math, not the count</text>
  <text x="360" y="408" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">A PE timeline doesn't change what's true about the business; it changes which truths you can afford to test.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Mumbai diagnosis comes back: brand unknown, two strong local biryani brands, and the chain\'s ₹280 average ticket sits 25% above local benchmarks. Delivery is 70% of Mumbai orders vs 45% in the South — and the chain\'s dine-in-optimized outlets are oversized for that mix.' },
        { speaker: 'candidate', md: 'So Mumbai isn\'t a bad city; it\'s the wrong *format and price architecture*. Three structural mismatches: paying dine-in rents for delivery demand, a price point with no brand to justify it, and head-on competition where we have no equity. The honest call: exit or convert the three outlets to small delivery-kitchen formats, and put Ring-3 cities on hold until the brand travels — which it might, via q-commerce and franchise-lite formats, later. Meanwhile the 150-outlet underwrite: 60 Ring-1 sites + converting the South\'s density advantage means we can hit ~125–135 outlets at proven economics by exit. The deck shouldn\'t promise 150 mediocre; it should promise ~130 excellent plus a *demonstrated* Ring-2 playbook — that\'s what an acquirer or IPO investor actually prices.', note: 'Converts the diagnosis into format strategy, then renegotiates the underwrite itself — the founder-vs-partner fight was about the wrong number.' },
        { speaker: 'interviewer', md: 'The operating partner pushes back: "LPs were told 150."' },
        { speaker: 'candidate', md: 'Then show the LP math both ways: 150 outlets with 25 underperformers exits at maybe 11–12× on ₹55 crore EBITDA with buyer discounts for the graveyard; 130 healthy at 14–15× on ₹58 crore — the second number is simply bigger. Count, multiple, and credibility move together; the multiple is the lever LPs actually feel.' },
      ]},
      { type: 'reveal', summary: 'Reveal the exit math comparison', blocks: [
        { type: 'mathBox', title: 'Two exit stories', md: 'Sprint-to-150: ~₹55 cr EBITDA, messy cohort data → 11.5× ≈ **₹630 cr EV**\nQuality-130: ~₹58 cr EBITDA, clean replication proof → 14.5× ≈ **₹840 cr EV**\nΔ ≈ ₹210 cr — the "missing" 20 outlets are worth −₹210 cr.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend', items: [
        'Accelerate Ring 1 (rest-of-South): 50–60 outlets on the proven model — this is where the founder\'s pause instinct is wrong.',
        'Convert Mumbai to 2 delivery-kitchen formats with a localized price ladder; treat it as the Ring-3 R&D lab, not a growth market.',
        'Pilot Ring 2 (biryani-affinity metros) with 4–6 outlets and explicit gate criteria before any city gets a second wave.',
        'Reset the exit narrative with the fund: ~130 healthy outlets + replication playbook > 150 with failures; show LPs the multiple math.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'Under a PE clock, growth quality *is* the valuation: buyers price replicability, not raw count. When leadership splits between "faster" and "pause," decompose the underperformance first — the right answer is almost always **faster where proven, frozen where not**.' },
    ]},
  ],
};

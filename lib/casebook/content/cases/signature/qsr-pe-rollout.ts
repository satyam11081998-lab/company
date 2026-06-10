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
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Before taking sides: *where* are the 7 underperformers — new cities, or new outlets in home territory? And what does "below plan" mean — slow ramp (trending to plan late) or structurally weak (plateaued below breakeven)?', note: 'The pause-vs-accelerate fight is unresolvable until underperformance is decomposed into ramp-delay vs model-failure.' },
        { speaker: 'interviewer', md: 'All 7 are in two new cities — Hyderabad outlets are ramping slowly but trending up; the 3 Mumbai outlets have plateaued at 60% of plan after 12 months. Home-state additions are all at or above plan.' },
        { speaker: 'candidate', md: 'That\'s three different stories: the home model replicates fine; Hyderabad is a patience problem; Mumbai is a product-market problem. So neither executive is right — accelerating into Mumbai-like cities ships a broken model; pausing everywhere wastes the home model\'s proven runway. The structure: diagnose Mumbai, segment the national map by "distance" from the proven model, and rebuild the rollout sequence against the exit clock.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Rollout strategy structured by market distance from the proven model and the private equity exit timeline, with a diagnosis box for the failing city', caption: 'Sequence markets by model-distance, then fit the sequence to the fund\'s clock — the two constraints solve the executive fight.', svg: `<svg viewBox="0 0 720 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="qpcs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="qpng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="230" y="12" width="260" height="42" rx="11" fill="url(#qpng)" filter="url(#qpcs)"/>
  <text x="360" y="30" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">150 OUTLETS, 4 YEARS, ONE BROKEN CITY</text>
  <text x="360" y="46" text-anchor="middle" font-size="9" fill="#b9c4d6">diagnose → re-segment → re-sequence</text>
  <g text-anchor="middle">
    <rect x="40" y="80" width="200" height="116" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#qpcs)"/>
    <text x="140" y="101" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">1 · WHY IS MUMBAI FAILING?</text>
    <text x="140" y="120" font-size="9" fill="hsl(var(--muted-foreground))">taste localization? price point vs</text>
    <text x="140" y="134" font-size="9" fill="hsl(var(--muted-foreground))">local meal benchmarks? brand</text>
    <text x="140" y="148" font-size="9" fill="hsl(var(--muted-foreground))">unknown vs strong local rivals?</text>
    <text x="140" y="162" font-size="9" fill="hsl(var(--muted-foreground))">site selection? delivery-mix shock?</text>
    <text x="140" y="182" font-size="9" font-weight="700" fill="hsl(var(--foreground))">fix or formally exit the city</text>
    <rect x="260" y="80" width="200" height="116" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#qpcs)"/>
    <text x="360" y="101" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">2 · MODEL-DISTANCE MAP</text>
    <text x="360" y="120" font-size="9" fill="hsl(var(--muted-foreground))">RING 1: rest of South — proven</text>
    <text x="360" y="134" font-size="9" fill="hsl(var(--muted-foreground))">taste/brand adjacency, ~60 sites</text>
    <text x="360" y="148" font-size="9" fill="hsl(var(--muted-foreground))">RING 2: biryani-strong North/East</text>
    <text x="360" y="162" font-size="9" fill="hsl(var(--muted-foreground))">metros · RING 3: the Mumbais</text>
    <text x="360" y="182" font-size="9" font-weight="700" fill="hsl(var(--foreground))">grow in rings, not in leaps</text>
    <rect x="480" y="80" width="200" height="116" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#qpcs)"/>
    <text x="580" y="101" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">3 · THE EXIT CLOCK</text>
    <text x="580" y="120" font-size="9" fill="hsl(var(--muted-foreground))">buyers pay for: outlet count ×</text>
    <text x="580" y="134" font-size="9" fill="hsl(var(--muted-foreground))">unit economics × *proven* replicability</text>
    <text x="580" y="148" font-size="9" fill="hsl(var(--muted-foreground))">120 healthy outlets &gt; 150 with a</text>
    <text x="580" y="162" font-size="9" fill="hsl(var(--muted-foreground))">visible graveyard of failures</text>
    <text x="580" y="182" font-size="9" font-weight="700" fill="hsl(var(--foreground))">quality of growth IS the multiple</text>
  </g>
  <rect x="120" y="230" width="480" height="48" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="360" y="250" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.03em" fill="hsl(var(--primary))">RESOLUTION: ACCELERATE RING 1, PILOT RING 2, FREEZE RING 3</text>
  <text x="360" y="267" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">both executives get half their wish — and the exit gets a story buyers believe</text>
  <text x="360" y="320" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">A PE timeline doesn't change what's true about the business; it changes which truths you can afford to test.</text>
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

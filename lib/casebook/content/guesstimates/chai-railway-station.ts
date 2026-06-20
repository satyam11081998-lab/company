import type { Page } from '@/lib/casebook/types';

export const chaiRailwayStation: Page = {
  slug: 'guesstimates/chai-railway-station',
  title: 'Cups of chai sold daily at a major railway station',
  subtitle: 'Footfall × conversion — with dwell time as the hidden multiplier.',
  kind: 'guesstimate',
  meta: { difficulty: 'easy', readingTimeMin: 4, tags: ['footfall', 'conversion'] },
  blocks: [
    { type: 'prose', md: 'Estimate daily chai sales (cups) at a major junction station (~3.5 lakh daily passengers). Footfall builds need two refinements beginners skip: **who** is in the footfall (long-distance vs suburban), and **how long they wait** — dwell time drives consumption.' },
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', title: 'Clarifying questions before building the tree', turns: [
        { speaker: 'candidate', md: 'Before footfall math: we count cups *sold* by all vendors on station premises — stalls, hawkers, vending — at one major junction (~3.5 lakh passengers/day), excluding on-train pantry?', note: 'Bounding ‘on premises’ avoids importing the whole train journey’s tea.' },
        { speaker: 'interviewer', md: 'Yes — premises only, all vendors, paid cups.' },
        { speaker: 'candidate', md: 'And should I treat the footfall as mixed — long-distance vs suburban vs staff — rather than one average passenger?' },
        { speaker: 'interviewer', md: 'Treat it as mixed.' },
        { speaker: 'candidate', md: 'Then I’ll split footfall by passenger type and weight by *dwell time* — a waiting long-distance traveller buys more than someone changing trains in five minutes.', note: 'Dwell time is the hidden multiplier beginners skip.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Premises-only scope, the paid-cup unit, and a dwell-weighted footfall split instead of a flat conversion rate.' },
    ]},
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree segmenting station footfall into long-distance, suburban and non-passenger populations, each with dwell time driving conversion and cups per buyer, summed and cross-checked per stall', caption: 'Footfall → three populations → dwell-driven conversion × cups each → sum → per-stall physical check.', svg: `<svg viewBox="0 0 720 520" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="csng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#csng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">CHAI AT A MAJOR JUNCTION</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">3.5L passengers + 80k others · dwell time decides</text>
  <path d="M360 60 L360 76 M125 76 L595 76 M125 76 L125 92 M360 76 L360 92 M595 76 L595 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="30" y="94" width="190" height="118" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="125" y="114" font-size="10" font-weight="700" fill="hsl(var(--primary))">LONG-DISTANCE</text>
    <text x="125" y="131" font-size="8.5" fill="hsl(var(--muted-foreground))">~40% = 1.4L passengers</text>
    <text x="125" y="147" font-size="8.5" fill="hsl(var(--muted-foreground))">dwell 45–70 min · platform</text>
    <text x="125" y="161" font-size="8.5" fill="hsl(var(--muted-foreground))">tea ritual + family groups</text>
    <text x="125" y="178" font-size="9" font-weight="600" fill="hsl(var(--foreground))">45% buy × 1.3 cups</text>
    <text x="125" y="198" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ 80k cups</text>
    <rect x="265" y="94" width="190" height="118" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="114" font-size="10" font-weight="700" fill="hsl(var(--foreground))">SUBURBAN</text>
    <text x="360" y="131" font-size="8.5" fill="hsl(var(--muted-foreground))">~60% = 2.1L passengers</text>
    <text x="360" y="147" font-size="8.5" fill="hsl(var(--muted-foreground))">dwell 3–5 min · sprinting</text>
    <text x="360" y="161" font-size="8.5" fill="hsl(var(--muted-foreground))">for the 8:42 local</text>
    <text x="360" y="178" font-size="9" font-weight="600" fill="hsl(var(--foreground))">7% buy × 1 cup</text>
    <text x="360" y="198" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">≈ 15k cups</text>
    <rect x="500" y="94" width="190" height="118" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="595" y="114" font-size="10" font-weight="700" fill="hsl(var(--foreground))">NON-PASSENGERS</text>
    <text x="595" y="131" font-size="8.5" fill="hsl(var(--muted-foreground))">~80k: accompaniers, porters,</text>
    <text x="595" y="147" font-size="8.5" fill="hsl(var(--muted-foreground))">vendors, staff — long hours</text>
    <text x="595" y="161" font-size="8.5" fill="hsl(var(--muted-foreground))">on site, repeat buyers</text>
    <text x="595" y="178" font-size="9" font-weight="600" fill="hsl(var(--foreground))">~10% buy/day net</text>
    <text x="595" y="198" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">≈ 8k cups</text>
  </g>
  <path d="M125 212 L125 234 M360 212 L360 234 M595 212 L595 234 M125 234 L595 234 M360 234 L360 250" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="252" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="271" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 1 LAKH CUPS / DAY</text>
  <text x="360" y="288" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">≈ ₹15 lakh/day at ₹15/cup</text>
  <path d="M360 296 L360 312 M185 312 L535 312 M185 312 L185 328 M535 312 L535 328" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="65" y="330" width="240" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="185" y="350" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">CHECK 1 · PER STALL</text>
    <text x="185" y="367" font-size="8.5" fill="hsl(var(--muted-foreground))">100k ÷ ~70 stalls ≈ 1,400 cups/stall</text>
    <text x="185" y="382" font-size="8.5" fill="hsl(var(--muted-foreground))">= 1 cup/40 sec over 16 hrs, 2–3 servers ✓</text>
    <rect x="415" y="330" width="240" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="535" y="350" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">CHECK 2 · SUPPLY INPUTS</text>
    <text x="535" y="367" font-size="8.5" fill="hsl(var(--muted-foreground))">100k cups ≈ 5,000 L milk/day —</text>
    <text x="535" y="382" font-size="8.5" fill="hsl(var(--muted-foreground))">~25 dairy crates/stall: physically sane ✓</text>
  </g>
  <text x="360" y="440" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Dwell time is the skeleton of every footfall guesstimate — say it before any number.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Segment footfall', md: '3.5L passengers: ~40% long-distance (waiting, families, tea ritual), ~60% suburban (sprinting for the 8:42 local). Add ~80K accompaniers/staff/vendors.' },
      { title: 'Long-distance', md: '1.4L × 45% buyers × 1.3 cups ≈ **~80K cups** — dwell time converts to consumption.' },
      { title: 'Suburban', md: '2.1L × ~7% ≈ **~15K cups** — conversion collapses when dwell is minutes.' },
      { title: 'Others', md: '80K accompaniers/staff at ~10% ≈ **~8K cups**.' },
      { title: 'Total', md: '**≈ 1 lakh cups/day** (≈ ₹15 lakh at ₹15/cup, across ~60–80 stalls ≈ 1,300 cups/stall — plausible).' },
    ]},
    { type: 'mathBox', md: '80k + 15k + 8k ≈ **103k cups/day** · per-stall check: 100k ÷ 70 stalls ≈ 1.4k/stall ✓' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'The segmentation by **dwell time** is the answer\'s skeleton — say it first. The per-stall sanity check (1,300–1,500 cups ≈ one cup every 40 seconds over 16 hours, across 2–3 servers) closes the loop physically.' },
  ],
};

import type { Page } from '@/lib/casebook/types';

export const streetlightsMetro: Page = {
  slug: 'guesstimates/streetlights-metro',
  title: 'Streetlights in a metro city',
  subtitle: 'Road-length × spacing — geometry does the estimating.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['geometry', 'infrastructure'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of streetlights in a 600-km² metro of 10 million people. The road network is the skeleton: estimate **road-length per km²**, then divide by pole spacing. Geometry beats demographics here.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Estimation from city area through road density to total road length divided by pole spacing', caption: 'Area → road density → road-km → ÷ spacing. Both sides of major roads get poles — don\'t halve what should double.', svg: `<svg viewBox="0 0 640 250" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="slng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="30" y="26" width="180" height="74" rx="10" fill="url(#slng)"/>
    <text x="120" y="50" font-size="10" font-weight="700" fill="#ffffff">ROAD LENGTH</text>
    <text x="120" y="67" font-size="9" fill="#b9c4d6">600 km² × ~12 km of road</text>
    <text x="120" y="81" font-size="9" fill="#b9c4d6">per km² ≈ 7,000 road-km</text>
    <rect x="250" y="26" width="170" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="335" y="50" font-size="10" font-weight="700" fill="hsl(var(--foreground))">ROAD MIX</text>
    <text x="335" y="67" font-size="9" fill="hsl(var(--muted-foreground))">15% arterial (both sides) ·</text>
    <text x="335" y="81" font-size="9" fill="hsl(var(--muted-foreground))">85% local lanes (one side)</text>
    <rect x="460" y="26" width="160" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="540" y="50" font-size="10" font-weight="700" fill="hsl(var(--primary))">POLE SPACING</text>
    <text x="540" y="67" font-size="9" fill="hsl(var(--muted-foreground))">arterial ~30m ·</text>
    <text x="540" y="81" font-size="9" fill="hsl(var(--muted-foreground))">local ~40m</text>
  </g>
  <path d="M210 63 L246 63 M420 63 L456 63" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M335 100 L335 128 M540 100 L540 128 M335 128 L540 128 M437 128 L437 150" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="287" y="154" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="437" y="179" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 2.2–2.5 LAKH STREETLIGHTS</text>
  <text x="320" y="222" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Per-capita check: ~2.3L ÷ 10M ≈ one light per 43 people — Indian metros report 1 per 40–60 ✓</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Road length', md: 'Dense urban grids carry ~10–15 km of road per km² → 600 × 12 ≈ **7,000 road-km**.' },
      { title: 'Split the mix', md: 'Arterials/highways ~15% (1,050 km), lit **both sides** at ~30 m spacing; local streets ~85% (5,950 km), lit one side at ~40 m.' },
      { title: 'Count', md: 'Arterial: 1,050 km ÷ 0.03 × 2 ≈ 70K. Local: 5,950 ÷ 0.04 ≈ 149K. Parks, junctions, flyovers ≈ +10K.' },
      { title: 'Total', md: '**≈ 2.3 lakh streetlights.**' },
    ]},
    { type: 'mathBox', md: '(1,050÷0.03×2) + (5,950÷0.04) + 10k ≈ 70k + 149k + 10k ≈ **2.3 lakh**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'The road-density figure (10–15 km/km²) is the one unfamiliar number — anchor it physically: a 1-km² grid of blocks every ~150 m contains ~13 km of internal road. Deriving your anchor from geometry, on the spot, is exactly what this genre of guesstimate tests.' },
  ],
};

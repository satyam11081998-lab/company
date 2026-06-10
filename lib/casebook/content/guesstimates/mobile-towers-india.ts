import type { Page } from '@/lib/casebook/types';

export const mobileTowersIndia: Page = {
  slug: 'guesstimates/mobile-towers-india',
  title: 'Mobile towers in India',
  subtitle: 'Coverage-based vs capacity-based — geography meets traffic.',
  kind: 'guesstimate',
  meta: { difficulty: 'challenging', readingTimeMin: 6, tags: ['infrastructure', 'coverage-capacity'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of mobile towers in India. Towers are built for two different reasons: **coverage** (rural — one tower blankets a radius) and **capacity** (urban — towers added because spectrum saturates). Build the two separately; adding them is the answer.' },
    { type: 'svg', maxWidth: 660, ariaLabel: 'Two-part estimation: rural towers sized by coverage area and urban towers sized by subscriber capacity, summed', caption: 'Rural = area ÷ coverage circle. Urban = users ÷ tower capacity. Different physics, different math.', svg: `<svg viewBox="0 0 660 260" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="mtng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="40" y="24" width="270" height="96" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="175" y="46" font-size="10" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">RURAL · COVERAGE-DRIVEN</text>
    <text x="175" y="65" font-size="9" fill="hsl(var(--muted-foreground))">inhabited area ≈ 2.2M km² ÷</text>
    <text x="175" y="80" font-size="9" fill="hsl(var(--muted-foreground))">~π × (3.5 km)² ≈ 38 km² per tower</text>
    <text x="175" y="99" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ 60k grid × overlap/terrain ×2 ≈ 120k</text>
    <rect x="350" y="24" width="270" height="96" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="485" y="46" font-size="10" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">URBAN · CAPACITY-DRIVEN</text>
    <text x="485" y="65" font-size="9" fill="hsl(var(--muted-foreground))">~550M urban subscribers ÷</text>
    <text x="485" y="80" font-size="9" fill="hsl(var(--muted-foreground))">~1,500–2,000 active users per tower</text>
    <text x="485" y="99" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ 300–350k towers</text>
  </g>
  <path d="M175 120 L175 150 M485 120 L485 150 M175 150 L485 150 M330 150 L330 172" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="180" y="176" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="330" y="201" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 4.5–5 LAKH TOWERS</text>
  <text x="330" y="240" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Towers ≠ antennas: each tower hosts 1.5–2 operators' equipment (tenancy) — clarify which one is asked.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Split the problem', md: 'Rural towers exist to *cover area*; urban towers exist to *carry traffic*. One formula cannot serve both.' },
      { title: 'Rural', md: 'Inhabited/farmed area ~2.2M km²; a rural tower covers ~3–4 km radius ≈ 38 km² → ~60K minimum grid; terrain, overlap, and operator duplication roughly double it → **~120K**.' },
      { title: 'Urban', md: '~550M urban SIM users; a saturated urban tower serves ~1,500–2,000 concurrent-capable users → **~300–350K**.' },
      { title: 'Total', md: '120K + 325K ≈ **~4.5 lakh towers** (close to the published ~8 lakh *BTS sites* counting multi-operator tenancy — define your unit out loud).' },
    ]},
    { type: 'mathBox', md: 'Rural 2.2M km² ÷ 38 km² × 2 ≈ 115k · Urban 550M ÷ 1,700 ≈ 325k → **≈ 4.4 lakh towers**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Two defensive moves: state the **coverage vs capacity** split as your opening line (it\'s the insight), and define the unit — tower, site, or antenna — before estimating. Ambiguous units are how good guesstimates get marked wrong.' },
  ],
};

import type { Page } from '@/lib/casebook/types';

export const evChargingPointsMetro: Page = {
  slug: 'guesstimates/ev-charging-points-metro',
  title: 'Public EV charging points in a metro city',
  subtitle: 'A demand-led, first-principles estimate.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['first-principles'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of **public** EV charging points needed in a metro of ~10 million people. Build from demand, not from a number you half-remember.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier estimation tree from metro population through car ownership, EV share, public-charging reliance, session demand and per-point throughput to the number of public charging points', caption: 'Population → cars → EVs → public-reliant share → sessions → ÷ throughput. Every node carries its number.', svg: `<svg viewBox="0 0 720 520" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="evgng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#evgng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">PUBLIC EV CHARGING POINTS</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">10M metro · demand-led build</text>
  <path d="M360 60 L360 76 M185 76 L535 76 M185 76 L185 92 M535 76 L535 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="75" y="94" width="220" height="76" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="185" y="114" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">CAR PARC</text>
    <text x="185" y="131" font-size="8.5" fill="hsl(var(--muted-foreground))">10M ÷ 3.5/household ≈ 2.8M HH</text>
    <text x="185" y="145" font-size="8.5" fill="hsl(var(--muted-foreground))">× ~30% own a car</text>
    <text x="185" y="162" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 0.85M cars</text>
    <rect x="425" y="94" width="220" height="76" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="535" y="114" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">EV SHARE</text>
    <text x="535" y="131" font-size="8.5" fill="hsl(var(--muted-foreground))">~10% of the parc today</text>
    <text x="535" y="145" font-size="8.5" fill="hsl(var(--muted-foreground))">(the #1 swing assumption)</text>
    <text x="535" y="162" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 85,000 EVs</text>
  </g>
  <path d="M185 170 L185 188 M535 170 L535 188 M185 188 L535 188 M360 188 L360 204" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="125" y="206" width="220" height="76" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="235" y="226" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">PUBLIC-RELIANT SHARE</text>
    <text x="235" y="243" font-size="8.5" fill="hsl(var(--muted-foreground))">most charge at home; ~40% lack</text>
    <text x="235" y="257" font-size="8.5" fill="hsl(var(--muted-foreground))">private parking / need top-ups</text>
    <text x="235" y="274" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 34,000 EVs</text>
    <rect x="375" y="206" width="220" height="76" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="485" y="226" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">SESSION FREQUENCY</text>
    <text x="485" y="243" font-size="8.5" fill="hsl(var(--muted-foreground))">~2 public sessions/EV/week</text>
    <text x="485" y="257" font-size="8.5" fill="hsl(var(--muted-foreground))">(range ÷ city running)</text>
    <text x="485" y="274" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 9,700 sessions/day</text>
  </g>
  <path d="M235 282 L235 300 M485 282 L485 300 M235 300 L485 300 M360 300 L360 316" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="160" y="318" width="400" height="56" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="338" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">POINT THROUGHPUT</text>
    <text x="360" y="355" font-size="8.5" fill="hsl(var(--muted-foreground))">~45-min session + idle gaps → ~8–10 sessions/point/day; use 9</text>
  </g>
  <path d="M360 374 L360 390" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="392" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="411" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">9,700 ÷ 9 ≈ 1,100 PUBLIC POINTS</text>
  <text x="360" y="428" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">sensitivity: double EV share → ~2,200 points</text>
  <text x="360" y="468" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Flag the two assumptions that move the answer most — EV share and public-reliance % — before the interviewer asks.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Vehicles', md: '~10M people, ~3.5 per household → ~2.8M households. Assume ~30% own a car → ~0.85M cars.' },
      { title: 'EV share', md: 'Assume ~10% are EVs today → ~85,000 EVs.' },
      { title: 'Charging need', md: 'Most charge at home; assume ~40% rely partly on public charging → ~34,000 EVs needing public access.' },
      { title: 'Throughput', md: 'One public point serves ~8–10 charging sessions/day. If each such EV needs ~2 public sessions/week → ~9,700 sessions/day citywide.' },
      { title: 'Points', md: '~9,700 sessions/day ÷ ~9 sessions/point/day ≈ **~1,100 public charging points**.' },
    ]},
    { type: 'mathBox', md: '0.85M cars × 10% EV = 85k EVs → 40% public-reliant ≈ 34k → ~2 sessions/wk ≈ 9.7k/day ÷ 9 per point ≈ ~1.1k points.' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'State every assumption out loud and flag the two that move the answer most (EV share and public-reliance %). Offer a sensitivity: double EV share → ~2,200 points.' },
  ],
};

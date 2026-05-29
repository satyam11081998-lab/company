import type { Page } from '@/lib/casebook/types';

export const evChargingPointsMetro: Page = {
  slug: 'guesstimates/ev-charging-points-metro',
  title: 'Public EV charging points in a metro city',
  subtitle: 'A demand-led, first-principles estimate.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['first-principles'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of **public** EV charging points needed in a metro of ~10 million people. Build from demand, not from a number you half-remember.' },
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

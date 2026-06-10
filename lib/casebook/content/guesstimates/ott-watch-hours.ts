import type { Page } from '@/lib/casebook/types';

export const ottWatchHours: Page = {
  slug: 'guesstimates/ott-watch-hours',
  title: 'OTT hours streamed in India per day',
  subtitle: 'Time-budget estimation — anchor on the 24-hour constraint.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['time-budget', 'digital'] },
  blocks: [
    { type: 'prose', md: 'Estimate total hours of OTT video (streaming platforms, not YouTube/reels) watched in India per day. Time-based guesstimates have a built-in sanity anchor no other type has: **nobody has more than 24 hours**, and screen time competes with work, sleep, and other media.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Time budget estimation with viewer base segmented by engagement and hours per day each, anchored against total leisure time', caption: 'Segment viewers by engagement; sanity-check the result against India\'s total leisure-hours budget.', svg: `<svg viewBox="0 0 640 260" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="otng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="195" y="14" width="250" height="42" rx="11" fill="url(#otng)"/>
  <text x="320" y="33" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">~250M OTT VIEWERS (weekly active)</text>
  <text x="320" y="49" text-anchor="middle" font-size="9" fill="#b9c4d6">paid + ad-supported + shared accounts</text>
  <g text-anchor="middle">
    <rect x="40" y="86" width="180" height="88" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="130" y="107" font-size="10" font-weight="700" fill="hsl(var(--primary))">BINGERS · 15%</text>
    <text x="130" y="124" font-size="9" fill="hsl(var(--muted-foreground))">~2.5 hrs/day</text>
    <text x="130" y="140" font-size="9" fill="hsl(var(--muted-foreground))">night-time serial watchers</text>
    <text x="130" y="160" font-size="10" font-weight="700" fill="hsl(var(--foreground))">37M × 2.5 ≈ 95M hrs</text>
    <rect x="240" y="86" width="180" height="88" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="330" y="107" font-size="10" font-weight="700" fill="hsl(var(--foreground))">REGULARS · 35%</text>
    <text x="330" y="124" font-size="9" fill="hsl(var(--muted-foreground))">~1 hr/day</text>
    <text x="330" y="140" font-size="9" fill="hsl(var(--muted-foreground))">an episode an evening</text>
    <text x="330" y="160" font-size="10" font-weight="700" fill="hsl(var(--foreground))">88M × 1 ≈ 88M hrs</text>
    <rect x="440" y="86" width="180" height="88" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="530" y="107" font-size="10" font-weight="700" fill="hsl(var(--foreground))">OCCASIONAL · 50%</text>
    <text x="530" y="124" font-size="9" fill="hsl(var(--muted-foreground))">~0.25 hr/day average</text>
    <text x="530" y="140" font-size="9" fill="hsl(var(--muted-foreground))">weekend movie viewers</text>
    <text x="530" y="160" font-size="10" font-weight="700" fill="hsl(var(--foreground))">125M × 0.25 ≈ 31M hrs</text>
  </g>
  <rect x="160" y="196" width="320" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="320" y="221" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 21–22 CRORE HOURS / DAY</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Viewer base', md: '~750M smartphone users → OTT weekly-actives ≈ **250M** (subscriptions are shared; ad-supported tiers widen the base).' },
      { title: 'Segment by engagement', md: 'Bingers 15% × 2.5 hrs + Regulars 35% × 1 hr + Occasionals 50% × 0.25 hr.' },
      { title: 'Sum', md: '95M + 88M + 31M ≈ **~215M hours/day**.' },
      { title: 'Time-budget sanity', md: 'India\'s ~1B adults have ~4 leisure hrs each = 4B leisure hours/day. OTT at 215M = **~5% of national leisure** — believable next to TV (~3.5 hrs for TV households) and social media.' },
    ]},
    { type: 'mathBox', md: '37M×2.5 + 88M×1 + 125M×0.25 ≈ **215M hrs/day** ≈ 5% of national leisure time ✓' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'The leisure-budget cross-check is the differentiator — it bounds your answer from above. If your estimate had come to 2B hours/day, it would mean half of India\'s entire free time on OTT: impossible, recompute. Always test time estimates against the 24-hour constraint.' },
  ],
};

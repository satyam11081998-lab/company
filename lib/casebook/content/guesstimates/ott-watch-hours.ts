import type { Page } from '@/lib/casebook/types';

export const ottWatchHours: Page = {
  slug: 'guesstimates/ott-watch-hours',
  title: 'OTT hours streamed in India per day',
  subtitle: 'Time-budget estimation — anchor on the 24-hour constraint.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['time-budget', 'digital'] },
  blocks: [
    { type: 'prose', md: 'Estimate total hours of OTT video (streaming platforms, not YouTube/reels) watched in India per day. Time-based guesstimates have a built-in sanity anchor no other type has: **nobody has more than 24 hours**, and screen time competes with work, sleep, and other media.' },
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', title: 'Clarifying questions before building the tree', turns: [
        { speaker: 'candidate', md: 'Scope: subscription/AVOD streaming platforms — *excluding* YouTube and short-form reels — measured in viewer-hours per day across India?', note: 'Excluding YouTube/reels is enormous; leaving them in would multiply the answer.' },
        { speaker: 'interviewer', md: 'Yes — long-form platforms, viewer-hours/day.' },
        { speaker: 'candidate', md: 'A typical day, all India?' },
        { speaker: 'interviewer', md: 'Yes.' },
        { speaker: 'candidate', md: 'Then I’ll segment viewers by engagement intensity and sanity-check against the 24-hour budget — streaming competes with work, sleep, and other media.', note: 'The time-budget anchor is unique to this type and catches runaway numbers.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'The platform definition (no YouTube/reels), the viewer-hour unit, and an engagement-segmented build checked against the 24-hour budget.' },
    ]},
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree from smartphone base to OTT weekly actives, segmented into binger, regular and occasional bands with hours each, summed and bounded by the national leisure-time budget', caption: 'Base → viewer funnel → engagement bands → sum — then the 24-hour constraint bounds the answer from above.', svg: `<svg viewBox="0 0 720 530" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="otng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#otng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">OTT HOURS / DAY · INDIA</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">streaming platforms, not YouTube/reels</text>
  <path d="M360 60 L360 78" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="210" y="80" width="300" height="42" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="97" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">VIEWER BASE: 750M smartphones → ~33% OTT weekly-active</text>
    <text x="360" y="113" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">≈ 250M viewers (subs shared ~2.5×, + ad tiers)</text>
  </g>
  <path d="M360 122 L360 138 M125 138 L595 138 M125 138 L125 154 M360 138 L360 154 M595 138 L595 154" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="156" width="190" height="110" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="125" y="176" font-size="10" font-weight="700" fill="hsl(var(--primary))">BINGERS · 15% = 37M</text>
    <text x="125" y="194" font-size="8.5" fill="hsl(var(--muted-foreground))">night serial-watchers · weekend</text>
    <text x="125" y="208" font-size="8.5" fill="hsl(var(--muted-foreground))">marathons · ~17 hrs/week</text>
    <text x="125" y="226" font-size="9" font-weight="600" fill="hsl(var(--foreground))">~2.5 hrs/day</text>
    <text x="125" y="248" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ 95M hrs · 44%</text>
    <rect x="265" y="156" width="190" height="110" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="176" font-size="10" font-weight="700" fill="hsl(var(--foreground))">REGULARS · 35% = 88M</text>
    <text x="360" y="194" font-size="8.5" fill="hsl(var(--muted-foreground))">an episode an evening ·</text>
    <text x="360" y="208" font-size="8.5" fill="hsl(var(--muted-foreground))">commute viewing · ~7 hrs/week</text>
    <text x="360" y="226" font-size="9" font-weight="600" fill="hsl(var(--foreground))">~1 hr/day</text>
    <text x="360" y="248" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">≈ 88M hrs · 41%</text>
    <rect x="500" y="156" width="190" height="110" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="595" y="176" font-size="10" font-weight="700" fill="hsl(var(--foreground))">OCCASIONAL · 50% = 125M</text>
    <text x="595" y="194" font-size="8.5" fill="hsl(var(--muted-foreground))">weekend movie + cricket-event</text>
    <text x="595" y="208" font-size="8.5" fill="hsl(var(--muted-foreground))">spikes · ~2 hrs/week</text>
    <text x="595" y="226" font-size="9" font-weight="600" fill="hsl(var(--foreground))">~0.25 hr/day</text>
    <text x="595" y="248" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">≈ 31M hrs · 15%</text>
  </g>
  <path d="M125 266 L125 288 M360 266 L360 288 M595 266 L595 288 M125 288 L595 288 M360 288 L360 304" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="306" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="325" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 215M ≈ 21–22 CRORE HOURS / DAY</text>
  <text x="360" y="342" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">bingers: 15% of viewers, 44% of watch time</text>
  <path d="M360 350 L360 366" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="140" y="368" width="440" height="66" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="388" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">THE 24-HOUR BOUND (the differentiator)</text>
    <text x="360" y="405" font-size="8.5" fill="hsl(var(--muted-foreground))">~1B adults × ~4 leisure hrs = 4B leisure-hours/day nationally</text>
    <text x="360" y="421" font-size="8.5" fill="hsl(var(--muted-foreground))">OTT at 215M ≈ 5% of national leisure — plausible next to TV (~3.5 hrs in TV homes) and social media</text>
  </g>
  <text x="360" y="478" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Had the build produced 2B hours, that's half of India's free time — impossible, recompute. Time estimates carry a built-in ceiling.</text>
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

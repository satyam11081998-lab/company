import type { Page } from '@/lib/casebook/types';

export const schoolUniformsIndia: Page = {
  slug: 'guesstimates/school-uniforms-india',
  title: 'School uniform sets sold in India per year',
  subtitle: 'Cohort sizing + replacement frequency — clean and fast.',
  kind: 'guesstimate',
  meta: { difficulty: 'easy', readingTimeMin: 4, tags: ['cohort', 'consumption'] },
  blocks: [
    { type: 'prose', md: 'Estimate annual sales of school uniform sets in India. A textbook **cohort × frequency** build: how many school-goers, how many sets each per year.' },
    { type: 'svg', maxWidth: 620, ariaLabel: 'Estimation tree from population to school-age cohort to enrolled uniform-wearing students times sets per year', caption: 'Cohort → enrolled & uniformed → sets per child per year.', svg: `<svg viewBox="0 0 620 240" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="sung" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="20" y="26" width="170" height="62" rx="10" fill="url(#sung)"/>
    <text x="105" y="50" font-size="10" font-weight="700" fill="#ffffff">SCHOOL-AGE (5–17)</text>
    <text x="105" y="67" font-size="9" fill="#b9c4d6">~13 cohorts × ~23M ≈ 300M</text>
    <rect x="225" y="26" width="170" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="310" y="46" font-size="10" font-weight="700" fill="hsl(var(--foreground))">ENROLLED + UNIFORMED</text>
    <text x="310" y="63" font-size="9" fill="hsl(var(--muted-foreground))">~90% enrolled × ~95%</text>
    <text x="310" y="77" font-size="9" fill="hsl(var(--muted-foreground))">uniform schools ≈ 255M</text>
    <rect x="430" y="26" width="170" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="515" y="46" font-size="10" font-weight="700" fill="hsl(var(--primary))">SETS / CHILD / YEAR</text>
    <text x="515" y="63" font-size="9" fill="hsl(var(--muted-foreground))">growth + wear: ~2 new</text>
    <text x="515" y="77" font-size="9" fill="hsl(var(--muted-foreground))">sets/yr (2–3 lower grades)</text>
  </g>
  <path d="M190 57 L221 57 M395 57 L426 57" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M310 88 L310 116 M515 88 L515 116 M310 116 L515 116 M412 116 L412 138" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="262" y="142" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="412" y="167" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 500M SETS / YEAR</text>
  <text x="310" y="215" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">At ₹500–700/set this is a ₹25,000–35,000 cr market — state the "so what" unprompted.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Cohort', md: '1.4B population, near-uniform age pyramid up to ~25: each year-cohort ≈ 23M. Ages 5–17 = 13 cohorts → **~300M** children.' },
      { title: 'Enrolled & uniformed', md: 'Enrollment ~90%; nearly all Indian schools (government and private) mandate uniforms → **~255M** uniform-wearing students.' },
      { title: 'Sets per year', md: 'Growing children outgrow + wear out: ~2 sets/yr in primary, ~1.5 in senior grades → blended **~2**.' },
      { title: 'Total', md: '255M × 2 ≈ **~500M sets a year**.' },
    ]},
    { type: 'mathBox', md: '300M school-age × 90% × 95% × 2 sets ≈ **510M sets/yr**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Mention the seasonality insight: ~70% of volume sells in the June–July back-to-school window — useful if the conversation pivots to "how would a uniform maker plan capacity?" Interviewers often extend guesstimates into a mini business question; anticipate the extension.' },
  ],
};

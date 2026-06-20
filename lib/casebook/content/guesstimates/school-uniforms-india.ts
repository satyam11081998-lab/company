import type { Page } from '@/lib/casebook/types';

export const schoolUniformsIndia: Page = {
  slug: 'guesstimates/school-uniforms-india',
  title: 'School uniform sets sold in India per year',
  subtitle: 'Cohort sizing + replacement frequency — clean and fast.',
  kind: 'guesstimate',
  meta: { difficulty: 'easy', readingTimeMin: 4, tags: ['cohort', 'consumption'] },
  blocks: [
    { type: 'prose', md: 'Estimate annual sales of school uniform sets in India. A textbook **cohort × frequency** build: how many school-goers, how many sets each per year.' },
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', title: 'Clarifying questions before building the tree', turns: [
        { speaker: 'candidate', md: 'Scope: annual school-uniform *sets* sold across India — K-12 students in schools that *require* uniforms — where a ‘set’ is one shirt-and-bottom combination bought in a year?', note: 'The uniformed-school filter and the ‘set’ unit keep the cohort math honest.' },
        { speaker: 'interviewer', md: 'Yes — K-12, uniform-requiring schools, sets/year.' },
        { speaker: 'candidate', md: 'A typical year?' },
        { speaker: 'interviewer', md: 'Yes.' },
        { speaker: 'candidate', md: 'Then it’s cohort × frequency: enrolled-and-uniformed students × sets each buys a year, allowing for growth, wear, and a spare.', note: 'Frequency (sets per child per year) is the lever, not just the headcount.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'The set unit, the uniformed-school filter, and a clean cohort × sets-per-year build.' },
    ]},
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree from population pyramid to school-age cohort, filtered by enrollment and uniform mandate, split into primary and senior grades with different sets per year, summed to annual demand', caption: 'Pyramid → cohort → filters → grade-wise replacement rates → total. Note the primary/senior split — growth rates differ.', svg: `<svg viewBox="0 0 720 500" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="sung" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#sung)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">UNIFORM SETS SOLD / YEAR</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">cohort × filters × replacement rate</text>
  <path d="M360 60 L360 78" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="210" y="80" width="300" height="52" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="100" font-size="10" font-weight="700" fill="hsl(var(--foreground))">SCHOOL-AGE POPULATION (5–17)</text>
    <text x="360" y="117" font-size="9" fill="hsl(var(--muted-foreground))">1.4B, flat pyramid → ~23M per year-cohort × 13 cohorts ≈ <tspan font-weight="700" fill="hsl(var(--primary))">300M</tspan></text>
  </g>
  <path d="M360 132 L360 148 M205 148 L515 148 M205 148 L205 164 M515 148 L515 164" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="85" y="166" width="240" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="205" y="186" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FILTER 1 · ENROLLED</text>
    <text x="205" y="203" font-size="8.5" fill="hsl(var(--muted-foreground))">~90% enrollment (RTE era; dropouts in 15–17)</text>
    <text x="205" y="221" font-size="10" font-weight="700" fill="hsl(var(--primary))">→ 270M students</text>
    <rect x="395" y="166" width="240" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="515" y="186" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FILTER 2 · UNIFORM MANDATE</text>
    <text x="515" y="203" font-size="8.5" fill="hsl(var(--muted-foreground))">~95% of Indian schools, govt + private</text>
    <text x="515" y="221" font-size="10" font-weight="700" fill="hsl(var(--primary))">→ 255M uniformed</text>
  </g>
  <path d="M205 230 L205 248 M515 230 L515 248 M205 248 L515 248 M360 248 L360 264 M185 264 L535 264 M185 264 L185 280 M535 264 L535 280" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="65" y="282" width="240" height="74" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="185" y="302" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PRIMARY (5–11) ≈ 140M</text>
    <text x="185" y="319" font-size="8.5" fill="hsl(var(--muted-foreground))">fast growth + rough wear</text>
    <text x="185" y="333" font-size="8.5" fill="hsl(var(--muted-foreground))">~2.3 new sets/child/yr</text>
    <text x="185" y="349" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 320M sets</text>
    <rect x="415" y="282" width="240" height="74" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="535" y="302" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">SENIOR (12–17) ≈ 115M</text>
    <text x="535" y="319" font-size="8.5" fill="hsl(var(--muted-foreground))">slower growth, careful use</text>
    <text x="535" y="333" font-size="8.5" fill="hsl(var(--muted-foreground))">~1.6 new sets/child/yr</text>
    <text x="535" y="349" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 185M sets</text>
  </g>
  <path d="M185 356 L185 378 M535 356 L535 378 M185 378 L535 378 M360 378 L360 396" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="398" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="417" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 500M SETS / YEAR</text>
  <text x="360" y="434" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">× ₹500–700/set ≈ ₹25,000–35,000 cr market</text>
  <text x="360" y="474" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Seasonality kicker: ~70% sells in the June–July back-to-school window — capacity planning is the real business problem.</text>
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

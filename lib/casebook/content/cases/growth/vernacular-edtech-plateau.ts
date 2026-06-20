import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const vernacularEdtechPlateau: Page = {
  slug: 'cases/growth/vernacular-edtech-plateau',
  title: 'The Edtech App That Stopped Growing',
  subtitle: 'Downloads keep coming. Revenue doesn\'t. Find the broken stage.',
  kind: 'case',
  meta: { difficulty: 'moderate', caseType: 'Growth', readingTimeMin: 9, tags: ['edtech', 'funnel', 'retention'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client runs a vernacular-language exam-prep app (government job exams: SSC, banking, railways) with 8 million downloads and ₹90 crore revenue from a ₹999/year subscription. Revenue has been flat for four quarters despite downloads growing 20% per quarter. Diagnose and fix.' },
    ]},
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Downloads up, revenue flat — the leak is between install and renewal. Before structuring: is the ₹999 price unchanged? Any competitor or exam-calendar shifts — fewer notifications released — that would suppress the whole category?' },
        { speaker: 'interviewer', md: 'Price unchanged. Exam calendar is normal. Competitors exist but their pricing hasn\'t moved. The problem is internal.', note: 'External causes ruled out in one pass — now the funnel is the whole case.' },
        { speaker: 'candidate', md: 'Then I\'ll walk the funnel: install → activation (first meaningful study session) → trial-to-paid conversion → renewal. Flat revenue against compounding installs means one of these stages collapsed. I\'d like the stage-wise numbers, this year versus last.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Located the leak between install and renewal, ruled out a price or exam-calendar shock, and set up a stage-wise funnel diagnosis.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Subscription funnel with year-on-year rates at each stage, a cohort split under the collapsed activation stage showing 70 percent Bhojpuri and Marathi installs activating at 9 percent versus 30 percent Hindi installs at 37 percent, blended math reproducing 24 percent, and a fix-the-spend verdict bar', caption: 'The funnel with both years\' rates, then the cohort tier under activation — 70% @ 9% vs 30% @ 37% reproduces the 24% exactly.', svg: `<svg viewBox="0 0 720 495" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <linearGradient id="veng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <marker id="vear" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#veng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">INSTALLS +20%/QTR, REVENUE FLAT</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">the leak is between install and renewal — walk the funnel, then split the cohort</text>
  <path d="M360 60 L360 76" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="20" y="78" width="150" height="78" rx="10" fill="url(#veng)"/>
    <text x="95" y="102" font-size="10.5" font-weight="700" fill="#ffffff">INSTALLS</text>
    <text x="95" y="120" font-size="9" fill="#b9c4d6">+20% / quarter</text>
    <text x="95" y="136" font-size="9" fill="#b9c4d6">healthy ✓</text>
    <rect x="200" y="78" width="150" height="78" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="275" y="102" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">ACTIVATION</text>
    <text x="275" y="120" font-size="9" fill="hsl(var(--muted-foreground))">last yr: 38% · now: 24%</text>
    <text x="275" y="136" font-size="9" font-weight="700" fill="hsl(var(--primary))">▼ collapsed — dig here</text>
    <rect x="380" y="78" width="150" height="78" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="455" y="102" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">TRIAL → PAID</text>
    <text x="455" y="120" font-size="9" fill="hsl(var(--muted-foreground))">last yr: 9% · now: 8.5%</text>
    <text x="455" y="136" font-size="9" fill="hsl(var(--muted-foreground))">roughly stable</text>
    <rect x="560" y="78" width="150" height="78" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="635" y="102" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">RENEWAL</text>
    <text x="635" y="120" font-size="9" fill="hsl(var(--muted-foreground))">last yr: 45% · now: 41%</text>
    <text x="635" y="136" font-size="9" fill="hsl(var(--muted-foreground))">soft, secondary</text>
  </g>
  <path d="M170 117 L196 117" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#vear)"/>
  <path d="M350 117 L376 117" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#vear)"/>
  <path d="M530 117 L556 117" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#vear)"/>
  <path d="M275 156 L275 170 M215 170 L505 170 M215 170 L215 182 M505 170 L505 182" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="105" y="184" width="220" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="204" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">BHOJPURI / MARATHI COHORT</text>
    <text x="215" y="221" font-size="8.5" fill="hsl(var(--muted-foreground))">70% of new installs (viral campaign)</text>
    <text x="215" y="235" font-size="8.5" fill="hsl(var(--muted-foreground))">but only 15% of question bank translated</text>
    <text x="215" y="257" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">activate @ 9%</text>
    <text x="215" y="271" font-size="8" fill="hsl(var(--muted-foreground))">wrong audience for the current product</text>
    <rect x="395" y="184" width="220" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="505" y="204" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">HINDI-CHANNEL COHORT</text>
    <text x="505" y="221" font-size="8.5" fill="hsl(var(--muted-foreground))">30% of installs · complete product,</text>
    <text x="505" y="235" font-size="8.5" fill="hsl(var(--muted-foreground))">historical aspirant profile</text>
    <text x="505" y="257" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">activate @ 37%</text>
    <text x="505" y="271" font-size="8" fill="hsl(var(--muted-foreground))">the engine still works</text>
  </g>
  <path d="M215 276 L215 306 M505 276 L505 306" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="308" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="326" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">BLENDED ACTIVATION</text>
    <text x="215" y="342" font-size="8.5" fill="hsl(var(--muted-foreground))">70% × 9% + 30% × 37% = 6.3 + 11.1</text>
    <text x="215" y="358" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ 17–24% ✓ symptom reproduced</text>
    <rect x="385" y="308" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="326" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">RE-WEIGHTED SPEND</text>
    <text x="505" y="342" font-size="8.5" fill="hsl(var(--muted-foreground))">Hindi-belt focus → blended back to ~35%</text>
    <text x="505" y="358" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">+45% paid adds, same installs</text>
  </g>
  <path d="M215 366 L215 382 M505 366 L505 382 M215 382 L505 382 M360 382 L360 396" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="398" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="417" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">FIX THE SPEND NOW — BUILD MARATHI, LAUNCH IN 2 QTRS</text>
  <text x="360" y="434" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">guardrail: any channel activating &lt;25% auto-flagged before budget scales · renewal offers = secondary</text>
  <text x="360" y="472" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">When a rate collapses while volume grows, the cause is who is arriving, not what they find — and "bad" traffic is sometimes tomorrow's roadmap.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Activation is your collapsed stage. Dig.' },
        { speaker: 'candidate', md: 'A rate that halves while volume doubles is usually a **mix problem**: the marginal installer differs from the historical one. I\'d split activation by acquisition channel and by language. Hypothesis: growth marketing widened targeting — cheaper installs from users outside the core exam-aspirant profile, or from languages where content is thin.', note: 'Rate collapse + volume growth → always decompose by cohort before blaming the product.' },
        { speaker: 'interviewer', md: 'Sharp. 70% of new installs now come from a viral short-video campaign in Bhojpuri and Marathi — languages where the app has only 15% of its question-bank translated. Those users activate at 9%. Hindi-channel installs still activate at 37%.' },
        { speaker: 'candidate', md: 'So growth bought the wrong audience for the current product — or the right audience for a product that doesn\'t exist yet. Two honest paths: refocus spend on Hindi-belt channels where the product is complete, or treat Bhojpuri/Marathi as the next product investment since the demand signal is real — 70% of installs is not noise. Given flat revenue and a working Hindi engine, I\'d do both sequentially: fix the spend now, build Marathi content next (larger exam population than Bhojpuri), launch properly in two quarters.' },
      ]},
      { type: 'reveal', summary: 'Reveal the cohort math', blocks: [
        { type: 'mathBox', title: 'Blended activation reproduces the 24%', md: '70% installs × 9% + 30% × 37% = 6.3 + 11.1 = **17–24%** range depending on quarter mix ✓\nRefocusing spend to Hindi-belt: blended activation returns to ~35% → paid adds grow ~45% on the same install volume.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend', items: [
        'Immediately re-weight acquisition spend toward channels/languages where the product is complete; stop buying installs the product can\'t serve.',
        'Build the Marathi question bank to 90% coverage in two quarters — the campaign proved demand; meet it before re-opening the spend tap.',
        'Add an activation-by-cohort dashboard as a permanent guardrail: any channel activating <25% gets auto-flagged before budget scales.',
        'Address the renewal softness with exam-cycle-aligned renewal offers (renew before prelims at a discount), but treat it as secondary.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'When a funnel rate collapses while volume grows, the cause is almost always **who\'s arriving**, not what they find. Decompose by cohort first — and recognize that "bad" traffic is sometimes tomorrow\'s product roadmap announcing itself.' },
    ]},
  ],
};

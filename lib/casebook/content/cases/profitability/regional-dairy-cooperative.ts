import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const regionalDairyCooperative: Page = {
  slug: 'cases/profitability/regional-dairy-cooperative',
  title: 'The Regional Dairy Cooperative',
  subtitle: 'Profits are down two years running. Find out why.',
  kind: 'case',
  meta: { difficulty: 'moderate', caseType: 'Profitability', readingTimeMin: 9 },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client is a farmer-owned dairy cooperative selling milk, curd, and butter across three districts. Profit has fallen for two straight years even though revenue is flat. The board wants to know why — and what to do.' },
    ]},
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'steps', ordered: false, items: [
        { md: 'Is revenue *truly* flat, or is a volume drop being masked by a price increase?' },
        { md: 'Which products — is the decline broad or concentrated in one line (e.g., butter)?' },
        { md: 'Has anything changed structurally — input prices, a new competitor, a plant or route change?' },
      ]},
      { type: 'callout', variant: 'tip', md: 'Flat revenue + falling profit points hard at the **cost side** or an adverse **mix shift**. Signal that hypothesis early.' },
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Separated a true revenue drop from price-masked volume, localised the decline by product, and pointed early at a cost-side or adverse mix-shift hypothesis.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'prose', md: 'Use the profitability tree, but lead with cost and mix given the flat-revenue signal.' },
      { type: 'svg', maxWidth: 720, ariaLabel: 'Three-tier profitability tree: flat revenue decomposed into volume up four percent and price mix down five percent, against feed cost up eight percent, with mix math row and defend-butter verdict bar', caption: 'The case-specific tree — revenue is flat only because +4% volume hides −5% price/mix. The squeeze lives in the blend.', svg: `<svg viewBox="0 0 720 490" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="rdcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#rdcg)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">PROFIT ↓ TWO YEARS, REVENUE FLAT</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">decompose realised price into volume AND mix before trusting "flat"</text>
  <path d="M360 60 L360 70 M242 70 L595 70 M242 70 L242 80 M595 70 L595 80" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="112" y="82" width="260" height="42" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="242" y="99" font-size="10" font-weight="700" fill="hsl(var(--foreground))">REVENUE — "FLAT" (the mask)</text>
    <text x="242" y="115" font-size="8.5" fill="hsl(var(--muted-foreground))">volume growth offsets price/mix decline</text>
    <rect x="465" y="82" width="260" height="42" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="595" y="99" font-size="10" font-weight="700" fill="hsl(var(--foreground))">COST — RISING</text>
    <text x="595" y="115" font-size="8.5" fill="hsl(var(--muted-foreground))">variable input squeeze on every litre</text>
  </g>
  <path d="M242 124 L242 138 M125 138 L360 138 M125 138 L125 152 M360 138 L360 152 M595 124 L595 152" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="125" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">VOLUME</text>
    <text x="125" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">liquid milk grew —</text>
    <text x="125" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">the low-margin line</text>
    <text x="125" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">(~8% margin)</text>
    <text x="125" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">+4%</text>
    <text x="125" y="256" font-size="8" fill="hsl(var(--muted-foreground))">growth in the wrong product</text>
    <rect x="265" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">PRICE / MIX (the key)</text>
    <text x="360" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">butter (~30% margin) lost</text>
    <text x="360" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">share to a branded entrant;</text>
    <text x="360" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">blend tilts to cheap milk</text>
    <text x="360" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">−5% realised price</text>
    <text x="360" y="256" font-size="8" fill="hsl(var(--muted-foreground))">adverse mix, not discounting</text>
    <rect x="500" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="595" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FEED COST</text>
    <text x="595" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">variable input across</text>
    <text x="595" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">all three product lines —</text>
    <text x="595" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">no line escapes it</text>
    <text x="595" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">+8%</text>
    <text x="595" y="256" font-size="8" fill="hsl(var(--muted-foreground))">compounds the mix drag</text>
  </g>
  <path d="M125 264 L125 282 M360 264 L360 282 M595 264 L595 282 M125 282 L595 282 M215 282 L215 298 M505 282 L505 298" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="300" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="320" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">MIX MATH</text>
    <text x="215" y="336" font-size="8.5" fill="hsl(var(--muted-foreground))">butter ~30% vs milk ~8% margin —</text>
    <text x="215" y="350" font-size="8.5" fill="hsl(var(--muted-foreground))">every share point lost drags the blend</text>
    <rect x="385" y="300" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="320" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">SIZE OF PRIZE</text>
    <text x="505" y="338" font-size="10" font-weight="700" fill="hsl(var(--foreground))">recover ½ butter share ≈ +2–3 pts</text>
    <text x="505" y="352" font-size="8.5" fill="hsl(var(--muted-foreground))">bigger than any feasible feed saving</text>
  </g>
  <path d="M215 358 L215 376 M505 358 L505 376 M215 376 L505 376 M360 376 L360 390" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="170" y="392" width="380" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="411" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">DEFEND BUTTER — MARGIN RECOVERY BEATS COST CUTS</text>
  <text x="360" y="428" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">then hedge feed contracts · make product mix a board KPI</text>
  <text x="360" y="468" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Flat top-line concealed the squeeze: +4% volume offset −5% price/mix exactly — the board was watching the wrong number.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'prose', md: 'Suppose the interviewer reveals: volume is up 4%, but average realised price fell 5% because the high-margin **butter** line lost share to a branded entrant, while low-margin liquid milk grew. Meanwhile feed costs (a variable input) rose 8%.' },
      { type: 'reveal', summary: 'Reveal the worked logic', blocks: [
        { type: 'prose', md: 'Two forces compound: an **adverse mix shift** (more low-margin milk, less high-margin butter) drags average margin down, and **rising variable cost** (feed) squeezes it further. Revenue looks flat only because volume growth offsets the price/mix decline — hiding the real story.' },
        { type: 'mathBox', title: 'Rough size of the prize', md: 'If butter is ~30% margin vs ~8% for liquid milk, recovering even half the lost butter share could lift blended margin by 2–3 points — often larger than any feasible feed-cost saving.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend', items: [
        'Defend the butter line: targeted marketing / packaging vs the new entrant, since margin recovery there beats cost cuts.',
        'Hedge or renegotiate feed contracts to blunt the 8% input rise.',
        'Track product mix as a board KPI so margin erosion can\'t hide behind flat revenue again.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'Flat top-line can conceal a mix + cost squeeze. Always decompose realised price into volume *and* mix before concluding "revenue is fine."' },
    ]},
  ],
};

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
    { type: 'caseSection', label: 'clarifying', title: 'Good clarifying questions', blocks: [
      { type: 'steps', ordered: false, items: [
        { md: 'Is revenue *truly* flat, or is a volume drop being masked by a price increase?' },
        { md: 'Which products — is the decline broad or concentrated in one line (e.g., butter)?' },
        { md: 'Has anything changed structurally — input prices, a new competitor, a plant or route change?' },
      ]},
      { type: 'callout', variant: 'tip', md: 'Flat revenue + falling profit points hard at the **cost side** or an adverse **mix shift**. Signal that hypothesis early.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'prose', md: 'Use the profitability tree, but lead with cost and mix given the flat-revenue signal.' },
      { type: 'diagram', ref: 'profitability-driver-tree', caption: 'Anchor the discussion on this; chase cost and mix first.' },
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

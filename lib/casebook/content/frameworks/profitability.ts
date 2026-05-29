import type { Page } from '@/lib/casebook/types';

export const profitabilityFramework: Page = {
  slug: 'core-frameworks/profitability',
  title: 'Profitability',
  subtitle: 'Finding why profit moved — and what to do about it.',
  kind: 'framework',
  meta: { caseType: 'Profitability', readingTimeMin: 7, tags: ['core', 'structuring'] },
  blocks: [
    { type: 'prose', md: 'A profitability problem asks one question: **why did profit change, and how do we restore or grow it?** Profit is just `Revenue − Cost`, so every profitability case decomposes cleanly into those two arms. The skill is not memorising the tree — it is deciding *which branch to chase first* based on what the data and the interviewer signal.' },
    { type: 'heading', level: 2, text: 'The driver tree' },
    { type: 'prose', md: 'Start by splitting profit into revenue and cost, then break each into the smallest levers you can act on. Revenue splits into **price × volume** (and volume often into segments or channels). Cost splits into **fixed vs. variable**, then into line items.' },
    { type: 'diagram', ref: 'profitability-driver-tree', caption: 'Profit = Revenue − Cost, each broken to actionable levers.' },
    { type: 'callout', variant: 'insight', title: 'Isolate before you analyse', md: 'Before opening every branch, ask whether the problem is a **revenue** issue or a **cost** issue. A single clarifying question ("has the drop come from falling sales or rising costs?") can save you half the tree.' },
    { type: 'heading', level: 2, text: 'Working the revenue side' },
    { type: 'steps', ordered: true, items: [
      { title: 'Price', md: 'Has realised price changed? Look at list price, discounts, and mix (selling more of cheaper products lowers *average* price without any single price moving).' },
      { title: 'Volume', md: 'Units sold — split by segment, channel, or geography to localise the drop.' },
      { title: 'Mix', md: 'A shift toward lower-margin products can cut profit even when total revenue holds.' },
    ]},
    { type: 'heading', level: 2, text: 'Working the cost side' },
    { type: 'columns', columns: [
      [{ type: 'callout', variant: 'note', title: 'Variable costs', md: 'Move with volume: materials, direct labour, packaging, shipping. Express per-unit to compare across periods.' }],
      [{ type: 'callout', variant: 'note', title: 'Fixed costs', md: 'Independent of volume in the short run: rent, salaried staff, depreciation. A volume drop spreads these over fewer units, raising unit cost.' }],
    ]},
    { type: 'callout', variant: 'pitfall', title: 'Common trap', md: 'Candidates chase cost-cutting when the real issue is a volume collapse making fixed costs *look* high per unit. Fix the volume and the "cost problem" often disappears.' },
    { type: 'keyTakeaways', items: [
      'Profit = Revenue − Cost; decompose both into levers you can pull.',
      'Localise the problem (segment / period / line item) before going deep.',
      'Watch mix — average price and average cost can move with zero change to any single number.',
      'Recommend actions tied to the specific lever you isolated, with a rough size of the prize.',
    ]},
  ],
};

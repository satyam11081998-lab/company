import type { NavNode } from './types';

export const CASEBOOK_TREE: NavNode[] = [
  {
    title: 'A · Getting Started',
    kind: 'section',
    icon: 'Compass',
    defaultOpen: true,
    children: [
      { title: 'What a case interview tests', kind: 'page', slug: 'getting-started/what-it-tests' },
      { title: 'The six case types at a glance', kind: 'page', slug: 'getting-started/six-case-types' },
      { title: 'Navigating tricky & blended cases', kind: 'page', slug: 'getting-started/navigating-blended-cases' },
      { title: 'A repeatable solving method', kind: 'page', slug: 'getting-started/repeatable-method' },
      { title: 'Math under pressure', kind: 'page', slug: 'getting-started/math-under-pressure' },
      { title: 'Communication under pressure', kind: 'page', slug: 'getting-started/communication-under-pressure' },
      { title: 'Your diagnostic & a 14-day plan', kind: 'page', slug: 'getting-started/diagnostic-and-plan' },
    ],
  },
  {
    title: 'B · Core Frameworks',
    kind: 'section',
    icon: 'Layers',
    defaultOpen: true,
    children: [
      { title: 'Structuring fundamentals', kind: 'page', slug: 'core-frameworks/structuring-fundamentals' },
      { title: 'Profitability', kind: 'page', slug: 'core-frameworks/profitability', meta: { difficulty: 'easy' } },
      { title: 'Market Entry', kind: 'page', slug: 'core-frameworks/market-entry' },
      { title: 'Growth', kind: 'page', slug: 'core-frameworks/growth' },
      { 
        title: 'M&A', 
        kind: 'page', 
        slug: 'core-frameworks/m-and-a',
        children: [
          { title: 'Value & Synergies', kind: 'page', slug: 'core-frameworks/m-and-a/value-and-synergies' },
          { title: 'Due Diligence', kind: 'page', slug: 'core-frameworks/m-and-a/due-diligence' },
          { title: 'Private Equity', kind: 'page', slug: 'core-frameworks/m-and-a/private-equity' }
        ]
      },
      { title: 'Pricing', kind: 'page', slug: 'core-frameworks/pricing' },
    ],
  },
  {
    title: 'C · Toolkit',
    kind: 'section',
    icon: 'Wrench',
    children: [
      { title: 'Porter\'s Five Forces', kind: 'page', slug: 'toolkit/porters-five-forces' },
      { title: 'SWOT', kind: 'page', slug: 'toolkit/swot' },
      { title: 'PESTEL', kind: 'page', slug: 'toolkit/pestel' },
      { title: '4 P\'s', kind: 'page', slug: 'toolkit/4-ps' },
      { title: 'The 5 C\'s of Marketing', kind: 'page', slug: 'toolkit/5-cs' },
      { title: 'BCG Growth–Share Matrix', kind: 'page', slug: 'toolkit/bcg-matrix' },
      { title: 'Value Chain', kind: 'page', slug: 'toolkit/value-chain' },
      { title: 'Ansoff Matrix', kind: 'page', slug: 'toolkit/ansoff-matrix' },
      { title: 'Customer / Purchase Journey', kind: 'page', slug: 'toolkit/customer-journey' },
      { title: 'McKinsey 7S', kind: 'page', slug: 'toolkit/mckinsey-7s' },
    ],
  },
  {
    title: 'D · Cases',
    kind: 'section',
    icon: 'Briefcase',
    children: [
      {
        title: 'Profitability',
        kind: 'group',
        children: [
          { title: 'The Regional Dairy Cooperative', kind: 'page', slug: 'cases/profitability/regional-dairy-cooperative', meta: { difficulty: 'moderate' } },
          { title: 'Profitability Case 2', kind: 'page', slug: 'cases/profitability/case-2' },
          { title: 'Profitability Case 3', kind: 'page', slug: 'cases/profitability/case-3' },
          { title: 'Profitability Case 4', kind: 'page', slug: 'cases/profitability/case-4' },
          { title: 'Profitability Case 5', kind: 'page', slug: 'cases/profitability/case-5' },
          { title: 'Profitability Case 6', kind: 'page', slug: 'cases/profitability/case-6' },
          { title: 'Profitability Case 7', kind: 'page', slug: 'cases/profitability/case-7' },
          { title: 'Profitability Case 8', kind: 'page', slug: 'cases/profitability/case-8' },
        ],
      },
      {
        title: 'Market Entry',
        kind: 'group',
        children: Array.from({ length: 7 }).map((_, i) => ({ title: `Market Entry Case ${i + 1}`, kind: 'page', slug: `cases/market-entry/case-${i + 1}` })),
      },
      {
        title: 'Growth',
        kind: 'group',
        children: Array.from({ length: 6 }).map((_, i) => ({ title: `Growth Case ${i + 1}`, kind: 'page', slug: `cases/growth/case-${i + 1}` })),
      },
      {
        title: 'Pricing',
        kind: 'group',
        children: Array.from({ length: 6 }).map((_, i) => ({ title: `Pricing Case ${i + 1}`, kind: 'page', slug: `cases/pricing/case-${i + 1}` })),
      },
      {
        title: 'M&A / PE / Due Diligence',
        kind: 'group',
        children: Array.from({ length: 6 }).map((_, i) => ({ title: `M&A Case ${i + 1}`, kind: 'page', slug: `cases/ma-pe-dd/case-${i + 1}` })),
      },
      {
        title: 'Unconventional',
        kind: 'group',
        children: Array.from({ length: 4 }).map((_, i) => ({ title: `Unconventional Case ${i + 1}`, kind: 'page', slug: `cases/unconventional/case-${i + 1}` })),
      },
      {
        title: 'Signature Cases',
        kind: 'group',
        children: Array.from({ length: 5 }).map((_, i) => ({ title: `Signature Case ${i + 1}`, kind: 'page', slug: `cases/signature/case-${i + 1}` })),
      },
    ],
  },
  {
    title: 'E · Guesstimates',
    kind: 'section',
    icon: 'Calculator',
    children: [
      { title: 'Public EV charging points in a metro', kind: 'page', slug: 'guesstimates/ev-charging-points-metro', meta: { difficulty: 'moderate' } },
      ...Array.from({ length: 9 }).map((_, i) => ({ title: `Guesstimate ${i + 2}`, kind: 'page', slug: `guesstimates/guesstimate-${i + 2}` } as NavNode)),
    ],
  },
  {
    title: 'F · Industry Primers',
    kind: 'section',
    icon: 'Building2',
    children: Array.from({ length: 15 }).map((_, i) => ({ title: `Industry Primer ${i + 1}`, kind: 'page', slug: `industry-primers/primer-${i + 1}` })),
  },
];

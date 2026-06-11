import type { Page } from '@/lib/casebook/types';

export const deckSkeletonLibrary: Page = {
  slug: 'case-competitions/deck-skeleton-library',
  title: 'The Deck Skeleton Library',
  subtitle: 'The structures behind winning decks, rebuilt as templates you can fill with your own thinking.',
  kind: 'concept',
  meta: { difficulty: 'easy', readingTimeMin: 5, tags: ['case-competitions', 'deck-skeletons', 'templates'] },
  blocks: [
    { type: 'hook', md: 'After you have studied enough winning decks, a pattern emerges: the content always differs, but the **skeleton repeats** — the same slide flow, the same argument architecture, the same places where the numbers land. The library bottles exactly that.' },
    { type: 'heading', level: 2, text: 'What a skeleton is — and is not' },
    { type: 'prose', md: 'Each skeleton is an **original MECE template**: a slide-by-slide structure distilled from the patterns across hundreds of winning competition decks — exec-summary architecture, insight-slide layouts, options-kill matrices, financial-spine slides, roadmap strips. What it is *not*: anyone else\'s deck. No team\'s content, design, or work appears in the library; the structures are rebuilt from scratch in MECE\'s own template system, because structure is learnable craft — content is what *you* bring.' },
    { type: 'table', headers: ['You get', 'You bring'], rows: [
      ['The slide sequence for each round type (3-slide screener, 8–12 slide finale)', 'Your problem statement and your research'],
      ['Action-title placeholders that force pyramid-principle writing', 'The actual insight in each title'],
      ['Pre-built layout zones: chart + so-what, options matrix, financial spine', 'Your numbers, your sources'],
      ['Case-type variants: profitability, market entry, growth, marketing, ops, BFSI', 'The judgement of which to use'],
    ]},
    { type: 'callout', variant: 'insight', title: 'Why skeletons beat samples', md: 'Reading someone\'s winning deck teaches you what *they* thought. A skeleton teaches you where *your* thinking goes — and using one is honest: structure is a craft convention (every consulting firm shares one); copying content is what gets teams disqualified.' },
    { type: 'heading', level: 2, text: 'How it works' },
    { type: 'steps', ordered: true, items: [
      { title: 'Unlock once', md: 'One payment of ₹500, lifetime access — including every skeleton added later.' },
      { title: 'Filter and select', md: 'Browse by case type and round type, select any number of skeletons.' },
      { title: 'Download and build', md: 'Each file is a ready-to-edit template. Pair it with the [winning deck module](/learn/casebook/case-competitions/the-winning-deck) — the skeleton gives you the bones, that module teaches you the flesh.' },
    ]},
    { type: 'callout', variant: 'note', md: 'The library lives in your app at **[/skeletons](/skeletons)** (login required). Free users can browse this whole Case Competitions track first — the library is the accelerant, not the prerequisite.' },
    { type: 'keyTakeaways', title: 'Key takeaways', items: [
      'Skeletons are original structure templates distilled from winning-deck patterns — never anyone else\'s content or files.',
      'Structure is shared craft; content is your differentiation. The library hands you the first so you can spend every hour on the second.',
      'One ₹500 unlock, lifetime access, every future skeleton included — at /skeletons.',
    ]},
  ],
};

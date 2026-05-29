# Content Authoring Guide: The Casebook

This guide defines how new casebook pages are authored for the Consilio platform. All content is defined as statically typed TypeScript objects that conform to the `Page` interface in `lib/casebook/types.ts`.

## 1. File Structure & Registration

1. Create a new `.ts` file in the appropriate directory under `lib/casebook/content/` (e.g., `cases/market-entry/new-case.ts`).
2. Export a `Page` object.
3. Import your page in `lib/casebook/content/index.ts` and add it to the `SEED_PAGES` map.
4. Ensure the `slug` matches exactly with a slug defined in `lib/casebook/tree.ts`.

## 2. Page Meta and Structure

```typescript
import type { Page } from '@/lib/casebook/types';

export const myNewCase: Page = {
  slug: 'cases/category/my-case',
  title: 'My New Case',
  subtitle: 'A brief 1-sentence hook.',
  kind: 'case', // 'concept' | 'framework' | 'toolkit' | 'case' | 'guesstimate' | 'primer' | 'landing'
  meta: {
    difficulty: 'moderate', // 'easy' | 'moderate' | 'challenging'
    caseType: 'Market Entry',
    readingTimeMin: 10,
    tags: ['pharma', 'b2b']
  },
  blocks: [
    // Blocks go here
  ]
};
```

## 3. Allowed Blocks

Content is built by chaining blocks. Do **not** use raw HTML.

- **`prose`**: Standard paragraphs. Supports inline markdown: `**bold**`, `*italic*`, `` `code` ``, `[link](url)`.
- **`heading`**: `level: 2 | 3`. Can include an `anchor` for the Table of Contents.
- **`callout`**: `variant: 'tip' | 'insight' | 'warning' | 'pitfall' | 'note'`.
- **`keyTakeaways`**: An array of bullet points, usually placed at the end of a framework or case.
- **`steps`**: `ordered: boolean`. Rendered as numbered or bulleted lists with optional bold titles.
- **`diagram`**: Renders an SVG from the registry. `ref: string` must match a key in `components/casebook/diagram-registry.ts`.
- **`table`**: Renders a clean data table.
- **`mathBox`**: Monospaced container for calculations and formulas.
- **`quote`**: Large pull quotes.
- **`reveal`**: An interactive accordion. Great for hiding the "Answer" or "Synthesis" until the user has thought about the prompt.
- **`columns`**: A 2-column grid. Pass an array of arrays of blocks.
- **`caseSection`**: Only for `kind: 'case'`. Groups blocks under standard MBB case headings (`prompt`, `clarifying`, `structure`, etc.) with semantic icons.
- **`divider`**: A horizontal rule.

## 4. Tone & Style Guidelines

- **Consulting-deck precise**: Write with extreme clarity. Remove filler words.
- **No Plagiarism**: Do not lift text directly from existing MBA casebooks.
- **Action-Oriented**: Focus on the *why* and the *so what*, not just academic definitions.

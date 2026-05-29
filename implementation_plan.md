# Phase 1 Build Plan: "The Casebook" Reader

Based on the `ANTIGRAVITY_BUILD_PROMPT_casebook-reader.md` requirements, I have successfully executed **Steps 1-3** (Content Schema, Navigation Tree, Content Registry).

### Findings from §0 (Orient First):
- **Exact Token Class Names (from globals.css/tailwind.config.js):** 
  - Utilities: `.text-micro`, `.text-small`, `.text-body`, `.text-strong`, `.text-h3`, `.text-h2`, `.text-h1`
  - Colors: `--background`, `--foreground`, `--card`, `--navy`, `--primary`, `--secondary`, `--muted`, `--accent`, `--success`, `--warning`, `--destructive`, `--border`, `--border-strong`
  - Special classes: `.badge-pill`, `.badge-pill-red`, `.ui-card`, `.ui-card-floating`, `.btn-primary`, `.btn-ghost`, `.data-table`, `.stagger`, `.animate-diagram`
- **Shadcn Primitives Present:** `collapsible`, `scroll-area`, `sheet`, `badge`, `separator`, `tooltip`, `breadcrumb`, `command`, `button`, `dialog`
- **Existing Diagram Export Names (from framework-diagrams.tsx):** `MECEDiagram`, `ProfitabilityTree`, `IssueTree`, `HypothesisDriven`, `MintoPyramid`

### Current Status (Steps 1-3 Completed):
Setup clean, types lock in, slug list:
- `getting-started/what-it-tests`, `getting-started/six-case-types`, `getting-started/repeatable-method`, `getting-started/math-under-pressure`, `getting-started/common-mistakes`
- `core-frameworks/structuring-fundamentals`, `core-frameworks/profitability`, `core-frameworks/market-entry`, `core-frameworks/growth`, `core-frameworks/pricing`, `core-frameworks/ma-pe-due-diligence`
- `toolkit/porters-five-forces`, `toolkit/swot`, `toolkit/pestel`, `toolkit/4-ps`, `toolkit/bcg-matrix`, `toolkit/value-chain`, `toolkit/ansoff-matrix`, `toolkit/customer-journey`, `toolkit/mckinsey-7s`
- `cases/profitability/regional-dairy-cooperative`, `cases/profitability/case-2` (to 8)
- `cases/market-entry/case-1` (to 7), `cases/growth/case-1` (to 6), `cases/pricing/case-1` (to 6), `cases/ma-pe/case-1` (to 6), `cases/unconventional/case-1` (to 4), `cases/signature/case-1` (to 5)
- `guesstimates/ev-charging-points-metro`, `guesstimates/guesstimate-2` (to 10)
- `industry-primers/primer-1` (to 15)

## Proposed Changes (Steps 4-10)

### 1. Block Renderer + Components (Step 4)
- **`components/casebook/block-renderer.tsx`**: Main switch for rendering blocks based on type.
- **`components/casebook/blocks/*`**: Implement `prose.tsx`, `callout.tsx`, `key-takeaways.tsx`, `steps.tsx`, `diagram-frame.tsx`, `data-table.tsx`, `math-box.tsx`, `quote.tsx`, `reveal.tsx` (with TierGate), `columns.tsx`, `case-section.tsx`, `divider.tsx`.

### 2. Diagram Components + Registry (Step 5)
- **`components/casebook/diagrams/`**: Add new SVG `ProfitabilityDriverTree`. Add stubs for `MarketEntryFramework`, `PricingLadder`, `GrowthEngine`, `MnAScreen`, `PorterFiveForces`, `ValueChain`, `BCGMatrix`.
- **`components/casebook/diagram-registry.ts`**: Map `ref` strings to diagram components.

### 3. Navigation Tree Component (Step 6)
- **`components/casebook/nav-tree.tsx`**: Recursive tree using `Collapsible` and `ScrollArea`.
- **`components/casebook/nav-tree-item.tsx`**: Page link with active state, difficulty dots, and locks.
- **`components/casebook/casebook-search.tsx`**: Client-side filtering.

### 4. Reader Shell (Step 7)
- **`components/casebook/casebook-reader.tsx`**: The 3-column layout grid.
- **`components/casebook/breadcrumbs.tsx`**: Top breadcrumbs.
- **`components/casebook/on-this-page.tsx`**: Right-rail Table of Contents with Scroll-spy.
- **`components/casebook/prev-next.tsx`**: Footer navigation cards.
- **`components/casebook/page-meta-bar.tsx`**: Badges for difficulty, read time, tags.

### 5. Routing & Integration (Step 8)
- **`app/(app)/learn/casebook/[[...slug]]/page.tsx`**: Catch-all dynamic route. Implement `generateStaticParams()` using `ALL_PAGE_SLUGS`. Implement `getPage(slug)`.
- **`app/(app)/learn/page.tsx`**: Add the flagship hero card pointing to `/learn/casebook`.

### 6. Polish & Handoff (Step 9-10)
- Ensure responsive design, accessibility landmarks, skeleton loaders, and dark mode consistency.
- Write `lib/casebook/CONTENT_AUTHORING.md`.

## User Review Required
I have completed Steps 1-3. Please confirm if you approve of this plan to proceed with building the components and integrating the routing (Steps 4-10).

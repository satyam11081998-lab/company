# MECE Casebook Design Contract

This document acts as a permanent design contract for the Casebook Reader. Any future layout or styling changes to casebook pages must inherit these layouts and styles automatically to prevent design drift. Any changes violating this contract require an explicit, documented revision of this file.

---

## SECTION A — Layout (3-Column Reader Shell)

- **Responsive Grid:** The outer reader shell runs a 3-column grid layout on extra-large viewports (`xl` $\ge 1280\text{px}$), a 2-column grid layout on large viewports (`lg`), and a single column + collapsible navigation Sheet drawer on smaller screens (`< lg`).
- **Left Navigation Column:** 
  - Width: Fixed at exactly `280px` (`grid-cols-[280px_...]`).
  - Alignment: Flush against the left boundary of the screen viewport (no outer container margins or padding on the left, `w-full` container width with no centering `mx-auto`).
  - Sticky Behavior: Positioned as `sticky`, with a top offset of `16` (`top-16` or `~80px` to clear the global app header). It occupies the remaining viewport height (`h-[calc(100vh-4rem)]`), with internal vertical scroll containment via `overflow-y: auto`.
- **Right Rail (Table of Contents):**
  - Width: Fixed at exactly `220px` on `xl` viewports.
  - Sticky Behavior: Same sticky offset and scrolling behavior as the left navigation column.
  - Padding: Sits flush with right padding `pr-0`, utilizing the parent grid's 32px padding for outer alignment.
- **Center Reading Column:**
  - Width: Takes `xl:max-w-none w-full` to dynamically stretch and fill 100% of the remaining screen width inside the middle grid column.
  - Alignment: Left-aligned within its grid cell (no `mx-auto`).
  - Left Margins: `ml-8` on large screens (`lg`), and `ml-16` (64px) on extra-large screens (`xl`).
- **Horizontal Column Gaps (xl viewports):**
  - Left Gap (between left nav and middle column): Exactly `96px` ($32\text{px}$ container padding-left + $64\text{px}$ article margin-left).
  - Right Gap (between middle column and right rail): Exactly `120px` ($32\text{px}$ container padding-right + $88\text{px}$ article margin-right).
- **Rightmost Edge Margin:** Exactly `32px` of spacing on the far right of the viewport (implemented via `xl:pr-8` on the outer grid container). The middle column absorbs all width reduction, keeping the rails at their fixed widths.
- **Scroll Container:** The window/documentElement scrolls naturally. The center reading pane column itself must NOT have an `overflow` setting (no scrollbars on the center column). Any ancestor with `overflow: hidden`, `overflow: auto`, or `overflow: scroll` between the sticky columns and `<html>` is strictly **FORBIDDEN** as it breaks `position: sticky`.

---

## SECTION B — Typography

- **Font Family:** The default typography across the reader is Inter, loaded via Tailwind CSS class variables (`--font-inter`).
- **Type Scale:** Ad-hoc custom font size utilities are prohibited. All text styles must strictly inherit the classes declared in `globals.css`:
  - Page Title: `.text-h1`
  - Section Titles: `.text-h2`
  - Subsection Titles: `.text-h3`
  - Sub-items / Strong Text: `.text-strong`
  - Body Text: `.text-body`
  - Meta/TOC elements: `.text-small`
  - Labels/Tags: `.text-micro` or `.text-label`
- **Headings legibility:** Heading levels H1, H2, and H3 must render in full-strength `text-foreground` across both light and dark modes. Opacity adjustments (`opacity-90`, `text-foreground/80`, etc.) or muted variants are **FORBIDDEN** on heading text. Structural hierarchy is carried by size and weight differences, not color.
- **Prose paragraphs:** Prose paragraphs rendered inside the reading pane must be left-aligned with a ragged-right edge. **NEVER** justify reading prose text (`text-justify` is forbidden).
- **Line Height:** Line heights are governed by the `.text-body` class definitions (e.g. `leading-relaxed` or `line-height: 1.55`).
- **Subtitle:** Subtitles below the main page H1 title must utilize the `text-muted-foreground` semantic color token, not opacity filters.
- **Meta Bar Chips:** Badges inside the page meta bar must inherit formatting from the `.badge-pill` class in `globals.css`.

---

## SECTION C — Colors and Accents

- **Semantic Tokens:** All colors must be mapped to system semantic variables (`--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--card`, `--border`, `--success`, `--warning`, `--destructive`). Raw hex, RGB, or custom static color styling are prohibited.
- **Cardinal Red Accent (`--primary`):** The system primary accent is reserved exclusively for:
  - Active navigation indicator in the left menu tree.
  - Active section link indicator in the right rail.
  - Callout tint styling (in background fill only).
  - Main brand mark / logo.
  - Heading keyword emphasis span tags (described in Section E).
- **Progress Scales:** Gradients using multiple colors (e.g., green-yellow-red) for progress or intensity indicators are prohibited. Visual scales must use monochromatic variants of the primary color (`--primary` / primary-light tinting).
- **Grid Layout Uniformity:** Any multi-column subcomponents must divide content into equal-width columns.

---

## SECTION D — Left-Accent Borders

- **Left-accent decorative borders** are **FORBIDDEN** on any standard content block cards, callout boxes, drills, comparison tables, or key takeaways containers. Components must be distinguished solely by background fill tint, layout, custom icons, and labels.
- **Explicit Exceptions:** A left-accent solid border line is permitted only in the following three scenarios:
  1. Active page indicator bar in the left navigation tree (2px primary-colored bar).
  2. Active scroll section indicator bar in the right rail (thin primary-colored marker).
  3. Typography `<blockquote>` element (canonical 2px muted pull-quote rule).

---

## SECTION E — Heading Keyword Emphasis

- **Selective Highlight:** Headings (`h2`/`h3`) inside the casebook are allowed to emphasize a single key load-bearing concept by rendering it in the primary accent color.
  * Example: "The **six habits** of strong Move 3" -> "six habits" is styled in `text-primary`.
- **Implementation:** The heading schema supports an optional `emphasize` string property:
  ```typescript
  { type: 'heading'; level: 2 | 3; text: string; anchor?: string; emphasize?: string }
  ```
  The renderer scans the `text` for the first occurrence of the `emphasize` substring (case-insensitively), wraps it in `<span className="text-primary">`, and displays it dynamically.
- **Constraints:** At most **one** emphasized phrase is allowed per heading block. Auto-highlighting keyword filters are strictly forbidden; keyword selection must be manually authored in the content page data tree.

---

## SECTION F — Scroll Behavior

- **Global Scroll:** The entire document/window acts as the single scrolling viewport. No internal container (besides sticky components scroll-y behavior) may scroll.
- **Smooth Scroll:** Enabled globally via `scroll-behavior: smooth` on the `html` element inside `app/globals.css`.
- **Heading Offsets:** Every H2 and H3 block inside the reading article pane must have `scroll-mt-[80px]` (or `scroll-margin-top: 80px`) classes.
- **Case Section Offsets:** All Case Sections must declare `scroll-mt-[80px]` on their container element to ensure jumping to anchors aligns correctly below the global navigation bar.
- **IntersectionObserver Setup:** The scroll-spy observer inside `OnThisPage` must utilize `root: null` (viewport) and a `rootMargin: "-80px 0px -70% 0px"` configuration.

---

## SECTION G — Hoisted Elements (Hook & Key Takeaways)

- **Auto-Hoisting:**
  - **Hook:** If a `hook` block exists, its first occurrence is automatically hoisted to the very top of the content area.
  - **Key Takeaways (TL;DR):** If a `keyTakeaways` block exists, its last instance is automatically hoisted to render immediately after the `hook` (or at the top if no `hook` exists).
- **Hook Layout:** The `hook` acts as a magazine-style "standfirst" lead paragraph.
  - Must use `text-xl text-foreground text-left leading-relaxed` typography.
  - Must have no borders, backgrounds, or card styling.
  - Supports the `emphasize` substring property to highlight key phrases in primary color.
  - Must include an `mb-8` bottom margin to space it perfectly from subsequent blocks (such as the Key Takeaways).
- **Hero Takeaways Layout:** The hoisted hero takeaway card must conform to this visual signature:
  - Header: An uppercase text label "TL;DR · KEY TAKEAWAYS" (no sparkles icon, text color is neutral `text-foreground`).
  - Bullet Points: Bullet indicators render in primary color (`--primary` tint), but the card background remains standard `--card` fill (no red/primary background tints).
  - Table of Contents: The right rail includes a static "Key Takeaways" link pinned at index 0 targeting `#key-takeaways`.
- **Inline Takeaways:** Non-hero key takeaways blocks placed later in pages keep their original default styling (sparkles icon, primary-colored card headers, primary-tinted backgrounds).

---

## SECTION H — Block Components Catalog

The following blocks constitute the entire layout engine for authored Casebook content:

| Block Type | Visual Signature | Description |
| :--- | :--- | :--- |
| `hook` | Magazine-style standfirst paragraph (`text-xl`, full contrast). No borders or background. | Editorial intro at the very top of the page. |
| `prose` | Left-aligned body paragraph. No border. | Standard reading text paragraphs. |
| `heading` | Full-strength H2/H3 (`text-foreground`). Supports 1 `emphasize` highlight. | Section breaks. |
| `callout` | Clean background card. Distinct icon. Standard borders (no left-accent). | 5 semantic variants (`tip`, `insight`, `warning`, `pitfall`, `note`). |
| `keyTakeaways` | List of items. Hero: neutral card. Inline: primary-tinted card. | Crucial learning points. |
| `steps` | Rounded number circles/pills. | Sequential lists or process paths. |
| `diagram` | SVG container with interactive zoom/scroll frameworks. | Analytical maps/trees. |
| `table` | Alternating rows. Simple borders. | Tabular structured raw data. |
| `mathBox` | Code block typography inside clean cards. | Equations, formulas, and numeric models. |
| `quote` | Typographic blockquote format with a left 2px gray border. | Expert quotes and citations. |
| `reveal` | Clean collapsible accordion boxes. | Interactive answer panels. |
| `columns` | Equal-width multi-column layouts. | Side-by-side block groups. |
| `caseSection` | Semantic Case segment blocks with custom header icons. | Standard case steps (Prompt, Clarifying, Structure, Analysis). |
| `divider` | Thin horizontal line. | Visual section breakers. |
| `dialogue` | Two-column script/transcript formats. | Interview simulations. |
| `drill` | Interactive question lists with single reveal buttons. | Skill assessment exercises. |
| `comparison` | Multi-column pros/cons comparative grids. | Framework evaluation grids. |

---

## SECTION I — Future-Page Acceptance Criteria

Any new page or content update added to the MECE Casebook must satisfy the following checklist before merging:

- [ ] **Contrast:** All page headings are fully readable in both light and dark modes (at full strength, no opacity reductions).
- [ ] **Text Alignment:** All prose paragraphs are ragged-right, left-aligned (`text-justify` is absent).
- [ ] **Card Accents:** No left-accent borders exist on any component cards, callouts, or drills.
- [ ] **Keyword Highlights:** Heading keyword highlights (`emphasize`) are used selectively and focus only on central concepts.
- [ ] **TOC Scroll-Spy:** Real-time right rail highlight updates correctly as headings cross the viewport threshold.
- [ ] **Click to Jump:** All table of contents links scroll smooth-scroll targeting correct IDs.
- [ ] **Viewport Check:** Page layout renders cleanly on standard viewports (390px mobile, 1100px tablet, 1440px desktop).
- [ ] **Compiler Integrity:** `npx tsc --noEmit` runs clean with no strict typing errors.
- [ ] **Build Pipeline:** `npm run build` succeeds, generating the expected number of static routes.

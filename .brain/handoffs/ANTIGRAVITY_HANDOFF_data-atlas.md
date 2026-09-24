# ANTIGRAVITY_HANDOFF_data-atlas

**Feature:** Guesstimate Data Cheatsheet → **India Data Atlas**, twelve chart-led slides
**Branch:** main (worked directly, per owner instruction "implement")
**Revision:** 2 — 2026-09-24 (rev 1, 2026-09-23, was the sourced-data rebuild; rev 2 is the visual redesign)

---

## touches

**New**
- `lib/casebook/atlas-types.ts` — types only, its own module on purpose
- `lib/casebook/content/guesstimates/atlas-core.ts` — sections 1–4, numbers
- `lib/casebook/content/guesstimates/atlas-systems.ts` — sections 5–12, numbers
- `lib/casebook/content/guesstimates/atlas-visuals.ts` — **the charts + source chips + dedupe map, keyed by section id**
- `lib/casebook/content/guesstimates/atlas-data.ts` — the merge
- `components/casebook/blocks/data-atlas.tsx` — the client block, ten chart renderers

**Modified**
- `lib/casebook/types.ts` — one new `Block` variant: `{ type: 'dataAtlas'; atlas: AtlasData }`
- `components/casebook/block-renderer.tsx` — import + one `case`
- `lib/casebook/content/guesstimates/data-cheatsheet.ts` — rewritten

**Untouched:** `tree.ts`, `content/index.ts` — slug unchanged, so nav, sitemap, canonicals and JSON-LD keep working with no edit.

## breaking

**no.** The `Block` union is additive. `AtlasData` enters `types.ts` as a **type-only** import from a module holding no data. No `.brain/CONTRACTS.md` surface is touched — presentation and content only; no API, no DB, no backend.

---

## Why rev 2 exists

Rev 1 was right on substance and wrong on form: correct, sourced numbers presented as stacked cards, each carrying label + value + detail paragraph + "use it for" + cross-check + source line. Seventy-seven of those is a wall of text. The owner's note was "very very boring, text heavy… make it like case comp slides."

Rev 2 keeps every number and every citation and changes where they live:

| | rev 1 | rev 2 |
|---|---|---|
| Shape | one long scroll of cards | **12 slides**, each chart-led |
| Per slide | cards only | header + source chips → hero tiles → charts → chip strip → **"So what"** footer |
| Prose | on the surface, always | behind *Show source and detail*, and in search results |
| Charts | 5 kinds | **10**: funnel, waffle, meter-with-threshold, dumbbell, stack, bars-with-reference, ratio, equation, ladder, tiles |
| Duplication | — | a number shown by a chart is **suppressed** from the chip strip (`covers` in atlas-visuals.ts) |

Nothing was dropped from the search index: all 77 remain searchable with full detail.

## How it was actually verified

Not by eyeballing markup. The component was **server-rendered with react-dom/server, bundled with esbuild, styled with the repo's real `globals.css` compiled through the repo's real `tailwind.config.js`, and screenshotted in Chromium** at 1240px and 390px, light and dark. Every defect below was found that way and is fixed.

1. **Waffle on categorical hues.** Age bands are an *ordered* scale; they were taking `--viz-1/2/3`, which made 69% of the chart brand red and read as an alarm state. Now the sequential ramp.
2. **Dumbbell label collisions.** Value labels sat on top of the 16px dots. Values moved to a fixed right-hand column — collision is now structurally impossible.
3. **Dumbbell axis lied.** Marks were positioned on a 0–100 domain under ticks reading 0–60. The axis is now printed from the same `max` the marks are scaled on.
4. **Bars unusable on a phone.** A three-column grid left ~90px of track at 390px and every bar came out the same length. All bars are now label+value **above** a full-width track.
5. **Sticky toolbar was 460px tall on mobile** — over half the viewport, permanently. Now `sm:sticky` only, with horizontally scrollable chip rows: 200px, and it scrolls away on a phone.
6. **Red meant two things on one slide** (emphasis in the funnel, "outlier" in tele-density). `--primary` is now reserved for emphasis, one mark per chart.
7. **Every number appeared twice** on most slides — once in a chart, once in the chip strip. Fixed with `covers`.
8. **A subtraction rendered as a multiplication**: births `×` deaths. Equations now carry an `op`.
9. **Mixed units on one axis.** The per-person rates (135 L, 3.8 kWh, 0.66 kg) were one bar chart. They are tiles now — that chart was lying about the comparison.
10. **Hero tiles** wrapped three lines of citation under the number; sources are truncated to the first clause with the full text on hover.
11. **`43%` printed beside `17.9%`.** Both dumbbell ends now use the same precision, and `₹` survives into the value column.
12. **My own copy said "two of these close, three do not."** Three close, two do not.

## Chart rules the code enforces

- **One axis of meaning.** No dual-axis anywhere. Mixed units are tiles, never bars.
- **Categorical hues** (`--viz-1..5`) only for true identities — jobs vs output — in fixed order, never cycled. Max three on screen at once.
- **Ordered things** (age bands, funnel stages, nested city definitions, powers of ten) take `--viz-seq-*`.
- **`--primary` = emphasis**, one mark per chart.
- **No text on a chart fill.** The ramps invert between themes, so a white-on-fill label fails contrast in one theme whichever way you pick. Every value sits outside its mark on a foreground token.
- 2px surface gaps between stacked segments rather than borders; hairline `--viz-grid` axes; legend whenever there are two series; no in-bar labels; no pies.
- Palette checked with the dataviz validator: **all six checks pass in both light and dark** (worst adjacent CVD ΔE 8.8 protan, normal-vision 18.7).
- No accent rails on cards; no `ch` width clamps; no dashed gridlines.

## Gates run

- `npx tsc --noEmit` on the device — **clean, exit 0**, whole project.
- `tsc --strict` in an isolated container against the atlas sources — clean. **This is what caught the stale `visual: {...}` blocks left in the two data files** (old `unitNote` / `pyramid` / `chain` shapes) after the chart definitions moved to `atlas-visuals.ts`; the device run was timing out at the time. Those 7 blocks are removed and the legacy `visual?` field is gone from the type.
- Server-rendered + screenshotted at 1240/390 px, light and dark — see above.
- `npx next build` still cannot complete in the agent shell (mounted-FS slowness, pre-existing). **Run `npm run build` locally before pushing.**

## Notes for the next editor

- `atlas-visuals.ts` holds the charts *and* `covers` — the datum ids a chart already shows. Add a chart, add its ids to `covers`, or the number will appear twice.
- The toolbar offset is `sm:top-24`, matching the reader shell's own sticky sidebar (`casebook-reader.tsx:50`). Slides use `scroll-mt-[112px]`. Change both together.
- `seqAt(i, n)` spreads bands across the sequential ramp so a 3-stage and a 5-stage chart both read as ordered. Do not hand-pick ramp steps.
- If you add a chart kind, add it to the `AtlasVisual` union, the `Visual` switch, and screenshot it in **dark** before you ship — that is where this design breaks.

## Next

- `npm run build` locally, then eyeball both themes at 375px and 1440px.
- `git push` + `node .brain\sync.mjs`.
- Optional follow-up: the same block could carry the Industry Primers' sector numbers, which currently repeat page by page.

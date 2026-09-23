# ANTIGRAVITY_HANDOFF_data-atlas

**Feature:** Guesstimate Data Cheatsheet → searchable, sourced **India Data Atlas**
**Branch:** main (worked directly, per owner instruction "implement")
**Date:** 2026-09-23

---

## touches

**New**
- `lib/casebook/atlas-types.ts` — types only, deliberately its own module
- `lib/casebook/content/guesstimates/atlas-core.ts` — sections 1–4 (anchors, people, money, work)
- `lib/casebook/content/guesstimates/atlas-systems.ts` — sections 5–12 (economy, digital, mobility, per-person, denominators, arithmetic, defaults, cross-checks)
- `lib/casebook/content/guesstimates/atlas-data.ts` — 19-line combiner
- `components/casebook/blocks/data-atlas.tsx` — the client block

**Modified**
- `lib/casebook/types.ts` — one new `Block` variant: `{ type: 'dataAtlas'; atlas: AtlasData }`
- `components/casebook/block-renderer.tsx` — import + one `case`
- `lib/casebook/content/guesstimates/data-cheatsheet.ts` — rewritten

**Untouched:** `tree.ts`, `content/index.ts` — the slug (`guesstimates/data-cheatsheet`) is unchanged, so nav, sitemap, canonical URLs and JSON-LD all keep working with no edit.

## breaking

**no.** The `Block` union is additive. `AtlasData` enters `types.ts` as a **type-only** import from a 113-line module holding no data, so nothing that imports `Block` pulls the dataset into its bundle. No contract surface in `.brain/CONTRACTS.md` is touched — this is presentation + content only, no API, no DB, no backend.

---

## Why it was rebuilt rather than patched

The old page was four hand-written SVG blocks and three tables: roughly 25 round numbers, one blanket sourcing note, no search. Verification against primary sources in Sep 2026 found several had drifted far enough to be wrong in a room:

| Was | Now | Source |
|---|---|---|
| Population 1.46 bn | **1.48 bn** (1,476.63 mn) | UN WPP 2024 rev. |
| GDP ₹340 lakh cr | **₹346.36 lakh cr** | MoSPI PE FY2025-26 |
| Workforce "~430 mn employed" | **~645 mn** | PLFS 2025 WPR × 15+ pop |
| Agriculture 45% of jobs | **43.0%** | PLFS 2025 |
| Industry 25% of GVA | **27.1%** | MoSPI NAS 2024-25 |
| Internet ~900 mn | **1,073 mn broadband** | TRAI Apr-2026 |
| UPI ~700 mn/day | **791 mn/day** (Aug-26); FY avg 660 mn | NPCI |
| Two-wheelers ~300 mn | **~260 mn** | MoRTH AR 2025-26 |
| Electricity ~1,300 kWh | **1,395 kWh** | CEA FY2023-24 |
| Milk ~440 g/day | **471 g/day** | DAHD 2023-24 |
| MSW ~0.45 kg/day | **~0.35 kg/day urban** | CPCB (1.70 lakh TPD) |
| Urban ~35% | **36.9%** | World Bank 2024 |
| Literacy ~78% | **80.9%** | PLFS 2023-24 |

Also removed: the income-pyramid band table, which was an unsourced industry construct. Replaced with household spend derived openly from HCES 2023-24 MPCE — a measured number, and a much sharper one.

## What makes it worth paying for

1. **Every one of 77 numbers carries `asOf` + `source` + a grade** (Counted / Official estimate / Our arithmetic / Trade estimate). Grade is a filter chip as well as a badge. No other free cheat sheet admits which of its numbers were never actually counted.
2. **Search.** 77 numbers is past scrolling. Box + `/` shortcut + Esc, match highlighting, live count, jump chips per section.
3. **The aha is the cross-check, not the list.** Big numbers carry a `crossCheck` partner, and the sheet closes on five multiplication chains built from numbers on the page and tested against an independent figure — two-wheeler stock from sales closes to within 1%. That is the transferable skill; the numbers are just the worked example.
4. **Vintage honesty as a selling point.** The last full census was 2011. Saying so, and saying which numbers are estimated forward from it, is itself an interview answer.

## Gates run

- `npx tsc --noEmit` — **clean**, whole project, run after every edit including the three self-audit corrections.
- lucide-react icon exports (`Search, X, CornerDownRight, Check, AlertTriangle`) — all resolve.
- Design tokens checked against `app/globals.css` `:root` **and** `.dark`. All `tag-*`, `ui-card`, `text-*`, `font-mono-data`, `--viz-*`, `--success-soft`, `--warning-soft`, `--accent-foreground` exist in both themes.
- No `border-l-` accent rails; no `ch` width clamps. Verified by grep.
- **`npx next build` and `next dev` could not complete** in the agent shell — the mounted filesystem makes both exceed the 180 s per-call ceiling (dev never reaches "Ready"; this is the same pre-existing constraint seen on earlier features, not a regression). **Run `npm run build` locally before pushing.**

## Adversarial notes (things deliberately done, do not "fix" them)

- **No text sits on a chart fill.** `--viz-*` and `--viz-seq-*` invert between themes: a fill that is dark navy in light mode is pale blue in dark mode, so white-on-fill labels fail contrast in one theme whichever way you pick. Every number lives outside its bar on a normal foreground token. The first draft had labels inside the bars; that was the bug.
- **Sticky toolbar is `top-24`**, matching the reader shell's own sticky sidebar (`components/casebook/casebook-reader.tsx:50`). Section anchors use `scroll-mt-[112px]` to clear it. If the header height changes, change both.
- Three arithmetic errors in my own copy were caught on re-audit and fixed: agriculture productivity stated as "a third" of the national average when 17.9 ÷ 43.0 = 40%; two-wheelers per 1,000 quoted at the source's 190 when the same source's 260 mn implies ~185 (both now stated, with the discrepancy named); and a waste cross-check that compared a city against the *total* population when CPCB's 1.70 lakh TPD is urban-only.
- Search needs ≥2 characters before filtering, so a single keystroke does not blank the page.
- The block is client-side; `block-renderer.tsx` stays a server component. Same boundary pattern as `Drill` and `Reveal`.

## Next

- Run `npm run build` locally; confirm the route still pre-renders under `generateStaticParams`.
- Eyeball the page in **both** themes at 375 px and 1440 px.
- `git push` + `node .brain\sync.mjs`.
- Optional follow-up: the same atlas block could carry sector numbers for the Industry Primers, which currently repeat figures page by page.

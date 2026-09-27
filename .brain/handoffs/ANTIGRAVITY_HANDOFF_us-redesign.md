# ANTIGRAVITY_HANDOFF — us-redesign (premium US / Europe experience)

**Author:** Claude brain (cloud session), 2026-09-26. **Feature:** NEW — `us-redesign` (LEDGER row proposed in §8).
**Branch:** `feat/us-redesign`, frontend (`consilio`) only. Cut from `main` after the us-launch merge (c71c7f2). Pushed as a branch so Vercel builds a preview; merging to `main` is the owner's call after checking the preview.
**Depends on:** `us-launch` (markets, `/us` routes, US case bank, intl pricing, admin US preview). Nothing here works without it; nothing in it changes it.
**Type:** presentation. No backend, no DB, no migration, no env var, no new dependency.

```
touches:  frontend  NEW  app/us/layout.tsx (Lora display serif, scoped; viewport maxScale 5 for /us only),
                         app/us/_fonts/lora-{regular,italic}.woff2 (~20 KB each, Latin subset, OFL),
                         components/us/** (ui, art, theme-button, use-us-entry, guest-leaderboard,
                           marketing/{us-header,us-footer,sections,dashboard-preview,start-button,start-case-button},
                           dashboard/{us-dashboard-page,us-dashboard,modules,skill-map,format},
                           shell/{us-app-shell,display-font}),
                         lib/us-market/{assets,dashboard,labels}.ts
                    MOD  app/us/{page,pricing/page,case-interview-examples/page,market-sizing-questions/page}.tsx
                         components/intl/{intl-plan-cards,intl-pricing-section}.tsx (US-only components)
                         lib/us-market/index.ts (US_CASE_TYPE_LABEL moved to labels.ts, re-exported — same value)
                         SHARED, India-inert (see §4): app/(app)/layout.tsx, app/(app)/dashboard/page.tsx,
                         app/(app)/practice/page.tsx, app/(app)/leaderboard/page.tsx, components/practice-hub.tsx,
                         components/guest/login-to-continue-overlay.tsx, components/mobile-desktop-banner.tsx,
                         app/globals.css (+1 rule scoped to .us-scope), tailwind.config.js (+fontFamily.display)
                    DEL  components/intl/us-site-header.tsx (replaced by components/us/marketing/us-header.tsx)
breaking: no. No CONTRACTS.md surface touched (C1–C9 unchanged: no schema, route, scoring, quota or
          storage change). All shared-component changes are opt-in props whose defaults reproduce
          today's India output (verified pixel-identical, §6).
affects:  Landing/SEO (/us pages only), Dashboard (US branch only), Practice (US branch only),
          Guest mode (US cold start + US guest chrome), Leaderboard (US guest page only).
          India: nothing.
```

---

## 1. Owner decisions carried into this branch

- **US experience only.** India landing, dashboard, shell, pricing, practice and leaderboard are untouched in output.
- **No Learn / GD / Primers / Cheat Sheets / Case Competitions for US** (owner decision 2026-09-25, still blocked server-side for intl accounts). The US nav, sidebar and footer only link surfaces a US account can open.
- **Real photography, no logos.** Photos are Unsplash (free license, hotlinked from images.unsplash.com, credited in the footer). Firm names appear once, as text, in an "interview styles" line with an explicit not-affiliated disclaimer. **No firm or university logos** (trademark / implied endorsement).
- **No fabricated social proof or data.** No testimonials, user counts, star ratings or invented standings. The landing's product preview is labelled as sample data; the US guest leaderboard shows no illustrative rankings (India's teaser still does — unchanged).
- **Type:** Inter for UI; Lora (one editorial serif) for large headlines only, loaded only on /us routes and the US app shell (`preload: false` there). **Radii:** controls 6–8px, modules 10–14px, imagery 12–16px, written as explicit `rounded-[Npx]` because the repo's Tailwind radius scale is non-standard (DEFAULT 12, sm 8, md 14, lg 16, xl 20).
- **No emojis.** Icons are lucide + custom SVG glyphs in `components/us/art.tsx`.

## 2. What a US visitor / account now sees

| Route | Who | What |
|---|---|---|
| `/us` | everyone | New landing: hero ("Master business thinking." + serif italic "Prepare like a consultant."), capability strip, audience line, three practice modes (case / market sizing / interviewer) with real bank examples, the MECE method worked example (`#method`), product showcase with numbered callouts, how scoring works (`#how-scoring-works`), principle band, pricing, FAQ (`#faq`), final navy CTA, footer |
| `/us/pricing`, `/us/case-interview-examples`, `/us/market-sizing-questions` | everyone | Same header/footer, editorial serif H1s, divided lists, compact FAQ. Metadata + JSON-LD unchanged in substance |
| `/dashboard` | US/EU account (incl. anonymous guest) | New dashboard from the account's own rows: greeting, today's case (industry photo) + today's market sizing, 7-day streak, continue in-progress sessions, next best action (only after 3 scored sessions, from real averages), plan status, progress metrics, practice by week, average by case type, skill map, recent activity |
| `/dashboard` | logged-out, US/EU region | Single "Start practicing" action (mints the guest session on click), US copy |
| `/practice` | US/EU | Editorial header; same PracticeHub with US vocabulary ("Cases", "Market sizing"), 12px cards, neutral type labels; tab follows the sidebar's `?tab=`; top-bar search lands as `?q=` |
| `/leaderboard` | logged-out, US/EU region | Honest sign-in page, no sample standings |
| every `(app)` route | US/EU account, or admin in US preview | New shell: 64px top bar (search, plan chip, theme, account menu), 232px sidebar (Daily / Practice / Progress / Account), phone bottom tabs (Home, Practice, Progress, Ranks). `/cases/*` keeps the full-width workspace (no sidebar/tabs) |
| `/dashboard`, `/practice`, `/cases/*`, `/leaderboard` | logged-out, US/EU region | US marketing header + footer instead of the India guest chrome |

## 3. Phased build steps (Antigravity) — ORDER MATTERS

### Phase 0 — Sync
`git pull` on `main` in `D:\dev\mece\consilio`. Confirm `main` contains the us-launch merge (`git log --oneline -5` shows c71c7f2 or later).

### Phase 1 — Apply on the branch (the owner's script does this)
`apply-us-redesign.ps1` creates `feat/us-redesign` from `main`, applies `us-redesign.patch` (3-way), commits, and pushes **the branch only**. It never touches `main`, `.brain/STATE.md`, `.env*`, or `yarn.lock`.

**Gates (run in the repo after applying, before push):**
- `npx tsc --noEmit` → clean
- `npx next build` → clean (lint is skipped by `next.config.js` `ignoreDuringBuilds`)
- `node scripts/test-intl.mjs` → 46 checks passed
- `node scripts/gen-us-seed.mjs` → then `git diff --exit-code supabase/seed-us-market.sql` → no diff (labels.ts refactor must not change the seed)
- No SQL in this branch → no idempotency gate.

### Phase 2 — Vercel preview QA (real browser — photos only load outside the sandbox)
On the preview URL:
1. `/us` at 390 / 768 / 1280 / 1920, light + dark: every photo loads (hero, band, industry images on the dashboard), no horizontal scroll, header nav underline follows the page.
2. "Start practicing free" as a logged-out visitor → lands on `/dashboard` as a guest with the US dashboard (guest banner, no name).
3. Log in as a US test account with history → dashboard numbers match `/history`; "What to do next" appears only after ≥3 scored sessions; skill map states match averages.
4. Sidebar Cases ↔ Market sizing switches the Practice tab; top-bar search filters the list.
5. Admin: open `/admin/us-market`, turn on "view as US" → the US shell + dashboard render with the preview bar on top; turn off → India shell returns.
6. India account (and India region logged-out) on `/`, `/pricing`, `/dashboard`, `/practice`, `/leaderboard` → exactly as before.

### Phase 3 — Merge
Owner merges `feat/us-redesign` → `main` once Phase 2 passes. After merge: `git push`, then `node .brain\sync.mjs`.

## 4. Blast radius — shared files and why India can't see them

| File | Change | India path |
|---|---|---|
| `app/(app)/layout.tsx` | (a) intl accounts → `UsAppShell`; the admin preview bar moved into that shell. (b) logged-out + preview route + US/EU region → US header/footer | India accounts and India-region guests fall through to the existing branches, byte-for-byte |
| `app/(app)/dashboard/page.tsx` | `if (content === 'US') return <UsDashboardPage …/>` after the daily read; US cold-start branch before the India one | India returns later, unchanged. Only edit on the India path: a now-dead ternary on the cold-start `<h1>` collapsed to its India string (same text) |
| `app/(app)/practice/page.tsx` | early US return with `variant="us"` | India JSX untouched |
| `app/(app)/leaderboard/page.tsx` | logged-out + US region → `UsGuestLeaderboard` | India guests still get `GuestLeaderboardPreview` |
| `components/practice-hub.tsx` | optional `variant` (default `'default'` = today's labels/classes); `?q=` seeds search (absent → `''` as before) | default output identical |
| `components/guest/login-to-continue-overlay.tsx` | optional `variant` (US spelling, 8px radii, `inert` on the blurred content) | default output identical |
| `components/mobile-desktop-banner.tsx` | hidden on `/us/*` and when `mece_rg` is US/EU | India cookie → same behaviour |
| `app/globals.css` | one rule under `.dark .us-scope` (lighter crimson for small red text in dark mode, AA) | India never carries `.us-scope` |
| `tailwind.config.js` | `fontFamily.display` | unused by India markup |

Bundle: India `/` first-load 201 → 200 kB, `/pricing` 185 → 185, `/practice` 136 → 136, `/dashboard` 222 → 226 kB (the US dashboard's client islands ride in the shared route; ~4 kB). Lora is preloaded only on `/us/*` (checked in the served HTML).

## 5. Known limitations / follow-ups (not in this branch)

- **Case workspace** (`/cases/[id]`), results, history, profile, upgrade pages: inside the new shell but not restyled.
- **App routes keep `maximum-scale=1`** from the root layout (it stops iOS zooming into inputs). `/us/*` now allows zoom; changing it app-wide is a global call (axe flags it as moderate).
- India's `LoginToContinueOverlay` would also benefit from `inert` on its blurred content (axe: aria-hidden-focus). Left untouched per scope.
- Photos are hotlinked from Unsplash's CDN. If the owner prefers self-hosting, download the 17 images into `public/us/` and change `photoUrl()` in `lib/us-market/assets.ts` — one function.
- Repo ESLint config is broken independent of this branch (`eslint-config-next@16` with ESLint 8 / Next 14 → "Converting circular structure to JSON"). Changed files were linted with an ad-hoc config (react-hooks, jsx-a11y, @next/next): clean.

## 6. Verification already run in the sandbox

- `tsc --noEmit` clean; `next build` clean (production build, Next 14.2.3).
- `node scripts/test-intl.mjs`: 46 checks passed. `gen-us-seed.mjs`: seed regenerated byte-identical.
- **India regression:** built the pre-redesign commit and this branch side by side and pixel-compared full-page screenshots (India region cookie, 1280 + 390) of `/`, `/pricing`, `/about`, `/login`, `/signup`, `/practice`, `/dashboard`, `/leaderboard`, `/learn`, `/terms`, `/privacy`, `/refund`, plus dark mode for `/`, `/pricing`, `/practice`, `/leaderboard`, `/refund` → **0 differing pixels in all 34 pairs**.
- **Responsive:** `/us` at 320 / 768 / 1920; `/us/market-sizing-questions` 390 / 1280; US dashboard (full, empty, guest, long titles, Pro) at 390 / 1024 / 1280 / 1440, and full / empty / guest also at 320 / 768 / 1920; practice 390 / 1440 → no horizontal overflow anywhere.
- **Accessibility (axe, WCAG 2.1 A/AA):** 0 violations on every `/us` page and the US dashboard/practice, light and dark. US guest `/practice`, `/dashboard`, `/leaderboard`: only the root-layout viewport item (§5).
- **Photos:** all 17 Unsplash photo URLs resolve (HTTP image responses); visual QA pending on the preview (§3 Phase 2).

## 7. Photography (Unsplash License — free for commercial use, no permission needed)

Hero (P6NY5x3ivYg), NYC band (LY1eyQMFeyo), skyline default (kZokA2VTKn4), retail (8vgsOVj0OfM), finance (6Y6OnwBKk-o), healthcare (ZCO_5Y29s8k), pharmacy (byGTytEGjBo), technology (64YrPKiguAE), travel (GsVO12cQrzA), restaurants (y-XZf_TNRms), industrial (jHZ70nRk7Ns), energy (xJLsHl0hIik), logistics (h3pVxOIpnzk), fitness (CPSjcuuV8E8), media (xKfS7Hll0Ck), education (B69nkOr8zv8), housing (03Sdb-nQk8M). IDs are unsplash.com/photos/<id>; photographer credits are stored beside each entry in `lib/us-market/assets.ts`.

## 8. Proposed LEDGER row

| **US redesign (landing + dashboard + app shell)** | Claude (cloud) | feat/us-redesign | **BUILT (2026-09-26), preview pending** | `app/us/**`, `components/us/**`, `lib/us-market/{assets,dashboard,labels}.ts` | us-launch |

## 9. Proposed CHANGELOG line

`2026-09-26 · us-redesign · frontend · non-breaking — premium US/EU landing, dashboard and app shell; India output unchanged (pixel-verified). affects: Landing/SEO(/us), Dashboard(US), Practice(US), Guest mode(US).`

---

## 10. v2 visual pass (2026-09-27, owner feedback) — commit `feat(us): v2 visual pass`

Owner feedback on v1 (live on main as 6c447a0): "not up to the mark, like a web designer would
design; remove the bold lines from any side of any tile; there is no full form of MECE anywhere."
Direction taken from the owner's reference boards (warm cream, soft white cards, tinted icon chips,
pill labels, red accents, photo hero).

```
touches:  frontend  NEW  components/us/brand.tsx (UsLogo: mark + MECE + "Method for Evaluating
                         Corporate Excellence" as real text)
                    MOD  components/us/ui.tsx (Eyebrow → pill, IconChip, US_CARD, Dot, softer buttons),
                         components/us/marketing/{sections,us-header,us-footer,dashboard-preview}.tsx,
                         components/us/dashboard/{modules,us-dashboard,skill-map}.tsx,
                         components/us/shell/us-app-shell.tsx, app/us/page.tsx,
                         components/intl/{intl-plan-cards,intl-pricing-section}.tsx (US-only),
                         SHARED, India-inert: components/practice-hub.tsx (variant 'us' classes only),
                         app/(app)/{dashboard,practice}/page.tsx (US branches only)
breaking: no. No CONTRACTS.md surface.
```

- **No coloured side/top rules on any tile**: removed the red left rule on "What to do next", the red
  left rules on the method steps, the red top bar on the Pro plan card (now a full ring), and the
  sidebar's active-item left bar (now a tinted pill).
- **Full form of MECE**: header, phone menu, footer and the app top bar (xl) show
  "Method for Evaluating Corporate Excellence" beside the wordmark; the method section explains the
  name and the consulting rule (mutually exclusive, collectively exhaustive).
- **Landing**: photo hero bleeding right with a floating example score card and today's case;
  five-icon feature strip; interview-styles wordmark row; "Everything you need" with four product
  cards; new "How it works" (3 steps + chat mock); MECE method with two definition cards, the issue
  tree and five move cards; framed dashboard; "Track your improvement" with ring, red trend line and
  six-dimension bars (labelled "Example account"); pricing; FAQ in a card; navy CTA band with the city.
- **Dashboard**: today's case card with pink wash and inset photo; plan + streak (red dots); four stat
  cards with tinted icons; next action with an icon chip; red progress line chart; red by-type bars;
  continue cards; activity with icon chips.

Gates run in the sandbox: `tsc --noEmit` clean · `next build` clean · axe WCAG 2.1 AA 0 violations on
/us, /us/pricing, /us/case-interview-examples, dashboard, practice (light + dark) · no horizontal
overflow at 320/390/1024/1280/1440 · India pixel-identical to the current main (28 page/width/theme
pairs, 0 differing pixels).

---

## 11. v3 dashboard (2026-09-27, owner reference mock) — commit `feat(us): v3 dashboard`

Owner feedback on v2: clone the reference dashboard "or even better"; a quotation top-right that
changes every day; today's case and market sizing change daily (already true) with photos that match
what each item is about (a solar case shows solar panels); everything in the mock present.

```
touches:  frontend  NEW  lib/us-market/quotes.ts (60 original one-line maxims, one per day),
                         lib/us-market/photo-url.ts (UsPhoto + URL helpers split out of assets.ts so
                           client bundles don't carry the photo library),
                         components/us/dashboard/weekly-chart.tsx (client: 4/8/12-week selector,
                           hover callout, value axis),
                         app/us/_fonts/lora-semibold.woff2 (Lora 600, Latin, OFL, ~21 KB)
                    MOD  lib/us-market/assets.ts (103 topic photos + keyword rules, 6 daily skylines,
                           photoForCase(seed), photoForAdvice, skylineForDay, stableHash, dayNumber),
                         lib/us-market/dashboard.ts (12 weeks of history; casesThisWeek, sizingThisWeek,
                           sizingDelta, scoredSizing; in-progress kind/type/messages/progressPct;
                           TYPE_BLURB; UsTodayInput/Item.blurb),
                         components/us/dashboard/{modules,us-dashboard,us-dashboard-page,skill-map}.tsx,
                         components/us/marketing/dashboard-preview.tsx, components/us/ui.tsx (import path),
                         components/us/shell/{us-app-shell,display-font}.ts(x), app/us/layout.tsx (+600 face)
breaking: no. No CONTRACTS.md surface, no schema, no route, no env var, no dependency.
affects:  Dashboard (US branch only), Landing (/us product preview). India: nothing.
```

What the page now does (top to bottom): date eyebrow + serif greeting; **a US skyline behind the
greeting that changes every day** (New York, Chicago, San Francisco, Lower Manhattan, Boston,
Seattle — rotation by the viewer's calendar day) with **the line of the day** top-right (60 original
lines, no attributions, rotating without repeats); **Today's practice** with the bank's own situation
text, minutes, difficulty, type, points and **a photo of the case's subject**; plan card; 7-day
streak; four stat cards with this week's movement (↑ N this week, ↑/↓ last 5 vs previous 5);
**What to do next** with a faded photo; **Today's market sizing** with its subject photo; continue
cards with thumbnails and an estimated progress bar (messages exchanged ÷ a typical session, capped
5–95%, labelled as an estimate for screen readers); sessions-per-week line chart with axis and a
4/8/12-week selector; performance by case type; skill map with a side panel; recent activity as a
timeline; footer with the full MECE lockup. Sidebar gains "Today's practice" (→ #today) and
"Analytics" (→ #analytics); the plan sits in a card at the sidebar's foot.

Photos: free Unsplash images hot-linked from images.unsplash.com (never Unsplash+), each checked to
load and checked by eye against its topic; images with a legible brand mark were rejected. Every one
of the 50 US cases and 50 market sizing questions maps to a topic photo (verified by script); other
titles fall back by keyword, then industry, then case type. Same item → same photo (FNV hash seed).

Company/university logos on /us: NOT added. The page names firms only as interview styles and says
it is not affiliated; showing their logos (or colleges') would imply endorsement or users we can't
substantiate, and the marks are trademarks. Text wordmarks stay. If the owner obtains written
permission, drop the files in `public/logos/` and wire them in `AudienceStrip`.

Gates run in the sandbox: `tsc --noEmit` clean · `next build` clean (/dashboard first load 228 kB,
+1 kB vs v2; /us 184 kB, +2 kB) · axe WCAG 2.1 AA 0 violations on the dashboard (full, guest, empty,
free; light + dark) and /us · no horizontal overflow at 320/390/768/1024/1280/1440 · India
pixel-identical to a v2 build in the same environment (/, /about, /dashboard, /leaderboard, /learn,
/login, /practice, /pricing, /signup, /terms at 1280 and 390: 20 pairs, 0 differing pixels).
The QA fixture route used for screenshots (app/us/qa-dashboard) was never committed.

Rebased onto main at aaa04a2 (us-growth-seo + us-learn hero, landed the same day): the only overlap
was `components/us/shell/us-app-shell.tsx`, where the sidebar keeps us-growth's **Learn** item
(Practice group) alongside v3's Today's practice and Analytics. tsc, next build and test-intl
(51 checks) re-run clean on the rebased tree.

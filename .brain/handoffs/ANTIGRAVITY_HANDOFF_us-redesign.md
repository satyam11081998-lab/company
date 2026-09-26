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

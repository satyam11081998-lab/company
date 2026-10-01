# ANTIGRAVITY_HANDOFF — us-mcq-tile (the practice tile on the US landing)

**Author:** Claude brain (cloud session), 2026-09-30. **Feature:** `us-redesign` row — hero addition.
**Branch:** `feat/us-mcq-tile`, frontend (`consilio`) only, cut from `main` at a73be90 (after india-landing-redesign).
**Type:** presentation. No backend, no DB, no migration, no env var, no new dependency.

```
touches:  frontend  NEW  components/landing/practice-tile.tsx (the tile, now shared by "/" and "/us")
                    MOD  components/us/marketing/sections.tsx (Hero: tile replaces the example score card and
                           the floating today's-case card; today's case moves into the tile's status bar)
                         app/us/page.tsx (passes today's US guesstimate id to the hero)
                         components/landing/interview-sim.tsx (+ opt-in market="US": coffee market-sizing
                           warm-up, "Market sizing" toggle label; tile toggle never wraps, meta hidden < sm)
                         components/home/hero-tile.tsx (now a thin wrapper over the shared tile — same output)
                         components/home/home.css (tile shadow moved into the shared component)
breaking: no. No CONTRACTS.md surface touched. India "/" renders the same tile as before (checked side by side).
affects:  Landing (/us hero). India "/" unchanged.
```

## What a US visitor sees

The /us hero keeps its headline (now two lines at every desktop width: 36px lg, 43px xl), lead, buttons and
photo. On the right, in front of the photo, sits the same interactive warm-up tile as India:
Case / **Market sizing** toggle, four tap-through steps, a scored result, and "Take today's case for real",
which opens **today's US daily** case or market sizing question (guest session minted on click). The tile's
status bar shows today's real US case with a Start button (the card that used to float over the photo).
Sidebar topic photos come from the US library (`restaurant-counter`, `coffee-cup`).

## US daily content — checked 2026-09-30 (no change needed)

Production `market_daily_schedule` (market = US): `source = generated` rows for 2026-09-27, 09-28 and 09-29,
each created at ~05:32 UTC by the `daily-cases-us.yml` 05:10 UTC run; each a new, US-set case + market sizing
question (e.g. "A Midwest Furniture Retailer's Turnaround Strategy", "Estimate the Number of Coffee Shops in
Manhattan"). 106 active US items (100 bank + 6 generated). /us shows the current day's case.
The backend's "modified" files on the D: drive are CRLF line endings only (`git diff --ignore-cr-at-eol` is
empty) — no pending work there.
Observation for the owner: 5 of the 6 generated US items are "hard" (the model picks the difficulty).

## Gates

- `npx tsc --noEmit` → EXIT 0.
- `npm run build` → Compiled successfully; "/" and "/us" both static (cloud, Google Fonts mocked).
- Checked /us at 390, 1024, 1280, 1440, 1920: headline 2 lines, tile Step 1 fits without inner scroll
  (435/435 px), no horizontal scroll. "/" re-checked: unchanged.

## Preview QA (Vercel preview of this branch)

1. /us hero at 1280 and 1440: tile in front of the photo, sidebar from 1400px, status bar shows today's case.
2. Toggle to Market sizing: coffee question, topic photo swaps to the coffee cup.
3. Finish 4 steps → "Take today's case for real" opens today's US case as a guest.
4. Phone: tile under the photo, toggle on one line.

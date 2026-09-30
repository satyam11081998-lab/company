# ANTIGRAVITY_HANDOFF — india-dashboard-top (focus case, daily brief, daily guesstimate)

**Author:** Claude brain (cloud session), 2026-09-30. **Feature:** `Dashboard` row — top-of-page redesign, India only.
**Branch:** built as `feat/india-dashboard-top` (frontend `consilio` only, cut from `main` at ae717bf); the owner
reviewed the preview file and asked for it on `main` directly (2026-09-30 23:58 IST), so it landed on `main`.
**Type:** presentation + one additive read. No backend, no DB migration, no env var, no new npm dependency.

```
touches:  frontend  NEW  components/dashboard/focus-hero.tsx (the new focus card)
                         components/dashboard/hand-font.ts (Kalam Light, reuses components/home/fonts/kalam-*.woff2)
                         lib/dashboard/photos.ts (India dashboard photo library + keyword picker, server-only)
                         lib/dashboard/daily-lines.ts (line of the day, one per IST day)
                    MOD  components/dashboard-client.tsx (FocusHero replaces <Hero/>; new optional `top` prop)
                         components/dashboard/news-card.tsx (photo, real source + publish time, no canned copy)
                         components/dashboard/guesstimate-card.tsx (photo, gut-call bands instead of fixed 1.2M/4.8M/12M/38M)
                         app/(app)/dashboard/page.tsx (picks the three photos + the line; passes `top`)
                         lib/daily-server.ts (India brief select + published_at, category, keywords — baseline 0001 columns)
                         lib/api.ts (DailyContentResponse.brief: three OPTIONAL fields)
                         app/globals.css (.dash-fade-* / .dash-photo-* masks)
breaking: no. No CONTRACTS.md surface changed: /daily/today (FastAPI) is untouched; the TS type only gains optional
          fields; the extra columns exist since the baseline schema and are covered by "news_headlines readable".
affects:  India dashboard only. US accounts return UsDashboardPage before any of this runs. "/" also calls
          getDailyTodayServerSide('static') — it just receives three more brief fields it ignores.
```

---

## 1. What the owner sees (top of /dashboard, India)

| Block | Before | After |
|---|---|---|
| Guest banner | unchanged | unchanged |
| Focus card | 3 variants (case / streak / readiness), text + streak monument | ONE card for everyone: copy on the left, a photo of **what today's case is about** on the right that melts into the card from its left edge, the **practice streak** floating on the photo (record, "safe for today", countdown, readiness once it exists), and the **line of the day** in a pen hand (Kalam) with a red ink underline. Newcomers also see "Today's case: <title>". |
| Daily brief | navy SVG chart rail; hard-coded "FT · 4 hr ago · 4 min read" and a canned "BCG to acquire Quantis" line | a photo of the story's subject melting in from the left; the brief's real `source_name` + publish time; honest "why it matters" copy; empty state links to /gd-briefs |
| Daily guesstimate | same four numbers (1.2M / 4.8M / 12M / 38M) under every question | a photo of the question's subject melting in from the top-right; **gut call** in Indian magnitudes (Under 1 lakh / 1–10 lakh / 10 lakh–1 cr / Over 1 crore). Tapping one locks it in (sessionStorage `mece:gut:<caseId>`) and the button becomes "Test your gut". No band claims to be the answer. |

Owner direction folded in: "dynamic related photos and the quotations too", "similar to the US one",
"make photos blended from one side, not hard corners". Every photo is masked (CSS `mask-image`, eased S-curve stops)
so no photo has a visible edge or corner, in light and dark.

## 2. How the photos are chosen (lib/dashboard/photos.ts)

Same model as the US dashboard (`photoForCase`): keyword rules over the title (then cluster / brief keywords /
category), specific first; several photos per rule, chosen by a stable hash of the item id, so an item always shows
the same photo and the picture changes whenever today's items change. `avoid` stops two cards sharing a photo.
Library = India-specific scenes (auto-rickshaw, Mumbai towers, Marine Drive, Indian Railways, cricket stadium, spice
market, kirana, scooters, tea estate, gold jewellery, jalebi stall) + the landing's photos (chai, QSR, newspapers,
planning desk, whiteboard) + the US library's location-neutral topic photos only. Nothing US-coded (yellow cabs,
school buses, gridiron, US skylines). Picked on the server; the library never ships to the browser.

The line of the day: 51 original maxims in Indian English (`practise`, `maths`, lakhs/crores), themed by today's case
(profitability → drivers and levers, growth → objectives and trade-offs, guesstimate → magnitudes), one per IST day,
no attributions (no famous quotes — misattribution risk, same rule as the US list).

## 3. Phased build steps (Antigravity)

**Phase 0 — Sync.** `git pull` on `main` in `D:\dev\mece\consilio`.

**Phase 1 — Gates.**
- `npx tsc --noEmit` → EXIT 0 (passed in the cloud session).
- `npm run build` → Compiled successfully (passed in the cloud session with Google Fonts mocked).
- No SQL, no py_compile: frontend-only.

**Phase 2 — Production QA (mece.in/dashboard after the deploy)**, 390 / 768 / 1024 / 1440, light + dark:
1. Guest (fresh anon session): banner, focus card says "Your first focus case" + today's case title, streak 0.
2. Returning account: title = today's case, streak panel shows record + countdown (after load, no hydration warning).
3. Done today: "Attempted today · score", "View your score", streak panel "Safe for today".
4. Photos: each relates to its item; no hard photo edge anywhere; text never sits on an un-faded photo.
5. Brief: source + "N hr ago" are real; "Turn into a 15-min case" still creates a case; "Read brief" opens it.
6. Guesstimate: tap a band → highlighted, footer "Locked in…", button "Test your gut" → opens the case.

**Phase 3 — Record.** Already on `main`; `node .brain\sync.mjs` after the push. If anything in Phase 2 fails,
revert the single commit (`git revert <sha>`): nothing else depends on it.

## 4. Proposed LEDGER / CHANGELOG lines (brain does not edit them)

- LEDGER, Dashboard row: + India top section (focus card with topic photo, streak, line of the day; brief + guesstimate photos; gut call) — **LIVE on main 2026-10-01.**
- CHANGELOG: `2026-09-30 — india-dashboard-top — <sha>` / India dashboard top: one focus card with a topic photo,
  practice streak and handwritten line of the day; brief + guesstimate get topic photos; gut-call bands replace fixed
  MCQ numbers. / touches: see above / breaking: no.

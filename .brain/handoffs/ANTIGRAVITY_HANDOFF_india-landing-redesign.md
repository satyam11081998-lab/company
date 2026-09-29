# ANTIGRAVITY_HANDOFF — india-landing-redesign (the "/" page, editorial redesign)

**Author:** Claude brain (cloud session), 2026-09-30. **Feature:** `Landing (hero demo + vignettes + ISR)` row — redesign.
**Branch:** `feat/india-landing-redesign`, frontend (`consilio`) only, cut from `main` at f9841b6. Pushed as a branch so
Vercel builds a preview; merging to `main` is the owner's call after checking the preview.
**Type:** presentation. No backend, no DB, no migration, no env var, no new npm dependency.

```
touches:  frontend  NEW  components/home/** (fonts.ts + fonts/*.woff2, home.css, home-header, wordmark, theme-button,
                           hero, hero-tile, hand-note, draw-on-view, photo, start-cards, mece-way, home-faq,
                           success-stories, final-cta, home-footer)
                         lib/home/photos.ts (India landing photo library), lib/home/stories.ts (story ordering)
                    MOD  app/page.tsx (rewritten composition; FAQ copy + JSON-LD, ISR 300s, hreflang unchanged)
                         components/landing/interview-sim.tsx (+ opt-in `variant="tile"`; default 'card' unchanged)
                         components/auth-cta.tsx (+ opt-in `look="editorial"` and `howHref`; default unchanged)
                         components/landing-mobile-nav.tsx (+ opt-in `hideFrom="lg"`; default 'md' unchanged)
                         tailwind.config.js (+ fontFamily.editorial / fontFamily.hand, both var-backed)
breaking: no. No CONTRACTS.md surface touched (no schema, route, scoring, quota, storage or API change).
          Every shared-component change is an opt-in prop whose default reproduces today's output.
affects:  Landing only. /methodology, /about, /pricing, /glossary, /decks keep AuthCTA's default look.
```

---

## 1. What changed on "/"

Follows the owner-approved mockup section by section:

| # | Section | Notes |
|---|---|---|
| 1 | Red announcement bar | Same copy and link as before. |
| 2 | Sticky nav | HTML wordmark (mark + MECE + tagline from xl), serif links, theme icon, Log in / Sign up (8px buttons). No search icon: the site has no search to open. |
| 3 | Hero | Newsreader headline, serif lead, AuthCTA `look="editorial"`, 6 / 60s / Instant stats. Right: sunrise-ridge photo melting into the page, the live MCQ warm-up (`InterviewSim variant="tile"`) inside an app-window tile with the real sidebar links, and a pen-hand margin note ("Practise like the top 1%") whose arrow draws in. |
| 4 | "Used by aspirants targeting roles at" | Firm names as plain serif type. No logos. |
| 5 | Three ways in | Try a real case / Sharpen your estimation skills / Be ready for discussions. Real links; with guest mode on a click mints the anonymous session and opens today's case / guesstimate / GD briefs (same flow the old GuestPracticeActions used). |
| 6 | The MECE way (`#the-mece-way`) | Four moves, an issue tree that draws in on scroll, a margin note, and the six scoring dimensions (`#scoring`, target of the nav's Scoring link). |
| 7 | FAQ (`#faq`) | Same five questions; required because the FAQPage JSON-LD must be visible on the page. |
| 8 | Success stories | Replaces the endorsement wall (owner decision). Real rows from `testimonials` with their stored photos; stories with a placement line lead (`lib/home/stories.ts`). Native scroll-snap rail, arrow buttons, keyboard arrows, no autoplay. |
| 9 | Closing band | Navy, Kangchenjunga at alpenglow, hairline mountain mark, editorial CTA. |
| 10 | Footer | Light footer (the shared navy `<Footer/>` stays everywhere else). LinkedIn + Instagram only — the YouTube handle `@mece-in` returns 404, so no icon. |

Removed from "/": the endorsement wall, the scoring table, the "real cases daily" tables, the GD / leaderboard / Deck Vault vignettes and the methodology grid (all still exist as components and pages).

## 2. Photography (lib/home/photos.ts)

Free Unsplash photos hotlinked from images.unsplash.com, exactly like the US library. Each was checked as FREE (not Unsplash+) and viewed full size: hero `photo-1786897162869-b0ccd067affd` (Marsumilae, sunrise, Aravis), boardroom `photo-1517502884422-41eaead166d4` (Dane Deaner), estimate `photo-1711097383282-28097ae16b1d` (Jakub Żerdzicki), news `photo-1504711434969-e33886168f5c` (AbsolutVision), summit `photo-1763300092626-e2734aa49415` (Deep, Kangchenjunga). No legible brand, logo or real face.

**Hero geometry — change one number, re-check the rest.** Measured on the original (canvas scan): the hiker stands at 34.4% across, head 48.6%, feet 51.3% down. Photo layer = `left: 36%` → right edge. Image drawn at 135% of the layer, `translate(-15%, -30%)` of its own size (lg–xl) → hiker at x ≈ 52.8vw, feet ≈ 12.3vw; tile top = grid padding 40px + `12.7vw`. At 2xl: 120%, `translate(-12%, -34%)` → x ≈ 53.2vw, feet ≈ 8.9vw; tile top `8.9vw`. Result: he stands on the ridge 15–50px in from the tile's left corner at every desktop width, note to his right. Fades are CSS masks on the photo (no cream overlays), so dark mode needs nothing extra and there is no 1px seam.

## 3. Type

`components/home/fonts.ts` (next/font/local, scoped to "/"): Newsreader 400 / 400 italic / 500 / 600 and Kalam 300, latin subsets from @fontsource 5.3.0, SIL OFL. ~115 KB total, only on the landing.

## 4. Phased build steps (Antigravity)

**Phase 0 — Sync.** `git pull` on `main` in `D:\dev\mece\consilio`; `git fetch` and check out `feat/india-landing-redesign`.

**Phase 1 — Gates.**
- `npx tsc --noEmit` → EXIT 0 (passed in the cloud session).
- `npm run build` → Compiled successfully (passed in the cloud session with Google Fonts mocked; on Vercel it fetches Inter normally).
- No SQL, no py_compile: frontend-only.

**Phase 2 — Preview QA (Vercel preview of this branch).** Check at 390, 768, 1024, 1280, 1440, 1920, light and dark:
1. Hero: hiker visible on the ridge above the tile's left edge; note beside him; tile shows the whole Step 1 with no inner scroll; no horizontal scroll.
2. Tile: pick 2 clarifiers → Ask → finish 4 steps → result renders and scrolls inside the tile; Case/Guesstimate toggle works; "Take today's case for real" starts the daily case (guest mode) or goes to /signup.
3. Cards: each opens the right place; with guest mode on, no login wall before the case opens.
4. Nav "Scoring" jumps to the rubric card; "How it works" jumps to The MECE way.
5. Stories: arrows disable at the ends; swipe works on a phone; every avatar loads (initials if a photo is missing).
6. Reduced motion (OS setting): no photo drift, notes and tree appear without animation.

**Phase 3 — Merge.** Owner approves the preview → merge to `main`, then `node .brain\sync.mjs`.

## 5. Proposed LEDGER / CHANGELOG lines (brain does not edit them)

- LEDGER, Landing row: `feat/india-landing-redesign` — **BUILT 2026-09-30, preview pending owner review.**
- CHANGELOG: `2026-09-30 — india-landing-redesign — <sha>` / Editorial redesign of "/" from the approved mockup: live MCQ tile over a real sunrise photo, success stories replace endorsements. / touches: see above / breaking: no.

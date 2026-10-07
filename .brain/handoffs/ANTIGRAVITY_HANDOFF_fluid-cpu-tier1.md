# ANTIGRAVITY_HANDOFF — fluid-cpu-tier1

**Author:** Claude (cloud session). **Date:** 2026-10-07. **Feature:** cut Vercel Fluid Active
CPU on the four most expensive routes without changing what any user sees. Account was at 3h57m
of the Hobby plan's 4h (30-day window) on 2026-10-06. **Branch:** `main` (owner: "go ahead").
Follows `ANTIGRAVITY_HANDOFF_us-site-off.md` (976249e).

```
touches:  frontend
            app/learn-static/** (NEW: static logged-out copy of /learn/casebook/<slug> and
              /learn/mece-framework), components/guest/guest-chrome.tsx (NEW: GuestChrome moved out
              of the (app) layout, unchanged markup), app/(app)/layout.tsx (uses it),
              lib/supabase/middleware.ts (rewrite cookie-less /learn/casebook/<slug> and
              /learn/mece-framework to the copy; 308 /learn-static/* → /learn/*),
              lib/public-pathname.ts (NEW) + components/casebook/nav-tree{,-item}.tsx (active item
              computed from the public path, so the prerendered copy matches the live page),
            lib/og-card.tsx (NEW: the share card, moved unchanged from app/og/route.tsx),
              app/og/route.tsx (uses it), app/og/casebook/[...slug]/route.tsx +
              app/og/mece-framework/route.tsx (NEW: cards prerendered at build),
              app/(app)/learn/casebook/[[...slug]]/page.tsx + app/(app)/learn/mece-framework/page.tsx
              (og:image URL → the prerendered card),
            app/api/track/route.ts (two plain PostgREST POSTs instead of a supabase-js client),
            app/page.tsx (revalidate 300 → 3600), app/api/revalidate/home/route.ts (NEW,
              CRON_SECRET), app/api/cron/refresh/route.ts (revalidatePath('/') after an OK kick)
          backend
            services/daily_scheduler.py (_refresh_frontend_home(): POST /api/revalidate/home after
              today's daily_schedule row is inserted; best-effort, never fails the schedule)
breaking: no. C1–C9 untouched. C4 additive: new route POST /api/revalidate/home (CRON_SECRET,
          marks "/" stale; no data in or out). og:image URLs of Casebook pages and the MECE
          framework page change from /og?… to /og/casebook/<slug> and /og/mece-framework (same
          pixels — verified). Unknown /learn/casebook/<x> now answers a real 404 (was a 200 with
          the 404 view streamed in) for logged-out requests; same page on screen.
affects:  Casebook / primers (rendering path for logged-out readers), Landing page (refresh
          timing), Analytics (/api/track), Growth/SEO (og:image URLs), Daily scheduler (backend)
```

## Baseline (Vercel Observability, project "hirespring", 12h window, 2026-10-06)
| Route | Invocations | Active CPU |
|---|---|---|
| /learn/casebook/[[...slug]] | 374 | 26s |
| / | 37 | 16s |
| /og | 19 | 14s |
| /api/track | 173 | 14s |
| /us (switched off in 976249e) | 27 | 13s |
| /learn/mece-framework | 37 | 2.24s |
Top 10 routes ≈ 102s per 12h; whole project ≈ 115s per 12h.

## What changed and why it is behaviour-identical
1. **Casebook + MECE framework (logged-out).** `app/(app)` is force-dynamic (the layout reads the
   session), so every crawler/logged-out view was a full server render. Requests with NO `sb-`
   cookie are now rewritten by the middleware to `app/learn-static`, prerendered at build (130
   Casebook pages + the framework guide). The copy re-exports the original page modules and
   wraps them in the same GuestChrome, so content, metadata, canonical and JSON-LD come from one
   source. Anyone with a session (signed-in or anonymous guest) still gets the live (app) page.
   Only applied to visitors placed in India (the chrome the copy carries; with the international
   site off, that is every visitor). No cookies/headers/DB are read by the copy, so no user data
   can be baked into it.
2. **Share cards.** Every deploy empties the CDN cache, and each card was re-drawn (~0.7s) on the
   next crawler hit. The 131 known cards are drawn at build by the same `lib/og-card.tsx`; /og
   stays dynamic for Insights and anything else.
3. **/api/track.** Same two inserts, same URL + `columns` list, same service-role apikey/Bearer,
   same Content-Profile, errors still swallowed, same `{ ok }` responses. Route bundle 227 KB → 20 KB.
4. **Home page.** Only the daily pair (written once a day by the backend) and testimonials (admin
   action already calls revalidatePath('/')) change on "/". It is now refreshed when they change —
   the backend calls /api/revalidate/home right after inserting today's row, the Vercel cron also
   refreshes after an OK kick — with a 1-hour revalidate as the fallback (was every 5 minutes).

## Gates (run 2026-10-07 on a copy of main @ 976249e + this change, next start + Chromium)
1. `npx tsc --noEmit` — 0 errors. `next build` — exit 0 (sandbox: placeholder env + mocked Google
   Fonts response). `python -m py_compile services/daily_scheduler.py` — ok (CRLF kept).
2. Casebook/framework, old (pre-change build, live render, logged-out) vs new (static copy) and
   new-live (with a session cookie): **0 pixels differ** at 1280px and 390px on 5 pages
   (getting-started/what-it-tests, core-frameworks/profitability, industry-primers/fmcg,
   guesstimates/four-approaches, mece-framework); same title, canonical, robots, JSON-LD, visible
   text and links; no hydration errors; served `x-nextjs-cache: HIT`.
3. Client navigation (logged-out): casebook → casebook stays same-document, back button, leaving
   to a preview route and back — identical old vs new; address bar always shows /learn/...;
   browser never requests a /learn-static page (only its JS chunks).
4. Googlebot UA → static copy, no region cookie (as before). RSC fetch → 200 text/x-component.
   `/learn-static/x` → 308 `/learn/x`. `/learn` → 308 `/learn/casebook` (unchanged). Unknown slug →
   same 404 screen (status now 404 for logged-out; was 200).
5. Share cards: **131/131 pixel-identical** (same bytes) to the old `/og?…` URL for each page;
   `content-type: image/png`, `cache-control: public, immutable, no-transform, max-age=31536000`.
6. /api/track against a recording fake Supabase: old vs new **identical requests** (method, URL,
   columns, apikey/Authorization/Content-Type/Content-Profile, bodies) for batched, single,
   action-only and invalid payloads; identical responses, including Supabase down → `{"ok":true}`.
7. Home: page stays cached while the pair is unchanged; POST /api/revalidate/home → 401 without/
   with wrong secret, 200 with it (header or Bearer); next request renders the NEW pair (Data Cache
   invalidated too). Backend `_refresh_frontend_home()`: no secret → no call; wrong secret / site
   down → warning only; right secret → "/" refreshed.
No SQL. Build adds ~52 MB per deployment (static pages 37 MB, cards 15 MB); Hobby keeps 3
production + 3 latest deployments, so at most ~0.3 GB of the 10 GB.

## Deploy order + one-time check
Push the frontend first, then the backend (a backend call before the endpoint exists just logs
a 404 warning). The backend uses its own CRON_SECRET; it must equal Vercel's CRON_SECRET (the
Vercel cron already depends on that). Check once after both deploy:
`curl.exe -X POST https://mece.in/api/revalidate/home -H "x-cron-secret: <Render CRON_SECRET>"`
→ `{"ok":true,"revalidated":"/"}`. Optional backend env `FRONTEND_URL` (default https://mece.in).

## Measure (Vercel → Observability → Functions, 12h and 24h windows, compare with the table above)
`/learn/casebook/[[...slug]]` should fall to signed-in readers only; `/learn/mece-framework` near 0;
`/` ≤ ~1 render per hour plus 1–2 per day; `/og` only Insights cards; `/api/track` CPU per call.
Usage → Fluid Active CPU 30-day total should start falling as older days roll off.
Logs check on Vercel: `curl -sI https://mece.in/learn/casebook/toolkit/swot` (no cookie) should
show `x-vercel-cache: HIT` / `x-matched-path: /learn-static/casebook/[...slug]`.

## Rollback
Each part is independent: revert the commit, or individually — delete the middleware rewrite
block (casebook goes live-rendered again); point og:image back to /og?…; restore
`revalidate = 300`; restore the supabase-js insert in /api/track. Backend hook is a no-op
without the frontend route.

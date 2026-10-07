# ANTIGRAVITY_HANDOFF — fluid-cpu-round2

**Author:** Claude (cloud session). **Date:** 2026-10-07. **Feature:** second round of Vercel
Fluid Active CPU cuts on the Hobby plan (option 1 of the owner's plan; option 3, moving the
frontend to Google Cloud Run, comes next on a separate branch). Follows
`ANTIGRAVITY_HANDOFF_fluid-cpu-tier1.md` (32db5bf). **Branch:** `main`.

```
touches:  frontend
            app/api/revalidate/home/route.ts, app/api/cron/refresh/route.ts,
              app/(app)/admin/testimonials/actions.ts, app/(app)/admin/endorsements/actions.ts
              (revalidatePath('/') → revalidatePath('/', 'page')), app/page.tsx (comment)
            vercel.json (ignoreCommand) + scripts/vercel-ignore-build.sh (NEW)
            app/(app)/practice/page.tsx + components/practice-hub.tsx + lib/practice-cases.ts (NEW)
              (select only the 6 columns the cards read; no guesstimate body)
            app/(app)/dashboard/page.tsx + components/dashboard-client.tsx +
              lib/dashboard/growth-deltas.ts (JSON-path selects; slim client prop)
            app/opengraph-image.tsx, app/twitter-image.tsx (Node runtime → prerendered at build)
          backend   none
breaking: no. C1–C9 untouched. No API shape changes. Dashboard/practice render the same.
affects:  Landing (refresh scope), Admin testimonials/endorsements (refresh scope),
          Practice hub, Dashboard, Deploys (docs-only commits no longer deploy)
```

## Why (measured 2026-10-07 on production, after 32db5bf)
1. **A bare `revalidatePath('/')` appears to clear every cached page on Vercel.** After the first home
   refresh, every prerendered page — Casebook static copy, share cards, even `/llms.txt`, which
   nothing refreshes — answered `x-vercel-cache: REVALIDATED` (Vercel docs: "the cached entry had
   been deleted … through revalidateTag() or revalidatePath()") and re-rendered on its next hit.
   `revalidatePath('/')` targets the tag `_N_T_/`; every page carries tags beginning `_N_T_/`.
   `revalidatePath('/', 'page')` targets `_N_T_/page`, which only the home page has (checked in
   `.next/server/app/*.meta`). Same fix in the testimonials/endorsements admin actions.
2. **Each production deploy re-renders cached pages on first visit** (observed: first hit after
   the deploy = function run, then `HIT`). So deploy count multiplies CPU. Notes-only commits
   (`.brain/` sync, handoffs, `docs/`, root `*.md`) now skip the deploy (`ignoreCommand`).
3. **/practice** selected `*`: every case's solution, hints, MCQs and interviewer notes went to
   the browser on each visit (readable in page source). Now 6 columns.
4. **/dashboard** fetched and serialised every submission's answer text and full feedback (incl.
   model answers) and 100 other users' full feedback records per view; only score breakdowns are
   read. Now JSON-path selects; the client gets score + case type only.
5. **Root share image** was an edge route → re-drawn after every deploy (~0.8s each). Now static.

## Gates (2026-10-07, copy of main @ 32db5bf + this change; old vs new builds side by side)
1. `npx tsc --noEmit` 0 errors; `next build` exit 0 (both); `node scripts/test-intl.mjs` 51/51.
2. JSON-path selects accepted by the REAL Supabase PostgREST (anon key, RLS → 0 rows, status 200;
   a deliberately malformed select → 400 PGRST100). `->` returns nested objects/arrays deep-equal
   to the full column (checked on public `seo_pages.content`).
3. Recording fake Supabase + Playwright, signed-in test user: /practice (all, guesstimates,
   attempted tabs; signed-in and signed-out) and / → **0 pixels differ** at 1280 and 390 px, same
   text and links. /dashboard → same text and links; the only differing pixels are the live
   countdown clocks (seconds apart). Page size with the fixture: dashboard 264→203 KB, practice
   217→90 KB; answer text / model answers / solutions / interviewer notes no longer in the HTML.
4. `revalidatePath('/', 'page')`: home re-renders (MISS → HIT) on the next request; other pages
   stay HIT. Root opengraph/twitter images pixel/byte-identical, now `○` static.
5. `scripts/vercel-ignore-build.sh` in a scratch repo: builds when no previous SHA, unknown SHA,
   empty diff, code changed, nested .md changed, code+notes pushed together; skips only when
   everything since the last successful deploy is .brain/, docs/ or a root *.md.

## Measure next
Observability 12h/24h: `/learn-static/*` and `/og/casebook/*` rows should only appear once per
deploy per page; `/` about hourly; `/opengraph-image` gone; `/practice` and `/dashboard` CPU per
call down. Deploys list: notes-only pushes show "Ignored Build Step" / canceled.

## Rollback
Revert the commit, or individually: remove `ignoreCommand` from vercel.json; put `select('*')`
back in practice; restore the dashboard selects; set `runtime = 'edge'` on the two image files.

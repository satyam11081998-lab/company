# CHANGELOG — newest first, one entry per landed change

Format (Antigravity appends on each merge):
```
## <date> — <feature> — <commit short sha>
<one line: what changed>
touches: <files/areas>
breaking: <no | yes — which CONTRACTS.md surface>   affects: <features that must re-sync>
```
A brain reading this at session start only needs the top ~15 lines.

---

## 2026-06-12 — industry-primers-it-ites
industry-primers: add "17 · IT & ITeS" static bundle and wire up casebook registry
touches: public/primers/it-ites/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 — industry-primers-iron-steel — 65971b7
industry-primers: add "16 · Iron & Steel" static bundle and wire up casebook registry
touches: public/primers/iron-steel/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 — industry-primers-insurance — 254de4c
industry-primers: add "15 · Insurance" static bundle and wire up casebook registry
touches: public/primers/insurance/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 — industry-primers-hospitality — f174214
industry-primers: add "14 · Hospitality" static bundle and wire up casebook registry
touches: public/primers/hospitality/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 — industry-primers-cement — 39e4f21
industry-primers: add "13 · Cement" static bundle and wire up casebook registry
touches: public/primers/cement/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 — industry-primers-automobile — de3573e
industry-primers: add "12 · Automobile" static bundle and wire up casebook registry
touches: public/primers/automobile/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 — industry-primers-healthcare — c5d70b9
industry-primers: add "11 · Healthcare" static bundle and wire up casebook registry
touches: public/primers/healthcare/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 — deck-vault-drm-and-pro-pivot — ce11ebf
vault: heavy canvas PDF viewer (react-pdf), sticky blur blackout, hostile keyboard screenshot blockers, forensic identity watermarking (MECE - Email - UserID).
touches: components/pdf-viewer.tsx, app/(app)/skeletons/view/[id]/page.tsx, components/skeleton-library.tsx, app/(app)/skeletons/page.tsx, app/api/skeletons/file/[deckId]/route.ts
breaking: yes — file proxy streams PDF to canvas, native browser downloads and right-clicks are totally disabled. Vault access now requires the 'pro' subscription_tier instead of standalone purchase.   affects: Vault, Payments

## 2026-06-09 — news-daily-fix — Vercel Cron backup for /cron/fetch-news + /cron/schedule-daily (daily brief refresh no longer depends on GitHub Actions), news fetch timeouts + "waking up" hint so GD Briefs never spins forever
breaking: no

## 2026-06-09 — dashboard-polish — real constellation locks (no attempt on locked nodes), removed decorative PRO ghost strip, Recent card real-only (no mock), proof rail shows first names, constellation contrast boost
breaking: no

## 2026-06-09 — onboarding-503-fix — move onboarding gate from (app) layout (fragile headers() path read -> redirect loop -> 503) into middleware (reliable pathname)
breaking: no

## 2026-06-09 — leaderboard-rebuild — 3 live views (All-India / Daily / Cohort) + FOMO standing card + LinkedIn share
touches: lib/dashboard/leaderboards.ts (new), leaderboard page + client
breaking: no

## 2026-06-09 — dashboard-fomo-real — peer-proximity / proof-rail / guesstimate-card now use live data, honest empty states
breaking: no

## 2026-06-09 — qa-loggedin-phase1 — users RLS + service-role leaderboard/dashboard reads
touches: 0006_rls.sql, leaderboard, dashboard
breaking: data-access policy (announce); deploy code before SQL — affects: leaderboard/dashboard

## 2026-06-09 — qa-loggedin-phase2 — GD-brief/headlines Lite+ gate + results IDOR filter
touches: routes/news.py, lib/api.ts, gd-briefs pages, results/[id]
breaking: news GET now needs Lite JWT (frontend updated)

## 2026-06-09 — qa-loggedin-phase3 — onboarding x-pathname-on-request, free clarifications=0, college-email throttle+domain, lite bookmarks=0, API_URL guard
breaking: no

## 2026-06-09 — qa-loggedin-phase4 — block inactive cases, useEffect page-reset, eslintrc
breaking: no

## 2026-06-09 — industry-primers — FMCG primer added (No. 23)
Third Industry Primer "FMCG" (No. 23) shipped as a fact-checked static page at /primers/fmcg,
registered in lib/primers/index.ts. Data verified & restated (FY2030 size $1,288B→~$643B;
CAGR ~28%→~17%; internet users 780M→~1.0Bn; GDP ~3.5%→~3%; urban share 65%→~62%; "81% domestic /
1.3% global" flagged as unverified). Additive — registry entry + static asset only; no
route/nav/contract change.
touches: public/primers/fmcg/**, lib/primers/index.ts
breaking: no   affects: none

## 2026-06-09 — industry-primers — Cement primer added (No. 22)
Second Industry Primer "Cement" (No. 22) shipped as a fact-checked static page at
/primers/cement, registered in lib/primers/index.ts. Data verified & restated
(industry size $143B→~$27B; GST 28%→18% now law (Sep 2025); top-5 share ~60%; global
capacity >8%; India Cements/Kesoram now under UltraTech; "Top-4 75%"→Top-20 ~70% output).
Additive — registry entry + static asset only; no route/nav/contract change.
touches: public/primers/cement/**, lib/primers/index.ts
breaking: no   affects: none

## 2026-06-08 — industry-primers — (in tree, build-gate pending)
New Learn → Industry Primers section; first primer "Aviation" (No. 21) shipped as a
self-contained, fact-checked static page embedded via /primers/aviation. Data verified
& restated (SAF 1% by 2027/intl-first, Indian-carrier intl share ~45%, order book ~1,600,
Air India Group ~27% post-Vistara merger, market ~$26B/~12% CAGR, Bharatiya Vayuyan
Adhiniyam 2024). New routes + static asset only; no contract change.
touches: public/primers/**, app/(app)/learn/industry-primers/**, lib/primers/*
breaking: no   affects: none

## 2026-06-08 — dashboard-mobile-darkmode + onboarding-profile — 8cbdb69
Dashboard: mobile-responsive (useIsMobile hook + stacked grids in
dashboard-client/hero/constellation/command-panel/consistency-card/news-card),
dark-mode parity (--card-hex / --map-center / --hero-grad-*, --cluster-*
palette flipped per theme), cardinal red restored to #C8102E in both modes
(.dark --red / --primary / --cluster-prof previously drifted to salmon).
New feature: user onboarding (single-scroll form: name, college combobox
with 'Other', batch year, placement focus, optional analytics fields) +
forced redirect via (app)/layout, profile page rebuild with avatar upload
(Supabase Storage), college email verification flow (Supabase
admin.generateLink + SHA-256 token, 24h expiry).
touches: hooks/use-is-mobile.tsx, components/dashboard/*,
components/dashboard-client.tsx, components/onboarding/onboarding-form.tsx,
components/profile/profile-client.tsx, app/globals.css,
app/(app)/onboarding/page.tsx, app/(app)/profile/page.tsx,
app/(app)/layout.tsx, lib/supabase/middleware.ts, lib/types.ts,
lib/types-onboarding.ts, app/api/onboarding/complete/route.ts,
app/api/college-email/{send,verify}/route.ts,
supabase/migrations/0005_user_onboarding.sql
breaking: yes — C6 users schema (new). Additive only; existing readers unaffected.
affects: Dashboard, Profile, future GD-cohort feature

## 2026-06-08 — dashboard-wire — 3304ecf
Constellation wired to live data (per-node mastery, real recent attempts,
data-driven dots + halo, cluster routing, backfilled cases, 11 seed cases for
empty clusters). Hero/News/Guesstimate buttons functional. Career ladder
extended to 10 exponential tiers with auto-scroll + breathing halo. Loading
skeletons + cached auth = ~200–400ms shaved per nav. Boss→Today's focus.
touches: lib/dashboard/*, lib/career-tiers.ts, lib/supabase/auth-cached.ts,
app/(app)/dashboard/*, app/(app)/layout.tsx, app/(app)/gd-briefs/[id]/page.tsx,
app/(app)/loading.tsx, app/api/news/[briefId]/to-case/route.ts,
components/dashboard/*, components/dashboard-client.tsx,
components/practice-hub.tsx, app/globals.css,
supabase/migrations/0004_dashboard_skills.sql,
supabase/seed-skill-graph.sql, supabase/seed-cases-constellation.sql
breaking: yes — C1 cases (v3 → v4)   affects: Dashboard, Guesstimate, Daily-content, Casebook

## 2026-06-07 — dashboard-focusplus — 7b8a2a7
Focus+ redesign ported to live data: FocusHero, SkillConstellation (9 real nodes, oval-fixed HTML halo), recomposed dashboard-client; social proof dropped; §G3 guesstimate exclusion preserved. Route count 143->142 (main branch baseline was 142, no routes added or dropped).
touches: components/dashboard/*, dashboard-client.tsx, dashboard/page.tsx, globals.css
breaking: no   affects: none

## 2026-06-06 — gd-cheatsheet — d61c7c0
Pro-only Cheat Sheet: "Add to cheat sheet" on GD-brief data points captures them to new per-user `cheat_sheets`/`cheat_sheet_items` (RLS, pro-gated at UI + /api/cheatsheet + INSERT policy); new /cheat-sheet page groups saved points by topic with per-item notes/delete. Frontend + Supabase only; wires the previously-unused TierGate.
touches: supabase/migrations/0003_cheat_sheet.sql, lib/types.ts, lib/cheatsheet.ts, app/api/cheatsheet/{route,[itemId]/route}.ts, app/(app)/cheat-sheet/page.tsx, components/cheat-sheet/*, app/(app)/gd-briefs/[id]/page.tsx, components/app-nav.tsx
breaking: no   affects: none

## 2026-06-06 — reconciliation-audit — Phase 1 verification
Verified file presence and wiring for Guesstimate end-to-end (G1-G4), AI evaluation v2, Dashboard tiles, and Casebook misc frameworks. All confirmed present and flipped to BUILT.
touches: .brain/LEDGER.md
breaking: no   affects: none

## 2026-06-06 — reconciliation-audit — doc-vs-code sweep
Verified file presence + wiring against the latest upload. Flipped a whole cluster from "pending/not-built" to **BUILT & LIVE**: §9.31 daily-content+admin+keep-alive, §9.32 news pipeline, §9.33 dashboard daily tiles, §9.28 interviewer+conversational solve, plus structured items — payments audit trail (Razorpay verify+webhook write `payments`), voice input (Whisper/transcribe), image input (vision/extract-text), rate limiting (attempts.py), analytics (@vercel/analytics), privacy+terms pages, and badge_awarder (wired, graceful — not a crash). Still genuinely open: `vercel.json` (region pin), refund-policy page, `users.streak_count` column write. See PROJECT_BRAIN_MERGED.md "2026-06-06 FULL RECONCILIATION AUDIT".
touches: (status reconciliation only — no code change)
breaking: no   affects: none

## 2026-06-06 — casebook-guesstimates — (in tree, build-gate pending)
Guesstimates promoted from last section to **B** (`defaultOpen`); new 239-line "The Pain & The Promise" overview page (names the 30/25/20/15/10 rubric); 9 dead placeholder nav nodes removed; sections re-lettered C..F. See brain §9.38.
touches: lib/casebook/tree.ts, lib/casebook/content/index.ts, lib/casebook/content/guesstimates/pain-and-promise.ts
breaking: no — Casebook-Page-schema (C3) consumer only; route count changes on build (+1 real, −9 dead)   affects: Casebook

## 2026-06-06 — case-solve-unified — (in tree, build-gate pending)
`ConversationalSolve` now takes `initialCase` (server-passed, no re-fetch) / `historyPanel` / `lockedOverlay`; lock renders as an overlay (not a separate page); history+rating render inside the workspace. See brain §9.39.
touches: app/(app)/cases/[id]/page.tsx, components/solve/ConversationalSolve.tsx
breaking: no — reads existing cases shape (C1 reader only)   affects: none

## 2026-06-06 — nav+history-persistence — (in tree, build-gate pending)
Casebook nav-tree and attempt-history expand/collapse state now persist to `sessionStorage` with an `isMounted` hydration guard; nav defaults open only for "Getting Started"; attempt accordion defaults collapsed. See brain §9.40–9.41.
touches: components/casebook/nav-tree.tsx, components/case-attempt-history.tsx
breaking: no   affects: none

## 2026-06-06 — practice-hub-polish — (in tree, build-gate pending)
"Attempted" badge restyled to a success pill and relocated next to the difficulty chip; long attempt answers scroll-capped at 35vh. See brain §9.41.
touches: components/practice-hub.tsx, components/case-attempt-history.tsx
breaking: no   affects: none

## 2026-06-02 — backstop-fix — **BUILT & LIVE** (verified in code 2026-06-06)
Rewrote guesstimate arithmetic backstop: base/literal steps use stated value (never 0), only derived steps with all-finite inputs are flagged, `percent_of` handles %/ref/commas without crashing; if nothing verifiable, defer to LLM arithmetic. Fixed live false "all-zero" (e-rickshaw scored 71→77). `guesstimate_backstop.py` carries the "2026-06-02 hardening" docstring.
touches: services/guesstimate_backstop.py, prompts/guesstimate_scoring_prompt.py
breaking: no — return keys unchanged (total/dimensions/arithmeticOverridden/rawTotal + backstop.findings/summary/notChecked/totalCapFactor)   affects: none

## 2026-06-02 — guesstimate-G4 — **BUILT & LIVE** (verified in code 2026-06-06)
69 static guesstimates are attemptable `cases` rows; `code` column + FULL `cases_code_unique` index folded into `0001_baseline_schema.sql`; practice-hub Guesstimates tab is DB-driven (`cases` where `type='guesstimate'`); answer hidden pre-attempt. The standalone `add-code-column.sql`/`seed-guesstimates.sql` files were merged into baseline and no longer exist separately. **Guesstimate answerable end-to-end (G1–G4): DONE.**
touches: components/practice-hub.tsx, lib/types.ts, supabase/migrations/0001_baseline_schema.sql
breaking: yes — DB:`cases` gained `code text` (additive, now in baseline)   affects: Daily-content, Dashboard (no read change)

## 2026-06-02 — daily-content/admin/keep-alive — §9.31
Daily case/guesstimate generator rewritten to the REAL `cases` schema (was inserting nonexistent columns → 500s); admin 401/500 fixed; self-contained GitHub-Actions keep-alive + cold-start pre-warm.
touches: services/content_generator.py, routes/daily.py, routes/cron.py, app/(app)/admin/*, .github/workflows/*
breaking: no   affects: none

## 2026-06-02 — dashboard — §9.23–9.26
Dashboard rebuilt: Readiness Score v1, radar→bullet charts, next-action engine, monetization surface; /home merged into /dashboard; entry choreography + ambient motion (reduced-motion gated); Supabase getSession→getUser auth fix. 143 static pages.
touches: components/dashboard/*, lib/readiness.ts, lib/next-action.ts, app/(app)/dashboard/page.tsx
breaking: no   affects: none

## 2026-06-01 — casebook — §9.18–9.21
Casebook Core-Frameworks 9/9 + Toolkit 9/9 complete (10 cards across 9 nav slots); Miscellaneous Frameworks node authored as M&A-style hybrid.
touches: lib/casebook/content/**, components/casebook/*
breaking: yes (historical) — Casebook-Page-schema: NO `subtitleEmphasize`; `kind:"toolkit"` added   affects: any future Casebook page

# CHANGELOG â€” newest first, one entry per landed change

Format (Antigravity appends on each merge):
```
## <date> â€” <feature> â€” <commit short sha>
<one line: what changed>
touches: <files/areas>
breaking: <no | yes â€” which CONTRACTS.md surface>   affects: <features that must re-sync>
```
A brain reading this at session start only needs the top ~15 lines.

---

## 2026-06-21 — gd-news-free-access — <pending commit, 2 repos>
Free members can now browse the GD news list (backend GET /news/headlines opened to all signed-in users; was Lite-gated). Generating AND viewing a GD brief stays Lite/Pro — server-enforced on both /news/briefs/{id} endpoints — with an 'Unlock with Lite' upgrade CTA on each headline card (full-page wall removed). Also bounded the headline-classifier OpenAI call (timeout=45,max_retries=2) to finish the cron-robustness review.
touches: consilio/app/(app)/gd-briefs/page.tsx, consilio/app/(app)/gd-briefs/[id]/page.tsx; consilio-backend/routes/news.py, services/headline_classifier.py
breaking: no   affects: GD Briefs, News pipeline (tier surface)

## 2026-06-21 — harden-cron-keepalive — <pending commit>
Made the automated daily jobs fool-proof against Render free-tier cold starts: (1) daily-news.yml now WAITS for /health=200 before firing work + stronger retries (6x, 600s) + always-chains schedule-daily; (2) new keep-alive.yml pre-warms the dyno every 10 min in the 00:00 UTC window; (3) /api/cron/refresh rewritten with a warm-up poll loop + retried kicks that treat a timeout as 'work continues server-side' and always return 200 (a slow-but-working backend no longer shows as a failed cron); also accepts x-cron-secret. Both triggers (GH Actions + Vercel cron) are idempotent and redundant.
touches: .github/workflows/daily-news.yml, .github/workflows/keep-alive.yml (new), app/api/cron/refresh/route.ts
breaking: no   affects: Daily content + keep-alive (cron triggers only; backend job code unchanged)

## 2026-06-21 — daily-guesstimate-cta — <pending commit>
Added a dedicated 'Start the guesstimate' primary button to the dashboard daily-guesstimate card (mirrors the daily case's 'Start the case' CTA); routes to /cases/{id}, replaces the subtle 'attempt now →' text. Falls back to 'Browse guesstimates' when no daily.
touches: components/dashboard/guesstimate-card.tsx
breaking: no   affects: Dashboard daily tiles

## 2026-06-21 — fix-daily-link-resolution — <pending commit>
Daily case + guesstimate tiles fell back to /practice whenever the day's guesstimate was scheduled by short code: daily-server resolved guesstimate_code via eq('id', <code>) against the uuid id column, which threw and — under Promise.all — rejected the whole batch, nulling BOTH daily picks. Now resolves daily refs by id OR code (UUID_RE) and uses Promise.allSettled so one bad lookup can't null the others. access.ts likewise matches the daily guesstimate by id or code (was wrongly locking free users out of the daily guesstimate); caller passes caseRow.code. Recurs-on-new-daily bug.
touches: lib/daily-server.ts, lib/access.ts, app/(app)/cases/[id]/page.tsx
breaking: no   affects: Dashboard daily tiles, Case solve UX (free-tier daily gating)

## 2026-06-21 — practice-domains-seed — <pending commit + DB run>
Added supabase/seed-cases-domains.sql: 7 new practice domains as first-class case TYPES — `market entry`, `pricing`, `m&a`, `operations`, `cost reduction`, `go to market`, `competitive strategy` — 5 mixed-difficulty cases each; topped up `market_sizing` (+4); +6 mixed-difficulty guesstimates. 45 rows total. Mirrors seed-cases-constellation.sql exactly (markdown ~15-min prompts, interview_meta, skill_cluster tag, skill_node NULL). Requires new migration 0017_cases_type_expand.sql (widens the cases.type CHECK — additive, non-breaking) to run first; also added display labels for the new types in lib/constants.ts (CASE_TYPE_LABELS). Idempotent ON CONFLICT (code). With existing profitability/growth, the /practice 'All domains' dropdown becomes ~10 domains, each with >=5 attemptable questions. NOTE: must be run against Supabase to take effect (data, not schema).
touches: supabase/seed-cases-domains.sql (new)
breaking: no — additive rows to `cases` (no column/schema change, not a C1 contract event)   affects: Practice hub, DB:cases (rows)

## 2026-06-21 — testimonials-carousel-overhaul — <pending commit>
Redesigned the landing testimonials carousel: uniform fixed-height (340px) cards with the quote clamped (line-clamp-6) and the author pinned to the bottom, so varying quote lengths no longer distort the row or leave one card clipped. Removed the bulky outer Card frame; hidden the native scrollbar and added soft edge-fades + polished round arrow controls. ≤3 testimonials center; >3 become a snap carousel.
touches: components/testimonials-carousel.tsx
breaking: no   affects: landing page

## 2026-06-21 — fix-practice-domains-and-caselib-links — <pending commit>
/practice domain dropdown now lists only real scored-case categories, so every domain resolves to attemptable practice questions. Removed the Case Studies tab/cards and ALL read-only deep-links: /learn/practice-case-library# (study cards + randomizer fallback) and the guesstimate card's /learn/guesstimates-market-sizing# 'Walkthrough'. Tabs now All/Scored/Guesstimates/Attempted; guesstimate card shows only Solve →. Legacy ?tab=studies is sanitized to 'all'.
touches: components/practice-hub.tsx
breaking: no   affects: Practice hub (Guesstimate end-to-end / Case solve UX surface)

## 2026-06-20 — mece-framework-page — <pending commit>
Added a dedicated MECE page (Mutually Exclusive, Collectively Exhaustive) as the FIRST entry under Core Frameworks; covers the two failure modes (overlap/gap), five MECE-by-construction split axes, a 10-second check, and cross-links Structuring fundamentals. Runtime-verified (12 blocks, valid types, 5×3 table, on-grammar SVG).
touches: lib/casebook/content/frameworks/mece.ts (new), lib/casebook/content/index.ts, lib/casebook/tree.ts
breaking: no   affects: Casebook content/tree

## 2026-06-20 — fix-free-clarification-counter — f87fe5d
Free tier (0 clarification quota) no longer shows a misleading red 'Questions remaining: 0' chip + 'used all clarifications' banner on the working daily case/guesstimate; counter/banner render only when the tier actually has a quota (hasClarifications), with a structure-focused composer placeholder for free.
touches: components/solve/ConversationalSolve.tsx
breaking: no   affects: Case solve UX

## 2026-06-20 — landing-testimonials-placement — 055ce98
Moved testimonials from page-bottom to mid-page (right after the Cases feature, ~40% vs ~85% scroll) + a strong testimonial beside the final navy CTA; testimonials section bg set to plain to avoid card-on-card stacking.
touches: app/page.tsx
breaking: no   affects: landing page

## 2026-06-20 — pricing-drop-annual-b2b — 2901f0b
Removed the Annual billing option from the /upgrade and /pricing toggles (BILLING_PERIODS → monthly + quarter). The BillingPeriod type, TIER_PRICING, BILLING_PERIOD_DAYS/LABELS/SUFFIX and isBillingPeriod() still keep 'annual' so legacy annual subscribers and the Razorpay order route stay backward-compatible. Added a low-emphasis "Colleges & clubs" B2B contact strip (mailto:team@mece.in, no public quote) beneath the plan cards on both pages.
touches: lib/tier.ts, app/(app)/upgrade/page.tsx, app/pricing/page.tsx, components/teams-contact-banner.tsx (new)
breaking: no   affects: Payments / pricing UI

## 2026-06-20 — primer-fullscreen-collapsible — 3fe6c89
Industry Primer pages get an in-app full-screen overlay (Back button top-left) + native Fullscreen API toggle, and a collapsible desktop nav rail that reflows the grid to full reading width. UI/chrome only; the primer bundles in public/primers are untouched. Dark-mode for the primer bundles deferred.
touches: components/casebook/primer-embed.tsx (now client), components/casebook/primer-workspace.tsx (new), components/casebook/casebook-reader.tsx
breaking: no   affects: Industry Primers, Casebook reader chrome

## 2026-06-20 — learn-clarifying-dropdowns — bf4c2b4
Every casebook worked example (26 guesstimates + 26 cases) now opens with a collapsible clarifying-questions dialogue (candidate↔interviewer + why-notes + a closing "What the questions locked" insight). Cases standardized from caseSection to the reveal dropdown; guesstimates newly added. Reuses existing reveal/dialogue/callout blocks.
touches: lib/casebook/content/guesstimates/*.ts (26), lib/casebook/content/cases/**/*.ts (26)
breaking: no   affects: Casebook (content)

## 2026-06-20 — nav-more-font-fix — 27a0be3
'More' nav item font size aligned to the other links (text-sm); removed a legacy globals.css override.
touches: components/app-nav.tsx, app/globals.css
breaking: no   affects: none

## 2026-06-19 — dynamic-domains-db — <hash>
Added per-user case_tags table (user-defined "domains"): FULL unique index on (user_id,case_id,tag_norm), 1-30 char check, RLS owner-only. Additive — does not touch cases. Migration verified idempotent (run twice) + dedup/length behaviour. UI to follow.
touches: supabase/migrations/0013_case_tags.sql
breaking: no   affects: none

## 2026-06-19 — gd-brief-summary — <hash>
GD-brief summary upgraded from a 2-3 sentence line to a substantive, neutral 120-180 word context paragraph (background + central tension, fairly stated, no side-taking); prompt-only, 8-key shape unchanged. Note: briefs cache per headline, so this affects new briefs.
touches: services/brief_generator.py
breaking: no   affects: none

## 2026-06-19 — input-limits — <hash>
Added max_length caps (20,000) to answer_text, conversational message content, and final_recommendation via net-new services/limits.py; mins unchanged; verified compile + behaviour (long structure posts still accepted, abuse dumps rejected).
touches: services/limits.py, routes/submit.py, routes/attempts.py, lib/limits.ts, submission-form.tsx, ConversationalSolve.tsx
breaking: no — C4 announce (request-shape constraint tightened)   affects: callers of /submit and /attempts/*

## 2026-06-19 — legal-refund — <hash>
Refund & Cancellation policy updated (no money-back guarantee, team@mece.in) and contrast bug fixed (text uses semantic foreground/muted tokens).
touches: app/refund/page.tsx
breaking: no   affects: none

## 2026-06-19 — feat/mobile-polish — <hash>
mobile-polish — fix pricing billing-toggle overflow on phones (full-width, stacked save%, 44px targets; desktop reverts at sm:); bottom-nav tap feedback; remove touch tap-flash
breaking: no — affects: none

## 2026-06-18 — feat/ui-batch-2 — <hash>
ui-batch-2 — mobile chat-first case session + case/attempts drawer; equal-height testimonials; profile sign-out; DraggableFab for feedback + casebook menu
breaking: no — affects: none

## 2026-06-18 — feat/engaging-loading — <hash>
engaging-loading — case prompt renders immediately (no full-screen spinner) + rotating curated quotes/facts loader (lib/loading-content + EngagingLoader) on case boot & GD-brief generation
breaking: no — affects: none

## 2026-06-18 — feat/testimonials-admin — <hash>
feat/testimonials-admin — Notion admin shell + DB-backed testimonials and team grid
touches: components/testimonials-carousel.tsx, components/team-grid.tsx, app/api/testimonials/route.ts, app/about/page.tsx, admin routes
breaking: no   affects: none
Notes: two new routes (/api/testimonials, /api/admin/testimonials/upload), new tables testimonials/team_members, storage bucket testimonials, admin restructured to routed sections.

## 2026-06-18 — fix/mobile-ui-pass — <hash>
mobile-ui-pass — hide tab bar + feedback on case session (composer no longer hidden) + safe-area pad; casebook menu FAB ? bottom-left (no feedback collision); landing Today's-case card mobile position; dark-mode rose chips
touches: components/mobile-bottom-nav.tsx, components/feedback/feedback-launcher.tsx, components/solve/ConversationalSolve.tsx, components/casebook/casebook-reader.tsx, app/page.tsx
breaking: no   affects: none

## 2026-06-18 — feat/feedback — <hash>
Global feedback launcher, panel, and admin triage queue.
touches: app/api/feedback/route.ts, components/feedback/*, app/(app)/layout.tsx, app/(app)/admin/feedback/*, lib/feedback.ts, supabase/migrations/0011_feedback.sql
breaking: no   affects: none
Notes: new route `app/api/feedback` (C4 additive), new table `feedback_reports`.
## 2026-06-18 — feat/cheatsheet — <hash>
Notion-style cheat sheet redesign with category rail.
touches: components/cheat-sheet/category-rail.tsx, components/cheat-sheet/cheat-sheet-client.tsx, app/(app)/cheat-sheet/page.tsx
breaking: no   affects: none
Notes: Client-side presentational layout shift only.

## 2026-06-14 â€” logo-swap â€” f1e00a6
feat(brand): new MECE logo across app â€” theme-aware, compact-in-nav / full-in-footer+auth. Overwrote legacy placeholders with modern mark + lockup variants.
touches: public/logo*, components/logo.tsx, components/footer.tsx, app/login/page.tsx, app/signup/page.tsx
breaking: no   affects: none
## 2026-06-14 â€” news-freshness â€” 2e4a9ee
GD briefs: /news/headlines now newest-first (last 3 days, star pinned, score tiebreak) + self-heal (auto-refetch if newest >24h old, retry once, 15-min throttle). Fetch logic extracted to services/news_pipeline.py; /cron/fetch-news delegates to it. New GitHub Actions daily 06:00 IST scheduler (fetch-news + schedule-daily + cleanup).
touches: consilio-backend/services/news_pipeline.py, consilio-backend/routes/news.py, consilio-backend/routes/cron.py, consilio/.github/workflows/daily-news.yml
breaking: no (behavioural; response shapes unchanged)   affects: News pipeline, Daily content
## 2026-06-14 â€” guesstimate-modules â€” 853905e
casebook: Guesstimates Pages 2-4 â€” Four Approaches, Ideal Flow, Pressure-Testing & Traps.
Inserted in Section B after Pain & Promise; +3 routes. P5 (cheat sheet) + P6 (worked solve) not wired.
touches: lib/casebook/content/guesstimates/{four-approaches,ideal-flow,pressure-testing}.ts, lib/casebook/tree.ts, lib/casebook/content/index.ts
breaking: no   affects: none

## 2026-06-13 â€” seo-entity-hardening â€” 9dcc745
seo-entity-hardening: entity disambiguation schema, reframed /about, detailed /methodology, homepage FAQ schema + scroll motion, mobile nav drawers, .gitattributes
touches: lib/seo.ts, components/casebook/eeat-signals.tsx, app/page.tsx, app/about/page.tsx, app/methodology/page.tsx, components/scroll-animations.tsx, app/globals.css, .gitattributes, components/landing-mobile-nav.tsx, components/app-nav.tsx
breaking: no   affects: none

## 2026-06-12 â€” industry-primers-ott â€” (pending)
industry-primers: add "20 Â· OTT" static bundle and wire up casebook registry
touches: public/primers/ott/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-12 â€” industry-primers-oil-gas â€” 817d216
industry-primers: add "19 Â· Oil & Gas" static bundle and wire up casebook registry
touches: public/primers/oil-gas/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-12 â€” industry-primers-logistics â€” d3f0ed9
industry-primers: add "18 Â· Logistics" static bundle and wire up casebook registry
touches: public/primers/logistics/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-12 â€” industry-primers-it-ites â€” 2237f73
industry-primers: add "17 Â· IT & ITeS" static bundle and wire up casebook registry
touches: public/primers/it-ites/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 â€” industry-primers-iron-steel â€” 65971b7
industry-primers: add "16 Â· Iron & Steel" static bundle and wire up casebook registry
touches: public/primers/iron-steel/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 â€” industry-primers-insurance â€” 254de4c
industry-primers: add "15 Â· Insurance" static bundle and wire up casebook registry
touches: public/primers/insurance/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 â€” industry-primers-hospitality â€” f174214
industry-primers: add "14 Â· Hospitality" static bundle and wire up casebook registry
touches: public/primers/hospitality/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 â€” industry-primers-cement â€” 39e4f21
industry-primers: add "13 Â· Cement" static bundle and wire up casebook registry
touches: public/primers/cement/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 â€” industry-primers-automobile â€” de3573e
industry-primers: add "12 Â· Automobile" static bundle and wire up casebook registry
touches: public/primers/automobile/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 â€” industry-primers-healthcare â€” c5d70b9
industry-primers: add "11 Â· Healthcare" static bundle and wire up casebook registry
touches: public/primers/healthcare/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 â€” deck-vault-drm-and-pro-pivot â€” ce11ebf
vault: heavy canvas PDF viewer (react-pdf), sticky blur blackout, hostile keyboard screenshot blockers, forensic identity watermarking (MECE - Email - UserID).
touches: components/pdf-viewer.tsx, app/(app)/skeletons/view/[id]/page.tsx, components/skeleton-library.tsx, app/(app)/skeletons/page.tsx, app/api/skeletons/file/[deckId]/route.ts
breaking: yes â€” file proxy streams PDF to canvas, native browser downloads and right-clicks are totally disabled. Vault access now requires the 'pro' subscription_tier instead of standalone purchase.   affects: Vault, Payments

## 2026-06-09 â€” news-daily-fix â€” Vercel Cron backup for /cron/fetch-news + /cron/schedule-daily (daily brief refresh no longer depends on GitHub Actions), news fetch timeouts + "waking up" hint so GD Briefs never spins forever
breaking: no

## 2026-06-09 â€” dashboard-polish â€” real constellation locks (no attempt on locked nodes), removed decorative PRO ghost strip, Recent card real-only (no mock), proof rail shows first names, constellation contrast boost
breaking: no

## 2026-06-09 â€” onboarding-503-fix â€” move onboarding gate from (app) layout (fragile headers() path read -> redirect loop -> 503) into middleware (reliable pathname)
breaking: no

## 2026-06-09 â€” leaderboard-rebuild â€” 3 live views (All-India / Daily / Cohort) + FOMO standing card + LinkedIn share
touches: lib/dashboard/leaderboards.ts (new), leaderboard page + client
breaking: no

## 2026-06-09 â€” dashboard-fomo-real â€” peer-proximity / proof-rail / guesstimate-card now use live data, honest empty states
breaking: no

## 2026-06-09 â€” qa-loggedin-phase1 â€” users RLS + service-role leaderboard/dashboard reads
touches: 0006_rls.sql, leaderboard, dashboard
breaking: data-access policy (announce); deploy code before SQL â€” affects: leaderboard/dashboard

## 2026-06-09 â€” qa-loggedin-phase2 â€” GD-brief/headlines Lite+ gate + results IDOR filter
touches: routes/news.py, lib/api.ts, gd-briefs pages, results/[id]
breaking: news GET now needs Lite JWT (frontend updated)

## 2026-06-09 â€” qa-loggedin-phase3 â€” onboarding x-pathname-on-request, free clarifications=0, college-email throttle+domain, lite bookmarks=0, API_URL guard
breaking: no

## 2026-06-09 â€” qa-loggedin-phase4 â€” block inactive cases, useEffect page-reset, eslintrc
breaking: no

## 2026-06-09 â€” industry-primers â€” FMCG primer added (No. 23)
Third Industry Primer "FMCG" (No. 23) shipped as a fact-checked static page at /primers/fmcg,
registered in lib/primers/index.ts. Data verified & restated (FY2030 size $1,288Bâ†’~$643B;
CAGR ~28%â†’~17%; internet users 780Mâ†’~1.0Bn; GDP ~3.5%â†’~3%; urban share 65%â†’~62%; "81% domestic /
1.3% global" flagged as unverified). Additive â€” registry entry + static asset only; no
route/nav/contract change.
touches: public/primers/fmcg/**, lib/primers/index.ts
breaking: no   affects: none

## 2026-06-09 â€” industry-primers â€” Cement primer added (No. 22)
Second Industry Primer "Cement" (No. 22) shipped as a fact-checked static page at
/primers/cement, registered in lib/primers/index.ts. Data verified & restated
(industry size $143Bâ†’~$27B; GST 28%â†’18% now law (Sep 2025); top-5 share ~60%; global
capacity >8%; India Cements/Kesoram now under UltraTech; "Top-4 75%"â†’Top-20 ~70% output).
Additive â€” registry entry + static asset only; no route/nav/contract change.
touches: public/primers/cement/**, lib/primers/index.ts
breaking: no   affects: none

## 2026-06-08 â€” industry-primers â€” (in tree, build-gate pending)
New Learn â†’ Industry Primers section; first primer "Aviation" (No. 21) shipped as a
self-contained, fact-checked static page embedded via /primers/aviation. Data verified
& restated (SAF 1% by 2027/intl-first, Indian-carrier intl share ~45%, order book ~1,600,
Air India Group ~27% post-Vistara merger, market ~$26B/~12% CAGR, Bharatiya Vayuyan
Adhiniyam 2024). New routes + static asset only; no contract change.
touches: public/primers/**, app/(app)/learn/industry-primers/**, lib/primers/*
breaking: no   affects: none

## 2026-06-08 â€” dashboard-mobile-darkmode + onboarding-profile â€” 8cbdb69
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
breaking: yes â€” C6 users schema (new). Additive only; existing readers unaffected.
affects: Dashboard, Profile, future GD-cohort feature

## 2026-06-08 â€” dashboard-wire â€” 3304ecf
Constellation wired to live data (per-node mastery, real recent attempts,
data-driven dots + halo, cluster routing, backfilled cases, 11 seed cases for
empty clusters). Hero/News/Guesstimate buttons functional. Career ladder
extended to 10 exponential tiers with auto-scroll + breathing halo. Loading
skeletons + cached auth = ~200â€“400ms shaved per nav. Bossâ†’Today's focus.
touches: lib/dashboard/*, lib/career-tiers.ts, lib/supabase/auth-cached.ts,
app/(app)/dashboard/*, app/(app)/layout.tsx, app/(app)/gd-briefs/[id]/page.tsx,
app/(app)/loading.tsx, app/api/news/[briefId]/to-case/route.ts,
components/dashboard/*, components/dashboard-client.tsx,
components/practice-hub.tsx, app/globals.css,
supabase/migrations/0004_dashboard_skills.sql,
supabase/seed-skill-graph.sql, supabase/seed-cases-constellation.sql
breaking: yes â€” C1 cases (v3 â†’ v4)   affects: Dashboard, Guesstimate, Daily-content, Casebook

## 2026-06-07 â€” dashboard-focusplus â€” 7b8a2a7
Focus+ redesign ported to live data: FocusHero, SkillConstellation (9 real nodes, oval-fixed HTML halo), recomposed dashboard-client; social proof dropped; Â§G3 guesstimate exclusion preserved. Route count 143->142 (main branch baseline was 142, no routes added or dropped).
touches: components/dashboard/*, dashboard-client.tsx, dashboard/page.tsx, globals.css
breaking: no   affects: none

## 2026-06-06 â€” gd-cheatsheet â€” d61c7c0
Pro-only Cheat Sheet: "Add to cheat sheet" on GD-brief data points captures them to new per-user `cheat_sheets`/`cheat_sheet_items` (RLS, pro-gated at UI + /api/cheatsheet + INSERT policy); new /cheat-sheet page groups saved points by topic with per-item notes/delete. Frontend + Supabase only; wires the previously-unused TierGate.
touches: supabase/migrations/0003_cheat_sheet.sql, lib/types.ts, lib/cheatsheet.ts, app/api/cheatsheet/{route,[itemId]/route}.ts, app/(app)/cheat-sheet/page.tsx, components/cheat-sheet/*, app/(app)/gd-briefs/[id]/page.tsx, components/app-nav.tsx
breaking: no   affects: none

## 2026-06-06 â€” reconciliation-audit â€” Phase 1 verification
Verified file presence and wiring for Guesstimate end-to-end (G1-G4), AI evaluation v2, Dashboard tiles, and Casebook misc frameworks. All confirmed present and flipped to BUILT.
touches: .brain/LEDGER.md
breaking: no   affects: none

## 2026-06-06 â€” reconciliation-audit â€” doc-vs-code sweep
Verified file presence + wiring against the latest upload. Flipped a whole cluster from "pending/not-built" to **BUILT & LIVE**: Â§9.31 daily-content+admin+keep-alive, Â§9.32 news pipeline, Â§9.33 dashboard daily tiles, Â§9.28 interviewer+conversational solve, plus structured items â€” payments audit trail (Razorpay verify+webhook write `payments`), voice input (Whisper/transcribe), image input (vision/extract-text), rate limiting (attempts.py), analytics (@vercel/analytics), privacy+terms pages, and badge_awarder (wired, graceful â€” not a crash). Still genuinely open: `vercel.json` (region pin), refund-policy page, `users.streak_count` column write. See PROJECT_BRAIN_MERGED.md "2026-06-06 FULL RECONCILIATION AUDIT".
touches: (status reconciliation only â€” no code change)
breaking: no   affects: none

## 2026-06-06 â€” casebook-guesstimates â€” (in tree, build-gate pending)
Guesstimates promoted from last section to **B** (`defaultOpen`); new 239-line "The Pain & The Promise" overview page (names the 30/25/20/15/10 rubric); 9 dead placeholder nav nodes removed; sections re-lettered C..F. See brain Â§9.38.
touches: lib/casebook/tree.ts, lib/casebook/content/index.ts, lib/casebook/content/guesstimates/pain-and-promise.ts
breaking: no â€” Casebook-Page-schema (C3) consumer only; route count changes on build (+1 real, âˆ’9 dead)   affects: Casebook

## 2026-06-06 â€” case-solve-unified â€” (in tree, build-gate pending)
`ConversationalSolve` now takes `initialCase` (server-passed, no re-fetch) / `historyPanel` / `lockedOverlay`; lock renders as an overlay (not a separate page); history+rating render inside the workspace. See brain Â§9.39.
touches: app/(app)/cases/[id]/page.tsx, components/solve/ConversationalSolve.tsx
breaking: no â€” reads existing cases shape (C1 reader only)   affects: none

## 2026-06-06 â€” nav+history-persistence â€” (in tree, build-gate pending)
Casebook nav-tree and attempt-history expand/collapse state now persist to `sessionStorage` with an `isMounted` hydration guard; nav defaults open only for "Getting Started"; attempt accordion defaults collapsed. See brain Â§9.40â€“9.41.
touches: components/casebook/nav-tree.tsx, components/case-attempt-history.tsx
breaking: no   affects: none

## 2026-06-06 â€” practice-hub-polish â€” (in tree, build-gate pending)
"Attempted" badge restyled to a success pill and relocated next to the difficulty chip; long attempt answers scroll-capped at 35vh. See brain Â§9.41.
touches: components/practice-hub.tsx, components/case-attempt-history.tsx
breaking: no   affects: none

## 2026-06-02 â€” backstop-fix â€” **BUILT & LIVE** (verified in code 2026-06-06)
Rewrote guesstimate arithmetic backstop: base/literal steps use stated value (never 0), only derived steps with all-finite inputs are flagged, `percent_of` handles %/ref/commas without crashing; if nothing verifiable, defer to LLM arithmetic. Fixed live false "all-zero" (e-rickshaw scored 71â†’77). `guesstimate_backstop.py` carries the "2026-06-02 hardening" docstring.
touches: services/guesstimate_backstop.py, prompts/guesstimate_scoring_prompt.py
breaking: no â€” return keys unchanged (total/dimensions/arithmeticOverridden/rawTotal + backstop.findings/summary/notChecked/totalCapFactor)   affects: none

## 2026-06-02 â€” guesstimate-G4 â€” **BUILT & LIVE** (verified in code 2026-06-06)
69 static guesstimates are attemptable `cases` rows; `code` column + FULL `cases_code_unique` index folded into `0001_baseline_schema.sql`; practice-hub Guesstimates tab is DB-driven (`cases` where `type='guesstimate'`); answer hidden pre-attempt. The standalone `add-code-column.sql`/`seed-guesstimates.sql` files were merged into baseline and no longer exist separately. **Guesstimate answerable end-to-end (G1â€“G4): DONE.**
touches: components/practice-hub.tsx, lib/types.ts, supabase/migrations/0001_baseline_schema.sql
breaking: yes â€” DB:`cases` gained `code text` (additive, now in baseline)   affects: Daily-content, Dashboard (no read change)

## 2026-06-02 â€” daily-content/admin/keep-alive â€” Â§9.31
Daily case/guesstimate generator rewritten to the REAL `cases` schema (was inserting nonexistent columns â†’ 500s); admin 401/500 fixed; self-contained GitHub-Actions keep-alive + cold-start pre-warm.
touches: services/content_generator.py, routes/daily.py, routes/cron.py, app/(app)/admin/*, .github/workflows/*
breaking: no   affects: none

## 2026-06-02 â€” dashboard â€” Â§9.23â€“9.26
Dashboard rebuilt: Readiness Score v1, radarâ†’bullet charts, next-action engine, monetization surface; /home merged into /dashboard; entry choreography + ambient motion (reduced-motion gated); Supabase getSessionâ†’getUser auth fix. 143 static pages.
touches: components/dashboard/*, lib/readiness.ts, lib/next-action.ts, app/(app)/dashboard/page.tsx
breaking: no   affects: none

## 2026-06-01 â€” casebook â€” Â§9.18â€“9.21
Casebook Core-Frameworks 9/9 + Toolkit 9/9 complete (10 cards across 9 nav slots); Miscellaneous Frameworks node authored as M&A-style hybrid.
touches: lib/casebook/content/**, components/casebook/*
breaking: yes (historical) â€” Casebook-Page-schema: NO `subtitleEmphasize`; `kind:"toolkit"` added   affects: any future Casebook page












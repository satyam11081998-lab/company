# PROJECT_BRAIN — MECE (MERGED)
**Generated:** 2026-05-27 (Updated: 2026-06-01 IST — Core-Frameworks + Toolkit (9/9) complete; NEW Section G · Miscellaneous Frameworks authored — 9 pages, 5 nested groups; Casebook route count → 104 on build; **Dashboard rebuilt** — Readiness Score v1 + radar→bullet-charts + next-action engine + monetization surface, authored to handoff §9.23; **v2 density fix + dark-mode tick patch 2026-06-02, BUILT** — 143 static pages — see §9.23; **/home merged into /dashboard** as one logged-in surface, daily picks on top + testimonials removed from app, authored to handoff §9.24; **dashboard made "alive" §9.25** — entry choreography + ambient motion, reduced-motion-gated; **Supabase getSession→getUser auth-warning fix §9.26; **AI evaluation v2 spec locked §9.27 — two-brain evaluator, tiered interaction, type+core rubrics; **Brain 1 interviewer prototype built §9.28; **guesstimate rubric v0.1 distilled §9.29; **arithmetic backstop built+INTEGRATED §9.30** — deterministic math-checker live in evaluator, fixes audit weakness #1; **DAILY-CONTENT + ADMIN + KEEP-ALIVE fix authored to handoff §9.31, 2026-06-02** — daily case/guesstimate generator rewritten to the REAL `cases` schema (was inserting nonexistent columns → 500s), daily guesstimate now an attemptable `cases` row, admin 401/500 fixed, self-contained GitHub-Actions keep-alive + cold-start pre-warm; **GUESSTIMATES SECTION MADE REAL + PROMOTED 2026-06-06 §9.38** — new "The Pain & The Promise" overview page (the section on-ramp, names the 30/25/20/15/10 rubric), Casebook tree reordered (Guesstimates F→**B**, `defaultOpen`), 9 placeholder nodes deleted; **CASE SOLVE PAGE UNIFIED §9.39** — `ConversationalSolve` now takes `initialCase`/`historyPanel`/`lockedOverlay`, lock is an overlay not a separate page, history+rating render inside the workspace; **CASEBOOK NAV PERSISTENCE §9.40** — expand/collapse persisted to `sessionStorage` per node + hydration guard; **ATTEMPT-HISTORY + PRACTICE-HUB POLISH §9.41** — attempt accordion open-state persisted, answer scroll-capped 35vh, "Attempted" badge restyled/relocated. **§9.38–§9.41 captured 2026-06-06 from the latest `company-main` upload — present IN THE TREE (build-gate pending); backend `backend-main` UNCHANGED vs prior upload.**)
**Sources:** `company-main__3_.zip` → latest `company-main__1_.zip` (Claude) + live filesystem `c:\Users\satya\Videos\company\consilio\` (Antigravity)
**Method:** Code-first reconciliation against conversation history. Merged from two independent extraction sessions (Claude + Antigravity) with cross-validated corrections.

> **2026-05-31 UPDATE NOTE:** This revision appends the full Casebook Core-Frameworks build work completed through 31 May 2026 (Pricing framework, the complete M&A/PE cluster, the SVG visual-grammar system, the self-render QA pipeline, and the hybrid-node nav fix). New material lives in the Casebook changelog (§9.10–§9.17) and a single reconciliation note (§0 below). **No prior section was rewritten or removed** — only the header, one reconciliation note, and net-new §9.x changelog entries were added, so all earlier line-level facts remain intact for diffing. Where an older section conflicts with a newer one, the newer entry and §0 are authoritative.

> **2026-06-06 STATUS CORRECTION (code-verified against latest upload):** Several §9.x entries were left at "AUTHORED & verified Claude-side, SHIPPED to handoff — pending Antigravity build". Re-checking the latest `company-main` + `backend-main` uploads shows this work is **BUILT & LIVE in code**, not pending. Authoritative status flips: **§9.34/§9.35/§9.36 (Guesstimate answerable end-to-end, G1–G4) = BUILT** — `components/practice-hub.tsx` Guesstimates tab is DB-driven (`cases` where `type='guesstimate'`, comment "the 69"); the `code text` column + **FULL** `cases_code_unique` index are folded into `supabase/migrations/0001_baseline_schema.sql` (lines 50/52); the separate `add-code-column.sql`/`seed-guesstimates.sql` handoff files were merged in and no longer exist standalone. **§9.37 (backstop false-"all-zero" fix) = BUILT** — `services/guesstimate_backstop.py` carries the "2026-06-02 hardening" docstring and the `verifiable`-gated literal/base-step logic. Treat the "pending Antigravity build" wording in §9.34–§9.37 as historical. (Lesson, and the reason this whole sync system exists: status must be **generated from the repo/build**, never hand-carried — a copied-forward "pending" is exactly the staleness the `.brain/` proof-of-sync gate is designed to catch.)

> **2026-06-06 FULL RECONCILIATION AUDIT (doc-vs-code sweep, presence + wiring verified).** The guesstimate miss was not isolated — the doc was written against an older snapshot and a whole cluster shipped since. The following statuses are corrected to **BUILT & WIRED** (evidence in parentheses); treat the older "pending / NOT BUILT / BROKEN / MISSING / PARTIAL" wording for each as historical:
> - **§9.31 daily-content + admin + keep-alive** (all files present; `daily`/`cron` routers in `main.py`; `.github/workflows/{keep-alive,daily-cases,daily-news}.yml` present).
> - **§9.32 news pipeline "saves 0" fix** (`services/news_fetcher.py`, `services/headline_classifier.py`, `news` router wired).
> - **§9.33 dashboard daily tiles, server-rendered** (`lib/daily-server.ts`, `components/dashboard-client.tsx`, `components/dashboard/daily-picks-strip.tsx`, `supabase/daily-read-policies.sql`).
> - **§9.28 Brain-1 interviewer + conversational chat UI** (`services/interview_engine.py`, `prompts/interview_prompts.py`, `routes/attempts.py` conversational endpoints, `components/solve/ConversationalSolve.tsx`).
> - **Payments audit trail** — §7.2 "[PARTIAL] never inserts `payments`" is **superseded**: `app/api/razorpay/verify/route.ts` (insert ~L84) and `app/api/razorpay/webhook/route.ts` (inserts ~L79/L94, refund update ~L111) both write the `payments` table.
> - **Voice input (Whisper)** — §18.3/§8 "Phase 3C, not built" **superseded**: `routes/transcribe.py` (`model="whisper-1"`, wired at prefix `/transcribe`), `components/dictation-button.tsx`.
> - **Image input (GPT-4o vision)** — §18.3 "Phase 3C, not built" **superseded**: `routes/vision.py` (wired at prefix `/extract-text`), `components/camera-button.tsx`. (So the §13/§8 "No file upload anywhere" line is historical.)
> - **Rate limiting** — §18.3 "not started" **superseded**: `services/rate_limit.py` + `check_rate_limit` enforced in `routes/attempts.py` (start 20/60s L168, messages 60/60s L311).
> - **Analytics** — §18.3 "not started" **superseded**: `@vercel/analytics` imported + `<Analytics />` mounted in `app/layout.tsx`.
> - **Privacy / Terms pages** — §7.3/§18.3 "not built" **superseded**: `app/privacy/page.tsx` + `app/terms/page.tsx` present (also `app/methodology/page.tsx`).
> - **`services/badge_awarder.py` "BROKEN / startup crash / MISSING"** (§5.3, §7.1, §8.6, §13.1, §18.1) — **superseded** (extends the §0 note to the scattered body mentions): imported in `routes/submit.py` L11, called L217 inside a `try/except` that only logs `WARN` on failure (L230) — no startup crash, graceful degradation. Streaks ARE computed (`compute_streak` in `badge_awarder.py`) for streak badges.
> - **STILL ACCURATE — genuinely open (NOT stale, do not flip):** `vercel.json` is still absent (Mumbai `bom1` region pin still missing, §14/§19); a **refund-policy page** is still missing (privacy + terms exist, refund does not); the denormalized **`users.streak_count` column write path** still looks absent (streaks are computed at read time instead — feature works, column may not be written).
> - **Method/limit of this audit:** verified **file presence + wiring** in the latest upload (decisive for flipping "not built/pending"→built). NOT verified: production deployment / runtime pass. Authoritative build status should come from a `npm run build` + deploy check, captured by `.brain/sync.mjs` + a CI gate going forward.

---

## 0. RECONCILIATION NOTES (2026-05-31)

These resolve internal contradictions that accumulated as the document grew across sessions. They do **not** delete the older wording (kept for audit trail); they state which version is now authoritative.

- **`services/badge_awarder.py` — NOW PRESENT, not missing.** Several early sections (§5.3 "Badge auto-award after submission (BROKEN)", §7.1 "Award logic missing in production", §13.1 folder tree "← MISSING", §18.1 "assuming `badge_awarder.py` exists") describe the file as absent and the submission endpoint as crash-on-startup. The later, authoritative findings (§7.2 and the Cross-Validation Appendix) confirm the file **exists at 183 lines** implementing 13 idempotent badge checks (`first-case`, `five/fifteen/thirty-cases`, `all-types`, `streak-3/7/14/30`, `first-80/90`, `perfect-structure`, `perfect-quant`) with `ON CONFLICT DO NOTHING` inserts and bonus-point awards. **Authoritative status: BUILT.** Treat the "BROKEN/MISSING" mentions as historical.
- **Casebook route count — current value is in §9.x, not §9.3.** §9.3 states the tree generates 87 slugs; later corrective passes moved this to 88 → 90 → 94 → 93, then this session's work changed it again. The **authoritative current count is recorded at the end of §9.17.** Treat any earlier figure as a point-in-time snapshot.
- **Casebook M&A slug convention — superseded.** §9.3 says "The M&A bucket slug convention was unified globally to `ma-pe-dd`." That placeholder was **deleted** in §9.13 and the live M&A cluster uses real slugs under `core-frameworks/m-and-a/*` (see §9.11, §9.15). Authoritative: `ma-pe-dd` no longer exists.
- **Casebook "frameworks built" list — see §9.17 for the complete current set.** §9.10 captured only the first three (Profitability, Market Entry, Growth). The full, current Core-Frameworks inventory (six framework topics across nine pages) is consolidated in §9.17.
- **Casebook Core-Frameworks section is now COMPLETE (2026-06-01).** §9.17 row 1 ("Structuring fundamentals … NOT BUILT YET") is superseded by **§9.18**: the page shipped with six inline SVGs authored to the §9.14–§9.15 grammar/contract. All six framework topics across all nine pages are now built. Authoritative status and the post-build route count live in §9.18.
- **Section C · Toolkit build has STARTED (2026-06-01).** The Toolkit (the standard reference frameworks — Porter's Five Forces, SWOT, PESTEL, 4 P's, BCG, Value Chain, Ansoff, Customer Journey, McKinsey 7S) is a distinct content area from Core Frameworks: **tighter "reference-card" pages** (two SVGs, ~9 min) rather than the 6–7-SVG deep pages. Its inventory, the locked toolkit-card template, and per-card status live in **§9.19** (template + Porter's) and **§9.20** (the SWOT / PESTEL / 4 P's / 5 C's / Customer Journey batch). **Toolkit is at 6 of 9 cards built.** Note: **5 C's and Customer Journey may be net-new nav nodes** — the original §4 locked list named "Customer / Purchase Journey" but not a standalone "5 C's"; the batch handoff instructs Antigravity to add any missing leaf under the Toolkit node, so the route count may rise by the number of net-new nodes. **Two locked schema facts confirmed at this build (apply to ALL future Casebook pages):** `Page` has **`titleEmphasize` but NO `subtitleEmphasize`** — never emit the latter, it hard-errors in `tsc`; and toolkit cards use **`kind:"toolkit"`** (not `"framework"`), which renders through the same `CasebookReader`. (Claude-side note: the `/tmp/tscheck` schema stub was corrected to match — `subtitleEmphasize` removed, `'toolkit'` added to the `kind` union — so future cards are validated against the true contract before handoff. Stored output copies of all six shipped toolkit cards + Porter were synced to drop `subtitleEmphasize` and use `kind:"toolkit"`.)
- **Section C · Toolkit is now COMPLETE — 9 of 9 (2026-06-01).** The final four (BCG Growth–Share Matrix, Value Chain, Ansoff Matrix, McKinsey 7S) shipped in one batch; details in **§9.21**. Across the 9 nav slots there are 10 cards (5 C's was added as a net-new node in §9.20). **NEXT, user-requested: a new "Miscellaneous Frameworks" section**, to be built as an **M&A-style hybrid node** (clickable parent + nested child sub-pages, §9.13 pattern, path-style slugs). Candidate children from the user's reference images: 4 A's of Marketing, VRIO, STP, AMO, 4 V's of Data, Sustainable Competitive Advantage (8 moats), Five Senses, 4M, and TAM/SAM/SOM. Not yet built — scoped for the next iteration.
- **Dashboard REBUILT (2026-06-01), pending Antigravity build — see §9.23.** Several earlier descriptions of the dashboard are now superseded: (a) **`components/dimension-radar.tsx` is being DELETED** — the hexagonal radar (§4.6, §"Dashboard" component table, §"✅ Dashboard" inventory) is replaced by **bullet charts** (`components/dashboard/dimension-bullets.tsx`, user-vs-cohort per dimension, ordered by rubric weight); treat all "DimensionRadar" mentions as historical. (b) **The career-tier SSOT violation is FIXED** — thresholds/names/taglines were duplicated in `career-ladder.tsx` + `dashboard-client.tsx` (`deriveTierName`/`deriveNextTierPts`); they now live once in new **`lib/career-tiers.ts`** and both components import from it (§13/§19 "extract to lib/career-tiers.ts" — done). (c) **`dashboard-client.tsx` is fully rewritten** — the old 4 sections (Performance / Skill Profile / Career Journey / Activity) become the **four-question zone spine**: ReadinessScore (on-track?) → NextActionCard (what's next? + contextual Pro paywall) → Trajectory + FreeQuotaMeter (improving? + convert) → DimensionBullets (ahead/behind?) → CoverageMap (deep-dive); the existing SubmissionHeatmap + CareerLadder are retained below. (d) New **`lib/readiness.ts`** (composite 0–100 score from current schema only — recency-weighted mastery + coverage + consistency + easy/hard robustness; honest stand-in for SM-2/timing which the research assumed but the schema lacks) and **`lib/next-action.ts`** (one prescribed action + free-quota meter). No schema changes; `/dashboard` stays `force-dynamic` so route counts are unaffected. Authoritative status + the research critique live in **§9.23**.
- **OPEN TODO (guesstimate rubric, 2026-06-02):** the guesstimate LEARN PAGE has not yet been provided/diffed. When building the guesstimate rubric (in progress, from the ISB casebook corpus `guess.txt`), the agreed sequence is: (1) when the user uploads the guesstimate learn page, diff it against what the corpus teaches, (2) flag anything missing on the learn page, (3) UPDATE THE LEARN PAGE FIRST, (4) THEN update the rubric to match (rubric derives from learn page = alignment firewall). Do not update the rubric off the corpus alone as final — corpus-built v0.1 is interim until the learn page is reconciled. Rubric scope is GUESSTIMATES ONLY (no cases/profitability/growth) — those are separate corpora.
- **/home + /dashboard MERGED into one logged-in surface (2026-06-02, authored → handoff §9.24).** Resolves the long-standing `/home`-vs-`/dashboard` duplication (flagged in the §9.23 dashboard rebuild). **`/dashboard` is kept and becomes the single logged-in home**: the daily-picks "doing" layer (today's case / guesstimate / GD brief, via the existing `DailyPickTile` + `fetchDailyToday`) is lifted out of `home-content.tsx` into new `components/dashboard/daily-picks-strip.tsx` and rendered at the TOP of the dashboard, above the readiness score; the analytics "understanding" layer sits below. **`/home` becomes a permanent `redirect('/dashboard')`** (keeps stale links/bookmarks alive). **Testimonials are removed from the logged-in app** — they were rendering inside `/home` (selling to an already-converted user); they remain ONLY on the public landing `app/page.tsx`. The duplicate `SubmissionHeatmap` is thereby resolved (one render). Eleven `/home` references across 9 files repointed to `/dashboard` (middleware post-auth redirect, auth callback `next` default, `auth-form`, landing "Open MECE"/hero CTA, admin layout redirect, `daily-rank-tile`, plus the desktop + mobile nav which lose their separate "Home" item since Dashboard now IS home). NOTE: this supersedes earlier descriptions of `/home` as the logged-in landing surface (e.g. §"getting started restructure" / HomeContent sections) — treat `/home` as a redirect from 2026-06-02 onward.
- **Daily scheduler is now AI-GENERATION, not curated-pick (2026-06-02).** Earlier sections describe `daily_scheduler.py` as filling a 7-day buffer by picking unused curated cases on a 60-day cooldown (§2.x/§3.4 `BUFFER_DAYS=7`, `REUSE_COOLDOWN_DAYS=60`). The shipped build replaced that with a **GPT-4o generator** (`services/content_generator.py`) that creates one fresh case + one fresh guesstimate for TODAY only and inserts them as rows in `cases`. **Authoritative: daily content is generated, today-only, idempotent.** `BUFFER_DAYS`/`REUSE_COOLDOWN_DAYS` are historical. The generator as first shipped was BROKEN (wrote to nonexistent columns + a phantom `guesstimates` table → `/cron/schedule-daily` 500); the §9.31 rewrite fixes it to the real `cases` schema with no migration.
- **`requirements.txt` UTF-16 BOM bug — NOW FIXED (2026-06-02).** §"Files Not Read" + §19.2 flag `requirements.txt` as UTF-16-LE-with-BOM (a deploy bug — pip reads the BOM into the first dep name). Verified this session: the file in the latest build is **clean UTF-8** with a modern pinned dependency set (fastapi 0.136, openai 2.37, supabase 2.30, etc.). Authoritative status: RESOLVED. Treat the BOM mentions as historical.
- **There is NO `guesstimates` DB table.** Several places implied a separate guesstimates store; confirmed none exists in `seed.sql` and nothing on the frontend reads one (the static guesstimate bank lives in `lib/curriculum` `ALL_DOMAINS`). As of §9.31 the **daily guesstimate is a normal `cases` row with `type='guesstimate'`**, attemptable and scoreable through the same `/cases/[id]` → submit → score → leaderboard path. `daily_schedule.guesstimate_code` now carries that case's UUID (free-text column, no FK).
- **NEW Section G · Miscellaneous Frameworks — AUTHORED (2026-06-01), pending Antigravity build.** Built as **`section → group → page`** nesting (NOT the M&A hybrid-page pattern — these theme groups are pure `kind:'group'` header nodes, exactly like the Section D · Cases case-type buckets, which the nav already renders; no component change needed). **9 light pages** (one SVG, ~5-6 min, `kind:"toolkit"`, no `subtitleEmphasize`) across **5 themed groups**: Marketing & Customer (STP, 4 A's, Five Senses) · Competitive Advantage (VRIO, Sustainable Advantage / 8 moats) · People & Operations (AMO, 4 M's) · Data (4 V's) · Market Sizing (TAM/SAM/SOM). Details in **§9.22**. AMO and 4M were kept as SEPARATE pages (different lenses: AMO = people-performance, 4M = process root-cause). TAM/SAM/SOM lives here (not Toolkit/Guesstimates) per user decision.

---

## FILE AUDIT

### Files Successfully Read

**Frontend root (`company-main/`):**
- `README.md`
- `package.json`
- `package-lock.json` (presence verified, not parsed)
- `tsconfig.json`
- `next.config.js`
- `tailwind.config.js`
- `postcss.config.js`
- `components.json`
- `middleware.ts`
- `.env.example`
- `.gitignore`
- `global.d.ts`
- `app/globals.css` (337 lines, full)
- `app/layout.tsx`
- `app/page.tsx` (619 lines, full landing)
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/forgot-password/page.tsx`
- `app/reset-password/page.tsx`
- `app/methodology/page.tsx` (head only)
- `app/auth/callback/route.ts`
- `app/api/me/route.ts`
- `app/api/razorpay/order/route.ts`
- `app/api/razorpay/verify/route.ts`
- `app/(app)/layout.tsx`
- `app/(app)/home/page.tsx`
- `app/(app)/dashboard/page.tsx`
- `app/(app)/practice/page.tsx`
- `app/(app)/learn/(standard)/page.tsx`
- `app/(app)/learn/(standard)/[slug]/page.tsx`
- `app/(app)/leaderboard/page.tsx`
- `app/(app)/profile/page.tsx`
- `app/(app)/upgrade/page.tsx`
- `app/(app)/results/[id]/page.tsx`
- `app/(app)/cases/page.tsx` (redirect to /practice?tab=cases)
- `app/(app)/cases/[id]/page.tsx`
- `app/(app)/gd-briefs/page.tsx`
- `app/(app)/gd-briefs/[id]/page.tsx` (head)
- `lib/constants.ts`
- `lib/types.ts`
- `lib/tier.ts`
- `lib/api.ts`
- `lib/utils.ts`
- `lib/testimonials.ts`
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`
- `lib/supabase/middleware.ts`
- `lib/curriculum/index.ts`
- `lib/curriculum/types.ts`
- `lib/curriculum/data-foundations.ts` (D1–D6, counts only)
- `lib/curriculum/data-advanced.ts` (D7–D12, counts only)
- `lib/curriculum/data-supplementary.ts` (D13–D18, counts only)
- `supabase/seed.sql`
- `components/app-nav.tsx`
- `components/user-context.tsx`
- `components/tier-badge.tsx`
- `components/tier-gate.tsx`
- `components/sign-out-button.tsx`
- `components/theme-provider.tsx`
- `components/theme-toggle.tsx`
- `components/geo-pattern.tsx`
- `components/home-content.tsx`
- `components/home-hero.tsx`
- `components/dashboard-client.tsx`
- `components/career-ladder.tsx`
- `components/daily-pick-tile.tsx`
- `components/daily-rank-tile.tsx`
- `components/stat-tile.tsx`
- `components/section-header.tsx`
- `components/submission-heatmap.tsx`
- `components/skill-mastery-grid.tsx`
- `components/testimonials-carousel.tsx`
- `components/dimension-radar.tsx` (head)
- `components/progress-chart.tsx` (head)
- `components/practice-hub.tsx`
- `components/case-attempt-history.tsx`
- `components/case-rating-prompt.tsx`
- `components/badge-pill.tsx`
- `components/domain-viewer.tsx` (head, 947 lines total)
- `components/learn-panel.tsx`
- `components/learn-domain-grid.tsx`
- `components/learn-reader.tsx`
- `components/framework-diagrams.tsx` (head)
- `components/auth-form.tsx` (head)
- `components/submission-form.tsx`
- `components/hint-toggle.tsx`
- `components/cases-browser.tsx` (head)
- `components/ui/*` (47 primitives — inventoried by filename only)
- `hooks/use-mobile.jsx`
- `hooks/use-toast.js`
- `scratch/extract_cases.ts` (head — one-off migration helper)
- `scratch_matches.json` (head — output of helper)

**Backend root (`backend-main/`):**
- `main.py`
- `requirements.txt`
- `.env.example`
- `.gitignore`
- `services/__init__.py`
- `services/supabase_client.py`
- `services/ai_scorer.py`
- `services/daily_scheduler.py`
- `services/news_fetcher.py` (head)
- `services/headline_classifier.py` (head)
- `services/brief_generator.py` (head)
- `routes/submit.py` (full)
- `routes/daily.py` (head)
- `routes/cron.py` (full)
- `routes/news.py` (head)
- `prompts/scoring_prompt.py` (full)

### Files Not Read / Could Not Parse

- **`requirements.txt`** — saved as `Unicode text, UTF-16, little-endian text, with CRLF line terminators` with a BOM. Read via iconv. **This is a deploy bug** — pip on Linux reads the BOM character as part of the first dependency name. Flagged in 19.2.
- `package-lock.json` — present but not parsed (auto-generated, not source of truth).
- `lib/curriculum/data-foundations.ts` / `data-advanced.ts` / `data-supplementary.ts` — counted domain codes only (D1–D18 confirmed, 2,759 total lines). Did not enumerate every case/guesstimate inside.
- `components/ui/*.jsx` — inventoried but not opened (shadcn/ui primitives, not custom code).
- `components/domain-viewer.tsx` — 947 lines, only head + diagram imports read.

### Missing files (referenced by code but not in repo)

- **`vercel.json`** — frontend deploy config absent. No `bom1` Mumbai region pin.

---

## 1. PRODUCT IDENTITY

### 1.1 Product Name

**MECE** (domain: mece.in). Confirmed in `package.json` (`"name": "mece"`), root metadata title, and `components/app-nav.tsx` wordmark.
**Brand Identity:** The acronym stands for "Method for Evaluating Corporate Excellence" (slogan). The official logo emphasizes "MECE" in crimson red against a premium dark corporate aesthetic (McKinsey/BCG style).

### 1.2 What It Is

MECE is an AI-powered placement-interview preparation platform for Indian MBA / PGDM students. Users practise case interviews, guesstimates, and GD briefs across consulting, finance, marketing, product, ops, and HR domains. Submissions are scored by an external FastAPI service (OpenAI GPT-4o) on a 6-dimension, 100-point rubric, then ranked on a live cross-India leaderboard. The platform also surfaces daily curated content (one case + one guesstimate + one news brief per day, fixed at midnight IST) and a 12-week activity heatmap to drive habit formation.

### 1.3 Target User

Indian MBA and PGDM students in their first or second year, preparing for summer internship and final placement interviews at top-tier programs. Specific recruiters named in copy: McKinsey, BCG, Bain, Goldman Sachs, P&G, HUL, Accenture Strategy, Kearney. Pain point: existing case prep is unstructured peer-mock or paid bootcamps; MECE gives consistent rubric-based feedback at any hour.

### 1.4 Core Value Proposition

"Cases, frameworks, and GD prep for every MBA aspirant — consulting, finance, marketing, product, ops. Scored across 6 dimensions. Ranked against every aspirant in India." (verbatim from `app/page.tsx` hero subtitle).

### 1.5 Monetization Model

Three subscription tiers, defined in `lib/tier.ts`:

| Tier | Price (INR/mo) | Re-attempts | Hint Q&A | Bookmarks | Learn examples | News scope | Practice/day |
|------|---|---|---|---|---|---|---|
| free | 0 | 0 | 0 | 0 | 2 | all | 3 |
| lite | 199 | unlimited | 5 canned | 50 | 2 | mba-relevant | unlimited |
| pro | 499 | unlimited | unlimited (live) | unlimited | 2 | mba-relevant | unlimited |

`TIER_PRICES` constant: `{ lite: 199, pro: 499 }`.
`TIER_LIMITS` constant defines feature ceilings (file: `lib/tier.ts`, lines 36–58).

**Payment provider:** Razorpay. Integration is **live in code**, not stubs:
- `app/api/razorpay/order/route.ts` — creates order via `new Razorpay({ key_id, key_secret }).orders.create()`, amounts hardcoded as paise (`19900` for lite, `49900` for pro).
- `app/api/razorpay/verify/route.ts` — HMAC-SHA256 signature verification, then `update({ subscription_tier: tier })` on `users` row.
- `app/(app)/upgrade/page.tsx` — Razorpay checkout.js loaded via `next/script`, opens modal with brand color `#0F172A` (navy hex), prefills name/email.

Trial logic: **none in code**. No free-trial flow, no proration.
Tier checks: `effectiveTier()` in `lib/tier.ts` falls back to `free` when `subscription_expires_at < now`.

### 1.6 Positioning & Tone

**Aesthetic (from CSS comments + landing copy):** "Medusa-style design system. Warm off-white bg, white cards, Cardinal Red accent." Direct visual reference: Medusa template (mentioned in `app/globals.css` line 9 and `components/geo-pattern.tsx`).

**What MECE is NOT:** [FROM COMPACTION — verify]
- Not a generic AI tutor (positioned against "I'll just ask GPT")
- Not a video-course platform
- Not consulting-only (broader: also IB, marketing, finance, ops, HR, product)
- Not a B2B sell to colleges

**Tone in copy:** sharp, structured, slightly competitive. Examples from code:
- "Day 0 Dreamer · Just showed up. Bold move." (career ladder tagline)
- "Casebook Collector · Downloaded 12 casebooks, read 1." (self-aware)
- "Your placement season starts now." (landing CTA)
- "MECE Believer · Uses MECE in casual conversation." (insider joke)

### 1.7 SEO & Discoverability Strategy

In `app/layout.tsx`:
```ts
metadata: {
  title: 'MECE — Placement interview prep for Indian MBA students',
  description: 'Cases, frameworks, GD briefs, and structured feedback for MBA & PGDM placement interviews — consulting, finance, marketing, product, ops.',
  keywords: ['MBA placement', 'case interview', 'GD prep', 'consulting prep', 'product manager interview'],
}
```
No OG image, no Twitter card meta, no sitemap.xml, no robots.txt found in code. No canonical URLs defined.

[CONFIDENCE: HIGH for §1.1–1.5, 1.7 / MEDIUM for §1.6 (some positioning from conversation, not code).]

---

## 2. TECH STACK

### 2.1 Frontend Framework
- **Next.js 14.2.3** — App Router. `next.config.js` sets `output: 'standalone'`, `images.unoptimized: true`.
- **React 18** + **TypeScript 6.0.3** (strict mode in `tsconfig.json`).
- Module resolution: `bundler`, baseUrl `.`, `@/*` paths configured.

### 2.2 Backend / API Layer
- **FastAPI 0.136.1** + **uvicorn** (Python). `main.py` registers four routers: `submit`, `news`, `cron`, `daily`.
- **OpenAI Python SDK** — model `gpt-4o` for case scoring (`SCORING_MODEL` in `services/ai_scorer.py`), `gpt-4o-mini` for bulk headline classification.
- **httpx** for outbound calls to GNews / NewsAPI.

### 2.3 Database
- **Supabase (PostgreSQL)** — project URL referenced from env. Service-role key used by backend (`get_supabase_client()` in `services/supabase_client.py`); browser client uses anon key.
- Postgres extensions assumed: `pgcrypto` (gen_random_uuid), trigger functions in `auth.users → public.users`.

### 2.4 Authentication
- **Supabase Auth** via `@supabase/ssr ^0.10.3` (cookie-based session refresh).
- Email/password + Google OAuth.
- Forgot-password / reset-password flow uses `supabase.auth.resetPasswordForEmail` + `auth.updateUser({ password })`.
- Auth callback: `app/auth/callback/route.ts` exchanges code for session, redirects to `next` or `/home`.

### 2.5 Hosting & Deployment
- Frontend: **Vercel** (per README §"Deploying to Vercel"). `output: 'standalone'` set but no `vercel.json` checked in.
- Backend: **Render free tier** [FROM COMPACTION — verify].
- Domain: **mece.in** (CORS allow-listed in both `next.config.js` and `backend/main.py`).

### 2.6 Performance Layer
- Server components with `revalidate` directives: practice page (60s), case detail (300s), leaderboard (30s).
- Results page: `revalidate = false` (full cache).
- Home, dashboard, layout: `dynamic = 'force-dynamic'` (no caching).
- `Promise.all` parallel-fetch on every server page.
- O(1) rank computation in dashboard (count users with `.gt('points', userPoints)`).
- No CDN, no Redis, no edge functions in code.

### 2.7 Third-Party APIs & Services
- **OpenAI** — case scoring + headline classification + brief generation.
- **GNews API** — daily business/world headlines (`GNEWS_API_KEY`).
- **NewsAPI** — backup news source (`NEWSAPI_KEY`).
- **Razorpay** — payments (`razorpay ^2.9.6` package).
- **DiceBear** — avatar fallbacks (`api.dicebear.com/7.x/avataaars/svg`) used in `lib/testimonials.ts`.
- **cron-job.org** — external scheduler hitting `/cron/*` endpoints [FROM COMPACTION — verify].

### 2.8 Email / Notification Services
- **None** beyond Supabase's built-in password-reset emails.
- No SMTP provider, no SendGrid, no Resend, no Postmark, no Mailgun in `package.json` or backend `requirements.txt`.
- In-app notifications: `sonner ^2.0.5` (toast library).

### 2.9 Payment Processing
- **Razorpay ^2.9.6** (server-side npm package) + Razorpay checkout.js (client-side).
- Live integration — order creation, signature verification, tier update in DB.
- Order amounts hardcoded in `app/api/razorpay/order/route.ts` (₹199 / ₹499). Should be moved to `TIER_PRICES` in `lib/tier.ts` for single-source-of-truth.

### 2.10 Dev Dependencies & Tooling
From `package.json` devDependencies:
- `@types/node ^25.9.0`
- `@types/react ^19.2.14` ⚠️ (React 19 types with React 18 runtime — version mismatch)
- `@types/react-dom ^19.2.3` ⚠️ (same mismatch)
- `autoprefixer ^10.4.19`
- `cross-env ^10.1.0` (not used in any script — unused)
- `globals ^16.2.0`
- `postcss ^8`
- `tailwindcss ^3.4.1`
- `typescript ^6.0.3`

**No linter, no formatter, no test runner installed.** No ESLint, Prettier, Vitest, Jest, Playwright, Cypress.

### 2.11 Package.json Scripts

```
dev          → next dev --port 3000
dev:no-reload → next dev --hostname 0.0.0.0 --port 3000
dev:webpack   → next dev --hostname 0.0.0.0 --port 3000   (identical to dev:no-reload)
build        → next build
start        → next start
```

No `lint`, no `test`, no `typecheck`, no `format`. No `postinstall`. Two of the three dev scripts are identical.

### 2.12 Explicitly Rejected Technologies

- **MongoDB** — `mongodb ^6.6.0` is listed in `package.json` dependencies but **never imported anywhere in the code**. Vestigial from an earlier scaffold. Should be removed. [DIVERGED FROM PLAN — Supabase chosen, MongoDB never removed from deps]
- **Sarvam AI (voice STT)** — discussed for voice input but [FROM COMPACTION] decision was OpenAI Whisper. Neither is implemented yet.
- **Anthropic API** — README mentions "Anthropic / OpenAI" as scoring provider but code uses only OpenAI.

[CONFIDENCE: HIGH for all 2.x except 2.12 rejected items (mix of code evidence + compacted memory).]

---

## 3. ENVIRONMENT & CONFIG

### 3.1 Environment Variables

**Frontend (`.env.example`):**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL. Required.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key. Required.
- `NEXT_PUBLIC_API_URL` — FastAPI backend URL (`http://localhost:8000` dev). Required by `lib/api.ts`.

**Referenced in code but NOT in `.env.example`:**
- `RAZORPAY_KEY_ID` — server-side, used in `app/api/razorpay/order/route.ts:24`. [UNDOCUMENTED ENV VAR — needs adding]
- `RAZORPAY_KEY_SECRET` — server-side, used in order + verify routes. [UNDOCUMENTED ENV VAR — needs adding]
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — client-side, used in `app/(app)/upgrade/page.tsx`. [UNDOCUMENTED ENV VAR — needs adding]

**Backend (`.env.example`):**
- `OPENAI_API_KEY` — required, validated at startup in `services/ai_scorer.py` and `services/supabase_client.py`.
- `SUPABASE_URL` — required.
- `SUPABASE_SERVICE_ROLE_KEY` — required.

**Backend — referenced in code but NOT in `.env.example`:**
- `GNEWS_API_KEY` — used in `services/news_fetcher.py` + `main.py /health` endpoint. [UNDOCUMENTED ENV VAR — needs adding]
- `NEWSAPI_KEY` — used in `services/news_fetcher.py` + `/health`. [UNDOCUMENTED ENV VAR — needs adding]
- `CRON_SECRET` — used in `routes/cron.py` `verify_cron_secret()` + `/health`. [UNDOCUMENTED ENV VAR — needs adding]

### 3.2 Feature Flags

No formal feature-flag system. Tier-based gating is done in component code via `useUser()` hook + `hasTierAccess(required)` from `lib/tier.ts`. No env-driven flags.

### 3.3 Build & Deploy Config

**`next.config.js`:**
- `output: 'standalone'`
- `images: { unoptimized: true }`
- `onDemandEntries: { maxInactiveAge: 10000, pagesBufferLength: 2 }` (dev-mode page cache)
- Headers: `X-Frame-Options: ALLOWALL`, `CSP: frame-ancestors *;`, `Access-Control-Allow-Origin: https://mece.in`, methods+headers wildcards. ⚠️ `frame-ancestors *` allows arbitrary embedding — clickjacking risk.

**`tsconfig.json`:**
- strict mode on, target ES2020, jsx preserve, paths `@/*` mapped.
- `ignoreDeprecations: "6.0"` — silences TS6 deprecation warnings.

**`tailwind.config.js`:** dark mode class-based, content scans `app/`, `components/`, `pages/`, `src/`. Custom font sizes, letter-spacing, border radius, full HSL palette (see §4.1).

**`postcss.config.js`:** standard tailwind + autoprefixer.

**No `vercel.json`**, no Dockerfile, no docker-compose.

**Backend `Procfile`/`render.yaml`:** none in repo (deploy presumed via Render's Python auto-detect).

### 3.4 Runtime Config

**Constants (`lib/constants.ts`):**
- `CASE_TYPES = ['guesstimate', 'profitability', 'market_sizing', 'growth']`
- `DIFFICULTIES = ['easy', 'medium', 'hard']`
- `SCORE_DIMENSIONS = ['structure','quantitative','synthesis','business_judgment','creativity','presence']`
- `SCORE_DIMENSION_MAX = { structure:25, quantitative:20, synthesis:20, business_judgment:15, creativity:10, presence:10 }`
- `MIN_ANSWER_CHARS = 200`
- `PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/auth/callback']`
- `AUTH_ROUTES = ['/login', '/signup']`

**Backend (`services/daily_scheduler.py`):**
- `BUFFER_DAYS = 7`
- `REUSE_COOLDOWN_DAYS = 60`
- `IST_OFFSET = timezone(timedelta(hours=5, minutes=30))`

### 3.5 Missing or Undocumented Env Vars

Summarized (also in §3.1):

| Variable | Used in | Status |
|---|---|---|
| `RAZORPAY_KEY_ID` | `app/api/razorpay/order/route.ts` | [UNDOCUMENTED ENV VAR — needs adding] |
| `RAZORPAY_KEY_SECRET` | `app/api/razorpay/order/route.ts`, `verify/route.ts` | [UNDOCUMENTED ENV VAR — needs adding] |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `app/(app)/upgrade/page.tsx` | [UNDOCUMENTED ENV VAR — needs adding] |
| `GNEWS_API_KEY` | `services/news_fetcher.py`, `main.py` | [UNDOCUMENTED ENV VAR — needs adding] |
| `NEWSAPI_KEY` | `services/news_fetcher.py`, `main.py` | [UNDOCUMENTED ENV VAR — needs adding] |
| `CRON_SECRET` | `routes/cron.py`, `main.py` | [UNDOCUMENTED ENV VAR — needs adding] |

[CONFIDENCE: HIGH]

---

## 4. DESIGN SYSTEM

### 4.1 Color Palette

All colors from `app/globals.css`, defined as HSL CSS variables in `:root` (light) and `.dark`. Hex equivalents extracted.

**Brand / accent:**
- `--primary: 356 84% 43%` → **#C8102E** (Cardinal Red) — used for: primary buttons, hover states, error/destructive states, current career-ladder tier, "M" wordmark accent, score rings, link emphasis. Files: `app/globals.css`, `tailwind.config.js`, `components/app-nav.tsx`, `components/badge-pill.tsx`.
- `--primary-hover: 356 84% 36%` — darker red for hover.
- `--primary-light: 356 84% 97%` — very-light tint for badge backgrounds.
- `--primary-foreground: 0 0% 100%` — white text on red.

**Brand secondary — navy:**
- `--navy: 214 72% 13%` → **#0F1C33** — used for: nav bar background, "Career Journey" stat tile dot, Razorpay theme color (referenced as `#0F172A` in `upgrade/page.tsx`, slight inconsistency).
- `--navy-mid: 214 50% 25%` — nav-bar borders, midtones.
- `--navy-soft: 214 30% 45%`
- `--navy-foreground: 210 30% 95%`

**Background / surface:**
- `--background: 40 20% 97%` → **#FAF9F6** warm off-white — body, fallback.
- `--card: 0 0% 100%` → pure white — all cards.
- `--popover: 0 0% 100%` — popovers.
- `--secondary: 40 15% 93%` — secondary surface.
- `--muted: 40 12% 93%` — muted backgrounds.
- `--accent: 356 84% 97%` — accent tint (red-tinged).

**Foreground / text:**
- `--foreground: 100 15% 5%` → near-black — body text.
- `--card-foreground: 100 15% 5%`
- `--muted-foreground: 40 8% 42%` — warm gray.
- `--accent-foreground: 356 84% 43%` — red text on accent.

**Semantic:**
- `--success: 142 55% 32%` — green for "What you did well" panel, success states.
- `--success-soft: 142 55% 92%`
- `--success-foreground: 0 0% 100%`
- `--warning: 38 92% 46%` — amber for "Avg Score" dot, warning states.
- `--warning-soft: 38 92% 92%`
- `--warning-foreground: 0 0% 100%`
- `--destructive: 356 84% 43%` (== primary) — destructive actions.

**Chrome:**
- `--border: 40 12% 88%` — warm light gray default border.
- `--border-strong: 40 12% 74%`
- `--input: 40 12% 88%` (== border)
- `--ring: 356 84% 43%` (== primary)

**Chart palette:**
- `--chart-1: 214 72% 13%` (navy)
- `--chart-2: 356 84% 43%` (primary red)
- `--chart-3: 142 55% 32%` (success)
- `--chart-4: 38 92% 46%` (warning)
- `--chart-5: 40 8% 42%` (muted-foreground)

**Dark mode `.dark` palette:**
- `--background: 214 50% 7%` (very dark navy)
- `--card: 214 40% 11%`
- `--primary: 356 74% 55%` (lifted red for contrast)
- `--border: 214 28% 20%`
- Full parallel palette defined (lines 73–112 of `globals.css`).

**Off-tokens found in code (violations):**
- `components/tier-badge.tsx:23` — `bg-amber-500/10 text-amber-600 dark:text-amber-400` — Lite tier uses raw amber instead of `warning` token.
- `app/page.tsx:213` — `'bg-amber-400'`, `'bg-emerald-500'`, `'bg-primary/60'` — landing mock chart uses raw color classes.
- `app/(app)/learn/(standard)/page.tsx:40–55` — `DOMAIN_ACCENTS` array uses raw `bg-amber-500/10`, `bg-emerald-500/10` for domain tile colors.
- `components/learn-domain-grid.tsx` — same pattern.
- `app/(app)/results/[id]/page.tsx` — `border-l-success`, `border-l-primary` accent bars (semantic, fine), plus `text-emerald-700`, `text-emerald-600` raw (off-token).
- `app/(app)/profile/page.tsx:38` — `border-l-4 border-l-navy` accent bar on profile hero (violates "no border-l-4 on generic tiles" rule from session preambles).

**Radius tokens:**
- `--radius: 0.75rem` (12px default)
- `--radius-sm: 0.5rem` (8px)
- `--radius-lg: 1rem` (16px)
- `--radius-full: 9999px` (pills)

### 4.2 Typography

- **Inter** — loaded via `next/font/google` in `app/layout.tsx` with `variable: '--font-inter'`. Applied to body, all headings, all components. Subset: latin.
- Mono fallback: `'SF Mono', 'Fira Mono', ui-monospace, monospace` used in `.font-mono-data` for tabular numbers.
- Font features: `"kern" 1, "liga" 1, "cv11" 1` (Inter character variant 11).

**Custom font-size scale (utilities in `globals.css`, `@layer utilities`):**
- `.text-micro` → 11px, line-height 1.4
- `.text-small` → 13px, line-height 1.45
- `.text-body` → 14px, line-height 1.55
- `.text-strong` → 15px, line-height 1.5, weight 500
- `.text-h3` → 20px, weight 600, letter-spacing -0.01em
- `.text-h2` → 28px, weight 700, letter-spacing -0.02em
- `.text-h1` → 40px, weight 700, letter-spacing -0.03em (32px on mobile <640px)

**Tailwind extension in `tailwind.config.js`:**
- `'label'` → 13px, weight 600, letter-spacing 0.1em
- `'kpi'` → 52px, weight 700, letter-spacing -0.04em

**Letter spacing:** `tightest: -0.03em, tight: -0.02em, wide: 0.06em, widest: 0.12em`.

### 4.3 Spacing & Layout

- Tailwind container: `center: true, padding: '1.5rem', screens: { '2xl': '1400px' }`.
- Standard page wrappers: `container max-w-6xl py-10` (home, dashboard, practice, learn, leaderboard) or `max-w-5xl` (profile, gd-briefs) or `max-w-4xl` (case detail, results).
- Section spacing: `space-y-10` or `space-y-14` on home.
- Grid gaps: `gap-3` (chips), `gap-4` (stat tiles), `gap-5` (cards), `gap-6–12` (large hero sections).
- Card padding default: `p-5` (compact) / `p-6` (regular) / `p-8` (spacious) / `p-10` (hero).
- Tailwind breakpoints (default): sm 640, md 768, lg 1024, xl 1280, 2xl 1400 (overridden).

**Density:** Medium-low. Generous whitespace (Medusa-template aesthetic). Cards have visible shadow (`0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)`).

### 4.4 UI Aesthetic

**Stated in code comments:** "Medusa-style design system. Warm off-white bg, white cards, Cardinal Red accent." (`globals.css:8–10`).

**Visual references:**
- "GeoPattern — fixed diagonal parallelogram watermark. Same pattern visible in the Medusa/Framer template screenshot." (`components/geo-pattern.tsx:3–5`).
- Nexo Co structure mentioned in `stat-tile.tsx:14` as inspiration for dashboard stat tile pattern.
- Landing page uses geometric outline shapes (rotated rectangles, concentric circles) — explicit "geo shapes" decorative pattern across hero, features, leaderboard, CTA sections.

**Directions taken:**
- "Consulting-deck aesthetic: structured, dark, precise." (`app-nav.tsx:13`)
- "GitHub-style activity heatmap. Cardinal red palette only (no rainbow)." (`submission-heatmap.tsx:13–14`)
- "NO border-l-4 — just a colored dot indicator." (`stat-tile.tsx:16`)

**Directions explicitly rejected (from session preambles + code):**
- No rainbow gamification — heatmaps & mastery grids must use brand cardinal red only.
- No `border-l-4` accent bars on generic tiles. Only allowed on: current career-ladder tier, errors, upgrade nudges, semantic results panels.
- No mismatched card widths within a section — always equal columns.

### 4.5 Component Inventory

Custom components (excluding `components/ui/*` shadcn primitives):

| Component | File | What it renders | Key props | Notable style | Used by |
|---|---|---|---|---|---|
| `AppNav` | `components/app-nav.tsx` | Sticky navy nav bar with wordmark, 6 main links, points display, tier badge, avatar, theme toggle, sign-out | none (reads `useUser`) | `nav-bar` class, `text-[13px]`, active link underline in primary | `(app)/layout.tsx`, `methodology/page.tsx` |
| `UserProvider` / `useUser` | `components/user-context.tsx` | Client-side user context with tier helpers | `initialUser: UserRow` | n/a (logic only) | `(app)/layout.tsx`, all client pages |
| `TierBadge` | `components/tier-badge.tsx` | Pill badge for Lite/Pro tiers (Star/Zap icon) | `tier`, `size: 'xs'|'sm'|'md'` | ⚠️ raw amber for Lite (off-token) | `app-nav`, `home-hero` |
| `TierGate` | `components/tier-gate.tsx` | Wraps children; shows upgrade prompt if locked. Variants: card / inline / overlay | `required`, `variant`, `lockedMessage`, `lockedTitle` | `ui-card border-dashed border-2` for card variant | Not yet used in any page — defined but unwired |
| `SignOutButton` | `components/sign-out-button.tsx` | Sign-out icon button for nav | none | `text-navy-foreground/40` | `app-nav` |
| `ThemeProvider` | `components/theme-provider.tsx` | next-themes wrapper, default light | none | n/a | `app/layout.tsx` |
| `ThemeToggle` | `components/theme-toggle.tsx` | Sun/Moon toggle, hydration-safe | none | `h-8 w-8 rounded-sm` | `app-nav`, landing nav |
| `GeoPattern` | `components/geo-pattern.tsx` | Fixed full-screen SVG diagonal parallelogram watermark | none | `fixed inset-0 z-0` + injects `z-10` on `ui-card` | `app/layout.tsx` |
| `HomeContent` | `components/home-content.tsx` | Home page composition: hero + 3 daily tiles + heatmap row + testimonials + quick links | `submissions: SubmissionRow[]` | `animate-slide-up` per section with stagger delays | `home/page.tsx` |
| `HomeHero` | `components/home-hero.tsx` | Personalized hero: date+greeting, "Welcome back, {firstName}.", subtext computed from streak/submissions, tier badge | `submissions` | `text-h1`, gradient bg | `home-content` |
| `DashboardClient` | `components/dashboard-client.tsx` | Dashboard composition: hero + 4 sections (Performance, Skill Profile, Career Journey, Activity) | `user, submissions, rankNum, totalUsers, percentile, avgScore, benchmark` | Sectioned with `space-y-10` | `dashboard/page.tsx` |
| `CareerLadder` | `components/career-ladder.tsx` | 7-tier ladder displayed bottom-up, current tier highlighted, progress-bar to next | `points: number` | `border-l-2 border-l-primary` only on current row | `dashboard-client` |
| `DailyPickTile` | `components/daily-pick-tile.tsx` | Large featured tile (260px tall) — label + title + context + dots + CTA | `label, title, context, metaIcon, metaText, difficultyDots, href, cta, loading, icon` | hover `border-primary/30`, no left bar | `home-content` (×3) |
| `DailyRankTile` | `components/daily-rank-tile.tsx` | Small "Your daily rank" card linking to leaderboard?tab=today | none | `font-mono text-[36px]` rank | `dashboard-client` |
| `StatTile` | `components/stat-tile.tsx` | KPI tile: big number + suffix + sublabel + colored dot top-right | `label, value, valueSuffix, sublabel, dotColor: 'primary'|'navy'|'success'|'warning', children` | `font-mono text-[36px]` value | `dashboard-client` (×4) |
| `SectionHeader` | `components/section-header.tsx` | Section header band: uppercase label + descriptive subtitle | `label, subtitle, action` | `text-micro tracking-widest` | `home-content`, `dashboard-client` |
| `SubmissionHeatmap` | `components/submission-heatmap.tsx` | GitHub-style 12-week × 7-day cell grid + streak pill + legend | `submissions, weeks=12, title, showStreak` | 4 intensity tiers, primary red only | `home-content`, `dashboard-client` |
| `SkillMasteryGrid` | `components/skill-mastery-grid.tsx` | 6 rows × 5 cells achievement grid (Lock/Star icons), "X of 6 above 70%" badge | `submissions` | Filled=primary, locked=muted, current=tinted | `home-content` |
| `TestimonialsCarousel` | `components/testimonials-carousel.tsx` | Carousel showing 3 testimonials at a time, auto-rotating 5s, pagination dots, pause button | none (reads `TESTIMONIALS`) | `quote` icon decoration | `home-content`, landing |
| `DimensionRadar` | `components/dimension-radar.tsx` | Custom-built SVG hexagonal radar (no Recharts) with user vs benchmark | `breakdown, benchmark` | hover-tooltip per node | `dashboard-client` |
| `ProgressChart` | `components/progress-chart.tsx` | Tremor AreaChart of recent submission scores with custom tooltip | `submissions` | Tremor `AreaChart` | `dashboard-client` |
| `PracticeHub` | `components/practice-hub.tsx` | Tabbed browser: All / Scored / Guesstimates / Case Studies, search, randomize, 9-per-page pagination | `cases, attemptedCaseIds` | `Check` icon next to attempted cases | `practice/page.tsx` |
| `CaseAttemptHistory` | `components/case-attempt-history.tsx` | Collapsible list of all prior attempts on a case, first-attempt badge | `attempts: (CaseAttemptRow & { submissions? })[]` | `Trophy` icon for "Counted for daily" pill | `cases/[id]/page.tsx` |
| `CaseRatingPrompt` | `components/case-rating-prompt.tsx` | 3-button optimistic rating widget (easier/right/harder) | `caseId, userId, existingRating, lastSubmissionId` | Upsert to `case_ratings` with optimistic UI | `cases/[id]/page.tsx` |
| `BadgePill` | `components/badge-pill.tsx` | Pill with Lucide icon + name, styled by rarity | `badge: BadgeRow, size: 'sm'|'md'|'lg'` | 4 rarity tiers: common/rare/epic/legendary | `results/[id]`, `profile` |
| `DomainViewer` | `components/domain-viewer.tsx` | 947-line full domain reader: modules, lessons, cases, guesstimates, framework diagrams, dialog views | `domain, allDomains, learningPaths` | imports `MECEDiagram`, `ProfitabilityTree`, `IssueTree`, `HypothesisDriven`, `MintoPyramid` | `learn/[slug]/page.tsx` |
| `LearnPanel` | `components/learn-panel.tsx` | Slide-in modal panel for domain content (alt UX, ESC-close, body-scroll-lock) | `domain, onClose` | n/a | `learn-domain-grid` |
| `LearnDomainGrid` | `components/learn-domain-grid.tsx` | Grid of 18 domain cards with rotating accent colors | none (reads `ALL_DOMAINS`) | ⚠️ uses raw amber/emerald (off-token) | Not directly imported by any page — appears to be unused/legacy |
| `LearnReader` | `components/learn-reader.tsx` | Two-pane reader (sidebar of case types + content pane) | `entries: LearnContentRow[]` | n/a — appears legacy, uses old `learn_content` table | Not currently routed to |
| `FrameworkDiagrams` | `components/framework-diagrams.tsx` | Exports 5 hand-authored SVG components: `MECEDiagram`, `ProfitabilityTree`, `IssueTree`, `HypothesisDriven`, `MintoPyramid` | each takes `SVGProps` | Animated entry, brand colors, gridlines | `domain-viewer` |
| `AuthForm` | `components/auth-form.tsx` | Reusable login/signup form with Google OAuth + email/password | `mode: 'login'|'signup'` | n/a | `login`, `signup` pages |
| `SubmissionForm` | `components/submission-form.tsx` | Textarea + submit button calling `submitCaseAnswer`, min 200 chars, redirect on success | `userId, caseId` | char counter, loader | `cases/[id]/page.tsx` |
| `HintToggle` | `components/hint-toggle.tsx` | Collapsible hint section with chevron | `hint: string` | `border-primary/20 bg-accent` | `cases/[id]/page.tsx` |
| `CasesBrowser` | `components/cases-browser.tsx` | Legacy chip-filter UI (type + difficulty) over case grid | `cases` | n/a — appears legacy (cases page now redirects to /practice?tab=cases) | Not used by current `/cases` route which is a redirect |
| `MakersSection` | `components/makers-section.tsx` | **[ANTIGRAVITY ADDITION]** "Minds Behind MECE" team section — 3 real team members (Satyam Kumar, Mohit Kumar Raj, Kishan Jayaswal) with photos, LinkedIn profile links, and McKinsey/BCG-style consulting aesthetic | none | Navy bg, white cards, LinkedIn blue hover (#0A66C2) | `app/page.tsx`, `components/home-content.tsx` — built during conversation session, may exist in `company_test` clone only |
| `MobileBottomNav` | `components/mobile-bottom-nav.tsx` | **[ANTIGRAVITY ADDITION]** Fixed bottom tab bar for mobile navigation | none | `md:hidden`, safe-area padded, glassmorphic blurred background | `app/layout.tsx` |

**`components/ui/`** — 47 shadcn/ui primitives (accordion, alert, avatar, badge, button, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip, alert-dialog, aspect-ratio, breadcrumb, calendar). Most `.jsx`, a handful `.tsx`. Standard shadcn implementations.

### 4.6 Microcopy & Content Decisions

**Button labels (verbatim from JSX):**
- Primary CTAs: "Start now", "Open MECE", "Create account", "Get started", "Sign up free", "Login"
- App CTAs: "Attempt today's case", "Solve today's guesstimate", "Read today's brief", "Submit your answer", "Try again", "Start a case", "Submit"
- Upgrade: "Upgrade for re-attempts", "Upgrade to Lite", "Upgrade to Pro"
- Nav (mobile): "Login", "Sign up free"
- Methodology: "Read full methodology", "How it works", "Already a member?"

**Empty states:**
- Profile no submissions: "No submissions yet — try a case." (with link)
- Dashboard recent activity empty: "No submissions yet" + "Start your first case →"
- Practice search no results: (handled by pagination — no explicit empty copy found)
- GD briefs load error: "Could not load headlines" + "Try again"

**Error messages:**
- Submission: "Your answer needs at least 200 characters."
- Razorpay order create: "Failed to create payment order" (server) / "Failed to create order" (client toast)
- Razorpay verify: "Payment verification failed" / "Invalid signature"
- Auth: surfaced from Supabase via `toast.error(error.message)` (no custom wrapping)
- Password mismatch: "Passwords do not match."
- Short password: "Password must be at least 8 characters."

**Onboarding / instructional copy:**
- Submission instruction: "Spend 20-30 minutes structuring your response. Your first attempt counts for the leaderboard."
- Re-attempt: "Your re-attempt will not change leaderboard position, but the score helps track improvement."
- Free re-attempt locked: "You've already attempted this case · Free tier allows one attempt per case. Upgrade to Lite or Pro for unlimited re-attempts."
- Subtext day-1: "Day 1 on MECE. Pick today's case below to begin your placement prep journey."
- Subtext streak ≥3: "You're on a {N}-day streak. Today's curated picks are below — don't break it."
- Subtext general: "Today's curated picks are below. Each daily attempt counts toward the leaderboard at midnight IST."

**Placeholder text:**
- Email: "you@example.com" (forgot-password)
- Search: "Search by keyword..."
- Submission textarea: (no placeholder visible in extracted code)

**Toast messages:**
- "Successfully upgraded to {TIER}!"
- "Payment cancelled."
- "Payment failed: {description}"
- "Password updated."
- "Rating saved · thanks for helping calibrate"
- "Could not save rating"

**Decorative copy:**
- Wordmark format: `<span className="text-primary">M</span>ECE` (red M, navy-fg ECE).
- Tagline (nav): "Placement prep"
- Career ladder taglines (`career-ladder.tsx`):
  - Summer Legend (2000+): "Top 1% of MECE users"
  - PPO Chaser (1000+): "Deep prep, real results"
  - Fundae Machine (500+): "You know your frameworks"
  - Deck Polisher (250+): "Pixel-perfect slides at 2am"
  - MECE Believer (100+): "Uses MECE in casual conversation"
  - Casebook Collector (50+): "Downloaded 12 casebooks, read 1"
  - Day 0 Dreamer (0+): "Just showed up. Bold move."

**Section headers (home + dashboard):**
- "TODAY · CURATED FOR YOU"
- "YOUR JOURNEY"
- "WHAT MBA ASPIRANTS SAY"
- "EXPLORE"
- "PERFORMANCE"
- "SKILL PROFILE"
- "CAREER JOURNEY"
- "ACTIVITY"

### 4.7 Icon Policy

**`lucide-react ^0.516.0`** — only icon library used. No custom SVG icons except inside `framework-diagrams.tsx` (those are content, not icons). No emoji except 🎉 (new badges banner in results page) and 🥇🥈🥉 in landing page leaderboard mock.

Icons used across the app (alphabetical, partial):
Activity, AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, ArrowUp, Award, BarChart3, BookOpen, Briefcase, Building2, Calculator, Check, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, Circle, Clock, Cpu, Crown, DollarSign, Equal, ExternalLink, FileText, Flag, Flame, Gem, GitMerge, Layers, Library, Lightbulb, Linkedin, Loader2, Lock, LogOut, MapPin, Medal, MessageSquare, Minus, Moon, Newspaper, Pause, Play, Quote, Rocket, Search, Settings, ShieldCheck, Shuffle, Sparkles, Star, Sun, Target, ThumbsDown, ThumbsUp, TrendingDown, TrendingUp, Trophy, Users, X, Zap.

### 4.8 Motion & Animation

In `tailwind.config.js` keyframes:
- `accordion-down` / `accordion-up` (0.2s ease-out)
- `fade-in` (0.45s)
- `slide-up` (0.4s) — from `translateY(10px) opacity 0`

In `globals.css`:
- `slide-up` redefined as `translateY(12px)` (slight inconsistency)
- `slide-right` keyframe
- `float` keyframe (4s infinite, ±6px)
- Custom `.stagger > *:nth-child(N)` selectors delay slide-up by 0/80/160/240/320/400ms — used on home page sections.
- `.animate-fade-in`, `.animate-slide-up`, `.animate-float` utility classes.

Plus `tailwindcss-animate ^1.0.7` plugin installed (provides animate-in/animate-out from Radix).

Decorative animations: testimonials carousel auto-rotate 5s; framework diagrams have entry animation (`diagramEnter` 600ms cubic-bezier).

### 4.9 Accessibility Decisions

- `aria-label` used on icon-only buttons (theme toggle, sign-out, pause/play, rating buttons).
- `aria-hidden="true"` on decorative SVGs (geo-pattern, hero shapes).
- `suppressHydrationWarning` on `<html>` for next-themes.
- Hint toggle: button has expanded text label; no `aria-expanded`.
- No keyboard nav explicitly tested or documented.
- No skip-to-content link found.
- No focus-visible custom styling beyond Tailwind defaults.
- No accessibility library (axe, react-aria) installed.
- Form labels via shadcn `Label` component (semantic).

### 4.10 SEO Meta & Social Tags

- Root metadata: title + description + keywords array (see §1.7).
- No OG (Open Graph) image, no `og:title`, no `og:description`, no `og:url`.
- No Twitter card meta.
- No canonical URLs.
- No `robots.txt`, no `sitemap.xml`.
- No structured data (JSON-LD).
- No per-page `metadata` exports on `(app)/*` pages.

### 4.11 Design Cross-Check

Additional details found:
- **Avatar fallbacks** in app-nav use uppercase first letter of name or email. Avatar uses `rounded-sm` (square-ish), `h-7 w-7`.
- **Score ring** custom CSS class in `globals.css:225` — conic-gradient with `--progress` CSS variable. Used in results page only.
- **Triage bars** (`.triage`, `.triage-green/amber/red`) — 3px tall, animated width transition. Defined but no usage found in current code (legacy?).
- **Data tables** (`.data-table`) — defined in globals.css with consistent th/td styling. Used on landing page mocks only.
- **GeoPattern** injects inline `<style>` to elevate `ui-card`, `ui-card-floating`, `kpi-cell`, `data-table`, `badge-pill` to `z-index: 10` so they sit above the watermark.
- **Custom scrollbar** in globals.css: 5px wide, transparent track, `--border-strong` thumb.

[CONFIDENCE: HIGH for §4 — almost entirely from code.]

---

## 5. INFORMATION ARCHITECTURE

### 5.1 Pages / Routes

**Public routes:**

| Route | File | Auth | What it does | Title/meta |
|---|---|---|---|---|
| `/` | `app/page.tsx` | No | Landing page — hero, features (cases, GD briefs, leaderboard), methodology strip, testimonials, navy CTA, footer | (inherits root) |
| `/login` | `app/login/page.tsx` | No (redirects to /home if logged in) | Login form (`AuthForm mode=login`) | (root) |
| `/signup` | `app/signup/page.tsx` | No (same redirect) | Signup form | (root) |
| `/forgot-password` | `app/forgot-password/page.tsx` | No | Email input → Supabase reset | (root) |
| `/reset-password` | `app/reset-password/page.tsx` | No (requires recovery session) | New password form, verifies recovery session via `getUser()` | (root) |
| `/methodology` | `app/methodology/page.tsx` | No | 6-dimension scoring explanation; renders own UserProvider+AppNav for logged-in users | (root) |
| `/auth/callback` | `app/auth/callback/route.ts` | No | OAuth + recovery code exchange → redirect `next` or `/home` | n/a (route handler) |

**Protected routes (under `(app)/` group, all redirect to `/login` if no session):**

| Route | File | What it does | Notable |
|---|---|---|---|
| `/home` | `app/(app)/home/page.tsx` | Personalized landing: hero, 3 daily picks, heatmap, mastery grid, testimonials, quick links | `dynamic = 'force-dynamic'` |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | 4-section analytics: Performance, Skill Profile, Career Journey, Activity | `dynamic = 'force-dynamic'`; O(1) rank |
| `/practice` | `app/(app)/practice/page.tsx` | Tabbed browser (All/Scored/Guesstimates/Case Studies), search, pagination, attempted-flag | `revalidate = 60` |
| `/learn` | `app/(app)/learn/(standard)/page.tsx` | Hero + 18-domain grid with stats strip | (presumed dynamic) |
| `/learn/[slug]` | `app/(app)/learn/(standard)/[slug]/page.tsx` | Domain reader page rendering `DomainViewer` (947 LOC) | `generateStaticParams` covers all 18 slugs |
| `/leaderboard` | `app/(app)/leaderboard/page.tsx` | Top 50 users, podium for top 3 + table | `revalidate = 30` |
| `/profile` | `app/(app)/profile/page.tsx` | User profile + earned badges + recent submissions | `dynamic = 'force-dynamic'` |
| `/upgrade` | `app/(app)/upgrade/page.tsx` | Lite/Pro pricing cards, Razorpay checkout integration | client component |
| `/results/[id]` | `app/(app)/results/[id]/page.tsx` | Score ring + new badges + breakdown bars + strengths/improvements | `revalidate = false` |
| `/cases` | `app/(app)/cases/page.tsx` | **Redirect to `/practice?tab=cases`** | server redirect |
| `/cases/[id]` | `app/(app)/cases/[id]/page.tsx` | Case detail: header + hint + attempt history + form (or upgrade lock) + rating | `revalidate = 300` |
| `/gd-briefs` | `app/(app)/gd-briefs/page.tsx` | List view: star headline + grid; click to generate brief | client component |
| `/gd-briefs/[id]` | `app/(app)/gd-briefs/[id]/page.tsx` | Brief detail: summary, GD type, likely Qs, smart angles, data points, opening/counter/closing lines | client component |

**API routes (`app/api/`):**
- `GET /api/me` → returns full `users` row for current session.
- `POST /api/razorpay/order` → creates Razorpay order for tier upgrade.
- `POST /api/razorpay/verify` → verifies HMAC signature, updates `subscription_tier`.

### 5.2 Navigation Structure

From `components/app-nav.tsx` lines 43–66:

Main nav (logged in, md and up):
1. Home → `/home`
2. Dashboard → `/dashboard`
3. Learn → `/learn`
4. Practice → `/practice`
5. GD Briefs → `/gd-briefs`
6. Leaderboard → `/leaderboard`

Right side (logged in):
- Points display (mono red number + `pts` label)
- Tier badge (only if `tier !== 'free'`)
- Avatar link → `/profile`
- "Upgrade" link → `/upgrade` (only shown if `tier !== 'pro'`)
- SignOut button
- ThemeToggle

Right side (logged out):
- Login → `/login`
- "Sign up free" → `/signup` (primary CTA)

Landing nav (`app/page.tsx:18–55`):
- Wordmark → `/`
- Hash links: `#features`, `#scoring`, `/methodology`
- Logged in: "Open MECE" button → `/home`
- Logged out: Login button + "Get started" CTA → `/signup`

**Wordmark behavior:** Logged in → links to `/home`. Logged out → links to `/`.

### 5.3 User Flows

**Flow: Sign up via Google → first case → leaderboard (full BUILT):**
1. `/signup` → click "Continue with Google" in `AuthForm`.
2. `supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: '/auth/callback?next=/home' })`.
3. Supabase redirects to Google, back to `/auth/callback`.
4. Callback exchanges code, sets cookie via `@supabase/ssr`, redirects to `/home`.
5. DB trigger (`handle_new_user`) auto-inserts row into `public.users` with `points: 0`.
6. User lands on `/home`, sees personalized hero, 3 daily tiles.
7. Clicks today's case → `/cases/[id]?daily=1`.
8. `cases/[id]/page.tsx` checks `case_attempts` for prior — none → shows submission form.
9. User submits via `SubmissionForm` → `POST {NEXT_PUBLIC_API_URL}/submit`.
10. Backend `routes/submit.py`: fetches case, scores via OpenAI, inserts `submissions`, inserts `case_attempts` (attempt 1, is_first=true, checks `daily_schedule`), updates `users.points`, awards badges (currently crashes due to missing `badge_awarder.py`).
11. Returns `submission_id`, frontend redirects to `/results/[id]`.
12. Results page shows score ring + new badges (if any) + breakdown.
13. User visits `/leaderboard` — ranked among all 50 by points.

**Flow: Re-attempt (free vs paid, BUILT):**
1. Free user re-opens an attempted case → form locked, sees "Upgrade for re-attempts" card.
2. Lite/Pro user → form shown below `CaseAttemptHistory`, submission flow as above but:
   - `is_first_attempt = false`, no points update, no leaderboard impact.
   - `case_attempts` row inserted with `counted_for_daily = false`.

**Flow: Rate case difficulty (BUILT):**
1. After at least one attempt, `CaseRatingPrompt` renders below the form.
2. 3 buttons (Easier/Right/Harder) upsert to `case_ratings`.

**Flow: Upgrade to Lite/Pro (BUILT, live Razorpay):**
1. User on `/upgrade`, clicks "Upgrade Lite (₹199)".
2. `POST /api/razorpay/order` with `tier: 'lite'` → returns order.
3. Client opens Razorpay modal via checkout.js.
4. On success, handler calls `POST /api/razorpay/verify` with signature.
5. Server verifies HMAC SHA-256 → updates `users.subscription_tier`.
6. Client calls `useUser().refresh()` → `GET /api/me`.
7. Toast success, redirect to `/dashboard`.

**Flow: Daily GD brief (BUILT):**
1. Cron-job.org hits `POST /cron/fetch-news` at ~07:00 IST [FROM COMPACTION].
2. Backend fetches headlines from GNews + NewsAPI, classifies via GPT-4o-mini, saves top 20 (1 star).
3. Frontend `/gd-briefs` lists headlines via `GET /news/headlines`.
4. User clicks a headline → `POST /news/briefs/{id}` triggers GPT-4o generation, caches forever.
5. Redirect to `/gd-briefs/[id]` rendering full brief (summary, GD type, 4-5 smart angles, etc.).

**Flow: Daily case rotation (BUILT):**
1. Cron-job.org hits `POST /cron/schedule-daily` at ~06:00 IST.
2. `fill_daily_schedule()` ensures 7 days ahead are populated.
3. Picks random `cases.is_active=true` not used in last 60 days.
4. Inserts into `daily_schedule` (date, case_id, NULL guesstimate, NULL brief_headline_id — frontend falls back).
5. Frontend `GET /daily/today` returns today's content.

**Flow: Badge auto-award after submission (BROKEN):**
- `routes/submit.py` line 11 imports `services.badge_awarder` — file missing.
- Backend will throw `ImportError` at startup; submission endpoint nonexistent in production until fixed.

**Flow: Forgot password (BUILT):**
1. `/forgot-password` → email input → `supabase.auth.resetPasswordForEmail(email, { redirectTo: /auth/callback?next=/reset-password })`.
2. User clicks email link → `/auth/callback` exchanges code → redirects to `/reset-password`.
3. `/reset-password` verifies recovery session via `getUser()`, then `auth.updateUser({ password })`.

### 5.4 Auth & Access Control Flow

**Session refresh:** Next.js middleware `middleware.ts` → `updateSession` in `lib/supabase/middleware.ts`. On every request matching `'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'`:
1. Read `auth.getUser()` from cookies.
2. If no user AND path not in `PUBLIC_ROUTES` → redirect to `/login?next={pathname}`.
3. If user AND path in `AUTH_ROUTES` (`/login`, `/signup`) → redirect to `/home`.

**Protected route enforcement:** Server pages in `(app)/` group do an additional `auth.getSession()` check at the top and redirect to `/login` if missing. Belt-and-suspenders.

**Layout-level user load:** `app/(app)/layout.tsx` calls `getSession()`, then fetches the full `public.users` row, wraps everything in `<UserProvider initialUser={user}>`. Falls back to a synthetic user with `subscription_tier: 'free'` if no DB row exists.

**Role-based access:** No formal RBAC. Only check is tier via `hasTierAccess('lite' | 'pro')` from `lib/tier.ts`. Effective tier respects `subscription_expires_at` cutoff.

### 5.5 Onboarding Flow

**No formal onboarding flow.** After signup → straight to `/home`. No welcome modal, no checklist, no tutorial overlay. Personalized hero subtext changes based on submission count, but that's reactive, not onboarding.

[CONFIDENCE: HIGH]

---

## 6. DATABASE & DATA ARCHITECTURE

### 6.1 Actual Schema

Schema reconstructed from `lib/types.ts`, `supabase/seed.sql`, `app/(app)/cases/[id]/page.tsx`, `routes/submit.py`, `services/daily_scheduler.py`. **The repo does not ship migration files** — schema lives only in production Supabase. The shape below is inferred from how code reads/writes.

**`public.users`** (auth.users mirror, populated by trigger):
```
id                       uuid PK (= auth.users.id)
name                     text NULL
email                    text NOT NULL
avatar_url               text NULL
points                   int NOT NULL DEFAULT 0
created_at               timestamptz NOT NULL DEFAULT now()
subscription_tier        text NOT NULL DEFAULT 'free' (CHECK: free|lite|pro)
subscription_started_at  timestamptz NULL
subscription_expires_at  timestamptz NULL
streak_count             int NOT NULL DEFAULT 0
streak_last_date         date NULL
```

**`public.cases`** (seed.sql defines first 5):
```
id           uuid PK
title        text NOT NULL
type         text NOT NULL (CHECK: guesstimate|profitability|market_sizing|growth)
difficulty   text NOT NULL (CHECK: easy|medium|hard)
content      text NOT NULL
hint         text NULL
is_active    boolean NOT NULL DEFAULT true
created_at   timestamptz NOT NULL DEFAULT now()
```

**`public.submissions`:**
```
id              uuid PK
user_id         uuid NOT NULL → users.id
case_id         uuid NOT NULL → cases.id
answer_text     text NOT NULL
score           int NULL (0-100)
feedback_json   jsonb NULL  -- { score, breakdown, strengths, improvements, summary }
created_at      timestamptz NOT NULL DEFAULT now()
```

**`public.case_attempts`** (Phase 2/3A):
```
id                 uuid PK
user_id            uuid NOT NULL → users.id
case_id            uuid NOT NULL → cases.id
submission_id      uuid NOT NULL → submissions.id
attempt_number     int NOT NULL  -- 1, 2, 3...
is_first_attempt   boolean NOT NULL  -- true only for attempt_number=1
counted_for_daily  boolean NOT NULL DEFAULT false
daily_date         date NULL
created_at         timestamptz NOT NULL DEFAULT now()
```

**`public.case_ratings`** (Phase 3A):
```
id             uuid PK
case_id        uuid NOT NULL → cases.id
user_id        uuid NOT NULL → users.id
rating         text NOT NULL (CHECK: easier|right|harder)
submission_id  uuid NULL → submissions.id
created_at     timestamptz NOT NULL DEFAULT now()
UNIQUE(case_id, user_id)   -- upsert target
```

**`public.badges`** (catalog, Phase 3A):
```
id            text PK  -- 'first-case', 'streak-7', etc.
name          text NOT NULL
description   text NOT NULL
icon          text NOT NULL  -- Lucide icon name string
category      text NOT NULL (CHECK: milestone|streak|mastery|social)
rarity        text NOT NULL (CHECK: common|rare|epic|legendary)
points_reward int NOT NULL DEFAULT 0
created_at    timestamptz NOT NULL DEFAULT now()
```

Seeded with 16 badges per `lib/types.ts` + conversation history (first-case, five/fifteen/thirty-cases, all-types, streak-3/7/14/30, first-80/90, perfect-structure, perfect-quant, daily-rank-1, rated-five, seven-day-user).

**`public.user_badges`** (Phase 3A):
```
id                     uuid PK
user_id                uuid NOT NULL → users.id
badge_id               text NOT NULL → badges.id
earned_at              timestamptz NOT NULL DEFAULT now()
trigger_submission_id  uuid NULL → submissions.id  -- "what triggered this"
UNIQUE(user_id, badge_id)
```

**`public.gd_briefs`** (confirmed from backend `routes/news.py` — full schema with new + legacy columns):
```
id                uuid PK
headline_id       uuid NOT NULL → news_headlines.id (ON DELETE CASCADE)
topic             text  -- = headline title
summary           text NOT NULL
gd_type           text  -- 'Abstract' | 'Case-based' | 'Opinion' | 'Trend-analytical'
likely_questions  text[]
smart_angles      text[]
data_points       text[]
opening_lines     text[]
counter_arguments text[]
closing_lines     text[]
source_url        text NULL
created_at        timestamptz NOT NULL DEFAULT now()
-- Legacy columns (kept for backward compatibility, populated with same data):
points_for        text[]  -- = smart_angles
points_against    text[]  -- = counter_arguments
how_to_open       text    -- = opening_lines[0]
how_to_close      text    -- = closing_lines[0]
```
**[ANTIGRAVITY ADDITION]** `routes/news.py` (336 lines, fully read) confirms: POST `/news/briefs/{headline_id}` generates the brief via GPT-4o, inserts ALL columns above, and returns a `BriefResponse` model. GET `/news/briefs/{headline_id}` does a read-only fetch with fallback to legacy column names (e.g., `b.get("smart_angles") or b.get("points_for")`). Brief generation cost: ~₹2-4 per call; cached per headline forever.

**`public.learn_content`** (legacy — `LearnReader` orphaned, curriculum lives in `lib/curriculum/*` now):
```
id            uuid PK
case_type     text NOT NULL
title         text NOT NULL
body          text NOT NULL
display_order int NOT NULL DEFAULT 0
```

**`public.news_headlines`:**
```
id                    uuid PK
title                 text NOT NULL
description           text NULL
thumbnail_url         text NULL
source_url            text NOT NULL UNIQUE  -- dedup key
source_name           text NOT NULL
published_at          timestamptz NOT NULL
fetched_at            timestamptz NOT NULL DEFAULT now()
gd_worthiness_score   int  -- 0-10 from classifier
keywords              text[] NOT NULL DEFAULT '{}'
category              text NOT NULL
is_star               boolean NOT NULL DEFAULT false
```

**Generated briefs** (table presumably `gd_briefs` linked to `news_headlines.id` via `headline_id` foreign key with ON DELETE CASCADE — referenced in `routes/cron.py:cleanup` as cascading delete). Schema inferred from `services/brief_generator.py` `GeneratedBrief` TypedDict.

**`public.daily_schedule`:**
```
id                uuid PK
scheduled_date    date NOT NULL UNIQUE
case_id           uuid NULL → cases.id
guesstimate_code  text NULL
brief_headline_id uuid NULL → news_headlines.id
created_at        timestamptz NOT NULL DEFAULT now()
notes             text NULL
```

**`public.payments`** (defined in `lib/types.ts:PaymentRow` but no insert seen in code):
```
id                  uuid PK
user_id             uuid NOT NULL → users.id
razorpay_order_id   text NOT NULL
razorpay_payment_id text NULL
razorpay_signature  text NULL
tier                text NOT NULL (CHECK: lite|pro)
amount_paise        int NOT NULL
currency            text NOT NULL  -- 'INR'
status              text NOT NULL (CHECK: created|paid|failed|refunded)
created_at          timestamptz NOT NULL DEFAULT now()
paid_at             timestamptz NULL
```
**[PARTIAL]** — type defined, but Razorpay verify route only updates `users.subscription_tier`. **It never inserts/updates `payments`** → no payment audit trail in DB. Flag in §7.2 and §19.2.

### 6.2 Relationships

- `users.id (= auth.users.id)` — managed by trigger.
- `submissions.user_id → users.id` (CASCADE per README implication; not verified).
- `submissions.case_id → cases.id`.
- `case_attempts.user_id → users.id`, `.case_id → cases.id`, `.submission_id → submissions.id`.
- `case_ratings.case_id → cases.id`, `.user_id → users.id`, `.submission_id → submissions.id`.
- `user_badges.user_id → users.id` (CASCADE), `.badge_id → badges.id` (CASCADE), `.trigger_submission_id → submissions.id` (SET NULL).
- `daily_schedule.case_id → cases.id`, `.brief_headline_id → news_headlines.id`.
- `gd_briefs.headline_id → news_headlines.id` (ON DELETE CASCADE — per cron.py comment).
- `payments.user_id → users.id`.

### 6.3 Access Control

**RLS policies (inferred from README §"If RLS is enabled"):**
- `public read cases` — anon select all.
- `public read gd_briefs` — anon select all.
- `public read learn` — anon select all.
- `users read own row` — `auth.uid() = id`.
- `users read own subs` — `auth.uid() = user_id`.

**Phase 3A added (from conversation, presumably in production migration):**
- `Authenticated read badges catalog` — SELECT.
- `Users read all user_badges` — for profile display, leaderboard reveals.
- `Authenticated read all case_ratings` — for aggregate display.
- `Users insert own case_ratings` — `auth.uid() = user_id`.
- `Users update own case_ratings` — `auth.uid() = user_id`.

**Backend writes:** uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS. All inserts to `submissions`, `case_attempts`, `news_headlines`, `daily_schedule`, `user_badges`, and `users.points` updates happen with admin privileges.

**Frontend writes:** only `case_ratings.upsert` (browser supabase client, authenticated).

**Auto-create trigger on `auth.users` INSERT:** populates `public.users` with name (from `raw_user_meta_data.full_name | name`), avatar_url, email, points=0.

### 6.4 Indexes & Constraints

Inferred indexes (from query patterns + conversation):
- `case_attempts(user_id)` — used heavily on practice + case detail pages.
- `case_attempts(user_id, is_first_attempt)` — used in count queries.
- `user_badges(user_id)` — profile display.
- `user_badges(earned_at DESC)` — recent earned.
- `case_ratings(case_id)` — aggregate.
- `daily_schedule(scheduled_date)` — needs UNIQUE per spec.
- `news_headlines(source_url)` — UNIQUE for dedup.
- `submissions(user_id, created_at DESC)` — recent-first listing.

Not verifiable without seeing actual migration files.

### 6.5 Schema vs Conversation Divergences

- `users.id` is the PK shared with `auth.users.id` — matches.
- `feedback_json.breakdown` keys: code uses **`business_judgment`** and **`presence`** (per `routes/submit.py:FeedbackBreakdown`, `lib/constants.ts:SCORE_DIMENSIONS`, `prompts/scoring_prompt.py`). [CONFLICT — VERIFY] earlier conversation history mentioned the keys must be `business_judgment` + `presence` not `judgment` + `tone`. **Code matches the corrected version** — good. But landing page (`app/page.tsx:215–219`) renders 'Judgment' (label) and 'Tone' (label) which differ from `SCORE_DIMENSION_LABELS` in `constants.ts` which uses `'Business Judgment'` and `'Professional Tone'`. **[ANTIGRAVITY CORRECTION]** The canonical display labels in `lib/constants.ts` are: Structure, Quantitative Skills, Synthesis & Communication, Business Judgment, Creativity, Professional Tone.
- `case_attempts.counted_for_daily` — defined in code. **[DIVERGED]** from any earlier mention of having an `is_daily_first` boolean; the actual implementation uses `is_first_attempt` AND a check inside submit.py that queries `daily_schedule` to set `counted_for_daily`.
- `payments` table — type exists but **never written to**. [DIVERGED — planned full payment ledger, built only the tier update].

### 6.6 Data that Lives Outside the DB

**Browser:** Supabase auth tokens stored in HTTP-only cookies via `@supabase/ssr` (managed by middleware). No `localStorage` or `sessionStorage` usage observed in custom code.

**Static (in-source):**
- `lib/curriculum/*.ts` — entire 18-domain curriculum, ~2,759 lines. Includes case banks, guesstimate banks, company profiles, learning paths. **Not in DB.** Frontend imports directly.
- `lib/testimonials.ts` — 8 hardcoded testimonial profiles with hardcoded LinkedIn URLs.
- Career-ladder tier thresholds — hardcoded in `components/career-ladder.tsx` and duplicated in `components/dashboard-client.tsx:deriveTierName()` and `deriveNextTierPts()`. **Single-source-of-truth violation.**

**Memory only:** `useUser()` context — refreshed via `/api/me`.

[CONFIDENCE: HIGH for tables that are read/written in code; MEDIUM for exact RLS policies and indexes (no migration files in repo).]

---

## 7. FEATURES

### 7.1 Built Features [BUILT]

**Authentication & accounts**
- Files: `app/login/page.tsx`, `app/signup/page.tsx`, `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`, `app/auth/callback/route.ts`, `components/auth-form.tsx`, `lib/supabase/*`, `middleware.ts`.
- Logic: Email/password + Google OAuth via Supabase. Cookie session with middleware refresh. Forgot/reset flow. Redirects: logged-in away from `/login` and `/signup` → `/home`; logged-out away from protected routes → `/login?next=...`.
- Error handling: Supabase errors surfaced via `toast.error(error.message)`. Password length / mismatch validated client-side.

**Landing page**
- File: `app/page.tsx` (619 lines).
- Structure: Hero with floating UI mockup → 6-dim scoring rubric mock card → Feature: Cases (case list + submission form mock) → Feature: GD Briefs (left card + right text) → Feature: Leaderboard (left text + right podium mock) → Methodology grid → Testimonials carousel → Navy CTA → Footer.
- Logged-in users get "Open MECE" button → `/home`.

**Home page** [BUILT]
- File: `app/(app)/home/page.tsx` + `components/home-content.tsx` + `components/home-hero.tsx`.
- Hero: time-of-day greeting + first name + streak-aware subtext + tier badge.
- 3 daily pick tiles: case, guesstimate (currently usually NULL — falls back to "Pick from the bank"), GD brief.
- 12-week SubmissionHeatmap.
- 6×5 SkillMasteryGrid.
- TestimonialsCarousel.
- 4 quick-link cards.

**Dashboard** [BUILT]
- File: `app/(app)/dashboard/page.tsx` + `components/dashboard-client.tsx`.
- Hero: date + "Hey, {name}." + "Start a case" → `/home`.
- Performance section: 4 StatTiles (Points, Rank, Avg Score, Percentile).
- Skill Profile: DimensionRadar + ProgressChart.
- Career Journey: CareerLadder + DailyRankTile.
- Activity: 6-week SubmissionHeatmap + RecentSubmissionsTable.
- O(1) rank computation via Supabase count query.

**Practice hub** [BUILT]
- File: `app/(app)/practice/page.tsx` + `components/practice-hub.tsx`.
- 4 tabs: All / Scored Cases / Guesstimates / Case Studies.
- Search + Randomize (alert-based — see §19).
- Pagination (9 per page).
- Attempted-case checkmark.
- `?focus=` and `?tab=` query param support (focus currently warns console — see §19).

**Cases**
- File: `app/(app)/cases/[id]/page.tsx` + `components/submission-form.tsx`, `components/hint-toggle.tsx`, `components/case-attempt-history.tsx`, `components/case-rating-prompt.tsx`.
- Case detail with collapsible hint.
- Attempt history (all prior attempts, expandable, first-attempt badge).
- Re-attempt gating: free users locked, Lite/Pro unlocked.
- Difficulty rating prompt (only after at least one attempt).
- `/cases` → redirects to `/practice?tab=cases`.

**Submission scoring loop**
- Files: `components/submission-form.tsx` → `lib/api.ts:submitCaseAnswer` → `POST {NEXT_PUBLIC_API_URL}/submit` → `backend/routes/submit.py` → `services/ai_scorer.py` → OpenAI GPT-4o → JSON parse → insert `submissions` → insert `case_attempts` → update `users.points` (first-attempt only) → award badges (**BROKEN — file missing**) → return.
- Min 200 chars enforced client-side; min 50 chars enforced server-side (validation mismatch).

**Results page**
- File: `app/(app)/results/[id]/page.tsx`.
- Big score ring (custom CSS conic gradient).
- New badges banner (if any awarded on this submission).
- 6-dimension breakdown bars.
- Strengths + Improvements panels.

**Learn (curriculum)**
- Files: `app/(app)/learn/(standard)/page.tsx`, `app/(app)/learn/(standard)/[slug]/page.tsx`, `components/domain-viewer.tsx`, `lib/curriculum/*`.
- 18 domains (D1–D18) with modules, lessons, case banks, guesstimate banks, company profiles.
- Hand-authored framework SVG diagrams: MECEDiagram, ProfitabilityTree, IssueTree, HypothesisDriven, MintoPyramid.
- Static-pre-rendered per slug via `generateStaticParams`.

**GD Briefs**
- Files: `app/(app)/gd-briefs/page.tsx`, `app/(app)/gd-briefs/[id]/page.tsx`, `lib/api.ts:fetchHeadlines/generateBrief/fetchBrief`, backend `routes/news.py`, `services/news_fetcher.py`, `services/headline_classifier.py`, `services/brief_generator.py`.
- Headlines fetched daily via cron (GNews + NewsAPI, classified with GPT-4o-mini).
- One starred headline.
- Click → triggers GPT-4o brief generation → cached forever.
- Brief detail: summary, GD type, 2-3 likely questions, 4-5 smart angles, 4-5 data points, 2-3 opening lines, 3-4 counter-arguments, 2-3 closing lines.

**Leaderboard**
- File: `app/(app)/leaderboard/page.tsx`.
- Top 50 by points; podium for top 3 with decorative SVG; current user highlighted.

**Profile**
- File: `app/(app)/profile/page.tsx`.
- Avatar + name + points + submission count.
- Badges earned section (all badges, sorted by earned_at desc).
- Recent submissions list (last 20).

**Tier infrastructure**
- Files: `lib/tier.ts`, `lib/types.ts`, `components/user-context.tsx`, `components/tier-badge.tsx`, `components/tier-gate.tsx`.
- `effectiveTier()` accounts for `subscription_expires_at`.
- `hasTierAccess(required)` for permission checks.
- `TIER_LIMITS`, `TIER_LABELS`, `TIER_PRICES` constants.
- `TierBadge` shown in nav when not free.
- **`TierGate` component exists but is not used in any page yet.** Defined but unwired.

**Razorpay payments**
- Files: `app/api/razorpay/order/route.ts`, `app/api/razorpay/verify/route.ts`, `app/(app)/upgrade/page.tsx`.
- Order creation, HMAC signature verification, `subscription_tier` DB update.
- Razorpay checkout.js loaded client-side.

**Badge system (catalog & display)**
- DB: 16 badges seeded.
- Display: `components/badge-pill.tsx` (4 rarity styles), results page banner, profile page section.
- **Award logic missing in production** — `services/badge_awarder.py` not present.

**Case rating system**
- Files: `components/case-rating-prompt.tsx`, `app/(app)/cases/[id]/page.tsx`.
- Upsert to `case_ratings` from browser client with optimistic UI.

**Daily content (case rotation + GD brief)**
- Backend: `services/daily_scheduler.py`, `routes/cron.py` `/schedule-daily`, `/fetch-news`, `/cleanup`, `routes/daily.py` `/today` `/leaderboard`.
- Frontend: `lib/api.ts:fetchDailyToday/fetchDailyLeaderboard`, `components/daily-pick-tile.tsx`, `components/daily-rank-tile.tsx`.
- 7-day buffer with 60-day cooldown.
- Guesstimate slot always NULL — frontend falls back to "Pick from the bank" (planned per scheduler comment).

**Streak detection**
- File: `components/home-hero.tsx`, `components/submission-heatmap.tsx`.
- Reads submission dates from server, computes consecutive-day streak client-side.
- `users.streak_count` and `users.streak_last_date` columns exist in schema but **not written anywhere in code** — currently inert.

**Theme switching**
- `next-themes` light/dark with hydration-safe toggle in nav.

**Makers Section** [BUILT — Antigravity session]
- File: `components/makers-section.tsx` (created during conversation).
- Separate from testimonials carousel. McKinsey/BCG-style "Minds Behind MECE" section.
- 3 real team members with actual LinkedIn URLs and photos:
  - Satyam Kumar — PGDM IMI New Delhi'27, XAT 99.4, CMAT 98.8
  - Mohit Kumar Raj — Batch Rep TISS HRM & LR'27, Marine Engineer
  - Kishan Jayaswal — Summer Intern @ Jindal Steel, IIM Indore PGP'27
- Design: consulting-deck aesthetic, navy background, white cards with subtle borders, LinkedIn profile buttons with #0A66C2 brand blue.

**Cron jobs (backend)**
- `POST /cron/fetch-news` — daily news + classification.
- `POST /cron/cleanup` — delete headlines >14 days old + cascading briefs.
- `POST /cron/schedule-daily` — fill 7-day buffer.
- All gated by `X-Cron-Secret` header.

### 7.2 Partial Features [PARTIAL]

**Badge auto-award after submission**
- Display, catalog, DB tables, and `BadgePill` component all built.
- `services/badge_awarder.py` (183 lines) implements 13 badge checks (first-case, five/fifteen/thirty-cases, all-types, streak-3/7/14/30, first-80/90, perfect-structure, perfect-quant) with idempotent `ON CONFLICT DO NOTHING` inserts.

**Payment ledger**
- Razorpay verify route only updates `users.subscription_tier`.
- **Never inserts into `public.payments` table** even though the type exists in `lib/types.ts`.
- No record of which payment_id corresponds to which subscription.
- No webhook handling for refunds, chargebacks, or async payment events.

**Subscription expiry**
- `effectiveTier()` honors `subscription_expires_at`.
- **`subscription_expires_at` is never set anywhere.** Razorpay verify only sets `subscription_tier`, not the dates. So all paid users effectively have lifetime access until manually expired.

**Streak persistence**
- `users.streak_count`, `users.streak_last_date` columns exist.
- Computed client-side from submissions (in `home-hero.tsx`) but **never written back to DB**.
- Backend submit.py does not update these fields.

**Practice focus filter**
- `?focus=` param parsed in `practice-hub.tsx`.
- `useEffect` warns to console: "Focus param '?focus={x}' ignored: practice-hub doesn't support domain filtering for cases yet."
- Domain → cases mapping not yet built.

**Practice randomize**
- "Randomize" button on practice page only calls `alert(...)` with the title — does not navigate or open the case.
- File: `components/practice-hub.tsx:64`.

**TierGate component**
- Built (`components/tier-gate.tsx`) with 3 variants (card/inline/overlay).
- **Not used in any production page.** Defined but not wired.

**Methodology page**
- Renders own `<AppNav />` + `<UserProvider />` outside the `(app)/` group.
- Top of file reads session but does not enforce auth (anyone can see).
- Listed first 13 lines only — assume body explains 6-dimension rubric.

**Curriculum guesstimates as daily picks**
- Daily scheduler comment (`services/daily_scheduler.py:114–122`) says "leave guesstimate_code NULL for now. Frontend can fall back to picking a curriculum guesstimate client-side."
- Frontend `home-content.tsx` does this fallback ("Pick from the bank").
- Means daily guesstimates are **NOT actually scheduled or rotated** — same effective behavior every day.

**Solved examples + hint chatbot + compare-to-model (Phase 3B)**
- Discussed in conversation. **No code yet.**

**Voice + image input (Phase 3C)**
- Discussed in conversation. **No code yet.**

### 7.3 Planned But Not Built [NOT BUILT]

(From conversation history; no code references in current snapshot.)

- Mock interview timer (Pro feature).
- LinkedIn share of daily ranking (Pro).
- Bookmark / cheat-sheet (Pro).
- Pre-generated 5 likely interviewer questions per case (case_hints table + Lite reveal logic).
- MBA-only news scope filter (Lite restriction).
- Structured learning paths (Lite progression).
- LinkedIn auth.
- Admin page to manage testimonials (currently hardcoded in `lib/testimonials.ts`).
- Privacy / Terms pages (required for Google OAuth verification + Razorpay public launch).
- Email digest / notifications.
- Public profile pages.

### 7.4 Undocumented Features [UNDOCUMENTED]

- **`scratch/extract_cases.ts` + `scratch_matches.json`** — a one-off migration helper that walks `lib/curriculum/*` and emits a list of cases matched to types/difficulties. Not referenced by any production code path. Likely a manual run-and-discard artifact left in the repo.
- **`global.d.ts`** — declares `.css`, `.scss`, `.sass`, `.svg` as modules. Standard, never discussed.
- **`hooks/use-mobile.jsx`** — viewport breakpoint hook (768 px). Returns `isMobile` boolean. **[CORRECTED by Antigravity recheck]** Imported by `components/ui/sidebar.jsx` (shadcn primitive). Not orphaned — used by sidebar component.
- **`hooks/use-toast.js`** — full custom toast reducer pattern (TOAST_LIMIT=1, ADD/UPDATE/DISMISS/REMOVE_TOAST). **Project uses `sonner` library directly via `toast.success/error` calls**, so this hook is unused legacy.
- **`components/learn-domain-grid.tsx`** — alternative grid view of 18 domains. Imports `LearnPanel` for slide-in view. The main `/learn` page builds its own grid inline rather than importing this. Functionally orphaned.
- **`components/learn-panel.tsx`** — slide-in modal panel; uses `body` overflow lock + ESC handler. Imported only by `learn-domain-grid.tsx` (which is itself orphaned).
- **`components/learn-reader.tsx`** — two-pane reader using legacy `learn_content` DB table. Not imported anywhere in current routes. Orphaned.
- **`components/cases-browser.tsx`** — filter UI used by old `/cases` page which is now a redirect. Orphaned.
- **`triage` CSS classes** in globals.css — defined (`.triage-green/amber/red`) but no usage in current components. Legacy.

[CONFIDENCE: HIGH for 7.1 / 7.2 / 7.4; MEDIUM for 7.3 (rooted in compacted conversation).]

---

## 8. ERROR HANDLING & STATES

### 8.1 API & Async Error Handling

**Frontend `lib/api.ts`:**
- Every fetch wrapped in `if (!res.ok) throw new Error(...)`.
- Specific error messages with status code + raw text snippet.
- `submitCaseAnswer` validates `submission_id` is present in response, throws if missing.

**Client components:**
- `gd-briefs/page.tsx` → try/catch around `fetchHeadlines` → `setError(state)` → renders inline error card with "Try again" reload button.
- `upgrade/page.tsx` → try/catch with toast.error for order create, signature verify, Razorpay payment failure.
- `case-rating-prompt.tsx` → optimistic update, revert on error, toast.error.
- `submission-form.tsx` → submit failure shows toast.error.

**Server pages:**
- Most use `(somethingRes.data as Type | null) || []` defensive fallback patterns.
- `notFound()` triggered on `cases/[id]` and `results/[id]` if row missing.

**Backend:**
- `routes/submit.py` wraps each Supabase call in try/except → raises `HTTPException(500, detail=...)`.
- AI scorer raises typed `AIScoringError`.
- Validation: Pydantic `Field(..., ge=0, le=25)` on every breakdown dimension; `min_length=50` on answer_text.
- Cron routes verify secret first, then wrap each operation; HTTPException 500 with diagnostic detail.

**No global error boundary** in the App Router (no `error.tsx` files found at any level). React errors propagate to Next.js default error page.

### 8.2 Loading States

- **Tile-level skeletons:** `daily-pick-tile.tsx` has explicit `loading` prop rendering bordered skeleton boxes with `animate-pulse`.
- **GD briefs page:** custom `SkeletonCard` component.
- **Buttons:** `upgrade/page.tsx` and `submission-form.tsx` swap button label to `Loader2` spinner + "Sending…" / "Updating…" / "Submitting".
- **Auth pages:** `Suspense` boundary with text fallback "Loading...".
- **Theme toggle:** renders empty `h-8 w-8` div until mounted to prevent hydration mismatch.
- **Reset-password page:** `isReady` gate with "Loading…" text.
- **Daily rank tile:** custom pulse div placeholders.

No global loading bar, no top-bar progress indicator.

### 8.3 Empty States

- **Profile no submissions:** prose link "No submissions yet — try a case."
- **Dashboard Recent Activity empty:** custom `RecentSubmissionsTable` empty branch with Target icon + "No submissions yet" + link.
- **Home Day 1:** `computeSubtext` returns "Day 1 on MECE. Pick today's case below..."
- **Daily Rank Tile when not attempted:** "You haven't attempted today's case." + "Today's case is waiting →".
- **Practice search no results:** **[CORRECTED by Antigravity recheck]** An empty state DOES exist — "No practice items found matching your search." with a "Clear search" button (see `practice-hub.tsx:202–207`). Not a UX gap.
- **GD briefs no headlines yet:** would show empty grid; no copy.
- **Leaderboard with <3 users:** podium conditional renders `top3.length >= 1`, but if 1 user, layout may break (not stress-tested).

### 8.4 Form Validation

**Client-side:**
- `submission-form.tsx`: char count ≥ 200, displayed live; toast.error if not met.
- `reset-password/page.tsx`: 8-char minimum + match check, toast.error on fail.
- `forgot-password/page.tsx`: HTML5 `type="email" required`.
- `auth-form.tsx`: HTML5 native validation.
- `case-rating-prompt.tsx`: button choice (no free text).

**Server-side:**
- `routes/submit.py` Pydantic: `min_length=50` on answer_text, `ge=0 le=100/25/20/15/10` ranges.
- Razorpay verify: presence check for `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `tier`.

**Library:** `zod ^3.25.67` is in `package.json` but **no zod schemas found in the read code** — appears unused so far.

**Validation mismatch:** Client requires 200 chars; server accepts 50. This is intentional (server is more lenient to allow legitimate short answers; client is opinionated) but undocumented.

### 8.5 Auth Error Handling

- Invalid session → middleware redirects to `/login?next={path}`.
- Auth callback failure (`code` exchange error) → redirects to `/login?error=auth_callback` — but `app/login/page.tsx` does not actually surface this `error` query param to the user. Silent.
- Recovery session invalid on `/reset-password` → renders "This reset link is invalid or has expired" + link to request new one.
- API routes (`/api/me`, `/api/razorpay/*`) return 401 JSON if no session.
- Supabase token refresh handled implicitly by `@supabase/ssr` middleware.

### 8.6 Known Gaps — Missing Error Handling

- **`routes/submit.py:badge_awarder import`** — top-of-file import will fail at module load. No graceful degradation. [MISSING ERROR HANDLING — backend startup crash].
- **`routes/submit.py:54–67`** — `case_result.data` access outside try block is technically OK (None falls into `if not case_result.data` branch), but the access pattern is fragile to future refactor. Worth a defensive wrapper.
- **`submission-form.tsx`** — no `finally` block resets `isSubmitting=false` after `router.push` so on browsers where navigation is interrupted, the button could stay disabled.
- **`practice-hub.tsx:Randomize`** — calls `alert()` (no UX, blocks main thread, no fallback).
- **`auth/callback/route.ts`** — auth failure redirects to `/login?error=auth_callback` but login page doesn't read this param. User sees no indication of why they were bounced.
- **`upgrade/page.tsx`** — `process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID` could be undefined; no client-side guard before passing to Razorpay.
- **`lib/api.ts:submitCaseAnswer`** — handles missing `submission_id` from server, but no retry, no exponential backoff. One transient network blip = full failure shown to user.
- **`learn/page.tsx`** + curriculum imports — if curriculum data file fails to parse (corrupted edit), entire learn route crashes with no error boundary.

[CONFIDENCE: HIGH for §8.1–8.5 (extracted from code); HIGH for §8.6 (verified gaps).]

---

## 9. SECURITY

### 9.1 Input Validation & Sanitization

- **Backend Pydantic:** strict typing on submission payload + numeric ranges on all breakdown dimensions.
- **Frontend:** zod installed but unused. Native form validation only.
- **Min/max character checks:** 200 chars client, 50 chars server (see §8.4).
- **No SQL injection risk:** Supabase client uses parameterized queries.
- **No XSS protection visible**: case content + answer text rendered via React (auto-escapes), but `submission.answer_text` displayed with `whitespace-pre-wrap` inside `<p>` — safe.
- **No file upload anywhere** (voice/image planned but not built).

### 9.2 Rate Limiting

- **None implemented anywhere.**
- No rate limiter on `/submit` (a malicious user could spam GPT-4o calls — direct cost burn).
- No rate limit on `POST /news/briefs/{id}` (GPT-4o brief generation per click).
- No rate limit on `/api/razorpay/order` (could spam Razorpay order creation).
- No client-side debounce on the practice search input.
- Cron endpoints protected by `CRON_SECRET` but no rate limit on attempts.

### 9.3 Auth Security

- Sessions cookie-based via `@supabase/ssr`. HTTP-only cookies (managed by Supabase).
- Token refresh on every request (potentially excessive, but standard).
- Auth callback exchanges short-lived `code` → session.
- Password reset uses Supabase recovery flow with PKCE.
- Min password 8 chars (client-side only).
- No 2FA.
- No session expiry override visible — uses Supabase defaults.

### 9.4 API Security

- All `(app)/*` server pages call `auth.getSession()` and redirect on no session.
- `/api/me` returns 401 JSON if no session.
- `/api/razorpay/*` returns 401 if no session.
- Razorpay verify uses HMAC SHA-256 with `RAZORPAY_KEY_SECRET` — correct cryptographic comparison.
- Backend uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS. **No backend-side user authentication** — anyone hitting `/submit` could pass any `user_id`. This is the biggest open API security gap.
- CORS in `next.config.js`: `Access-Control-Allow-Origin: https://mece.in`. CORS in `backend/main.py`: allow_origins includes `localhost:3000`, `mece.in`, `www.mece.in`.
- Cron endpoints require `X-Cron-Secret` header.

### 9.5 Environment Variable Exposure

- `NEXT_PUBLIC_*` env vars are exposed to browser by design (Supabase URL, anon key, API URL, Razorpay key id). These are anon/public values — correct.
- `RAZORPAY_KEY_SECRET` server-only — correct.
- `SUPABASE_SERVICE_ROLE_KEY` backend-only — correct.
- **No hardcoded secrets found in code.**

### 9.6 Known Security Gaps

[SECURITY GAP — CRITICAL] **Backend has no user authentication.** `routes/submit.py` accepts `user_id` from the request body without verifying it matches the authenticated session. Anyone with the API URL could:
- Submit answers on behalf of any user → inflate their points → manipulate leaderboard.
- Spam OpenAI calls billed to MECE account.
- Plant fake submissions linked to other users.

Fix path: pass Supabase JWT from frontend, verify on backend before trusting `user_id`. Mid-effort task.

[SECURITY GAP — Medium] **No rate limiting on `/submit`, `/news/briefs`, `/api/razorpay/order`.** Cost-burn vectors.

[SECURITY GAP — Low] **`next.config.js` sets `frame-ancestors *`.** Allows any site to embed MECE in an iframe — clickjacking risk on payment flow especially. Should be `frame-ancestors 'self'`.

[SECURITY GAP — Low] **CSP `frame-ancestors *` + `Access-Control-Allow-Headers: *`** — overly permissive. Tighten in production.

[SECURITY GAP — Low] **No CSRF protection** on `/api/me`, `/api/razorpay/*` beyond session cookie SameSite. Supabase sets SameSite=Lax by default which is okay but worth explicit verification.

[CONFIDENCE: HIGH]

---

## 10. NOTIFICATIONS & COMMUNICATIONS

### 10.1 Email

- **Only emails sent: Supabase Auth built-ins** (signup confirmation, password reset, magic link).
- **No transactional email** for: payment success/failure, badge awarded, daily reminder, streak break, weekly digest.
- **No service** installed (no Resend, SendGrid, Postmark, AWS SES, Mailgun in any dependency file).

### 10.2 In-App Notifications

- **`sonner ^2.0.5`** library, mounted via `<Toaster />` in `app/layout.tsx`.
- Used via `import { toast } from 'sonner'` in 10+ components: auth-form, forgot-password, reset-password, submission-form, upgrade, case-rating-prompt, etc.
- Pattern: `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg)`.

### 10.3 Push Notifications

- **None.** No service worker, no push subscription handling, no `web-push` or Firebase deps.

### 10.4 Webhooks

- **No incoming webhooks** (e.g., Razorpay webhook for async payment confirmation — would be needed for production).
- **No outgoing webhooks.**

### 10.5 Background Jobs / Cron

Three cron endpoints in `backend/routes/cron.py`:

1. `POST /cron/fetch-news`
   - Fetches headlines (GNews + NewsAPI).
   - Classifies via GPT-4o-mini.
   - Saves top 20 to `news_headlines`.
   - Defensive demotion of old `is_star` headlines after 24h.
   - Designed for ~07:00 IST trigger from cron-job.org [FROM COMPACTION — verify].

2. `POST /cron/cleanup`
   - Deletes headlines older than 14 days.
   - Cascades to associated briefs.
   - Designed for ~03:00 IST trigger.

3. `POST /cron/schedule-daily`
   - Fills `daily_schedule` to maintain 7-day buffer.
   - 60-day cooldown on case reuse.
   - Designed for ~06:00 IST trigger.

All three require `X-Cron-Secret` header.

[CONFIDENCE: HIGH for §10.1–10.4 (clear from code); MEDIUM on cron timing (from compacted memory).]

---

## 11. ANALYTICS & TRACKING

### 11.1 Analytics Setup

- **No analytics library installed.** No Google Analytics, no Plausible, no Mixpanel, no Amplitude, no PostHog, no Vercel Analytics dep visible in `package.json`.
- No tracking calls (`gtag`, `analytics.track`, etc.) found in code.

### 11.2 Error Logging

- **No Sentry, LogRocket, Datadog, Bugsnag, or Rollbar.**
- Backend uses Python `print()` statements for warnings (`print(f"WARN: ...")`). Render free tier logs would capture these.
- Frontend uses `console.error()` in catch blocks (e.g., Razorpay routes). Not aggregated anywhere.

### 11.3 Planned But Not Implemented

(From conversation history)
- Page views, signup conversion, paid conversion funnel, submission completion rate.
- Per-feature usage (which features Lite users actually use).
- No specific tool committed to.

[CONFIDENCE: HIGH — clear absence in code.]

---

## 12. TESTING

### 12.1 Testing Strategy

**Decision (inferred):** "No tests yet, ship first."
- No `lint`, `test`, `typecheck` scripts in `package.json`.
- No test framework dep.

### 12.2 Test Files Found

- `tests/` directory excluded in `.gitignore`.
- **Zero test files** in the actual repo source.

### 12.3 Testing Libraries

- None.

### 12.4 Test Coverage Gaps

- 100% — no automated tests exist.

### 12.5 Testing Decisions From Conversation

[FROM COMPACTION — verify]: Conversation history did not explicitly debate testing; appears to have been deferred indefinitely. Reasonable for an MVP solo build but a production launch risk.

[CONFIDENCE: HIGH — verified absence.]

---

## 13. IMPLEMENTATION DETAILS

### 13.1 Actual Folder Structure

**Frontend (`company-main/`):**
```
.
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── components.json
├── middleware.ts
├── global.d.ts
├── .env.example
├── .gitignore
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── methodology/page.tsx
│   ├── auth/callback/route.ts
│   ├── api/
│   │   ├── me/route.ts
│   │   └── razorpay/
│   │       ├── order/route.ts
│   │       └── verify/route.ts
│   └── (app)/
│       ├── layout.tsx
│       ├── home/page.tsx
│       ├── dashboard/page.tsx
│       ├── practice/page.tsx
│       ├── learn/page.tsx
│       ├── learn/[slug]/page.tsx
│       ├── leaderboard/page.tsx
│       ├── profile/page.tsx
│       ├── upgrade/page.tsx
│       ├── cases/page.tsx
│       ├── cases/[id]/page.tsx
│       ├── results/[id]/page.tsx
│       ├── gd-briefs/page.tsx
│       └── gd-briefs/[id]/page.tsx
├── components/
│   ├── app-nav.tsx
│   ├── auth-form.tsx
│   ├── badge-pill.tsx
│   ├── career-ladder.tsx
│   ├── case-attempt-history.tsx
│   ├── case-rating-prompt.tsx
│   ├── cases-browser.tsx                 ← orphaned legacy
│   ├── daily-pick-tile.tsx
│   ├── daily-rank-tile.tsx
│   ├── dashboard-client.tsx
│   ├── dimension-radar.tsx
│   ├── domain-viewer.tsx                  ← 947 lines, learn's heart
│   ├── framework-diagrams.tsx
│   ├── geo-pattern.tsx
│   ├── hint-toggle.tsx
│   ├── home-content.tsx
│   ├── home-hero.tsx
│   ├── learn-domain-grid.tsx              ← orphaned
│   ├── learn-panel.tsx                    ← orphaned
│   ├── learn-reader.tsx                   ← orphaned legacy
│   ├── practice-hub.tsx
│   ├── progress-chart.tsx
│   ├── section-header.tsx
│   ├── sign-out-button.tsx
│   ├── skill-mastery-grid.tsx
│   ├── stat-tile.tsx
│   ├── submission-form.tsx
│   ├── submission-heatmap.tsx
│   ├── testimonials-carousel.tsx
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   ├── tier-badge.tsx
│   ├── tier-gate.tsx                      ← built but never used
│   ├── user-context.tsx
│   └── ui/ (47 shadcn primitives)
├── hooks/
│   ├── use-mobile.jsx                     ← used by ui/sidebar.jsx
│   └── use-toast.js                       ← unused legacy
├── lib/
│   ├── api.ts
│   ├── constants.ts
│   ├── testimonials.ts
│   ├── tier.ts
│   ├── types.ts
│   ├── utils.ts
│   ├── curriculum/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── data-foundations.ts (D1–D6)
│   │   ├── data-advanced.ts (D7–D12)
│   │   └── data-supplementary.ts (D13–D18)
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── scratch/
│   └── extract_cases.ts                   ← one-off helper
├── scratch_matches.json                   ← helper output
└── supabase/
    └── seed.sql
```

**Backend (`backend-main/`):**
```
.
├── main.py
├── requirements.txt                       ← UTF-16 BOM, deploy bug
├── .env.example
├── .gitignore
├── prompts/
│   └── scoring_prompt.py                  ← no __init__.py
├── routes/
│   ├── cron.py
│   ├── daily.py
│   ├── news.py
│   └── submit.py                          ← imports missing services.badge_awarder
└── services/
    ├── __init__.py
    ├── ai_scorer.py
    ├── brief_generator.py
    ├── daily_scheduler.py
    ├── headline_classifier.py
    ├── news_fetcher.py
    └── supabase_client.py
    └── badge_awarder.py                   ← MISSING, code references this
```

### 13.2 Naming Conventions

- Files: **kebab-case** for components (`case-attempt-history.tsx`), `lowercase` for app router (`page.tsx`, `route.ts`).
- Mixed JSX (`.jsx`) for shadcn primitives, TSX (`.tsx`) for custom code.
- Components: **PascalCase** export default.
- Functions: **camelCase**.
- Constants: **SCREAMING_SNAKE_CASE** (`CASE_TYPES`, `MIN_ANSWER_CHARS`, `TIER_LIMITS`).
- DB columns: **snake_case** (`is_first_attempt`, `subscription_tier`, `created_at`).
- React props interfaces: `ComponentNameProps` or `Props` if local.
- Inconsistency found: `Stat` (capital S) local-only function in `profile/page.tsx`, `QuickLink` in `home-content.tsx`. Some helper functions are exported (`computeGreeting`), others nested (good — encapsulation).

### 13.3 State Management

- **No Redux, Zustand, Jotai, Recoil, MobX.**
- Server state: server components fetch fresh on every request (or per `revalidate` window).
- Client state: React `useState`, `useEffect`, `useMemo` only.
- Cross-cutting client state: single **React Context** for user (`components/user-context.tsx`).
- Forms: `react-hook-form ^7.58.1` + `@hookform/resolvers ^5.1.1` installed but **not actually used in any form found in the code** — auth-form, submission-form, forgot-password, reset-password, case-rating-prompt all use plain `useState`.
- URL state: `useSearchParams` from `next/navigation` used for `?focus=` and `?tab=` on practice page.

### 13.4 API Layer

- **Frontend → external scoring backend:** plain `fetch()` calls in `lib/api.ts`. No axios usage (axios is in deps but unused).
- **Frontend → Supabase:** `@supabase/ssr` for server (cookie-based) and browser (anon-key) clients, separated cleanly into `lib/supabase/{server,client,middleware}.ts`.
- **Frontend → internal API routes:** `fetch('/api/...')` from `user-context.tsx`, `upgrade/page.tsx`.
- **Backend → Supabase:** Python `supabase` library, service role key, `get_supabase_client()` factory.
- **Backend → OpenAI:** official `openai` Python SDK, `gpt-4o` for scoring/brief, `gpt-4o-mini` for classification.
- **Backend → GNews/NewsAPI:** `httpx` direct GET calls.

### 13.5 Key Utilities & Custom Hooks

| Util / Hook | File | What it does | Used where |
|---|---|---|---|
| `cn(...inputs)` | `lib/utils.ts` | clsx + tailwind-merge for safe className composition | Throughout (mostly via shadcn primitives) |
| `effectiveTier(user)` | `lib/tier.ts` | Returns current tier respecting expiry | `user-context.tsx`, `cases/[id]/page.tsx` |
| `hasTier(user, required)` | `lib/tier.ts` | Boolean tier-permission check | `user-context.tsx` (exposed as `hasTierAccess`) |
| `submitCaseAnswer(payload)` | `lib/api.ts` | POSTs to backend, returns submission_id | `submission-form.tsx` |
| `fetchHeadlines()` | `lib/api.ts` | GET /news/headlines | `gd-briefs/page.tsx` |
| `generateBrief(headlineId)` | `lib/api.ts` | POST /news/briefs/{id} (triggers GPT-4o) | `gd-briefs/page.tsx` |
| `fetchBrief(headlineId)` | `lib/api.ts` | GET /news/briefs/{id} (no AI call) | `gd-briefs/[id]/page.tsx` |
| `fetchDailyToday()` | `lib/api.ts` | GET /daily/today | `home-content.tsx` |
| `fetchDailyLeaderboard()` | `lib/api.ts` | GET /daily/leaderboard | `daily-rank-tile.tsx` |
| `getDomainBySlug(slug)` | `lib/curriculum/index.ts` | Lookup helper for 18 domains | `learn/[slug]/page.tsx` |
| `getAllSlugs()` | `lib/curriculum/index.ts` | Static-params helper | `learn/[slug]/page.tsx` |
| `useUser()` | `components/user-context.tsx` | Custom hook returning UserContextValue | All client components needing user/tier |
| `useIsMobile()` | `hooks/use-mobile.jsx` | Viewport width <768 boolean | **Unused** (orphaned) |
| `computeGreeting()` | `components/home-hero.tsx` (local) | Hour-based greeting string | Hero only |
| `computeSubtext()` | `components/home-hero.tsx` (local) | Streak-aware subtext | Hero only |
| `deriveTierName(points)` | `components/dashboard-client.tsx` (local) | Career-ladder tier name | Dashboard only |
| `deriveNextTierPts(points)` | `components/dashboard-client.tsx` (local) | Points to next career tier | Dashboard only |
| `today_ist_date()` | `routes/daily.py` | Today's date in IST | Backend routes |
| `today_in_ist()` | `services/daily_scheduler.py` | Today as datetime in IST | Backend scheduler |
| `verify_cron_secret(...)` | `routes/cron.py` | Auth check for cron endpoints | All three cron handlers |

### 13.6 Performance Decisions

- Server pages use `Promise.all(...)` for parallel Supabase queries (visible in `dashboard/page.tsx`, `cases/[id]/page.tsx`, `practice/page.tsx`).
- O(1) rank via Supabase `count: 'exact', head: true` filters.
- `revalidate` directives per page to balance freshness vs cost.
- Static `generateStaticParams` for `/learn/[slug]` — all 18 domain pages pre-rendered at build.
- `images.unoptimized: true` skips Next image optimization (saves serverless invocations on Vercel).
- `lib/curriculum/*` imports tree-shaken by Next.js (each domain page only pulls what it uses).
- No `next/dynamic` lazy loading observed → all client components loaded eagerly.
- `Razorpay checkout.js` loaded via `next/script strategy="lazyOnload"` (good — defers until after page interactive).
- No memo / useCallback hotspots — most components are small enough not to need them.
- ProgressChart uses Tremor's AreaChart which internally uses Recharts (heavyweight). Could be a bundle weight contributor.
- Bundle includes: full Radix UI suite (28 packages), Recharts, Tremor, Razorpay, lucide (~700 icons), mongodb (unused but still bundled? actually Next 14 tree-shakes server-only deps; OK).

### 13.7 Internationalization

- **No i18n setup.** Single language: English.
- Locale-aware `Date.toLocaleDateString('en-IN', ...)` calls render dates in Indian format (e.g., "TUESDAY, 27 MAY 2026").
- Numbers in some places use `.toLocaleString('en-IN')` for Indian comma grouping.
- All copy hardcoded; no translation framework.

[CONFIDENCE: HIGH]

---

## 14. DEPLOYMENT PIPELINE

### 14.1 Build Process

- Frontend: `npm run build` → `next build`. With `output: 'standalone'`, produces minimal Node server bundle. Vercel auto-detects.
- Backend: presumably `uvicorn main:app` on Render. No `Procfile` or `render.yaml` in repo.

### 14.2 Environments

- README mentions only one set of env vars; no documented dev/staging/prod separation.
- `next.config.js` CORS pinned to `https://mece.in` (production), but backend CORS allows `localhost:3000` + `mece.in` + `www.mece.in`.
- Backend uses `OPENAI_API_KEY`, `GNEWS_API_KEY`, `NEWSAPI_KEY` — presumably same keys across environments (no environment-specific overrides documented).

### 14.3 CI/CD

- **No `.github/workflows/` directory.**
- **No CI tests, no auto-deploy hooks.**
- Vercel auto-deploys on push to main (per README).
- Render auto-deploys per its default behavior on push (assumed, not verified).
- No preview deployments configured.
- No deployment status badge.

### 14.4 Deploy Config

- `next.config.js` — `output: 'standalone'`, image optimization disabled, custom headers (see §3.3).
- **No `vercel.json`** — would normally pin region (e.g., `bom1` Mumbai for Indian users). Missing means default US region → 200ms+ latency penalty.
- **No `Procfile` / `render.yaml`** for backend.
- **No Dockerfile.**
- Backend `requirements.txt` has the UTF-16 BOM problem (see §19.2).

### 14.5 Known Deploy Issues

[DEPLOY ISSUE — Minor] **No region pin** for Vercel. Indian users hit US edge.
[DEPLOY ISSUE — Minor] **No env-var validation** at startup beyond OpenAI + Supabase. GNEWS_API_KEY can be missing → news fetch fails silently with `print()` warnings.

[CONFIDENCE: HIGH for code-level deploy issues; MEDIUM for runtime (cannot inspect running prod).]

---

## 15. DECISIONS LOG

- [DECISION]: Chose Next.js 14 App Router — confirmed in code: yes (`package.json`, `app/` directory)
- [DECISION]: Chose Supabase for auth + DB — confirmed in code: yes
- [DECISION]: Chose Razorpay over Stripe for INR payments — confirmed in code: yes (live integration)
- [DECISION]: Chose OpenAI GPT-4o for scoring, GPT-4o-mini for headline classification — confirmed in code: yes
- [DECISION]: Chose FastAPI for backend (separate repo) — confirmed in code: yes
- [DECISION]: Chose Tailwind + shadcn/ui + Tremor + Recharts for UI — confirmed in code: yes
- [DECISION]: Chose `@supabase/ssr` (cookie sessions) over hash-fragment auth — confirmed in code: yes
- [DECISION]: 6-dimension 100-point scoring rubric with Structure/Quant/Synthesis/Business Judgment/Creativity/Presence — confirmed in code: yes (`lib/constants.ts`, `prompts/scoring_prompt.py`)
- [DECISION]: Score dimension JSON keys are `business_judgment` and `presence` (not `judgment`/`tone`) — confirmed in code: yes
- [DECISION]: Tier values are `'free' | 'lite' | 'pro'` lowercase — confirmed in code: yes
- [DECISION]: Lite ₹199, Pro ₹499 monthly — confirmed in code: yes (`TIER_PRICES`, also hardcoded as paise in `api/razorpay/order/route.ts`)
- [DECISION]: Free users limited to 0 re-attempts, Lite/Pro unlimited — confirmed in code: yes (`cases/[id]/page.tsx`)
- [DECISION]: Learn examples limited to 2 per domain — partial: limit defined in `TIER_LIMITS.learnExamplesPerDomain = 2`, but actual rendering in `domain-viewer.tsx` not verified to enforce this slice
- [DECISION]: Daily content rotation with 7-day buffer + 60-day cooldown — confirmed in code: yes (`services/daily_scheduler.py`)
- [DECISION]: News cron at 07:00 IST, daily schedule cron at 06:00 IST — partial: code supports any time; actual trigger times only [FROM COMPACTION — verify]
- [DECISION]: Daily case has its own leaderboard separate from all-time — confirmed in code: yes (`/daily/leaderboard`)
- [DECISION]: First-attempt-only counts for daily leaderboard and points — confirmed in code: yes (`routes/submit.py`)
- [DECISION]: Re-attempts increment `attempt_number` but do not update points or `users.points` — confirmed in code: yes
- [DECISION]: Badge catalog with 16 badges across milestone/streak/mastery/social — confirmed in code: yes (catalog references); award logic missing
- [DECISION]: Badge rarity tiers common/rare/epic/legendary — confirmed in code: yes (`badge-pill.tsx`)
- [DECISION]: Career ladder 7 tiers from Day 0 Dreamer to Summer Legend, displayed bottom-up — confirmed in code: yes
- [DECISION]: NO `border-l-4` accent bars on generic tiles — partial: `dashboard-client.tsx` follows, but `profile/page.tsx` has `border-l-4 border-l-navy` on hero card (violation) and `results/[id]/page.tsx` has `border-l-4 border-l-success` and `border-l-4 border-l-primary` (these are semantic — arguably allowed per rules, but worth flagging)
- [DECISION]: Hero in `(app)` pages uses date + greeting + first name pattern — confirmed in code: yes
- [DECISION]: Brand colors locked: cardinal red, navy, warm off-white — confirmed in code: yes (CSS vars)
- [DECISION]: Inter font for everything — confirmed in code: yes
- [DECISION]: Build a personalized `/home` separate from analytics `/dashboard` — confirmed in code: yes
- [DECISION]: Post-login redirect to `/home` (not `/dashboard`) — confirmed in code: yes (`lib/supabase/middleware.ts:39–43`)
- [DECISION]: Wordmark "MECE" with red M — confirmed in code: yes (app-nav.tsx, landing nav, all auth pages)
- [DECISION]: Testimonials as static file `lib/testimonials.ts` until Phase 6 admin UI — confirmed in code: yes (8 testimonials, comment says "Admin UI for managing these = Phase 6")
- [DECISION]: First testimonial is Satyam Kumar, with LinkedIn URL — confirmed in code: yes. **[ANTIGRAVITY CORRECTION]** School field in `lib/testimonials.ts` says 'FMS Delhi' for Satyam, Mohit, and Kishan — but their actual schools are IMI New Delhi, TISS HRM, and IIM Indore respectively. Testimonials file not yet updated with correct school data from the Makers section work.
- [DECISION]: Testimonials carousel auto-rotates every 5 seconds, shows 3 at a time — confirmed in code: yes
- [DECISION]: Cron endpoints protected by `CRON_SECRET` header — confirmed in code: yes
- [DECISION]: Headlines older than 14 days deleted by cron — confirmed in code: yes
- [DECISION]: Brief generation lazy on first click, cached per headline forever — confirmed in code: yes
- [DECISION]: `(app)/cases` route deprecated → redirects to `/practice?tab=cases` — confirmed in code: yes (`app/(app)/cases/page.tsx`)
- [DECISION]: Theme: light default, dark optional, next-themes — confirmed in code: yes
- [DECISION]: Razorpay checkout brand color = navy `#0F172A` — confirmed in code: yes (`upgrade/page.tsx:88`). Slight inconsistency with `--navy: 214 72% 13%` which is closer to `#0F1C33`. [CONFLICT — VERIFY]
- [DIVERGED]: Planned `payments` ledger table; built only `subscription_tier` field update — located at `app/api/razorpay/verify/route.ts`
- [DIVERGED]: Planned streak persistence in DB; computed client-side only — located at `components/home-hero.tsx`, `users.streak_count/streak_last_date` unused
- [DIVERGED]: Planned daily guesstimate rotation in `daily_schedule.guesstimate_code`; backend writes NULL, frontend falls back — located at `services/daily_scheduler.py:114–122`
- [DIVERGED]: Planned removal of `mongodb` package after Supabase choice; still in `package.json` — located at `package.json:53`
- [REVISED]: Old `learn_content` table → new `lib/curriculum/*` static data — visible in code at `components/learn-reader.tsx` (orphaned) vs `components/domain-viewer.tsx` (active)
- [REVISED]: Cases page from filter-grid → redirect to practice page — visible in `app/(app)/cases/page.tsx`
- [REVISED]: Practice page tabs renamed from {All, Cases, Guesstimates, Case Studies} to {All, Scored Cases, Guesstimates, Case Studies} — visible in `components/practice-hub.tsx`
- [REVISED]: Dashboard rank computation upgraded from O(n) `select all + filter` to O(1) `count exact head` — visible in `app/(app)/dashboard/page.tsx:76–78`
- [REVISED]: `(app)` layout fallback user now includes `subscription_tier`, `subscription_started_at`, etc. — visible in `app/(app)/layout.tsx:24–33`
- [REVISED]: `package.json name` changed from `consulting-platform-frontend` (presumed earlier) to `mece` — visible in `package.json:2`
- [CONFLICT — VERIFY]: Razorpay theme color `#0F172A` in checkout config vs `--navy` token `#0F1C33` (HSL `214 72% 13%`). Decide which is canonical.
- [CONFLICT — VERIFY]: `submission-form.tsx` enforces 200 char minimum; `routes/submit.py:SubmissionRequest` enforces 50 char minimum. Server is more lenient. Either align or document.
- [CONFLICT — VERIFY]: `lib/api.ts:submitCaseAnswer` validates `submission_id` presence but `SubmissionResponse` Pydantic model in `routes/submit.py` declares `submission_id` as non-optional. Should always be present. Defensive check is harmless but redundant.
- [FROM COMPACTION]: External cron service is cron-job.org — could not verify in code (only the endpoint exists, not the trigger config)
- [FROM COMPACTION]: Backend hosted on Render free tier — could not verify in code
- [FROM COMPACTION]: GoDaddy → Vercel domain config — could not verify in code
- [FROM COMPACTION]: Google OAuth project in "Testing" mode, needs verification — could not verify in code
- [FROM COMPACTION]: 30+ seed users exist for leaderboard population — could not verify in code (seed.sql has only 1 GD brief + 5 cases + 4 learn entries, no user inserts)
- **[ANTIGRAVITY ADDITION]** [DECISION]: Makers section ("Minds Behind MECE") built as separate component from testimonials, using real team LinkedIn profiles — confirmed in code: `components/makers-section.tsx` (may be in `company_test` clone only)
- **[ANTIGRAVITY ADDITION]** [DECISION]: Testimonials carousel shows 3 at a time in grid layout (not 1-at-a-time) — confirmed in code: `components/testimonials-carousel.tsx`


---

## 16. TODO / FIXME AUDIT

Grep across `*.ts`, `*.tsx`, `*.js`, `*.jsx`, `*.py` in both repos for `TODO`, `FIXME`, `HACK`, `XXX`, `NOTE`:

**Result: zero hits.** No TODO, FIXME, HACK, or XXX comments anywhere in the codebase.

Comments that hint at planned-work but use other phrasing:
- `services/daily_scheduler.py:113` — "filled by frontend fallback for now" (guesstimate slot NULL).
- `services/daily_scheduler.py:115` — "In a future iteration, we can sync curriculum guesstimate codes into Supabase."
- `services/daily_scheduler.py:118` — "If you want to populate them properly, add a guesstimates table later."
- `routes/daily.py:62` — "attempted_by_current_user: bool = False  # filled by frontend or auth-aware version later"
- `components/practice-hub.tsx:33` — "Will wire this after DB migration is fully wired."
- `lib/testimonials.ts:5` — "Admin UI for managing these = Phase 6."

None of these use the standard tag tokens, but all represent acknowledged debt. Flag as **needs attention** in code but not blocking.

[CONFIDENCE: HIGH — exhaustive grep run.]

---

## 17. NON-NEGOTIABLES

(From conversation history, cross-checked against code.)

- **"Brand colors locked: cardinal red, navy, cream/off-white"** — honored in code: partially.
  [VIOLATED — `app/page.tsx:213` uses raw `bg-amber-400`, `bg-emerald-500`; `app/(app)/learn/(standard)/page.tsx` and `components/learn-domain-grid.tsx` use raw amber + emerald in DOMAIN_ACCENTS; `components/tier-badge.tsx` uses raw `amber-500/10`. Fix: replace with `bg-warning` / `bg-success` semantic tokens or grayscale.]

- **"NO `border-l-4` accent bars on generic tiles"** — honored in code: partially.
  [VIOLATED — `app/(app)/profile/page.tsx:38` has `border-l-4 border-l-navy` on the profile hero card which is a generic tile. Fix: remove or replace with the standardized dot indicator pattern.]
  Allowed exceptions (semantic): results page Strengths/Improvements panels keep `border-l-4 border-l-success` and `border-l-4 border-l-primary` respectively — arguably justified.

- **"Tier values are `'free' | 'lite' | 'pro'` lowercase"** — honored in code: yes (typed in `lib/types.ts`).

- **"Score breakdown keys must be `business_judgment` and `presence`"** — honored in code: yes (`lib/constants.ts`, `prompts/scoring_prompt.py`, `routes/submit.py`).

- **"NEVER touch `lib/curriculum/*` without explicit instruction"** — honored in code: presumed yes (no obvious damage detected; `scratch/extract_cases.ts` reads but never writes to curriculum).

- **"Timezone is Asia/Kolkata"** — honored in code: yes (`IST_OFFSET` in `routes/daily.py`, `services/daily_scheduler.py`, `routes/submit.py`).

- **"Use existing utility classes (ui-card, btn-primary, text-h1, etc.)"** — honored in code: mostly. Most pages use the `text-h1`, `text-h2`, `text-h3`, `text-micro`, `text-body` scale and `ui-card` class as intended. Exceptions: some inline `text-[Npx]` values still appear (e.g., landing page `text-[13px]`, `text-[12px]`, `text-[11px]`).

- **"Use `useUser()` rather than fetching user in every component"** — honored in code: yes.

- **"Post-login redirect = `/home`, not `/dashboard`"** — honored in code: yes (`lib/supabase/middleware.ts:39–43`, `app/auth/callback/route.ts:11`).

- **"Daily content (case + guesstimate + brief) rotates at midnight IST"** — honored in code: partially. Backend honors IST cutoff for `today_ist_date()` and `daily_date_val` assignment. But `daily_schedule.guesstimate_code` is always NULL and `brief_headline_id` is also NULL (frontend uses star headline of the day independently) — so only the case actually rotates, not all three slots.

- **"`mongodb` should be removed from dependencies after Supabase migration"** — VIOLATED — still in `package.json:53`. Dead weight but harmless (server-only, tree-shaken from client bundle).

- **"Free tier shows preview only; Lite/Pro unlock"** — partially honored.
  - Re-attempts: enforced.
  - Hint chatbot, bookmarks, news scope, learn examples per domain, practice questions per day: limits defined in `TIER_LIMITS` but not enforced anywhere in current code. The Phase 3B / 3C / 5 features have not landed yet.

[CONFIDENCE: HIGH]

---

## 18. BUILD STATUS

### 18.1 Fully Built & Confirmed Working

(Subject to running code matching the repo; assumes backend has `badge_awarder.py` present in prod.)

- ✅ Auth flow: signup, login, Google OAuth, forgot/reset password
- ✅ Landing page with hero, features mocks, methodology grid, testimonials carousel, CTA
- ✅ Personalized home: hero, daily picks (with brief fallback), heatmap, mastery grid, testimonials, quick links
- ✅ Dashboard: stat tiles (Points/Rank/Avg/Percentile), DimensionRadar, ProgressChart, CareerLadder, DailyRankTile, Activity heatmap + recent submissions
- ✅ Practice hub: tabs, search, randomize (sort of), pagination, attempted markers
- ✅ Case detail with hint, attempt history, re-attempt locking, difficulty rating
- ✅ Submission scoring loop (assuming `badge_awarder.py` exists at deploy)
- ✅ Results page with score ring, new-badge banner, breakdown bars, strengths/improvements
- ✅ Learn: 18 domain reader pages, framework SVG diagrams, full curriculum data
- ✅ GD Briefs: list + lazy generation + detail render
- ✅ Leaderboard top-50 + podium
- ✅ Profile with badges + recent submissions
- ✅ Razorpay payment flow: order, verify, tier update
- ✅ TierBadge in nav
- ✅ 16-badge catalog in DB, display on results + profile
- ✅ Case rating system (`case_ratings` upsert)
- ✅ Daily content cron: schedule-daily + fetch-news + cleanup
- ✅ Daily leaderboard endpoint
- ✅ Theme switching (light/dark)
- ✅ 6-dimension scoring rubric with calibrated GPT-4o prompts

### 18.2 Partially Built — Exactly What's Missing

- ⚠️ **Streak persistence** — calculated in `home-hero.tsx`, never written to `users.streak_count` / `streak_last_date`. Add to `routes/submit.py`.
- ⚠️ **Practice `?focus=` filter** — param parsed, currently warns to console only.
- ⚠️ **Practice "Randomize" button** — calls `alert(item.title)` instead of navigating to the case.
- ⚠️ **Daily guesstimate rotation** — backend always writes NULL; relies on frontend fallback.
- ⚠️ **`TierGate` component** — built (3 variants) but never imported by any page.
- ⚠️ **`zod`** — installed but unused; no schemas defined.
- ⚠️ **`react-hook-form`** — installed but unused.
- ⚠️ **`axios`** — installed but unused (everything uses native `fetch`).
- ⚠️ **`mongodb`** — installed but unused.
- ⚠️ **Curriculum case migration** — `scratch/extract_cases.ts` produced `scratch_matches.json` but the cases haven't been bulk-inserted into `public.cases` table (seed only has 5).
- ⚠️ **Learn examples per domain limit** — `TIER_LIMITS.learnExamplesPerDomain: 2` defined; not verified whether `domain-viewer.tsx` actually slices to 2 examples (947-line file, only header read).
- ⚠️ **Razorpay webhook handler** — no `/api/razorpay/webhook` route. No async payment notification handling.
- ⚠️ **Vercel region pin** — no `vercel.json`, defaults to US.
- ⚠️ **Methodology page** — listed but only head read; content quality not verified.

### 18.3 Not Started

- Mock interview timer (Pro)
- Voice input (Whisper) — Phase 3C
- Image input (GPT-4o vision) — Phase 3C
- Solved examples + hint chatbot + compare-to-model — Phase 3B
- Bookmark / cheat-sheet (Pro)
- LinkedIn share daily ranking (Pro)
- MBA-only news scope filter (Lite)
- Structured learning paths (Lite)
- Email notifications / digest
- Admin UI for testimonial management (Phase 6)
- Privacy / Terms / Refund policy pages (required for Razorpay public launch + Google OAuth verification)
- Public profile pages
- Analytics / error tracking
- Test coverage
- Rate limiting

---

## 19. OPEN QUESTIONS & BLOCKERS

### 19.1 Unresolved Decisions

- **Razorpay brand color**: `#0F172A` in checkout vs `--navy` token `#0F1C33`. Pick one.
- **200 vs 50 character submission minimum** (client vs server). Reconcile.
- **Practice page Randomize behavior**: alert popup is placeholder; should it open the case directly, route to it with a confetti animation, or shuffle the visible page?
- **Whether to bulk-migrate `lib/curriculum/*` cases into `public.cases`**: scratch helper exists, but only 5 cases are in DB. Decide whether curriculum cases are "practice-able" (need DB row + submissions support) or "read-only learning" (stay static in `lib/`).
- **`payments` table**: build the ledger insert now or defer? Affects refund/chargeback auditability.
- **`subscription_expires_at`**: hardcode 30 days from `paid_at` in verify route, or wait for cron-based renewal?
- **Subscription renewals**: no recurring billing wired. One-time payment only. Decide if this becomes Razorpay Subscriptions or remains pay-monthly-manually.
- **Domain → case filter in PracticeHub**: how should `?focus=domain-slug` filter cases? Cases in DB don't have a `domain` field — would need either a join table `case_domains` or a `domain` column added.
- **Mode/source of guesstimate rotation**: from `lib/curriculum/*.guesstimates` (frontend-static) or new DB table? Daily scheduler punts.
- **OAuth scopes / Google verification**: app is in Testing mode per [FROM COMPACTION]. Cannot publish without completing Google's app verification.

### 19.2 Code That Looks Incomplete or Broken

7. **`users.streak_count`/`streak_last_date` never updated** — column exists, write path missing.
8. **`daily_schedule.guesstimate_code` always NULL** — scheduler hardcodes NULL.
9. **`daily_schedule.brief_headline_id` always NULL** — never written (briefs use star headline lookup separately).
10. **Practice page Randomize**: `alert(...)`. Not production UX.
11. **Practice page `?focus=` param**: ignored with `console.warn`.
12. **`tier-gate.tsx`**: defined, never used.
13. **`learn-reader.tsx`, `cases-browser.tsx`, `learn-domain-grid.tsx`, `learn-panel.tsx`**: orphaned legacy components still in repo.
14. **`hooks/use-mobile.jsx`, `hooks/use-toast.js`**: defined, never imported.
15. **`scratch/extract_cases.ts`, `scratch_matches.json`**: one-off helpers committed to repo.
16. **`zod`, `react-hook-form`, `@hookform/resolvers`, `axios`, `mongodb` installed but unused**.
17. **`vercel.json` missing** — no region pin.
18. **`next.config.js` `frame-ancestors *`** — clickjacking risk.
19. **`tier-badge.tsx` raw amber color** — off-token.
20. **`profile/page.tsx` `border-l-4 border-l-navy`** — violates "no border-l-4 on generic tiles" rule.
21. **`@types/react ^19.2.14` with React 18 runtime** — version mismatch may surface type errors in new code.
22. **`dev:no-reload` and `dev:webpack` scripts identical** — clean up.
23. **`auth/callback?error=auth_callback`** — login page doesn't render this error message.
24. **No global Next.js `error.tsx`** — uncaught errors show default Next error page.

### 19.3 Conversation vs Code Conflicts Needing a Call

- **Daily cron timing**: conversation says 06:00 IST schedule + 07:00 IST news; code doesn't enforce timing (external cron-job.org config). Verify production cron config.
- **30+ seed users mentioned**: not present in `supabase/seed.sql`. Either inserted manually in prod or this was aspirational.
- **Makers section in `company_test`**: Built during Antigravity conversation session, may not be in the production `company` directory. Needs merge.
- **Daily cron timing**: conversation says 06:00 IST schedule + 07:00 IST news; code doesn't enforce timing (external cron-job.org config). Verify production cron config.
- **Phase 2 final commit**: README still describes pre-Phase-2 architecture ("Dashboard with today's case, today's GD brief, points & rank, recent activity") — should mention `/home`.

### 19.4 Missing Information That Blocks Progress

- Actual Supabase migration SQL files (DDL) — schema only inferred from code reads.
- Production list of indexes (cannot verify perf claims).
- Production RLS policies (only README hints).
- The exact 16 badges seeded in production (catalog inferred from conversation + types).
- Whether the curriculum cases have been bulk-migrated to `public.cases` table (only 5 seed cases visible).
- Cron-job.org schedule configuration.
- Current count of users / submissions in production.

### 19.5 Technical Debt — Things That Work But Shouldn't Stay As Is

1. **Career-ladder thresholds duplicated** in `career-ladder.tsx` and `dashboard-client.tsx` (`deriveTierName`, `deriveNextTierPts`). Extract to `lib/career-tiers.ts`.
2. **Razorpay tier amounts hardcoded** as paise in `api/razorpay/order/route.ts` (19900, 49900) instead of pulling from `TIER_PRICES`.
3. **Backend has no JWT verification** — anyone can hit `/submit` with any `user_id`.
4. **No CI** — pure manual deploy.
5. **No tests** — every refactor risks regression.
6. **Curriculum 2,759 lines as TS source** — every change rebuilds the whole client bundle.
7. **Orphaned components** clutter `components/`. Delete or wire.
8. **Dead deps in `package.json`** — clean up.
9. **No structured logging** — `print()` and `console.error()` only.
10. **Hardcoded testimonials** — fine for MVP, but admin upload UI is overdue (Phase 6).
11. **No image optimization** — `next.config.js` disables it. If users upload avatars or content adds images, this becomes expensive.
12. **Hooks/* directory has only unused files** — could be removed entirely.
13. **`.gitignore` excludes `tests/`** — committing tests would be impossible later without editing this.
14. **`force-dynamic` on home + dashboard + profile** means no caching at all. Server load scales linearly with traffic.
15. **`scratch/` and `scratch_matches.json` committed** — dev artifacts in repo.
16. **shadcn primitives in mix of `.jsx` and `.tsx`** — convert remaining `.jsx` to `.tsx` for type safety.
17. **No e2e auth tests** — Razorpay signature verify is correct in code but un-fuzzed.

---

## FINAL SELF-ASSESSMENT

### 1. Can a developer continue building from this document alone?

**Mostly yes, with two caveats:**
- They will need access to the production Supabase project to see actual RLS policies, indexes, and the real badge catalog rows. The schema in §6.1 is inferred from code, not migration files.
- They will need to know the production cron-job.org configuration (which endpoints fire at which times).


Everything else — design system, component inventory, file paths, tier logic, scoring rubric, prompt content, Razorpay flow — is in this document. New work should not need clarification.

### 2. Can a designer produce new screens consistent with what's built?

**Yes.** §4 captures:
- Every CSS variable (with hex + role + usage location)
- Full Tailwind extension config
- Custom typography scale (text-micro/small/body/strong/h3/h2/h1)
- Animation primitives + stagger pattern
- Component inventory with prop shapes
- Microcopy patterns (uppercase section headers, taglines, button labels)
- The "no border-l-4 on generic tiles" rule
- "Cardinal red only" gamification rule

A designer should be able to mock a new section that matches without asking — provided they accept the off-token amber/emerald uses in `tier-badge` and `learn` as either intentional or scheduled for cleanup.

### 3. Top 5 things most likely to cause misalignment or bugs in the next session

2. **Three different sources of tier-name truth** (`career-ladder.tsx`, `dashboard-client.tsx:deriveTierName`, conversation copy). New tier additions must update all three.
3. **Curriculum data is static in `lib/`, not in DB** — adding a "comparison to model solution" feature can't just attach to the `cases` table for curriculum cases; either move them to DB first or carry a static reference. Conversation Phase 3B Q1 hinted at "C — extend cases table" but that means migrating curriculum first.
5. **Dashboard rendering depends on a `feedback_json.breakdown` that uses `business_judgment` + `presence` keys** — landing page mock uses display labels "Judgment" and "Tone". Anywhere you see "judgment" without underscore = display only, not data key. Mixing them in new code will silently break the radar.

### 4. Sections with LOW or MEDIUM confidence

- §1.6 (Positioning & Tone) — MEDIUM. Partial from compaction.
- §2.12 (Rejected technologies) — MEDIUM. Mix of code + memory.
- §6.3 (RLS policies) — MEDIUM. Inferred from README hints, not migration files.
- §6.4 (Indexes) — MEDIUM. Inferred from query patterns.
- §14 deploy timing details — MEDIUM. Cannot verify cron-job.org config.
- §15 [FROM COMPACTION] decisions — flagged inline.

All other sections: HIGH confidence, directly extracted from code.

### 5. Biggest single risk to the project right now

**Data Migration / Curriculum structure.** Adding a \"comparison to model solution\" feature can't just attach to the `cases` table for curriculum cases without migrating them to the database first, or building a static reference linker.
---

## APPENDIX: CROSS-VALIDATION SUMMARY (Antigravity vs Claude)

### What Claude found that Antigravity missed:
- `TierGate` component built but never used in any page
- 6 orphaned components: `learn-domain-grid.tsx`, `learn-panel.tsx`, `learn-reader.tsx`, `cases-browser.tsx`, `use-mobile.jsx`, `use-toast.js`
- `react-hook-form` + `@hookform/resolvers` installed but unused
- Career ladder thresholds duplicated across `career-ladder.tsx` AND `dashboard-client.tsx`
- Razorpay amounts hardcoded as paise instead of referencing `TIER_PRICES`
- `scratch/extract_cases.ts` + `scratch_matches.json` one-off helpers committed
- Streak columns (`users.streak_count/streak_last_date`) exist but never written anywhere
- Practice `?focus=` param parsed but ignored with console.warn
- Practice "Randomize" button only calls `alert()` (placeholder)
- Daily guesstimate rotation always NULL (scheduler hardcodes it)
- `gd-briefs/[id]/page.tsx` separate detail page route
- `app/(app)/cases/page.tsx` redirects to `/practice?tab=cases`
- `@types/react ^19.2.14` with React 18 runtime — version mismatch
- `DimensionRadar` is custom SVG hexagonal (no Recharts dependency)
- `ProgressChart` uses Tremor AreaChart (not Recharts directly)
- GPT-4o-mini used for headline classification (separate from GPT-4o for scoring/briefs)
- `httpx` for outbound news API calls
- Nexo Co as inspiration for `stat-tile.tsx`
- Career ladder taglines verbatim (Day 0 Dreamer, Casebook Collector, etc.)
- Off-token color violations documented with exact file:line references
- `border-l-4` violation on `profile/page.tsx`
- No skip-to-content link, no focus-visible custom styling
- `Suspense` boundary on auth pages, `isReady` gate on reset-password
- Score ring CSS with conic-gradient
- Triage bars CSS defined but unused (legacy)
- `.gitignore` excludes `tests/` directory (blocks committing tests later)
- Vercel region pin missing (bom1 Mumbai, 200ms+ latency)
- Google OAuth in "Testing" mode needing verification
- Privacy/Terms pages needed for Razorpay public launch
- `daily_schedule.brief_headline_id` always NULL
- Auth callback `?error=auth_callback` param not surfaced on login page

### What Antigravity found that Claude missed:
- `badge_awarder.py` file CONTENTS (183 lines): 13 badge checks, idempotent ON CONFLICT DO NOTHING, awards bonus points — fully documented
- `gd_briefs` extended schema: `headline_id`, `gd_type`, `likely_questions`, `opening_lines`, `counter_arguments`, `closing_lines` + legacy column mapping — confirmed from full 336-line `routes/news.py` read
- `MakersSection` component built during conversation: 3 team members with LinkedIn, McKinsey/BCG aesthetic
- Full `routes/cron.py` code (233 lines) with exact endpoint behavior
- Full `routes/daily.py` code (246 lines) with leaderboard join logic
- Brief generator system prompt quality standards (SMART ANGLES must be NON-OBVIOUS, DATA POINTS must be REAL and CITED, etc.)
- News headline pipeline: `has_brief` computed field, star demotion after 24h, idempotent URL dedup
- `#0A66C2` LinkedIn brand blue used in MakersSection hover states
- Testimonials deliberately separated from Makers section (design decision)
- `news_headlines.fetched_at` column for old-star cleanup
- `gd_worthiness_score` 0-10 range from classifier

### Reconciliation status:
- **gd_briefs schema**: RECONCILED — merged Claude's legacy view with Antigravity's full schema from news.py
- **MakersSection**: ADDED to Claude's component inventory and feature list
- **All other findings**: Cross-validated and consistent between both extractions

---

## 20. RECENT CHANGELOG (May 2026 Updates)

### 20.1 Global Branding & UI Polish
- **Logo Integration**: Replaced raw text headers with professional SVG MECE logos (Abstract Nodes, Neon Pyramid, Origami Crane, etc.) across the AppNav, HomeContent, and DashboardClient.
- **Global Footer**: Implemented a comprehensive Footer.tsx across the app providing aesthetic consistency, quick links, and a unified branding strip at the bottom of every page.
- **Mobile Responsiveness**: Fixed horizontal scrolling overflow bugs on mobile devices.
- **Bottom Navigation Bar**: Adjusted padding and transparency rules so the bottom nav remains visible on white backgrounds, without layout shifting when scrolling.

### 20.2 D4 Profitability Curriculum Overhaul
- **Static Route Override**: Created pp/(app)/learn/profitability/page.tsx to seamlessly override the dynamic [slug] route for D4, allowing for a fully bespoke layout.
- **Custom Interactive SVGs (profitability-visuals.tsx)**: Built 8 large-scale analytical diagrams from scratch:
  - 4-Tier Master Profit Tree (with click-to-scroll interaction)
  - Customer Journey Funnel (with India-specific distortions)
  - 2x2 SKU Revenue/Margin Matrix
  - 8-node Value Chain Cost Map (with India Alerts)
  - PESTEL India Hexagon
  - Trade Margin Waterfall (MRP to NRR)
  - PPI Speedometer Gauge
  - Capital Allocation Matrix
- **MBB-Grade Content**: Rendered the Surya Biscuits case comparison, India-native distortions (kirana margin stack, GST cascade, UPI impulse-kill), and 3 interactive curveball questions directly into the module architecture.
- **Design System Compliance**: Aligned all custom semantic colors (teal for revenue, coral for cost) perfectly with the existing Tailwind variables and "Medusa" aesthetics.


### 20.3 Market Entry Curriculum Module
- **Custom Route**: Created `app/(app)/learn/market-entry/page.tsx` overriding the dynamic route.
- **Massive Premium SVGs**: Replaced HTML-based implementation with `components/MarketEntryFramework.jsx` using a full-bleed 1200x700 viewBox, custom typography (`text-h1` at 32px), drop shadows (`feDropShadow`), and structured Canva-level design (Risk Trees, 4 Pillars layout).

### 20.4 GD Briefs UI Density
- **Layout Overhaul**: Updated `app/(app)/gd-briefs/page.tsx` to hold exactly 10 news items to look denser (1 star headline stretching wider, followed by a tight 3x3 grid below).

---

## 13. [UPDATE] SYSTEM OVERHAUL: DYNAMIC AI, AUTOMATION & ADMIN (May 2026)

This section documents the massive architectural changes applied during the May 2026 overhaul.

### 13.1 Generative AI & Dynamic Content (content_generator.py)
- **What Changed:** Replaced static case pulling with dynamic generation using gpt-4o.
- **Logic:** Runs daily at 00:01 AM IST. Queries the cases table for recent titles to prevent repetition. Generates one highly challenging Case and one Guesstimate (returning JSON) based on strict parameters (India relevance, specific sectors).
- **Database:** Inserts directly into cases and the newly created guesstimates table.

### 13.2 Automated News Fetcher Loop & Classifier
- **Fetcher Loop:** Modified 
ews_fetcher.py to pull 50 articles initially (focusing exclusively on LiveMint, TOI, HT, The Hindu). If the AI classifier returns fewer than 10 highly-scored articles, the script automatically loops and paginates for 20 more until the quota is met.
- **100-Point Classifier:** Overhauled headline_classifier.py to use a strict 0-100 rubric. Evaluates based on India relevance, Management, Jobs, Macro, Micro, and Geopolitics. Instantly fails clickbait/sports/bollywood. Enforces a hard minimum score of 75/100.
- **Deduplication:** Uses source URL set to prevent duplicate inserts across API pages.

### 13.3 Role-Based Access Control (RBAC) & Admin Dashboard
- **Schema Update:** Added is_admin BOOLEAN DEFAULT false to the users table.
- **Frontend Route:** Created pp/(app)/admin/page.tsx protected by a server-side layout check against is_admin.
- **Secure Server Actions:** Implemented Next.js Server Actions to securely proxy manual trigger requests to the FastAPI /cron endpoints, utilizing CRON_SECRET stored in the frontend .env.local so it is never exposed to the client.

### 13.4 GitHub Actions Cron Scheduling
- Replaced third-party pingers with native .github/workflows.
- daily-cases.yml: Runs at 00:01 AM IST (31 18 * * *) targeting /cron/schedule-daily.
- daily-news.yml: Runs at 06:00 AM IST (30 0 * * *) targeting /cron/fetch-news.

---

## 9. CASEBOOK ARCHITECTURE (PHASE 1 ADDITIONS)

### 9.1 Routing & Layout Restructuring
- To support an independent, visually distinct casebook experience under the `/learn/casebook` base route, the legacy `/learn` domain viewer was isolated into a Next.js route group: `app/(app)/learn/(standard)`. This prevents the casebook from inheriting the legacy `LearnSidebar`.
- Casebook routes are handled by a statically generated catch-all: `app/(app)/learn/casebook/[[...slug]]/page.tsx`.
- The empty root slug (`[]`) redirects visually or renders the getting-started landing page and is explicitly included in `generateStaticParams`.
- Breadcrumbs render cleanly, stripping internal organizational prefixes (`^[A-Z] · `) from node titles.

### 9.2 Content Model & Schema
- The content model uses typed "blocks" (defined in `lib/casebook/types.ts`). Every page is an ordered array of typed Blocks.
- A `BlockRenderer` maps each `Block.type` to a styled component (e.g., `callout`, `frameworkList`, `dialogText`, `keyTakeaways`), providing a uniform, designed look across all content and allowing content to be authored as structured JSON data.

### 9.3 The Locked Index & Navigation
- The entire curriculum is encoded in `lib/casebook/tree.ts` (`CASEBOOK_TREE`), generating 87 distinct slugs.
- A persistent, collapsible navigation tree sits on the left (or acts as a mobile Sheet drawer). It includes a search box.
- The M&A bucket slug convention was unified globally to `ma-pe-dd`.

### 9.4 Independent Brand Positioning
- The UI refers to this asset exclusively as **"The MECE Casebook"**.
- All attribution to external source casebooks (e.g., IIM-A, B, C) has been strictly removed to position the content as MECE's original, proprietary curriculum.


### 9.5 Layout Fine-Tuning, Gaps & Scroll-Spy Fixes (Corrective Pass)
- **Leftmost Margin set to 0px**: The outer layout container was changed to full screen width (`w-full`), making the left navigation column sit flush against the leftmost boundary of the viewport.
- **Spacings & Column Gaps**: Gaps on `xl` viewports were adjusted precisely to fit a structured layout:
  - Left gap (between left nav and middle column): Set to exactly `96px` (1.2x original 80px) using `xl:pl-8` and `xl:ml-16`.
  - Right gap (between middle section and right rail): Set to exactly `120px` (1.2x original 100px) using `xl:pr-8` and `xl:mr-[88px]`.
- **Rightmost Edge Margin**: Doubled the rightmost edge spacing to exactly `32px` by adding `xl:pr-8` on the outer grid container, causing the middle main column to absorb the reduction and shrink accordingly.
- **Middle Section Expansion**: The reading pane `<article>` was set to `xl:max-w-none w-full` to allow it to dynamically stretch and fill 100% of the remaining screen width inside the middle grid column.
- **Scroll-Spy & Anchor Navigation Fixes**:
  - Implemented `slugify` logic in `BlockRenderer` to generate stable CSS-safe HTML IDs on all rendered `<h2>`/`<h3>` headings.
  - Linked the `OnThisPage` TOC component to the new `slugify` logic for matching href targets.
  - Configured `IntersectionObserver` with `root: null` (viewport) and a top-offset `rootMargin` of `"-80px 0px -70% 0px"` to activate TOC links precisely.
  - Added `scroll-behavior: smooth` directly to the `html` element inside the base layer of `app/globals.css` and added `scroll-mt-[80px]` offsets on heading elements.
  - Added `id` and `scroll-mt-[80px]` directly on the `<section>` elements in `CaseSectionBlock` to align case sections correctly on click-to-jump events.
  - Added the `text-justify` utility class to `ProseBlock` paragraphs to justify the reading content.

### 9.6 Design Contract Lock & Typography Revisions
- **Prose Revert**: Removed the `text-justify` utility class from `ProseBlock` paragraphs to restore readable, left-aligned, ragged-right reading text.
- **Heading Contrast**: Fixed dark-mode heading contrast to ensure all H1-H3 headers render at full-strength `text-foreground` without opacity muting.
- **New Hook Block**: Expanded the Block union schema with a `hook` block type. Renders a magazine-style "standfirst" lead paragraph (`text-xl`) at the absolute top of the page with no borders or backgrounds.
- **Keyword Emphasis**: Implemented an `emphasize` substring property on headings and hook blocks to dynamically wrap a designated phrase in the primary accent color (`text-primary`).
- **Hoisting Logic Update**: Refactored `casebook-reader.tsx` block processing order so the `hook` block automatically hoists to index 0, immediately followed by the hoisted `Key Takeaways` hero block.
- **Permanent Design Contract**: Authored and locked a comprehensive, permanent design contract at `docs/CASEBOOK_DESIGN_CONTRACT.md` detailing grid configurations, typography scales, semantic tokens, and UI component constraints (no left-accent borders) for all future page builds.

### 9.7 Logo Redesign & Dynamic Adaptability Pass
- **New Logo Design**: Integrated the new vector MECE logo provided in `logo.svg` directly into the centralized React component `logo.tsx`.
- **Microsoft PUA Font Mapping**: Translated the proprietary Microsoft Office PUA symbol character codes from the PowerPoint SVG export (e.g. `\uf04d` for `M`, `\uf065` for `e`, etc.) into standard web-safe text characters (`M`, `E`, `C`, `E` and "Method for Evaluating Corporate Excellence") in the code.
- **Dynamic Background Adaptability**: 
  - On light backgrounds (`variant="dark"`), it displays the original dark navy colors (`#081B3B` / `#091E39` / `#071A3A`) and cardinal red (`#CA121E`).
  - On dark/navy backgrounds (`variant="light"`), it swaps the navy colors to pure white (`#FFFFFF`) while keeping the red branding.
- **True Transparency Masking**: Designed an SVG `<mask>` that subtracts the diagonal cut paths from the base triangles, making the cuts truly transparent so the page background naturally shows through.
- **Proportional Scaling**: Set the default SVG height class to `h-[64.8px]` (exactly 1.35x of the previous standard `h-12`) to increase the logo size uniformly across all sections of the site.


### 9.8 Casebook Restructuring: Getting Started Section Update
- **Goal**: Clean up, rename, and add new pages to the "Getting Started" section of the MECE Casebook to align with updated curriculum mapping.
- **Tree Navigation Restructuring**: Modified the `children` array under the "A · Getting Started" node in [tree.ts](file:///c:/Users/satya/Videos/company/consilio/lib/casebook/tree.ts). 
  - Added new pages: "Navigating tricky & blended cases" (`getting-started/navigating-blended-cases`), "Communication under pressure" (`getting-started/communication-under-pressure`), and "Your diagnostic & a 14-day plan" (`getting-started/diagnostic-and-plan`).
  - Removed "Common mistakes (dos & don'ts)" (`getting-started/common-mistakes`).
  - Renamed "Math & communication under pressure" to "Math under pressure" (`getting-started/math-under-pressure`).
- **Content Page Creation**: Copied and registered the six new pages byte-for-byte in the [concepts](file:///c:/Users/satya/Videos/company/consilio/lib/casebook/content/concepts/) directory:
  - `what-it-tests.ts`, `six-case-types.ts`, `navigating-blended-cases.ts`, `math-under-pressure.ts`, `communication-under-pressure.ts`, and `diagnostic-and-plan.ts`.
- **Registration**: Imported and added all 6 pages into `SEED_PAGES` inside [index.ts](file:///c:/Users/satya/Videos/company/consilio/lib/casebook/content/index.ts).
- **TypeScript Interface Hotfix**: Updated the `Page` interface in [types.ts](file:///c:/Users/satya/Videos/company/consilio/lib/casebook/types.ts) to define `titleEmphasize?: string;` as an optional property, ensuring full compatibility with the new page files.
- **Verification**: Verified that the compiler (`npx tsc --noEmit`) passes with zero errors, and the production build completes successfully, increasing the total static casebook routes from 88 to 90.

### 9.9 Casebook Inline SVG Rendering Block
- **Goal**: Implement a generic `svg` block type rendering raw SVG markup directly from the content files into a standard, responsive, dark-mode-aware visual frame.
- **TypeScript Type System Extension**: Added `svg` variant to `Block` union in [types.ts](file:///c:/Users/satya/Videos/company/consilio/lib/casebook/types.ts):
  `{ type: 'svg'; svg: string; caption?: string; maxWidth?: number; ariaLabel?: string }`
- **CasebookSvg Component Creation**: Created [casebook-svg.tsx](file:///c:/Users/satya/Videos/company/consilio/components/casebook/blocks/casebook-svg.tsx) inside the casebook blocks folder:
  - Renders raw SVG content using `dangerouslySetInnerHTML`.
  - Centers content using standard layout rules and sets dynamic width and maximum width parameters (defaulting to `720px`).
  - Implements the exact caption styling of existing diagrams.
  - Registers the standard `diagramEnter` keyframe and `.animate-diagram` class to match the visual language of the existing diagrams.
  - Supports accessibility (ARIA labels) and respects the `prefers-reduced-motion: reduce` query.
- **Color Convention (HSL Wrapping)**: Wrapped all Tailwind/CSS color custom properties in `hsl()` wrappers inside SVG markup strings to properly render the HSL channel variables. Bare variables are documented to render as invalid black values.
- **Block Integration**: Registered the `svg` case inside the `BlockRenderer` switch in [block-renderer.tsx](file:///c:/Users/satya/Videos/company/consilio/components/casebook/block-renderer.tsx).
- **Test Route Path Support**: Modified `generateStaticParams` and `dynamicParams` in [page.tsx](file:///c:/Users/satya/Videos/company/consilio/app/(app)/learn/casebook/[[...slug]]/page.tsx) to dynamically resolve the `_test/new-blocks` page in development environments while keeping the production build static route count at exactly 90.

### 9.10 Core Frameworks Implementation (Profitability, Market Entry, Growth)
- **Goal**: Integrate the first set of comprehensive core framework pages into the Casebook.
- **Pages Added**: 
  - profitability.ts (Profitability)
  - market-entry.ts (Market Entry)
  - growth.ts (Growth)
- **Content Details**: Each page was authored strictly to the Page and Block schema with extensive typography (em-dashes, correct unicode characters) and includes multiple inline svg block diagrams.
- **Integration**: Placed files under lib/casebook/content/frameworks/, wired into lib/casebook/content/index.ts with SEED_PAGES registrations.

### 9.11 M&A and Private Equity Cluster Implementation
- **Goal**: Create a nested structural cluster for M&A and Private Equity frameworks in the Casebook.
- **Pages Added**:
  - m-and-a.ts (M&A Overview Page)
  - alue-and-synergies.ts (Value & Synergies)
  - due-diligence.ts (Due Diligence)
  - private-equity.ts (Private Equity)
- **Tree Hierarchy**: Modified lib/casebook/tree.ts to implement a parent page node with a children array for M&A. The three sub-pages were nested perfectly as children beneath the overview page.
- **Integration**: Placed files under lib/casebook/content/frameworks/m-and-a/ (except the parent page which sits in rameworks/), imported and registered all slugs in index.ts.
- **Verification**: The static generation route count successfully incremented from 90 to 94 exact routes for the Casebook.

### 9.12 Dark Mode SVG Color Variable Hotfix
- **Goal**: Ensure inline SVG boxes correctly recolor themselves when the application is switched to Dark Mode.
- **Fix Applied**: Identified that the project's CSS color tokens are defined as HSL channel values (e.g. --primary: 356 84% 43%), which SVG ill and stroke properties cannot interpret directly via ar(--primary). Enforced the convention that hsl(var(--token)) must be used for all SVG token consumption to prevent black/silver boxes.

### 9.13 Casebook Sidebar Nav & Hybrid Node Fix
- **Goal**: Allow kind: 'page' nodes in the Casebook tree to act as both a clickable leaf and an expandable parent if they have a children array (e.g., for M&A).
- **Fix Applied**: Updated components/casebook/nav-tree-item.tsx to detect hasChildren. If true, the node renders its title as a <Link> while simultaneously rendering a <ChevronRight> caret (managed by local isOpen state) to toggle visibility of its indented children. Preserved existing scroll-spy and active highlighting logic.
- **Tree Cleanup**: Deleted the stale M&A / PE / Due Diligence placeholder from lib/casebook/tree.ts Core Frameworks section, successfully dropping the ghost static route count from 94 to 93.

### 9.14 Casebook SVG Visual-Grammar System ("v2 refined-minimal") & Self-Render QA Pipeline
- **Goal**: Establish a single, locked visual language for all hand-authored Casebook diagrams so every framework page looks like one consulting-deck-precise product, and a repeatable way to QA each diagram in light + dark before it ships.
- **Visual grammar (LOCKED for all new diagrams)**:
  - **Root / most-important node**: navy vertical gradient (`ng`: `hsl(214 64% 19%)` → `hsl(214 74% 11%)`) + heavy drop-shadow (`rs`). White title text (`#ffffff`), muted blue subtitle (`#b9c4d6`).
  - **Structural nodes**: white-card fill with subtle top-sheen gradient (`cg`) + light shadow (`cs`), 1px `--border-strong` stroke.
  - **Detail / list rows**: red dot (`--primary`) + bold `--foreground` label + muted `--muted-foreground` sub-line.
  - **Section labels inside panels**: red, tracked-uppercase, `letter-spacing 0.06–0.08em`.
  - **Connectors**: **curved bezier paths** (NOT hard elbows) for every new diagram. Straight lines reserved only for hairline dividers inside cards. Flow diagrams use an arrowhead marker (`ar`).
  - **Decision / gate nodes**: red-outlined box (`stroke="hsl(var(--primary))"`).
  - **"How to use this" navigation panel**: every framework diagram carries a red-bordered panel at the bottom — the differentiator the source casebooks lack — teaching *how to apply/navigate*, not just naming the parts. Closes with an italic muted "watch-out" footnote.
- **Color convention (critical, ties to §9.12)**: all SVG fills/strokes that consume design tokens use `hsl(var(--token))` because the tokens are HSL **channel** values; bare `var(--token)` renders black. White-on-red text stays literal `#ffffff`. Some diagram fills (e.g., value-ladder steps, elasticity curve) deliberately use fixed HSL literals rather than tokens so they hold their intended hue identically in light and dark.
- **Typography in SVGs**: real UTF-8 characters only — `₹`, `—` (em-dash), `–` (en-dash), `→` (arrow), `×`, `−` (minus). **Never `\uXXXX` escapes in authored TS** (a prior shipped bug rendered `\u2014` literally; Profitability needed a post-ship decode patch). Every authored content file is grepped for literal `\u2014` before handoff; the count must be ZERO.
- **Self-render QA pipeline (Claude-side, pre-handoff)**:
  - Each diagram authored first as a standalone preview HTML with real light/dark token blocks (`_shared_head.txt`) and shared SVG defs (`_defs.txt`: filters `cs`/`rs`, gradients `ng`/`cg`, arrow marker `ar`), plus a "toggle dark" button.
  - Rendered via **Playwright (chromium)** screenshotting the `.frame` element in both light and dark (cairosvg fails on `hsl(var())`), then visually inspected for clipping/collision/overflow.
  - **Standing width-validation check**: root-node titles and full-width nav-band text must be validated against their box width. Recurring clip/overflow bugs were caught and fixed on Market Entry, Growth (g1/g2 root boxes), M&A (m1 root box, m3 nav-band line overflow), PE (pe2 chevron clip + exit-options text collision), and Pricing (pr5 axis-label collision, pr6 nav-band overflow). Fix patterns: widen box / shrink font / wrap to two lines / grow band height + viewBox.
  - Once locked, SVGs are extracted from the preview HTML via regex (`<svg.*?</svg>`), verified to contain no backtick or `${` (template-literal-safe), stashed to JSON, then injected programmatically into the typed `.ts` content file's `svg` block template literals (caption/ariaLabel via `json.dumps(..., ensure_ascii=False)` to preserve real UTF-8).
  - Every content file is compiled against a local TypeScript schema stub (`/tmp/tscheck`, real `typescript@5`, `tsc --noEmit`) that mirrors `lib/casebook/types.ts` (including the `svg` block variant) before handoff. Post-author integrity checks assert: expected svg-block count, exactly one `hook`, exactly one `keyTakeaways`, at least one `dialogue`, balanced backticks, zero `\u` escapes, real `₹`/`—`/`×` present, and byte-identical embedded-vs-source SVGs.
- **Why this matters for future sessions**: only the final `.ts` content file is handed to Antigravity for the repo — never the preview HTMLs. New framework pages must follow this exact grammar + pipeline so they match the shipped set.

### 9.15 Casebook Authoring Conventions & Page-Schema Contract (as used for all framework pages)
- **House page shape** (every framework page): opens with a `hook` block (magazine standfirst — name the pain → reframe + cheat-code insight → proof via specificity; register is confident, plain-spoken, results-obsessed, no "unlock/empower/transform"); diagrams interleaved at the teaching moment (prose introduces → diagram → prose reads it), never two diagrams back-to-back; every framework page includes a "how to apply" diagnostic-flow diagram; ends with one outcome-framed `keyTakeaways` block ("You will be able to…").
- **Hoisting rule (ties to §9.6)**: the renderer hoists the LAST `keyTakeaways` to the top as a TL;DR and hoists the `hook` above it. Therefore **exactly one `hook` and one `keyTakeaways` per page** (a second of either triggers a double-hoist bug).
- **`Page` interface fields in use**: `slug`, `title`, `titleEmphasize?` (renders a substring of the title in `--primary`), `subtitle`, `subtitleEmphasize?`, `kind` (`'framework'` for these pages), `meta?` (`readingTimeMin`, `tags[]`, `caseType`), `blocks[]`.
- **Block types exercised by the framework pages**: `hook`, `prose`, `heading` (level 2|3, optional `emphasize` substring → red), `callout` (variants `tip`/`insight`/`warning`/`pitfall`/`note`), `keyTakeaways`, `svg` (raw SVG string + `caption` + `maxWidth` + `ariaLabel`), and `dialogue` (turns with `speaker: interviewer|candidate|narrator`, `md`, optional `note`). The worked mini-case on each page is a `dialogue` block ending in a `narrator` turn that names the move that scored.
- **Content originality / copyright rule (unchanged, restated for the new pages)**: source casebook screenshots (IIM-A/B/C, Bain, etc.) are used only to set the depth bar; all companies, numbers, and worked cases are invented fresh. Generic framework names are fine. Worked mini-cases are India-flavoured (₹ figures, Indian sectors/companies) and braid explicitly into sibling frameworks (e.g., Market Entry → Profitability; Pricing → Profitability + Growth).
- **New diagram shapes introduced for variety across the set**: Ansoff 2×2 matrix (Growth), value-bridge waterfall (M&A Value & Synergies, and again as the Pricing value ladder), horizontal chevron lifecycle (PE deal lifecycle; Pricing nature-of-product), vertical price band (Pricing), and an inverted-U profit/elasticity curve (Pricing) — alongside the standard top-down decision trees and vertical diagnostic flows.

### 9.16 Casebook Core Frameworks: Pricing
- **Goal**: Add the Pricing framework page to Core Frameworks, matching/exceeding the source casebooks' depth and adding the navigation layer they lack.
- **Page Added**: `pricing.ts` → export `pricing`, slug `core-frameworks/pricing`, kind `framework`, ~17 min read. Placed under `lib/casebook/content/frameworks/`, imported and registered in `index.ts` `SEED_PAGES`. The pre-existing "Pricing" tree entry at `core-frameworks/pricing` was left unchanged (placeholder replaced in place).
- **Six inline `svg` diagrams** (curved connectors, light+dark verified, all bugs fixed):
  1. **Methods master** — the three pricing methods framed internal-looking (cost-based, the floor) vs external-looking (competitor benchmark + value-based, the ceiling).
  2. **Price band** — vertical floor/ceiling/anchor visual: unit-cost floor, willingness-to-pay ceiling, competitor reference price anchoring the middle, with skim/match/penetrate objective markers.
  3. **Value ladder** — the cost→marked-price gap as ascending steps (new utility → innovation → quality → brand); the value-bridge shape applied to pricing.
  4. **Nature of product** — chevron spectrum (new invention → modification → similar → vs-rival) mapped to method, plus the skimming-vs-penetration launch split.
  5. **Elasticity curve** — inverted-U profit curve marking the profit-max price below WTP, with an elasticity side-panel (elastic vs inelastic).
  6. **Diagnostic flow** — clarify objective → understand product/customer → bound the band → triangulate the three methods → elasticity/objective gate → recommend a price (or range).
- **Worked mini-case**: pricing a new long-life-filter water purifier — candidate refuses to start from cost, pins the objective, uses a filter-savings **value proxy** to estimate the WTP ceiling, bounds the band, then places the price below the ceiling for elasticity + the profit objective, and proposes a price test.
- **Cross-references**: a `note` callout frames pricing as a lever inside Profitability (revenue branch) and Growth (revenue-per-user), not a standalone island.
- **Verification**: `npx tsc --noEmit` clean (exit 0); all six SVGs embedded byte-identical to approved sources; one `hook`, one `keyTakeaways`, one `dialogue`; zero `\u2014` escapes; real `₹`. Handed off as a placeholder-replace (route count expected to hold or +1 depending on whether the prior tree entry generated a route — confirm at build).

### 9.17 Casebook Core Frameworks — Consolidated Current State (authoritative inventory)
This supersedes the partial "frameworks built" list in §9.10. As of 2026-06-01 the Core Frameworks section of The MECE Casebook contains **six framework topics across nine pages**, all authored to the §9.14–§9.15 grammar/contract and self-rendered in light + dark. **As of §9.18 every topic is built — the section is complete:**

| # | Framework topic | Page file(s) | Slug(s) | Inline SVG diagrams | Status |
|---|---|---|---|---|---|
| 1 | Structuring fundamentals | `frameworks/structuring-fundamentals.ts` | `core-frameworks/structuring-fundamentals` | 6 (anatomy of a structure, the MECE test, 5-lens breakdown toolkit, one-problem-three-structures, build-it-live 6-move diagnostic, worked Anandam Dairy issue tree) | SHIPPED (§9.18) |
| 2 | Profitability | `frameworks/profitability.ts` | `core-frameworks/profitability` | 6 (master tree, revenue 5-level deep-dive, customer-journey funnel, cost value-chain flow, fixed/variable + dilution trap, diagnostic) | SHIPPED |
| 3 | Market Entry | `frameworks/market-entry.ts` | `core-frameworks/market-entry` | 7 (decision spine, attractiveness, right-to-win, risk-lens alternative, feasibility gate w/ profitability braid, modes of entry + which-mode-when, diagnostic) | SHIPPED |
| 4 | Growth | `frameworks/growth.ts` | `core-frameworks/growth` | 6 (master tree organic/inorganic/non-core, organic two-engines, **Ansoff 2×2**, growth-gap method, inorganic+non-core, diagnostic) | SHIPPED |
| 5 | M&A and Private Equity (parent + 3 nested children) | `frameworks/m-and-a.ts` (parent) + `frameworks/m-and-a/value-and-synergies.ts`, `due-diligence.ts`, `private-equity.ts` | `core-frameworks/m-and-a` (+ `/value-and-synergies`, `/due-diligence`, `/private-equity`) | 12 total (parent: net-benefit tree, strategic-vs-financial buyer, diagnostic · Value&Synergies: synergy taxonomy, **value-bridge waterfall**, valuation toolkit · Due Diligence: 3-phase process, four commercial lenses, diagnostic · PE: value-creation levers, **chevron lifecycle** + exit options, diagnostic) | SHIPPED |
| 6 | Pricing | `frameworks/pricing.ts` | `core-frameworks/pricing` | 6 (see §9.16) | SHIPPED |

- **Nav hierarchy note**: M&A is the first and only **hybrid node** in `CASEBOOK_TREE` — `kind:'page'` with a non-empty `children` array — rendered by the §9.13 fix (clickable parent title + expand caret + three indented children: Value & Synergies, Due Diligence, Private Equity). The slug pattern for nested pages is path-style (`core-frameworks/m-and-a/<child>`), resolved by the existing `[[...slug]]` catch-all route with no routing changes needed.
- **Route-count timeline (authoritative)**: Getting Started restructure 88 → 90 (§9.8); Profitability/Market Entry/Growth replaced placeholders, staying at 90 (§9.10); M&A parent net-new 90 → 91, then Value & Synergies 91 → 92, then Due Diligence + Private Equity 92 → 94 (§9.11); stale `ma-pe-dd` placeholder deleted 94 → 93 (§9.13); **Pricing (§9.16) is a placeholder-replace expected to hold at 93 or go to 94 — confirm at next build.** **Structuring fundamentals (§9.18) is likewise a placeholder-replace of an existing tree entry, expected to hold the count (93/94) — confirm at the next build.** Whatever the build reports next is the new authoritative figure.
- **Section B nav order** (`B · Core Frameworks`, top-level, all flush-left siblings except M&A's nested children): Structuring fundamentals · Profitability · Market Entry · Growth · M&A and Private Equity (→ expandable) · Pricing.
- **Remaining Core-Frameworks work**: NONE — as of §9.18 (2026-06-01) **Structuring fundamentals** is built and the Core-Frameworks section is complete. It was deliberately authored last because it is the meta-framework ("how to build a custom structure for any case"); it uses a different diagram approach (teaching the *act* of structuring — anatomy, the MECE test, the 5-lens toolkit, one-problem-three-structures, a 6-move build-it-live diagnostic, and a worked custom issue tree) while following the same §9.14 grammar and §9.15 contract, and it braids in every sibling framework as a worked example of one breakdown lens.
- **Output/working artifacts (Claude-side, not in repo)**: per-framework preview HTML batches live under the build session's `batch-2.x-*` directories (e.g. `batch-2.3-market-entry`, `batch-2.4-growth`, `batch-2.5-manda`, `batch-2.6-pricing`); only the final `.ts` files are committed to the repo.

### 9.18 Casebook Core Frameworks: Structuring Fundamentals (final framework — section complete)
- **Goal**: Build the last Core Framework — the meta-framework that teaches how to *build* a custom structure for any case rather than recall a fixed one. Authored last by design (per §9.17) so it can cite every sibling framework as a worked example of one breakdown lens.
- **Page added**: `structuring-fundamentals.ts` → exports `structuringFundamentals` (named) **and** default, slug `core-frameworks/structuring-fundamentals`, kind `framework`, ~16 min read. Placed under `lib/casebook/content/frameworks/`; the pre-existing "Structuring fundamentals" tree entry (first node in Section B) is a placeholder-replace and was left in place in `tree.ts`.
- **Diagram approach (deliberately different — teaches the *act* of structuring, not one fixed tree)**: six inline SVGs to the §9.14 grammar — (1) **anatomy of a structure** (question → MECE buckets → drivers → so-what, with a left rail naming the four layers); (2) **the MECE test** (one clean split vs the overlap and gap failure modes); (3) **the 5-lens breakdown toolkit** (equation / process / segmentation / conceptual / stakeholder), each row mapped to the sibling framework it becomes — the explicit braid; (4) **one problem, three structures** (a ₹900 cr bus operator split by equation / segment / journey, teaching that structure is a choice); (5) **build-it-live 6-move diagnostic** (clarify → pick lens → draw L1 MECE → pressure-test → drill → hypothesis, with a "say it out loud" script column — this is the §9.15-required how-to-apply diagram); (6) **worked custom issue tree** (Anandam Dairy farmer retention, built from the farmer's decision with a drilled branch + hypothesis strip + so-what gate).
- **Worked mini-case** (`dialogue`): **Anandam Dairy**, a ₹1,200 cr Gujarat dairy cooperative losing ~12% of 80,000 farmer-suppliers to private buyers. The candidate refuses the profitability tree, structures from the farmer's decision (our offer / rivals' offer / switching friction), drills the rivals branch, and leads with a hypothesis (rivals win on *visible* same-day cash ~8% higher; our feed/vet/insurance is worth more but invisible). Narrator names the scoring move: choosing the lens, not the arithmetic.
- **Cross-references**: an `insight` callout maps each shipped framework to its lens (Profitability = equation, Market entry = conceptual buckets, Growth = segmentation, Due diligence = process); a closing `note` callout frames Profitability / Market Entry / Growth / Pricing / M&A as worked structures the reader can now take apart and rebuild.
- **Self-render QA**: all six SVGs authored in the §9.14 preview harness (`_shared_head` light/dark tokens + `_defs` `ng`/`cg`/`cs`/`rs`/`ar`), Playwright-screenshotted in light **and** dark, inspected, and fixed. Bugs caught/fixed this pass: the red "how to use this" panel/strip body lines over-ran the box on all six (trimmed to width); d3 stakeholder caption collided with its sibling pill (moved below the dots); d4 root subtitle clipped (root widened to w=280); d6 "DRILL HERE" tag collided with bucket C (replaced by a centered "↓ we drill this branch" cue above the drilled bucket) plus root-subtitle and hypothesis-strip overflow (shortened). No dark-only contrast issues found.
- **Verification (Claude-side, pre-handoff)**: compiled against the `/tmp/tscheck` schema stub mirroring `lib/casebook/types.ts` — `tsc --noEmit` exit 0. Integrity suite all-pass: exactly 6 `svg` blocks, 1 `hook`, 1 `keyTakeaways`, 1 `dialogue`; backticks balanced (12); zero `\u` escapes; real `₹`/`—`/`−`/`×`/`→` present; all six embedded SVGs byte-identical to their approved render sources and each self-contained with its own `<defs>`.
- **Handoff**: delivered to Antigravity as a placeholder-replace — place file under `lib/casebook/content/frameworks/`, import + register `structuringFundamentals` in `lib/casebook/content/index.ts` `SEED_PAGES`, confirm the `core-frameworks/structuring-fundamentals` entry already exists in `tree.ts` (no tree change). A Phase-1 schema-reconciliation step instructs Antigravity to confirm block field names against the real `types.ts` (the Claude-side stub inferred `hook.md`, `heading.text`, `callout.md`, `keyTakeaways.items`, `dialogue.turns[].md`) and adjust the literal **only if** the real types differ — never edit `types.ts`. Phase-3 verify `tsc --noEmit` + `npm run build`; **route count expected to HOLD at 93/94** (placeholder-replace).
- **Status**: **SHIPPED (pending Antigravity build confirmation). Core-Frameworks section now COMPLETE** — six framework topics across nine pages, all built and self-rendered in light + dark.

### 9.19 Casebook Section C · Toolkit — kickoff + the toolkit-card template (Porter's Five Forces first)
- **Goal**: Build out **Section C · Toolkit** — the standard "supporting" reference frameworks aspirants are expected to know by name. Nav order (per the locked §4 index): Porter's Five Forces · SWOT · PESTEL · 4 P's · BCG Growth–Share Matrix · Value Chain · Ansoff Matrix · Customer / Purchase Journey · McKinsey 7S. Section icon: `Wrench`.
- **Toolkit-card template (LOCKED for this section — deliberately lighter than Core Frameworks)**: a *tight reference card*, not a deep page. Same `Page`/`Block` schema, same renderer, same §9.14 visual grammar, but: ~9–11 min read; **two inline SVGs** — (1) a **hero** that lays the framework out in MECE grammar with its drivers and carries the "how to use this" panel, and (2) a **how-to-deploy diagnostic** (vertical move-flow with a "say it out loud" script column). House spine still holds: exactly one `hook`, one `keyTakeaways`, one compact worked `dialogue` mini-case ending on a `narrator` turn, plus a cross-reference `note` callout tying the tool back to the Core Frameworks. All content original (framework names are public method; every explanation, driver list, number, and worked example freshly invented — source-casebook exhibits/wording never reproduced). India-default examples.
- **Card 1 — Porter's Five Forces** (built):
  - **File / export**: `porters-five-forces.ts` → `portersFiveForces` (named + default). Intended dir `lib/casebook/content/toolkit/`. Slug `toolkit/porters-five-forces` (Antigravity to confirm the exact tree slug and match it — see handoff). `kind: "framework"` (renders identically; toolkit may get a dedicated kind later if one exists in `types.ts`). ~9 min.
  - **Teaching angle**: the five forces are not a checklist but **one question** — how much profit can this industry sustain, and which way is it trending. Hero SVG = five force cards (buyer power, supplier power, rivalry [highlighted as the net of the other four], new entrants, substitutes), each with a "stronger when" driver list, all pressing on a single "how profitable can this industry be?" ceiling. Diagnostic SVG = four moves (check it is the right tool → rate each force + direction → find the one/two that bind → turn it into a verdict) with a spoken-script column.
  - **Worked mini-case** (`dialogue`): a PE fund weighing a minority stake in an Indian ten-minute **quick-commerce** grocery player. Candidate uses Five Forces as an *industry* lens, prioritises rivalry + buyer power, notes entrants' threat is now *lower* (dark-store density + capital are real barriers), verdict = structurally unprofitable today but improving with consolidation; the bet is on backing a survivor, not on current economics. Narrator names the scoring move: rate, prioritise, read the trend, convert to a verdict — not reciting five forces.
  - **Cross-references**: a `note` callout ties Five Forces to the attractiveness arm of **Market Entry** and the shrinking-pool *why* in **Profitability**, and advises pairing it with a firm-level lens (right-to-win / Value Chain).
  - **Self-render QA**: both SVGs rendered in the §9.14 harness in light + dark, inspected, fixed. Bugs this pass: both "how to use this" panel bodies over-ran the box (trimmed); a redundant mid-diagram italic caption on the hero collided with the convergence arrows (removed); p2 step-1 sub-line kissed the card edge (shortened). No dark-only contrast issues.
  - **Verification (Claude-side)**: `tsc --noEmit` exit 0 against the `/tmp/tscheck` stub. Integrity all-pass: exactly 2 `svg`, 1 `hook`, 1 `keyTakeaways`, 1 `dialogue`; backticks balanced (4); zero `\u`; real `—` present; both SVGs byte-identical to approved sources and each self-contained with its own `<defs>`.
  - **Handoff**: Antigravity Phase-1 must pin three first-time-for-this-section conventions before placing the file — the exact **tree slug** (match, don't duplicate), the **content directory** (`content/toolkit/` vs other), and the allowed **`kind`** values — then register in `index.ts` `SEED_PAGES` and (only if no Porter node exists) add the leaf under the Toolkit node. **Route count expected to HOLD** (placeholder-replace) **or +1** if the node is net-new — confirm at build.
- **Status**: Porter's Five Forces SHIPPED (pending Antigravity build confirmation). **Toolkit: 1 of 9 cards built.** Remaining: SWOT, PESTEL, 4 P's, BCG Growth–Share Matrix, Value Chain, Ansoff Matrix, Customer / Purchase Journey, McKinsey 7S.

### 9.20 Casebook Section C · Toolkit — batch of 5 cards (SWOT, PESTEL, 4 P's, 5 C's, Customer Journey)
- **What**: Five reference cards built in one batch to the §9.19 toolkit-card template (tight: two SVGs each = hero + how-to-deploy diagnostic; one hook, one keyTakeaways, one compact worked `dialogue` ending narrator, a cross-ref `note`/`insight` callout; `kind:"framework"`; ~9 min; India-default; all content original — framework names are public method, every driver list / number / worked example freshly invented, no source-casebook wording or exhibits reproduced).
- **The 5 diagnostics share one generated layout**: produced by `gen_diag.py` from a spec (the proven Porter-p2 vertical 4-move flow with a "say it out loud" script column, viewBox 760×470, step 4 = red gate, red "HOW TO USE THIS" footer). The 5 heroes are hand-authored, each a distinct shape:
  - **SWOT** (`swot.ts` → `swot`, slug `toolkit/swot`): hero = 2×2 on the two axes (internal/external × helpful/harmful) with red axis labels; teaching angle = don't stop at four lists, **pair the boxes (TOWS)** into prioritised moves. Worked case: a Karnataka regional-snacks brand going national — candidate refuses the broad FMCG war (weakness×threat) and pairs strength×opportunity into a premium-speciality quick-commerce play, plus an oil-cost hedge. Cross-ref: O/T are PESTEL+industry output; feeds Market Entry / Growth.
  - **PESTEL** (`pestel.ts` → `pestel`, slug `toolkit/pestel`): hero = 2×3 macro grid (P/E/S/T/E/L) with India e.g.s; angle = **filter six to the two-three that bind**, note direction. Worked case: a global fast-fashion brand entering India — two binding forces (political-legal sourcing/FDI; social-economic price-sensitive young market), tech as tailwind; verdict = enter but localise sourcing + value-price. Cross-ref: feeds Market Entry attractiveness and *is* the 5 C's "Context".
  - **4 P's** (`4-ps.ts` → `fourPs`, slug `toolkit/4-ps`): hero = navy root + 4 lever cards + dashed **coherence strip**; angle = the four P's tell **one coherent story to one segment**, start from the segment. Worked case: D2C premium cold-brew launch — set all four P's from a premium positioning; the thing to protect is coherence (premium product sold cheap/everywhere = expensive commodity). Cross-ref: execution layer under Market Entry/Growth; Price P opens the Pricing framework.
  - **5 C's** (`5-cs.ts` → `fiveCs`, slug `toolkit/5-cs` — **likely NEW nav node**): hero = navy root + 5 cards, Context highlighted with "= SWOT + PESTEL"; angle = a **pre-strategy situation scan** read outside-in that surfaces the central tension then hands off. Worked case: metro fitness app eyeing a Tier-2 city — company (premium app-first) vs customer (affordable gym-first) tension → hand to a market-entry/pricing decision (partner-gym hybrid). Cross-ref: Context reuses PESTEL+SWOT; output feeds Entry/Growth/Pricing.
  - **Customer Journey** (`customer-journey.ts` → `customerJourney`, slug `toolkit/customer-journey` — maps to existing "Customer / Purchase Journey" node): hero = 3 phase bands (pre/purchase/post) + 6 stage cards (need→loyalty), "Buy" highlighted as biggest leak, per-stage leak labels; angle = **find the single worst leak**, fix it, re-measure. Worked case: online used-car marketplace burning ad spend — map shows leak is at purchase (financing/inspection), so flip the recommendation away from more top-funnel spend. Cross-ref: same funnel inside Growth (acquire vs retain) and Profitability.
- **Self-render QA**: all 10 SVGs rendered in the §9.14 harness light+dark, inspected, fixed. Recurring bug pre-empted again: every diagnostic body + the PESTEL hero body initially over-ran the "HOW TO USE THIS" panel — shortened in `gen_diag.py` (regenerated) and patched in pestel1, all re-verified to fit. No dark-only contrast issues.
- **Build-script note (for future batches)**: emitter `build_ts2.py` defines each page as a Python list of block dicts then serialises via the shared `emit_block` (json.dumps with `ensure_ascii=False`, so `\uXXXX` in the Python source decodes to real glyphs in the `.ts` — zero `\u` in output, verified). One authoring gotcha hit and fixed: dialogue-turn dicts inside a `turns:[...]` list must end `"}` not `"})` — a stray `)` breaks Python parsing; a `sed` over `^ {"speaker...."})$` lines fixed all five.
- **Verification (Claude-side)**: all five compiled together against `/tmp/tscheck` stub — `tsc --noEmit` exit 0. Integrity suite all-pass on each: exactly 2 `svg`, 1 `hook`, 1 `keyTakeaways`, 1 `dialogue`; backticks==4; zero `\u`; real `—`; no black-rendering bare `var(`; both SVGs byte-identical to approved sources and each self-contained with its own `<defs>`; named + default exports; slug present.
- **Handoff**: single combined batch prompt `ANTIGRAVITY_HANDOFF_toolkit-batch-5.md`. Phase-1 = a 5-row reconcile table (framework → exact tree slug or MISSING → rename?) plus confirm toolkit dir / `kind` / block fields / callout variants (`pitfall`,`note`,`insight`). Phase-2 = place 5 files, register all in `index.ts` SEED_PAGES, **add missing tree leaves in locked nav order** (most likely 5 C's), never edit `types.ts`. Phase-3 = `tsc` + `npm run build`; **route delta = +1 per net-new node** (likely +1 for 5 C's; 0 for the rest if their nodes were placeholders already generating routes).
- **Antigravity build outcome (confirmed 2026-06-01)**: all five placed in `lib/casebook/content/toolkit/`, registered in `index.ts` SEED_PAGES, `tsc --noEmit` exit 0, `npm run build` succeeded. Two schema reconciliations applied at placement: (a) `kind` switched `"framework"` → **`"toolkit"`** (a real kind in `types.ts`; routes through the same `CasebookReader`, identical hook-hoist/SVG/layout); (b) **`subtitleEmphasize` stripped** — it is NOT a field on `Page` (only `titleEmphasize` is) and would hard-error in `tsc`. **5 C's** added as a net-new tree leaf between 4 P's and BCG in locked nav order; the other four replaced existing placeholder nodes. **Casebook route count 93 → 94 (+1, the 5 C's node).**
- **Status**: all five **SHIPPED / BUILT**. **Toolkit: 6 of 9 cards built.** Remaining: BCG Growth–Share Matrix, Value Chain (needs a distinct treatment — a value-chain flow already appears in Profitability), Ansoff Matrix, McKinsey 7S.

### 9.21 Casebook Section C · Toolkit — final batch of 4 (BCG, Value Chain, Ansoff, McKinsey 7S) — SECTION COMPLETE
- **What**: The last four toolkit cards, built in one batch to the §9.19 template, completing Section C at **9 of 9**. All ship `kind:"toolkit"`, no `subtitleEmphasize` (the two schema facts from the §9.20 build are baked in from authoring — no Antigravity cleanup this time). Two SVGs each (hero + generated how-to-deploy diagnostic), one hook, one keyTakeaways, one worked `dialogue` ending narrator, cross-ref callout. All-original content, India-default.
- **The 4 diagnostics** were generated by reusing `gen_diag.py`'s `build()` (via `gen_diag2.py`) — same proven Porter-p2 vertical 4-move + say-it-out-loud layout.
- **The 4 heroes**, hand-authored, each distinct:
  - **BCG** (`bcg-matrix.ts` → `bcgMatrix`, slug `toolkit/bcg-matrix`): 2×2 (market growth × relative share) with the four cells (Star highlighted) and **cash-flow arrows** (cow → star, question-mark → star); angle = it's a **capital-allocation tool, not a label-maker** — route cows' cash to stars + worthy question marks, give every cell an invest/hold/harvest/exit verdict. Worked case: Indian conglomerate allocating a fixed capital budget across 5 units (cement cow funds electronics star + a real call on the EV question mark; harvest the landline dog — but check the dog's actual margins first). Cross-ref: sits above Growth, leans on Profitability for cell economics. Pitfall: relative share proxies advantage, not profit.
  - **Value Chain** (`value-chain.ts` → `valueChain`, slug `toolkit/value-chain`): primary-activity **chevron flow** + support-activity row + navy **margin bar** + a **cost-lens / differentiation-lens** split strip; angle = find **where advantage lives** (the 1–2 activities you win on), hold the rest to good-enough. Distinct from the Profitability value-chain cost flow — an `insight` callout explicitly frames them as complements (VC = where's our edge; Profitability tree = where's the money leaking / quantify a cost line). Worked case: D2C personal-care brand — cost leak at customer acquisition (shift paid→brand/organic), differentiation in brand (invest), sourcing/fulfilment just stay competitive. Cross-ref: right-to-win in Market Entry, cost side of Profitability, Company lens of 5 C's.
  - **Ansoff** (`ansoff-matrix.ts` → `ansoffMatrix`, slug `toolkit/ansoff-matrix`): 2×2 (products × markets) with **RISK badges** (penetration LOW → product/market dev MEDIUM → diversification HIGH) and a diagonal risk arrow; angle = it's **a risk ladder, not a menu** — exhaust the home square, step out one axis at a time, diversification is a last resort. Worked case: north-India biscuit brand tempted to leap to a national snacks line (diversification) — candidate sequences: max penetration → market development (proven biscuits, new regions) → product development (snacks to existing customers) → diversify only if safer rungs exhausted. Distinct from the Growth-page Ansoff 2×2 (which sits inside organic growth); this card cross-refs Growth + Market Entry + M&A.
  - **McKinsey 7S** (`mckinsey-7s.ts` → `mckinsey7s`, slug `toolkit/mckinsey-7s`, ~10 min): **hub-and-spoke** — Shared Values centre, 3 hard S's (strategy/structure/systems, muted-foreground rings) + 3 soft S's (skills/style/staff, red rings), with a hard-vs-soft legend + "the insight" panel; angle = seven are interdependent so **everything else must move** when one changes; a strategy stalls when soft S's lag the hard ones. Worked case: a bank's digital-first pivot stalled — hard S's (strategy, structure) moved but soft S's (skills, incentive systems, leadership style) lagged, so staff reverted; fix = realign the lagging S's together, not re-strategise. Cross-ref: follow-on to Growth/Market Entry and post-deal M&A integration.
- **Self-render QA**: all 8 SVGs rendered light+dark, inspected, fixed. Notable this batch: (1) the **7S hub-and-spoke initially collided** with the HOW-TO-USE panel (bottom nodes overlapped it) — reworked geometry (center 250,176; r=46 hub, r=36 nodes; full-width panel below) to clear it; (2) 7S hard-S rings were **invisible on dark** (navy-on-navy) → switched hard rings + legend ring to `--foreground`/`--muted-foreground` for dual-mode visibility; (3) the 7S panel body overran badly (135→83 chars) — took several cuts; **lesson: the §9.14 ~104-char budget at 11.5px is real, measure before emitting**; (4) bcg1/vc1/ansoff1 panel bodies + an Ansoff corner caption trimmed for fit. No other dark issues.
- **Verification (Claude-side)**: all 4 compiled against the **corrected** `/tmp/tscheck` stub (now matches real `types.ts`: no `subtitleEmphasize`, `'toolkit'` in the kind union) — `tsc --noEmit` exit 0. Integrity all-pass each: 2 svg / 1 hook / 1 keyTakeaways / 1 dialogue; backticks==4; zero `\u`; real `—`; `kind:"toolkit"`; no `subtitleEmphasize`; SVGs byte-identical to sources w/ own `<defs>`; named+default exports; slug present.
- **Handoff**: `ANTIGRAVITY_HANDOFF_toolkit-batch-final4.md` — lean Phase-1 (4-row slug-reconcile table only; dir/kind/fields unchanged from §9.20). All four are in the original locked nav list → expected to replace existing placeholders → **route delta 0** (any +N = a node was net-new, report which).
- **Status**: all four SHIPPED. **Section C · Toolkit COMPLETE — 9 of 9** (Porter's, SWOT, PESTEL, 4 P's, 5 C's, Customer Journey, BCG, Value Chain, Ansoff, McKinsey 7S — note that's 10 cards across the 9 nav slots because 5 C's was added as a net-new node in §9.20). **Next section: Miscellaneous Frameworks (hybrid node, see §0).**

### 9.22 Casebook NEW Section G · Miscellaneous Frameworks — 9 light pages across 5 nested groups (AUTHORED)
- **What & why**: A user-requested home for the "other tools" from the source casebook that don't belong in the 9-slot Toolkit. Built deliberately as a *curated, themed* section (not a flat junk-drawer) after the user flagged that a flat list would misrepresent the tools as one undifferentiated pile. Structure = **section → group → page**, reusing the existing `kind:'group'` header-node mechanic (same as Section D · Cases buckets) so **no nav-component change is needed** (contrast the M&A hybrid *page-with-children* in §9.13, which DID need one). Pages are **lighter than Toolkit cards**: ONE hero SVG (no how-to-deploy diagnostic), tighter prose, one compact worked `dialogue`, ~5-6 min, `kind:"toolkit"`, no `subtitleEmphasize`.
- **Final structure (5 groups, 9 pages)**:
  - **Marketing & Customer**: STP (`misc-stp.ts`→`stp`, `miscellaneous/stp`, funnel: segment→target→position, top-down discipline) · The 4 A's (`misc-4-as.ts`→`foura`, `miscellaneous/4-as`, four gates awareness/affordability/accessibility/acceptability, reach capped by weakest) · Five Senses (`misc-five-senses.ts`→`fivesenses`, `miscellaneous/five-senses`, sensory wheel, MECE lens for experience problems)
  - **Competitive Advantage**: VRIO (`misc-vrio.ts`→`vrio`, `miscellaneous/vrio`, 4-gate decision flow, first "no" = level of advantage; test a concrete resource not "the company") · Sustainable Advantage (`misc-sustainable-advantage.ts`→`moats`, `miscellaneous/sustainable-advantage`, 8-moat checklist; pairs w/ VRIO)
  - **People & Operations**: AMO (`misc-amo.ts`→`amo`, `miscellaneous/amo`, Performance = Ability×Motivation×Opportunity, multiplicative, match fix to gap) · 4 M's (`misc-4-ms.ts`→`fourm`, `miscellaneous/4-ms`, man/machine/material/method root-cause for process problems). **Kept SEPARATE** (decided over combining): AMO = people-performance, 4M = process root-cause — distinct lenses, forcing a merge muddied both.
  - **Data**: 4 V's of Data (`misc-4-vs-data.ts`→`fourv`, `miscellaneous/4-vs-data`, volume/velocity/variety/veracity; veracity gates the rest)
  - **Market Sizing**: TAM/SAM/SOM (`misc-tam-sam-som.ts`→`tamsamsom`, `miscellaneous/tam-sam-som`, nested rings + formulas; SOM is the honest planning number). **Placed here** (not Toolkit, not Guesstimates) per user.
- **Worked examples (all original, India-default)**: STP→oat-milk brand targeting fitness/wellness urban segment · 4A's→rural solar-lamp maker (shut gate = awareness) · Five Senses→coffee outlet that "feels cheap" (sight+touch) · VRIO→logistics firm's "tech platform" claim (software=parity, last-mile network=real moat) · Moats→food-delivery app (network effects real, switching cost weak) · AMO→sales team missing targets (opportunity gap = clunky CRM, not commission) · 4M→packaging defect creep (timing points to Material/Machine, not retraining operators) · 4V's→retailer real-time rec engine (fix veracity before scaling volume/velocity) · TAM/SAM/SOM→EV-scooter subscription ("huge market" narrowed to defensible SOM).
- **Self-render QA**: 8 hero SVGs (STP, 4A's, Five Senses, VRIO, moats, AMO, 4M, 4V's, TAM/SAM/SOM = 9 actually) rendered light+dark, inspected, fixed. Fixes: panel-body overflows trimmed (STP, VRIO, Five Senses, TAM/SAM/SOM); STP funnel trapezoid mouths widened so text sits inside; TAM/SAM/SOM nested boxes shrunk vertically to clear the HOW-TO-USE panel + that panel rebuilt as 2-line. No dark-only contrast issues (VRIO "muted" outcome boxes intentionally subtle on dark).
- **Verification (Claude-side)**: all 9 compiled against corrected `/tmp/tscheck` stub — `tsc --noEmit` exit 0. Integrity all-pass each: **1 svg** (light page), 1 hook, 1 keyTakeaways, 1 dialogue; backticks==2; zero `\u`; real `—`; `kind:"toolkit"`; no `subtitleEmphasize`; SVG byte-identical w/ own `<defs>`; named+default exports; slug present.
- **Handoff**: `ANTIGRAVITY_HANDOFF_miscellaneous-section.md` — fuller than the toolkit batches because it creates a NEW top-level section + 5 nested group nodes. Phase-1 confirms section ordering (recommend G last, after F), the Section-D group-node shape, the section icon (Boxes/Shapes/LayoutGrid — Antigravity picks what's available), and content dir. Phase-2 places 9 files, registers in SEED_PAGES, adds the section + 5 groups + 9 leaves. **Expected route delta = +9** (group/section nodes don't route; only the 9 leaf pages do).
- **Status**: all 9 AUTHORED & verified Claude-side, SHIPPED to handoff. Pending Antigravity build confirmation (expected route count 95 → 104). This is the first *new section* since the original A–F tree.

### 9.23 Dashboard Rebuild — Readiness Score v1 + radar→bullets + next-action engine (Scope A, AUTHORED)
- **What & why**: Full rebuild of `/dashboard` (replacing the §"Dashboard" 4-section layout) driven by a user research doc (`AI_Interview_Prep_Dashboard_Architecture.txt`) + the explicit goal **monetize + retain (stop the bounce)**. Built to ship on the **current schema with zero DB changes**; architected with clean seams (`weights` param, `PHASE_WEIGHTS`, `computeBenchmark` swap point) so the deferred ideas can slot in later.
- **Adversarial read of the research (recorded so we don't re-litigate)**: (1) Its thesis — *reject gamification / streaks / DAU, the elite user engages fewer minutes* — runs **against** the monetize+retain goal; resolved by separating manipulative engagement from honest progress: the hook is a credible **Readiness number that moves** + one frictionless next action, not fake streaks. (2) The research **barely covers monetization** (the #1 ask) — added explicitly (contextual paywall on gated levers + free-quota meter on the dashboard, the surface where the gap is felt). (3) Its "citations" (1–50) are decorative/unverifiable; the **viz principles are kept** (kill radar charts → bullet/stellar/small-multiples, 5-second rule, progressive disclosure, WCAG AA) but the empirical claims are not load-bearing. (4) Big chunks **assume capabilities the product lacks** — SM-2 spaced repetition, timing telemetry / "Pressure Degradation Index", AI **voice** mocks + NLP, cohort-by-placement-date, IIM-A cluster targeting, Go/Rust+gRPC+Amplitude scale — all out of scope for Next.js + one FastAPI + Supabase + one GPT-4o text scorer; flagged v2/out-of-scope. (5) Research blind spots we added: **cold-start state** (the first-session retention moment it ignored), **/home vs /dashboard overlap** (doing-surface vs understanding-surface; stop duplicating the heatmap), **anxiety guardrail** (never show a bare falling number — always with components + the action that raises it), **mobile-first** (bullets stack where a 6-axis radar can't).
- **New files (DELIVERED, pure logic unit-tested, components tsc-clean)**:
  - `lib/career-tiers.ts` — SSOT for the career ladder (fixes the 3-file duplication; `CAREER_TIERS`, `currentTier`, `nextTier`, `tierProgress`, `pointsToNextTier`, + back-compat `deriveTierName`/`deriveNextTierPts` shims).
  - `lib/readiness.ts` — Readiness Score v1: `computeReadiness({submissions, streak, now?, weights?})` → `{status, score 0–100, verdict, components{mastery,coverage,consistency,robustness}, dimensions[], coverage[12 cells], weakestDimension, stalestType, fragileOnHard}`. Mastery = recency-weighted (14-day half-life) × difficulty-weighted mean of first-attempt scores; coverage = 4 types × 3 difficulties grid credit; consistency = active-weeks/days/streak; robustness = easy-vs-hard drop (capped at 75 until ≥2 hard reps — the honest "Pressure Degradation" proxy). Cold-start = `calibrating` until ≥3 subs across ≥2 types.
  - `lib/next-action.ts` — `nextAction()` picks ONE action by lever size (cover-gap / fix-dimension[weighted by rubric max] / prove-hard / refresh-stale / calibrate), deep-links into `/practice?focus=&type=&difficulty=`, sets `paywalled` when the best move is a free-gated re-attempt; `computeFreeQuota()` = today's first-attempts vs the 3/day free cap (IST midnight reset).
  - `components/dashboard/{readiness-score,next-action-card,dimension-bullets,coverage-map,free-quota-meter,trajectory}.tsx` — presentational, styled with §4 design tokens directly (no shadcn prop-guessing), `<a href>` deep links.
- **Rewritten / refactored / deleted**: `components/dashboard-client.tsx` (rewritten to the four-question zone layout); `app/(app)/dashboard/page.tsx` (rewritten fetch — selects submissions **with `cases(type,difficulty)` join** + `case_attempts.is_first_attempt`, runs the pure pipeline); `components/career-ladder.tsx` (refactor to import the new SSOT); **`components/dimension-radar.tsx` deleted**.
- **Verification (Claude-side, the "self-render" equivalent for a dashboard)**: built an isolated TS workspace mirroring `lib/types.ts`/`lib/constants.ts`; **`tsc --noEmit` exit 0** for both the pure engines and all components (against React + a faithful stub); ran a **9-case synthetic-user test suite — ALL PASSED**: cold-start gating, 2-same-type still calibrating, scored ≥3/2, strong→89/interview-ready, stale→consistency 0 + stale flagged, easy-only→robustness capped 75, fragile-on-hard flagged, free-user weak-structure→paywalled fix + quota 3/3, and score monotonicity (51→71 on strong recent reps).
- **Handoff**: `ANTIGRAVITY_HANDOFF_dashboard-rebuild.md` — Phase 1 reconcile (the only guessed repo internals: `SubmissionRow`/`breakdown` field names, the `cases` join syntax, the real server-client signature, whether a true cohort benchmark already exists, and whether `CASE_TYPE_LABELS` needs adding) → Phase 2 place/replace/refactor/delete → Phase 3 `tsc --noEmit` + `npm run build` + 4 smoke states. **No schema change; `/dashboard` is `force-dynamic` so route counts (casebook 104) are unaffected.**
- **v2 LAYOUT CORRECTION (2026-06-02)**: the first Antigravity build shipped and the user screenshotted it — the composition was too **sparse** (full-width stacked cards, content jammed left → oceans of whitespace; the "peer comparison" cohort tick was effectively invisible). Root cause: I verified logic + `tsc` but **never rendered the composed page** (the self-render step I'd promised for the whole dashboard, analogous to the casebook diagram self-render — skipped). Also a real regression: the **rebuild dropped the original dashboard's rank/percentile stat tiles**, which were genuine peer comparison. Reframe recorded: the original `/dashboard` was NOT bad (dense 12-col grid, stat tiles w/ rank+percentile, recent-activity table, inline heatmap); the right move was **additive**, not a full overhaul. **Fix (re-handoff, same files):** `dashboard-client.tsx` rewritten to a **dense 12-col grid that fills width** (Readiness 4 / DoThisNext 5 / rank+percentile "Where you stand" 3 · 4 stat tiles · Bullets 8 / Trajectory 4 · Coverage 7 / Quota 5 · Career 8 / Heatmap 4); `dimension-bullets.tsx` → 2-column with a **visible navy cohort tick + per-dim ± delta chip**; `free-quota-meter.tsx` → compact strip for Pro; `coverage-map.tsx` → tighter cells; `page.tsx` now also computes/passes `rankNum/totalUsers/percentile/avgScore/streak`. Components re-`tsc`-clean against ambient stubs matching the REAL repo signatures (Card named export; StatTile/SectionHeader/CareerLadder/SubmissionHeatmap default). **Process fix:** the handoff now carries a **mandatory screenshot-QA gate** (1440px + 390px, light + dark; assert no card >~30% empty width, peer tiles present, bullets 2-col w/ visible tick) since the pixel render can only run in Antigravity's env (no browser installable in the Claude sandbox — confirmed this session).
- **Dark-mode tick patch (2026-06-02)**: dark-mode contrast bug caught at review before marking built — the cohort tick in `dimension-bullets.tsx` was `bg-navy` (dark `--navy` 214 40% 18%) on a `bg-muted` track (214 30% 16%): ~2pp lightness gap = invisible on dark. Swapped to `bg-foreground` (near-black in light, near-white in dark → 88pp / 76pp gaps) + 3px width + `ring-1 ring-card` halo; now consistent with the percentile marker. Components re-`tsc`-clean.
- **Status (BUILT, 2026-06-02)**: Antigravity Phase 2/3 complete. `tsc --noEmit` clean (with `user_id`/`answer_text` select reconciliations on `page.tsx`); `npm run build` green → **143 static pages**, casebook routes confirmed untouched/decoupled (`/dashboard` is `force-dynamic`). Structural QA verified at markup level (12-col rows 4/5/3 · 8/4 · 7/5; rank/percentile peer tiles reinstated; bullets `sm:grid-cols-2`; Pro quota = tight strip; mobile stacks; dark-mode tick now contrast-safe). Raw-pixel screenshot spot-check still open as an optional dev-server pass (no browser in either AI env). **Known follow-ups (not bugs):** (a) the ±delta chip compares against the *global* cohort mean (all users, unfiltered) — a percentile-band cohort would motivate better = v3; (b) `/home` vs `/dashboard` heatmap duplication still unrationalised. **Deferred (v2 / Scope A+ seams)**: placement-date input → 120/60/30-day `PHASE_WEIGHTS`; true cross-user cohort benchmark; SM-2 + timing telemetry; voice mocks. **Open IA follow-up**: rationalise `/home` (doing) vs `/dashboard` (understanding) so the heatmap isn't duplicated.

### 9.24 Merge /home → /dashboard — one logged-in surface (AUTHORED)
- **Why**: §9.23 left an open follow-up — `/home` (doing: daily picks + heatmap + skill mastery + testimonials) and `/dashboard` (understanding: readiness, bullets, coverage, career) overlapped (duplicate heatmap) and split the daily-return loop across two routes. User also asked whether testimonials/"minds behind" belong elsewhere. Audit finding (recorded): the **public root `/` (`app/page.tsx`) is already a correct marketing homepage** (hero, 4 feature sections, methodology strip, testimonials, CTA, footer) that already flips its nav to "Open MECE" → /home for logged-in users — so nothing needed to "become" the homepage. The real fix was purely on the logged-in side.
- **Decision**: keep `/dashboard` as the single logged-in surface; daily-picks doing-layer on top, analytics below; `/home` → permanent redirect; testimonials live only on the public landing.
- **New file**: `components/dashboard/daily-picks-strip.tsx` (`'use client'`) — lifts the three `DailyPickTile`s + `fetchDailyToday()` out of `home-content.tsx`; rendered at top of `dashboard-client.tsx` under the hero. tsc-clean against stubs matching real `DailyPickTile` props + `DailyContentResponse`.
- **Changed**: `dashboard-client.tsx` (renders `<DailyPicksStrip/>` above ROW 1); `app/(app)/home/page.tsx` → `redirect('/dashboard')`.
- **Reference cleanup (11 hits / 9 files → `/dashboard`)**: `lib/supabase/middleware.ts` (post-auth redirect), `app/auth/callback/route.ts` (`next` default), `components/auth-form.tsx` (`next` default), `app/page.tsx` (×2: "Open MECE" + hero CTA), `app/(app)/admin/layout.tsx` (redirect), `components/daily-rank-tile.tsx` (href), `components/app-nav.tsx` (logo link + **remove separate "Home" nav item**), `components/mobile-bottom-nav.tsx` (**remove "Home" tab**). Testimonials section removed from any logged-in render (`home-content.tsx`); `testimonials-carousel.tsx` retained (landing still uses it).
- **Handoff**: `ANTIGRAVITY_HANDOFF_home-dashboard-merge.md` — Phase 1 confirm (`DailyContentResponse` shape, `DailyPickTile` props, kept-route choice) → Phase 2 place/replace + the reference-cleanup table → Phase 3 `tsc` + `build` (expect page count 143 → ~142 as /home collapses to a redirect) + a **click-path smoke test** (/home redirects, fresh login lands on /dashboard, nav shows one home entry, daily picks on top, no testimonials in-app) + screenshot QA.
- **Status**: AUTHORED & tsc-clean Claude-side, SHIPPED to handoff. Pending Antigravity build confirmation.

### 9.25 "Alive" dashboard — entry choreography + ambient motion (AUTHORED)
- **Why**: user wanted the dashboard to feel less "gridy"/static and more alive (charts/graphs that move + build on open). Held a deliberate line: choreographed entry motion that guides the eye + tasteful ambient touches, NOT looping/bouncing slot-machine motion (which hurts readability + retention). Rejected (for now) animated aurora/parallax backdrops as fighting a data surface; left as a future option if user insists.
- **Choreography (once, on load)**: sections slide up in sequence (`.stagger`); readiness ring sweeps via `stroke-dashoffset` while the score + component values count up; component & skill bars fill left-to-right staggered; coverage cells cascade (scale+fade, row-major); trajectory line draws on via `pathLength`/`stroke-dashoffset`. Then ambient life: `ambient-pulse` on the non-paywalled "Do this next" CTA, `ambient-flame` flicker on the streak icon when `streak>0`. Settles calm/static after ~2s.
- **New file**: `hooks/use-dashboard-motion.ts` — `usePrefersReducedMotion`, `useCountUp(target,dur,delay)`, `useMounted(delay)`; all reduced-motion aware (count-ups jump to final, reveals instant).
- **Changed (now client components, animated)**: `readiness-score.tsx`, `dimension-bullets.tsx`, `trajectory.tsx`, `coverage-map.tsx`, `next-action-card.tsx`, `dashboard-client.tsx` (main column gets `.stagger`, streak flame ambient). Built ON TOP of the repo's existing `@keyframes slide-up/fade-in/float` + `.stagger` infra (globals.css ~335–352) rather than parallel infra.
- **globals.css append** (`globals-append.css`): `soft-pulse`/`flame-flicker` keyframes + `.ambient-pulse`/`.ambient-flame` wrapped in `@media (prefers-reduced-motion: no-preference)`; `.stagger` nth-child 7–8 (merged dashboard has >6 sections); **plus a reduced-motion guard that neutralises the repo's EXISTING animations too** — fixes a pre-existing a11y gap (current `animate-*`/`.stagger` ignored reduced-motion entirely).
- **Verify**: tsc-clean Claude-side against React + stubs. Handoff `ANTIGRAVITY_HANDOFF_alive-dashboard.md` — Phase 3 includes an explicit **reduced-motion QA** (emulate `prefers-reduced-motion: reduce` → all motion stops, final state instant) + dark/mobile checks. No data/logic/route change.
- **Status**: AUTHORED & tsc-clean Claude-side, SHIPPED to handoff. Pending Antigravity build + motion QA.

### 9.26 Supabase auth warning — server-side getSession() → getUser() (AUTHORED)
- **Trigger**: dev console warned on every server-side `supabase.auth.getSession()` ("…could be insecure… Use supabase.auth.getUser()"). `getSession()` reads the session from the cookie and trusts it; `getUser()` verifies the token with the Supabase Auth server.
- **Audit (recorded)**: 16 server-side `getSession()` call sites; `middleware.ts` + `reset-password` already use the verified `getUser()`. **Not an active hole** — middleware (verified) gates protected routes; page calls mostly use the user id to fetch the user's own rows. **Real privilege boundary = admin** (`admin/layout.tsx` + `admin/actions.ts:requireAdmin`) — prioritised. `is_admin` comes from the DB so a forged cookie can't grant admin, but the gate should still authenticate via `getUser()`.
- **Fix**: mechanical swap in 16 files — `getSession()`→`getUser()`, destructure `user` not `session`, replace later `session.user`→`user`, preserve each file's existing guard (redirect/throw/401/allow-null). Public pages (`app/page.tsx`, `methodology`) just branch on `user` existence. Canonical swap type-checked against `@supabase/ssr` types Claude-side.
- **Merge interaction noted**: `dashboard/page.tsx` + `home/page.tsx` also touched by §9.24 — apply auth fix to POST-merge versions (`home` becomes a bare `redirect('/dashboard')` with no auth call).
- **Handoff**: `ANTIGRAVITY_HANDOFF_auth-getuser-fix.md` — per-file table w/ guard-action + null-allowed columns; Phase 3 verifies warning gone + admin gating intact.
- **Status**: AUTHORED, SHIPPED to handoff. Pending Antigravity build. NOTE this supersedes the earlier §9.23 reconciliation that had `dashboard/page.tsx` using `getSession()` — the kept server pattern is now `getUser()`.

### 9.27 AI evaluation v2 — two-brain architecture + tiered interaction (SPEC LOCKED, not yet built)
Design spec only — no code shipped. Crystallised across discussion + review of a prior prototype (`test_rubrics/`: growth-rubric-v0.1.md, evaluation-schema.ts, evaluator-openai.ts, evaluator.ts, eval-harness.ts, transcript-test-set.ts). Supersedes nothing yet; extends the current single-call 6-dimension scorer.

**Architecture — two brains.** Brain 1 = neutral live interviewer (reveals case data only when asked, never guides, ends on recommendation). Brain 2 = evaluator (never sees the live session; reads the finished transcript → structured `Block[]` evaluation rendered in the SAME casebook block format as Learn pages, closing the learn→practice→graded→routed-back ring). Distillation NOT RAG (PDFs distilled offline into per-type rubrics; never searched at runtime — RAG would penalise out-of-the-box answers and burn tokens). Model routing: cheap model for Brain 1, Sonnet evaluator default, Opus as a "pro review" upsell. Prototype proved Brain 2 is CONSISTENT + directionally right on 5 transcripts (5/5 stable, injection held) but NOT yet accurate-to-a-few-points (self-admitted ~12pt middle-band bias) — needs ~15–30 real human-scored transcripts, which only exist once Brain 1 is live. So Brain 1 is the next build (unblocks the loop + generates calibration data).

**Tiered interaction model (LOCKED).** Same hidden case data powers all tiers; tier controls how the candidate may ACCESS it:
- **Free**: 1 practice/day · 5 preset clickable questions · no typing (pure menu, zero live-AI cost).
- **Lite**: 3 practices/day · 5 preset clickable + may type own, but TOTAL questions capped at 5 (each typed question spends a slot — "ask the right five" is itself a training constraint).
- **Pro**: unlimited practices/day · 10 preset clickable + UNLIMITED typed questions (full free-form interviewer).
- Cost note: Lite/Pro typed questions = live Brain-1 calls (token cost); daily limits double as cost control. Free preset clicks are free to serve.

**Rubric structure (LOCKED, corrected to map 1:1 to the shipped Casebook).** Type rubrics = the SIX Core Frameworks (each has a Learn page to derive from — the alignment firewall): Profitability, Market Entry, Growth (rubric already built, see test_rubrics/), Pricing, M&A/PE, Structuring fundamentals — see §9.17 inventory. PLUS a market-sizing/guesstimate rubric (distinct interaction — estimation, TAM/SAM/SOM lives here). PLUS a shared UNIVERSAL CORE (structure, quant rigour, communication, recommendation; + Pro-only question quality) applied to EVERY case. **Miscellaneous = core-only** (no type spine). So ~7 rubrics + core, not 300. KEY DISTINCTION: the **Toolkit + Section-G Miscellaneous frameworks** (SWOT, Porter's, PESTEL, BCG, Ansoff, Value Chain, 7S, VRIO, STP, 4A's, etc.) are NOT type rubrics — they are reference tools a candidate *invokes within* a case and are caught by the universal core's structure/judgment dimensions; giving each its own scoring spine would be the 300-rubric trap. A mixed case (e.g. growth+M&A) is caught by the core without a combo rubric. **Case `type` is HIDDEN from the candidate** (recognising the type is itself realistic + scoreable) but KNOWN to the evaluator (you tag it at authoring → evaluator loads the matching rubric + core). Rubrics derived from MECE's own Learn pages, not the branded PDFs = the copyright firewall (PDFs inform understanding → original Learn pages → rubric derives from those).

**Scoring (LOCKED).** Question-quality scoring (did they ask the right things, in the right order) = **Pro only**; Lite stays simple (reveal + score final answer only). Consistent with §(scoring-model decision earlier this session): stable ABSOLUTE score (never drops on a user) + exemplar mining (top human-verified answers sharpen the rubric & teach) + moving PERCENTILE (the "how do I compare" feeling lives in the ranking, which may move; the score does not). Rubric evolution is VERSIONED + human-checkpointed (old scores keep their rubric version; no silent re-scoring).

**Open threads (user owns):** legal consult on commercial use of distilled casebook understanding (do before scaling); confirm hand-scores reflect real judgement; third-tier pricing deferred until the loop works. **Status:** SPEC LOCKED. Next build = Brain 1 (live interviewer w/ hidden data reveals + recommendation-detection firing Brain 2), anchored to the growth case (matches the already-built growth rubric). Awaiting user go to build.

### 9.28 Brain 1 — live interviewer prototype (BUILT Claude-side, growth case)
First build of the §9.27 spec. Standalone prototype, one case, NO UI / NO /practice wiring yet (deliberately — prove the engine first). New module `lib/interview/`:
- **types.ts** — `InterviewCase` (hidden `type`, prompt, `DataReveal[]`, `PresetQuestion[]`, `evaluatorNotes`), `SessionState`, and `TIER_RULES` (the single gating SSOT): free {max 5, no typing, 5 presets, 1/day} · lite {max 5, typing, 5 presets, 3/day} · pro {max ∞, typing, 10 presets, ∞/day}.
- **growth-case-chaiwala.ts** — ORIGINAL India-flavoured growth case (Tapri & Co. café chain, ₹420cr→₹1,000cr/5y; invented company+numbers, not the rubric's calibration example). 10 reveals + 10 presets (first 5 by order = Free/Lite set). `evaluatorNotes` (size the gap ~₹225cr above ~13% trajectory; core-first new outlets → premiumise → packaged adjacency → franchising as balancer; real constraint = real-estate+bandwidth not capital) used by Brain 2 only, never shown live.
- **session.ts** — PURE state machine: `startSession`, `visiblePresets`, `askPreset`/`askTyped` (enforce caps + typing rule, return reveal-or-reject), `matchReveal` (deterministic keyword fallback / model hint set), `submitRecommendation` → `shouldFireEvaluator`, `transcriptForEvaluator`. Cap-reached auto-transitions to `awaiting_recommendation` and prompts for the rec. Injection handled as DATA (recorded verbatim, never obeyed).
- **interviewer.ts** — the neutral interviewer (OpenAI `strict` json_schema structured output, static prefix first for caching, injection guard last — mirrors the proven `evaluator-openai.ts`). Returns {reply, candidateAskedQuestion, candidateGaveRecommendation, matchedRevealId}. The MODEL does conversation + semantic matching; session.ts owns the caps so the model can't overspend.
- **Verification:** full `tsc --noEmit` clean (incl. the model call). Logic gate `test/session.test.ts` = **31/31 PASS** (tier caps across all 3 tiers, reveal matching, recommendation→fire, injection-as-data, and critically the transcript handed to Brain 2 LEAKS NEITHER the hidden `type` NOR `evaluatorNotes`). End-to-end Free-tier sim ran the whole loop (prompt → 5 reveals → cap → recommendation → fire, 14-turn clean transcript). The model's *behaviour* (neutrality/no-steering) is NOT unit-testable without a live key — gated as mandatory Phase-3 live QA in the handoff.
- **Handoff:** `ANTIGRAVITY_HANDOFF_brain1-interviewer.md` — Phase 1 reconcile (real `CaseType` enum values, OpenAI model id, evaluator input signature) → Phase 2 place + wire the fire-to-Brain-2 path (NO full chat UI this pass) → Phase 3 `tsc`/build + run the 31-check gate + the mandatory live-behaviour QA (neutrality, type-stays-hidden, no-volunteering, no-inventing, injection, recommendation-detection, tier caps live) + start calibration capture (persist every transcript+score; target 15–30 to fix the evaluator's unproven middle-band accuracy from §9.27).
- **Status:** BUILT & verified Claude-side (logic), SHIPPED to handoff. Pending Antigravity build + live-behaviour QA. Next after verify: the chat UI (preset chips, question counter, recommendation button) + remaining type rubrics (Profitability/Market Entry/Pricing/M&A/Structuring + sizing), reusing growth-rubric-v0.1 as the template.

### 9.29 Guesstimate rubric v0.1 — distilled from the ISB corpus (INTERIM, learn-page reconcile pending)
First rubric built the "proper" way (§9.27 plan): distilled from a real case corpus, not just a learn page. Second of the ~7 type rubrics (growth was first).
- **Source corpus:** user uploaded `guess.txt` — a MULTI-SCHOOL top-tier guesstimate corpus (NOT only ISB: contains IIM-A material throughout — bullets, chess moves, injections, PPT-slides, ECA-hours, steps-walked guesstimates are IIM-A-tagged, and the Reflections are from IIM/ADL interview experiences; ISB casebook is one source among several). ~70 fully worked guesstimates + the casebook's own *Key Evaluation Parameters*, the 10-step *Approaching Guesstimates* process, *Notes from Expert*, and candidate *Reflections*). Read in full across all types: market-sizing (chimneys/tyres/maternity/test-prep), population/counting (white shirts/bullets/chess/injections/EVMs), revenue (salon/Spotify/multiplex/duty-free/Urban Company), throughput/supply-side (Qatar cars/airspace/metro), abstract (caps-from-space), data-driven, and probability/decision-tree (coal import). NOTE: this is GUESSTIMATES ONLY — no other corpora given; cases/profitability/etc. remain separate future rubrics.
- **Rubric (`guesstimate-rubric-v0.1.md`):** 5 dimensions mirroring the casebook's stated eval params — (1) Scoping & problem definition 10% (crisp clarifying Qs; over-questioning AND zero-questioning both penalised), (2) **Structure & approach 30%** (write the equation FIRST, pick + justify top-down/bottom-up/demand/supply, adapt if redirected — the signature move), (3) **Segmentation & assumptions 25%** (MECE split by a meaningful driver + every assumption justified; LOCKED stance: reward ANY clean MECE split by a sensible driver, never prescribe one 'right' split, penalise only overlap/gap/irrelevant), (4) Arithmetic & unit discipline 15% (its own dimension *because the model answers themselves slip here*), (5) Sanity check & triangulation 20% (independent 2nd method / anchor — the A-vs-B separator). Weights sum 1.0 (verified). The NUMBER is explicitly NOT scored — process over answer, per the casebook's own refrain. Per-type emphasis notes baked in (market-sizing/counting/revenue/throughput/abstract). Same `Block[]` / caseSection output contract as growth-rubric so Brain 2 renders it identically. A-grade anchor = the EV-Hyderabad triangulated answer.
- **Errata companion (`guesstimate-errata.md`):** treated model answers as A-grade for STRUCTURE only, verified their math independently (locked decision). 3 confirmed errors flagged for the user to fix in published content: Goa-beers (alcohol base 180K doesn't reconcile with 1.05M adults → should be ~630K), Tractors (rural pop overstated ~100cr vs ~91cr; and stated 1.8cr in-use tractors contradicts its own income split which yields ~3.5cr), Bullets-image (totals labelled 'Mn' are actually ~Bn; 30k rounds/recruit unrealistic; 35.3Bn 'right' via compensating errors). Clean exemplars: EV Hyderabad, White shirts, Electric Chimneys.
- **OPEN TODO (logged in §0):** guesstimate LEARN PAGE not yet provided. Locked sequence when it arrives: diff vs corpus → flag gaps → UPDATE LEARN PAGE FIRST → THEN re-derive rubric from it (learn page = alignment firewall). v0.1 is INTERIM until reconciled.
- **Adversarial audit (2026-06-02) — known limitations to fix before trusting as a precise scorer:** (1) **Arithmetic dimension (D4) is the weak link** — an LLM scorer can make the SAME base/unit errors the answer made and fail to catch them; needs a NON-LLM backstop (a code/calculator step that re-runs the candidate's arithmetic) or D4 is unreliable. (2) **Triangulation (D5) is word-gameable** — a fluent "this seems reasonable" can farm points without a real 2nd method; anchors mitigate but don't close it. (3) **No order-of-magnitude floor** — a clean-process answer landing 1000x off can over-score; add a magnitude-plausibility guard that caps the total on egregious final errors. (4) **Assumes a complete transcript** — partial/interviewer-derailed sessions (e.g. the caps-from-space rescope) score erratically; depends on Brain 1 behaviour. (5) **Calibration unproven** — same caveat as growth: sound-on-paper ≠ accurate to a few points until run through the consistency harness on hand-scored guesstimate transcripts. Coverage (scoring unseen guesstimate types) is the rubric's genuine STRENGTH — process-not-answer generalises; the weaknesses are mechanical (arithmetic enforcement, anti-gaming) + calibration, which more cases will NOT fix.
- **Status:** v0.1 DRAFTED & weight/scale-verified Claude-side, exported (`/mnt/user-data/outputs/guesstimate-rubric/`). Not yet run through the consistency harness (needs hand-scored guesstimate transcripts, like growth did). Not yet handed to Antigravity (rubrics are content artifacts, wired in when Brain 1/2 go live). Next: same distillation for the remaining type rubrics (Profitability, Market Entry, Pricing, M&A, Structuring) as the user supplies each corpus.

### 9.30 Arithmetic backstop — deterministic math-checker for the guesstimate evaluator (BUILT)
Fixes the #1 weakness from the §9.29 adversarial audit: LLMs can't reliably verify arithmetic, so a non-LLM code layer does. Pure logic, 17/17 tests pass against the real corpus errata.
- **Files (`lib/scoring/`):** `calc-chain.ts` (CalcChain type = the candidate's stated math as structured steps with op/inputs/claimedValue + a deterministic `resolveChain` that recomputes each step from inputs, resolving `#refs` to COMPUTED not claimed values; `percent_of` keeps the base explicit so base-errors are catchable); `arithmetic-check.ts` (`runBackstop` → findings {recompute_mismatch, base_inconsistency, magnitude_implausible, final_mismatch}, a corrected D4 score, a totalCapFactor for magnitude blowups, and an explicit `notChecked` scope disclaimer); `apply-backstop.ts` (`applyBackstop` merges LLM rubric scores + the chain → OVERRIDES the LLM's arithmetic dimension with the recomputed verdict + applies the magnitude cap; extends the existing "server recomputes, never trust the model" principle from the WEIGHTS to the ANSWER).
- **HONEST-SCOPE correction (important):** while building, re-verified the errata and found my earlier §9.29 errata MISLABELED the bullets case — "4,210 Mn" is actually INTERNALLY CONSISTENT arithmetic (≈4.2e9, cells sum to 35.3Bn correctly). The real bullets flaw is an ASSUMPTION-REALISM error (30k rounds/recruit/yr unrealistic), which a calculator CANNOT catch — it stays with the LLM under segmentation/assumptions (D3). The backstop is deliberately built to NOT pretend to catch it (a test asserts this). The Goa-beers error (180K vs real 630K) IS a true base error and the backstop catches + corrects it. So errata reclassification: Goa = arithmetic/base (backstop-catchable); Bullets = assumption-realism (LLM/D3, not backstop); Tractors = mixed (overstated base + self-inconsistent split — partly catchable).
- **Verify:** tsc clean; 17/17 (Goa base error caught→630K; bullets NOT falsely flagged + scope-note disclaims; magnitude guard caps 35-trillion answer to ≤0.5×; EV clean no-cap; merge overrides LLM arithmetic 5→2, total 76).
- **Handoff `ANTIGRAVITY_HANDOFF_arithmetic-backstop.md`:** the real integration cost = the evaluator (Brain 2) must ALSO emit a `calcChain` (transcribe the candidate's stated math into the step structure — LLMs are fine at transcription, not verification); then call `applyBackstop`. Optional per-case `plausibleBand {low,high}` enables the magnitude guard (no band → guard safely off). Phase 3 = run a transcript w/ a deliberate base error end-to-end.
- **INTEGRATED (2026-06-02, Antigravity).** Wired into the live evaluator: `evaluation-schema.ts` extended to carry `calcChain`; `evaluator.ts` prompts the LLM to transcribe candidate math into the chain WITHOUT fixing errors, then runs `applyBackstop()` → arithmetic dimension overridden, total capped on magnitude misses, findings appended as a "Math Re-check (Deterministic)" feedback block. Verified live: 17/17 tests; `tsc`+`npm run build` clean in consilio; deliberate Goa base error caught (claimed 1.80L vs recomputed 6.30L) with the candidate's wrong base PRESERVED + surfaced as fact in feedback; unstructured/no-math transcript → empty calcChain → graceful degradation (LLM arithmetic score kept, no crash, no false override).
- **REUSABLE LESSONS for every future type-rubric backstop (learned this integration):** (1) the LLM MUST emit `percent_of` bases (and all step inputs) as `#refId` references, NOT re-typed literals or variable NAMES — emitting variable names caused `NaN` recompute errors; the prompt must rigorously enforce the `#` prefix. (2) "transcribe faithfully, do NOT correct the candidate's math" must be explicit or the LLM silently fixes errors and the backstop finds nothing. (3) no-clean-math transcripts must yield an empty chain and fall back to the LLM arithmetic score (never crash/zero). These three prompt rules carry to profitability/market-entry/etc. backstops verbatim.
- **Status:** BUILT, TESTED, and INTEGRATED live. Guesstimate rubric now "trustworthy" on the arithmetic axis. Audit weaknesses still open: #2 triangulation word-gaming (needs 2nd-method structurally required, future), #5 calibration (needs hand-scored transcripts, unblocked once Brain 1 is live).

### 9.31 Daily-content pipeline + admin panel + keep-alive — fix batch (AUTHORED, 2026-06-02)
First debugging session against the live build (`company-main__5_.zip` + `backend-main__2_.zip` + a `render-keep-alive-master` sample). Fixes the user-reported "daily case/guesstimate/news don't run + admin panel fails." Map-not-code: diagnosed against the uploaded source, not the blueprint.
- **Root cause #1 (daily generation, the big one):** `services/content_generator.py` was authored against an imagined schema — it inserted into `cases` columns that DO NOT EXIST (`code, sector, source, problem, root_cause, key_insight, framework, resolution, math, risks`) and OMITTED the three NOT-NULL columns the real table requires (`type, difficulty, content`); it also wrote a second row to a **non-existent `guesstimates` table**. Every insert hard-failed → `save_generated_content()` raised → `fill_daily_schedule()` raised → `/cron/schedule-daily` returned 500 → `daily_schedule` never filled → `/daily/today` always returned empty → the dashboard's three daily tiles fell back to "Browse…" permanently. Real `cases` schema (confirmed via `seed.sql` + `CaseRow`): `id, title, type, difficulty, content, hint, is_active, created_at`.
- **Fix #1:** rewrote `content_generator.py` to emit a tight JSON shape (case: title/type/difficulty/scenario/quant_ask/framework_hint; guesstimate: title/difficulty/prompt/approach_hint) and **compose onto the real columns** — `content` = scenario + quant ask, `hint` = framework/approach nudge (answer-only fields dropped; the scorer takes no stored key). Enums are **coerced** in code (`HARD→hard`, `Profitability→profitability`, junk→safe default) so a bad LLM value can never break the insert. Both case AND guesstimate are inserted as **`cases` rows** (guesstimate `type='guesstimate'`), making the daily guesstimate a first-class **attemptable, scoreable** item. Verified: both composed payloads match the real schema exactly (no extra/missing cols), enums coerce. **No DB migration.**
- **Fix #1b (scheduler + route):** `daily_scheduler.py` stores the guesstimate case's UUID in the existing `daily_schedule.guesstimate_code` text column (no FK possible — no `guesstimates` table exists). `routes/daily.py` `TodayResponse` gains a `guesstimate` object (id/title/type/difficulty), resolved from `cases` by that id (replacing the old lookup against the phantom `guesstimates` table); `guesstimate_code` kept for back-compat. Frontend `lib/api.ts` `DailyContentResponse` gains the `guesstimate` object; `daily-picks-strip.tsx` links the guesstimate tile to `/cases/{id}?daily=1` (mirroring the case tile; the old `/practice?tab=guesstimates&focus=` link was dead — practice-hub ignores `focus`). Frontend edits `tsc --noEmit` clean against mirrored repo types.
- **Phase-1 finding (2026-06-02, second consumer):** Antigravity Phase-1 confirm surfaced a SECOND reader of `guesstimate_code` — `components/home-content.tsx` (reads it raw into a label + `focus=` URL). Verified this build: `app/(app)/home/page.tsx` is already `redirect('/dashboard')` (§9.24 applied) and **nothing imports `home-content.tsx`** → it's orphaned dead code that never renders, so the UUID-in-`guesstimate_code` carrier never reaches a user. Resolution: **delete `home-content.tsx`** (guarded — Antigravity re-confirms zero importers incl. dynamic `import()`/barrel; falls back to patching it like the strip if any importer exists; `npm run build` catches a miss). This also completes §9.24's intent (home-content's daily layer was lifted to the strip; the file was meant to be retired). Confirms `guesstimate_code`-as-UUID is safe once no consumer renders it raw.
- **Root cause #2 (admin panel):** "Run AI Generator" hit the same broken `/cron/schedule-daily` (→500). Both admin buttons also send `process.env.CRON_SECRET`, but `CRON_SECRET` was **absent from the frontend env contract** — unset in deploy → empty secret → backend 401. The admin *gate* (`getUser()` + `is_admin` from DB) was correct and untouched. **Fix #2:** Fix #1 clears the 500; added `CRON_SECRET` to frontend `.env.example` with a note (deploy must set it = backend's value, server-only, no `NEXT_PUBLIC_`).
- **Root cause #3 (news):** pipeline code is sound (`news_fetcher` + `headline_classifier` + `cron/fetch-news`); real failure mode is operational — the fixed-time GitHub-Actions curl can hit Render mid-cold-start (502) and depends on `GNEWS_API_KEY`/`NEWSAPI_KEY`/`CRON_SECRET` on Render. **Fix #3:** hardened `daily-cases.yml` + `daily-news.yml` with a `/health` pre-warm loop (up to 6×10s) before the POST + `--retry-all-errors --fail-with-body`.
- **Keep-alive (user-requested, "independent, runnable on schedule + from admin"):** added `keep_alive.py` (the user's proven 7-min-window pinger, retargeted to read `RENDER_URL` from env, stdlib-only, max gap <13min < Render's 15-min sleep) + `.github/workflows/keep-alive.yml` (every-minute cron + `workflow_dispatch`) **inside the backend repo itself** — independent (GitHub-hosted, no second website), self-contained (no second repo). Window math verified (exactly 1 ping/window). The admin "whenever I want" need is met by the existing admin trigger buttons (now fixed) + manual `workflow_dispatch` on all three workflows.
- **Incidental finding (logged in §0):** the blueprint's `requirements.txt` UTF-16-BOM deploy bug is **already fixed** in this build (clean UTF-8, modern pins). And the daily scheduler is now AI-generation (today-only) rather than the old curated 7-day-buffer/60-day-cooldown picker — both reconciled in §0.
- **Verification (Claude-side):** all backend `.py` `py_compile` clean; insert-payload simulation passes; frontend `tsc --noEmit` exit 0 against mirrored types; all three workflow YAMLs parse; keep-alive window logic asserted. **Pixel/live behaviour (real OpenAI + Supabase + Render) is the mandatory Phase-3 gate in the handoff** (no live keys in the Claude sandbox).
- **Handoff:** `ANTIGRAVITY_HANDOFF_daily-admin-keepalive-fix.md` — Phase 1 confirms `cases`/`daily_schedule` columns + `guesstimate_code` has no FK + the daily consumer is only `daily-picks-strip` + the frontend lacks `CRON_SECRET`; Phase 2 places 3 backend service/route files + `keep_alive.py` + 3 workflows + 3 frontend files + sets `CRON_SECRET` on the frontend deploy; Phase 3 = compile + POST `/cron/schedule-daily` (expect 2 `cases` rows + 1 `daily_schedule` row, idempotent re-run = `filled:0`) + admin both-green + all three workflows runnable.
- **Status:** AUTHORED & verified Claude-side, SHIPPED to handoff. Pending Antigravity build + live QA. **Files (`/mnt/user-data/outputs/`):** `backend/services/content_generator.py`, `backend/services/daily_scheduler.py`, `backend/daily.py` (→ `routes/daily.py`), `backend/keep_alive.py`, `backend/.github/workflows/{keep-alive,daily-cases,daily-news}.yml`, `frontend/api.ts` (→ `lib/api.ts`), `frontend/daily-picks-strip.tsx` (→ `components/dashboard/`), `frontend/.env.example`, + the handoff `.md`.

### 9.32 News pipeline — "saves 0, reports success" fix (AUTHORED, 2026-06-02)
Second debugging unit this session. User report: admin "Run News Fetcher" says it generated news, but nothing populates on the GD-briefs page or the today's-news/brief tile. Diagnosed against the uploaded build; the news READ path (`routes/news.py` GET `/headlines`, the gd-briefs frontend page, `/daily/today` star-headline) is correct and unfiltered — so the headlines were never landing in `news_headlines`.
- **Root cause:** `services/headline_classifier.py` sends the model an integer `index` per headline but merged the model's classification back by **exact lowercased title**. GPT-4o-mini lightly rewrites titles (smart quotes/trim/em-dash) → title lookup misses → those headlines fell to the neutral fallback (`gd_worthiness_score: 5`) → dropped by the `min_score=75` filter → `saved 0`. `/cron/fetch-news` still returned `status:"ok","saved 0"`, which the admin rendered as green "success". NOT a column-mismatch (unlike the §9.31 cases bug — the `news_headlines` insert columns match the table).
- **Fix (mechanical join repair only — owner-scoped, NO scoring change):** prompt OUTPUT FORMAT now requires the model to echo the original `index` (enables the index merge); the merge keys on `index` first, then normalized title, then positional order, then the existing neutral default. **Threshold `min_score=75` and fallback score `5` left byte-for-byte** (owner instruction: leave both as-is, only fix the broken merge). Proven: with rewritten titles, the OLD title-merge matched 0/3 (all dropped to fallback→filtered); the NEW index-merge preserved the real scores (88/82/79) → filter keeps 3/3 → saved>0.
- **Admin warning (owner-approved):** `app/(app)/admin/page.tsx` `handleNewsFetch` now reads `data.details.saved`/`data.status`; `saved===0` or `status==='warning'` renders an **amber warning** ("News run completed but saved 0 headlines.") instead of a misleading green success. New `'warning'` log type + `AlertTriangle` icon; case-generation button untouched. tsc-clean against mirrored types.
- **Standing rule recorded (owner, 2026-06-02):** do NOT change logic/scoring/thresholds on assumption — ASK first with the specific change; only purely-mechanical repairs (broken column/join/dead-link) proceed, and always reported. This batch followed it (asked before threshold/fallback/admin-warning; touched none of the first two).
- **Verification (Claude-side):** classifier `py_compile` clean; merge simulation proves recovery + threshold/fallback preserved; admin change `tsc --noEmit` exit 0. Live OpenAI/news-key run is the Phase-3 gate. If saved is still 0 post-fix, cause is now operational (keys / all-URLs-already-in-DB) and the admin now says so honestly.
- **Handoff:** `ANTIGRAVITY_HANDOFF_news-save-fix.md` (Phase 1 confirm index field + admin return shape; Phase 2 replace classifier + admin page; Phase 3 fetch → expect saved>0 + headlines on gd-briefs + today's-news, amber warning on genuine empty).
- **FIX #2 (2026-06-02, post-deploy):** after the merge fix shipped, news still "saved 0" — but for a NEW reason the admin warning surfaced: Render logs showed `violates check constraint "check_score" (23514)` on rows with `gd_worthiness_score` 85–90. The `news_headlines.check_score` CHECK was defined for the OLD **0–10** scale, but the classifier/prompt/filter are all **0–100** (filter `min_score=75`). Before the merge fix, scores fell to the fallback `5` (passed 0–10 but filtered out by ≥75 → saved 0); after it, real 0–100 scores reach the insert and hit the stale 0–10 ceiling → rejected. The merge fix is confirmed WORKING (20 headlines now pass ≥75, vs 0 before). Fix = widen the constraint to 0–100 (`fix-check-score-scale.sql`, owner-confirmed): `alter table news_headlines drop constraint if exists check_score; add constraint check_score check (gd_worthiness_score between 0 and 100)`. One-time Supabase run; no code change (the 0–100 scale was already the deployed reality). Also noted in logs: `HEAD /health → 405` (an external pinger HEADs /health; harmless — 405 still wakes the server; optional cleanup = allow HEAD on the /health route).
- **Status:** AUTHORED & verified Claude-side, SHIPPED to handoff.
- **NEXT (owner-requested, not yet built):** guesstimate "make it answerable end-to-end" batch — (a) clicking a guesstimate goes to an answer/solve surface (not the read-only `/learn/guesstimates#code` walkthrough the static Practice bank currently links to); (b) wire the already-built guesstimate RUBRIC (§9.29) + arithmetic backstop (§9.30) into the behind-the-scenes scoring/QA for guesstimate-type attempts; (c) generated daily guesstimates land in the guesstimate SECTION so users can practice/catch-up later, with attempted/tick-mark state (owner believes the attempted-state logic already exists — verify the `case_attempts`/first-attempt + Practice `Check`-icon path). To be scoped + asked-through next turn.

### 9.33 Dashboard daily tiles — server-rendered from Supabase for instant paint (AUTHORED, 2026-06-02)
Owner report: the three daily tiles (case/guesstimate/GD brief) sit blank for seconds on dashboard load while the rest of the page is instant. Owner-approved Option A.
- **Cause:** `daily-picks-strip.tsx` is a client component that fetches `fetchDailyToday()` → FastAPI `/daily/today` on Render AFTER hydration (`cache:'no-store'`). Two costs: (1) Render free-tier cold-start (30–60s blank if slept — the §9.31 keep-alive mitigates once running, confirmed deployed), and (2) even warm, a client round-trip to a separate backend vs. the rest of the dashboard which is server-rendered from Supabase. Data already lives in Supabase (`daily_schedule` + `cases` + `news_headlines`), so the Render round-trip for a READ is unnecessary.
- **Fix (READ-path only, owner-approved — no generation/scoring change):** new `lib/daily-server.ts` server-side ports the exact `/daily/today` logic (same `daily_schedule`→`cases`(case+guesstimate by id; guesstimate id lives in `guesstimate_code` per §9.31)→`news_headlines`(`is_star`, newest) queries; same IST date — verified UTC+5:30 boundaries match the backend's `today_ist_date()`). Added to the dashboard page's EXISTING `Promise.all` (no new waterfall) and threaded `initialDaily` through `dashboard-client.tsx` → `DailyPicksStrip`. The strip now renders `initialDaily` instantly with NO loading state / NO client fetch; the `fetchDailyToday()` client path remains ONLY as a fallback when the component is mounted without the prop (keeps it standalone-usable). Never throws — RLS denial/miss → null fields → existing "Browse…" fallback. Built on the **post-§9.31 strip** (guesstimate object + `/cases/{id}` link) so that fix is preserved, not regressed.
- **DB:** `supabase/daily-read-policies.sql` adds authenticated SELECT RLS on `daily_schedule` + `news_headlines` (read-only; `cases` already user-readable; generation stays service-role/backend-only). Idempotent. Must be run once in Supabase or the tiles stay empty (graceful, not an error).
- **Standing-rule compliance:** asked before doing it (owner picked Option A over B/C); this is a read-path/architecture change, explicitly authorized; no scoring/threshold/generation logic touched.
- **Verification (Claude-side):** all 4 frontend files `tsc --noEmit` exit 0 against mirrored repo types; IST date helper boundary-tested vs backend. Live cold-load paint is the Phase-3 gate.
- **Handoff:** `ANTIGRAVITY_HANDOFF_instant-daily-tiles.md` (Phase 1 confirms force-dynamic page + post-§9.31 strip + no existing RLS; Phase 2 add `lib/daily-server.ts`, replace page/client/strip, run RLS SQL; Phase 3 cold-load tiles paint instantly + links resolve + RLS-gate proof).
- **Status:** AUTHORED & verified Claude-side, SHIPPED to handoff. Pending Antigravity build + RLS run. **Files (`/mnt/user-data/outputs/`):** `frontend/optA/lib/daily-server.ts` (→ `lib/`), `frontend/optA/app/dashboard-page.tsx` (→ `app/(app)/dashboard/page.tsx`), `frontend/optA/components/dashboard-client.tsx` (→ `components/`), `frontend/optA/components/dashboard/daily-picks-strip.tsx` (→ `components/dashboard/`), `frontend/optA/supabase/daily-read-policies.sql`, + handoff `.md`.

### 9.34 Guesstimate answerable end-to-end — G1 (solution storage) + G2 (rubric + arithmetic backstop scoring) (AUTHORED, 2026-06-02)
Owner asked to make guesstimates fully answerable (open → answer → evaluate with the rubric/arithmetic we built → solution → tracked). Scoped into 4 sub-batches G1–G4; owner approved **G1+G2 only** this round (reassess before G3/G4), guesstimate scoring on **gpt-4o-mini**. This is the owner-approved scoring-logic change — asked + signed off before building (per the standing rule).
- **Key architecture finding:** the guesstimate rubric + arithmetic backstop existed only as **frontend TypeScript** (`lib/scoring/calc-chain.ts`, `arithmetic-check.ts`, `apply-backstop.ts`) — a **5-dimension** model (scoping .10 / structure .30 / segmentation .25 / arithmetic .15 / sanity .20) built for the Brain-1 evaluator, NOT the live `/submit` path. The live scorer is **backend Python** (`ai_scorer.py` + `scoring_prompt.py`), a **6-dimension**, type-agnostic rubric on gpt-4o. The dashboard's readiness/benchmark read `feedback_json.breakdown` keyed by the 6 `SCORE_DIMENSIONS`. (Reconciliation note: §9.30's "arithmetic backstop integrated live in evaluator" meant the TS/Brain-1 evaluator, not `/submit`.) Owner decisions: **port TS→Python, single backend path**; **separate guesstimate chart on the 5 guesstimate params** (G3, not 6-dim mapped); descriptors my call (cost-aware).
- **G1 — solution storage:** `cases` gains a nullable `solution text` (`add-solution-column.sql`, additive, one-time run). `content_generator.py` (the §9.31 version) now emits a worked `solution` for both the case and the guesstimate and stores it. Results page reveals it after submit.
- **G2 — guesstimate scoring (port + branch):** NEW `services/guesstimate_backstop.py` is a faithful Python port of the three TS modules (weights, TOLERANCE 0.02, caps 0.5/0.35 identical; verified vs hand-computed: clean=arith5, 1 error=3, 2 errors=2, magnitude→cap 0.35, weighted totals 77/83, cap 83→29). NEW `prompts/guesstimate_scoring_prompt.py` makes one gpt-4o-mini call return the 5 rubric dims (1..5) + a transcribed CalcChain + strengths/improvements/summary. `ai_scorer.py` gains `score_guesstimate_answer()` (mini + backstop; `score_case_answer` untouched, still gpt-4o) — the model's own arithmetic score is discarded and the **deterministic backstop overrides it**. `routes/submit.py` branches on `case_type=='guesstimate'`; `SubmissionResponse.breakdown` loosened to `Dict[str,int]` + new `rubric`/`backstop` fields (the 6-dim `FeedbackBreakdown` model removed); `feedback_json` persists the 5-dim + backstop findings (this is what G3's chart will read). `badge_awarder` is `.get(key,0)`-safe with the 5-dim shape (no crash; quant-keyed badges just default 0 for guesstimates — acceptable, noted). Frontend: `lib/constants.ts` gains `GUESSTIMATE_DIMENSIONS`/labels/max=5; `results/[id]/page.tsx` branches on `rubric==='guesstimate'` → renders 5 dims /5 + an "Arithmetic check" findings panel + the "Worked solution" panel.
- **Cost:** guesstimate scoring = ONE gpt-4o-mini call/submission (~10× cheaper than the gpt-4o case scorer; backstop is free/deterministic). Plausible-band magnitude guard is wired but optional and currently OFF (no per-guesstimate band stored yet) — flagged as a later enhancement (G4 can derive a band from the seeded `result`). Static-bank seed (G4) stays ₹0 (reuse curriculum approach+result).
- **Verification (Claude-side):** all backend `py_compile` clean; backstop port hand-verified; end-to-end guesstimate scoring simulated with a mocked LLM (LLM arithmetic 5 → backstop override 3 → score 77, rubric tagged, finding surfaced); frontend results+constants `tsc --noEmit` exit 0. Live gpt-4o-mini run + DB persistence is the Phase-3 gate.
- **Handoff:** `ANTIGRAVITY_HANDOFF_guesstimate-G1-G2.md` (Phase 1 confirm cases cols + §9.31 generator + badge_awarder .get safety; Phase 2 run solution SQL, replace generator/ai_scorer/submit + add backstop/prompt, replace constants/results page; Phase 3 guesstimate submit shows rubric+backstop+override+solution, 6-dim case path unregressed, mini confirmed).
- **Status:** AUTHORED & verified Claude-side, SHIPPED to handoff. Pending Antigravity build + live QA, then reassess G3/G4. **Files (`/mnt/user-data/outputs/mece-daily-fix/`):** `backend/services/{content_generator,guesstimate_backstop,ai_scorer}.py`, `backend/prompts/guesstimate_scoring_prompt.py`, `backend/routes/submit.py`, `frontend/lib/constants.ts`, `frontend/app/results/page.tsx` (→ `app/(app)/results/[id]/page.tsx`), `frontend/supabase/add-solution-column.sql`, + handoff `.md`.
- **REMAINING (owner-approved scope, not yet built):** G3 — separate guesstimate analytics chart on the 5 dims + filter guesstimate attempts out of the 6-dim readiness/benchmark (a `readiness.ts` logic change). G4 — seed static G-01…G-69 into `cases` (type='guesstimate', content=prompt, solution=approach+result, ₹0), repoint Practice→Guesstimates tab from `/learn` to `/cases/{id}`, surface ✓-attempted ticks.

### 9.35 Guesstimate G3 — separate 5-dim analytics + readiness separation (AUTHORED, 2026-06-02)
(G1+G2 from §9.34 are now DEPLOYED — Antigravity confirmed py_compile + tsc + build clean, pushed to main on both repos; `solution` column live.) Owner greenlit G3 with two decisions: guesstimates **fully separated** from the case readiness number + coverage grid; the 5-dim chart lives **on the dashboard** beside the 6-dim case chart.
- **Latent issue G2 created (the real reason G3 matters):** 5-dim guesstimate breakdowns (1..5) now share the `submissions` table with 6-dim case breakdowns (0..25). The dashboard cohort benchmark + `readiness.ts benchmarkBreakdown` read `feedback_json.breakdown` keyed by the 6 case dims, so a guesstimate's `structure` (1..5) was being averaged into case `structure` (0..25) — bounded pollution (only the overlapping key) but wrong and growing. G3 fixes it.
- **The one logic change (owner-approved, asked + signed off):** `lib/readiness.ts` `normalize()` gains a single line — `if (r.case_type === 'guesstimate') continue;` — the single chokepoint that fully removes guesstimates from mastery/coverage/consistency/robustness/dimensions/the readiness number. (Owner chose "fully separate" over "keep counting toward readiness".)
- **Dashboard (`page.tsx`, the Option-A/§9.33 version):** (a) cohort benchmark skips `feedback_json.rubric==='guesstimate'`; (b) `avgScore` + `trajectory` exclude `case_type==='guesstimate'` (extended to these case-performance surfaces for consistency with "fully separate" — flagged to owner); (c) computes a 5-dim guesstimate skills average + count, passed to `DashboardClient`. **Leaderboard/points/rank untouched** — guesstimate scores still earn points as before (owner scoped G3 to readiness+coverage analytics only).
- **New `components/dashboard/guesstimate-skills-chart.tsx`** — presentational 5-dim bars (/5) + empty state. `dashboard-client.tsx` gains `guesstimateSkills`/`guesstimateCount` props and renders a "GUESSTIMATE SKILLS" section (own always-visible row, since a user may have guesstimate attempts before case-readiness is 'scored') beside the 6-dim chart.
- **Verification (Claude-side):** decisive tsc isolation — with an `any` client + relaxed row-inference, the ONLY remaining error is the PRE-EXISTING `.single<UserRow>()` type-arg line (unchanged original; builds in the real generically-typed repo); every G3 addition type-checks clean. Runtime sim confirms readiness excludes guesstimates and the 5-dim aggregate averages over guesstimate subs only (case sub ignored). `npm run build` is the Phase-3 gate.
- **Handoff:** `ANTIGRAVITY_HANDOFF_guesstimate-G3.md` (Phase 1 confirm Option-A dashboard deployed + G2 constants present; Phase 2 replace readiness/page/dashboard-client + add chart; Phase 3 guesstimate panel renders, case analytics decontaminated).
- **Status:** AUTHORED & verified Claude-side, SHIPPED to handoff. Pending Antigravity build. **Files (`/mnt/user-data/outputs/mece-daily-fix/frontend/`):** `lib/readiness.ts`, `app/dashboard/page.tsx` (→ `app/(app)/dashboard/page.tsx`), `components/dashboard-client.tsx`, `components/dashboard/guesstimate-skills-chart.tsx`, + handoff `.md`.
- **REMAINING — G4 (last guesstimate sub-batch, owner-approved scope):** seed static G-01…G-69 into `cases` (type='guesstimate', content=prompt, solution=approach+result; ₹0 — reuse curriculum), repoint Practice→Guesstimates tab from `/learn/guesstimates#code` to `/cases/{id}`, surface ✓-attempted ticks via the existing `attemptedCaseIds` machinery. (Optional enhancement noted: derive a plausible-band from each seeded `result` to switch the backstop's magnitude guard ON for those.)

### 9.36 Guesstimate G4 — seed all 69 answerable + DB-driven Practice tab (AUTHORED, 2026-06-02) — COMPLETES G1–G4
Final guesstimate sub-batch: every guesstimate is now answerable end-to-end. Owner decisions: add a `code` column (over deterministic UUIDs); magnitude-guard band = Claude's call → **left OFF** (needs extra schema beyond the approved `code` column + fragile free-text `result` parsing; the backstop's recompute/base/final checks stay active for all guesstimates).
- **Data source of truth:** the 69 static guesstimates are `d11Guesstimates` in `lib/curriculum/data-advanced.ts`, shape `{ code:'G-01'..'G-69', title, approach, keyDetail?, result }` (the earlier `G-01` with sector/problem was a case-study array reusing the prefix — not a guesstimate). Extracted via Node eval (anchored on `=` to skip the `GuessEntry[]` type's `[]`); all 69 parsed, distinct codes, no missing fields.
- **Schema:** `add-code-column.sql` adds nullable `code text` + partial unique index `cases_code_unique on cases(code) where code is not null` (multiple NULLs allowed → generated/daily cases keep code NULL; coded guesstimates unique → idempotent seed). Additive, non-destructive.
- **Seed (`seed-guesstimates.sql`, ₹0 AI):** 69 `cases` rows — type='guesstimate', difficulty='medium' (GuessEntry has no difficulty — defaulted + flagged), content = a prompt built from the title ("Estimate: {title} … state assumptions, top-down/bottom-up, segment, point estimate, sanity-check"), hint=NULL (approach withheld pre-attempt), **solution = approach + keyDetail + result (reused curriculum → no generation)**, code='G-xx'. `on conflict (code) do nothing`. VALIDATED in sqlite: 69 rows, re-run idempotent (no dupes), real UTF-8 (₹/→ literal, NO `\uXXXX` per the §9.14 rule).
- **Frontend (`practice-hub.tsx`):** the Practice page already queries `cases.select('*')`, so seeded guesstimates arrive automatically. Scored tab now excludes `type==='guesstimate'` (no double-listing); **Guesstimates tab is DB-driven** (`cases.filter(type==='guesstimate')` → the 69 + any AI dailies), each card links to `/cases/{id}` (Solve/Retry), shows ✓-attempted via the existing `attemptedCaseIds`, and keeps a Walkthrough link to `/learn/guesstimates#{code}` when code present; answer (approach/result) no longer revealed pre-attempt. Unused `ALL_GUESSTIMATES` static source removed (the `/learn/guesstimates` page itself unchanged). `CaseRow` gains optional `solution`+`code`.
- **Verification (Claude-side):** seed SQL validated in sqlite (parse + 69 rows + idempotent + UTF-8); `practice-hub.tsx` + `types.ts` `tsc --noEmit` exit 0 under **real react@18 + @types/react@18** (decisive — earlier stub errors were all pre-existing TabButton/event/pagination lines from missing @types/react, none on G4 edits). `npm run build` is the Phase-3 gate.
- **Handoff:** `ANTIGRAVITY_HANDOFF_guesstimate-G4.md` (Phase 1 confirm solution col + practice query + deployed hub; Phase 2 run add-code-column.sql → seed-guesstimates.sql, replace types + practice-hub; Phase 3 count=69 + idempotent + answerable + ticks + scored-tab de-dup).
- **Status:** AUTHORED & verified Claude-side, SHIPPED to handoff. Pending Antigravity build + 2 SQL runs. **GUESSTIMATE ANSWERABLE END-TO-END (G1–G4) COMPLETE on the authoring side.** **Files (`/mnt/user-data/outputs/mece-daily-fix/frontend/`):** `supabase/add-code-column.sql`, `supabase/seed-guesstimates.sql`, `components/practice-hub.tsx`, `lib/types.ts`, + handoff `.md`.
- **FIX (2026-06-02, post-handoff):** first run of `seed-guesstimates.sql` hit Postgres `42P10` (no unique/exclusion constraint matching the ON CONFLICT spec) — the migration's unique index was PARTIAL (`where code is not null`), which `ON CONFLICT (code)` cannot infer unless the predicate is repeated. Corrected `add-code-column.sql` to a FULL unique index (`create unique index cases_code_unique on cases(code)`, dropping any prior partial index first). A full unique index still allows multiple NULL codes in Postgres, so generated/daily cases are unaffected. Seed unchanged; re-validated in sqlite (69 rows, multiple NULLs OK, idempotent). Action: re-run the corrected migration, then the seed.
- **Deferred enhancement (logged):** backstop magnitude guard — add a `band_low/band_high` (or jsonb) to cases, derive from each seeded `result` + have the daily generator emit one, then pass `band` into `apply_backstop` so wildly-wrong-magnitude answers get capped. Currently OFF.

### 9.37 Guesstimate backstop — false "all-zero" arithmetic fix (AUTHORED, 2026-06-02)
User hit it live: a well-structured Bengaluru e-rickshaw guesstimate scored 71 with **arithmetic 1/5** and four bogus "recomputes to 0" findings. Owner approved the fix + the model-score fallback + the prompt tightening (all asked first; scoring-logic change).
- **Root cause (bug in the §9.34 Python port):** the model transcribes base assumptions as `literal` steps with the number only in `claimedValue` (empty `inputs`). Old code computed an empty-input literal as **0** (`first = inputs[0] if inputs else 0`); that 0 cascaded through every downstream `multiply`/`percent_of` → whole chain recomputes to 0 → 4 false findings → arithmetic forced to 1/5. Reproduced exactly. Also a latent crash: `percent_of` with a `#ref` as the percentage threw (uncaught).
- **Fix — `services/guesstimate_backstop.py` (rewritten, owner-approved):** (1) `literal`/base steps use their stated value (numeric input if present else `claimedValue`), never 0 — assumptions are never flagged; (2) a step is flagged ONLY if it's a derived op whose inputs ALL resolve to finite numbers AND the recompute genuinely disagrees — unreconstructable steps are marked `verifiable=False` and skipped (never invented as errors); (3) `percent_of` handles "12%"/0.12/12/`#ref` and commas without crashing; (4) if NOTHING is verifiable, `arithmeticScore=None` → `apply_backstop` keeps the LLM's own arithmetic read (no override) — owner's "no bad/average UX" call (fairest: no false penalty, no fake 5, no neutral 3); (5) added `verifiableCount`. Weights/tolerance/caps unchanged.
- **Fix — `prompts/guesstimate_scoring_prompt.py` (tightened transcription contract):** base assumptions as `literal` with the number in BOTH `inputs` and `claimedValue`; derived inputs only numbers/`#refs`; `percent_of` = ["12%","#baseId"]; plain numbers (no commas/units); `finalValue` must equal `finalRef`'s computation, scenario blends/averages must be explicit steps with `finalRef` on the blended step. Reduces false `final_mismatch` at the source.
- **Blast radius:** 2 files only. `score_guesstimate_answer`/`submit.py`/frontend unchanged — verified the consumer reads the same return keys (`total/dimensions/arithmeticOverridden/rawTotal` + `backstop.findings/summary/notChecked/totalCapFactor`), all still present.
- **Verification (Claude-side):** user's exact chain now → 1 legitimate finding (stated final 25K vs base-scenario 24K, a real blend gap) instead of 4 false ones; arithmetic 1→3, total 71→77 (and →5/83 once the tightened prompt makes the model transcribe the blend). percent-ref crash gone. Regressions hold (clean=5, 1err=3, 2err=2). Fully-unverifiable chain → defers to LLM arithmetic (no override). All `py_compile` clean.
- **Handoff:** `ANTIGRAVITY_HANDOFF_backstop-fix.md` (Phase 1 confirm ai_scorer key compatibility; Phase 2 replace the 2 files; Phase 3 re-submit → no false zeros, real slips still caught, no percent-ref 500).
- **Status:** AUTHORED & verified Claude-side, SHIPPED to handoff. Pending Antigravity build. **Files (`/mnt/user-data/outputs/mece-daily-fix/backend/`):** `services/guesstimate_backstop.py`, `prompts/guesstimate_scoring_prompt.py`, + handoff `.md`.

### 9.38 Guesstimates section made REAL and promoted to position B (IN TREE, 2026-06-06)
Captured from the latest `company-main` upload. The Guesstimates area went from a stub (one real page + nine auto-generated placeholders, sitting last in the Casebook) to a real, prioritized section with a proper on-ramp.
- **New content page — `lib/casebook/content/guesstimates/pain-and-promise.ts` (239 lines, `kind:"framework"`).** Title "The Pain & The Promise" (`titleEmphasize:"Promise"`), subtitle "Why most candidates lose this case before they touch a number.", `meta.readingTimeMin:9`, tags `["guesstimates","overview","scoring","rubric"]`, `caseType:"market sizing"`. It is the section on-ramp: opens with a `hook` (the ₹4,000 cr premium-dark-chocolate over-estimate vs India's ~₹15,000 cr total — order-of-magnitude failure), then states the **graded rubric explicitly** as a `table`: Structure & Approach 30%, Segmentation & Assumptions 25%, Sanity Check & Triangulation 20%, Arithmetic & Unit Discipline 15%, Scoping & Clarification 10% — i.e. arithmetic is only 15% of the score. Names the three flavours and the 90-second spine the rest of the section expands. Schema-clean to the §9.19 contract (`titleEmphasize`, NO `subtitleEmphasize`; hook/heading/prose/table blocks; literal `₹` UTF-8, no `\uXXXX`).
- **Registration — `lib/casebook/content/index.ts`.** Added `import { painAndPromise } from './guesstimates/pain-and-promise'` and registered `[painAndPromise.slug]: painAndPromise` in the page map. (`ev-charging-points-metro` was already registered.)
- **Tree reorder — `lib/casebook/tree.ts`.** Guesstimates moved from the **last** section ("F · Guesstimates") to **second** ("B · Guesstimates", `kind:'section'`, `icon:'Calculator'`, **`defaultOpen:true`**), now listing exactly the two real pages: `guesstimates/pain-and-promise` and `guesstimates/ev-charging-points-metro` (meta difficulty `moderate`). Everything below shifted one letter: **C · Core Frameworks, D · Misc. Frameworks, E · Toolkit, F · Cases.** The old auto-generated placeholder block — `...Array.from({length:9}).map((_,i)=>({title:`Guesstimate ${i+2}`, slug:`guesstimates/guesstimate-${i+2}`}))` — was **DELETED** (those nine slugs had no content page and were dead nav nodes).
- **RECONCILIATION (supersedes header/§0 lettering):** the Casebook section letters are now A · Getting Started → **B · Guesstimates** → C · Core Frameworks → D · Misc. Frameworks → E · Toolkit → F · Cases. Any earlier reference to "B · Core Frameworks" or "F · Guesstimates" or "Section G · Miscellaneous" is a point-in-time snapshot; this ordering is authoritative.
- **Blast radius:** 3 files (`content/index.ts`, `tree.ts`, new `pain-and-promise.ts`). Touches **Casebook-Page-schema (C3)** as a consumer only (no schema change). Build-time route count changes: **+1 real route** (`pain-and-promise`) and **−9 dead placeholder nodes**; net authoritative count is whatever `npm run build` reports — confirm on build (the doc's standing rule).
- **Status:** IN TREE (latest upload). `npm run build` is the gate (verify the page renders, the 9 placeholder routes are gone, and Guesstimates renders second + open).

### 9.39 Case solve page unified into one workspace surface (IN TREE, 2026-06-06)
`app/(app)/cases/[id]/page.tsx` + `components/solve/ConversationalSolve.tsx`. Previously the page had two divergent full-page renders (a separate upgrade/lock page vs. the workspace, with attempts/rating in a section *below* the workspace). It is now a **single surface**: the server page composes the pieces and hands them to `ConversationalSolve`, which owns the whole layout.
- **New `ConversationalSolve` props (signature `({ caseId, initialCase, historyPanel, lockedOverlay })`, file 463→558 lines):**
  - `initialCase: { title, content, type, difficulty, hint }` — passed from the server component so the workspace paints **instantly** with no client re-fetch; `caseDetail` state is seeded from it (`useState<...>(initialCase)`).
  - `historyPanel?: React.ReactNode` — the server pre-renders either (a) "Your previous attempts" → `<CaseAttemptHistory>` + `<CaseRatingPrompt>` when `hasAttempted`, or (b) a dashed empty-state ("You haven't attempted this case yet…"). Rendered **inside** the solve layout (around line 280) instead of a separate `<section>` below.
  - `lockedOverlay?: React.ReactNode` — the upgrade/lock `<Card>` (Lock icon, `lockTitle`/`lockBody`/`lockCta` → `/upgrade`), now styled as a **shadow overlay** (`max-w-sm shadow-2xl border-primary/20`) layered on the workspace rather than replacing the page.
- **Locked-path behavior:** `loading` initialises to `!lockedOverlay`; when locked the component **does not fetch the attempt detail or start an attempt** (`if (lockedOverlay) return;` in the effect), and the loading spinner is suppressed (`if (loading && !lockedOverlay)`). The workspace chrome still renders with the lock card over it.
- **Why:** removes the duplicated page render, eliminates a redundant client fetch (faster first paint via `initialCase`), and makes lock/history first-class parts of one consistent layout.
- **Blast radius:** 2 files. No schema/contract change — reads the existing `caseRow` shape (`title/content/type/difficulty/hint`) and the existing attempts/rating components. Touches **DB:`cases` (C1)** as a reader only.
- **Status:** IN TREE (latest upload). Gate: `tsc --noEmit` (new `Props` interface) + `npm run build`; manual check of all three paths — fresh (empty-state history), attempted (history + rating inside), and locked (overlay, no fetch).

### 9.40 Casebook nav-tree — sessionStorage-persistent expand/collapse (IN TREE, 2026-06-06)
`components/casebook/nav-tree.tsx`. The nav tree now remembers which sections you opened as you move between Casebook pages within a session.
- **Change:** `isOpen` no longer initialises from `node.defaultOpen`; it initialises to `node.title === 'Getting Started'` (only that section auto-opens on a cold load). A first `useEffect` reads `sessionStorage.getItem('nav_tree_' + node.title)` on mount and, if present, restores the saved open/closed state; a second `useEffect` writes `String(isOpen)` back on every change. An `isMounted` flag gates the write so the **server/client first render matches** (no hydration mismatch) — reads/writes only happen after mount.
- **Note vs §9.38:** the tree's `defaultOpen:true` on the new Guesstimates node still sets the *cold-load* default for that section via its own logic; `nav_tree_*` then overrides per user interaction for the rest of the session. (If desired, reconcile so `defaultOpen` and the `'Getting Started'`-only initializer agree — currently Guesstimates relies on saved state after first interaction.)
- **Blast radius:** 1 file, presentational/state only. No contract impact.
- **Status:** IN TREE. Gate: `npm run build`; verify no hydration warning in console, and that toggling a section then navigating preserves its state within the tab session (and resets on a new tab).

### 9.41 Attempt-history persistence + Practice-hub badge polish (IN TREE, 2026-06-06)
Two UX refinements in the same upload.
- **`components/case-attempt-history.tsx`:** the expanded-accordion state now persists to `sessionStorage` under key `expanded_attempt` (mirrors the §9.40 pattern: mount-read effect + write effect, `isMounted` hydration guard). Default changed from "first attempt open" (`attempts[0]?.id`) to **collapsed** (`null`). Each attempt's long answer is now wrapped in a `max-h-[35vh] overflow-y-auto` scroll container so a long submission no longer pushes the page; the per-attempt header restyled from mono `#N` to bold `Attempt N` (`text-small font-semibold tabular-nums`).
- **`components/practice-hub.tsx`:** the "Attempted" indicator was restyled and **relocated** — it is now a bold success pill (`text-success bg-success/15 … uppercase tracking-widest` with a `<Check>` icon) sitting in a flex row **next to the difficulty chip** at the top of each case card (removed from its old mid-card position); the scored-card attempted marker was likewise upgraded from `text-green-600` to the same `text-success` pill treatment. Purely visual — the `attemptedCaseIds.includes(c.id)` logic is unchanged.
- **Blast radius:** 2 files, presentational/state only. No data or contract change.
- **Status:** IN TREE. Gate: `npm run build`; verify accordion state survives navigation within a session, long answers scroll inside the card, and Attempted pills render in the new position on both the scored and guesstimate tabs.

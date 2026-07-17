# LEDGER — who owns what, and what it depends on

One row per feature. `depends_on` is the whole point: if a feature you depend on
gets a `BREAKING` change in CHANGELOG, re-sync before you touch yours.
Antigravity updates the **Status** column when it lands a handoff. Brains may
propose a new row via handoff but do not edit others' rows.

*(2026-07-17 housekeeping, Cowork brain: the Brain-C block was listed twice — once
with broken `pp/(app)` paths — and several rows had drifted below the collision-watch
section. Deduplicated and consolidated into the single table below; no row deleted.)*

| Feature | Owner brain | Branch | Status | Owns (files/areas) | depends_on |
|---|---|---|---|---|---|
| **Dashboard** | A | feat/dashboard | **Wired to live data + perf + mobile + dark-mode BUILT & LIVE (2026-06-08)** | `components/dashboard/*`, `lib/readiness.ts`, `lib/next-action.ts`, `lib/personal-stats.ts`, `components/dashboard-client.tsx` | DB:`cases`/`attempts`, Scoring-contract (reads `total`/`dimensions`) |
| **Casebook** | C | feat/casebook | Core+Toolkit BUILT; Misc BUILT; **Guesstimates section real + promoted to B, Pain&Promise page (§9.38), method modules (P2-4) BUILT; P5 cheat sheet + P6 worked solve pending; clarifying-question dropdowns on all 52 worked examples BUILT; MECE page added as first Core Framework (2026-06-20)** | `lib/casebook/*`, `components/casebook/*`, `lib/casebook/content/**` | Casebook-Page-schema (C3) |
| **Case solve UX** | A | feat/solve | **BUILT; free-tier clarification-counter fix 2026-06-20; practice-hub domains + read-only deep-links removed 2026-06-21** (unified workspace §9.39–9.41) | `app/(app)/cases/[id]/page.tsx`, `components/solve/*`, `components/case-attempt-history.tsx`, `components/practice-hub.tsx`, `components/casebook/nav-tree.tsx` | DB:`cases` (reader), Scoring-contract (reader) |
| **Guesstimate end-to-end** | B | feat/guesstimate | **BUILT & LIVE** (verified 2026-06-06) | `components/practice-hub.tsx`, `supabase/migrations/0001_baseline_schema.sql`, `lib/types.ts` | DB:`cases`, Scoring-contract |
| **Scoring backstop** | B | feat/guesstimate | **BUILT & LIVE** (verified 2026-06-06) | `services/guesstimate_backstop.py`, `prompts/guesstimate_scoring_prompt.py` | Scoring-contract (must keep return keys) |
| **Daily content + admin + keep-alive** | B | feat/daily | **BUILT** (daily scheduler live) | `services/content_generator.py`, `services/daily_scheduler.py`, `routes/daily.py`, `routes/cron.py`, `.github/workflows/*`, `app/(app)/admin/*` | DB:`cases`, API-contract (C4) |
| **News pipeline** | B | feat/daily | **BUILT** (self-heal live) | `services/news_fetcher.py`, `services/headline_classifier.py`, `routes/news.py` | API-contract (C4) |
| **Voice + image input** | B | feat/io | **BUILT** | `routes/transcribe.py`, `routes/vision.py`, `components/{dictation,camera}-button.tsx` | API-contract (C4) |
| **Payments (Razorpay + audit trail)** | B | feat/payments | **BUILT; annual dropped 2026-06-20 (2901f0b); optional server-validated coupon path added 2026-07-17 (C7)** | `app/api/razorpay/{order,verify,webhook}/route.ts`, `lib/tier.ts` (pricing + `discountedPaise`) | DB:`payments`/`users`, **C7 coupons** |
| **Rate limiting** | B | feat/backend | **BUILT** | `services/rate_limit.py`, `routes/attempts.py` | — |
| **AI evaluation v2** | B | feat/eval | **BUILT** | `services/ai_scorer.py`, `services/interview_engine.py`, `prompts/*`, `routes/submit.py` | Scoring-contract (this feature DEFINES it) |
| **Deck Vault & DRM (library)** | A | feat/deck-vault | **BUILT & SECURED** (react-pdf + blackout + watermark); **now also receives auto-published rows from Deck Vault Rewards approvals (2026-07-17)** | `app/(app)/skeletons/*`, `components/pdf-viewer.tsx`, `components/skeleton-library.tsx`, `lib/google-drive.ts`, `app/api/skeletons/*` | Payments-contract ('pro' tier), **C8 storage paths** |
| **Deck Vault Rewards** | Cowork | (landed direct-to-main) | **BUILT & LANDED 2026-07-17** (849a0dc, 47764c2, 1f49694 + backend 41a5f50, 6a7f496; one pending commit: Drive file_type fix). **Deploy blocked — see STATE blockers** | backend `routes/deck_vault.py`, `services/{gdrive,telegram_notify}.py`; frontend `app/(app)/deck-vault/*`, `app/(app)/admin/deck-vault/*`, `app/api/coupons/*`, `app/api/admin/deck-vault/*`, `components/deck-vault/*`, `lib/deck-vault-api.ts`, `supabase/migrations/0041_deck_vault_rewards.sql` | **C7** (defines), **C8** (co-defines), Payments, DB:`users` (tier), Telegram + Google Drive env |
| **GD Cheat Sheet (Pro)** | B | feat/cheatsheet | **BUILT** | `app/(app)/cheat-sheet/*`, `components/cheat-sheet/*`, `lib/cheatsheet.ts`, `app/api/cheatsheet/*`, `supabase/migrations/0003_cheat_sheet.sql` | DB:`users` (tier read), GD-briefs `data_points` shape (reader), Tier infra |
| **Onboarding & Profile** | A | feat/onboarding | **BUILT & LIVE (2026-06-08)** | `app/(app)/onboarding/*`, `app/(app)/profile/*`, `components/onboarding/*`, `components/profile/*`, `app/api/onboarding/*`, `app/api/college-email/*`, `lib/types-onboarding.ts`, `supabase/migrations/0005_user_onboarding.sql` | C6 users-schema, DB:`colleges`/`college_email_verifications`, Storage `avatars`, Supabase Auth SMTP |
| **Industry Primers** | A | feat/industry-primers | **BUILT (20 primers); full-screen overlay + native fullscreen + collapsible nav (2026-06-20)** | `public/primers/**`, `app/(app)/learn/industry-primers/**`, `lib/primers/*` | Casebook-tree |
| **Auth** | C | feat/auth | **BUILT (LinkedIn OIDC added)** | `components/auth-form.tsx` | — |
| **Onboarding (LinkedIn prefill)** | C | feat/auth | **BUILT (LinkedIn prefill + connected hint)** | `app/(app)/onboarding/page.tsx`, `components/onboarding/onboarding-form.tsx` | Auth |
| **Admin** | C | feat/admin | **BUILT (Status page, Delete User; Deck Rewards section added 2026-07-17)** | `app/(app)/admin/*`, `components/admin/*` | DB:`users`, API |
| **GD Briefs** | C | feat/gd | **BUILT (Abstract GD track + shared library, domains added)** | `app/(app)/gd-briefs/*`, `lib/abstract-gd.ts`, `app/api/abstract-briefs/*` | News pipeline |
| **Leaderboard** | C | feat/leaderboard | **BUILT (college + LinkedIn opt-out, logo updated)** | `components/leaderboard/*`, `lib/dashboard/leaderboards.ts` | DB:`users` |
| **Endorsements** | C | feat/endorsements | **BUILT** | `supabase/migrations/0019_endorsements.sql`, `app/(app)/admin/endorsements/*`, `components/endorsements-section.tsx` | — |
| **Colleges** | C | feat/db | **BUILT (0020 refreshed tiers)** | `supabase/migrations/0020_colleges_refresh.sql` | — |
| **Resume Lab / CV Pointer Lab** | C | feat/resume | **BUILT (v1 Builder, AI rebuild/refine/generate/fit, strict char-band, print-to-PDF); prompt policy fix 2026-07-17 (7adc9d2): placeholders-not-questions, impact-first** | `app/(app)/resume/*`, `components/resume/*`, `lib/resume/*`, backend `services/resume_ai.py`, `routes/resume.py`, `supabase/migrations/0023_resumes.sql` | DB:`resumes`, API, feature_trials (free-tier gate) |
| **Feedback & flagging** | C | feat/feedback | landed | `app/api/feedback/*`, `components/feedback/*`, `app/(app)/admin/feedback/*`, `lib/feedback.ts`, `supabase/migrations/0011_feedback.sql` | C4 API-contract (additive), DB:`users` (FK, read) |
| **Testimonials + Admin** | C | feat/testimonials-admin | **BUILT** | `components/testimonials-carousel.tsx`, `app/(app)/admin/testimonials/*`, `app/api/admin/testimonials/*` | — |
| **Engaging Loading** | C | feat/engaging-loading | landed | `lib/loading-content.ts`, `components/engaging-loader.tsx`, `components/solve/ConversationalSolve.tsx` | UI-only |
| **UI Batch 2** | C | feat/ui-batch-2 | landed | `components/draggable-fab.tsx`, `components/solve/ConversationalSolve.tsx`, `components/testimonials-carousel.tsx` | UI-only |
| **Mobile Polish** | C | feat/mobile-polish | landed | `components/pricing-plans.tsx`, `components/mobile-bottom-nav.tsx`, `app/globals.css` | UI-only |
| **Legal/static pages** | (shared) | feat/legal-refund | Refund contrast fix + policy update (privacy/terms live). **Deck Vault Rewards T&C awaits legal review (2026-07-17)** | `app/privacy`, `app/terms`, `app/refund`, `/deck-vault` T&C constant | — |
| **Input size limits** | B | feat/input-limits | BUILT (answer/question/recommendation max 20k) | `lib/limits.ts`, `services/limits.py`, `routes/submit.py`, `submission-form.tsx`, `routes/attempts.py`, `ConversationalSolve.tsx` | C4 |
| **Dynamic domains (case_tags)** | B | feat/dynamic-domains | DB BUILT (migration verified); UI pending | `supabase/migrations/0013_case_tags.sql`, `lib/types.ts`, `lib/limits.ts` | DB:`users`/`cases` (FK, read-only) |
| **Landing (hero demo + vignettes + ISR)** | C | feat/landing | **BUILT (2026-07-10/14)** | `components/hero-interview-demo.tsx`, `components/landing-vignettes.tsx`, `app/page.tsx` | UI-only |
| **Free-tier rework** | C+B | feat/free-tier | **BUILT frontend (c96e952) + backend (f254eba)**; LinkedIn-follow perk (0040) live | `lib/{tier,access}.ts`, `services/access_guard.py`, `supabase/migrations/{0038,0040}*.sql` | TIER surface (cross-repo) |

## Collision watch (features that touch the same surface)
- **DB:`cases`** is touched by Dashboard, Guesstimate, and Daily-content → any
  column add is a contract event; announce in CHANGELOG with `affects:` all three.
- **Scoring-contract** is DEFINED by AI-evaluation-v2 and CONSUMED by Dashboard,
  Guesstimate, Backstop → eval-v2 changing return keys = `BREAKING`, affects all.
- **Razorpay routes** are owned by Payments (B) but now carry the C7 coupon path
  co-owned by Deck Vault Rewards (Cowork) → any change to order/verify/webhook must
  keep `discountedPaise()` agreement and the coupon redemption semantics.
- **`gdrive:` storage convention (C8)** is shared by Deck Vault library (A) and
  Deck Vault Rewards (Cowork), in BOTH repos (`lib/google-drive.ts` ↔
  `services/gdrive.py`) → change one, change both, same commit train.
- **`deck_skeletons`** is written by the admin uploader AND by Rewards
  auto-publish → schema/enum changes affect both.

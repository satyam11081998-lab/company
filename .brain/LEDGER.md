# LEDGER — who owns what, and what it depends on

One row per feature. `depends_on` is the whole point: if a feature you depend on
gets a `BREAKING` change in CHANGELOG, re-sync before you touch yours.
Antigravity updates the **Status** column when it lands a handoff. Brains may
propose a new row via handoff but do not edit others' rows.

| Feature | Owner brain | Branch | Status | Owns (files/areas) | depends_on |
|---|---|---|---|---|---|
| **Dashboard** | A | feat/dashboard | **Wired to live data + perf + mobile + dark-mode BUILT & LIVE (2026-06-08)** | `components/dashboard/*`, `lib/readiness.ts`, `lib/next-action.ts`, `lib/personal-stats.ts`, `components/dashboard-client.tsx` | DB:`cases`/`attempts`, Scoring-contract (reads `total`/`dimensions`) |
| **Casebook** | C | feat/casebook | Core+Toolkit BUILT; Misc BUILT; **Guesstimates section real + promoted to B, new Pain&Promise page (§9.38, in tree)** | `lib/casebook/*`, `components/casebook/*`, `lib/casebook/content/**` | Casebook-Page-schema |
| **Case solve UX** | A | feat/solve | **BUILT** (Unified workspace — initialCase/historyPanel/lockedOverlay + sessionStorage nav/history persistence (§9.39–9.41, in tree)) | `app/(app)/cases/[id]/page.tsx`, `components/solve/*`, `components/case-attempt-history.tsx`, `components/practice-hub.tsx`, `components/casebook/nav-tree.tsx` | DB:`cases` (reader), Scoring-contract (reader) |
| **Guesstimate end-to-end** | B | feat/guesstimate | **BUILT & LIVE** (verified 2026-06-06: practice-hub DB-driven, `code`+FULL index in `0001_baseline`) | `components/practice-hub.tsx`, `supabase/migrations/0001_baseline_schema.sql`, `lib/types.ts` | DB:`cases`, Scoring-contract |
| **Scoring backstop** | B | feat/guesstimate | **BUILT & LIVE** (verified 2026-06-06: hardening present in `guesstimate_backstop.py`) | `services/guesstimate_backstop.py`, `prompts/guesstimate_scoring_prompt.py` | Scoring-contract (must keep return keys) |
| **Daily content + admin + keep-alive** | B | feat/daily | **BUILT** (reconciled 2026-06-06) | `services/content_generator.py`, `services/daily_scheduler.py`, `routes/daily.py`, `routes/cron.py`, `.github/workflows/*`, `app/(app)/admin/*` | DB:`cases`, API-contract |
| **News pipeline** | B | feat/daily | **BUILT** | `services/news_fetcher.py`, `services/headline_classifier.py`, `routes/news.py` | API-contract |
| **Voice + image input** | B | feat/io | **BUILT** | `routes/transcribe.py`, `routes/vision.py`, `components/{dictation,camera}-button.tsx` | API-contract |
| **Payments (Razorpay + audit trail)** | B | feat/payments | **BUILT** | `app/api/razorpay/{order,verify,webhook}/route.ts` | DB:`payments`/`users` |
| **Rate limiting** | B | feat/backend | **BUILT** | `services/rate_limit.py`, `routes/attempts.py` | — |
| **AI evaluation v2** | B | feat/eval | **BUILT** | `services/ai_scorer.py`, `services/interview_engine.py`, `prompts/*`, `routes/submit.py` | Scoring-contract (this feature DEFINES it) |
| **Deck Vault & DRM** | A | feat/deck-vault | **BUILT & SECURED** (react-pdf + blackout + watermark) | `app/(app)/skeletons/*`, `components/pdf-viewer.tsx`, `components/skeleton-library.tsx`, `lib/google-drive.ts` | Payments-contract (needs 'pro' tier) |
| **GD Cheat Sheet (Pro)** | B | feat/cheatsheet | **BUILT** | `app/(app)/cheat-sheet/*`, `components/cheat-sheet/*`, `lib/cheatsheet.ts`, `app/api/cheatsheet/*`, `supabase/migrations/0003_cheat_sheet.sql` | DB:`users` (tier read), GD-briefs `data_points` shape (reader), Tier infra |
| **Onboarding & Profile** | A | feat/onboarding | **BUILT & LIVE (2026-06-08)** | `app/(app)/onboarding/*`, `app/(app)/profile/*`, `components/onboarding/*`, `components/profile/*`, `app/api/onboarding/*`, `app/api/college-email/*`, `lib/types-onboarding.ts`, `supabase/migrations/0005_user_onboarding.sql` | C6 users-schema, DB:`colleges`/`college_email_verifications`, Supabase Storage `avatars` bucket, Supabase Auth SMTP |
| **Industry Primers** | A | feat/industry-primers | **BUILT (16 primers)** | `public/primers/**`, `app/(app)/learn/industry-primers/**`, `lib/primers/*` | Casebook-tree |

## Collision watch (features that touch the same surface)
- **DB:`cases`** is touched by Dashboard, Guesstimate, and Daily-content → any
  column add is a contract event; announce in CHANGELOG with `affects:` all three.
- **Scoring-contract** is DEFINED by AI-evaluation-v2 and CONSUMED by Dashboard,
  Guesstimate, Backstop → eval-v2 changing return keys = `BREAKING`, affects all.

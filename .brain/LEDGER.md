# LEDGER — features, owners, and what they depend on

One row per feature. `depends_on` is the point: if a feature you depend on gets a `BREAKING` change in
CHANGELOG, re-read the contract before you touch yours. `sync.mjs` mirrors the first four columns into STATE.md.

*(2026-10-06 rewrite: the table had not been updated since 2026-09-12 and was missing the US launch, Interview
Intelligence, Prep Copilot v2, broadcasts, guest mode, voice, daily blog and more. Statuses below are verified against
`main` @ 1dcc819 / 9f71870 and the live site. Owner letters A/B/C/Cowork are historical; any brain may now work any
lane, one profile at a time. Full detail lives in PROJECT_BRAIN.md §16.)*

| Feature | Owner brain | Branch | Status | Owns (files/areas) | depends_on |
|---|---|---|---|---|---|
| **Case interviewer (text, V12)** | any | main | **LIVE** — V12 response functions; interviewer on gpt-4o-mini via admin override (2026-10-01) | backend `services/{interview_engine,interviewer_decision,session_signals,interviewer_mode,clarification_counter}.py`, `prompts/interview_prompts_v2.py`, `routes/attempts.py`; frontend `components/solve/ConversationalSolve.tsx`, `lib/interview-api.ts` | C9, C2, AI provider router |
| **Unified interviewer brain** | any | feat/unified-interviewer-brain | **IN PROGRESS** — both repos, behind `INTERVIEWER_BRAIN` (default off), last commit 2026-10-01, not merged | branch only | Case interviewer, Voice |
| **Scoring (holistic + backstop + figures + exemplars)** | any | main | **LIVE**; exemplar bank DORMANT until `migrations/2026-09-12_case_exemplars.sql` runs and entries are approved | `services/{ai_scorer,answer_validity,guesstimate_backstop,case_figures,exemplar_bank}.py`, `prompts/{scoring_prompt,guesstimate_scoring_prompt}.py`, `lib/scoring/*`, `app/(app)/results/[id]` | C2 (defines), DB `submissions`/`case_figures` |
| **Learning model / skill profile** | any | main | **BETA** — data written; coached UI controls flag-gated (migrations 0066–0068) | `services/learning_model.py`, `user_skill_profile` | Scoring |
| **Voice (dictation + live voice)** | any | main | **LIVE** — Gemini Live / OpenAI Realtime / pipeline; free trial 14 min (7 per case) since 2026-10-03; `lib/constants.ts` "voice OFF" comment is stale | backend `routes/{transcribe,speak,realtime,realtime_gemini,voice_coach}.py`, `services/{ai_usage,realtime_credits,voice_coach}.py`, `prompts/voice_*`; frontend `components/solve/Voice*.tsx`, `lib/voice/*` | Case interviewer, C9, Payments (credits) |
| **Dashboard** | A | main | **LIVE** — India top section (2026-09-30), US v3 dashboard (2026-09-27), constellation, ladder, heatmap | `components/dashboard/*`, `lib/dashboard/*`, `lib/readiness.ts`, `lib/next-action.ts` | DB `cases`/`submissions`, C2 |
| **Practice hub + daily pair** | B | main | **LIVE** — ~420 India items; loads all rows client-side (perf issue) | `app/(app)/practice/page.tsx`, `components/practice-hub.tsx`, `services/{content_generator,daily_scheduler,access_guard}.py`, `routes/{daily,cron}.py` | C1, Markets |
| **Leaderboards** | C | main | **LIVE, ISSUE** — 17 restored rows with estimated solves; copy bug | `lib/dashboard/leaderboards.ts`, `components/leaderboard/*`, `SEED_LEADERBOARD.sql` | DB `users` |
| **Casebook / primers / competitions / Data Atlas / glossary** | C | main | **LIVE** — 110 content files, 27 primers, 10 competition chapters, 75 terms | `lib/casebook/*`, `lib/primers`, `lib/glossary`, `app/(app)/learn/*` | C3, C5 |
| **GD (news briefs, Topic Radar, Abstract GD)** | C | main | **LIVE, ISSUE** — feed irregular and status probe says Down; Radar hand-curated with hard-coded "today"; Abstract library empty | `routes/news.py`, `services/{news_fetcher,news_pipeline,headline_classifier,brief_generator,abstract_gd_generator}.py`, `lib/gd-topics.ts`, `lib/abstract-gd.ts`, `app/(app)/gd-briefs/*` | AI router (Gemini) |
| **US & Europe market** | any | main | **LIVE** since 2026-09-25 — USD/EUR, region lock, US bank 57+57, per-market daily, US learn/SEO | `lib/market*.ts`, `lib/pricing-intl.ts`, `lib/us-market/*`, `lib/us-learn/*`, `app/us/*`, `services/markets.py`, migration 0070 | Payments, Practice |
| **Payments (Razorpay) + coupons** | B | main | **LIVE** — Free/Lite ₹299/Pro ₹599 (Lite restored 2026-10-05); quarter plans; coupons C7 v2; INR-with-foreign-card refund | `app/api/razorpay/*`, `lib/{tier,billing,coupons,payments-region,revenue}.ts`, `app/(app)/upgrade/*`, `app/pricing` | C7, C9 copy, DB `payments`/`users` |
| **Auth, onboarding, guest mode, session lock** | C | main | **LIVE** — email/Google/LinkedIn, anonymous guests + Turnstile, single active session | `lib/supabase/*`, `lib/{guest,turnstile,sessions}.ts`, `app/(app)/onboarding/*`, `app/api/guest/claim` | C6 |
| **CV Pointer Lab** | C | main | **LIVE** (Pro; 2 free tries) | `routes/resume.py`, `services/resume_ai.py`, `app/(app)/resume/*` | AI router |
| **Deck Vault (library + public pages + purchases)** | A | main | **LIVE** — 82 decks, 25% free pages, 2 sales | `app/(app)/skeletons/*`, `app/decks/[slug]`, `app/api/decks/*`, `routes/{decks,deck_ingestion}.py`, `services/deck_*`, `lib/google-drive.ts` | C8 |
| **Deck Vault Rewards** | Cowork | main | **OFF** — disconnected; admin page redirects | `routes/deck_vault.py`, `app/(app)/deck-vault/*` | C7, C8 |
| **Cheat sheet + share PDF** | B | main | **LIVE** (Lite+) | `app/(app)/cheat-sheet/*`, `app/s/[id]`, `app/api/cheat-sheet/share` | GD briefs |
| **Prep Copilot v2** | any | main | **IN DEVELOPMENT** — removed from Pro and nav 2026-10-05 (`PREP_COPILOT_IN_NAV=false`); `/coach` opens by URL | `routes/copilot.py`, `services/copilot/*`, `components/copilot/*`, `lib/copilot/*` | AI router |
| **Interview Intelligence** | any | main | **BETA** — mounted at `/ii`; admins + 2 test users; plans hidden (Free 10 min, Pro 20 min ×2/month, Ultra) | `consilio-backend/interview-intelligence/**`, `routes/interview_intelligence.py`, `app/(app)/interview-intelligence/*`, `components/interview-intelligence/*`, `lib/interview-intelligence/*` | C10 (proposed), II schema |
| **Agentic orchestrator / coach v1 (admin demos)** | any | main | **BETA (admin)** — simulation default, live mode available | `services/{agentic,coach}/*`, `routes/{agentic,coach}.py`, `app/(app)/admin/{agentic,prep-copilot}` | AI router |
| **AI provider router + usage + budget** | any | main | **LIVE** — live toggles, fallback to OpenAI, $10/day kill switch, Telegram alert; Gemini Live mis-filed as "Other" in the report | `services/{ai_providers,ai_usage}.py`, `routes/{ai_providers,usage}.py`, `app/(app)/admin/{ai-providers,ai-usage}` | — |
| **Email broadcasts + digests** | any | main | **LIVE** — Resend, segments, India/US audiences, targeted practice (unlisted cases, 0065) | `app/(app)/admin/broadcast/*`, `lib/email/*`, `lib/broadcast-audience.ts`, `routes/broadcast.py`, `services/broadcast_gen.py` | Practice (unlisted) |
| **Growth: insights + daily blog** | any | main | **LIVE (thin) / DORMANT** — `/insights` public 2026-10-03; daily blog built, off until `DAILY_BLOG_ENABLED`, Telegram review | `routes/seo.py`, `services/growth/*`, `app/insights/*`, `lib/seo-pages.ts`, `.github/workflows/daily-blog.yml` | C4 (additive) |
| **Admin console** | C | main | **LIVE** — 20 sections; Status page contradicts itself; analytics windows mixed | `app/(app)/admin/*`, `components/admin/*` | most features |
| **Certificates + offer letters** | Cowork | main | **LIVE** — 5 certificates; offer_letters migration run status unknown | `lib/certificates.ts`, `app/verify/[certId]`, `app/offers/[offerId]`, `routes/certificates.py` | — |
| **Testimonials, endorsements, team** | C | main | **LIVE, ISSUE** — 17 testimonials incl. the founder's own | `app/(app)/admin/{testimonials,endorsements,team}` | — |
| **Landing pages (India + US)** | C | main | **LIVE** — editorial India landing (2026-09-29), premium US landing with MCQ warm-up | `app/page.tsx`, `components/home/*`, `app/us/*`, `components/us/*` | Markets |
| **Analytics (page events, funnel)** | any | main | **LIVE, ISSUE** — ~4 days of session history; funnel windows mixed | `app/api/track`, `lib/analytics.ts`, `app/(app)/admin/journeys` | — |

## Collision watch (surfaces several features share)
- **`send()` / SSE turn loop** is shared by text, dictation and pipeline voice. Anyone changing `send()`, `postMessageStream` or SSE event names must check voice still receives tokens; forking the send path breaks scoring parity.
- **Clarification quota (C9)** = backend `CLARIFICATION_QUOTA` + frontend `TIER_LIMITS.maxHintQuestions` + pricing copy, changed together with a backfill migration.
- **Prices** = `lib/tier.ts TIER_PRICING` + `lib/pricing-intl.ts` + Razorpay order/verify/webhook + every pricing surface (`/pricing`, `/upgrade`, pricing cards, JSON-LD, II plans page).
- **`cases` table (C1)** is read/written by practice, daily generators (India + US), broadcast (unlisted), news → case, dashboard; any column add is a contract event.
- **Scoring return (C2)** is defined by the scorer and consumed by results, dashboard, backstop, exemplar bank.
- **AI provider router** is used by almost every AI feature; a provider outage or rename (Gemini) hits many features at once.
- **`gdrive:` storage (C8)** in both repos (`lib/google-drive.ts` ↔ `services/gdrive.py`).
- **Voice minutes** are metered in three places (`/transcribe`, `/speak`, realtime/Gemini credits) with separate quotas.

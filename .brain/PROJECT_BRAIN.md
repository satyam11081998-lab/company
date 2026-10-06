# MECE — PROJECT BRAIN (v3)

**Rewritten from scratch:** 2026-10-06 (IST) by a Claude session, from a full read of both repos, a logged-in walk of mece.in (owner account: Pro + admin) and all 20 admin sections.
**Code baseline:** frontend `main` @ `1dcc819` (2026-10-05) · backend `main` @ `9f71870` (2026-10-05).
**Live/admin baseline:** site and admin read 2026-10-03 18:50–19:00 IST; status page, radar, dashboard and GD briefs re-checked 2026-10-06 02:35 IST.
**Companion:** the interactive "MECE Platform Atlas" artifact (claude.ai) presents the same facts with diagrams.
**Replaces:** the 2,814-line "PROJECT_BRAIN (MERGED)" that was appended to from May to July. That version is in git history; nothing in it is authoritative any more. Where this file and older handoffs disagree, this file wins unless the handoff is newer than 2026-10-05.

---

## 0. HOW TO USE THIS FILE (any AI session, read first)

1. **Read order:** this file §0–§3 → §16 (status register) → §17 (known issues) → the section for your feature → `CONTRACTS.md` for any surface you touch → newest handoffs in `.brain/handoffs/` (sort by date).
2. **Evidence tags.** `[CODE]` read in the repo · `[LIVE]` seen on mece.in · `[ADMIN]` read from the admin console · `[DOC]` taken from a doc/handoff, not re-verified. Dates are absolute.
3. **Freshness rule.** Anything describing "now" decays. Before relying on a status, run `git log --oneline -15` in both repos and skim newer handoffs. If code and this file disagree, the code is right; fix this file in the same session.
4. **Git safety for cloud/remote shells.** Some shells (Cowork device bridge) can create files but cannot delete them. Any git command that writes (`status` without `--no-optional-locks`, `add`, `commit`, `pull`, `fetch`) can leave `.git/index.lock` behind and block the owner's next git command. In such shells: prefix every git read with `GIT_OPTIONAL_LOCKS=0` (or `git --no-optional-locks`), and leave commits/pulls to the owner. If a lock is left, move it to `D:\dev\mece\_to_delete\`.
5. **Do not hand-edit** the auto section of `STATE.md` (above the HAND marker). `node .brain/sync.mjs` regenerates it from git + `LEDGER.md`.
6. **Contracts.** If you change a CONTRACTS.md surface (C1–C10), say so first, bump its version, and list affected features.
7. **End of session.** Commit/push (owner), run `node .brain/sync.mjs`, update §16 here if a status changed, and write a handoff if work is unfinished.

---

## 1. SNAPSHOT

| Metric | Value | Source |
|---|---|---|
| Registered users | 224 (15 joined in the week to 3 Oct; 74 in 30 days; peak 9/day) | [ADMIN] Users, 3 Oct |
| Accounts by market | India 376 · US 13 · Europe 0 · 1 unstamped (includes guest/anonymous accounts — not the same definition as "users") | [ADMIN] US & Europe |
| Paying customers | 10 (on a paid plan) | [ADMIN] Users |
| Revenue to date | ₹9,504 = ₹6,010 in the payments ledger (10 payments: Lite/Pro ₹5,812 ×8, deck sales ₹198 ×2) + ₹3,494 booked before the ledger | [ADMIN] |
| Revenue, last 30 days | ₹2,816 | [ADMIN] |
| Leaderboard pool | 216 ranked (includes 17 restored/seeded rows, see §17) | [LIVE] |
| Traffic, 7 days to 3 Oct | 158 sessions, 483 page views, 89% anonymous, 51% bounce, 3.1 pages/session | [ADMIN] Analytics |
| Funnel (all time, internal excluded) | onboarded 173 → started a case 53 → submitted 21 → paid 7 | [ADMIN] |
| AI spend | $5.74 for 873 calls in 14 days (Gemini Live voice $4.84); kill switch $10/day | [ADMIN] AI usage |
| India practice bank | ≈420 active items (47 pages × 9 in /practice) | [LIVE] |
| US bank | 57 cases + 57 market-sizing | [ADMIN] |
| Deck Vault | 82 decks (81 corporate, 1 B-school) | [LIVE] |
| Casebook | 110 content files, 27 industry primers, 75 glossary terms | [CODE] |
| Frontend size | 643 TS/TSX files, ~117k lines; 84 pages, 39 API routes, 257 components | [CODE] |
| Backend size | 283 .py files, ~53k lines (Interview Intelligence ≈18k); 64 endpoints + 41 under /ii | [CODE] |
| Database | 59 public tables (60 created by migrations; `case_tags` dropped in 0015) + 27 in schema `interview_intel`; 69 migration files in `supabase/migrations` | [CODE] |
| Commits | frontend 601, backend 203 (to 5 Oct); first commits 19/20 May 2026 | [CODE] |

---

## 2. PRODUCT

### 2.1 One line
An AI interviewer that runs a consulting-style case or guesstimate with the candidate, then scores the whole conversation out of 100 with quoted evidence, three model approaches and a national rank.

### 2.2 Who it is for
- **India (core):** MBA/PGDM students preparing for summer internship and final placements — consulting, finance, marketing, product, ops, HR. Domain `mece.in`, prices in INR.
- **US & Europe (since 2026-09-25):** consulting/strategy candidates; landing `/us`, US case bank, USD/EUR, a daily pair that rolls over at New York midnight. Europe uses the US bank.
- **Guests:** can solve a real case before signing up (anonymous Supabase session); the attempt is claimed on signup.
- **Institutions:** only a "Get a group quote" form on /upgrade. No cohort product yet.
- **Owner/admin:** `users.is_admin`; 20-section console at /admin.

### 2.3 Core loop
Pick case (daily pair or bank) → clarify (7/12/20 questions by plan) → structure & solve (type, dictate, or live voice) → submit → validity gate → GPT-4o scoring (+ Python arithmetic backstop for guesstimates) → 7-slide results (verdict, scorecard, where marks went, your line, a stronger line, the other angle, your answer) → points (first attempt only), streak, career ladder, leaderboards.

### 2.4 Surfaces around the loop
Free casebook (sections A–H), 27 industry primers, case-competition track (10 chapters), India Data Atlas (guesstimate numbers), GD prep (news briefs, Topic Radar, Abstract GD), Deck Vault, CV Pointer Lab, Cheat Sheet, Prep Copilot (in development), Interview Intelligence (private beta), certificates, testimonials/endorsements, insights articles.

### 2.5 Plans and prices [CODE] `lib/tier.ts`, `lib/pricing-intl.ts`, `services/access_guard.py`
One-time payments (1 month or 3 months), **no auto-renew**. Coupons supported.

| | Free | Lite | Pro |
|---|---|---|---|
| India | ₹0 | ₹299/mo · ₹749/3 mo | ₹599/mo · ₹1,499/3 mo |
| US / Europe | $0 | $29 · $69 (same in €) | $49 · $119 (same in €) |
| Daily case + guesstimate | ✓ | ✓ | ✓ |
| Extra bank practice | 1 case + 1 guesstimate, lifetime | +2 cases +2 guesstimates per IST day | unlimited |
| Re-attempts | 0 | unlimited | unlimited |
| Clarifying questions / case (C9) | 7 | 12 | 20 |
| GD briefs | 1 lifetime | 2 new per IST day | unlimited |
| Cheat sheet | from the free brief only | full | full |
| CV Pointer Lab | 2 tries | 2 tries | unlimited |
| Worked case figures | ✗ | ✗ | ✓ (withheld server-side) |
| Prep Copilot | not sold (in development since 2026-10-05) | | |
| Live voice | 14 free minutes per account (7 per case) on realtime/Gemini | same trial | monthly allowance |

History: Lite ₹199 / Pro ₹499 (May) → ₹299/₹599; annual dropped 2026-06-20; Lite retired in India 2026-10-03 (`7c20bf5`) and **restored** 2026-10-05 (`cda08a1`). Deck Skeleton Library one-time ₹500 constant exists; deck sales recorded at ₹99.
Interview Intelligence plans (hidden, nothing charged): Free one 10-minute interview · Pro 20 minutes, 2 per 30 days, while `ii.enabled_for_pro` · Ultra ₹1,299/mo preview (every type and length, up to 10 a month).

### 2.6 Positioning and claims
- MECE is named after the consulting principle (Mutually Exclusive, Collectively Exhaustive); wordmark lockup reads "Method for Evaluating Corporate Excellence". The FAQ explicitly separates the platform from the principle.
- Firm names appear as plain text only ("interview styles only, not affiliated").
- Competitors exist (AI case-practice tools such as Road to Offer, CaseWithAI, CaseTutor per the owner's 2026-09-16 strategy memo). Do not claim "no one has this". Defensible: engineering judgment (code-decided interviewer, deterministic arithmetic, cost-aware routing, evidence-traced II), India depth, two-market build.
- **Do not claim** until fixed/backed: placement-outcome calibration; "216 active competitors"; Topic Radar "updated today"; founder quote as a customer testimonial.
- Strategy memo (2026-09-16, `Claude outputs/MECE_brutal_strategic_review.md`): B2C willingness to pay is weak; inbound workshop requests from colleges (IMT Ghaziabad, Symbiosis) point to a B2B/B2B2C channel.

---

## 3. ARCHITECTURE

### 3.1 Topology
```
 Student / Guest / Admin browser
   │  pages ───────────────► VERCEL (Mumbai, bom1): Next.js 14 — middleware · 84 pages · 39 API routes · 2 crons
   │  reads under RLS ─────────────────────────────────────────────► SUPABASE (Tokyo*): Postgres · Auth · Storage
   │  case turns (SSE) · scoring · tokens (Bearer JWT) ─► RENDER (Oregon*, free plan): FastAPI · /ii package
   │  live voice audio (ephemeral key) ─────────────────► Gemini Live / OpenAI Realtime
 VERCEL API ──► Razorpay (orders/verify; webhook back) · Resend + Gmail SMTP · Supabase (service role)
 RENDER ──► OpenAI · Groq · Google Gemini · Google TTS · Supabase (service role) · GNews/NewsAPI · Telegram · Google Drive
 GITHUB ACTIONS (backend repo) ──► Render: wake + daily jobs + keep-alive every 10 min
```
`*` regions from Interview Intelligence BUILD_STATUS ("backend in Oregon, database in Tokyo"); not otherwise verified. One interviewer turn crosses three regions.

### 3.2 Request paths
- **Typed turn:** browser `POST /attempts/{id}/messages` (JWT) → verify JWT (local JWKS, cached) → rate limit (60/min; guests 20) → daily AI budget → 200-message cap (guests 40) → insert `attempt_messages` **before** any AI call → session signals → gates → response function → control packet → model (GPT-4o-mini today) → SSE stream with control tags stripped → save reply, `session_state`, clarification count, `ai_usage_log` row.
- **Submit:** `POST /attempts/{id}/submit` (10/min) → fold last voice turn → save final recommendation → `score_conversation` (validity gate + GPT-4o scorer + backstop) → debrief + skill profile (best effort) → `pop_figures` → insert `submissions` (with `attempt_id`, migration 0068 fallback) → `bank_figures` → `maybe_capture_exemplar` → mark attempt submitted → `case_attempts` row → points (first attempt only) → badges.
- **Payment:** `/api/razorpay/order` (tier, period, currency, coupon validated server-side) → Razorpay checkout → `/api/razorpay/verify` (HMAC) → tier + expiry set via service role, `payments` row → `/api/razorpay/webhook` as backstop/refunds. INR orders paid with an international instrument are refunded and nothing is granted (`lib/payments-region.ts`).
- **Live voice:** backend mints a constrained ephemeral token (`/realtime/session` or `/realtime-gemini/session`) after checking credits → browser streams audio directly to the provider → usage posted back and metered per minute.
- **Daily content:** GitHub Actions 00:01 IST → `/cron/schedule-daily` (India), 10:40 & 12:10 IST → `/cron/schedule-daily-us`; 06:00 IST → `/cron/fetch-news`; Vercel cron `/api/cron/refresh` 06:00 & 10:45 IST.

### 3.3 Hosting
| Piece | Where | Notes |
|---|---|---|
| Frontend | Vercel, region `bom1` (`vercel.json`) | auto-deploys from GitHub `main`; `output: 'standalone'`; security headers in `next.config.js` |
| Backend | Render, free plan, `consilio-backend.onrender.com` | 512 MB; sleeps after ~15 min idle (keep-alive job); II adds ~42–65 MB when used |
| Database/Auth/Storage | Supabase | service-role key server-only |
| Schedules | GitHub Actions in the backend repo | GitHub disables schedules after 60 days of repo inactivity |

---

## 4. REPOS AND FOLDERS

| | Frontend | Backend |
|---|---|---|
| GitHub | `satyam11081998-lab/company` | `satyam11081998-lab/backend` |
| Local | `D:\dev\mece\consilio` | `D:\dev\mece\consilio-backend` |
| Open branch | `feat/unified-interviewer-brain` (13 other remotes already merged) | `feat/unified-interviewer-brain` (9 others merged) |
| Worktrees | `D:\dev\mece\consilio-brain` | `D:\dev\mece\consilio-backend-brain` (git marks it prunable) |

**Frontend key paths:** `app/` (routes; `(app)` group = signed-in shell), `app/api/**/route.ts`, `components/` (by domain: solve, dashboard, results, casebook, admin, interview-intelligence, us, home…; `components/ui` = shadcn), `lib/` (domain logic; see §5.4), `supabase/migrations/` (+ ad-hoc SQL in `supabase/`), `public/` (primers, fonts, certificates), `qa/` (voice E2E harnesses), `scripts/` (SEO CI, IndexNow, seeds), `.brain/`.
**Backend key paths:** `main.py` (router registration, CORS, pins `ADAPTIVE_INTERVIEWER=true`), `routes/` (25 routers), `services/` (70 modules incl. `agentic/`, `coach/`, `copilot/`, `growth/`), `prompts/` (interviewer v2, scoring, guesstimate scoring, voice playbook/renderer), `migrations/` (3 dated SQL files), `interview-intelligence/` (own package, docs A–M, tests, qa), `tests/`, `tools/` (eval harnesses), `eval/`, `scripts/` (deck ingestion), `.github/workflows/`.
**Workspace `D:\dev\mece`:** both repos, two worktrees, `_notes/` (deploy runbooks; a plaintext II secrets file — move it), `Claude outputs/` (40+ reports), `_archive/`, `_to_delete/`, `datasets/ experiments/ reports/ research/ tools/` (phase folders from scoring/data work), `COmmands switch.txt`.

---

## 5. FRONTEND [CODE]

### 5.1 Route inventory (84 pages)
- **Public marketing/SEO:** `/` (India editorial landing, ISR 300 s), `/us` (+ `/us/pricing`, `/us/learn`, `/us/learn/[slug]`, `/us/case-interview-examples`, `/us/market-sizing-questions`), `/pricing`, `/about`, `/methodology`, `/testimonials`, `/glossary`, `/glossary/[term]`, `/insights`, `/insights/[slug]` (public since 2026-10-03), `/decks/[slug]` (25% free pages), `/learn/mece-framework`, `/feedback`, `/privacy`, `/terms`, `/refund`, `/p/[code]` (short links to unlisted practice), `/verify/[certId]`, `/offers/[offerId]`, `/s/[id]` (shared cheat sheet), `/llms.txt`, `/llms-full.txt`.
- **Auth:** `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/session-conflict`.
- **Signed-in app `(app)`:** `/dashboard` (`/home` redirects), `/practice`, `/cases` (redirects to practice), `/cases/[id]` (workspace — **opening it starts or resumes an attempt**), `/results/[id]`, `/history`, `/history/[attemptId]`, `/leaderboard`, `/profile`, `/onboarding`, `/upgrade`, `/upgrade/intl`, `/learn/casebook/[[...slug]]`, `/learn/[slug]`, `/learn/[slug]/[framework]`, `/gd-briefs`, `/gd-briefs/[id]`, `/gd-briefs/radar`, `/gd-briefs/radar/[slug]`, `/gd-briefs/abstract`, `/resume`, `/skeletons`, `/skeletons/view/[id]`, `/cheat-sheet`, `/deck-vault` (rewards, disconnected), `/coach` (Prep Copilot, by URL only), `/interview-intelligence` (+ `/new`, `/plans`, `/session/[id]`, `/report/[id]`).
- **Admin (22 pages):** `/admin` (Operations), `users`, `us-market`, `journeys` (Analytics), `analytics`, `coupons`, `status`, `ai-usage`, `ai-providers`, `agentic`, `prep-copilot`, `interview-intelligence`, `growth`, `certificates`, `testimonials`, `endorsements`, `team`, `cases`, `broadcast`, `decks`, `deck-vault` (redirects), `feedback`.
- **Redirects (next.config.js):** `/learn` → `/learn/casebook`; `/explore-mece` → `/dashboard`; `/mece-framework` → `/learn/mece-framework`. Rewrite `/deck-img/:slug/:n` → `/api/decks/:slug/page/:n` (crawlable slide images, paywall still enforced).

### 5.2 Middleware and markets
`middleware.ts` → `lib/supabase/middleware.ts`: refreshes the Supabase cookie session, protects non-public routes (`PUBLIC_ROUTES` in `lib/constants.ts`), enforces the single active session (`user_sessions`, `/session-conflict` takeover; fails open), routes visitors by market. Matcher excludes `/api`, `_next`, and static extensions (perf fix 2026-09-24). Crawlers are never geo-routed.
`lib/market.ts` (pure, shared by edge/server/browser): Market `IN|US|EU`, content market `IN|US`, currency `INR|USD|EUR`. India only when IP country (`x-vercel-ip-country`) is IN **and** the browser time zone (cookie `mece_tz` from `<RegionProbe/>`) agrees. Signed-in users use `users.market` (locked). Detection decides what is shown; payment instrument checks decide what is charged.

### 5.3 Supabase clients
`lib/supabase/client.ts` (browser), `server.ts` (RSC/route handlers), `static.ts` (cookie-less, used by ISR landing; placeholder on server when env missing, throws in browser), `service.ts` (service role, server only), `auth-cached.ts`, `middleware.ts`.

### 5.4 Key libraries
`lib/tier.ts` (TIER_LIMITS, prices, `canSeeCaseFigures`) · `lib/tier-core.ts` (`effectiveTier` honours expiry, no prices) · `lib/access.ts` (UX mirror of access_guard) · `lib/limits.ts` (input caps 20k) · `lib/interview-api.ts` (attempt + SSE client) · `lib/api.ts` (backend calls, transcribe/speak/quota) · `lib/voice/*` (VAD, noise guard, TTS queue, Gemini Live, realtime session, access messages, V11 voice) · `lib/scoring/*` (TS mirror of the backstop) · `lib/dashboard/*` (leaderboards, skill graph, heatmap, daily progress, daily lines, photos, peer proximity, snapshot writer) · `lib/readiness.ts`, `lib/next-action.ts`, `lib/career-tiers.ts` · `lib/casebook/*` (content, tree, types — contract C3) · `lib/primers`, `lib/glossary`, `lib/curriculum` (C5), `lib/us-market/*` (US bank and labels), `lib/us-learn/*` · `lib/gd-topics.ts` (Topic Radar data, hand-curated) · `lib/abstract-gd.ts` · `lib/seo.ts`, `lib/seo-pages.ts`, `lib/internal-links.ts` · `lib/email/*` (templates, send) · `lib/broadcast-audience.ts` · `lib/coupons.ts`, `lib/billing.ts`, `lib/pricing-intl.ts`, `lib/payments-region.ts`, `lib/revenue.ts` · `lib/sessions.ts` · `lib/guest.ts`, `lib/turnstile.ts` · `lib/telegram.ts` · `lib/google-drive.ts` (C8) · `lib/certificates.ts` · `lib/interview-intelligence/*` · `lib/copilot/*` · `lib/analytics.ts` (page events → `/api/track`, Edge, batched).

### 5.5 Frontend conventions
- **Withhold, don't hide:** paid data must be withheld on the server; anything passed to a client component is readable in devtools; a user's own row is readable via PostgREST.
- Backend is the authoritative gate for quotas and plans; frontend mirrors for UX only.
- One helper per rule (`canSeeCaseFigures`, `effectiveTier`); never read `subscription_tier` raw (fixed at 4 sites 2026-09-22).
- `VOICE_INTERVIEW_ENABLED = NEXT_PUBLIC_VOICE_ENABLED === '1'` gates voice UI and pricing copy together. The comment above it ("voice OFF") is stale: production runs voice.
- `PREP_COPILOT_IN_NAV = false` in `components/app-nav.tsx` until launch.
- Casebook pages: `titleEmphasize` exists, `subtitleEmphasize` does not; `kind` includes `'toolkit'`; write literal `₹`/`→`, never `\uXXXX`.

---

## 6. BACKEND [CODE]

### 6.1 Routers and endpoints
| Router (prefix) | Endpoints | Purpose |
|---|---|---|
| `attempts` (`/attempts`) | `POST ""` start/resume · `GET /{id}` · `POST /{id}/messages` (SSE) · `/{id}/voice-decision` · `/{id}/voice-fold` · `/{id}/realtime-turn` · `/{id}/uploads` · `/{id}/submit` | the case conversation (1,549 lines) |
| `submit` | `POST /submit` | legacy one-shot answer scoring |
| `transcribe` (`/transcribe`) | `POST` | speech to text (Whisper via router) |
| `speak` (`/speak`) | `POST` | TTS (OpenAI or Google), Pro, metered |
| `realtime` (`/realtime`) | `POST /session`, `GET /credits` | OpenAI Realtime ephemeral session, credits |
| `realtime_gemini` (`/realtime-gemini`) | `POST /session`, `POST /usage` | Gemini Live token + metering |
| `voice_coach` | `POST /attempts/{id}/voice-coach`, `/voice-tool` | model-led voice support |
| `vision` (`/extract-text`) | `POST` | photo of notes → text |
| `news` (`/news`) | `GET /headlines`, `POST/GET /briefs/{id}`, `POST /abstract-brief` | GD briefs (Lite 2/day, Pro unlimited) |
| `daily` (`/daily`) | `GET /today`, `GET /leaderboard` | daily pair + daily leaderboard |
| `cron` (`/cron`) | `fetch-news`, `cleanup`, `schedule-daily`, `schedule-daily-us`, `daily-blog` | `x-cron-secret` |
| `usage` (`/usage`) | `GET /ai-quota` | per-user voice/image/TTS quota |
| `resume` (`/resume`) | `point`, `refine-bullet`, `generate-bullets`, `fit-bullet`, `rebuild` | CV Pointer Lab |
| `certificates` | `POST /draft` | AI drafting, figures checked in Python |
| `decks`, `deck_ingestion` | process/render/summarize; scan/review-queue/approve | Deck Vault pipeline |
| `deck_vault` | `submit`, `status` | Rewards — **disconnected** |
| `ai_providers` (`/admin/ai-providers`) | GET/POST | live provider toggles (admin) |
| `public_config` | GET | public flags |
| `agentic` (`/admin/agentic`) | `info`, `run` | orchestrator (admin) |
| `coach` (`/coach`) | `info`, `run`, `tool/case`, `demo`, `demo/candidates` | v1 coach + admin demo |
| `copilot` (`/copilot`) | `status`, `pack`, `practice/start|message|submit` | Prep Copilot v2 (self-gates on `COPILOT_V2_ENABLED`) |
| `seo` (`/seo`) | `candidates`, `generate`, + `telegram/webhook`, `telegram/setup`, `daily/send/{id}` | programmatic SEO + daily blog review |
| `broadcast` (`/broadcast`) | `generate-options`, `materialize` | targeted practice for emails (IN/US) |
| `interview_intelligence` | mounts `/ii` (41 endpoints) | see §7.8 |
| root | `GET /`, `GET|HEAD /health` | health shows which keys are loaded |

### 6.2 Services (by job)
- **Interview:** `interview_engine.py` (turn runner; V12), `interviewer_decision.py` (control tags, stream guards, assessor, gates, `decide_response`, control packet, leak scrub), `session_signals.py` (deterministic turn reading), `interviewer_mode.py` (per-function instructions), `clarification_counter.py` (C9 counting), `learning_model.py`, `voice_coach.py`, `answer_validity.py`.
- **Scoring:** `ai_scorer.py`, `guesstimate_backstop.py`, `case_figures.py`, `exemplar_bank.py`, `badge_awarder.py`.
- **AI plumbing:** `ai_providers.py` (router), `ai_usage.py` (cost ledger, quotas, budget), `model_json.py`, `realtime_credits.py`.
- **Access:** `auth.py` (JWKS verify + cache, guest detection), `access_guard.py` (authoritative plan/quota gate), `rate_limit.py` (in-memory), `limits.py`, `keyed_lock.py`, `markets.py`.
- **Content:** `content_generator.py`, `daily_scheduler.py`, `news_fetcher.py`, `news_pipeline.py`, `headline_classifier.py`, `brief_generator.py`, `abstract_gd_generator.py`, `broadcast_gen.py`, `growth/seo_writer.py`, `growth/daily_blog.py`, `growth/telegram_review.py`, `certificate_ai.py`, `resume_ai.py`.
- **Decks:** `deck_ai.py`, `deck_ai_gemini.py`, `deck_classifier.py`, `deck_extractor.py`, `deck_ingestion_pipeline.py`, `deck_render.py`, `deck_taxonomy.py`, `gdrive.py`.
- **Agents:** `agentic/*` (orchestrator + 5 specialists, simulation/live), `coach/*` (v1 coach), `copilot/*` (v2: research, casting, corpus, scoring, engine).
- **Other:** `supabase_client.py`, `telegram_notify.py`.

### 6.3 Guards and limits
JWT verified locally; rate limits per user per minute (start 20, message 60, submit 10, uploads 30, voice decision/fold/realtime turn 120; guests lower); `MAX_MESSAGES_PER_ATTEMPT=200` (guests 40); per-user daily voice/OCR/TTS minutes by tier (`ai_usage.py`); global `AI_DAILY_BUDGET_USD` (default 10) pauses AI features; Telegram alert at 80%. Rate limiter is in-memory (resets on restart, per process).

---

## 7. AI SYSTEMS

### 7.1 Provider router (`services/ai_providers.py`)
Per-feature provider, cached 30 s, admin-toggled live (table `ai_provider_settings`), falls back to OpenAI on any error. Gemini is called through its OpenAI-compatible endpoint (do **not** send `response_format=json_object` to Gemini). Model names via env (`GROQ_LLM_MODEL` default `llama-3.3-70b-versatile`, `GEMINI_MODEL` default `gemini-3.6-flash`).

| Feature | Choices | Code default | Live 3 Oct [ADMIN] |
|---|---|---|---|
| stt | groq, openai | groq (whisper-large-v3-turbo) | openai whisper-1 (override) |
| interviewer | groq, openai | groq (Llama 3.3 70B) | openai gpt-4o-mini (override) |
| validity | groq, openai | groq | openai gpt-4o-mini (override) |
| news_classify | gemini, groq, openai | gemini | gemini |
| gd_brief / abstract_brief | gemini, openai, groq | gemini (owner directive 2026-09-22) | gemini |
| daily_content | gemini, openai, groq | openai gpt-4o | openai |
| voice_mode | pipeline, realtime (gpt-realtime-2.1), gemini (Gemini Live) | pipeline | not captured |
| scoring | openai only | gpt-4o (locked) | gpt-4o |
| seo_writer / seo_critique | openai/groq | gpt-4o / groq | — |
| coach_planner / coach_synthesis | openai/groq | gpt-4o-mini / gpt-4o | — |
| tts | openai, google | openai tts-1 | — |

### 7.2 Interviewer (V12, the only interviewer on `main`)
`main.py` pins `ADAPTIVE_INTERVIEWER=true`; the static prompt was removed. Flow per turn: **signals** (`session_signals.py`: turn type, substantive reasoning, help/solution/skip/frustration phrases, asks to proceed, step completed) → **gates** (`evaluate_intervention_gate`, fast lane for silence/near-empty turns) → **response function** (`decide_response`, ~30 functions) → **control packet** (JSON) → model words the line (`prompts/interview_prompts_v2.py`, `voice_interviewer_playbook.py`, `voice_renderer.py`) → `validate_contextual_line`, `scrub_control_leak`, `StreamLeakGuard` → plain-text reply; on failure a plain hand-back, never an error.
Key functions: OPEN, DATA_REVEAL (give only the fact; invent consistent figures when the case is silent), TARGETED_QUESTION/PROBE, RETHINK_CUE, CORRECT_AND_CONTINUE, MICRO_HINT/STRUCTURAL_HINT, ACKNOWLEDGE_AND_CONTINUE, REFLECT_PROGRESS, ACKNOWLEDGE_AND_ORIENT, VALIDATE_AND_HAND_BACK, CONTINUE_AS_AGREED, REPAIR_AND_RESET, ANSWER_DIRECT, DELIVER_SOLUTION (next step only), TRANSITION, DEFLECT_META, NOISE, CLOSE, NO_OUTPUT, SHORT_ACK, HAND_BACK.
Persona rules: owns the facts (never "that isn't specified"), identity lock, no praise/rubber-stamping, plain text, 1–3 sentences, never lays out the candidate's framework. When the clarification quota is exhausted it declines in character (`CLARIFICATIONS_EXHAUSTED_DIRECTIVE`).
Unmerged successor: `feat/unified-interviewer-brain` (both repos) — one brain for text/STT/realtime behind `INTERVIEWER_BRAIN` (default off), contextual presence; last commit 2026-10-01; extensive reports under backend `docs/`.

### 7.3 Scoring
1. **Validity gate** (`answer_validity.py`): deterministic pre-check (empty, padding, keyboard mash) → cheap model screen → `valid | thin | off_topic | gibberish`; off-topic/gibberish = 0 with explanation; fails **open**.
2. **Conversation scorer** (GPT-4o, locked): whole transcript; JSON with per-dimension marks + quoted evidence, red flags, model answer, `approaches` {your_line, top_candidate, third_angle}, visuals; max_tokens 8000, retry once. Holistic rule: a junk final recommendation can rescue but never zero a genuine conversation; only a genuinely empty attempt is rejected. Spoken turns are serialised as text (scorer cannot see modality).
3. **Guesstimate backstop** (`guesstimate_backstop.py`, mirrored in `lib/scoring/*`): model transcribes the calc chain; Python recomputes derived steps (tolerance 2%), overrides `arithmetic`, caps total on implausible magnitude; base/literal steps never flagged; if nothing verifiable, defers to the model.
4. **Figures split** (`case_figures.py`): `pop_figures` before writing `feedback_json`; `bank_figures` into `case_figures` (RLS on, no policy).
5. **Exemplar bank**: score ≥82 and clean → anonymised digest; up to 3 approved digests used as private reference (`EXEMPLAR_REQUIRE_APPROVAL=true`); every function swallows errors. Inert until `migrations/2026-09-12_case_exemplars.sql` runs and entries are approved.
6. **Rewards**: points = score on first attempt only (read-then-write update; race possible), badges, streaks, leaderboards.
Rubrics: cases 100 pts — structure 25, quantitative 20, synthesis 20, business_judgment 15, creativity 10, presence 10. Guesstimates (each 0–100, legacy 1–5) — scoping 10%, structure 30%, segmentation 25%, arithmetic 15%, sanity 20%. Contract C2 return keys: `total`, `dimensions`, `arithmeticOverridden`, `rawTotal`, `backstop.{findings,summary,notChecked,totalCapFactor}`; `feedback_json.approaches` additive.
Eval: `tools/eval_interview_scoring.py` (50×2, 2026-09-12: cases 100%, interviewer 100%; guesstimate re-run pending); `tools/eval_interviewer_behavior.py`, `tools/try_interviewer.py`.

### 7.4 Learning model (`services/learning_model.py`, migrations 0066–0068)
21 skills, 12 error types, 9 teaching modalities, remedies per error; per-attempt learner profile on `session_state`; `user_skill_profile` written after submit; personalised debrief. Coached UI controls are flag-gated.

### 7.5 Voice
Three engines selected by `voice_mode`: **pipeline** (mic → VAD → `/transcribe` → normal `send('voice')` → interviewer → `/speak` → FIFO playback; Pro only in UI), **realtime** (OpenAI Realtime over WebRTC; lines injected with `input: []`), **gemini** (Gemini Live over WebSocket; reconnects after ~10-min limit; config step-down; `SAY:` protocol never spoken/shown/saved). Free trial for every account: `REALTIME_FREE_TRIAL_MIN=14`, `REALTIME_FREE_SESSION_SECONDS=420` (mirrored in `lib/voice/access.ts`); guests get a sign-in prompt; 402 = out of credits. Guards: noise guard (Whisper "Thank you." on silence), idle warn 3 min/close 5 min, hidden tab stops mic, track-ended handling, transcribe/send failure streaks, echo guard.
Cost notes (code comments, per 25-min session): text $0.024, dictation $0.084, pipeline voice $0.159, OpenAI realtime $0.69; Gemini Live ≈ $0.04/min (ledger: 123 min = $4.84). Voice was turned off 2026-08-16 as not ROI-positive and returned on Gemini Live with a capped trial (2026-10-01→03).

### 7.6 Generators
Daily case + guesstimate (GPT-4o, India and US, idempotent, today only) · news → headlines (classified, top kept, older than 14 days deleted) → GD brief on first click, cached · news → 15-min case (`/api/news/[briefId]/to-case`) · abstract GD briefs · broadcast targeted practice (unlisted cases, migration 0065) · SEO articles with self-QA (admin approves) · **daily blog autopilot** (sourced research with Google grounding + fallbacks, 1,000–1,400-word 'daily-2' format with GD/PI/WAT section, Telegram review: publish/another/reject; off until `DAILY_BLOG_ENABLED`) · certificate wording (no figure absent from notes, checked in Python; no em/en dashes) · CV bullets within a character band · deck summaries (Gemini; requires `google-generativeai`).

### 7.7 Agents
- **Prep Copilot v2** (`services/copilot/*`, `routes/copilot.py`, `/coach`): role + company research → scorecard → graded practice. **In development:** removed from Pro lists and nav 2026-10-05; opens by URL; backend self-gates on `COPILOT_V2_ENABLED`.
- **Coach v1** (`services/coach/*`): planner + specialists + tools; admin demo `/admin/prep-copilot` runs a deterministic simulation on 3 sample candidates.
- **Agentic orchestrator** (`services/agentic/*`, `/admin/agentic`): 5 specialists (growth analyst, content strategist, curriculum designer, cost optimiser, deck librarian), missions (platform brief, cut AI costs, practice focus), simulation (default) or live.

### 7.8 Interview Intelligence (II) — `consilio-backend/interview-intelligence/`
Independent package, mounted at `/ii` by `routes/interview_intelligence.py` ("host mode"); the backend only supplies identity (user id, confirmed email, effective tier, admin, guest). Dormant (503) until `II_DATABASE_URL` is set; nothing imported until the first call. Own schema `interview_intel` (27 tables), own DB role `ii_service`, RLS, encryption (`II_ENCRYPTION_KEY`), prompts registry, per-stage model routing (`II_MODEL_ROUTES`, admin "AI routing"), spend caps, audit log, DB job queue with one worker thread. Can still run standalone with signed assertions (proposed contract C10).
Pipeline: documents (CV/JD upload or text; parsed; contact details/protected attributes redacted; encrypted) → role family → competency map → rubric → question plan (blueprint) → plan QA → live interview (15–60 min; voice by default: realtime | gemini | standard; follow-ups on answers, CV claims and the month's news) → turn analysis → evidence (verbatim quotes) → evaluation (untested ≠ weak; confidence separate) → feedback writer with quality gate (withholds failing items) → report (sections, question-by-question, "why was this asked", practice plan, transcript).
Access: launch flag `ii.enabled_for_pro` **off**; admins + test users (2) only; nav entry only for accounts II admits. Plans (hidden): Free one 10-min interview; Pro 20 min, 2 per 30 days; Ultra every type/length.
Health [ADMIN, last 24 h on 3 Oct]: cv_parse 3 runs/2 errors (p50 25 s), jd_parse 10/8 (22 s), competency_map 3/2, evidence 10/4, live_session (Gemini Live) 3/3, interviewer 20/0 (1.0 s); 7-day: 4 completed, 0% failure, 11 anomalies. Tests: 331 pass on Postgres (2026-10-03). Docs: `interview-intelligence/docs/00_AUDIT … M_SELF_REVIEW`, `BUILD_STATUS.md`. Compromises: shared 512 MB process, shared AI keys, Oregon↔Tokyo latency (~22 SQL statements per turn), Gemini free tier may use content (names/employers not redacted).

### 7.9 Cost accounting
Every call writes `ai_usage_log` (endpoint, model, tokens/minutes, cost). Prices in `ai_usage.py` (`PRICES`, Whisper/Groq per minute, TTS per character → per minute, Gemini Live per minute, Realtime audio tokens). TTS cost must not go through `PRICES` (would book $0). Admin AI usage groups Gemini Live under "Other" (fix).

---

## 8. DATA [CODE]

### 8.1 Tables by domain (public schema, 59 live)
- **People & money:** `users`, `user_sessions`, `colleges`, `college_email_verifications`, `team_members`, `payments`, `discount_coupons`, `coupon_redemptions`, `deck_purchases`, `skeleton_access`, `realtime_credits`, `realtime_purchases`, `feature_trials`, `guest_claims`.
- **Practice:** `cases` (C1; `market`, `unlisted`, `is_active`, `type`, `code`, `skill_node`, `skill_cluster`, `interview_meta`, `mcq`, `source_brief_id`), `attempts` (`session_state`, `tier_at_start`, `clarification_used`, `submission_id`), `attempt_messages` (`kind`: text|voice|image|file), `attempt_files`, `submissions` (`feedback_json`, `score`, `attempt_id`), `case_attempts` (`is_first_attempt`, `attempt_number`), `case_ratings`, `case_exemplars`, `case_figures`, `daily_schedule` (India), `market_daily_schedule` (US), `dimension_snapshots`, `user_skill_profile`, `skill_nodes`, `skill_edges`, `badges`, `user_badges`.
- **Content:** `news_headlines`, `news_refresh_log`, `gd_briefs`, `gd_brief_unlocks`, `abstract_briefs`, `cheat_sheets`, `cheat_sheet_items`, `cheatsheet_points`, `shared_cheat_sheets`, `deck_skeletons` (C8), `deck_submissions`, `seo_pages` (`kind='daily'` for blog), `learn_content` (legacy).
- **Trust/growth/ops:** `testimonials`, `endorsements`, `certificates`, `offer_letters`, `feedback`, `feedback_reports`, `page_events`, `user_actions`, `ai_usage_log`, `ai_provider_settings`, `agentic_runs`, `coach_runs`, `copilot_runs`, `copilot_packs`, `copilot_messages`, `copilot_scores`, `copilot_research_log`, `resumes`.
- **II schema `interview_intel` (27):** users, access_grants, audit_logs, system_config, documents, document_contents, document_analyses, company_profiles, interview_blueprints, questions, interview_sessions, interview_states, interview_events, interview_exchanges, interview_messages, claims, evidence_items, competency_assessments, competency_history, feedback_items, reports, evaluation_runs, model_runs, jobs, drive_files, drive_folders.

### 8.2 Security rules
RLS enabled in 54 migration statements, 109 policies. `trg_guard_user_cols` (0006) and 0054 revert client changes to `points` and plan columns unless `auth.role()='service_role'` (manual SQL edits: set `request.jwt.claim.role` to `service_role` for the transaction). `case_figures`: RLS on, no policy. Certificate verification is an exact-match SECURITY DEFINER RPC, not a view. Storage: avatars, private deck bucket (+ Google Drive `gdrive:<id>` paths, C8), shared cheat sheets (private bucket, revocable), testimonial photos.

### 8.3 Migrations
`supabase/migrations/0001…0070` (69 files; **two 0055s**: `deck_purchases`, `page_events`; 0037 and 0060 absent), backend `migrations/` (2026-09-12 case_exemplars, 2026-09-15 seo_pages, 2026-09-23 copilot_v2), II `migrations/0001_interview_intel.sql`, stray `supabase_migration_offer_letters.sql` at the frontend root, plus ad-hoc SQL in `supabase/` (seeds, demo account, growth-kit checks, daily read policies). **All are run by hand in the Supabase SQL editor; nothing records which have run.** Code is written to tolerate a missing column (fallback selects) — keep that pattern. Leaderboard seed history lives in 0026–0035 and `SEED_LEADERBOARD.sql`/`WIPE_LEADERBOARD.sql`.

---

## 9. ACCESS, TIERS, QUOTAS
- `effectiveTier` falls back to free when `subscription_expires_at` has passed.
- `services/access_guard.py` is authoritative: daily pair attemptable by all; free = daily pair + lifetime 1 case + 1 guesstimate, 0 re-attempts; lite = +2/+2 per IST day, re-attempts free; pro unlimited; unlisted broadcast cases never consume quota; US daily uses the US Eastern day.
- **C9 clarification quota** = three constants that must agree: backend `routes/attempts.py CLARIFICATION_QUOTA` (7/12/20), frontend `lib/tier.ts maxHintQuestions`, pricing copy (`components/pricing-plans.tsx`, `app/(app)/upgrade/page.tsx`, `app/pricing/page.tsx`). Counting counts information requests, not every "?" (Whisper adds "?" on rising intonation). Backfill migration (0043) when the ladder changes.
- Market lock: `users.market` stamped and locked; INR checkout requires a domestic instrument.
- Single active session (Netflix style) via `user_sessions`; demo accounts exempt.
- Guests: anonymous auth + Turnstile; `NEXT_PUBLIC_GUEST_MODE`; claim on signup (`/api/guest/claim`).

---

## 10. PAYMENTS AND REVENUE
Razorpay (`razorpay` npm + checkout.js). Routes: `app/api/razorpay/{order,verify,webhook}`. Prices from `priceFor(tier, period, currency)`; coupons validated server-side (C7 v2: single-use user-locked, public capped/unlimited, influencer commission computed on list price; `coupon_redemptions` recount prevents lost updates). Payments ledger `payments`; admin revenue counts customer payments only (2026-09-23 fix). Receipts via Gmail SMTP. Deck purchases and realtime minute purchases have their own tables. Checkout theme colour `#0F172A` (not the brand navy).

---

## 11. CONTENT AND GROWTH
- **Casebook** (`lib/casebook/content/**`, 110 files): A Getting started · B Guesstimates · C Core frameworks (MECE, structuring, profitability, market entry, growth, pricing, M&A/PE) · D Misc frameworks (STP, 4 A's, five senses, VRIO, 8 moats, AMO, 4M, 4 V's, TAM/SAM/SOM) · E Toolkit (Porter, SWOT, PESTEL, 4 P's, 5 C's, customer journey, BCG, value chain, Ansoff, 7S) · F Cases · G Industry primers (27) · H Case competitions (10 chapters). Inline SVG visual grammar (`docs/CASEBOOK_DESIGN_CONTRACT.md`). `/learn/casebook/industry-primers` has no index page (404); nav links to each primer.
- **India Data Atlas** (`/learn/casebook/guesstimates/data-cheatsheet`): 12 chart-led slides of sourced numbers.
- **GD:** news briefs; **Topic Radar** is hand-curated in `lib/gd-topics.ts` (8 propositions, last updates 22 Sep; "updates added today" hard-coded to that date); Abstract GD topic bank + method (library showed 0 generated briefs).
- **Deck Vault:** 82 decks; react-pdf viewer with watermark/blackout; public `/decks/[slug]` pages with 25% free pages and OG images; admin upload with competition/organizer/year/result/domain; Google Drive storage (C8). Rewards programme disconnected.
- **SEO/AEO:** `lib/seo.ts` (JSON-LD, hreflang IN ↔ /us), sitemap, `llms.txt`, IndexNow script, SEO CI gate, audits in `docs/seo/`, US growth master prompt in `docs/growth-us/`. `/insights` public since 2026-10-03; 1 article live then; daily blog off until enabled.
- **Email:** Resend broadcasts (segments: all, tier, activity, subscription lifecycle; markets India / US & Europe / both; today's digest; targeted practice card; custom HTML), one-click unsubscribe (`UNSUBSCRIBE_SECRET`), Gmail receipts. Deliverability fixes 2026-09-14/15.
- **Trust:** 17 published testimonials (one is the founder's), endorsements (named professionals, verified badge), team page, 5 certificates issued, offer-letter verification page.
- **Growth kit:** demo/showcase account (`users.is_demo`, excluded from boards), influencer coupons, shareable cheat sheet PDFs, LinkedIn-follow perk (0040).

---

## 12. ADMIN CONSOLE (`/admin`, `is_admin` only)
Operations (run news fetcher / daily generator; grant or revoke Pro/Lite for 30/90/365 days or permanent) · Users (revenue tiles, signups chart, user drawer with sessions/city/demo/sign-out-everywhere) · US & Europe (12-hour US preview, US links, prices, bank health, accounts by market) · Analytics (sessions, bounce, landing/exit, funnel, sources, page flows; internal accounts excluded) · Coupons · Status (backend health, keys loaded, today's content, news pipeline, wake backend) · AI usage (spend vs budget, by feature/model/day, top spenders, Telegram status) · AI providers · Agentic AI · Prep Copilot (demo) · Interview Intelligence (test users, plans, settings, AI routing, health, interviews, AI runs, evaluation, audit) · Growth (SEO drafts + daily post panel + Telegram status) · Certificates · Testimonials · Endorsements · Who builds MECE · Cases (India/US, metadata editor) · Broadcast · Deck Vault (upload) · Feedback (1 item so far).

---

## 13. OPERATIONS

### 13.1 Schedules
| Job | Cron (UTC) | IST | Notes |
|---|---|---|---|
| daily-cases.yml | `31 18 * * *` | 00:01 | wakes Render, `/cron/schedule-daily` |
| daily-cases-us.yml | `10 5`, `40 6` | 10:40, 12:10 | `/cron/schedule-daily-us`, second run is a backstop |
| daily-news.yml | `30 0 * * *` | 06:00 | `/cron/fetch-news` |
| keep-alive.yml | `*/10 * * * *` | every 10 min | `/health` |
| daily-blog.yml | `30 1`, `0,30 2-5`, `0 6` | 07:00–11:30 every 30 min | no-op once today's post exists; off until `DAILY_BLOG_ENABLED` |
| Vercel cron | `30 0`, `15 5` | 06:00, 10:45 | `/api/cron/refresh` (India, `?market=US`) |
| seo-gate.yml (frontend) | on PR | | `scripts/seo-ci.ts` |

### 13.2 Environment variables (names only)
Frontend: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_WEBHOOK_SECRET`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `EMAIL_FROM`, `RESEND_API_KEY`, `UNSUBSCRIBE_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `AI_DAILY_BUDGET_USD`, `GOOGLE_DRIVE_CLIENT_ID|CLIENT_SECRET|REFRESH_TOKEN`, `GDRIVE_FOLDER_ID`, `NEXT_PUBLIC_GUEST_MODE`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_VOICE_ENABLED`.
Backend: `OPENAI_API_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GROQ_LLM_MODEL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GNEWS_API_KEY`, `NEWSAPI_KEY`, `CRON_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID|TELEGRAM_ADMIN_CHAT_ID`, `GOOGLE_DRIVE_*` or `GOOGLE_SA_*`, `GDRIVE_FOLDER_ID`, `GDRIVE_SUBMISSIONS_FOLDER_ID`, `AI_DAILY_BUDGET_USD`, `AI_VOICE_MIN_PRO`, `AI_TTS_MIN_PRO`, `REALTIME_ENABLED`, `REALTIME_FREE_TRIAL_MIN`, `REALTIME_FREE_SESSION_SECONDS`, `GEMINI_LIVE_PER_MIN`, `COPILOT_V2_ENABLED`, `DAILY_BLOG_ENABLED`, `DAILY_BLOG_RESEARCH_MODEL`, `DAILY_BLOG_WRITER_MODEL`, `EXEMPLAR_*`, `CORS_ALLOW_ORIGIN_REGEX`, `II_DATABASE_URL`, `II_ENCRYPTION_KEY`, `II_MODEL_ROUTES`; branch only: `INTERVIEWER_BRAIN`. (`ADAPTIVE_INTERVIEWER` is forced true in `main.py`.)
**Scope every Vercel variable to Production and Preview.** A variable in one environment is absent in the other (cost three weeks of failed deploys, root-caused 2026-08-13).

### 13.3 Gates before merge
Frontend: `npx tsc --noEmit`, `next build` (on the real tree; mounted-drive builds can time out in sandboxes). Backend: `python -m py_compile` on touched files, relevant `tests/`, `tools/eval_interview_scoring.py` before changing prompts/scoring. II: `pytest -q` from inside `interview-intelligence/` and `python -m qa.run_golden` before changing prompts/routes/evaluator. SQL: idempotent (`IF NOT EXISTS`), deploy-order safe.

### 13.4 Monitoring
Admin Status (probe currently unreliable, §17), AI usage + Telegram burn alert, II Health, Vercel Analytics, `page_events`.

---

## 14. DESIGN SYSTEM AND BRAND
Tokens are HSL in `app/globals.css` (source of truth): navy `214 72% 13%` (#091E39; comments say #0F1C33), primary cardinal red `356 84% 43%` (#CA121E; comments say #C8102E), background `40 20% 97%` (#F9F8F6), foreground `100 15% 5%`, muted text `40 8% 42%`, border `40 12% 88%`, success `142 55% 32%`, warning `38 92% 46%`, destructive = primary. Dark: background `214 50% 7%`, card `214 40% 11%`, primary `356 74% 55%`. Radius 12/8/16 px.
Type: **Inter** app-wide (scale 11/13/14/15/20/28/40, KPI 52, cv11); **Newsreader** + **Kalam** on the India landing only (`components/home/fonts.ts`); **Lora** on US marketing pages only (`app/us/layout.tsx`).
Rules: red-only heatmaps/mastery (no rainbow); no thick left accent bars on generic tiles; equal columns; no em/en dashes on certificates (DB check); firm names as text, never logos; illustrative accounts labelled as such. Voice: sharp, structured, slightly competitive Indian English. Career ladder: Day 0 Dreamer → Casebook Collector → MECE Believer → Deck Polisher → Fundae Machine → PPO Chaser → Summer Legend → Shortlist Maker → Final Round Regular → Day 1 Hero. Logo files: `Claude outputs/MECE_logo_*`.
Known drift: raw amber/emerald classes in older components; Razorpay theme `#0F172A`.

---

## 15. CONTRACTS (full text in `CONTRACTS.md`)
C1 `cases` table (v4) · C2 scoring return keys (v2) · C3 casebook Page schema (v2) · C4 API/route contract (v1 + additive notes) · C5 curriculum data (69 guesstimates `G-01…G-69`) · C6 `users` table (v1) · C7 coupons & deck submissions (v2) · C8 vault storage paths `gdrive:` (v1) · C9 clarification quota (v2) · C10 II signed identity assertion (proposed, `interview-intelligence/docs/C_API_CONTRACT.md`). Additive changes since: `feedback_json.approaches`; `/seo/telegram/*`, `/seo/daily/send/{id}`, `/cron/daily-blog`; `/ii/*`; `cases.market`, `cases.unlisted`; `submissions.attempt_id`; `case_figures`. CONTRACTS.md has not been updated for these — do it when next touched.

---

## 16. FEATURE STATUS REGISTER (authoritative; update when a status changes)
Legend: LIVE · LIVE-PAID · BETA (gated) · DEV (in development) · DORMANT (built, waiting) · OFF (disconnected) · STATIC (hand-curated content) · ISSUE (live with a known problem, see §17).

| Area | Feature | Status | Notes / key files |
|---|---|---|---|
| Practice | AI case interviewer (text) | LIVE | V12; `services/interview_engine.py` |
| Practice | Guesstimates + arithmetic backstop | LIVE | `guesstimate_backstop.py`, `lib/scoring/*` |
| Practice | Clarification quota 7/12/20 | LIVE | C9 |
| Practice | Dictation, photo-of-notes | LIVE | `/transcribe`, `/extract-text` |
| Practice | Live voice (Gemini Live / Realtime / pipeline) | LIVE | 14-min free trial (2026-10-03) |
| Practice | Results 7 slides, three approaches | LIVE | `app/(app)/results/[id]` |
| Practice | Worked case figures | LIVE-PAID (Pro) | `case_figures` |
| Practice | History of conversations | LIVE | |
| Practice | Leaderboards (All India, daily, college) | ISSUE | restored rows; copy bug |
| Practice | Dashboard (hero, streak, constellation, ladder, heatmap) | LIVE | India top section 2026-09-30; US v3 dashboard |
| Practice | Adaptive learning model / skill profile | BETA | UI controls flag-gated |
| Practice | Exemplar bank | DORMANT | migration + approvals |
| Practice | Unified interviewer brain | DEV | branch, default off |
| Learn | Casebook A–H, primers (27), competitions, Data Atlas, glossary, MECE guide | LIVE | free |
| Learn | US learn library + SEO pages | LIVE | since 2026-09-27 |
| GD | News briefs | ISSUE | irregular feed; status probe says Down |
| GD | Topic Radar | STATIC / ISSUE | "added today" hard-coded |
| GD | Abstract GD | ISSUE | library empty |
| Tools | CV Pointer Lab | LIVE-PAID (Pro; 2 free tries) | |
| Tools | Deck Vault + public deck pages | LIVE | 82 decks |
| Tools | Cheat sheet + share PDF | LIVE-PAID (Lite+) | |
| Tools | Prep Copilot v2 | DEV | out of Pro/nav 2026-10-05; `/coach` by URL |
| Tools | Interview Intelligence | BETA | admins + 2 test users; plans hidden |
| Money | Razorpay INR; USD/EUR + region lock; coupons | LIVE | |
| Money | Deck purchases | LIVE | 2 sales |
| Money | Institution plan | BETA (lead form) | no product |
| Money | Deck Vault Rewards | OFF | admin redirects |
| Growth | Guest mode, session lock, PWA | LIVE | |
| Growth | Email digests/broadcasts by market | LIVE | |
| Growth | Insights + daily blog | LIVE (thin) / DORMANT | blog off until `DAILY_BLOG_ENABLED` |
| Trust | Certificates + verify; offer letters | LIVE | 5 certificates; offer_letters migration run status unknown |
| Trust | Testimonials, endorsements, team | ISSUE | founder testimonial in the set |
| Platform | AI provider router, budget kill switch, Telegram alerts | LIVE | |
| Platform | Admin analytics/funnel | ISSUE | mixed windows |
| Platform | Status page | ISSUE | contradictory |
| Platform | Agentic AI orchestrator | BETA (admin demo) | |

---

## 17. KNOWN ISSUES / TRUTH CHECK (as of 2026-10-06)
1. **Topic Radar "6 updates added today"** — hard-coded to `'22 Sep 2026'` in `app/(app)/gd-briefs/radar/page.tsx:34`. HIGH.
2. **Leaderboard** — 17 rows from `SEED_LEADERBOARD.sql` (3 real + 14 `@leaderboard.mece.in` placeholders keyed to real LinkedIn handles); their "solves" = points ÷ 62 (estimated); owner account #1. Confirm consent; label or exclude before client demos. HIGH.
3. **Status page** shows "All systems live" and "News Pipeline Down · Could not read headlines" together (3 and 6 Oct). Headlines did arrive 5 Oct, so the probe is wrong; feed is irregular (on 3 Oct newest was 1 Oct). On 6 Oct the today's case/guesstimate rows were blank though both were live. HIGH.
4. Founder's own quote among 17 published testimonials. MED.
5. Methodology claims "periodically reviewed against placement outcomes" (no mechanism) and an FMS Delhi "3-Layer Strategic Alignment" framework (unsubstantiated). MED.
6. Funnel mixes windows (signups all-time vs a few days of page events → 113%); all-time view captioned "Last 7 days". MED.
7. "All time" analytics covers ~4 days of session data. Check `page_events` retention/cleanup. MED.
8. AI usage files Gemini Live voice ($4.97 of $5.74) under "Other". MED.
9. Two user counts (224 vs 376+13). Define "user" once. MED.
10. `lib/constants.ts` comment says voice OFF; production runs it. MED.
11. Brain was stale (STATE hand section from Aug; CHANGELOG stopped 12 Sep; LEDGER missing features) — fixed in this rewrite. MED.
12. II error rates on first attempts (jd_parse 8/10, cv_parse 2/3, Gemini Live 3/3, evidence 4/10) recovered by fallbacks; still beta quality. MED.
13. `/practice` selects all ~420 cases `*` and paginates client-side; slow tab. MED.
14. News-derived cases all typed PROFITABILITY. LOW.
15. Abstract GD library shows 0 generated briefs. LOW.
16. Leaderboard copy "You're #1 … break into the top 34". LOW.
17. Usage is founder-heavy (311/873 AI calls in 14 days). Exclude internal accounts in any metric quoted externally. LOW.
18. Brand hex comments vs actual HSL; Razorpay `#0F172A`. LOW.
19. Points update is read-then-write (race). LOW.
20. In-memory rate limiter. LOW.

---

## 18. RISKS (likelihood × impact)
High×High: R1 founder dependency / AI-written code not fully understood · R7 trust claims (items 1–5 above) · R9 monetisation (10/224 paying, ₹9.5k).
High×Med: R3 three-region latency · R5 thin tests (no frontend tests; CI = SEO only) · R13 brain drift.
Med×High: R2 Render free plan shared with II · R4 untracked migrations · R6 content rights (81 corporate decks from other teams; rubric distilled from other schools' casebooks).
Med×Med: R10 model/vendor drift ($10 kill switch stops everything at once).
Low×High: R8 privacy (Gemini free tier for CV/JD; plaintext secrets file on D:).
Low×Med: R11 in-memory rate limits. Low×Low: R12 points race.

---

## 19. CLEANUP BACKLOG (nothing here is used at run time; git keeps history)
- **Frontend root:** delete `*.patch` (4) + `__agentic_patch/`, `temp.sql` (UTF-16 CLI help dump), `count.js` (UTF-16), `_mvtest2.tmp`, `commit_msg.txt`, `push_out.txt` (untracked), `update_brain.py`, `update_brain2.py` (hard-coded `C:\` path), `implementation_plan.md`, `APPLY_STAGE2.md`, 15 `.tsc-*.json`, `*.tsbuildinfo`, `backend/services/badge_awarder.py`, `services/news_to_case.py`. Move to `supabase/ops/`: `CLEANUP_DUPLICATES.sql`, `DEDUP_DUPLICATE_NAMES.sql`, `FORENSIC_pro_without_payment.sql`, `LEADERBOARD_AUDIT.sql`, `SEED_LEADERBOARD.sql`, `WIPE_LEADERBOARD.sql`, `supabase_migration_offer_letters.sql`. Choose one lockfile (`package-lock.json` vs `yarn.lock`; CI uses yarn). `eslint-config-next` 16 vs Next 14; lint ignored in builds.
- **Backend root:** delete `mece-agentic-backend.patch`, `mece-coach-backend.patch`, `services/deckvault_backend.patch`, `eval/README-1.md`, `eval/interviewer_eval-1.py`, `test_run.py`, `keep_alive.py`; archive `eval_report.json`, `tools/eval_result_*.txt`; fold `RENDER_OOM_FIX.md`, `APPLY_BACKEND.md` into this file. ~19 files show CRLF/LF-only diffs (`git diff --ignore-all-space` is empty): add `.gitattributes`, renormalise once; until then **never `git add -A`** in the backend.
- **Database:** one migrations folder + a run-log table; resolve the duplicate 0055; decide on Deck Vault Rewards tables.
- **Workspace:** empty `_to_delete/` (stale git locks); merge or drop `feat/unified-interviewer-brain` then `git worktree prune`; move `_notes/INTERVIEW_INTELLIGENCE_SECRETS.txt` into a password manager; archive `Claude outputs/` and the phase folders.
- **GitHub:** delete 13 merged frontend and 9 merged backend remote branches.
- **.brain:** README/OPERATING_GUIDE still describe "only Antigravity touches git"; update to the real process (§23).

---

## 20. ROADMAP AND OPEN DECISIONS
**Now:** fix §17 items 1–5 · fix the status probe + stale-headline alert · one user definition, one funnel window, voice mapped in cost report · run the cleanup · commit this brain and run `sync.mjs`.
**Next (30 days):** placement-cell pilot (cohort dashboard per college reusing college leaderboards, analytics, certificates) · fix the activation leak (69% of onboarded users never start a case) · backend to a paid instance co-located with the DB · smoke tests (start → message → submit → score; payment webhook) · II parse fixes, then the free interview for every account.
**Later:** merge or retire the unified brain · scoring calibration study vs human graders · cohort retention metrics · consent/licensing for vault decks · price live voice and Ultra on measured cost/minute.
**Owner decisions pending:** B2B offer and pricing · Prep Copilot launch date (`PREP_COPILOT_IN_NAV`) · II launch and prices (`ii.enabled_for_pro`, Ultra) · enable daily blog (`DAILY_BLOG_ENABLED`) · leaderboard restored rows · Render plan · Gemini free tier for documents.

---

## 21. DECISIONS LOG (condensed, dated)
- 2026-05-19/20 Next.js 14 App Router + Supabase + Tailwind; separate FastAPI repo; Razorpay (INR) over Stripe; 6-dimension 100-point rubric with keys `business_judgment`, `presence`; tiers lowercase `free|lite|pro`; IST is the product clock.
- 2026-06-02 daily content generated by GPT-4o (today only) instead of curated rotation; `/home` merged into `/dashboard` (redirect); no separate `guesstimates` table — guesstimates are `cases` rows with `type='guesstimate'`.
- 2026-06-04 free tier gated on case access (daily pair), not on conversation quality.
- 2026-06-20 annual plan dropped (monthly + 3-month).
- 2026-07-17 coupons validated server-side (C7); Deck Vault Rewards launched (later disconnected); 2026-07-18 rewards discounts 35%/25%.
- 2026-08-01 clarification ladder 7/12/20; interviewer temperature 0.75 with penalties; scoring stays low-temperature.
- 2026-08-13 voice built on the existing turn loop (pipeline) to keep every guard server-side.
- 2026-08-16 voice switched off (not ROI-positive at ₹599).
- 2026-09-12 holistic scoring; three approaches mandatory; exemplar bank approved-only.
- 2026-09-20 worked case figures are Pro and stored server-only.
- 2026-09-22 GD surfaces on the Gemini free tier, OpenAI last in chain.
- 2026-09-25 international launch: Lite $29 / Pro $49 (EUR same), quarter $69/$119; market lock; INR with foreign card refunded.
- 2026-10-01 V11 adaptive interviewer is the only interviewer; V12 response functions ("function first, language second").
- 2026-10-02 II runs inside the backend at `/ii` (host mode) to stay on the free plan.
- 2026-10-03 voice back via Gemini Live with a 14-min free trial (7 per case); II plan limits.
- 2026-10-05 Lite restored after a brief retirement; Prep Copilot removed from Pro while in development; daily blog with Telegram approval (off by default).

---

## 22. GOTCHAS (each one has bitten before)
- Vercel env vars must exist in **both** Production and Preview.
- `lib/supabase/static.ts` keeps a placeholder client on the server so a missing env var cannot fail the static export.
- `next.config.js` aliases `fontkit` to false **only on the server**; the browser needs it for PDF fonts.
- Postgres `ON CONFLICT (code)` needs a full unique index (partial → 42P10).
- A user can read every column of their own row via PostgREST: keep paid data in server-only tables.
- Gemini's OpenAI-compatible API: no `response_format=json_object`; model names retire without notice (use env).
- Whisper returns "Thank you." / "you" on silence — keep the noise guard.
- MediaRecorder: never trim the first chunk (container header); Safari records `audio/mp4` — use the recorder's mimeType.
- FastAPI CORS sets no `expose_headers`: custom response headers are invisible to the browser.
- TTS is priced per character: computing it through `PRICES` books $0 and hides spend from the budget.
- Render free: 512 MB, sleeps after ~15 min; GitHub Actions schedules stop after 60 days of repo inactivity.
- Migrations can land after code: select defensively and fall back when a column is missing.
- Manual SQL edits to `points`/plan need the service-role JWT-claim trick (guard trigger).
- Backend repo: CRLF churn — add files explicitly.
- Cloud shells that cannot delete files: use lock-free git reads; never commit/pull from them.

---

## 23. HOW WORK ACTUALLY HAPPENS
- One founder (Satyam) with Claude sessions (web, Cowork/desktop, cloud) and, originally, Antigravity as the only merger. In practice since July, brains author and commit directly to `main` with the owner. Handoffs are still written to `.brain/handoffs/` (63 files) as design records with `touches` / `breaking` / gates.
- Shared drive `D:\dev\mece` used from two Windows profiles; GitHub is the sync line. Pull first, one profile edits at a time, push + `node .brain\sync.mjs` at the end.
- `.brain/` files: this file (durable truth), `STATE.md` (auto top + hand notes), `LEDGER.md` (feature table mirrored into STATE), `CONTRACTS.md`, `CHANGELOG.md` (newest first; was stale 12 Sep → 5 Oct, reconstructed entry added 2026-10-06), `SESSION_PREAMBLE.md`, `OPERATING_GUIDE.md`, `README.md`, `sync.mjs`, `handoffs/`.
- The claude.ai Project "mece" holds a copy of this file plus research reports (`claude/MECE_*.md`).

---

## 24. METRIC DEFINITIONS (use these when quoting numbers)
- **User:** registered, non-anonymous, non-internal (exclude `is_admin`, `is_demo`, seed/placeholder emails).
- **Paying customer:** a user with at least one customer payment in `payments` (admin grants excluded).
- **Active:** submitted at least one scored case in the window.
- **Activation:** first scored case. **Conversion:** first payment.
- Quote the date and source with every number.

---

## 25. MECE VOCABULARY
Daily pair · unlisted case · case figures · response function · control packet · session signals · validity gate · arithmetic backstop · exemplar bank · readiness score · skill constellation (22 skills, 7 clusters) · career ladder (10 tiers) · market (IN/US/EU) · brains / worker / handoff · contracts C1–C10 · II. A plain-language glossary of every tool (npm, Next.js, RLS, JWT, SSE, VAD, webhook…) is in the Platform Atlas, chapter 15.

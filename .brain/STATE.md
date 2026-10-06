<!-- AUTO-GENERATED above the marker by .brain/sync.mjs — do not hand-edit this section. Last run: 2026-10-06 16:17 -->
# STATE — what is true right now

**Repo:** mece (frontend: Next.js 14 / Supabase / Razorpay) + backend (FastAPI)
**Branch:** main (frontend) / main (backend)
**Last landed:** 2026-10-06 - brain-rewrite + reconstructed log 2026-09-12..2026-10-05 - frontend 1dcc819 / backend 9f71870
**Last sync:** 2026-10-06 16:17 UTC

## Last 5 commits — frontend
- e7457e9 fix(insights): compact masthead - wider two-line standfirst, smaller title, lead essay starts ~250px higher (SatyamSK, 2026-10-06)
- f281ed4 feat(insights): photo credits with licence links, topic colours for old posts, rewrite and picture tools in Admin (SatyamSK, 2026-10-06)
- 7d23248 feat(nav): Insights in the top bar (Case Competitions moves to More); breadcrumbs on Insights (SatyamSK, 2026-10-06)
- 3caa073 feat(insights): essay-magazine redesign (Aeon-style) with Gemini pictures (SatyamSK, 2026-10-05)
- 1dcc819 docs(brain): daily-blog handoff v2.1 - retired Gemini models, research fallbacks (SatyamSK, 2026-10-05)

## Last 5 commits — backend
- 6e48abe feat(growth): real open-licensed photos, deeper essays, rewrite old posts (SatyamSK, 2026-10-06)
- 0b29931 feat(growth): Gemini pictures for MECE Insights articles (SatyamSK, 2026-10-05)
- 9f71870 fix(growth): daily blog research works when Gemini models are retired; OpenAI web search fallback (SatyamSK, 2026-10-05)
- 8a564b6 fix(growth): daily blog actually publishes - robust sourced research, publication-grade writing, Telegram review (SatyamSK, 2026-10-05)
- bbac83c feat(growth): daily blog autopilot - one sourced article a day on /insights (dormant until DAILY_BLOG_ENABLED) (SatyamSK, 2026-10-03)

## Open feature branches (not merged into main)
- origin/feat/unified-interviewer-brain

## Per-feature status (mirror of LEDGER.md)
| Feature | Owner brain | Branch | Status |
| --- | --- | --- | --- |
| **Case interviewer (text, V12)** | any | main | **LIVE** — V12 response functions; interviewer on gpt-4o-mini via admin override (2026-10-01) |
| **Unified interviewer brain** | any | feat/unified-interviewer-brain | **IN PROGRESS** — both repos, behind `INTERVIEWER_BRAIN` (default off), last commit 2026-10-01, not merged |
| **Scoring (holistic + backstop + figures + exemplars)** | any | main | **LIVE**; exemplar bank DORMANT until `migrations/2026-09-12_case_exemplars.sql` runs and entries are approved |
| **Learning model / skill profile** | any | main | **BETA** — data written; coached UI controls flag-gated (migrations 0066–0068) |
| **Voice (dictation + live voice)** | any | main | **LIVE** — Gemini Live / OpenAI Realtime / pipeline; free trial 14 min (7 per case) since 2026-10-03; `lib/constants.ts` "voice OFF" comment is stale |
| **Dashboard** | A | main | **LIVE** — India top section (2026-09-30), US v3 dashboard (2026-09-27), constellation, ladder, heatmap |
| **Practice hub + daily pair** | B | main | **LIVE** — ~420 India items; loads all rows client-side (perf issue) |
| **Leaderboards** | C | main | **LIVE, ISSUE** — 17 restored rows with estimated solves; copy bug |
| **Casebook / primers / competitions / Data Atlas / glossary** | C | main | **LIVE** — 110 content files, 27 primers, 10 competition chapters, 75 terms |
| **GD (news briefs, Topic Radar, Abstract GD)** | C | main | **LIVE, ISSUE** — feed irregular and status probe says Down; Radar hand-curated with hard-coded "today"; Abstract library empty |
| **US & Europe market** | any | main | **LIVE** since 2026-09-25 — USD/EUR, region lock, US bank 57+57, per-market daily, US learn/SEO |
| **Payments (Razorpay) + coupons** | B | main | **LIVE** — Free/Lite ₹299/Pro ₹599 (Lite restored 2026-10-05); quarter plans; coupons C7 v2; INR-with-foreign-card refund |
| **Auth, onboarding, guest mode, session lock** | C | main | **LIVE** — email/Google/LinkedIn, anonymous guests + Turnstile, single active session |
| **CV Pointer Lab** | C | main | **LIVE** (Pro; 2 free tries) |
| **Deck Vault (library + public pages + purchases)** | A | main | **LIVE** — 82 decks, 25% free pages, 2 sales |
| **Deck Vault Rewards** | Cowork | main | **OFF** — disconnected; admin page redirects |
| **Cheat sheet + share PDF** | B | main | **LIVE** (Lite+) |
| **Prep Copilot v2** | any | main | **IN DEVELOPMENT** — removed from Pro and nav 2026-10-05 (`PREP_COPILOT_IN_NAV=false`); `/coach` opens by URL |
| **Interview Intelligence** | any | main | **BETA** — mounted at `/ii`; admins + 2 test users; plans hidden (Free 10 min, Pro 20 min ×2/month, Ultra) |
| **Agentic orchestrator / coach v1 (admin demos)** | any | main | **BETA (admin)** — simulation default, live mode available |
| **AI provider router + usage + budget** | any | main | **LIVE** — live toggles, fallback to OpenAI, $10/day kill switch, Telegram alert; Gemini Live mis-filed as "Other" in the report |
| **Email broadcasts + digests** | any | main | **LIVE** — Resend, segments, India/US audiences, targeted practice (unlisted cases, 0065) |
| **Growth: insights + daily blog** | any | main | **LIVE (thin) / DORMANT** — `/insights` public 2026-10-03; daily blog built, off until `DAILY_BLOG_ENABLED`, Telegram review |
| **Admin console** | C | main | **LIVE** — 20 sections; Status page contradicts itself; analytics windows mixed |
| **Certificates + offer letters** | Cowork | main | **LIVE** — 5 certificates; offer_letters migration run status unknown |
| **Testimonials, endorsements, team** | C | main | **LIVE, ISSUE** — 17 testimonials incl. the founder's own |
| **Landing pages (India + US)** | C | main | **LIVE** — editorial India landing (2026-09-29), premium US landing with MCQ warm-up |
| **Analytics (page events, funnel)** | any | main | **LIVE, ISSUE** — ~4 days of session history; funnel windows mixed |

<!-- HAND-MAINTAINED BELOW THIS LINE — sync.mjs preserves everything under this marker -->

## READ THIS FIRST (hand section rewritten 2026-10-06)
The hand notes that used to live here (August "IN FLIGHT" voice work, July Vercel/Deck-Vault blockers) were all
resolved or superseded and were misleading every session. They are in git history. Current truth lives in
**PROJECT_BRAIN.md** (v3, rewritten 2026-10-06): §16 status register, §17 known issues, §20 roadmap.

## Open items that matter right now (2026-10-06)
- **Before any client demo:** Topic Radar "updates added today" is hard-coded to 22 Sep; leaderboard top rows include
  17 restored accounts with estimated solves (owner account is #1); Status page says "All systems live" and
  "News Pipeline Down" at once; one testimonial is the founder's; methodology claims outcome calibration.
- **Open branch:** `feat/unified-interviewer-brain` (both repos, default off, last commit 2026-10-01).
- **Dormant until switched on:** daily blog (`DAILY_BLOG_ENABLED`), exemplar bank (migration + approvals),
  Interview Intelligence for Pro (`ii.enabled_for_pro`), Prep Copilot in nav (`PREP_COPILOT_IN_NAV`).
- **Migrations:** run by hand, three folders, no run log; two files numbered 0055. Confirm 0065–0070 and the
  backend `migrations/2026-09-*` files ran in production before relying on their columns.
- **Backend repo:** ~19 files differ only by line endings. Never `git add -A` there.
- **Cloud/remote shells:** use `git --no-optional-locks` for reads; never commit or pull from a shell that cannot
  delete files (it leaves `.git/index.lock`). Stale locks go to `D:\dev\mece\_to_delete\`.

## Reminder for every brain
Read PROJECT_BRAIN.md §0, then the top of CHANGELOG.md. If a `BREAKING` entry lists your feature in `affects:`,
re-read the changed CONTRACTS.md surface before writing anything. Run `node .brain/sync.mjs` after every push.

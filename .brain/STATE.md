<!-- AUTO-GENERATED above the marker by .brain/sync.mjs — do not hand-edit this section. Last run: 2026-08-25 22:12 -->
# STATE — what is true right now

**Repo:** mece (frontend: Next.js 14 / Supabase / Razorpay) + backend (FastAPI)
**Branch:** main (frontend) / feat/deck-vault-cleanup (backend)
**Last landed:** 2026-08-13 — fix-vercel-build-blocker — <pending commit; branch feat/voice-interview>
**Last sync:** 2026-08-25 22:12 UTC

## Last 5 commits — frontend
- 6db1071 feat(landing): de-geo positioning + interactive interview sim hero (satyam11081998-lab, 2026-08-26)
- c64de3d feat(broadcast): custom full-width HTML send + free SMTP reliability (verify, throttle, maxDuration); email assets; fix(payments+security): verified payments, test-key guard, column lock; remove nav sign-out (satyam11081998-lab, 2026-08-23)
- 7c3c4e4 feat(broadcast): custom full-width HTML send (auto-detect) + free SMTP; email assets; fix(payments+security): verified payments, test-key guard, column lock; remove nav sign-out (satyam11081998-lab, 2026-08-23)
- 875d45f feat(broadcast): custom full-width HTML send (auto-detect) + free SMTP; email assets; fix(payments+security): verified payments, test-key guard, column lock; remove nav sign-out (satyam11081998-lab, 2026-08-23)
- 0e1256e Add files via upload (satyam11081998-lab, 2026-08-23)

## Last 5 commits — backend
- eadf808 chore(deps): add google-generativeai for backend Gemini synthesis (satyam11081998-lab, 2026-08-20)
- f49a9d1 fix(deckvault): live Gemini model, tolerant JSON parse, company + SEO description (satyam11081998-lab, 2026-08-20)
- 2eaf279 Add unified deck pipeline with Gemini AI and master audit script (satyam11081998-lab, 2026-08-20)
- 21aee54 feat(decks): build automated case deck batch ingestion pipeline with zero-hallucination verification (satyam11081998-lab, 2026-08-19)
- 11d29ac feat(decks): lighter watermark - no bar, 43% text (satyam11081998-lab, 2026-08-17)

## Open feature branches (not merged into main)
- (none)

## Per-feature status (mirror of LEDGER.md)
| Feature | Owner brain | Branch | Status |
| --- | --- | --- | --- |
| **Dashboard** | A | feat/dashboard | **Wired to live data + perf + mobile + dark-mode BUILT & LIVE (2026-06-08)** |
| **Casebook** | C | feat/casebook | Core+Toolkit BUILT; Misc BUILT; **Guesstimates section real + promoted to B, Pain&Promise page (§9.38), method modules (P2-4) BUILT; P5 cheat sheet + P6 worked solve pending; clarifying-question dropdowns on all 52 worked examples BUILT; MECE page added as first Core Framework (2026-06-20)** |
| **Case solve UX** | A | feat/solve | **BUILT; free-tier clarification-counter fix 2026-06-20; practice-hub domains + read-only deep-links removed 2026-06-21; clarification-quota dead-end fixed 2026-08-01 (free 7 / lite 12 / pro 20, interviewer never goes silent, migration 0043)** (unified workspace §9.39–9.41) |
| **Guesstimate end-to-end** | B | feat/guesstimate | **BUILT & LIVE** (verified 2026-06-06) |
| **Scoring backstop** | B | feat/guesstimate | **BUILT & LIVE** (verified 2026-06-06) |
| **Daily content + admin + keep-alive** | B | feat/daily | **BUILT** (daily scheduler live) |
| **News pipeline** | B | feat/daily | **BUILT** (self-heal live) |
| **Voice + image input** | B | feat/io | **BUILT** |
| **Voice interview (talk mode)** | Cowork | feat/voice-interview | **BUILT 2026-08-13, NOT YET MERGED** — gates green (tsc EXIT 0, py_compile EXIT 0, 14/14 unit cases); needs a real-browser QA pass + the env-var raise before unflagging |
| **Payments (Razorpay + audit trail)** | B | feat/payments | **BUILT; annual dropped 2026-06-20 (2901f0b); optional server-validated coupon path added 2026-07-17 (C7)** |
| **Rate limiting** | B | feat/backend | **BUILT** |
| **AI evaluation v2** | B | feat/eval | **BUILT** |
| **Deck Vault & DRM (library)** | A | feat/deck-vault | **BUILT & SECURED** (react-pdf + blackout + watermark); **now also receives auto-published rows from Deck Vault Rewards approvals (2026-07-17)** |
| **Deck Vault Rewards** | Cowork | (landed direct-to-main) | **BUILT & LANDED 2026-07-17** (849a0dc, 47764c2, 1f49694 + backend 41a5f50, 6a7f496; one pending commit: Drive file_type fix). **Deploy blocked — see STATE blockers** |
| **GD Cheat Sheet (Pro)** | B | feat/cheatsheet | **BUILT** |
| **Onboarding & Profile** | A | feat/onboarding | **BUILT & LIVE (2026-06-08)** |
| **Industry Primers** | A | feat/industry-primers | **BUILT (20 primers); full-screen overlay + native fullscreen + collapsible nav (2026-06-20)** |
| **Auth** | C | feat/auth | **BUILT (LinkedIn OIDC added)** |
| **Onboarding (LinkedIn prefill)** | C | feat/auth | **BUILT (LinkedIn prefill + connected hint)** |
| **Admin** | C | feat/admin | **BUILT (Status page, Delete User; Deck Rewards section added 2026-07-17)** |
| **Certificates** | Cowork | (landed direct-to-main) | **BUILT & COMMITTED 2026-08-11** (464f806, 4120ca4, 5019501, e5174da + backend edafb57). Migration 0046 NOT yet run; `npm run build` NOT yet run |
| **GD Briefs** | C | feat/gd | **BUILT (Abstract GD track + shared library, domains added)** |
| **Leaderboard** | C | feat/leaderboard | **BUILT (college + LinkedIn opt-out, logo updated)** |
| **Endorsements** | C | feat/endorsements | **BUILT** |
| **Colleges** | C | feat/db | **BUILT (0020 refreshed tiers)** |
| **Resume Lab / CV Pointer Lab** | C | feat/resume | **BUILT (v1 Builder, AI rebuild/refine/generate/fit, strict char-band, print-to-PDF); prompt policy fix 2026-07-17 (7adc9d2): placeholders-not-questions, impact-first** |
| **Feedback & flagging** | C | feat/feedback | landed |
| **Testimonials + Admin** | C | feat/testimonials-admin | **BUILT** |
| **Engaging Loading** | C | feat/engaging-loading | landed |
| **UI Batch 2** | C | feat/ui-batch-2 | landed |
| **Mobile Polish** | C | feat/mobile-polish | landed |
| **Legal/static pages** | (shared) | feat/legal-refund | Refund contrast fix + policy update (privacy/terms live). **Deck Vault Rewards T&C awaits legal review (2026-07-17)** |
| **Input size limits** | B | feat/input-limits | BUILT (answer/question/recommendation max 20k) |
| **Dynamic domains (case_tags)** | B | feat/dynamic-domains | DB BUILT (migration verified); UI pending |
| **Landing (hero demo + vignettes + ISR)** | C | feat/landing | **BUILT (2026-07-10/14)** |
| **Free-tier rework** | C+B | feat/free-tier | **BUILT frontend (c96e952) + backend (f254eba)**; LinkedIn-follow perk (0040) live |

<!-- HAND-MAINTAINED BELOW THIS LINE — sync.mjs preserves everything under this marker -->

## 🔧 IN FLIGHT (2026-08-13, Cowork brain — branch `feat/voice-interview`, both repos)
**voice-interview-mode (talk mode)** — the candidate speaks the case and hears the
interviewer back, cases AND guesstimates. Pipeline over the EXISTING turn loop
(mic → VAD → `/transcribe` → `send('voice')` → attempts SSE → new `POST /speak` → playback),
so scoring, quota, rate limits and persistence are all the current code paths.
See CHANGELOG top entry + `handoffs/ANTIGRAVITY_HANDOFF_voice-interview-mode.md`.
- **Contract:** C9 bumped v1 → v2 (counting method for spoken turns only — ladder
  unchanged at free 7 / lite 12 / pro 20). C4 additive note for `POST /speak`.
- **No migration.** `attempt_messages.kind` already accepted `'voice'`.
- **Gates:** `tsc --noEmit` EXIT 0, `py_compile` EXIT 0 (6 files), 14/14 unit cases.
  `npm run build` NOT COMPLETED in the Cowork sandbox (mounted-FS build exceeds the tool
  timeout — same limit as the certificates entry). **Run it on the real tree.**
- **NOT QA'd in a browser** — mic, autoplay and VAD tuning cannot be tested headless.
- **BEFORE UNFLAGGING:** raise `AI_VOICE_MIN_PRO` (~150-180) and `AI_TTS_MIN_PRO` on the
  backend host (one spoken case eats 20-40 of the current 60 daily Whisper minutes), and
  audition the TTS voice (`TTS_VOICE` env, default `alloy`).

## ✅ LANDED — everything previously listed here as IN FLIGHT is now COMMITTED
Verified against `git log` on 2026-08-13. This section had gone stale by roughly two
weeks and was still telling every brain to treat committed work as a merge hazard:
- **influencer-growth-kit** → `999a5f6` (+ `143d7c8` admin live user list). Migration
  `0044_growth_kit.sql` is committed; confirm it has been RUN in Supabase.
- **interviewer-voice + solve-scroll + daily-done-state** → backend `2824dbc`,
  frontend `dcf2ce0`.
- **fix-clarification-quota-dead-end** → backend `9d80195`, frontend `2c3da6f`.
  Migration `0043` committed; confirm it has been RUN.
- **certificates** → `464f806` and friends. Migration `0046` committed; confirm RUN.
Frontend `main` is clean. Backend `main` carries ONLY the dormant CRLF/LF churn (~19
files, `git diff --ignore-all-space` is empty) — still never `git add -A` there.

<details>
<summary>Historical detail from the stale entries (kept for reference)</summary>

**influencer-growth-kit** — 5 components for influencer marketing launch:
1. Demo/showcase account (`users.is_demo = true`, excluded from leaderboards/activity, session-lock exempt, 77% constellation seeded, skill-graph fallback fixed).
2. Admin Users panel (`/admin/users`, 30-day signup chart, filters, drawer with sessions & IP/city, demo toggle, sign out everywhere).
3. Influencer coupons (C7 v2, public unlimited/capped, list-price commission, ANUSHKA10 seeded, `/admin/coupons` with payout tracking).
4. Single active session lock (Netflix-style `user_sessions`, `/session-conflict` takeover valve).
5. Watermarked PDF cheat sheet with shareable links (`/s/[id]` viewer & file stream).
- **Contract:** C7 bumped v1 → v2 in CONTRACTS.md.
- **Gates:** `tsc --noEmit` EXIT 0, `npm run build` EXIT 0 (286/286 pages), Postgres grammar validated.
- **Migration:** Run `supabase/migrations/0044_growth_kit.sql` after 0041–0043.

## 🔧 IN FLIGHT #2 (2026-08-01, Cowork brain — uncommitted, owner will push)
**interviewer-voice + solve-scroll + daily-done-state** — three UX fixes from owner
testing right after the quota fix. See CHANGELOG top entry +
`handoffs/ANTIGRAVITY_HANDOFF_interviewer-voice-and-daily-state.md`.
- Interviewer stopped sounding like a template ("Let's assume X" on every turn):
  prompt rewrite in BOTH system prompts + `INTERVIEWER_TEMPERATURE 0.4 → 0.75`.
- Solve thread no longer hides its newest turns behind the composer.
- Dashboard daily case + guesstimate show tick/score once attempted.
- **No migration.** Scoped tsc EXIT 0, py_compile EXIT 0. Deploy both repos together.

## ✅ LANDED (local, unpushed at time of writing)
**fix-clarification-quota-dead-end** — backend `9d80195`, frontend `2c3da6f`.
Migration `0043_clarification_quota_uplift.sql` is committed but **still needs to be
RUN in Supabase** — until it does, anyone with an ACTIVE attempt keeps the old 0
quota stamped at `tier_at_start`. Contract **C9** (clarification-quota tier surface)
is now WRITTEN into CONTRACTS.md (v1) — the three constants must move together.

## 🔧 IN FLIGHT (2026-08-01, Cowork brain — uncommitted in the working tree)
**fix-clarification-quota-dead-end** (cross-repo, see CHANGELOG top entry +
`handoffs/ANTIGRAVITY_HANDOFF_clarification-quota.md`). A free user's FIRST question
in a live case returned no interviewer reply at all and a false "Clarification quota
used up" toast. Ladder is now **free 7 / lite 12 / pro 20** per attempt; the
exhausted branch no longer returns early (the interviewer declines in-character
instead of going silent); SSE meta carries `clarifications_spent`.
- **MUST RUN migration `0043_clarification_quota_uplift.sql`** (after 0041 + 0042) or
  anyone holding an ACTIVE attempt keeps the old 0 quota stamped at `tier_at_start`.
- **Deploy both repos together.** Frontend reads `clarifications_spent` from the SSE
  meta event; against a stale backend it falls back to the legacy JSON branch.
- Working tree also still carries the **deck-vault-discount-revision** edits
  (35% / 25%) from 2026-07-18 — uncommitted, unrelated, do not mix the two commits.

</details>

## ✅ BLOCKER 1 SOLVED (2026-08-13) — the Vercel build failure, root-caused at last
**The variables really did "all exist". They were never both in the SAME environment.**
`vercel env ls` on 2026-08-13:
- `NEXT_PUBLIC_SUPABASE_URL` → **Preview only** (Production had none)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **Production only** (Preview had none)

So every production build got a URL of `undefined`, `createStaticClient()` handed it
straight to supabase-js (`as string` on a possibly-undefined env var), supabase-js threw
`supabaseUrl is required`, `/` failed to export, and one unexportable route fails the whole
build. The live site kept serving the last deployment that succeeded — which is why the
site worked while every new deploy silently failed for weeks.

FIXED TWO WAYS:
1. **Config:** both vars added so each is scoped to Production AND Preview.
2. **Code (the durable fix):** `lib/supabase/static.ts` now carries the same
   placeholder-on-server / throw-in-browser guard that `lib/supabase/client.ts` got on
   2026-08-08. That earlier hardening missed `static.ts` — which is the file the LANDING
   PAGE uses (`app/page.tsx:63`, `lib/daily-server.ts:63`) — so the auth pages degraded
   gracefully while `/` still hard-failed and took the deployment with it.
   Verified: a query through the placeholder client RESOLVES with `{data: null}` rather
   than rejecting, and all three callers already fall back (testimonials → hardcoded
   constant, endorsements → `[]`, daily → try/catch default). `/` now renders its
   zero-state instead of failing the export.

**A missing env var can no longer block a deployment.** The build-log warning still fires,
so a real misconfiguration stays visible. Scope-check `vercel env ls` after ANY env change:
a variable in only one environment is the same as absent in the other.

## ⛔ OPEN BLOCKERS (2026-07-17 — read before doing ANYTHING)
> **Blocker 1 below is RESOLVED — see the section immediately above.** Left in place for
> the history of what it cost: three weeks of undeployed work, and an owner who was
> correct the whole time that the variables existed.
1. **Vercel production build FAILING** → the live site still serves pre-deck-vault code.
   Types now pass ("Compiled successfully"); prerender of `/`, `/forgot-password`,
   `/reset-password` dies on missing `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   at build time. Owner says vars "all exist" — prime suspects: (a) vars stored as
   **Sensitive** type / wrong environment scope, (b) project linked to a different
   repo/project than the env list being checked. FIX PATH: recreate both NEXT_PUBLIC_*
   vars as PLAIN vars scoped to Production+Preview (they are public by definition),
   redeploy; or diagnose exactly via `vercel env ls` with a CLI token.
2. **Migration `0041_deck_vault_rewards.sql` must be confirmed run** in Supabase —
   without it every submission 502s and coupons cannot exist.
3. **Backend host env** must receive: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID,
   GOOGLE_DRIVE_REFRESH_TOKEN, GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET,
   GDRIVE_FOLDER_ID (optionally GDRIVE_SUBMISSIONS_FOLDER_ID). Until then: no Telegram
   alerts, submissions fall back to the Supabase bucket (functional, not Drive).
4. **Google OAuth client secret was rotated 2026-07-17** → the OLD secret died; the
   web app threw `invalid_client` on vault uploads. The CURRENT secret must be updated
   in BOTH Vercel and the backend host. Refresh tokens survive rotation; any new
   refresh token must be minted while signed in as the DECK-STORAGE Google account
   (MECE uses separate login vs storage accounts), with OAuth consent in Production mode.
5. **One pending commit** (frontend): Drive file_type fix for auto-publish
   (`actions.ts` deckFileType + `lib/google-drive.ts` fetchFileName). Typechecked EXIT 0.
6. **T&C legal review pending** for the /deck-vault rights-grant text (v2026-07-17).

## Deck Vault Rewards — feature state
Code: fully landed both repos (see commits above) + 1 pending commit. Flow:
/deck-vault upload (deck+cert, T&C) → Drive vault (`gdrive:<id>`, bucket fallback) →
Telegram ping → /admin/deck-vault review (60/40 default, editable) → coupon
MECE-DECK-XXXXXX (single-use, user-locked, 30d, Pro) → /upgrade coupon box →
server-side discount in order/verify/webhook (C7) → approval also auto-publishes the
deck into `deck_skeletons` (C8). NOT yet user-visible in prod (blocker 1).

## Per-feature status
Mirror of LEDGER.md — LEDGER was deduplicated + consolidated 2026-07-17 and is the
single source; read it directly instead of a stale copy here.

## Session hygiene notes (Cowork, 2026-08-13)
- Owner instructed the Cowork brain to BUILD rather than hand off, so this session
  authored code on `feat/voice-interview` in both repos AND updated CONTRACTS/LEDGER/
  STATE/CHANGELOG directly. Same bypass as 2026-07-17; recorded here for the same reason.
  The handoff `handoffs/ANTIGRAVITY_HANDOFF_voice-interview-mode.md` stays as the design
  record and still carries the decision log.
- The IN FLIGHT sections above had been stale for ~2 weeks: every entry was committed.
  A brain reading STATE would have refused to start, or built defensively around a merge
  hazard that no longer existed. Worth a `sync.mjs` run after each push.
- Two bugs found by VERIFYING rather than building, both in the "obviously fine" category:
  the scorer could see which turns were spoken, and adding the TTS model to `PRICES` would
  have logged every voice call at $0 and hidden it from the daily-budget kill switch.

## Session hygiene notes (Cowork, 2026-07-17)
- This session bypassed the worker: Cowork brain authored AND the human pushed to main
  directly. Handoff `handoffs/ANTIGRAVITY_HANDOFF_deck-vault-rewards.md` documents it
  as a reconciliation record + the one pending commit.
- Backend repo working tree carries a dormant CRLF/LF churn (~20 files) — never
  `git add -A` there; add files explicitly until a .gitattributes renormalize lands.
- Stray empty `.brain/` at the parent folder level (outside both repos) was removed;
  THIS folder (repo-root `.brain/`) is the only brain.

## Reminder for every brain
Read the top of CHANGELOG.md next. If a `BREAKING` entry lists your feature in
`affects:`, re-read the changed CONTRACTS.md surface before writing anything.

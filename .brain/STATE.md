<!-- AUTO-GENERATED above the marker by .brain/sync.mjs — do not hand-edit this section. Last run: 2026-08-01 10:53 -->
# STATE — what is true right now

**Repo:** mece (frontend: Next.js 14 / Supabase / Razorpay) + backend (FastAPI)
**Branch:** main (frontend) / main (backend)
**Last landed:** 2026-08-01 — fix-clarification-quota-dead-end — <pending commit; cross-repo>
**Last sync:** 2026-08-01 10:53 UTC

## Last 5 commits — frontend
- 6aed26d feat(deck-vault): structured filters (year/organizer/result/search) + backfill approved submissions into vault (0042); auto-publish + uploader write filter fields (satyam11081998-lab, 2026-07-17)
- 08f163f docs(brain): full 2026-07-17 sync - deck-vault-rewards (S21, C7, C8), ledger dedupe, STATE blockers, sync.mjs hand-section preservation (satyam11081998-lab, 2026-07-17)
- 14e5bc2 fix(deck-vault): derive library file_type from Drive filename for gdrive: paths (fetchFileName) (satyam11081998-lab, 2026-07-17)
- 1f49694 feat: auto-publish approved deck submissions to public Deck Vault library (satyam11081998-lab, 2026-07-17)
- 47764c2 fix(deck-vault): build errors (React18 ref type, CouponRow never-narrowing) + admin file streaming from Drive (satyam11081998-lab, 2026-07-17)

## Last 5 commits — backend
- 6a7f496 feat(deck-vault): store submissions in Google Drive vault (gdrive: paths, bucket fallback); accept TELEGRAM_CHAT_ID (satyam11081998-lab, 2026-07-17)
- 41a5f50 feat(deck-vault): winning-deck upload -> verified discount coupons - private-bucket submissions (deck+cert, magic-byte checks), Telegram admin alert, status endpoint; corporate 60% / b-school 40% (satyam11081998-lab, 2026-07-17)
- 7adc9d2 fix(resume): CV Pointer Lab uses placeholders, not clarifying questions, for missing numbers (satyam11081998-lab, 2026-07-17)
- 59aea78 feat(growth): LinkedIn follow -> one-time free-bank unlock (+1 case, +1 guesstimate) - popup after dailies, lock-screen offer, footer link; server-side claim flag guarded by trg_guard_user_cols (satyam11081998-lab, 2026-07-15)
- e42b55c fix: Deduplicate news headlines by title to prevent repeats (satyam11081998-lab, 2026-07-10)

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

## ⛔ OPEN BLOCKERS (2026-07-17 — read before doing ANYTHING)
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

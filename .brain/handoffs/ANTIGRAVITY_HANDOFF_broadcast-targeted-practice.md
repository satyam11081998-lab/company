# ANTIGRAVITY HANDOFF — broadcast targeted-practice

**STATUS: BUILT by Cowork, 2026-09-16 (cross-repo).** Gates: backend `py_compile` EXIT 0
(6 files), frontend `npx tsc --noEmit` EXIT 0. `npm run build` NOT run here — run it on the
real tree before deploy (precedent: certificates / voice-interview entries).

touches: backend `routes/broadcast.py` (new), `services/broadcast_gen.py` (new), `main.py`,
`routes/submit.py`, `routes/attempts.py`, `services/access_guard.py`; frontend
`supabase/migrations/0065_cases_unlisted.sql` (new), `lib/types.ts`, `lib/access.ts`,
`lib/email/templates.ts`, `app/(app)/admin/email-actions.ts`, `app/(app)/admin/broadcast-composer.tsx`,
`app/(app)/cases/[id]/page.tsx`
breaking: **YES — C1 (cases table): additive column `unlisted boolean not null default false`,
propose v4 -> v5. C4 (API): additive routes `/broadcast/generate-options` + `/broadcast/materialize`.**
No shape/return-key change to any existing surface; the case-access gates gain an additive
early-return only. affects (informational, behaviour unchanged): Dashboard, Guesstimate,
Daily-content (all filter `is_active=true`, unlisted is `is_active=false`), Free-tier rework +
Case solve UX (bank-count now skips unlisted).

---

## What ships
"Targeted practice" in the admin **Broadcast** composer. The admin types a company/topic
(e.g. *Titan - jewellery retail*), picks **Case** or **Guesstimate** + difficulty, and hits
**Generate options** -> ONE backend model call returns **3 distinct DRAFT options** (title, hook,
scenario/prompt, worked solution) - **nothing saved, nothing sent**. The admin picks one; it is
saved as an **UNLISTED case** and a branded **"Practice this ->"** card is injected into the
email body, linking to the live scored `/cases/<id>`. Then they send to a segment as normal.
Case + guesstimate can both be added to one email (multiple cards supported). A **Build the practice email** button then assembles a COMPLETE branded email (subject + intro + case/guesstimate cards + closing) via `baseEmailLayout`, same shape as *Generate today's digest* - loaded into the composer ready to preview, edit and send.

Because attempting a case *is* the conversational scored interview
(`/cases/[id]` -> `ConversationalSolve` -> interview engine -> scorer), one saved option gives a
whole college a real, scored mock from a broadcast email - the row shape matches
`services/content_generator.py` exactly, so the entire downstream loop is inherited unchanged.

## The "unlisted" visibility (the one careful bit)
A case is now one of three states:
- `is_active=true` - normal: daily rotation, practice lists, search, leaderboard.
- `is_active=false, owner_id=<user>` - Copilot **private** case (owner-only). Unchanged.
- **`is_active=false, unlisted=true`** - **broadcast** case: attemptable **by direct link**
  (any tier, incl. free), but NEVER in daily/lists/search/leaderboard (all filter
  `is_active=true`). New.

The **SUBMIT wall is intentionally left intact**: an anonymous guest can work the whole case but
must create an account to be **scored** (`assert_can_submit`). That IS the campaign's sign-up
funnel - "this company is coming, practise this" -> they practise -> they sign up to see the score.

## Gates that had to treat unlisted as attemptable (all deploy-safe)
1. `routes/submit.py` (read/attempt 404 gate) - `and not case.get("unlisted")`.
2. `routes/attempts.py::_load_case` (start attempt + every turn) - `and not row.data.get("unlisted")`.
3. `services/access_guard.py::assert_can_attempt` (authoritative tier/quota gate) - early
   `if case.get("unlisted"): return`.
4. `lib/access.ts::getAttemptAccess` (frontend UX mirror) - `if (caseRow.unlisted) return allowed`.
5. **Bank counting (free + lite, BOTH repos)** - `access_guard._count_bank_used` and the two
   `lib/access.ts` branches now **exclude unlisted** so a goodwill campaign case never consumes a
   recipient's one-time free extra (or a lite user's daily +2). *(Adversarial catch - see below.)*

All five are `.get()`/optional-chained, so **before** migration 0065 they read falsy and behaviour
is byte-for-byte today's. The backend bank-count select of `unlisted` is wrapped in the same
missing-column try/except as `effective_tier_and_guest` (is_guest, 0045), so a backend that
deploys minutes before the migration degrades to today's behaviour instead of 500-ing the
hot path.

## Files
- **Migration:** `consilio/supabase/migrations/0065_cases_unlisted.sql` - adds `unlisted boolean
  not null default false`, a partial index, and a permissive `read unlisted cases by link` RLS
  select policy (OR-combined, can only widen read for unlisted rows; inert if cases RLS is off).
  Idempotent. Mirrors the 0064 pattern for the same table.
- **Backend:** `services/broadcast_gen.py` (new) - `generate_options(topic, kind, difficulty, count)`
  (one gpt-4o call via the `daily_content` provider feature, metered in `ai_usage_log`, returns N
  unsaved drafts) + `save_option(...)` (persists ONE as `is_active=false, unlisted=true,
  owner_id=<admin>, generated=true`). `routes/broadcast.py` (new) - `POST /broadcast/generate-options`
  (admin-gated, rate-limited, `assert_daily_budget`) + `POST /broadcast/materialize` (admin-gated,
  rate-limited; no AI spend). `main.py` - router registered.
- **Frontend:** `broadcast-composer.tsx` - "Targeted practice" panel (generate -> pick -> card),
  cards injected into the live preview + the send path, plus **Build the practice email** which produces a full branded template (subject + body) like the digest. `email-actions.ts` - `generateBroadcastOptions`
  / `materializeBroadcastOption` server actions (verify admin, forward the admin's Supabase JWT to the
  backend which re-verifies `is_admin`). `lib/email/templates.ts` - shared `practiceCard(...)`.
  `lib/types.ts` - `CaseRow.unlisted?`. `cases/[id]/page.tsx` - passes `unlisted` into the gate.

## Deploy (order matters)
1. **Supabase FIRST:** run `0065_cases_unlisted.sql`. (Gate reads are `.get()`-safe, but running it
   first makes the bank-exclusion active and stops `/broadcast/materialize` from erroring.)
2. **Backend** (`consilio-backend`): add files **explicitly** (never `git add -A` - dormant CRLF
   churn): `git add routes/broadcast.py services/broadcast_gen.py main.py routes/submit.py routes/attempts.py services/access_guard.py`, commit, push, redeploy. Needs no new env (reuses
   `daily_content` provider + `OPENAI_API_KEY`).
3. **Frontend** (`consilio`): `npx tsc --noEmit && npm run build`, then `git add` the 7 files below,
   commit, push. `NEXT_PUBLIC_API_URL` must point at the backend (already set for other admin->backend
   calls).
4. **Smoke test:** `/admin/broadcast` -> Targeted practice -> type a company -> Generate -> Use this ->
   confirm a card appears in the right-hand preview. Open the card link `/cases/<id>` as a free (or
   logged-out) user -> confirm the interview loads and is attemptable; confirm submit asks a guest to
   sign up. Confirm the case does NOT appear in `/practice`, search, or the leaderboard, and that a
   free user who practised it still has their one non-daily extra.

## Adversarial pass (what I verified / caught)
- **CAUGHT + FIXED - free/lite bank leak.** The bank counter joins `case_attempts -> cases` by type;
  an unlisted campaign case attempted by a free user would have silently consumed their one lifetime
  non-daily extra. Now excluded in all four counting sites, deploy-safe. This is the one place the
  feature touches Free-tier-rework's surface - additive, no change for non-unlisted cases.
- **Points/leaderboard:** an unlisted first attempt still earns points once (re-attempts return
  early before the points logic, so it is NOT farmable - max `score` once per user per case). The
  case itself never appears on the leaderboard (`is_active=false`). Left as-is (practice earns
  points, consistent with every other case); gate in `routes/submit.py` if the owner prefers zero
  points for campaign cases.
- **Guest funnel intact:** `assert_can_submit` still walls scoring behind an account; unlisted only
  lifts the *attempt* tier/bank gate.
- **Deploy order:** every gate + the bank-count select degrade to today's behaviour if the column is
  absent (`.get()` / try-except / supabase-js `{data:null}`), so a mis-ordered deploy never 500s.
- **RLS:** the new policy is permissive (OR) and cannot restrict any existing read.

## Contract note for the owner (please confirm before merge)
This widens **C1** (cases: +`unlisted`, additive) and **C4** (two additive admin routes). Per the
brain rules I did not edit CONTRACTS.md/STATE.md/CHANGELOG.md - bump C1 v4->v5 and add the C4 note on
merge, `affects:` Dashboard / Guesstimate / Daily-content (behaviour unchanged) + Free-tier rework /
Case solve UX (bank-count skips unlisted).

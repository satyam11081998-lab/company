# ANTIGRAVITY_HANDOFF — fix-clarification-quota-dead-end

**Author:** Cowork brain, 2026-08-01. **Feature:** Case solve UX (LEDGER owner A, `feat/solve`).
**Type:** P0 user-experience bug fix, cross-repo. Reported by the owner from a live
free account on `/cases/018266b2-…` (Maharashtra luxury-bus profitability case).

```
touches:  backend  routes/attempts.py, prompts/interview_prompts.py, services/interview_engine.py
          frontend lib/interview-api.ts, lib/tier.ts, components/solve/ConversationalSolve.tsx,
                   components/pricing-plans.tsx, app/(app)/upgrade/page.tsx, app/pricing/page.tsx,
                   supabase/migrations/0043_clarification_quota_uplift.sql (NEW)
breaking: no existing CONTRACTS.md surface changes.
          PROPOSES a new contract C9 (clarification-quota tier surface) — see "Proposed C9"
          below. NOT written into CONTRACTS.md; owner must approve first per the preamble.
affects:  Case solve UX, Free-tier rework, Payments/Pricing copy, AI evaluation v2 (prompt file)
```

---

## The bug

A brand-new free user opens a live case, asks their first clarifying question, and gets:

- **no interviewer reply at all** — the message sits in the thread unanswered, forever
- a toast reading *"Clarification quota used up — You can keep building notes; submit
  when you have a recommendation."* before they had asked anything
- **no counter** anywhere telling them a limit existed in the first place

## Root cause (three independent faults stacked)

1. **`CLARIFICATION_QUOTA = {"free": 0, ...}`** in `routes/attempts.py`. Free was
   deliberately 0 to match the pricing page's "No … hints", so `quota_exhausted` was
   `True` on turn one.
2. **`count_clarifications()` counts every `?`.** Combined with (1), *any* free-user
   message containing a question mark — including a perfectly good structure that ends
   "…should we look at the cost side too?" — was classified as a clarification and hit
   the exhausted branch. The branch `return`ed a JSON body with
   `assistant_message: None` and **never called the AI**. Free tier was not limited;
   it was broken.
3. **The counter was hidden for exactly these users.** The 2026-06-20 fix `f87fe5d`
   introduced `hasClarifications = quota > 0` to avoid rendering an alarming red
   "Questions remaining: 0" for free tier. Correct at the time, but it removed the last
   remaining signal, so the toast arrived with no context whatsoever.

Contributing drift: `lib/tier.ts` claimed `pro: maxHintQuestions: Infinity` while the
backend hard-capped Pro at 15 — the frontend promised something the server refused.

## The fix

**Owner decisions taken this session** (free tier is gated on case ACCESS — daily pair
+ 1 lifetime extra via `services/access_guard.py` — *not* on conversation quality):

| Tier | Was | Now |
|---|---|---|
| free | 0  | **7** per attempt |
| lite | 5  | **12** per attempt |
| pro  | 15 (frontend claimed ∞) | **20** per attempt |

1. **Ladder raised + made monotonic**, in all three places that must agree:
   backend `CLARIFICATION_QUOTA`, frontend `TIER_LIMITS.maxHintQuestions`, pricing copy.
2. **The dead-end is gone.** The early `return` is deleted. On exhaustion the
   interviewer *still streams a reply*; `build_interviewer_messages()` takes a new
   `clarifications_exhausted` flag which appends `CLARIFICATIONS_EXHAUSTED_DIRECTIVE`
   — decline the clarification in character, redirect to "state an assumption and take
   me through your structure", never mention quotas/plans/billing. Costs one AI call
   per exhausted turn; the session never feels broken.
3. **SSE `meta` gained `clarifications_spent`.** The client toast now fires only on a
   genuinely declined turn. The old client-side inference
   (`quotaRemaining === 0 && assistantText === ''`) also misfired whenever a stream
   errored out on the user's last question.
4. **`clarification_used` clamped on write** (`min(quota, used + clar_count)`) — a turn
   with several `?` could push used past quota and drive `remaining` negative in the DB
   (masked by `max(0, …)` on the way out of the API). Per owner decision the
   per-question count is KEPT (anti-packing), only the clamp is added.
5. **Toast + banner + placeholder copy** corrected, and the counter now renders for
   every tier.
6. **Adjacent fix, same file:** every FastAPI error in `lib/interview-api.ts` was
   surfaced raw — users saw `post message failed (400): {"detail":"Message limit
   reached for this attempt"}` in a toast. New `errorMessage()` helper extracts
   `detail` and falls back to a written sentence.

## Phased build steps + gates

**Phase 1 — backend** (`consilio-backend`, add files explicitly; the repo carries dormant
CRLF churn, never `git add -A` there):
- `routes/attempts.py`, `prompts/interview_prompts.py`, `services/interview_engine.py`
- Gate: `python -m py_compile routes/attempts.py services/interview_engine.py prompts/interview_prompts.py` → **EXIT 0 (verified)**
- Suggested message: `fix(solve): free tier gets a real clarification quota (7/12/20) and the interviewer never goes silent when it is spent`

**Phase 2 — frontend** (`consilio`):
- `lib/interview-api.ts`, `lib/tier.ts`, `components/solve/ConversationalSolve.tsx`,
  `components/pricing-plans.tsx`, `app/(app)/upgrade/page.tsx`, `app/pricing/page.tsx`
- Gate: scoped `tsc -p .tsc-clarification.json` over all six changed files +
  transitive deps → **EXIT 0 (verified)**. Full `npx tsc --noEmit` and `next build`
  still to be run by the worker — the authoring sandbox timed out on the full pass
  (`allowJs: true` + `include: **/*` makes it a multi-minute run), it did NOT fail.
  `.tsc-clarification.json` is left in the repo root alongside the existing
  `.tsc-casebook.json`; delete it if you don't want the extra scoped gate.
- ⚠️ The working tree ALSO holds the uncommitted **deck-vault-discount-revision**
  (35% / 25%) edits from 2026-07-18. Two files carry BOTH changesets —
  `components/pricing-plans.tsx` (60%→35% strip + hint counts) and
  `app/(app)/upgrade/page.tsx` (banner comment + hint counts). They cannot be
  separated by path; either land both changesets together or split with
  `git add -p`.
- Suggested message: `fix(solve): show clarification counter for every tier, correct quota copy, humanise API errors`

**Phase 3 — migration:**
- `supabase/migrations/0043_clarification_quota_uplift.sql`, run **after** 0041 + 0042.
- Gate: idempotent — re-running is a no-op (`greatest()` never lowers a quota, the
  `where` clause matches nothing on a second pass). Only touches `status = 'active'`
  rows; submitted/abandoned attempts are historical and untouched.
- **Without this, every user mid-case keeps the 0 quota stamped at `tier_at_start`
  and stays broken.**

**Phase 4 — deploy:** both repos together. The client reads `clarifications_spent`
from the SSE meta event; against a stale backend it degrades to the legacy JSON branch
(kept deliberately in `postMessageStream`), so ordering is safe but not ideal.

## Test plan

- **Free account, fresh case** — chip reads `Questions remaining: 7` from turn one.
  Ask a question → real streamed interviewer answer, chip drops to 6. *(This is the
  reported bug; it must pass.)*
- **Free account, structure containing a `?`** — still gets a reply (previously silent).
- **Burn all 7** → 8th question: interviewer replies declining and redirecting, chip is
  red 0, banner appears, toast reads "You've used all 7 clarification questions".
  Reload → the decline is in the transcript (it is a persisted assistant message).
- **Free account out of case access** → the whole chat is still locked by
  `lockedOverlay` in `app/(app)/cases/[id]/page.tsx`. Unchanged, verify no regression.
- **Packed turn** (`"Is it X? Or Y? Or Z?"` with 2 remaining) → used clamps at quota,
  `remaining` never negative in the DB.
- **Message limit (200)** → toast reads "Message limit reached for this attempt", not
  raw JSON.
- **Lite / Pro** → 12 / 20, pricing page, /upgrade and /pricing all agree.

## Proposed C9 — clarification-quota tier surface (NOT yet written to CONTRACTS.md)

> **C9 · Clarification quota (tier surface, cross-repo) (v1, 2026-08-01)**
> Source of truth: `routes/attempts.py CLARIFICATION_QUOTA` (backend). Mirrored in
> `lib/tier.ts TIER_LIMITS.maxHintQuestions` and stated in user-facing copy at
> `components/pricing-plans.tsx`, `app/(app)/upgrade/page.tsx`, `app/pricing/page.tsx`.
> Quota is stamped ONCE per attempt from `tier_at_start`, so a constant change needs a
> backfill migration for `status = 'active'` rows.
> Rule: the number lives in three places and they must move together in one commit
> train. A silent disagreement here is what produced the 2026-08-01 P0.
> Affects: Case solve UX, Free-tier rework, Payments/Pricing copy.

Owner: say the word and I'll add this to CONTRACTS.md as C9.

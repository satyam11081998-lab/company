# ANTIGRAVITY HANDOFF — pro/tier expiry enforcement at leaking call sites

**STATUS: BUILT IN THIS WORKING TREE, NOT COMMITTED.** Frontend-only. No migration,
no backend change. Gate `npx tsc --noEmit` = **EXIT 0** (full project, verified).
`npm run build` NOT run on the device (Windows `node_modules`, no npm network here).

touches (frontend, 5 files, all MODIFIED — none new):
- `lib/tier.ts` — widened `hasTier` / `effectiveTier` parameter type only.
- `app/(app)/dashboard/page.tsx` — tier now via `effectiveTier`.
- `app/api/news/[briefId]/to-case/route.ts` — tier now via `effectiveTier` (+ selects expiry col).
- `app/(app)/admin/users/page.tsx` — admin list tier now via `effectiveTier`.
- `app/(app)/admin/users/actions.ts` — admin detail tier now via `effectiveTier`.

breaking: **no contract surface.** CONTRACTS.md C9 (`TIER_LIMITS.maxHintQuestions`
ladder) is UNTOUCHED. This is a behaviour FIX: at four sites an expired pro/lite
subscription was still treated as paid; it now falls back to `free`, which is the
already-documented intent of `effectiveTier` ("if expires_at is past, user falls back
to 'free'"). affects: dashboard quota/next-action, news→case quota route, admin Users panel.

---

## 1 · The bug

Expiry is honoured in the two canonical places and in the app-wide context, so most of
the product was already correct:
- `lib/tier.ts effectiveTier()` — correct (expired → free).
- backend `services/access_guard.py _effective_tier_from_row / effective_tier()` — correct,
  and is the authoritative attempt/submit gate.
- `components/user-context.tsx` computes `tier = effectiveTier(user)`, so everything reading
  the context is correct: `app-nav.tsx` (Prep Copilot link, Pro ring), `deck-vault-promo`,
  `isPro`/`isLite`/`hasTierAccess`, `lib/access.ts`, `resume/page.tsx`, `skeletons/page.tsx`,
  `lib/deck-access.ts`, `lib/use-deck-access.ts`, `api/razorpay/order`.

Four call sites bypassed it — they read `user.subscription_tier` raw and never looked at
`subscription_expires_at`:

1. **`app/api/news/[briefId]/to-case/route.ts` — a REAL access leak.** Selected only
   `subscription_tier`, fed it to `computeFreeQuota()` where `unlimited = tier !== 'free'`.
   An expired Pro therefore got `unlimited = true` and the endpoint's `403 quota exhausted`
   never fired → unlimited news→case generation past expiry.
2. **`app/(app)/dashboard/page.tsx`** — `const tier = userRow?.subscription_tier ?? 'free'`
   fed `nextAction(readiness, tier)` and `computeFreeQuota(tier, submissions)`. An expired
   Pro saw Pro next-action + an "unlimited" quota panel. (The backend submit gate still
   blocks the actual attempt, so this was a lying UI rather than a content leak — but it was
   telling an expired user they still had Pro.)
3. **`app/(app)/admin/users/page.tsx`** — the Users list showed expired Pro as **PRO**; the
   tier filter and the "paid" stat counted expired subscriptions as active. This is the most
   visible symptom ("pro of people after expiration date is not expiring").
4. **`app/(app)/admin/users/actions.ts`** — the user detail panel showed expired Pro as PRO.

## 2 · The fix

Route all four through the one expiry-aware helper, `effectiveTier()`. To let the narrow
DB selects (admin list, quota route) pass without casting to a full `UserRow`, the helper's
parameter was widened:

```
type TierBearingRow = Partial<Pick<UserRow, 'subscription_tier' | 'subscription_expires_at'>>;
hasTier(user: TierBearingRow | null, ...)      // was UserRow | null
effectiveTier(user: TierBearingRow | null)     // was UserRow | null
```

This is a pure superset — `UserRow` satisfies `TierBearingRow`, the body is unchanged and
still null-guards each field, so **every existing caller is byte-for-byte unaffected at
runtime.** The news route additionally adds `subscription_expires_at` to its `.select(...)`
(the admin queries already selected it; the dashboard row is the cached layout `UserRow`,
which already carries it).

No information is lost in the admin panel: the list row still carries `expiresAt`, and the
detail still shows `Plan expires <date>` + full payment history, so "was Pro until X" is
still visible — the tier PILL just reflects reality now.

## 3 · Deliberately NOT touched (per "don't break existing features")

- `app/(app)/admin/email-actions.ts` — the `tier` email segment filters raw
  `subscription_tier`. Left as-is: it already has a dedicated `lifecycle = 'expired'`
  segment, and changing marketing-segment semantics is out of scope. **Owner note:** an
  expired-Pro user still lands in the "Pro" email segment; decide if that should change.
- `components/solve/ConversationalSolve.tsx` (`attempt?.tier`) — intentionally the stamped
  `tier_at_start` (C9), NOT the current tier. Left alone.
- `api/razorpay/{order,verify,webhook}` — payment writes / already expiry-checked. Left alone.
- **Backend** — `services/access_guard.py` is already correct; no change.

## 4 · Overlap warning

`ANTIGRAVITY_HANDOFF_conversation-continuity.md` (built in another profile, not in THIS
tree) also modifies `app/(app)/dashboard/page.tsx` and `lib/tier.ts`. Expect a trivial
3-way merge: keep the `effectiveTier` import + `const tier = effectiveTier(userRow)` on
dashboard, and keep the widened `effectiveTier`/`hasTier` signatures in `tier.ts` (that
handoff ADDS `caseFigures`/`canSeeCaseFigures`, which do not collide with the signature line).

## 5 · Phased build steps + gates

1. Frontend only — no DB step, no backend deploy.
2. Gate: `npx tsc --noEmit` → **EXIT 0** (verified in this tree).
3. Gate: `npm run build` (run on the device — not run here).
4. Manual QA:
   a. User with `subscription_tier='pro'`, `subscription_expires_at` in the PAST →
      dashboard shows free quota/next-action (not "unlimited"); `POST /api/news/<brief>/to-case`
      is subject to the free daily quota and 403s when exhausted (previously unlimited).
   b. Admin → Users: that user shows **FREE**; filter "pro" excludes them; "paid" stat drops
      them; detail still shows `Plan expires <past date>` + payments.
   c. User with a FUTURE expiry still shows Pro everywhere and keeps unlimited — no regression.
   d. `is_admin` user unaffected.

git: `git add` the 5 files → commit → **`git push`**, then `node .brain\sync.mjs`.
(A stale `.git/index.lock` from an earlier interrupted op was cleared this session.)

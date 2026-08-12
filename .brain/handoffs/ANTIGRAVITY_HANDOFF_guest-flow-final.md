# ANTIGRAVITY_HANDOFF — guest-flow-final (owner spec, 2026-08-10)

**Supersedes** the guest-surface decisions in `ANTIGRAVITY_HANDOFF_guest-mode.md`.
Guest mode itself (anonymous auth, 0045, submit-wall, backend gates) is BUILT and
LIVE behind `NEXT_PUBLIC_GUEST_MODE`. This document changes only **what a guest
sees**, and it reverses two things that shipped.

```
touches:  app/(app)/dashboard/page.tsx, app/(app)/practice/page.tsx,
          app/(app)/cases/[id]/page.tsx, app/(app)/results/[id]/page.tsx,
          lib/supabase/middleware.ts, components/guest/*,
          components/onboarding/onboarding-form.tsx,
          components/solve/ConversationalSolve.tsx
breaking: no contract surfaces. Behaviour-only.
affects:  Dashboard, Case solve UX, Onboarding, Landing
```

---

## The journey, exactly as specified

**A · Anonymous path**

1. Land on `/`. Click **Explore MECE**.
2. A **dashboard** opens. It is the REAL dashboard — the same one a signed-in
   user sees — not a synthetic sample and not a stripped-down page. All cases
   and guesstimates are visible and openable.
3. Every surface on it carries a **Log in / Sign up** affordance.
4. Click **Start case** (or guesstimate) → the solve workspace opens and works.
5. Click **Submit** → login / sign-up wall. This is the only hard gate.
6. After signing up → land on the **scoring / results page**, with a button
   **"Go to your dashboard"**.
7. Reaching the dashboard that way → walkthrough + discounts run as normal.

**B · Direct path**

1. Go straight to `/login` or `/signup` (never touched Explore MECE).
2. Normal auth, no guest anything.
3. Land on the **dashboard**, with walkthrough + discounts.

**C · Practice section, as a guest**

- `/practice` is **reachable**. Every question is visible.
- A **"Log in to continue"** overlay sits on top: solid card in the centre,
  the surrounding page blurred/faded so the real questions read through it.
- Logging in removes the overlay. Nothing else changes.

---

## What this REVERSES (both shipped; both must be undone)

1. **Guests are no longer redirected away from `/practice`.**
   `app/(app)/practice/page.tsx` currently does `if (user?.is_anonymous)
   redirect('/dashboard')`, and `lib/supabase/middleware.ts` has a guest
   allowlist that blocks it. Both must go. The new answer to "guest opens
   practice" is the overlay, not a redirect.
   Keep the ACCESS gates exactly as they are — `lib/access.ts` and
   `services/access_guard.py` still refuse a guest on any non-daily case. The
   overlay is presentation; those remain the boundary.

2. **The guest dashboard is the real dashboard.**
   `app/(app)/dashboard/page.tsx` currently branches on
   `!authUser || authUser.is_anonymous` into a simple three-action page. The
   spec is the full dashboard for anonymous users, with Log in / Sign up
   affordances layered on.
   The synthetic sample (`lib/dashboard/guest-sample.ts`) stays deleted —
   "remove the dummy dashboard completely" is final. It is already unreferenced.
   ⚠️ The full dashboard path builds a **service-role** client and runs ~12
   aggregate queries. Confirm each behaves for a user with zero history before
   handing it to guests; the original guest branch existed precisely because
   `createServiceClient()` throws without `SUPABASE_SERVICE_ROLE_KEY`.

## What must NOT change

- The submit wall (`assert_can_submit` + `GuestSaveWall`). Still the only gate.
- `0045`, the RLS policies, the leaderboard/activity/proof-rail guest filters.
- Payment 403s, the 40-message cap, the 20/min guest rate limit.
- Nav hiding for guests is now redundant with the overlay — remove it so the
  links are visible-but-gated, consistent with the rest of the spec.

## Routing detail that already works — do not rebuild

Post-conversion routing is done and correct: `ConversationalSolve` parks the
answer and the return path in `sessionStorage`, and
`components/onboarding/onboarding-form.tsx` reads `mece:after-onboarding` to
send a converted guest to their results while a direct signup goes to
`/dashboard`. That IS journey A step 6 vs journey B step 3. The only thing
missing is the **"Go to your dashboard"** button on the results page for users
who arrived via the guest path.

## Build order

1. Remove the guest allowlist from middleware + the `/practice` redirect.
2. Build `components/guest/login-to-continue-overlay.tsx` (blurred backdrop,
   centred solid card, Log in + Sign up). Render on `/practice` for guests.
3. Point the dashboard guest branch at the real dashboard; verify every
   aggregate against a zero-history user.
4. Add "Go to your dashboard" to `/results/[id]` when arriving post-conversion.
5. Delete `lib/dashboard/guest-sample.ts` (already unreferenced).

## Gates

`npx tsc --noEmit` EXIT 0 · `npm run build` EXIT 0 and **`/` must print
`○ (Static)`** · walk journey A and journey B end to end in incognito.

# ANTIGRAVITY_HANDOFF — guest-results-landing

**Author:** Claude (cloud session). **Date:** 2026-10-07. **Feature:** a guest who solves a case
and signs up to see the score must land on THAT score after onboarding — never the dashboard,
practice, or anywhere else — and onboarding must tell them the score is next. **Branch:** `main`.
Follows `ANTIGRAVITY_HANDOFF_fluid-cpu-round2.md` (62f36e4).

```
touches:  frontend
            lib/after-onboarding.ts (NEW: isReturnDestination() + AFTER_ONBOARDING_KEY)
            lib/guest-pending-submit.ts (NEW: cross-tab copy of a guest's answer, localStorage)
            lib/supabase/middleware.ts (onboarding gate keeps ?next= for /results/<id>, /cases/<id>)
            app/auth/callback/route.ts (failure → /login keeps an explicit next)
            app/(app)/onboarding/page.tsx (reads ?next=, validates, passes returnTo + userId)
            components/onboarding/onboarding-form.tsx (destination decided up front; "your score
              is next" heading/banner/button; returnTo wins)
            components/guest/guest-save-wall.tsx (email sign-up passes emailRedirectTo; "sent" copy)
            components/solve/ConversationalSolve.tsx (saves/reads the cross-tab copy; only ever
              submits it against its own attempt; "already submitted" → that score; scoring overlay;
              a guest who keeps working drops the parked answer)
          backend   none
breaking: no. C1–C9 untouched. No API, DB or SQL change. /onboarding accepts an optional
          ?next= (only /results/<id> or /cases/<id>; anything else ignored).
affects:  Guest mode (save wall, solve screen), Onboarding, Auth callback
```

## The bug (traced 2026-10-07)
Guest solves a case → presses Submit → save wall → creates an account.
1. **Email + password** (`updateUser`) sent the confirmation email with NO `emailRedirectTo`, so
   the link opened the project's Site URL (home page) in a NEW tab. sessionStorage is per tab:
   the answer parked there was invisible, nothing was submitted, the new account was sent to
   onboarding, and onboarding (no parked path, no submission yet) sent them to /dashboard.
   The answer was never scored.
2. **Onboarding gate** (middleware) cleared the query when it redirected to /onboarding, so
   the destination survived only in sessionStorage — lost in any new tab.
3. A second tab (or the original tab's "I've confirmed" button) submitting the same attempt got
   "Attempt already submitted" as an error toast instead of the score.

## The fix
- Email sign-up now returns via `/auth/callback?next=/cases/<id>` (same pattern as OAuth).
- The gate carries `/results/<id>` or `/cases/<id>` as `/onboarding?next=…` (strict regex,
  no query, single id segment — cannot become an open redirect). Everything else unchanged.
- Onboarding picks the destination up front: `?next=` → this tab's parked path → latest
  submission (existing fallback) → /dashboard. When it is a score, the heading reads "One quick
  step, then your score.", a banner says "Your answer is saved. Fill this in and we'll score it
  and take you straight to your results." (or "Your score is ready…"), and the button reads
  "See my results →". A plain case link opened before onboarding gets the usual copy.
- The solve screen keeps a cross-tab copy `{caseId, attemptId, userId, rec, ts}` in localStorage
  next to the existing sessionStorage copy. Read only by the SAME auth user (anonymous sign-up
  keeps the user id), only for that case, only within 24h, only submitted against ITS attempt;
  removed on success, on expiry, when another account is signed in, and when the guest keeps
  working instead of signing up.
- If the answer was already scored elsewhere, the user is taken to that submission
  (`attempts.submission_id`, read under the owner-read RLS policy).

## Gates (2026-10-07, copy of main @ 62f36e4 + this change)
1. `npx tsc --noEmit` 0 errors; `next build` exit 0. No SQL, no backend.
2. Pure logic (node): `isReturnDestination` accepts only `/results/<id>` and `/cases/<id>`; rejects
   `//evil.com`, `https://…`, `../`, query strings, extra segments, encoded dots, 81+ char ids.
   Cross-tab copy: same user+case reads; other case ignored and kept; other user, expired,
   malformed, blank or missing attemptId removed; storage disabled never throws. 39/39.
3. Server (`next start` + fake Supabase): not-onboarded account → `/cases/c1` and `/results/s1`
   redirect to `/onboarding?next=…`; `/dashboard`, `/practice`, `/history/x`, `/results/s1/x`
   redirect to `/onboarding` with no next (unchanged). Failed `/auth/callback` → `/login?…&next=`.
4. Browser (Playwright, fake Supabase + fake backend), 31/31:
   - Guest presses Submit → both copies saved (cross-tab one bound to g1 / c1 / a1); email
     sign-up sends `redirect_to=<origin>/auth/callback?next=%2Fcases%2Fc1`; "sent" copy updated;
     "keep working" + a new message drops all parked copies.
   - Confirmation tab (signed in, not onboarded, answer waiting) → `/onboarding?next=/cases/c1`
     → "One quick step, then your score." + banner + "See my results →" → fill → scored once
     against a1 with the saved answer → lands on `/results/s9`; copy removed; no page/hydration
     errors.
   - Answer's attempt already scored (start returns a different attempt) → `/results/<its
     submission>` via `attempts` (owner-read RLS); nothing submitted against the new attempt.
   - API "Attempt already submitted" → that submission's results, not an error toast.
   - Copy written by another account → ignored, removed, nothing submitted.
   - `/onboarding?next=/cases/c1` with no waiting answer → usual heading and "Let's go →";
     `?next=/results/s1` → "Your score is ready…"; external next never handed to the form.

## Not covered by the run (real Supabase only)
The confirmation email itself. After deploy, check once: Supabase → Auth → URL Configuration →
Redirect URLs must allow `https://www.mece.in/auth/callback**` (OAuth and email sign-up already
use it, so it should be there). Then: guest → solve → Submit → email sign-up → open the link on
the same device → onboarding shows "One quick step, then your score." → results.
A link opened on a different device signs in via /login and returns to the case with the
conversation intact (Submit pressed again there); the copy promises nothing in that case.

## Rollback
Revert the commit. Nothing persistent: the localStorage key `mece:pending-submit` simply stops
being read; old sessionStorage behaviour is unchanged by this change.

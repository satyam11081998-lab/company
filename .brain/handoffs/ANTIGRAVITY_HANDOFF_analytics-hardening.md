# ANTIGRAVITY_HANDOFF — analytics-hardening + public feedback page

**Author:** Cowork brain · 2026-09-12
**touches:** `app/(app)/admin/journeys/page.tsx`, `app/(app)/admin/journeys/client.tsx` (analytics dashboard, admin-only); NEW `app/feedback/page.tsx`, `app/feedback/feedback-public-form.tsx` (public, no-login feedback page). No backend repo changes. No migrations.
**breaking:** **no** — no CONTRACTS.md surface touched. `feedback_reports` (0011) already exists and accepts anon inserts; the new page only POSTs to the existing `POST /api/feedback`. The admin dashboard is self-contained (server component + its client), consumed by nobody else.
**blast radius:** admin `/admin/journeys` + a new public route `/feedback`. The app-wide tracking hooks were deliberately **not** modified.

> ⚠️ **Gates NOT run by the author.** This was produced in a Cowork session whose
> device shell was down (Windows-update issue), so `tsc`/`build` could not run here.
> TSX **syntax** was verified with esbuild (4/4 OK). **You must run the gates below
> before pushing** — a type error here fails `npm run build` and blocks deploys.

## Why (evidence from a live, read-only Supabase pull, 2026-09-12)
- **Funnel was reading ~0 for signups/conversions.** 28 real signups in 7 days, but the `complete_signup` client action fired **0 times**; `complete_payment` likewise 0 while there are 4 real paid users all-time. The funnel depended on best-effort client events that don't fire reliably.
- **Hourly chart was in UTC.** Real peak 10:00 IST displayed as 05:00.
- **Summary tiles were computed over a 200-session slice** under a "last 7 days" label (not biting yet at 35 sessions/wk, but latent).
- **Fetch used `ascending + LIMIT`** → once a week exceeds the cap it silently drops the NEWEST events.
- **`users.points` leaderboard is ~85% placeholder points** (24 `@leaderboard.mece.in` rows = 90,065 pts vs 145 real users = 15,313). Not fixed in code here (you asked to leave seeds in place) — the dashboard now just excludes internal/placeholder accounts from traffic + funnel.

## What changed (phased)

### Phase 1 — `journeys/page.tsx` (server)
1. **Funnel from source-of-truth tables**, not `user_actions`:
   Visited (page_events) → Signed Up (`users.created_at`) → Onboarded (`users.onboarding_completed_at`) → Started (`case_attempts`) → Submitted (`submissions`) → Viewed Pricing (pageviews on `/pricing|/upgrade`) → Paid (`payments.status='paid'`). All real-user-filtered.
2. **IST hours** via `istHour()` (+5:30) instead of `Date.getHours()`.
3. **Fetch newest-first** (`ascending:false`) + re-sort ascending in memory; caps raised to 20k/10k; `pageEventsTruncated`/`actionsTruncated` flags surface a banner when a cap is hit (drops oldest, never newest).
4. **Exclude internal accounts** (admin + demo + `@seed.mece.in`/`@mece-seed.local`/`@leaderboard.mece.in`) from all traffic/funnel. Real guests kept.
5. Sessions handed to client raised 200 → 1000 (so tiles reflect the window); added `paidLast7d` + `totalSessionsInWindow` props.

### Phase 2 — `journeys/client.tsx`
- "Converted" tile now shows real `paidLast7d` (falls back to old value if prop absent).
- "Sign-up rate" → **"Signed-in share"** (it was the share of sessions already logged in, not a signup conversion).
- Exit-page % uses `totalSessionsInWindow` as the honest denominator.
- Session list renders `filtered.slice(0, 300)` (display bound; stats unchanged).

### Phase 3 — NEW public feedback page
- `app/feedback/page.tsx` (server, `metadata`, `robots:noindex`) → renders `feedback-public-form.tsx` (`'use client'`).
- Posts to the existing `POST /api/feedback` (anon insert allowed). Honeypot preserved. A `?src=` query param is recorded as `context.referrer` (`public-email`, etc.) so outreach feedback is attributable.
- Shareable link: **https://mece.in/feedback** (or `/feedback?src=email`).

## GATES — run on the real tree before pushing
```
# in D:\dev\mece\consilio
npx tsc --noEmit          # MUST be EXIT 0 (type-check — not run by author)
npm run build             # MUST compile all routes incl. /feedback and /admin/journeys
```
- Manual QA: open `/admin/journeys` — Funnel should now show Signed Up ≈ 28 (not 0), Converted ≈ real paid; hourly peak around 10:00/16:00 IST. Open `/feedback` logged-out, submit once, confirm a row lands in `feedback_reports` with `context.referrer`.
- No migration. No env var. No backend deploy required.
- If `tsc`/`build` reports anything, send me the error — these files were not compiler-verified here.

## NOT done here (recommended follow-ups)
- **Instrument the missing client action events** (`complete_signup`, `complete_onboarding`, `start_case`, `submit_case`, `complete_payment`) at their real call sites (onboarding success, solve start/submit, Razorpay success) and fix the `uid`-race in `components/analytics/page-tracker.tsx` + `hooks/use-track-action.ts` (the session id resolves async but events fire immediately). Needs real-browser QA — left for the worker.
- **Leaderboard points**: seeds intentionally left in place. If you ever want the *public* board to rank only real earned points, exclude the three placeholder email domains in `lib/dashboard/leaderboards.ts` the same way (no DB change needed).

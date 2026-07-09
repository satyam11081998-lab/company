# ANTIGRAVITY_HANDOFF — daily-tile-fallback (Brain / Cowork, 2026-07-10)

Owner report: the dashboard daily case + daily guesstimate tiles SOMETIMES both
redirect to /practice instead of the case/guesstimate. Recurrence of the
2026-06-21 "fix-daily-link-resolution" bug family, different root cause.

Diagnosis: the id-vs-code resolution from the June fix is fine. The remaining
hole is the schedule lookup itself: both `lib/daily-server.ts` and
`lib/access.ts` matched `daily_schedule.scheduled_date = today(IST)` EXACTLY.
Between IST midnight and the ~06:00 IST cron (and on any cron-failure day)
there is NO row for today → both refs null → both tiles fall back to
"Browse practice". That is precisely the "sometimes both" symptom (time-of-day
dependent, self-healing once the cron lands).

Fix (implemented, frontend): fall back to the MOST RECENT schedule row on/before
today — `lte('scheduled_date', today) + order desc + limit 1` — in BOTH readers:
- lib/daily-server.ts — dashboard tiles now show yesterday's dailies until the
  new schedule lands (strictly better than dead tiles; auto-heals).
- lib/access.ts — the free-tier gate treats the SAME row as "the daily", so a
  free user clicking the (yesterday's) daily tile is not charged their one-time
  bank credit / locked. The two call sites are comment-linked to stay in sync.

touches: lib/daily-server.ts, lib/access.ts (schedule lookup only — the access.ts
free-tier branch from ANTIGRAVITY_HANDOFF_free-tier-rework.md is a separate,
non-overlapping edit in the same file; merge both from this tree).

## BACKEND SPEC (consilio-backend)
- routes/daily.py GET /daily/today AND services/access_guard.py: apply the same
  `scheduled_date <= today ORDER BY scheduled_date DESC LIMIT 1` fallback so the
  API consumers and the authoritative attempt gate agree with the frontend about
  which row is "the daily".

breaking: no — read-path behaviour fix; no schema/API shape change.
affects: Dashboard daily tiles, Case solve UX (free gating), Daily content.

## Residual cause to verify in data (not fixable in code here)
If a `daily_schedule` row references a `code`/`id` that doesn't exist in `cases`
(bad generator write), that tile still falls back. Antigravity: run
  select ds.scheduled_date, ds.case_id, ds.guesstimate_code
  from daily_schedule ds
  order by scheduled_date desc limit 14;
and spot-check the refs resolve against cases(id/code). If misses exist, the
generator (backend services/daily_scheduler.py) is writing dangling refs — file
a follow-up.

## Gates
1. `npx tsc --noEmit` + `next build` on the real tree (Cowork mount stale again
   this session; edits reviewed line-by-line on the authoritative files).
2. QA: with today's schedule row DELETED on a scratch DB, dashboard tiles still
   link to yesterday's case/guesstimate (not /practice); free user can attempt
   that case without burning their one-time credit. Re-insert today's row →
   tiles switch to today's picks.

## Commit
git add lib/daily-server.ts lib/access.ts \
  .brain/handoffs/ANTIGRAVITY_HANDOFF_daily-tile-fallback.md
Suggested branch: fix/daily-tile-fallback (or fold into feat/free-tier-rework —
access.ts is shared)
Suggested message: fix(daily): dashboard tiles + access gate fall back to the
most recent daily_schedule row, so tiles never dead-link to /practice before the
morning cron

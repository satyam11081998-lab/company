-- 0043_clarification_quota_uplift.sql — repair in-flight attempts after the
-- clarification-quota fix (2026-08-01). Additive + idempotent (safe to re-run).
--
-- WHY
-- `attempts.clarification_quota` is stamped ONCE at attempt creation from the
-- user's tier_at_start. Until today the ladder was free=0 / lite=5 / pro=15,
-- and free=0 meant the very first question a free user asked hit the
-- "quota exhausted" branch in routes/attempts.py — the backend returned with
-- NO interviewer reply at all, and the UI showed "Clarification quota used up"
-- before they had asked anything.
--
-- The constant is now free=7 / lite=12 / pro=20 (backend CLARIFICATION_QUOTA,
-- mirrored in lib/tier.ts TIER_LIMITS.maxHintQuestions and the pricing copy).
-- New attempts pick that up automatically. This migration repairs the ACTIVE
-- attempts already sitting in the table so nobody mid-case stays stuck on 0.
--
-- SCOPE / SAFETY
--   * Only rows with status = 'active' — submitted and abandoned attempts are
--     historical records and are left exactly as they were.
--   * Only RAISES a quota (greatest(...)) — never lowers one, so a user who
--     somehow holds a more generous quota keeps it.
--   * clarification_used is left untouched; a user who already spent questions
--     keeps that spend and simply gains headroom.

update public.attempts a
set    clarification_quota = greatest(
         a.clarification_quota,
         case a.tier_at_start
           when 'pro'  then 20
           when 'lite' then 12
           else 7                     -- 'free' and any unexpected/NULL tier
         end
       )
where  a.status = 'active'
  and  a.clarification_quota < case a.tier_at_start
                                 when 'pro'  then 20
                                 when 'lite' then 12
                                 else 7
                               end;

-- Defensive: clarification_used must never exceed the quota. count_clarifications()
-- counts every '?' in a turn, so a single packed message could previously push
-- used past quota and drive `remaining` negative (masked by max(0, ...) on the
-- way out of the API, but wrong in the DB). The route now clamps on write;
-- this cleans up any row that already drifted.
update public.attempts
set    clarification_used = clarification_quota
where  clarification_used > clarification_quota;

-- =====================================================================
-- One-off FULL leaderboard wipe (run manually in the Supabase SQL editor).
-- NOT a migration. Do NOT place in supabase/migrations/ (must not auto-run on
-- deploy).
--
-- Effect (per owner request, full reset):
--   1) HARD-DELETE every seeded leaderboard account (@seed.mece.in and the old
--      @mece-seed.local placeholders). auth.users delete cascades to
--      public.users and all child rows (attempts/submissions/payments/badges).
--   2) ZERO the `points` of every remaining (real) user, so the board is empty
--      until you reinsert your saved datapoints.
--
-- Why the JWT-claim trick: public.users has a BEFORE UPDATE guard
-- (trg_guard_user_cols, migration 0006) that reverts `points` unless
-- auth.role() = 'service_role'. The SQL editor is NOT the service role, so a
-- plain UPDATE is silently undone. We make auth.role() return 'service_role'
-- for THIS transaction only by setting the request JWT-claim GUCs (is_local =
-- true) — these are normal settable parameters (no superuser needed, unlike
-- session_replication_role), and they auto-reset when the transaction ends.
--
-- Irreversible. PREVIEW FIRST. You said you have saved the datapoints already.
-- =====================================================================


-- ─────────────────────────────────────────────────────────────────────
-- STEP 1 — PREVIEW (run alone first; confirm the two result sets look right)
-- ─────────────────────────────────────────────────────────────────────

-- 1a) Seed accounts that STEP 2 will hard-delete:
select id, name, email, points
from public.users
where email like '%@seed.mece.in'
   or email like '%@mece-seed.local'
order by points desc;

-- 1b) Real users whose points STEP 3 will reset to 0 (everyone NOT a seed acct):
select id, name, email, points
from public.users
where points > 0
  and email not like '%@seed.mece.in'
  and email not like '%@mece-seed.local'
order by points desc;


-- ─────────────────────────────────────────────────────────────────────
-- STEP 2 — DELETE seed accounts (run only after the preview looks correct).
-- Deleting from auth.users cascades to public.users + all child data.
-- ─────────────────────────────────────────────────────────────────────
delete from auth.users
where email like '%@seed.mece.in'
   or email like '%@mece-seed.local';


-- ─────────────────────────────────────────────────────────────────────
-- STEP 3 — ZERO every remaining user's points (real accounts).
-- Impersonates the service role for this transaction only so the points guard
-- lets the UPDATE through (no superuser / session_replication_role needed).
-- ─────────────────────────────────────────────────────────────────────
do $$
begin
  -- make auth.role() = 'service_role' for this txn (both forms, version-safe)
  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  update public.users set points = 0 where points is distinct from 0;
end $$;

-- If your Supabase still blocks the UPDATE above (rare auth.role() variants),
-- use this owner-privilege fallback instead of the DO block — disable the guard
-- trigger, zero points, re-enable:
--   alter table public.users disable trigger trg_guard_user_cols;
--   update public.users set points = 0 where points is distinct from 0;
--   alter table public.users enable  trigger trg_guard_user_cols;


-- ─────────────────────────────────────────────────────────────────────
-- STEP 4 — CONFIRM the board is empty (run separately; expect 0 rows / all 0).
-- ─────────────────────────────────────────────────────────────────────
select count(*) as seed_accounts_left
from public.users
where email like '%@seed.mece.in' or email like '%@mece-seed.local';

select count(*) as users_with_points
from public.users
where points > 0;

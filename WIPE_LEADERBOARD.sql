-- =====================================================================
-- One-off FULL leaderboard wipe (run manually in the Supabase SQL editor).
-- NOT a migration. Do NOT place in supabase/migrations/.
--
-- Effect (full reset):
--   1) HARD-DELETE every placeholder leaderboard account: @seed.mece.in (legacy),
--      @mece-seed.local (older), and @leaderboard.mece.in (current). Deleting from
--      auth.users cascades to public.users + all child rows.
--   2) ZERO `points` of every remaining (real) user, so the board is empty until
--      you reinsert via SEED_LEADERBOARD.sql.
--
-- Why the JWT-claim trick in STEP 3: public.users has a BEFORE UPDATE guard
-- (trg_guard_user_cols, migration 0006) that reverts `points` unless
-- auth.role() = 'service_role'. The SQL editor is NOT service_role, so a plain
-- UPDATE is silently undone. We make auth.role() return 'service_role' for THIS
-- transaction only by setting the request JWT-claim GUCs (is_local = true) —
-- normal settable params (no superuser, unlike session_replication_role, which
-- errors 42501 here). They auto-reset when the transaction ends.
--
-- Irreversible. PREVIEW FIRST. (Datapoints are saved + reinserted by SEED.)
-- =====================================================================


-- STEP 1 — PREVIEW (run alone first; confirm the two result sets look right)

-- 1a) Placeholder accounts that STEP 2 will hard-delete:
select id, name, email, points
from public.users
where email like '%@seed.mece.in'
   or email like '%@mece-seed.local'
   or email like '%@leaderboard.mece.in'
order by points desc;

-- 1b) Real users whose points STEP 3 will reset to 0 (everyone NOT a placeholder):
select id, name, email, points
from public.users
where points > 0
  and email not like '%@seed.mece.in'
  and email not like '%@mece-seed.local'
  and email not like '%@leaderboard.mece.in'
order by points desc;


-- STEP 2 — DELETE placeholder accounts (cascades to public.users + child data).
delete from auth.users
where email like '%@seed.mece.in'
   or email like '%@mece-seed.local'
   or email like '%@leaderboard.mece.in';


-- STEP 3 — ZERO every remaining user's points. Impersonates service_role for
-- this txn so the points guard lets the UPDATE through (no superuser needed).
do $$
begin
  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  update public.users set points = 0 where points is distinct from 0;
end $$;

-- Fallback if STEP 3's UPDATE is still blocked on your instance:
--   alter table public.users disable trigger trg_guard_user_cols;
--   update public.users set points = 0 where points is distinct from 0;
--   alter table public.users enable  trigger trg_guard_user_cols;


-- STEP 4 — CONFIRM (run separately; expect 0 and 0).
select count(*) as placeholder_accounts_left
from public.users
where email like '%@seed.mece.in'
   or email like '%@mece-seed.local'
   or email like '%@leaderboard.mece.in';

select count(*) as users_with_points
from public.users
where points > 0;

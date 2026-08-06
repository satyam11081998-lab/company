-- =====================================================================
-- fix-demo-privileged.sql — repair the demo account's GUARDED columns.
-- 2026-08-06
--
-- WHY THIS EXISTS
-- Migration 0006 installs `trg_guard_user_cols`, a BEFORE UPDATE trigger on
-- public.users that silently reverts these columns for any caller whose
-- auth.role() is not 'service_role':
--     subscription_tier, subscription_started_at, subscription_expires_at,
--     points, is_admin, is_demo
-- The Supabase SQL editor has NO JWT, so auth.role() returns NULL and the
-- trigger reverts. It does not error — the UPDATE reports success and the
-- values quietly stay as they were. That is why seed-demo-account.sql left
-- the account on `free` with 0 points while the unguarded columns (streak,
-- name, onboarding) went through fine.
--
-- WHAT THIS DOES
-- Impersonates service_role for THIS TRANSACTION ONLY (transaction-local
-- GUC, resets automatically), rewrites the guarded columns, then ASSERTS the
-- values actually landed and raises loudly if they did not. If the claim
-- approach does not take, it falls back to disabling the trigger inside the
-- same transaction — which is safe, because DDL is transactional in Postgres:
-- any failure rolls the disable back with everything else.
--
-- Safe to re-run. Reads points from the submission log, so the number always
-- reconciles rather than being invented.
-- =====================================================================

do $$
declare
  v_email  text := 'demo@mece.in';        -- ← EDIT
  -- Kept UNDER 31 on purpose. components/dashboard-client.tsx:119 switches the
  -- hero to the streak variant when streak > 30, which renders a 140px number
  -- that swallows the whole tile. Below the line the dashboard picks the
  -- readiness/case hero, which is the layout you actually want on camera.
  v_streak int := 18;

  v_user   uuid;
  v_points int;
  v_ok     boolean;
  r        record;
begin
  select id into v_user from public.users where lower(email) = lower(v_email);
  if v_user is null then
    raise exception 'No user with email %.', v_email
      using hint = 'Run supabase/create-demo-login.sql first.';
  end if;

  -- Points = exact sum of first-attempt scores, the same rule the backend
  -- (routes/submit.py) applies. Never a magic number.
  select coalesce(sum(s.score), 0)::int into v_points
    from public.submissions s
    join public.case_attempts a on a.submission_id = s.id
   where s.user_id = v_user and a.is_first_attempt;

  ------------------------------------------------------------------
  -- Attempt 1 — look like service_role to auth.role()
  ------------------------------------------------------------------
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  begin
    -- Older Supabase reads this flat GUC first; harmless if unsupported.
    perform set_config('request.jwt.claim.role', 'service_role', true);
  exception when others then null;
  end;

  update public.users
     set points                  = v_points,
         is_demo                 = true,
         subscription_tier       = 'pro',
         subscription_started_at = coalesce(subscription_started_at, now() - interval '84 days'),
         subscription_expires_at = now() + interval '365 days',
         streak_count            = v_streak
   where id = v_user;

  select (points = v_points and is_demo and subscription_tier = 'pro')
    into v_ok
    from public.users where id = v_user;

  ------------------------------------------------------------------
  -- Attempt 2 — the trigger won. Disable it for this transaction only.
  ------------------------------------------------------------------
  if not v_ok then
    raise notice 'JWT-claim route did not satisfy auth.role(); disabling the guard trigger for this transaction.';
    begin
      execute 'alter table public.users disable trigger trg_guard_user_cols';
    exception when others then
      raise exception 'Could not bypass trg_guard_user_cols: %', sqlerrm
        using hint = 'You need table-owner rights. Run this from the Supabase SQL editor as the default postgres role.';
    end;

    update public.users
       set points                  = v_points,
           is_demo                 = true,
           subscription_tier       = 'pro',
           subscription_started_at = coalesce(subscription_started_at, now() - interval '84 days'),
           subscription_expires_at = now() + interval '365 days',
           streak_count            = v_streak
     where id = v_user;

    -- Re-enable inside the same transaction. If anything above had raised,
    -- the whole transaction (including the disable) would have rolled back,
    -- so the guard can never be left off.
    execute 'alter table public.users enable trigger trg_guard_user_cols';

    select (points = v_points and is_demo and subscription_tier = 'pro')
      into v_ok
      from public.users where id = v_user;
  end if;

  ------------------------------------------------------------------
  -- Assert. A silent revert is exactly what produced this bug once.
  ------------------------------------------------------------------
  if not v_ok then
    raise exception 'Privileged columns were still reverted — points/tier/is_demo did not stick.'
      using hint = 'Check that trg_guard_user_cols exists and that you are running as the postgres role.';
  end if;

  select points, streak_count, subscription_tier, is_demo,
         to_char(subscription_expires_at, 'DD Mon YYYY') as expires
    into r
    from public.users where id = v_user;

  raise notice '────────────────────────────────────────────';
  raise notice ' Demo account repaired: %', v_email;
  raise notice '   points  : %  (sum of first-attempt scores)', r.points;
  raise notice '   tier    : %  until %', r.subscription_tier, r.expires;
  raise notice '   streak  : % days  (under 31 so the hero tile stays normal)', r.streak_count;
  raise notice '   is_demo : %  (hidden from leaderboard + stats)', r.is_demo;
  raise notice '────────────────────────────────────────────';
end $$;


-- ── Confirm (this is the result set you will see) ────────────────────
select email,
       points,
       streak_count                                             as streak,
       subscription_tier                                        as tier,
       is_demo,
       to_char(subscription_expires_at, 'DD Mon YYYY')           as pro_until,
       case when points > 0 and is_demo and subscription_tier = 'pro'
            then 'OK — hard refresh the dashboard'
            else 'STILL BROKEN — the guard trigger reverted the write' end as verdict
  from public.users
 where lower(email) = lower('demo@mece.in');        -- ← same email as above

-- 0054_lock_privileged_user_columns.sql
-- 2026-08-22 — Security hardening: make self-granting Pro/admin IMPOSSIBLE.
--
-- Run AFTER 0053. FULLY IDEMPOTENT. Safe to run against live prod.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- WHY THIS EXISTS  (read before touching)
-- ─────────────────────────────────────────────────────────────────────────────
-- public.users carries a users_update_own RLS policy (0006) so a logged-in user
-- can save their OWN profile (name/college/avatar/etc.) straight from the
-- browser with the public anon key. Supabase additionally grants the
-- `authenticated` role blanket table-level UPDATE on public.users. Together that
-- means the browser can PATCH *any* column of its own row — including
-- subscription_tier, subscription_expires_at and is_admin.
--
-- The ONLY thing that was stopping that was the trg_guard_user_cols trigger
-- (0006/0045), which silently rewrites those columns back on write. A trigger is
-- a single point of failure: if it was never applied in this database, was
-- dropped, or a hand-made dashboard policy shadowed it, then anyone signed in
-- could run, from the browser console on the live site:
--
--     await supabase.from('users')
--       .update({ subscription_tier: 'pro',
--                 subscription_expires_at: '2027-01-01' })
--       .eq('id', <their own id>)
--
-- and become Pro with NO Razorpay order, NO payment row, and NO admin action —
-- exactly the "Pro in dashboard, nothing in Razorpay, nobody granted it" symptom.
--
-- This migration closes it at the Postgres PRIVILEGE layer, which is evaluated
-- BENEATH RLS and BEFORE any trigger runs and cannot be shadowed by a policy:
-- the `authenticated`/`anon` roles simply do not hold UPDATE on the privileged
-- columns, so a statement that assigns one is rejected with "permission denied"
-- no matter what RLS or triggers say. The trigger is kept as a second barrier.
--
-- No application code changes are required: the app only ever writes the
-- profile columns re-granted below (verified across the whole frontend —
-- app/api/onboarding/complete and components/profile/profile-client).

begin;

-- 1. Drop the blanket table-level write privileges the API roles get by default.
--    This is the actual hole: it is what lets the browser touch every column.
revoke update, insert, delete on public.users from anon, authenticated;

-- 2. Re-grant UPDATE on ONLY the columns the app legitimately writes from the
--    browser / user session (profile editor + onboarding form). Everything NOT
--    in this list — subscription_tier, subscription_started_at,
--    subscription_expires_at, is_admin, is_demo, is_guest, points, streak_count,
--    streak_last_date, linkedin_follow_claimed_at, marketing_opt_out,
--    college_email, college_email_verified_at, email, id, created_at — is now
--    unwriteable by these roles. Those are written ONLY by the service role
--    (Razorpay verify/webhook, admin grant, college-email verify, cron) which
--    is unaffected by this revoke and bypasses RLS.
grant update (
  full_name,
  name,
  college_id,
  college_other,
  batch_year,
  placement_focus,
  linkedin_url,
  show_linkedin,
  referral_source,
  weekly_hours_target,
  goal_text,
  onboarding_completed_at,
  avatar_url,
  avatar_uploaded_at
) on public.users to authenticated;
-- NOTE: nothing is granted to `anon`. Truly-unauthenticated requests cannot
-- write public.users at all. (Guest / anonymous-auth users hold the
-- `authenticated` role, so they can still edit their own throwaway profile —
-- harmless, and they are reaped after 30 days by cleanup_stale_guests.)

-- 3. Keep RLS owner-scoped, so even among the allowed columns a user can only
--    write their OWN row. Recreated idempotently in case 0006 was never applied
--    to this database.
alter table public.users enable row level security;

drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
  for select using (auth.uid() = id);

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- 4. Keep the privileged-column guard trigger as an independent second barrier
--    (defence in depth). Even if a future migration re-grants a broad UPDATE,
--    this still reverts privileged columns for any non-service-role writer.
create or replace function public.guard_user_privileged_cols()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() is distinct from 'service_role' then
    new.subscription_tier       := old.subscription_tier;
    new.subscription_started_at := old.subscription_started_at;
    new.subscription_expires_at := old.subscription_expires_at;
    new.points                  := old.points;
    new.is_admin                := old.is_admin;
    -- is_demo / is_guest exist from 0044 / 0045; guard them when present.
    begin
      new.is_demo  := old.is_demo;
    exception when undefined_column then null;
    end;
    begin
      new.is_guest := old.is_guest;
    exception when undefined_column then null;
    end;
  end if;
  return new;
end $$;

drop trigger if exists trg_guard_user_cols on public.users;
create trigger trg_guard_user_cols before update on public.users
  for each row execute function public.guard_user_privileged_cols();

commit;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFY (run these after; eyeball the output)
-- ─────────────────────────────────────────────────────────────────────────────
-- (a) authenticated/anon must have UPDATE on ONLY the profile columns, and
--     NEVER on subscription_tier / is_admin / points:
--
--   select grantee, column_name
--     from information_schema.role_column_grants
--    where table_schema = 'public' and table_name = 'users'
--      and privilege_type = 'UPDATE'
--      and grantee in ('anon','authenticated')
--    order by grantee, column_name;
--
-- (b) prove the hole is shut — this must now ERROR "permission denied":
--     (run it in the SQL editor while impersonating the authenticated role,
--      or just trust (a) — the grant list is the authority)
--
-- (c) the guard trigger must exist:
--
--   select tgname from pg_trigger
--    where tgrelid = 'public.users'::regclass and not tgisinternal;
--   -- expect: trg_guard_user_cols
--
-- (d) RLS must be ON:
--   select relrowsecurity from pg_class where oid = 'public.users'::regclass;
--   -- expect: t

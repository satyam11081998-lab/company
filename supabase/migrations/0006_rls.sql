-- =====================================================================
-- Migration 0006: Row-Level Security hardening (launch-blocker C1)
-- 2026-06-09
--
-- Context: a live QA probe found public.users readable by the anon key
-- (55 rows, 25 columns incl. email/college_email/linkedin_url/is_admin).
-- This migration codifies owner-scoped RLS for every user-data table,
-- public read for reference tables, and a privileged-column guard so a
-- logged-in user cannot grant themselves Pro / admin. Cross-user
-- aggregates (leaderboard, benchmark, cohort) now run server-side via
-- the service role (see app code) or the leaderboard_top() RPC below.
--
-- FULLY IDEMPOTENT: safe to re-run. Mirrors the hotfix already applied to
-- public.users on 2026-06-09.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. users — owner read/update, privileged columns service-role only
-- ---------------------------------------------------------------------
alter table public.users enable row level security;

-- CRITICAL: drop EVERY existing policy on users first. Production had a
-- pre-existing permissive SELECT policy (using true); RLS combines policies
-- with OR, so simply adding an owner policy left anon able to read all 55
-- rows. This loop removes whatever it's named, then we recreate owner-only.
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='users'
  loop
    execute format('drop policy if exists %I on public.users', p.policyname);
  end loop;
end $$;

create policy users_select_own on public.users
  for select using (auth.uid() = id);

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Block self-elevation of money/permission columns by anyone but the
-- service role (Razorpay verify/webhook run as service role).
create or replace function public.guard_user_privileged_cols()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() is distinct from 'service_role' then
    new.subscription_tier       := old.subscription_tier;
    new.subscription_started_at := old.subscription_started_at;
    new.subscription_expires_at := old.subscription_expires_at;
    new.points                  := old.points;
    new.is_admin                := old.is_admin;
  end if;
  return new;
end $$;
drop trigger if exists trg_guard_user_cols on public.users;
create trigger trg_guard_user_cols before update on public.users
  for each row execute function public.guard_user_privileged_cols();

-- Safe public leaderboard (no email) — used instead of a raw users select.
create or replace function public.leaderboard_top(p_limit int default 50)
returns table(id uuid, name text, avatar_url text, points int)
language sql security definer set search_path = public as $$
  select id, name, avatar_url, points
  from public.users
  order by points desc nulls last
  limit greatest(1, least(p_limit, 200));
$$;
grant execute on function public.leaderboard_top(int) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. user-data tables — owner read only (writes go through service role)
-- ---------------------------------------------------------------------
alter table public.submissions enable row level security;
drop policy if exists submissions_select_own on public.submissions;
create policy submissions_select_own on public.submissions
  for select using (auth.uid() = user_id);

alter table public.case_attempts enable row level security;
drop policy if exists case_attempts_select_own on public.case_attempts;
create policy case_attempts_select_own on public.case_attempts
  for select using (auth.uid() = user_id);

alter table public.payments enable row level security;
drop policy if exists payments_select_own on public.payments;
create policy payments_select_own on public.payments
  for select using (auth.uid() = user_id);

alter table public.user_badges enable row level security;
drop policy if exists user_badges_select_own on public.user_badges;
create policy user_badges_select_own on public.user_badges
  for select using (auth.uid() = user_id);

-- dimension_snapshots may not exist on every env (migration 0004); guard it.
do $$
begin
  if to_regclass('public.dimension_snapshots') is not null then
    execute 'alter table public.dimension_snapshots enable row level security';
    execute 'drop policy if exists dimension_snapshots_select_own on public.dimension_snapshots';
    execute 'create policy dimension_snapshots_select_own on public.dimension_snapshots for select using (auth.uid() = user_id)';
  end if;
end $$;

-- case_ratings — owner can read + write their own rating (rating prompt UI)
alter table public.case_ratings enable row level security;
drop policy if exists case_ratings_select_own on public.case_ratings;
create policy case_ratings_select_own on public.case_ratings
  for select using (auth.uid() = user_id);
drop policy if exists case_ratings_insert_own on public.case_ratings;
create policy case_ratings_insert_own on public.case_ratings
  for insert with check (auth.uid() = user_id);
drop policy if exists case_ratings_update_own on public.case_ratings;
create policy case_ratings_update_own on public.case_ratings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 3. reference / content tables — public read (non-sensitive)
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['badges','skill_nodes','skill_edges','learn_content']
  loop
    if to_regclass('public.'||t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists %I on public.%I', t||'_public_read', t);
      execute format('create policy %I on public.%I for select using (true)', t||'_public_read', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 4. gd_briefs — no direct client access (served by the FastAPI backend
--    via the service role); RLS on with no anon/auth policy = deny.
-- ---------------------------------------------------------------------
do $$
begin
  if to_regclass('public.gd_briefs') is not null then
    execute 'alter table public.gd_briefs enable row level security';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Sanity (uncomment to check after running):
--   select tablename, rowsecurity from pg_tables where schemaname='public' order by 1;
--   -- expect rowsecurity = true for users, submissions, payments, ...
-- =====================================================================

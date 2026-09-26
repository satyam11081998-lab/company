-- 0070_international_markets.sql
-- 2026-09-25 — US / Europe launch: per-account market, per-case market, and a
-- per-market daily schedule.
--
-- Run AFTER 0069. FULLY IDEMPOTENT (safe to re-run). ADDITIVE ONLY: no column
-- is dropped or renamed, no existing constraint is loosened, no existing row
-- changes meaning. India behaviour is unchanged by running this file.
--
-- MUST BE RUN BEFORE the frontend/backend that read `market` are deployed.
-- (Both repos also degrade safely if it has not run: a missing `market`
-- column is read as "India", which is what every pre-launch row is.)
--
-- ─────────────────────────────────────────────────────────────────────────────
-- WHAT EACH PIECE IS FOR
-- ─────────────────────────────────────────────────────────────────────────────
-- 1. users.market  'IN' | 'US' | 'EU'  (NULL = not stamped yet)
--    Stamped ONCE by the server from the edge IP-country header + the browser
--    timezone (lib/market.ts), then LOCKED:
--      * it is NOT in the column-level UPDATE grant 0054 gives `authenticated`,
--        so the browser cannot write it at all ("permission denied"), and
--      * the guard trigger below reverts it for any non-service-role writer.
--    Only the service role (the stamp, the admin override) can change it.
--    Every account that exists today is backfilled to 'IN'.
--
-- 2. cases.market  'IN' | 'US'  (default 'IN')
--    Which bank a case belongs to. Every existing case — and every case any
--    existing writer inserts without naming a market — stays India.
--
-- 3. market_daily_schedule
--    The US daily pair lives in its OWN table so the India `daily_schedule`
--    (UNIQUE(scheduled_date), read by ~6 call sites with no market filter) is
--    not touched at all. Keyed (market, scheduled_date); scheduled_date is the
--    market's own calendar day (US = America/New_York).
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- Run the backfill below as service_role so the privileged-column guard
-- trigger lets it through (same technique as 0068 §4g). Transaction-local.
select set_config('request.jwt.claims', '{"role":"service_role"}', true);

-- ── 1. users.market ────────────────────────────────────────────────────────
alter table public.users add column if not exists market text;

alter table public.users drop constraint if exists users_market_check;
alter table public.users add constraint users_market_check
  check (market is null or market in ('IN', 'US', 'EU'));

-- Everyone who signed up before the international launch is an India account.
update public.users set market = 'IN' where market is null;

create index if not exists users_market_idx on public.users (market);

-- Guard trigger: identical to 0054's body plus `market`. Kept as a second,
-- independent barrier behind the column grant (defence in depth).
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
    -- 0070: the account's market decides its price list and content bank.
    begin
      new.market := old.market;
    exception when undefined_column then null;
    end;
  end if;
  return new;
end $$;

drop trigger if exists trg_guard_user_cols on public.users;
create trigger trg_guard_user_cols before update on public.users
  for each row execute function public.guard_user_privileged_cols();

-- NOTE: no GRANT for `market`. 0054 revoked table-wide UPDATE from
-- anon/authenticated and re-granted only the profile columns; a new column is
-- therefore unwritable by those roles by default. That is the point.

-- ── 2. cases.market ────────────────────────────────────────────────────────
alter table public.cases add column if not exists market text not null default 'IN';

alter table public.cases drop constraint if exists cases_market_check;
alter table public.cases add constraint cases_market_check
  check (market in ('IN', 'US'));

create index if not exists cases_market_active_idx on public.cases (market, is_active, created_at desc);

-- ── 3. market_daily_schedule ───────────────────────────────────────────────
create table if not exists public.market_daily_schedule (
  id              uuid primary key default gen_random_uuid(),
  market          text not null check (market in ('US')),
  scheduled_date  date not null,
  case_id         uuid references public.cases(id) on delete set null,
  guesstimate_id  uuid references public.cases(id) on delete set null,
  source          text not null default 'generated' check (source in ('generated', 'bank')),
  created_at      timestamptz not null default now(),
  unique (market, scheduled_date)
);

create index if not exists market_daily_schedule_lookup
  on public.market_daily_schedule (market, scheduled_date desc);

-- Same exposure as daily_schedule: the daily pair is public (it is advertised
-- on the landing page). Writes are service-role only — no insert/update policy.
alter table public.market_daily_schedule enable row level security;
drop policy if exists "market_daily_schedule readable" on public.market_daily_schedule;
create policy "market_daily_schedule readable" on public.market_daily_schedule
  for select using (true);

-- (The service_role claim set above is transaction-local: it ends at COMMIT.)
commit;

notify pgrst, 'reload schema';

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFY (run after; eyeball the output)
-- ─────────────────────────────────────────────────────────────────────────────
-- (a) every pre-launch account is India, none unstamped:
--   select market, count(*) from public.users group by 1 order by 1;
--
-- (b) `market` must NOT appear in the authenticated UPDATE grant list:
--   select column_name from information_schema.role_column_grants
--    where table_schema='public' and table_name='users'
--      and privilege_type='UPDATE' and grantee='authenticated'
--    order by 1;
--
-- (c) every existing case is India:
--   select market, count(*) from public.cases group by 1;
--
-- (d) the new table exists and is empty until the US bank is seeded:
--   select * from public.market_daily_schedule order by scheduled_date desc limit 5;

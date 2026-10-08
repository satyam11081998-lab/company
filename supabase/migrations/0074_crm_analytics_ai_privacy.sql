-- =====================================================================
-- 0074_crm_analytics_ai_privacy.sql — MECE CRM, phase 4
--
--   Analytics   crm_cohort_activity(), crm_daily_metrics()  (aggregated in SQL)
--   AI          crm_ai_models (trained models + metrics), crm_ai_feedback
--               (human overrides / likes / dislikes)
--   Privacy     crm_consents (DPDP consent ledger), crm_privacy_requests
--   (DPDP Act)  (data principal rights), crm_breaches (breach register),
--               crm_blocklist (erased emails, hashed)
--   API         crm_api_keys (hashed), crm_api_usage (per-minute buckets)
--
-- Same security model as 0071–0073: RLS on, no policies, no anon/
-- authenticated grants. Requires 0071. FULLY IDEMPOTENT.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Privacy (DPDP Act 2023)
-- ---------------------------------------------------------------------
create table if not exists public.crm_consents (
  id           uuid primary key default gen_random_uuid(),
  record_id    uuid references public.crm_records(id) on delete set null,
  email_hash   text,
  purpose      text not null check (purpose in ('marketing','service','analytics','ai_profiling')),
  status       text not null check (status in ('given','withdrawn','pending')),
  notice       text check (notice is null or char_length(notice) <= 2000),
  notice_version text,
  channel      text not null default 'manual' check (channel in ('webform','manual','import','email','in_app','api','survey')),
  evidence     jsonb not null default '{}'::jsonb,
  created_by   uuid,
  created_at   timestamptz not null default now()
);
create index if not exists crm_consents_record on public.crm_consents (record_id, purpose, created_at desc);
create index if not exists crm_consents_email on public.crm_consents (email_hash, purpose, created_at desc);

create table if not exists public.crm_privacy_requests (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('access','correction','erasure','grievance','nomination','withdraw_consent','restrict')),
  status        text not null default 'open' check (status in ('open','in_progress','completed','rejected')),
  requester_email text check (requester_email is null or char_length(requester_email) <= 254),
  record_id     uuid references public.crm_records(id) on delete set null,
  details       text check (details is null or char_length(details) <= 4000),
  due_at        timestamptz,
  resolution    text check (resolution is null or char_length(resolution) <= 4000),
  created_by    uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  completed_at  timestamptz,
  completed_by  uuid
);
create index if not exists crm_privacy_requests_open on public.crm_privacy_requests (status, due_at);

create table if not exists public.crm_breaches (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null check (char_length(title) between 3 and 200),
  description           text check (description is null or char_length(description) <= 8000),
  detected_at           timestamptz not null,
  data_categories       text[] not null default '{}',
  people_affected       int check (people_affected is null or people_affected >= 0),
  severity              text not null default 'medium' check (severity in ('low','medium','high','critical')),
  status                text not null default 'open' check (status in ('open','contained','closed')),
  board_notified_at     timestamptz,
  principals_notified_at timestamptz,
  actions_taken         text check (actions_taken is null or char_length(actions_taken) <= 8000),
  created_by            uuid,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Erased people: keyed HMAC of the email (never the email itself).
create table if not exists public.crm_blocklist (
  email_hash  text primary key,
  reason      text,
  request_id  uuid,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- AI (Iris, the CRM assistant): trained models and human feedback
-- ---------------------------------------------------------------------
create table if not exists public.crm_ai_models (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind ~ '^[a-z_]{2,40}$'),
  config_id   uuid,
  module      text not null,
  version     int not null default 1,
  model       jsonb not null,
  metrics     jsonb not null default '{}'::jsonb,
  trained_at  timestamptz not null default now(),
  trained_by  uuid,
  active      boolean not null default true
);
create index if not exists crm_ai_models_kind on public.crm_ai_models (kind, config_id, trained_at desc);

create table if not exists public.crm_ai_feedback (
  id          uuid primary key default gen_random_uuid(),
  record_id   uuid references public.crm_records(id) on delete cascade,
  kind        text not null check (kind ~ '^[a-z_]{2,40}$'),
  verdict     text not null check (verdict in ('agree','disagree','override','like','dislike')),
  value       jsonb,
  reason      text check (reason is null or char_length(reason) <= 1000),
  user_id     uuid,
  created_at  timestamptz not null default now()
);
create index if not exists crm_ai_feedback_record on public.crm_ai_feedback (record_id, kind, created_at desc);

-- ---------------------------------------------------------------------
-- REST API keys (only the SHA-256 of the key is stored)
-- ---------------------------------------------------------------------
create table if not exists public.crm_api_keys (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 80),
  prefix        text not null,
  key_hash      text not null unique,
  user_id       uuid not null references public.users(id) on delete cascade,
  scopes        text[] not null default '{read}',
  created_by    uuid,
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz,
  expires_at    timestamptz,
  revoked_at    timestamptz
);

create table if not exists public.crm_api_usage (
  key_id   uuid not null references public.crm_api_keys(id) on delete cascade,
  minute   timestamptz not null,
  calls    int not null default 0,
  primary key (key_id, minute)
);

-- Count one call; returns the calls in this minute (caller compares with its limit).
create or replace function public.crm_api_hit(p_key uuid)
returns int
language sql
as $$
  insert into public.crm_api_usage as u (key_id, minute, calls) values (p_key, date_trunc('minute', now()), 1)
  on conflict (key_id, minute) do update set calls = u.calls + 1
  returning u.calls;
$$;

-- ---------------------------------------------------------------------
-- Analytics helpers (aggregate in SQL; never row-by-row through the API)
-- ---------------------------------------------------------------------

-- Signup cohorts (IST months) × months since signup → users active that month
-- (solved or started a case) and users who paid that month. Internal/demo/guest
-- accounts are excluded by the caller through p_excluded_users.
create or replace function public.crm_cohort_activity(p_months int default 12, p_excluded_users uuid[] default '{}')
returns table (cohort text, month_index int, cohort_size int, active_users int, paying_users int)
language plpgsql
stable
as $$
begin
  return query
  with u as (
    select x.id, date_trunc('month', x.created_at at time zone 'Asia/Kolkata') as cm
    from public.users x
    where coalesce(x.is_guest, false) = false
      and x.created_at >= date_trunc('month', now() at time zone 'Asia/Kolkata') - make_interval(months => greatest(1, least(p_months, 36)) - 1)
      and not (x.id = any(p_excluded_users))
  ), act as (
    select a.user_id, date_trunc('month', a.created_at at time zone 'Asia/Kolkata') as m from public.attempts a
    union
    select s.user_id, date_trunc('month', s.created_at at time zone 'Asia/Kolkata') from public.submissions s
  ), paid as (
    select p.user_id, date_trunc('month', coalesce(p.paid_at, p.created_at) at time zone 'Asia/Kolkata') as m
    from public.payments p where p.status = 'paid' and coalesce(btrim(p.razorpay_payment_id), '') <> ''
  ), sizes as (
    select cm, count(*)::int as n from u group by cm
  ), grid as (
    select u.cm, gs.k
    from (select distinct cm from u) u
    cross join lateral generate_series(0, (extract(year from age(date_trunc('month', now() at time zone 'Asia/Kolkata'), u.cm)) * 12
                                          + extract(month from age(date_trunc('month', now() at time zone 'Asia/Kolkata'), u.cm)))::int) as gs(k)
  )
  select to_char(g.cm, 'YYYY-MM'), g.k, s.n,
         (select count(distinct a.user_id)::int from act a join u on u.id = a.user_id where u.cm = g.cm and a.m = g.cm + make_interval(months => g.k)),
         (select count(distinct p.user_id)::int from paid p join u on u.id = p.user_id where u.cm = g.cm and p.m = g.cm + make_interval(months => g.k))
  from grid g join sizes s on s.cm = g.cm
  order by 1, 2;
end;
$$;

-- Daily metrics (IST days) for anomaly detection.
create or replace function public.crm_daily_metrics(p_days int default 70)
returns table (day date, signups int, payments int, revenue_paise bigint, solves int, reports int)
language plpgsql
stable
as $$
declare d0 date := ((now() at time zone 'Asia/Kolkata')::date - greatest(14, least(p_days, 400)));
begin
  return query
  with days as (select generate_series(d0, (now() at time zone 'Asia/Kolkata')::date, interval '1 day')::date as d)
  select days.d,
    (select count(*)::int from public.users x where coalesce(x.is_guest, false) = false and (x.created_at at time zone 'Asia/Kolkata')::date = days.d),
    (select count(*)::int from public.payments p where p.status = 'paid' and coalesce(btrim(p.razorpay_payment_id), '') <> '' and (coalesce(p.paid_at, p.created_at) at time zone 'Asia/Kolkata')::date = days.d),
    (select coalesce(sum(p.amount_paise), 0)::bigint from public.payments p where p.status = 'paid' and upper(coalesce(p.currency, 'INR')) = 'INR' and coalesce(btrim(p.razorpay_payment_id), '') <> '' and (coalesce(p.paid_at, p.created_at) at time zone 'Asia/Kolkata')::date = days.d),
    (select count(*)::int from public.submissions s where (s.created_at at time zone 'Asia/Kolkata')::date = days.d),
    (select count(*)::int from public.feedback_reports f where (f.created_at at time zone 'Asia/Kolkata')::date = days.d)
  from days order by 1;
end;
$$;

-- ---------------------------------------------------------------------
-- Lock everything down
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['crm_consents','crm_privacy_requests','crm_breaches','crm_blocklist','crm_ai_models','crm_ai_feedback','crm_api_keys','crm_api_usage'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;

revoke all on function public.crm_api_hit(uuid) from public, anon, authenticated;
revoke all on function public.crm_cohort_activity(int, uuid[]) from public, anon, authenticated;
revoke all on function public.crm_daily_metrics(int) from public, anon, authenticated;
grant execute on function public.crm_api_hit(uuid) to service_role;
grant execute on function public.crm_cohort_activity(int, uuid[]) to service_role;
grant execute on function public.crm_daily_metrics(int) to service_role;

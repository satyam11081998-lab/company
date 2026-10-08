-- =====================================================================
-- 0071_crm_core.sql — MECE CRM, phase 1 (records engine + sales)
--
-- A Zoho-style CRM inside MECE. Design: docs/crm/DESIGN.md.
--
-- SECURITY MODEL
--   Every crm_* table has RLS ENABLED with NO policies, and anon /
--   authenticated have every privilege revoked. The browser can never read
--   or write these tables. All access goes through Next.js server actions
--   that (1) authenticate the user, (2) check CRM membership + profile
--   permissions, and only then (3) use the service-role client.
--   RPCs are revoked from public/anon/authenticated and granted to
--   service_role only.
--
-- FULLY IDEMPOTENT: safe to re-run. Additive only — no existing table,
-- column, policy or function is touched.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Settings (key/value) and CRM membership
-- ---------------------------------------------------------------------
create table if not exists public.crm_settings (
  key         text primary key check (key ~ '^[a-z][a-z0-9_.]{1,60}$'),
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);

create table if not exists public.crm_users (
  user_id     uuid primary key references public.users(id) on delete cascade,
  profile_id  uuid,                     -- crm_config(kind='profile')
  role_id     uuid,                     -- crm_config(kind='role')
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  created_by  uuid
);

-- ---------------------------------------------------------------------
-- Metadata: modules and fields (Zoho "Modules and Fields")
-- ---------------------------------------------------------------------
create table if not exists public.crm_modules (
  api_name    text primary key check (api_name ~ '^[a-z][a-z0-9_]{1,40}$'),
  label       text not null check (char_length(label) between 1 and 60),
  singular    text not null check (char_length(singular) between 1 and 60),
  kind        text not null default 'custom' check (kind in ('standard','custom')),
  icon        text,
  position    int  not null default 100,
  settings    jsonb not null default '{}'::jsonb,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.crm_fields (
  id          uuid primary key default gen_random_uuid(),
  module      text not null references public.crm_modules(api_name) on delete cascade,
  api_name    text not null check (api_name ~ '^[a-z][a-z0-9_]{0,50}$'),
  label       text not null check (char_length(label) between 1 and 80),
  type        text not null check (type ~ '^[a-z_]{2,30}$'),
  required    boolean not null default false,
  is_unique   boolean not null default false,
  readonly    boolean not null default false,
  system      boolean not null default false,
  options     jsonb not null default '{}'::jsonb,
  section     text not null default 'Details',
  position    int  not null default 100,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (module, api_name)
);

-- ---------------------------------------------------------------------
-- Records: one row per record of every module
-- ---------------------------------------------------------------------
create table if not exists public.crm_records (
  id                uuid primary key default gen_random_uuid(),
  module            text not null references public.crm_modules(api_name) on delete restrict,
  name              text not null default '' check (char_length(name) <= 300),
  owner_id          uuid references public.users(id) on delete set null,
  data              jsonb not null default '{}'::jsonb,
  tags              text[] not null default '{}',
  external_key      text,               -- 'user:<uuid>', 'payment:<id>' … (sync idempotency)
  mece_user_id      uuid references public.users(id) on delete set null,
  source            text,               -- ui | import | webform | api | automation | sync
  source_ref        text,               -- import id, form key, …
  score             int,
  last_activity_at  timestamptz,
  locked            jsonb,              -- {kind, reason, by, at} or null
  approval_status   text,               -- null | pending | approved | rejected
  blueprint         jsonb,              -- {id, state, entered_at} or null
  shared_with       jsonb not null default '[]'::jsonb,  -- manual shares [{user_id, access}]
  created_by        uuid,
  created_at        timestamptz not null default now(),
  updated_by        uuid,
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz,
  deleted_by        uuid,
  merged_into       uuid,
  constraint crm_records_data_is_object check (jsonb_typeof(data) = 'object'),
  constraint crm_records_data_size check (pg_column_size(data) <= 262144),
  constraint crm_records_tags_max check (coalesce(array_length(tags, 1), 0) <= 20),
  constraint crm_records_shared_is_array check (jsonb_typeof(shared_with) = 'array')
);
-- Columns added after the first cut of this file (kept here so a re-run on a
-- database created from that cut still converges).
alter table public.crm_records add column if not exists shared_with jsonb not null default '[]'::jsonb;
-- FULL unique (not partial): ON CONFLICT (module, external_key) needs it.
-- NULL external_keys (manual records) never collide.
create unique index if not exists crm_records_module_extkey on public.crm_records (module, external_key);
create index if not exists crm_records_module_live on public.crm_records (module, updated_at desc) where deleted_at is null;
create index if not exists crm_records_owner on public.crm_records (owner_id);
create index if not exists crm_records_user on public.crm_records (mece_user_id);
create index if not exists crm_records_name on public.crm_records (module, lower(name));
create index if not exists crm_records_email on public.crm_records (module, lower(data->>'email'));
create index if not exists crm_records_data on public.crm_records using gin (data jsonb_path_ops);
create index if not exists crm_records_tags on public.crm_records using gin (tags);
create index if not exists crm_records_deleted on public.crm_records (deleted_at) where deleted_at is not null;

-- Many-to-many links: campaign members, deal contacts, manual shares …
create table if not exists public.crm_links (
  id          uuid primary key default gen_random_uuid(),
  from_id     uuid not null references public.crm_records(id) on delete cascade,
  to_id       uuid not null references public.crm_records(id) on delete cascade,
  kind        text not null check (kind ~ '^[a-z_]{2,40}$'),
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  created_by  uuid,
  unique (from_id, to_id, kind)
);
create index if not exists crm_links_to on public.crm_links (to_id, kind);

create table if not exists public.crm_notes (
  id          uuid primary key default gen_random_uuid(),
  record_id   uuid not null references public.crm_records(id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 32000),
  created_by  uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index if not exists crm_notes_record on public.crm_notes (record_id, created_at desc);

create table if not exists public.crm_attachments (
  id            uuid primary key default gen_random_uuid(),
  record_id     uuid not null references public.crm_records(id) on delete cascade,
  storage_path  text not null,
  filename      text not null check (char_length(filename) between 1 and 200),
  mime          text,
  size_bytes    int check (size_bytes >= 0 and size_bytes <= 10485760),
  created_by    uuid,
  created_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index if not exists crm_attachments_record on public.crm_attachments (record_id);

insert into storage.buckets (id, name, public)
values ('crm-attachments', 'crm-attachments', false)
on conflict (id) do nothing;

-- Stage history (Zoho: "Stage History" related list; feeds velocity + deal health)
create table if not exists public.crm_stage_history (
  id                bigint generated always as identity primary key,
  record_id         uuid not null references public.crm_records(id) on delete cascade,
  field             text not null,
  from_value        text,
  to_value          text,
  amount            numeric,
  probability       int,
  changed_at        timestamptz not null default now(),
  changed_by        uuid,
  seconds_in_from   bigint
);
create index if not exists crm_stage_history_record on public.crm_stage_history (record_id, changed_at);

-- ---------------------------------------------------------------------
-- Configuration: views, pipelines, roles, profiles, rules, forms … all in
-- one table; each kind's shape is validated in TypeScript (lib/crm).
-- ---------------------------------------------------------------------
create table if not exists public.crm_config (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind ~ '^[a-z_]{2,40}$'),
  module      text references public.crm_modules(api_name) on delete cascade,
  name        text not null check (char_length(name) between 1 and 120),
  active      boolean not null default true,
  position    int not null default 100,
  public_key  text unique check (public_key is null or public_key ~ '^[A-Za-z0-9_-]{8,64}$'),
  config      jsonb not null default '{}'::jsonb,
  owner_id    uuid,
  shared      boolean not null default true,
  version     int not null default 1,
  created_by  uuid,
  created_at  timestamptz not null default now(),
  updated_by  uuid,
  updated_at  timestamptz not null default now(),
  constraint crm_config_is_object check (jsonb_typeof(config) = 'object'),
  constraint crm_config_size check (pg_column_size(config) <= 524288)
);
create index if not exists crm_config_kind on public.crm_config (kind, module, position);
-- Named things that must be unique (also stops two first-time page loads from
-- seeding the default pipelines/profiles/roles twice).
create unique index if not exists crm_config_unique_name
  on public.crm_config (kind, coalesce(module, ''), lower(name))
  where kind in ('pipeline','profile','role','webform','segment','survey','email_template','territory','blueprint','cadence','macro');

-- Auto-number counters (Case CS-0001, Quote QT-0001 …)
create table if not exists public.crm_counters (
  key   text primary key check (key ~ '^[a-z0-9_.:]{2,80}$'),
  next  bigint not null default 1
);

create or replace function public.crm_next_number(p_key text)
returns bigint
language sql
as $$
  insert into public.crm_counters as c (key, next) values (p_key, 2)
  on conflict (key) do update set next = c.next + 1
  returning c.next - 1;
$$;

-- Reserve a block of n numbers at once (imports): returns the first number.
create or replace function public.crm_reserve_numbers(p_key text, p_n int)
returns bigint
language sql
as $$
  insert into public.crm_counters as c (key, next) values (p_key, 1 + greatest(1, least(p_n, 100000)))
  on conflict (key) do update set next = c.next + greatest(1, least(p_n, 100000))
  returning c.next - greatest(1, least(p_n, 100000));
$$;

-- ---------------------------------------------------------------------
-- Audit log — append-only (Zoho "Audit Log", 3-year retention)
-- ---------------------------------------------------------------------
create table if not exists public.crm_audit (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor_id    uuid,
  actor_kind  text not null default 'user' check (actor_kind in ('user','automation','sync','api','system','public')),
  action      text not null check (char_length(action) between 2 and 60),
  module      text,
  record_id   uuid,
  changes     jsonb,
  meta        jsonb,
  redacted    boolean not null default false
);
create index if not exists crm_audit_record on public.crm_audit (record_id, at desc);
create index if not exists crm_audit_at on public.crm_audit (at desc);
create index if not exists crm_audit_actor on public.crm_audit (actor_id, at desc);

-- UPDATE is allowed ONLY to redact (erasure request): changes/meta may be
-- blanked and redacted flipped to true; nothing else may change. DELETE is
-- refused outright, for every role including service_role.
create or replace function public.crm_audit_guard()
returns trigger
language plpgsql
as $$
begin
  if tg_op in ('DELETE', 'TRUNCATE') then
    raise exception 'crm_audit is append-only';
  end if;
  if new.redacted is distinct from true
     or new.id is distinct from old.id
     or new.at is distinct from old.at
     or new.actor_id is distinct from old.actor_id
     or new.actor_kind is distinct from old.actor_kind
     or new.action is distinct from old.action
     or new.module is distinct from old.module
     or new.record_id is distinct from old.record_id then
    raise exception 'crm_audit rows can only be redacted';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_crm_audit_guard on public.crm_audit;
create trigger trg_crm_audit_guard
  before update or delete on public.crm_audit
  for each row execute function public.crm_audit_guard();

-- TRUNCATE skips row triggers, so it gets its own statement-level guard.
drop trigger if exists trg_crm_audit_no_truncate on public.crm_audit;
create trigger trg_crm_audit_no_truncate
  before truncate on public.crm_audit
  for each statement execute function public.crm_audit_guard();

-- ---------------------------------------------------------------------
-- Imports (undo-able), notifications, sync runs
-- ---------------------------------------------------------------------
create table if not exists public.crm_imports (
  id          uuid primary key default gen_random_uuid(),
  module      text not null,
  filename    text,
  total       int not null default 0,
  created     int not null default 0,
  updated     int not null default 0,
  skipped     int not null default 0,
  failed      int not null default 0,
  errors      jsonb not null default '[]'::jsonb,
  created_by  uuid,
  created_at  timestamptz not null default now(),
  undone_at   timestamptz
);

create table if not exists public.crm_notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  kind        text not null,
  title       text not null check (char_length(title) <= 200),
  body        text check (char_length(body) <= 2000),
  link        text check (link is null or link ~ '^/crm(/|$)'),
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists crm_notifications_user on public.crm_notifications (user_id, created_at desc);

create table if not exists public.crm_sync_runs (
  id           uuid primary key default gen_random_uuid(),
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  trigger      text,
  stats        jsonb not null default '{}'::jsonb,
  error        text
);

-- ---------------------------------------------------------------------
-- Sync upsert: MECE facts → CRM records without clobbering CRM edits.
-- `data = existing || patch` happens inside one statement, so a CRM user's
-- concurrent edit to a non-synced field is never lost. Rows whose synced
-- values are unchanged are skipped (no updated_at churn).
-- p_rows: [{module, external_key, name, mece_user_id, data, owner_id?}]
-- ---------------------------------------------------------------------
create or replace function public.crm_sync_upsert(p_rows jsonb)
returns int
language plpgsql
as $$
declare
  n int;
begin
  if jsonb_typeof(p_rows) <> 'array' then
    raise exception 'p_rows must be an array';
  end if;
  with src as (
    select
      r->>'module'                             as module,
      r->>'external_key'                       as external_key,
      left(coalesce(r->>'name', ''), 300)      as name,
      nullif(r->>'mece_user_id', '')::uuid     as mece_user_id,
      coalesce(r->'data', '{}'::jsonb)         as data,
      nullif(r->>'owner_id', '')::uuid         as owner_id,
      nullif(r->>'created_at', '')::timestamptz as created_at
    from jsonb_array_elements(p_rows) r
    where r->>'module' is not null and r->>'external_key' is not null
  ), up as (
    insert into public.crm_records as t
      (module, external_key, name, mece_user_id, data, owner_id, source, created_at, updated_at)
    select module, external_key, name, mece_user_id, data, owner_id, 'sync',
           coalesce(created_at, now()), now()
    from src
    on conflict (module, external_key) do update
      set data         = t.data || excluded.data,
          name         = case when excluded.name <> '' then excluded.name else t.name end,
          mece_user_id = coalesce(excluded.mece_user_id, t.mece_user_id),
          updated_at   = now()
      where not (t.data @> excluded.data)
         or (excluded.name <> '' and t.name is distinct from excluded.name)
         or (excluded.mece_user_id is not null and t.mece_user_id is distinct from excluded.mece_user_id)
    returning 1
  )
  select count(*) into n from up;
  return n;
end;
$$;

-- ---------------------------------------------------------------------
-- Per-user MECE facts for the CRM sync, aggregated in SQL (one round trip
-- instead of paging every submission / AI-usage row through the API).
-- Revenue rules mirror lib/revenue.ts: only rows carrying a Razorpay
-- payment id count; `payments` additionally needs status = 'paid'; ids in
-- p_excluded are left out. Internal accounts are excluded by the caller.
-- plpgsql (not sql) so a missing optional table fails at run time, not at
-- migration time.
-- ---------------------------------------------------------------------
create or replace function public.crm_user_facts(p_excluded text[] default '{}')
returns table (
  user_id          uuid,
  cases_solved     int,
  avg_score        numeric,
  best_score       int,
  first_solved_at  timestamptz,
  last_solved_at   timestamptz,
  last_seen_at     timestamptz,
  active_days_30   int,
  ai_cost_usd      numeric,
  voice_minutes    numeric,
  rev_inr_paise    bigint,
  rev_usd_cents    bigint,
  rev_eur_cents    bigint,
  paid_count       int,
  first_paid_at    timestamptz,
  last_paid_at     timestamptz
)
language plpgsql
stable
as $$
begin
  return query
  with subs as (
    select s.user_id, count(*)::int as n, round(avg(s.score)::numeric, 1) as avg_score, max(s.score)::int as best,
           min(s.created_at) as first_at, max(s.created_at) as last_at
    from public.submissions s where s.user_id is not null
    group by s.user_id
  ), seen as (
    select us.user_id, max(us.last_seen_at) as last_seen from public.user_sessions us group by us.user_id
  ), days as (
    select x.user_id, count(distinct (x.at at time zone 'Asia/Kolkata')::date)::int as d
    from (
      select a.user_id, a.created_at as at from public.attempts a where a.created_at > now() - interval '30 days'
      union all
      select s.user_id, s.created_at from public.submissions s where s.created_at > now() - interval '30 days'
    ) x where x.user_id is not null group by x.user_id
  ), ai as (
    select l.user_id, sum(coalesce(l.est_cost_usd, 0)) as cost, sum(coalesce(l.audio_minutes, 0)) as mins
    from public.ai_usage_log l where l.user_id is not null group by l.user_id
  ), money as (
    select p.user_id, upper(coalesce(p.currency, 'INR')) as cur, p.amount_paise::bigint as amt, coalesce(p.paid_at, p.created_at) as at
      from public.payments p
      where p.status = 'paid' and coalesce(btrim(p.razorpay_payment_id), '') <> '' and not (p.razorpay_payment_id = any(p_excluded))
    union all
    select d.user_id, 'INR', d.amount_paise::bigint, d.created_at from public.deck_purchases d
      where coalesce(btrim(d.razorpay_payment_id), '') <> '' and not (d.razorpay_payment_id = any(p_excluded))
    union all
    select v.user_id, 'INR', coalesce(v.amount_paise, 0)::bigint, v.granted_at from public.skeleton_access v
      where coalesce(btrim(v.razorpay_payment_id), '') <> '' and not (v.razorpay_payment_id = any(p_excluded))
    union all
    select r.user_id, 'INR', coalesce(r.amount_paise, 0)::bigint, r.created_at from public.realtime_purchases r
      where coalesce(btrim(r.razorpay_payment_id), '') <> '' and not (r.razorpay_payment_id = any(p_excluded))
  ), rev as (
    select m.user_id,
           sum(case when m.cur = 'INR' then m.amt else 0 end)::bigint as inr,
           sum(case when m.cur = 'USD' then m.amt else 0 end)::bigint as usd,
           sum(case when m.cur = 'EUR' then m.amt else 0 end)::bigint as eur,
           count(*)::int as n, min(m.at) as first_at, max(m.at) as last_at
    from money m where m.user_id is not null group by m.user_id
  ), ids as (
    select subs.user_id from subs union select seen.user_id from seen union select days.user_id from days
    union select ai.user_id from ai union select rev.user_id from rev
  )
  select ids.user_id, coalesce(subs.n, 0), subs.avg_score, subs.best, subs.first_at, subs.last_at,
         seen.last_seen, coalesce(days.d, 0), round(coalesce(ai.cost, 0)::numeric, 4), round(coalesce(ai.mins, 0)::numeric, 2),
         coalesce(rev.inr, 0), coalesce(rev.usd, 0), coalesce(rev.eur, 0), coalesce(rev.n, 0), rev.first_at, rev.last_at
  from ids
  left join subs on subs.user_id = ids.user_id
  left join seen on seen.user_id = ids.user_id
  left join days on days.user_id = ids.user_id
  left join ai on ai.user_id = ids.user_id
  left join rev on rev.user_id = ids.user_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Lock everything down: RLS on, no policies, no anon/authenticated grants.
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'crm_settings','crm_users','crm_modules','crm_fields','crm_records','crm_links',
    'crm_notes','crm_attachments','crm_stage_history','crm_config','crm_counters',
    'crm_audit','crm_imports','crm_notifications','crm_sync_runs'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;

revoke truncate on public.crm_audit from service_role;

revoke all on function public.crm_next_number(text) from public, anon, authenticated;
revoke all on function public.crm_sync_upsert(jsonb) from public, anon, authenticated;
revoke all on function public.crm_reserve_numbers(text, int) from public, anon, authenticated;
revoke all on function public.crm_user_facts(text[]) from public, anon, authenticated;
grant execute on function public.crm_user_facts(text[]) to service_role;
grant execute on function public.crm_reserve_numbers(text, int) to service_role;
grant execute on function public.crm_next_number(text) to service_role;
grant execute on function public.crm_sync_upsert(jsonb) to service_role;

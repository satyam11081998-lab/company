-- =====================================================================
-- 0072_crm_marketing_service.sql — MECE CRM, phase 2 (marketing + service)
--
--   crm_outbox            every customer-facing email, approve-before-send
--   crm_email_events      opens / clicks (tracking pixel + redirect)
--   crm_form_submissions  public web-form posts (rate limit, spam log, A/B)
--   crm_form_views        web-form views per variant per day (A/B testing)
--   crm_survey_responses  NPS / CSAT / CES answers
--
-- Same security model as 0071: RLS on, no policies, no anon/authenticated
-- grants; only the service role (after the app's own checks) touches these.
-- Requires 0071. FULLY IDEMPOTENT.
-- =====================================================================

create table if not exists public.crm_outbox (
  id              uuid primary key default gen_random_uuid(),
  record_id       uuid references public.crm_records(id) on delete set null,
  to_email        text not null check (char_length(to_email) between 3 and 254),
  to_name         text,
  subject         text not null check (char_length(subject) between 1 and 300),
  html            text not null check (char_length(html) <= 200000),
  text_body       text check (text_body is null or char_length(text_body) <= 100000),
  category        text not null default 'marketing' check (category in ('marketing','service')),
  source          text not null check (source in ('manual','campaign','workflow','cadence','macro','survey','webform','system')),
  source_id       text,
  template_id     uuid,
  campaign_id     uuid references public.crm_records(id) on delete set null,
  links           jsonb not null default '[]'::jsonb,
  status          text not null default 'pending'
                    check (status in ('pending','approved','sending','sent','rejected','failed','suppressed','cancelled')),
  status_reason   text,
  dedupe_key      text unique,
  scheduled_for   timestamptz,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  decided_by      uuid,
  decided_at      timestamptz,
  sent_at         timestamptz,
  opened_at       timestamptz,
  clicked_at      timestamptz,
  open_count      int not null default 0,
  click_count     int not null default 0
);
create index if not exists crm_outbox_status on public.crm_outbox (status, created_at);
create index if not exists crm_outbox_record on public.crm_outbox (record_id, created_at desc);
create index if not exists crm_outbox_campaign on public.crm_outbox (campaign_id);
create index if not exists crm_outbox_sent_day on public.crm_outbox (sent_at) where sent_at is not null;

create table if not exists public.crm_email_events (
  id          bigint generated always as identity primary key,
  outbox_id   uuid not null references public.crm_outbox(id) on delete cascade,
  kind        text not null check (kind in ('open','click','unsubscribe','bounce')),
  link_index  int,
  at          timestamptz not null default now(),
  ua          text
);
create index if not exists crm_email_events_outbox on public.crm_email_events (outbox_id, at);

create table if not exists public.crm_form_submissions (
  id          uuid primary key default gen_random_uuid(),
  form_id     uuid not null references public.crm_config(id) on delete cascade,
  variant     text,
  ip_hash     text,
  status      text not null check (status in ('accepted','spam','rate_limited','invalid')),
  record_id   uuid references public.crm_records(id) on delete set null,
  consent     jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists crm_form_submissions_form on public.crm_form_submissions (form_id, created_at desc);
create index if not exists crm_form_submissions_ip on public.crm_form_submissions (ip_hash, created_at desc);

create table if not exists public.crm_form_views (
  form_id   uuid not null references public.crm_config(id) on delete cascade,
  variant   text not null default 'A',
  day       date not null,
  views     int not null default 0,
  primary key (form_id, variant, day)
);

create or replace function public.crm_form_view(p_form uuid, p_variant text)
returns void
language sql
as $$
  insert into public.crm_form_views (form_id, variant, day, views)
  values (p_form, left(coalesce(p_variant, 'A'), 8), (now() at time zone 'Asia/Kolkata')::date, 1)
  on conflict (form_id, variant, day) do update set views = public.crm_form_views.views + 1;
$$;

create table if not exists public.crm_survey_responses (
  id          uuid primary key default gen_random_uuid(),
  survey_id   uuid references public.crm_config(id) on delete set null,
  kind        text not null check (kind in ('nps','csat','ces')),
  record_id   uuid references public.crm_records(id) on delete set null,
  outbox_id   uuid references public.crm_outbox(id) on delete set null,
  token       text unique,
  score       int check (score between 0 and 10),
  comment     text check (comment is null or char_length(comment) <= 2000),
  sentiment   text,
  source      text not null default 'email' check (source in ('email','in_app','import')),
  external_key text unique,
  sent_at     timestamptz,
  answered_at timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists crm_survey_responses_survey on public.crm_survey_responses (survey_id, answered_at desc);
create index if not exists crm_survey_responses_record on public.crm_survey_responses (record_id);

-- Atomic open/click counter bump for tracking
create or replace function public.crm_track(p_outbox uuid, p_kind text, p_link int, p_ua text)
returns void
language plpgsql
as $$
begin
  if p_kind not in ('open','click') then return; end if;
  insert into public.crm_email_events (outbox_id, kind, link_index, ua) values (p_outbox, p_kind, p_link, left(p_ua, 300));
  if p_kind = 'open' then
    update public.crm_outbox set open_count = open_count + 1, opened_at = coalesce(opened_at, now()) where id = p_outbox and status = 'sent';
  else
    -- a click implies the message was opened (images may be blocked)
    update public.crm_outbox set click_count = click_count + 1, clicked_at = coalesce(clicked_at, now()), opened_at = coalesce(opened_at, now()) where id = p_outbox and status = 'sent';
  end if;
end;
$$;

-- Merge engine-computed values into records by id (RFM scores, survey
-- answers, SLA stamps): data = data || patch in one statement, skipping rows
-- that already hold those values. p_rows: [{id, data}]
create or replace function public.crm_merge_data(p_rows jsonb)
returns int
language plpgsql
as $$
declare n int;
begin
  if jsonb_typeof(p_rows) <> 'array' then raise exception 'p_rows must be an array'; end if;
  with src as (
    select (r->>'id')::uuid as id, coalesce(r->'data', '{}'::jsonb) as data
    from jsonb_array_elements(p_rows) r
    where r->>'id' is not null and jsonb_typeof(r->'data') = 'object'
  ), up as (
    update public.crm_records t set data = t.data || src.data, updated_at = now()
    from src where t.id = src.id and not (t.data @> src.data)
    returning 1
  )
  select count(*) into n from up;
  return n;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['crm_outbox','crm_email_events','crm_form_submissions','crm_form_views','crm_survey_responses'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;

revoke all on function public.crm_merge_data(jsonb) from public, anon, authenticated;
grant execute on function public.crm_merge_data(jsonb) to service_role;
revoke all on function public.crm_form_view(uuid, text) from public, anon, authenticated;
revoke all on function public.crm_track(uuid, text, int, text) from public, anon, authenticated;
grant execute on function public.crm_form_view(uuid, text) to service_role;
grant execute on function public.crm_track(uuid, text, int, text) to service_role;

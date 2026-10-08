-- =====================================================================
-- 0073_crm_automation.sql — MECE CRM, phase 3 (automation)
--
--   crm_jobs                scheduled workflow actions, blueprint SLA timers,
--                           date-trigger firings (dedupe_key = fire once)
--   crm_cadence_enrollments who is in which cadence, at which step, until when
--   crm_approvals           approval requests (stage, approvers, decisions)
--   crm_webhook_log         every outbound webhook call (host only, no body)
--   crm_claim_jobs()        atomic claim of due jobs (FOR UPDATE SKIP LOCKED)
--
-- Rule definitions (workflows, blueprints, approval processes, assignment,
-- scoring, validation and layout rules, macros, cadences, webhooks) live in
-- crm_config like every other CRM setting.
--
-- Same security model as 0071/0072: RLS on, no policies, no anon/authenticated
-- grants. Requires 0071. FULLY IDEMPOTENT.
-- =====================================================================

create table if not exists public.crm_jobs (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('workflow_action','blueprint_sla','date_trigger','approval_reminder')),
  rule_id      uuid,
  record_id    uuid references public.crm_records(id) on delete cascade,
  run_at       timestamptz not null,
  payload      jsonb not null default '{}'::jsonb,
  status       text not null default 'pending' check (status in ('pending','running','done','cancelled','failed')),
  attempts     int not null default 0,
  last_error   text,
  dedupe_key   text unique,
  created_at   timestamptz not null default now(),
  finished_at  timestamptz,
  constraint crm_jobs_payload_obj check (jsonb_typeof(payload) = 'object')
);
create index if not exists crm_jobs_due on public.crm_jobs (run_at) where status = 'pending';
create index if not exists crm_jobs_record on public.crm_jobs (record_id, status);
create index if not exists crm_jobs_rule on public.crm_jobs (rule_id, status);

create table if not exists public.crm_cadence_enrollments (
  id           uuid primary key default gen_random_uuid(),
  cadence_id   uuid not null references public.crm_config(id) on delete cascade,
  record_id    uuid not null references public.crm_records(id) on delete cascade,
  status       text not null default 'active' check (status in ('active','completed','exited','paused')),
  step         int not null default 0,
  next_at      timestamptz,
  enrolled_at  timestamptz not null default now(),
  enrolled_by  uuid,
  exited_at    timestamptz,
  exit_reason  text,
  history      jsonb not null default '[]'::jsonb,
  unique (cadence_id, record_id)
);
create index if not exists crm_cadence_due on public.crm_cadence_enrollments (next_at) where status = 'active';
create index if not exists crm_cadence_record on public.crm_cadence_enrollments (record_id);

create table if not exists public.crm_approvals (
  id            uuid primary key default gen_random_uuid(),
  process_id    uuid references public.crm_config(id) on delete set null,
  record_id     uuid not null references public.crm_records(id) on delete cascade,
  status        text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  stage         int not null default 0,
  approvers     uuid[] not null default '{}',
  approved_by   uuid[] not null default '{}',
  requested_by  uuid,
  requested_at  timestamptz not null default now(),
  decided_by    uuid,
  decided_at    timestamptz,
  comment       text check (comment is null or char_length(comment) <= 1000),
  history       jsonb not null default '[]'::jsonb
);
create index if not exists crm_approvals_pending on public.crm_approvals (status, requested_at) where status = 'pending';
create index if not exists crm_approvals_record on public.crm_approvals (record_id, requested_at desc);
-- at most one open request per record
create unique index if not exists crm_approvals_one_open on public.crm_approvals (record_id) where status = 'pending';

create table if not exists public.crm_webhook_log (
  id          bigint generated always as identity primary key,
  webhook_id  uuid,
  record_id   uuid,
  host        text,
  status      int,
  ok          boolean not null default false,
  ms          int,
  error       text,
  at          timestamptz not null default now()
);
create index if not exists crm_webhook_log_hook on public.crm_webhook_log (webhook_id, at desc);

-- Atomically claim up to p_limit due jobs. Concurrent callers never get the
-- same job (SKIP LOCKED); a job stuck in 'running' for 15 minutes (crashed
-- worker) becomes claimable again, up to 3 attempts.
create or replace function public.crm_claim_jobs(p_limit int)
returns setof public.crm_jobs
language plpgsql
as $$
begin
  return query
  update public.crm_jobs j
     set status = 'running', attempts = j.attempts + 1
   where j.id in (
     select x.id from public.crm_jobs x
      where x.run_at <= now()
        and x.attempts < 3
        and (x.status = 'pending' or (x.status = 'running' and x.run_at < now() - interval '15 minutes'))
      order by x.run_at
      limit greatest(1, least(p_limit, 500))
      for update skip locked
   )
  returning j.*;
end;
$$;

-- Same pattern for cadence steps.
create or replace function public.crm_claim_cadence_steps(p_limit int)
returns setof public.crm_cadence_enrollments
language plpgsql
as $$
begin
  return query
  update public.crm_cadence_enrollments e
     set next_at = now() + interval '15 minutes'   -- lease: retried if the worker dies
   where e.id in (
     select x.id from public.crm_cadence_enrollments x
      where x.status = 'active' and x.next_at <= now()
      order by x.next_at
      limit greatest(1, least(p_limit, 500))
      for update skip locked
   )
  returning e.*;
end;
$$;

-- Bulk score write (daily rescore): only rows whose score actually changes.
-- p_rows: [{id, score}]
create or replace function public.crm_set_scores(p_rows jsonb)
returns int
language plpgsql
as $$
declare n int;
begin
  if jsonb_typeof(p_rows) <> 'array' then raise exception 'p_rows must be an array'; end if;
  with src as (
    select (r->>'id')::uuid as id, (r->>'score')::int as score
    from jsonb_array_elements(p_rows) r
    where r->>'id' is not null
  ), up as (
    update public.crm_records t set score = src.score
    from src where t.id = src.id and t.score is distinct from src.score
    returning 1
  )
  select count(*) into n from up;
  return n;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['crm_jobs','crm_cadence_enrollments','crm_approvals','crm_webhook_log'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;

revoke all on function public.crm_set_scores(jsonb) from public, anon, authenticated;
grant execute on function public.crm_set_scores(jsonb) to service_role;
revoke all on function public.crm_claim_jobs(int) from public, anon, authenticated;
revoke all on function public.crm_claim_cadence_steps(int) from public, anon, authenticated;
grant execute on function public.crm_claim_jobs(int) to service_role;
grant execute on function public.crm_claim_cadence_steps(int) to service_role;

-- 0061_agentic_runs.sql
-- Audit trail for the agentic-AI orchestrator. Each row is one full run: the
-- mission, which specialists the planner deployed, the synthesised answer, and
-- the complete step trace. Optional — the /admin/agentic/run endpoint inserts
-- best-effort and never fails if this table is absent.

create table if not exists public.agentic_runs (
    id             uuid primary key default gen_random_uuid(),
    user_id        uuid references auth.users(id) on delete set null,
    mission        text not null,
    mode           text not null default 'sim',       -- sim | live
    summary        text,
    agents_used    text[] not null default '{}',
    trace          jsonb  not null default '[]'::jsonb,
    stopped_reason text   not null default 'synthesized',
    model          text,
    created_at     timestamptz not null default now()
);

create index if not exists agentic_runs_created_idx on public.agentic_runs (created_at desc);

alter table public.agentic_runs enable row level security;
drop policy if exists "agentic_runs_admin_read" on public.agentic_runs;
create policy "agentic_runs_admin_read" on public.agentic_runs for select
    using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));

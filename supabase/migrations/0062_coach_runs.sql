-- 0062_coach_runs.sql
-- Audit trail for the per-user Prep Copilot (services/coach). Each row is one
-- full run for one user: their goal + target, which specialists the planner
-- deployed, the synthesised plan, and the complete step trace. Optional — the
-- /coach/run endpoint inserts best-effort and never fails if this table is
-- absent, so the feature works with or without this migration applied.

create table if not exists public.coach_runs (
    id             uuid primary key default gen_random_uuid(),
    user_id        uuid references auth.users(id) on delete cascade,
    goal           text,
    target_company text,
    domain         text,
    mode           text not null default 'guided',   -- live | guided | demo
    summary        text,
    agents_used    text[] not null default '{}',
    trace          jsonb  not null default '[]'::jsonb,
    model          text,
    created_at     timestamptz not null default now()
);

create index if not exists coach_runs_user_created_idx on public.coach_runs (user_id, created_at desc);

alter table public.coach_runs enable row level security;

-- A user may read their OWN coach runs (history). Writes come from the backend
-- service-role client, which bypasses RLS — so no insert policy is needed.
drop policy if exists "coach_runs_owner_read" on public.coach_runs;
create policy "coach_runs_owner_read" on public.coach_runs for select
    using (auth.uid() = user_id);

-- Admins may read all runs (for the demo/inspection surface).
drop policy if exists "coach_runs_admin_read" on public.coach_runs;
create policy "coach_runs_admin_read" on public.coach_runs for select
    using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));

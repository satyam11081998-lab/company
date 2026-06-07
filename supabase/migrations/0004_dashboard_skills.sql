-- =====================================================================
-- Migration 0004: Dashboard Skills (Focus+ Data Model)
-- Adds skill_node mapping, mcq support, and growth dimension snapshots.
-- =====================================================================

-- 1. Extend cases table
alter table public.cases add column if not exists skill_node text;
alter table public.cases add column if not exists skill_cluster text;
alter table public.cases add column if not exists interview_meta jsonb;
alter table public.cases add column if not exists mcq jsonb;
alter table public.cases add column if not exists source_brief_id uuid references public.news_headlines(id) on delete set null;

-- Backfill skill_cluster from case_type
update public.cases
set skill_cluster = case
  when type = 'profitability' then 'prof'
  when type = 'market_sizing' then 'size'
  when type = 'growth' then 'ent'
  when type = 'guesstimate' then 'soft'
  else 'soft'
end
where skill_cluster is null;

-- 2. Create skill constellation tables
create table if not exists public.skill_nodes (
  id text primary key,
  cluster text not null,
  label text not null,
  x_pos int not null,
  y_pos int not null,
  is_boss boolean not null default false
);

create table if not exists public.skill_edges (
  source_id text not null references public.skill_nodes(id) on delete cascade,
  target_id text not null references public.skill_nodes(id) on delete cascade,
  primary key (source_id, target_id)
);

-- 3. Create dimension snapshots for momentum calculations
create table if not exists public.dimension_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.dimension_snapshots add column if not exists snapshot_date date;
alter table public.dimension_snapshots add column if not exists dimensions jsonb;
alter table public.dimension_snapshots drop constraint if exists dimension_snapshots_user_id_snapshot_date_key;
alter table public.dimension_snapshots add constraint dimension_snapshots_user_id_snapshot_date_key unique (user_id, snapshot_date);

create index if not exists dimension_snapshots_user on public.dimension_snapshots(user_id, snapshot_date desc);

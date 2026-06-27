-- =====================================================================
-- Migration 0023: Resume Lab — per-user resumes (one-page B-school format).
--
-- A resume is stored as JSONB so the section schema can evolve (and future
-- college-specific templates can extend it) without a migration each time.
-- Owner-scoped RLS: each user reads/writes only their own resumes. Cascades on
-- user delete. Additive + idempotent. NOT a CONTRACTS surface.
-- =====================================================================
create table if not exists public.resumes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  title       text not null default 'My Resume',
  template    text not null default 'mece-bschool-v1',
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists resumes_user_idx on public.resumes(user_id, updated_at desc);

alter table public.resumes enable row level security;

drop policy if exists resumes_own_select on public.resumes;
create policy resumes_own_select on public.resumes for select using (auth.uid() = user_id);

drop policy if exists resumes_own_insert on public.resumes;
create policy resumes_own_insert on public.resumes for insert with check (auth.uid() = user_id);

drop policy if exists resumes_own_update on public.resumes;
create policy resumes_own_update on public.resumes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists resumes_own_delete on public.resumes;
create policy resumes_own_delete on public.resumes for delete using (auth.uid() = user_id);

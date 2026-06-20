-- 0014_cheatsheet_points.sql
-- Per-user, user-defined GD data point cheat sheet tags.
-- ADDITIVE: does NOT alter `cases`.
-- Idempotent: safe to run multiple times (CREATE ... IF NOT EXISTS + DROP/CREATE POLICY).

create table if not exists public.cheatsheet_points (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  point_text  text not null,
  source      text not null,
  headline_id uuid references public.news_headlines(id) on delete set null,
  tag         text not null,
  tag_norm    text generated always as (lower(btrim(tag))) stored,
  created_at  timestamptz not null default now(),
  constraint cheatsheet_points_tag_len_chk check (char_length(tag) between 1 and 30),
  constraint cheatsheet_points_point_len_chk check (char_length(point_text) between 1 and 2000)
);

-- one tag per (user, tag_norm, md5(point_text)). FULL unique index.
create unique index if not exists cheatsheet_points_user_tagnorm_point_uniq
  on public.cheatsheet_points (user_id, tag_norm, md5(point_text));

-- fast "list my tags" + "points for this tag"
create index if not exists cheatsheet_points_user_tagnorm_idx
  on public.cheatsheet_points (user_id, tag_norm);

-- RLS: a user reads/writes ONLY their own points
alter table public.cheatsheet_points enable row level security;

drop policy if exists cheatsheet_points_select_own on public.cheatsheet_points;
create policy cheatsheet_points_select_own on public.cheatsheet_points
  for select using (auth.uid() = user_id);

drop policy if exists cheatsheet_points_write_own on public.cheatsheet_points;
create policy cheatsheet_points_write_own on public.cheatsheet_points
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 0013_case_tags.sql
-- Per-user, user-defined case tags = "dynamic domains" (reverse mechanism).
-- ADDITIVE: does NOT alter the shared `cases` table → no C1 break.
-- Idempotent: safe to run multiple times (CREATE ... IF NOT EXISTS + DROP/CREATE POLICY).

create table if not exists public.case_tags (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  case_id     uuid not null references public.cases(id) on delete cascade,
  tag         text not null,
  -- normalized form for case-insensitive dedup/grouping (a user's distinct
  -- tag_norms == that user's personal "domains")
  tag_norm    text generated always as (lower(btrim(tag))) stored,
  created_at  timestamptz not null default now(),
  -- anti-abuse: keyword length cap (mirrors lib/limits.ts TAG_MAX_CHARS)
  constraint case_tags_tag_len_chk check (char_length(tag) between 1 and 30)
);

-- one tag per (user, case, normalized keyword). FULL unique index (NOT partial) so an
-- upsert `on conflict (user_id, case_id, tag_norm)` works — partial index throws 42P10 (§9.36).
create unique index if not exists case_tags_user_case_tagnorm_uniq
  on public.case_tags (user_id, case_id, tag_norm);

-- fast "list my domains" + "cases in this domain"
create index if not exists case_tags_user_tagnorm_idx
  on public.case_tags (user_id, tag_norm);

-- RLS: a user reads/writes ONLY their own tags (correct guard for a client-written table)
alter table public.case_tags enable row level security;

drop policy if exists case_tags_select_own on public.case_tags;
create policy case_tags_select_own on public.case_tags
  for select using (auth.uid() = user_id);

drop policy if exists case_tags_write_own on public.case_tags;
create policy case_tags_write_own on public.case_tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

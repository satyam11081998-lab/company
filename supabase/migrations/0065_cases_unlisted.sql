-- 0065_cases_unlisted.sql
-- "Unlisted" visibility for cases — the backing change for BROADCAST targeted practice.
--
-- An unlisted case is attemptable BY DIRECT LINK (so a whole college can practise it
-- from a broadcast email, through the normal /cases/[id] scored pipeline) but NEVER
-- appears in the daily rotation, practice lists, search, or the leaderboard — all of
-- which already filter is_active = true, and an unlisted case is is_active = false.
--
-- Existing rows are unaffected: default false == today's exact behaviour.
-- MUST be applied BEFORE deploying the backend that writes unlisted = true.
-- Idempotent.

alter table public.cases
  add column if not exists unlisted boolean not null default false;

-- Small partial index — only the handful of unlisted rows are indexed.
create index if not exists cases_unlisted_idx on public.cases (unlisted) where unlisted;

-- Reading a case is already public via RLS. This ADDITIVE policy simply guarantees
-- an unlisted case is readable by link even if the base select policy keys on
-- is_active. Postgres permissive policies are OR-combined, so this can only widen
-- read access for unlisted rows — it never restricts any existing read.
drop policy if exists "read unlisted cases by link" on public.cases;
create policy "read unlisted cases by link"
  on public.cases
  for select
  to anon, authenticated
  using (unlisted = true);

notify pgrst, 'reload schema';

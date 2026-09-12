-- =====================================================================
-- Migration 0064: owner-scoped, copilot-GENERATED cases.
--
-- The Prep Copilot's "curated case / interview" tool generates a case (or
-- guesstimate) aimed at ONE candidate's weakest skill + target firm/role and
-- saves it PRIVATE to them. It is a normal `cases` row so it flows through the
-- existing /cases/[id] -> ConversationalSolve -> interview -> scorer pipeline
-- unchanged, but:
--   * is_active = false  -> excluded from practice lists, the daily, recommend,
--                           and the leaderboard (all of which filter is_active),
--   * owner_id set        -> so we can scope/read it as the owner.
--
-- Additive + idempotent. We do NOT enable RLS on `cases` here (if it is off,
-- cases are already readable; enabling it could break existing public/active
-- reads). If RLS is already ON, we ADD an owner-read policy (RLS OR-combines),
-- so a Pro user can always read the private case they just generated.
-- =====================================================================

alter table public.cases add column if not exists owner_id uuid references public.users(id) on delete cascade;
alter table public.cases add column if not exists generated boolean not null default false;
alter table public.cases add column if not exists generated_for jsonb not null default '{}'::jsonb;

create index if not exists cases_owner_idx on public.cases(owner_id) where owner_id is not null;

do $$
begin
  if (select relrowsecurity from pg_class where oid = 'public.cases'::regclass) then
    drop policy if exists cases_owner_generated_read on public.cases;
    create policy cases_owner_generated_read on public.cases
      for select using (owner_id = auth.uid());
  end if;
end $$;

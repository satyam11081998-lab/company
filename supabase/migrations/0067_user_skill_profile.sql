-- 0067_user_skill_profile.sql
-- Longitudinal learner skill profile (Phase 4, point 28): one row per user, the
-- lifetime accumulation of per-skill independence, recurring errors, and which help
-- modalities land for them. Written service-role at submit (best-effort, wrapped);
-- readable by the owner for a future "your skills" view. Additive + idempotent.

create table if not exists public.user_skill_profile (
  user_id    uuid primary key references public.users(id) on delete cascade,
  profile    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_skill_profile enable row level security;
drop policy if exists "own skill profile read" on public.user_skill_profile;
create policy "own skill profile read" on public.user_skill_profile
  for select to authenticated using (user_id = auth.uid());

notify pgrst, 'reload schema';

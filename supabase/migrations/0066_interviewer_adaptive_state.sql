-- 0066_interviewer_adaptive_state.sql
-- Adaptive interviewer/coach (Phase 2): persisted per-attempt learner state +
-- per-case teaching policy. Additive + idempotent. Deploy-safe in either order:
-- the backend reads both via select("*") (absent column -> None, handled) and
-- writes session_state inside a try/except, so it degrades to no-op pre-migration.

alter table public.attempts
  add column if not exists session_state jsonb not null default '{}'::jsonb;

-- exam  = real mock-interview realism (minimal help, teaching in the debrief)
-- coached = learning-first (hint ladder + mode-switch when genuinely stuck/asked)
alter table public.cases
  add column if not exists teaching_policy text not null default 'coached';

alter table public.cases drop constraint if exists cases_teaching_policy_check;
alter table public.cases
  add constraint cases_teaching_policy_check check (teaching_policy in ('exam', 'coached'));

notify pgrst, 'reload schema';

-- 0076_attempt_mode.sql
-- Interview mode vs Whiteboard mode, chosen per attempt by the candidate.
-- Additive + idempotent. Deploy-safe in either order: routes/attempts.py reads the new
-- column via select("*") (absent -> falls back to cases.teaching_policy, the behaviour
-- that shipped before this feature) and inserts it inside a try/except.
--
-- WHY THIS EXISTS
-- The engine has carried a teaching policy of 'exam' | 'coached' since V10, threaded all
-- the way through compute_signals -> decide_response -> the control packet -> the prompt
-- -> detect_violations. It was never reachable by a candidate: both turn routes read it
-- from cases.teaching_policy, which 0066 created with a default of 'coached' for every
-- case. So every attempt by every user has run coached for the life of the product --
-- which is why the interviewer reads as over-helpful and never quite like an interview.
--
--   exam     -> "Interview"  : a real interviewer. No praise, no hints, no corrected
--                              figures. Scored, ranked, bankable as an exemplar.
--   coached  -> "Whiteboard" : works the problem with the candidate, draws the structure,
--                              offers the identity or the branch they missed.
--                              Never ranked, never banked (owner, 2026-10-29).
--
-- cases.teaching_policy survives as the per-case DEFAULT: an attempt started with no mode
-- inherits it, so an 'exam'-authored case still opens as an Interview.

-- ---------------------------------------------------------------- attempts
alter table public.attempts
  add column if not exists teaching_policy text not null default 'coached';

alter table public.attempts drop constraint if exists attempts_teaching_policy_check;
alter table public.attempts
  add constraint attempts_teaching_policy_check check (teaching_policy in ('exam', 'coached'));

comment on column public.attempts.teaching_policy is
  'exam = Interview mode (scored, ranked). coached = Whiteboard mode (practice, never '
  'ranked). Chosen when the attempt starts; immutable after - see trg_attempts_lock_policy.';

-- Every attempt that existed before this migration ran coached, so the default is also
-- the correct backfill. Nothing to update.

-- Chosen once, at the start, and immutable afterwards: a candidate must not be able to
-- take the help and then claim the rank. Enforced here rather than trusting every future
-- write path to remember -- session_state is updated on this table on every single turn,
-- so there are already many writers.
create or replace function public.lock_attempt_teaching_policy()
returns trigger
language plpgsql
as $$
begin
  -- The WHEN clause below means this only fires on a real change. The guard is kept
  -- anyway so the function stays correct on its own, if the trigger is ever recreated
  -- without it.
  if new.teaching_policy is distinct from old.teaching_policy then
    raise exception
      'attempts.teaching_policy is immutable (attempt %, % -> %). Start a new attempt to change mode.',
      old.id, old.teaching_policy, new.teaching_policy
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

-- The WHEN clause matters for cost, not just clarity: without it this function would be
-- invoked on every session_state fold of every voice turn. With it, Postgres skips the
-- call entirely unless the policy column is actually being changed.
drop trigger if exists trg_attempts_lock_policy on public.attempts;
create trigger trg_attempts_lock_policy
  before update on public.attempts
  for each row
  when (old.teaching_policy is distinct from new.teaching_policy)
  execute function public.lock_attempt_teaching_policy();

-- Deliberately NO index on teaching_policy. attempts_user_case_idx (0002) already covers
-- (user_id, case_id, created_at desc), nothing filters attempts by policy yet, and an
-- index nobody queries is pure write cost on a table written on every single turn. Add
-- one when a slow query asks for it, measured.

-- ---------------------------------------------------------------- submissions
-- The integrity rule has to be queryable, not scattered through Python. Anything that
-- ranks, averages, percentiles or leaderboards a score MUST filter on `ranked`.
--
-- DEFAULT TRUE IS DELIBERATE AND LOAD-BEARING. Every historical submission was ranked --
-- it earned points, it sat on the leaderboard, it fed the exemplar bank. Defaulting to
-- false (or to 'coached', which is what the engine actually ran) would silently erase the
-- entire leaderboard the moment a consumer started filtering. The column records whether
-- the run COUNTS, which for all history is yes.
alter table public.submissions
  add column if not exists ranked boolean not null default true;

comment on column public.submissions.ranked is
  'false = produced by a Whiteboard (coached) attempt: feedback only, no points, no '
  'badges, no exemplar, no percentile. Leaderboards and percentile maths must filter on '
  'this. Default true because every pre-0076 submission was ranked.';

-- Same reasoning: submissions_user_created (0001) already indexes (user_id, created_at
-- desc) and Postgres filters a boolean off it for free at this table's size.

notify pgrst, 'reload schema';

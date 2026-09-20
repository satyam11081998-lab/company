-- =============================================================================
-- 0068_conversation_continuity.sql
-- 2026-09-20
--
-- Fixes the two ways a conversation currently goes missing:
--
--   (1) NO LINK FROM A SCORED SUBMISSION BACK TO ITS CONVERSATION.
--       `submissions` (0001) predates `attempts` (0002). The forward link
--       `attempts.submission_id` exists, but nothing points the other way, so
--       every consumer that starts from a submission — the admin journey
--       timeline, /results, any per-user history — has to GUESS the attempt by
--       (case_id, user_id, "most recent"). That guess returns the WRONG
--       conversation whenever a user attempted a case twice, and returns
--       nothing at all when the journey row has no user_id (anonymous
--       sessions). That is the "conversation not found" in admin analytics.
--       -> adds submissions.attempt_id, backfilled from attempts.submission_id.
--
--   (2) A GUEST WHO LOGS IN TO AN EXISTING ACCOUNT LOSES EVERYTHING.
--       Guest conversion via updateUser()/linkIdentity() upgrades the SAME
--       auth.users row, so that path is safe. But a visitor who practises
--       anonymously and then signs in to an account they ALREADY had gets a
--       different uuid — their attempts, messages, submissions and score stay
--       parented to the throwaway guest row, invisible to them forever and
--       collected by the 30-day guest cleanup.
--       -> adds claim_guest_data(), which re-parents that work onto the real
--          account, renumbering case_attempts so first-attempt semantics stay
--          correct (the reason the merge was previously refused).
--
-- Idempotent: safe to run twice. Run AFTER 0067.
-- =============================================================================


-- ═══════════════════════════════════════════════════════════════════════
-- 1 · submissions.attempt_id — the missing back-link
-- ═══════════════════════════════════════════════════════════════════════

alter table public.submissions
  add column if not exists attempt_id uuid references public.attempts(id) on delete set null;

-- Partial index: the only query that matters is "give me the attempt for this
-- submission", and rows predating `attempts` have no attempt at all.
create index if not exists submissions_attempt_idx
  on public.submissions (attempt_id) where attempt_id is not null;

-- Backfill from the forward link that already exists. This recovers the
-- conversation for every historical submission that came through the
-- conversational solve flow — nothing is lost, it was only unreachable.
update public.submissions s
   set attempt_id = a.id
  from public.attempts a
 where a.submission_id = s.id
   and s.attempt_id is null;


-- ═══════════════════════════════════════════════════════════════════════
-- 2 · Provenance columns — so a claimed conversation stays explainable
-- ═══════════════════════════════════════════════════════════════════════
-- After a claim, `attempts.user_id` is the real account. Without these two
-- columns the admin can no longer tell that the work was done anonymously,
-- which is exactly the context that makes the funnel readable.

alter table public.attempts
  add column if not exists claimed_from_user_id uuid,
  add column if not exists claimed_at           timestamptz;

alter table public.submissions
  add column if not exists claimed_from_user_id uuid;

create index if not exists attempts_claimed_from_idx
  on public.attempts (claimed_from_user_id) where claimed_from_user_id is not null;


-- ═══════════════════════════════════════════════════════════════════════
-- 3 · guest_claims — audit trail
-- ═══════════════════════════════════════════════════════════════════════
-- A claim moves rows between accounts. That is exactly the kind of operation
-- that must never be silent: if a user ever says "my attempt went to the wrong
-- account", this table is the only way to answer them.

create table if not exists public.guest_claims (
  id              uuid primary key default gen_random_uuid(),
  guest_user_id   uuid not null,
  target_user_id  uuid not null,
  attempts_moved      int not null default 0,
  submissions_moved   int not null default 0,
  case_attempts_moved int not null default 0,
  events_moved        int not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists guest_claims_target_idx on public.guest_claims (target_user_id, created_at desc);
create index if not exists guest_claims_guest_idx  on public.guest_claims (guest_user_id);

alter table public.guest_claims enable row level security;

-- Users may see claims onto their OWN account (so a "we brought your guest
-- practice across" notice can be rendered truthfully). Nobody may write.
drop policy if exists "guest_claims: owner read" on public.guest_claims;
create policy "guest_claims: owner read"
  on public.guest_claims for select
  to authenticated
  using (target_user_id = auth.uid());


-- ═══════════════════════════════════════════════════════════════════════
-- 4 · claim_guest_data(guest, target)
-- ═══════════════════════════════════════════════════════════════════════
-- Re-parents an anonymous user's practice onto a permanent account.
--
-- WHY THE PREVIOUS REFUSAL NO LONGER APPLIES. The merge was declined because
-- `case_attempts` carries first-attempt semantics (attempt_number /
-- is_first_attempt / counted_for_daily) that a naive re-parent corrupts — you
-- would get two "first" attempts for one case. Section 4c fixes that properly
-- by RENUMBERING the merged set chronologically, which is the only ordering
-- that is true for both histories. Silent loss of a user's work is a strictly
-- worse outcome than a renumbering pass.
--
-- SECURITY. security definer + revoked from anon/authenticated: the ONLY caller
-- is /api/guest/claim with the service role, and that route proves the caller
-- holds BOTH sessions (the guest access token AND the target session) before it
-- calls this. Without that proof this function would let any logged-in user
-- vacuum up any guest's work by uuid.

create or replace function public.claim_guest_data(p_guest_id uuid, p_target_id uuid)
returns table(
  attempts_moved      int,
  submissions_moved   int,
  case_attempts_moved int,
  events_moved        int
)
language plpgsql security definer set search_path = public as $$
declare
  v_attempts int := 0;
  v_subs     int := 0;
  v_cas      int := 0;
  v_events   int := 0;
  v_is_anon  boolean;
  v_target_anon boolean;
  v_guest_profile jsonb;
  v_target_profile jsonb;
  v_cases uuid[];
  v_claimed_ca uuid[];
  v_points int := 0;
  v_prev_claims text;
begin
  if p_guest_id is null or p_target_id is null or p_guest_id = p_target_id then
    raise exception 'claim_guest_data: guest and target must be two different users';
  end if;

  -- The source MUST be an anonymous auth row. Keying off auth.users.is_anonymous
  -- rather than public.users.is_guest is deliberate and matches 0045 §6: it is
  -- the value GoTrue owns, so it cannot be spoofed by a client that found a way
  -- to write public.users.
  select a.is_anonymous into v_is_anon from auth.users a where a.id = p_guest_id;
  if v_is_anon is distinct from true then
    raise exception 'claim_guest_data: source % is not an anonymous guest', p_guest_id;
  end if;

  select coalesce(a.is_anonymous, false) into v_target_anon from auth.users a where a.id = p_target_id;
  if v_target_anon then
    raise exception 'claim_guest_data: target % is itself a guest', p_target_id;
  end if;

  -- ── 4a · attempts (attempt_messages / attempt_files follow by FK) ────
  update public.attempts
     set user_id              = p_target_id,
         claimed_from_user_id = p_guest_id,
         claimed_at           = now()
   where user_id = p_guest_id;
  get diagnostics v_attempts = row_count;

  -- ── 4b · submissions ─────────────────────────────────────────────────
  update public.submissions
     set user_id              = p_target_id,
         claimed_from_user_id = p_guest_id
   where user_id = p_guest_id;
  get diagnostics v_subs = row_count;

  -- ── 4c · case_attempts, APPENDED (never renumbered over) ────────────
  -- Capture the claimed rows AND their cases BEFORE re-parenting: afterwards
  -- the guest owns nothing, so there is no way to tell a claimed row from one
  -- the target already had.
  select coalesce(array_agg(id), '{}'::uuid[]),
         coalesce(array_agg(distinct case_id), '{}'::uuid[])
    into v_claimed_ca, v_cases
    from public.case_attempts
   where user_id = p_guest_id;

  update public.case_attempts
     set user_id = p_target_id
   where user_id = p_guest_id;
  get diagnostics v_cas = row_count;

  -- WHY APPEND AND NOT CHRONOLOGICAL RANK.
  -- An earlier version re-ranked ALL of the target's rows for the affected
  -- cases by created_at. That is tidier on paper and wrong in three ways,
  -- because `attempt_number` / `is_first_attempt` are not display fields —
  -- they are read by things that already happened:
  --   * points and badges are awarded AT INSERT conditioned on
  --     is_first_attempt (routes/attempts.py). Demoting a row whose points are
  --     already banked leaves the total and the flag permanently disagreeing.
  --   * the free-tier bank (lib/access.ts) counts rows with
  --     is_first_attempt = true AND NOT counted_for_daily. Demoting such a row
  --     silently REFUNDS a consumed lifetime extra — a quota bypass.
  --   * a guest attempt that happens to predate the target's own would seize
  --     "first attempt" on a case the target solved first.
  -- So claimed rows are appended after whatever the target already had, and
  -- the target's own rows are never rewritten. A claimed row is only ever a
  -- first attempt when the target had no attempt on that case at all.
  if array_length(v_claimed_ca, 1) is not null then
    with base as (
      select case_id, max(attempt_number) as maxn
        from public.case_attempts
       where user_id = p_target_id
         and case_id = any(v_cases)
         and not (id = any(v_claimed_ca))
       group by case_id
    ),
    ranked as (
      select ca.id, ca.case_id,
             row_number() over (partition by ca.case_id order by ca.created_at, ca.id) as rn
        from public.case_attempts ca
       where ca.user_id = p_target_id
         and ca.id = any(v_claimed_ca)
    )
    update public.case_attempts ca
       set attempt_number   = coalesce(b.maxn, 0) + r.rn,
           is_first_attempt = (coalesce(b.maxn, 0) = 0 and r.rn = 1)
      from ranked r
      left join base b on b.case_id = r.case_id
     where ca.id = r.id;

    -- One counted daily per date. Without this a visitor who solved today's
    -- daily anonymously, then logged into an account that ALSO solved it,
    -- ends up with two rows carrying counted_for_daily = true for the same
    -- daily_date — and routes/daily.py builds the daily leaderboard one entry
    -- per such row, so they appear TWICE with two different scores.
    -- Only ever demotes a CLAIMED row; the target's own row always wins.
    with dupes as (
      select ca.id,
             row_number() over (
               partition by ca.daily_date
               order by (ca.id = any(v_claimed_ca)), ca.created_at, ca.id
             ) as rn
        from public.case_attempts ca
       where ca.user_id = p_target_id
         and ca.counted_for_daily
         and ca.daily_date is not null
    )
    update public.case_attempts ca
       set counted_for_daily = false
      from dupes d
     where ca.id = d.id
       and d.rn > 1
       and ca.id = any(v_claimed_ca);
  end if;

  -- ── 4c2 · badges earned as a guest ──────────────────────────────────
  -- user_badges carries `unique (user_id, badge_id)` (0001 L110), so a blind
  -- re-parent ABORTS THE WHOLE CLAIM the moment the guest earned a badge the
  -- target already holds. Drop the duplicates first, move the rest. Without
  -- this block the badges are not merely unmoved — they are destroyed by
  -- cleanup_stale_guests at day 30, because user_badges cascades from users.
  if to_regclass('public.user_badges') is not null then
    delete from public.user_badges g
     where g.user_id = p_guest_id
       and exists (
         select 1 from public.user_badges t
          where t.user_id = p_target_id and t.badge_id = g.badge_id
       );
    update public.user_badges set user_id = p_target_id where user_id = p_guest_id;
  end if;

  -- ── 4d · analytics rows ──────────────────────────────────────────────
  -- Without this the admin timeline still shows two disconnected people: an
  -- anonymous visitor who did all the work, and a user who appeared from
  -- nowhere already holding a score.
  -- Guarded like §4e: a deploy without 0055/0056 would otherwise create this
  -- function fine (plpgsql bodies are not resolved at CREATE time) and then
  -- fail at runtime on the first real claim.
  if to_regclass('public.page_events') is not null then
    update public.page_events set user_id = p_target_id where user_id = p_guest_id;
    get diagnostics v_events = row_count;
  end if;
  if to_regclass('public.user_actions') is not null then
    update public.user_actions set user_id = p_target_id where user_id = p_guest_id;
  end if;

  -- ── 4e · device sessions ─────────────────────────────────────────────
  if to_regclass('public.user_sessions') is not null then
    update public.user_sessions set user_id = p_target_id where user_id = p_guest_id;
  end if;

  -- ── 4f · adaptive learner profile ────────────────────────────────────
  -- Concatenate rather than overwrite: the guest session's evidence is real
  -- practice and the target may already have a profile. `||` on jsonb is a
  -- shallow merge with the target winning on key collisions, which is the
  -- conservative direction (never downgrade an established account).
  if to_regclass('public.user_skill_profile') is not null then
    select profile into v_guest_profile  from public.user_skill_profile where user_id = p_guest_id;
    select profile into v_target_profile from public.user_skill_profile where user_id = p_target_id;
    if v_guest_profile is not null then
      insert into public.user_skill_profile (user_id, profile, updated_at)
      values (p_target_id, coalesce(v_guest_profile, '{}'::jsonb) || coalesce(v_target_profile, '{}'::jsonb), now())
      on conflict (user_id) do update
        set profile = coalesce(excluded.profile, '{}'::jsonb),
            updated_at = now();
      delete from public.user_skill_profile where user_id = p_guest_id;
    end if;
  end if;

  -- ── 4g · points earned as a guest ───────────────────────────────────
  -- routes/attempts.py awards points on first attempt with NO guest check, so
  -- a guest's score is banked on the guest's own users row. Without this the
  -- claimed submission shows 82/100 in the user's history while their points,
  -- rank and daily-leaderboard standing never move — and the points are
  -- deleted outright by cleanup_stale_guests at day 30.
  --
  -- guard_user_privileged_cols (0006 L57) reverts `points` for every role but
  -- service_role, and auth.role() reads request.jwt.claims, which a
  -- service-definer call does not carry. Same override 0045 §2b needs, scoped
  -- to this transaction (is_local = true) and restored immediately.
  select coalesce(points, 0) into v_points from public.users where id = p_guest_id;
  if v_points > 0 then
    v_prev_claims := current_setting('request.jwt.claims', true);
    perform set_config('request.jwt.claims', '{"role":"service_role"}', true);

    update public.users
       set points = coalesce(points, 0) + v_points
     where id = p_target_id;
    -- Zeroed so a replayed claim cannot credit the same points twice.
    update public.users set points = 0 where id = p_guest_id;

    perform set_config('request.jwt.claims', coalesce(v_prev_claims, ''), true);
  end if;

  -- ── 4h · audit ───────────────────────────────────────────────────────
  insert into public.guest_claims
    (guest_user_id, target_user_id, attempts_moved, submissions_moved, case_attempts_moved, events_moved)
  values
    (p_guest_id, p_target_id, v_attempts, v_subs, v_cas, v_events);

  -- The guest's own rows are intentionally LEFT IN PLACE (now owning nothing).
  -- cleanup_stale_guests (0045 §6) collects them on its normal 30-day schedule.
  -- Deleting here would race with an in-flight request still holding that JWT.

  return query select v_attempts, v_subs, v_cas, v_events;
end;
$$;

-- Revoke the default PUBLIC grant, then hand EXECUTE back to the ONE role that
-- calls this: service_role, from /api/guest/claim.
--
-- The grant is not optional. Postgres grants EXECUTE on a new function to
-- PUBLIC by default, and `service_role` holds it only THROUGH that PUBLIC
-- grant — it does not own this function and is not a superuser. Revoking from
-- PUBLIC without re-granting therefore locks out the only legitimate caller,
-- and every claim fails with "permission denied for function claim_guest_data".
-- 0046_certificates.sql §generate_certificate_id is the pattern being followed.
--
-- NOTE FOR A FOLLOW-UP: 0045 §6 has this bug. `cleanup_stale_guests` is
-- revoked from public with no service_role grant, and app/api/cron calls it
-- with the service role — so the 30-day guest cleanup has most likely never
-- run. Not fixed here because it is outside this change's blast radius; worth
-- a one-line migration of its own.
revoke all on function public.claim_guest_data(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_guest_data(uuid, uuid) to service_role;


-- ═══════════════════════════════════════════════════════════════════════
-- 5 · RLS — let a user read their OWN submissions and history
-- ═══════════════════════════════════════════════════════════════════════
-- `attempts` / `attempt_messages` owner-read policies already exist (0002),
-- and so, it turns out, does an owner-read policy on `submissions`.
--
-- CORRECTION (2026-09-20, found in adversarial review). An earlier draft of
-- this section claimed `submissions` "has carried no row-level policy" and
-- that enabling RLS here closed a cross-user read. That was WRONG:
-- 0006_rls.sql L74-77 already ran
--     alter table public.submissions enable row level security;
--     create policy submissions_select_own on public.submissions
--       for select using (auth.uid() = user_id);
-- two months earlier. This section is therefore a NO-OP kept only for
-- idempotence and for the explicit `to authenticated` scoping.
--
-- That draft also documented `alter table public.submissions disable row level
-- security;` as a "one-line rollback". Do NOT do that. It would disable
-- 0006's protection as well and open genuine cross-user reads of answer_text
-- and feedback_json — it would CREATE the breach the old comment imagined it
-- was closing. If this specific policy ever needs reverting, drop the policy
-- and leave RLS on:
--     drop policy if exists "submissions: owner read" on public.submissions;
--
-- Verified separately: every frontend read of `submissions` is already scoped
-- with .eq('user_id', <caller>) or uses the service role, so neither policy
-- breaks anything.

alter table public.submissions enable row level security;

drop policy if exists "submissions: owner read" on public.submissions;
create policy "submissions: owner read"
  on public.submissions for select
  to authenticated
  using (user_id = auth.uid());


-- ═══════════════════════════════════════════════════════════════════════
-- 6 · attempt_history — one row per conversation, for the user's own history
-- ═══════════════════════════════════════════════════════════════════════
-- Until now a user could only ever see the SCORECARD for a past attempt; the
-- conversation that produced it was reachable by nobody but the admin (and
-- even then only by guessing). This view is what "my previous chats" reads.
--
-- security_invoker = true is the whole security model here: the view runs with
-- the CALLER's permissions, so the existing "attempts: owner read" policy
-- (0002) applies unchanged and a user can only ever see their own rows. A
-- normal (definer) view would bypass RLS and expose everyone's transcripts —
-- the exact opposite of the intent.
--
-- The two correlated subqueries are indexed by attempt_messages_attempt_idx
-- (0002), so this stays cheap at the page sizes the history list uses.

create or replace view public.attempt_history
with (security_invoker = true) as
select
  a.id                    as attempt_id,
  a.user_id,
  a.case_id,
  a.status,
  a.created_at,
  a.submitted_at,
  a.submission_id,
  a.final_recommendation,
  a.claimed_from_user_id,
  coalesce(c.title, 'Retired case') as case_title,
  c.type                  as case_type,
  c.difficulty,
  s.score,
  (select count(*)          from public.attempt_messages m where m.attempt_id = a.id) as message_count,
  (select max(m.created_at) from public.attempt_messages m where m.attempt_id = a.id) as last_message_at
from public.attempts a
-- LEFT, not INNER. With security_invoker the caller's RLS applies to `cases`
-- too, and the base select policy keys on is_active (see 0065 L20-22). An
-- INNER join therefore DELETES a user's own conversation from their history
-- the moment an admin retires the case — they own the attempt, the transcript
-- is still there, and /history would simply stop listing it and 404 on the
-- detail page. A retired case loses its title here, not the conversation.
left join public.cases c       on c.id = a.case_id
left join public.submissions s on s.id = a.submission_id;

grant select on public.attempt_history to authenticated;


-- ═══════════════════════════════════════════════════════════════════════
-- 7 · Tell PostgREST about the new view, column and function
-- ═══════════════════════════════════════════════════════════════════════
-- Without this, PostgREST serves a stale schema cache until it restarts, and
-- the app reports the migration as NOT RUN when it has been: /api/guest/claim
-- returns 501 "run migration 0068" and /history renders the same message.
-- That sends an operator chasing a migration they already applied.

notify pgrst, 'reload schema';

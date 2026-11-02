-- 0078_case_expectations_bump.sql
-- Atomic, one-round-trip counter increments for case_expectations (0077).
-- Idempotent: safe to run more than once.
--
-- WHY THIS EXISTS — two defects in the first cut, both found before anyone hit them.
--
-- 1. LATENCY. services/case_expectations.commit_attempt issued one PostgREST update per
--    touched row, sequentially, INSIDE the scored submit request. Five touched rows is
--    five HTTP round trips to Supabase in Tokyo — roughly half a second added to a
--    submit, for a side-channel nobody is waiting on. This does it in one call.
--
-- 2. LOST UPDATES. Those updates sent `seen_count = <value read earlier> + 1`, computed
--    from a list the process had CACHED for up to five minutes. Two candidates submitting
--    the same case in that window both read the same number and both wrote the same +1,
--    so one of the two attempts vanished from the evidence. A bank whose whole purpose is
--    to accumulate counts must not drop them under exactly the load that makes it useful.
--    `seen_count = seen_count + 1` is evaluated by Postgres against the live row, so
--    concurrent submits cannot overwrite each other.

create or replace function public.bump_case_expectations(
  p_seen   uuid[],                       -- every row this attempt reached
  p_hit    uuid[] default '{}',          -- misconceptions fallen into / expectations met
  p_helped uuid[] default '{}'           -- the interviewer's move unstuck them here
) returns integer
language sql
security definer
set search_path = public
as $$
  with bumped as (
    update public.case_expectations e
       set seen_count   = e.seen_count + 1,
           hit_count    = e.hit_count
                          + (case when e.id = any(coalesce(p_hit, '{}')) then 1 else 0 end),
           helped_count = e.helped_count
                          + (case when e.id = any(coalesce(p_helped, '{}')) then 1 else 0 end),
           last_seen_at = now(),
           updated_at   = now()
     where e.id = any(coalesce(p_seen, '{}'))
     returning 1
  )
  select count(*)::integer from bumped;
$$;

comment on function public.bump_case_expectations(uuid[], uuid[], uuid[]) is
  'One atomic round trip from the submit path. Increments are computed by Postgres against '
  'the live row, so concurrent submits on the same case cannot lose each other''s counts.';

-- The table is service-role only (0077 enables RLS with no policy), and this function is
-- security definer, so revoke it from everyone the service role does not need.
revoke all on function public.bump_case_expectations(uuid[], uuid[], uuid[]) from public;
revoke all on function public.bump_case_expectations(uuid[], uuid[], uuid[]) from anon;
revoke all on function public.bump_case_expectations(uuid[], uuid[], uuid[]) from authenticated;

notify pgrst, 'reload schema';

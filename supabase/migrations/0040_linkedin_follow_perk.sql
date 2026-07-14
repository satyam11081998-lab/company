-- 0040_linkedin_follow_perk.sql — LinkedIn follow → one-time free-bank bonus.
-- Additive + idempotent (safe to run twice).
--
-- 1. users.linkedin_follow_claimed_at — timestamp of the one-time claim.
--    NULL = never claimed. Set ONCE via POST /api/linkedin-follow (service role).
--    Grants free users +1 lifetime bank case and +1 lifetime bank guesstimate
--    (enforced in backend services/access_guard.py, mirrored in lib/access.ts).
-- 2. guard_user_privileged_cols() extended so a logged-in user CANNOT set the
--    flag directly with the browser/anon client — the claim must go through
--    the API route (service role), same pattern as subscription_tier.

alter table public.users
  add column if not exists linkedin_follow_claimed_at timestamptz null;

-- CREATE OR REPLACE overwrites the whole function body. It MUST keep reverting
-- every previously guarded column (0006) or users could self-grant Pro/points.
create or replace function public.guard_user_privileged_cols()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() is distinct from 'service_role' then
    new.subscription_tier          := old.subscription_tier;
    new.subscription_started_at    := old.subscription_started_at;
    new.subscription_expires_at    := old.subscription_expires_at;
    new.points                     := old.points;
    new.is_admin                   := old.is_admin;
    new.linkedin_follow_claimed_at := old.linkedin_follow_claimed_at;
  end if;
  return new;
end $$;

-- trg_guard_user_cols (BEFORE UPDATE, from 0006) already points at this
-- function — do NOT recreate the trigger.

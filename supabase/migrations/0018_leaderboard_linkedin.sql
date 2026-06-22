-- =====================================================================
-- 0018 — opt-out LinkedIn visibility on the leaderboard
--
-- Adds users.show_linkedin: whether the user's LinkedIn link is shown next to
-- their name on the public leaderboard. Default TRUE (opt-out) per product
-- decision — users can switch it OFF in their profile (and we ask in onboarding).
--
-- linkedin_url + college_id/college_other already exist (migration 0005), so
-- only this one flag is new. Additive, idempotent.
-- =====================================================================

alter table public.users
  add column if not exists show_linkedin boolean not null default true;

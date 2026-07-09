-- 0038_free_tier_rework.sql — free-tier "taste of everything" rework.
-- Additive + idempotent (CREATE IF NOT EXISTS / DROP+CREATE POLICY, safe to run twice).
--
-- 1. gd_brief_unlocks — which headline a FREE user spent their ONE lifetime GD brief on.
--    Written ONLY by the backend (service role) when a free user generates/views
--    their first brief. Client can read own row (to render "your free brief").
-- 2. feature_trials — lifetime-use counters for try-before-you-buy features
--    (first consumer: 'cv_pointer_lab', 2 free generations for non-Pro).
--    Written ONLY by the backend (service role).
-- 3. cheatsheet_points INSERT tightened: was owner-only (the Pro gate lived in the
--    CLIENT — any authed user could insert via the API). Now: unexpired lite/pro
--    insert freely; free users only for points from their unlocked brief.

-- 1 ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.gd_brief_unlocks (
  user_id     uuid not null references public.users(id) on delete cascade,
  headline_id uuid not null references public.news_headlines(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, headline_id)
);
create index if not exists gd_brief_unlocks_user_idx on public.gd_brief_unlocks(user_id);

alter table public.gd_brief_unlocks enable row level security;
drop policy if exists gd_brief_unlocks_select_own on public.gd_brief_unlocks;
create policy gd_brief_unlocks_select_own on public.gd_brief_unlocks
  for select using (auth.uid() = user_id);
-- no insert/update/delete policies: service role only.

-- 2 ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.feature_trials (
  user_id    uuid not null references public.users(id) on delete cascade,
  feature    text not null,
  uses       int  not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, feature)
);

alter table public.feature_trials enable row level security;
drop policy if exists feature_trials_select_own on public.feature_trials;
create policy feature_trials_select_own on public.feature_trials
  for select using (auth.uid() = user_id);
-- no insert/update/delete policies: service role only.

-- 3 ─────────────────────────────────────────────────────────────────────────────
-- Replace the blanket FOR ALL owner policy with split policies + a tier-aware INSERT.
drop policy if exists cheatsheet_points_write_own on public.cheatsheet_points;

drop policy if exists cheatsheet_points_select_own on public.cheatsheet_points;
create policy cheatsheet_points_select_own on public.cheatsheet_points
  for select using (auth.uid() = user_id);

drop policy if exists cheatsheet_points_insert_gate on public.cheatsheet_points;
create policy cheatsheet_points_insert_gate on public.cheatsheet_points
  for insert with check (
    auth.uid() = user_id
    and (
      -- unexpired paid tier (lite or pro): unlimited saves
      exists (
        select 1 from public.users u
        where u.id = auth.uid()
          and u.subscription_tier in ('lite', 'pro')
          and (u.subscription_expires_at is null or u.subscription_expires_at > now())
      )
      -- free tier: only points sourced from THEIR unlocked GD brief
      or (
        headline_id is not null
        and exists (
          select 1 from public.gd_brief_unlocks g
          where g.user_id = auth.uid()
            and g.headline_id = cheatsheet_points.headline_id
        )
      )
    )
  );

drop policy if exists cheatsheet_points_update_own on public.cheatsheet_points;
create policy cheatsheet_points_update_own on public.cheatsheet_points
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists cheatsheet_points_delete_own on public.cheatsheet_points;
create policy cheatsheet_points_delete_own on public.cheatsheet_points
  for delete using (auth.uid() = user_id);

-- =====================================================================
-- diagnose-demo.sql — "why does the demo account still look brand new?"
-- 2026-08-06 · READ-ONLY, single result set.
--
-- Paste into the Supabase SQL editor and run. One table comes back with a
-- row per check, worst first. Every row that is not 'OK' tells you exactly
-- which file to run.
--
-- Edit the email on the next line if you used a different one.
-- =====================================================================

with t as (
  select 'demo@mece.in'::text as email                    -- ← EDIT
),
u as (
  select * from public.users where lower(email) = lower((select email from t))
),
nodes    as (select count(*)::int c from public.skill_nodes),
tagged   as (select count(*)::int c from public.cases where skill_node is not null and is_active),
subs     as (select count(*)::int c from public.submissions where user_id = (select id from u)),
badges   as (select count(*)::int c from public.user_badges  where user_id = (select id from u)),
cheats   as (select count(*)::int c from public.cheatsheet_points where user_id = (select id from u)),
mastery  as (
  select count(*) filter (where best >= 75 and att >= 2)::int as mastered,
         count(*)::int as total
    from (
      select n.id,
             count(s.id) as att,
             max(s.score) as best
        from public.skill_nodes n
        left join public.cases c       on c.skill_node = n.id and c.is_active
        left join public.submissions s on s.case_id = c.id and s.user_id = (select id from u)
       group by n.id
    ) x
),
checks as (

  select 1 as step, 'migration 0044 ran' as check_name,
         case when exists (select 1 from information_schema.columns
                            where table_schema='public' and table_name='users' and column_name='is_demo')
              then 'OK' else 'MISSING' end as result,
         'run supabase/migrations/0044_growth_kit.sql' as fix

  union all
  select 2, 'demo account exists',
         case when exists (select 1 from u) then 'OK' else 'MISSING' end,
         'run supabase/create-demo-login.sql'

  union all
  select 3, 'constellation topology seeded  (' || (select c from nodes)::text || ' nodes)',
         case when (select c from nodes) >= 22 then 'OK'
              when (select c from nodes) > 0   then 'PARTIAL' else 'EMPTY' end,
         'run supabase/seed-skill-graph.sql  — without this the dashboard draws its built-in MOCK and ignores real progress'

  union all
  select 4, 'cases tagged to nodes  (' || (select c from tagged)::text || ' cases)',
         case when (select c from tagged) >= 20 then 'OK'
              when (select c from tagged) > 0   then 'PARTIAL' else 'NONE' end,
         'run supabase/seed-cases-constellation.sql  — a node with no case can never be mastered'

  union all
  select 5, 'demo submissions seeded  (' || (select c from subs)::text || ')',
         case when (select c from subs) >= 30 then 'OK'
              when (select c from subs) > 0   then 'PARTIAL' else 'NONE' end,
         'run supabase/seed-demo-account.sql  ← this is the one that fills the dashboard'

  union all
  select 6, 'constellation mastered  ('
            || coalesce((select mastered from mastery), 0)::text || ' of '
            || coalesce(nullif((select total from mastery), 0), 22)::text || ')',
         case when coalesce((select mastered from mastery), 0) >= 15 then 'OK'
              when coalesce((select mastered from mastery), 0) > 0   then 'PARTIAL'
              else 'NONE' end,
         'needs steps 3, 4 and 5 all green'

  union all
  select 7, 'tier is Pro and live',
         case when not exists (select 1 from u) then 'MISSING'
              when (select subscription_tier from u) <> 'pro' then 'NOT PRO'
              when (select subscription_expires_at from u) is not null
               and (select subscription_expires_at from u) < now() then 'EXPIRED'
              else 'OK' end,
         'run supabase/seed-demo-account.sql'

  union all
  select 8, 'points  (' || coalesce((select points from u), 0)::text || ')',
         case when coalesce((select points from u), 0) > 0 then 'OK' else 'ZERO' end,
         'run supabase/seed-demo-account.sql'

  union all
  select 9, 'flagged is_demo  (hidden from leaderboard)',
         case when not exists (select 1 from u) then 'MISSING'
              when (select is_demo from u) then 'OK' else 'NOT FLAGGED' end,
         'run supabase/seed-demo-account.sql, or toggle it in /admin/users'

  union all
  select 10, 'onboarding complete',
         case when not exists (select 1 from u) then 'MISSING'
              when (select onboarding_completed_at from u) is not null then 'OK'
              else 'INCOMPLETE' end,
         'harmless — you will just be shown the onboarding wizard on login'

  union all
  select 11, 'badges  (' || (select c from badges)::text || ')',
         case when (select c from badges) > 0 then 'OK' else 'NONE' end,
         'run supabase/seed-demo-account.sql (badges table may also be unseeded on this env)'

  union all
  select 12, 'cheat sheet points  (' || (select c from cheats)::text || ')',
         case when (select c from cheats) >= 12 then 'OK'
              when (select c from cheats) > 0   then 'PARTIAL' else 'NONE' end,
         'run supabase/seed-demo-account.sql'

  union all
  select 13, 'ANUSHKA10 coupon exists',
         case when exists (select 1 from public.discount_coupons where code = 'ANUSHKA10')
              then 'OK' else 'MISSING' end,
         'run supabase/migrations/0044_growth_kit.sql'
)
select step,
       check_name,
       result,
       case when result = 'OK' then '—' else fix end as what_to_do
  from checks
 order by (result = 'OK'), step;

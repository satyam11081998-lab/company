-- =====================================================================
-- check-growth-kit.sql — READ-ONLY health check for migration 0044 +
-- the demo account + influencer coupons + sessions + shared cheat sheets.
-- 2026-08-06
--
-- 100% SELECT. No INSERT / UPDATE / DELETE / DDL anywhere in this file.
-- Safe to run against production any number of times.
--
-- HOW TO USE (Supabase SQL editor)
--   Paste the whole file and run. Supabase shows only the LAST result set,
--   so if you want to read every section, run them one block at a time —
--   each block is separated by a `-- ▸ n ·` banner and is independently
--   runnable. Set the demo email in block 2 before running it.
-- =====================================================================


-- ▸ 1 · Did migration 0044 actually land?  ────────────────────────────
-- Every row should read 'YES'. Anything 'NO — missing' means 0044 has not
-- been run (or was run against a different project).

select 'users.is_demo'                as thing,
       case when exists (select 1 from information_schema.columns
                          where table_schema='public' and table_name='users'
                            and column_name='is_demo')
            then 'YES' else 'NO — missing' end as present
union all select 'users.phone',
       case when exists (select 1 from information_schema.columns
                          where table_schema='public' and table_name='users'
                            and column_name='phone')
            then 'YES' else 'NO — missing' end
union all select 'discount_coupons.user_id is NULLABLE',
       coalesce((select case when is_nullable='YES' then 'YES'
                             else 'NO — still NOT NULL, public codes cannot exist' end
                   from information_schema.columns
                  where table_schema='public' and table_name='discount_coupons'
                    and column_name='user_id'), 'NO — table missing')
union all select 'discount_coupons.commission_pct',
       case when exists (select 1 from information_schema.columns
                          where table_schema='public' and table_name='discount_coupons'
                            and column_name='commission_pct')
            then 'YES' else 'NO — missing' end
union all select 'table coupon_redemptions',
       case when to_regclass('public.coupon_redemptions') is not null
            then 'YES' else 'NO — missing' end
union all select 'table user_sessions',
       case when to_regclass('public.user_sessions') is not null
            then 'YES' else 'NO — missing' end
union all select 'table shared_cheat_sheets',
       case when to_regclass('public.shared_cheat_sheets') is not null
            then 'YES' else 'NO — missing' end
union all select 'bucket cheat-sheets is PRIVATE',
       coalesce((select case when public = false then 'YES'
                             else 'NO — bucket is public; re-run 0044 so revoking a sheet really revokes it' end
                   from storage.buckets where id = 'cheat-sheets'), 'NO — bucket missing')
union all select 'leaderboard_top() hides demo accounts',
       coalesce((select case when pg_get_functiondef(p.oid) like '%is_demo%'
                             then 'YES' else 'NO — old version still installed' end
                   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                  where n.nspname='public' and p.proname='leaderboard_top' limit 1),
                'NO — function missing')
union all select 'guard trigger protects is_demo',
       coalesce((select case when pg_get_functiondef(p.oid) like '%is_demo%'
                             then 'YES' else 'NO — users could self-flag as demo' end
                   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                  where n.nspname='public' and p.proname='guard_user_privileged_cols' limit 1),
                'NO — function missing')
union all select 'constellation seeded (skill_nodes)',
       case when (select count(*) from public.skill_nodes) > 0
            then 'YES — ' || (select count(*) from public.skill_nodes)::text || ' nodes'
            else 'NO — dashboard is rendering the built-in MOCK, run seed-skill-graph.sql' end
union all select 'RLS: coupon_redemptions is deny-all',
       coalesce((select case when c.relrowsecurity
                              and not exists (select 1 from pg_policies
                                               where schemaname='public' and tablename='coupon_redemptions')
                             then 'YES' else 'NO — commissions may be client-readable' end
                   from pg_class c join pg_namespace n on n.oid=c.relnamespace
                  where n.nspname='public' and c.relname='coupon_redemptions'), 'NO — table missing');


-- ▸ 2 · Demo account health  ──────────────────────────────────────────
-- Set the email. Every 'verdict' should read OK.

with target as (select 'demo@mece.in'::text as email)          -- ← EDIT
, u as (
  select * from public.users
   where lower(email) = lower((select email from target))
)
select
  (select email from target)                                        as account,
  case when (select count(*) from u) = 0 then 'MISSING — sign it up first'
       else 'found' end                                             as exists_check,
  (select name from u)                                              as display_name,
  (select subscription_tier from u)                                 as tier,
  (select case when is_demo then 'OK — hidden from leaderboard'
               else 'PROBLEM — will appear on the public board' end from u) as demo_flag,
  (select case when onboarding_completed_at is null
               then 'PROBLEM — will be bounced to /onboarding'
               else 'OK' end from u)                                as onboarding,
  (select case when subscription_expires_at is null then 'no expiry'
               when subscription_expires_at > now()
               then 'OK — ' || to_char(subscription_expires_at, 'DD Mon YYYY')
               else 'PROBLEM — EXPIRED, tier falls back to free' end from u) as pro_until,
  (select points from u)                                            as points_stored,
  coalesce((select sum(s.score)::int
              from public.submissions s
              join public.case_attempts a on a.submission_id = s.id
             where s.user_id = (select id from u) and a.is_first_attempt), 0) as points_expected,
  case when (select points from u) =
            coalesce((select sum(s.score)::int
                        from public.submissions s
                        join public.case_attempts a on a.submission_id = s.id
                       where s.user_id = (select id from u) and a.is_first_attempt), 0)
       then 'OK — reconciles with the submission log'
       else 'MISMATCH — re-run seed-demo-account.sql' end           as points_check,
  (select streak_count from u)                                      as streak,
  (select count(*) from public.submissions where user_id = (select id from u)) as submissions,
  (select count(*) from public.user_badges   where user_id = (select id from u)) as badges,
  (select count(*) from public.cheatsheet_points where user_id = (select id from u)) as cheat_points;


-- ▸ 3 · Constellation: what the demo dashboard will actually render  ──
-- Mastery rule (lib/dashboard/skill-graph.ts): best >= 75 AND attempts >= 2.
-- Bottom row is the headline: mastered / 22.

with u as (select id from public.users where lower(email) = lower('demo@mece.in'))  -- ← EDIT
, per_node as (
  select n.id                                    as node,
         n.cluster,
         n.label,
         count(s.id)                             as attempts,
         max(s.score)                            as best,
         (coalesce(max(s.score), 0) >= 75 and count(s.id) >= 2) as mastered
    from public.skill_nodes n
    left join public.cases c
           on c.skill_node = n.id and c.is_active
    left join public.submissions s
           on s.case_id = c.id and s.user_id = (select id from u)
   group by n.id, n.cluster, n.label
)
select node, cluster, label, attempts, best,
       case when mastered then 'mastered'
            when attempts > 0 then 'in progress'
            else 'locked' end as state
  from per_node
 order by mastered desc, attempts desc, cluster, node;

-- Headline number (run on its own):
-- with u as (select id from public.users where lower(email)=lower('demo@mece.in')),
-- per_node as (
--   select n.id, count(s.id) att, max(s.score) best
--     from public.skill_nodes n
--     left join public.cases c on c.skill_node = n.id and c.is_active
--     left join public.submissions s on s.case_id = c.id and s.user_id=(select id from u)
--    group by n.id)
-- select count(*) filter (where best >= 75 and att >= 2) as mastered,
--        count(*)                                        as total_nodes,
--        round(100.0 * count(*) filter (where best >= 75 and att >= 2) / nullif(count(*),0)) as pct_full
--   from per_node;


-- ▸ 4 · Nodes with no case authored  ──────────────────────────────────
-- Any node listed here can NEVER be mastered — there is nothing to attempt.
-- Fix by running supabase/seed-cases-constellation.sql.

select n.id as node, n.cluster, n.label, 'no active case tagged' as problem
  from public.skill_nodes n
 where not exists (
   select 1 from public.cases c where c.skill_node = n.id and c.is_active
 )
 order by n.cluster, n.id;


-- ▸ 5 · Coupons + money  ──────────────────────────────────────────────
-- `owed` is what you still have to pay the creator. Never shown to buyers.

select c.code,
       coalesce(c.owner_name, '—')                                  as owner,
       c.discount_pct                                               as buyer_off_pct,
       c.commission_pct                                             as owner_pct,
       c.tier_scope                                                 as applies_to,
       case when c.user_id is null then 'public' else 'user-locked' end as kind,
       case when c.status = 'active' and c.expires_at < now()
            then 'expired (not yet flagged)' else c.status end      as status,
       to_char(c.expires_at, 'DD Mon YYYY')                         as expires,
       coalesce(c.max_redemptions::text, '∞')                       as cap,
       count(r.id)                                                  as uses,
       case when c.redemption_count = count(r.id) then 'OK'
            else 'DRIFT — counter says ' || c.redemption_count::text end as counter_check,
       to_char(coalesce(sum(r.paid_paise), 0) / 100.0, 'FM999999990.00')      as gross_inr,
       to_char(coalesce(sum(r.discount_paise), 0) / 100.0, 'FM999999990.00')  as discount_given_inr,
       to_char(coalesce(sum(r.commission_paise) filter (where r.payout_status = 'pending'), 0) / 100.0,
               'FM999999990.00')                                    as owed_inr,
       to_char(coalesce(sum(r.commission_paise), 0) / 100.0, 'FM999999990.00') as lifetime_commission_inr
  from public.discount_coupons c
  left join public.coupon_redemptions r on r.coupon_id = c.id
 group by c.id, c.code, c.owner_name, c.discount_pct, c.commission_pct,
          c.tier_scope, c.user_id, c.status, c.expires_at, c.max_redemptions, c.redemption_count
 order by (c.user_id is null) desc, count(r.id) desc, c.code;


-- ▸ 6 · Redemption ledger (who used what, and what it cost)  ──────────

select to_char(r.created_at, 'DD Mon YYYY HH24:MI')            as used_at,
       r.code,
       coalesce(u.name, '—')                                   as buyer,
       coalesce(u.email, 'deleted user')                       as buyer_email,
       r.tier || ' · ' || r.period                             as plan,
       to_char(r.list_price_paise / 100.0, 'FM99990.00')       as list_inr,
       to_char(r.paid_paise       / 100.0, 'FM99990.00')       as paid_inr,
       to_char(r.commission_paise / 100.0, 'FM99990.00')       as commission_inr,
       r.payout_status,
       r.razorpay_payment_id
  from public.coupon_redemptions r
  left join public.users u on u.id = r.user_id
 order by r.created_at desc
 limit 100;


-- ▸ 7 · Ledger vs payments reconciliation  ────────────────────────────
-- Both lists should be EMPTY. A row here means a discounted sale was booked
-- in one place and not the other.

select 'ledger row with no matching payment' as issue,
       r.code, r.razorpay_payment_id, r.created_at
  from public.coupon_redemptions r
 where not exists (
   select 1 from public.payments p where p.razorpay_payment_id = r.razorpay_payment_id
 )
union all
select 'paid below list price but no ledger row (discount unaccounted)',
       'payment', p.razorpay_payment_id, p.created_at
  from public.payments p
 where p.status = 'paid'
   and p.amount_paise < case when p.tier = 'pro' then 59900 else 29900 end
   and not exists (
     select 1 from public.coupon_redemptions r
      where r.razorpay_payment_id = p.razorpay_payment_id
   )
 order by 4 desc
 limit 50;


-- ▸ 8 · Sessions and devices  ─────────────────────────────────────────
-- `live_sessions > 1` for anyone is the known first-login race. Fix from
-- /admin/users → open user → "Sign out everywhere".

select coalesce(u.name, u.email)                                as person,
       u.email,
       count(*) filter (where s.revoked_at is null)             as live_sessions,
       count(*)                                                 as total_logins,
       max(s.last_seen_at)                                      as last_seen,
       (array_agg(s.device_label order by s.last_seen_at desc)
          filter (where s.revoked_at is null))[1]               as current_device,
       (array_agg(coalesce(s.city, '') || ' ' || coalesce(s.country, '')
                  order by s.last_seen_at desc)
          filter (where s.revoked_at is null))[1]               as current_location,
       case when count(*) filter (where s.revoked_at is null) > 1
            then 'RACE — more than one live session' else 'OK' end as verdict
  from public.user_sessions s
  join public.users u on u.id = s.user_id
 group by u.id, u.name, u.email
 order by live_sessions desc, last_seen desc
 limit 100;


-- ▸ 9 · Shared cheat sheets  ──────────────────────────────────────────

select 'https://mece.in/s/' || sh.id                            as share_link,
       coalesce(u.name, u.email, '—')                           as shared_by,
       sh.point_count                                           as points_in_sheet,
       sh.view_count                                            as views,
       to_char(sh.created_at, 'DD Mon YYYY HH24:MI')            as created,
       case when sh.revoked_at is null then 'live' else 'revoked' end as status
  from public.shared_cheat_sheets sh
  left join public.users u on u.id = sh.user_id
 order by sh.created_at desc
 limit 100;


-- ▸ 10 · Signups over the last 30 days  ───────────────────────────────
-- Mirrors the chart on /admin/users. Demo accounts excluded.

select d::date                                                  as day,
       count(u.id)                                              as signups,
       count(u.id) filter (where u.subscription_tier <> 'free')  as paid_signups
  from generate_series(current_date - interval '29 days', current_date, interval '1 day') d
  left join public.users u
         on u.created_at >= d
        and u.created_at <  d + interval '1 day'
        and coalesce(u.is_demo, false) = false
 group by d
 order by d;

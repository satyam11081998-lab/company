-- =====================================================================
-- Leaderboard / users AUDIT — read-only. Run in the Supabase SQL editor and
-- paste each result set back. NOTHING is modified. Use this to decide which
-- duplicate accounts to keep vs remove.
-- =====================================================================


-- ─────────────────────────────────────────────────────────────────────
-- QUERY 1 — DUPLICATE NAMES: every name that has more than one account,
-- with each account's email / points / linkedin / created date so you can
-- tell me which to keep and which to remove.  (e.g. the several "Satyam Kumar")
-- ─────────────────────────────────────────────────────────────────────
select
  lower(trim(name))                              as name_key,
  count(*)                                        as accounts,
  count(distinct lower(email))                    as distinct_emails,
  string_agg(
    email
      || '  | pts=' || coalesce(points,0)
      || ' | linkedin=' || case when linkedin_url is not null then 'yes' else 'no' end
      || ' | created=' || to_char(created_at,'YYYY-MM-DD'),
    E'\n' order by points desc nulls last, created_at asc
  )                                               as accounts_detail
from public.users
group by lower(trim(name))
having count(*) > 1
order by accounts desc, name_key;


-- ─────────────────────────────────────────────────────────────────────
-- QUERY 2 — FULL ROSTER: every account, name + email + points + flags.
-- This is "all the people in the background with their name and email ID".
-- ─────────────────────────────────────────────────────────────────────
select
  name,
  email,
  coalesce(points,0)                              as points,
  case when linkedin_url is not null then 'yes' else 'no' end as has_linkedin,
  case
    when email like '%@leaderboard.mece.in' then 'placeholder (linkedin/name id)'
    when email like '%@seed.mece.in' or email like '%@mece-seed.local' then 'placeholder (legacy seed)'
    else 'real'
  end                                             as account_type,
  to_char(created_at,'YYYY-MM-DD')                as created
from public.users
order by lower(trim(name)), points desc nulls last;


-- ─────────────────────────────────────────────────────────────────────
-- QUERY 3 — LEADERBOARD AS IT WILL RENDER: top 50 by points, with whether
-- a LinkedIn icon will show (linkedin_url present) and a photo (avatar_url).
-- Anyone with < 3 effective solves is gated off the live board separately.
-- ─────────────────────────────────────────────────────────────────────
select
  row_number() over (order by points desc nulls last) as rank,
  name,
  coalesce(points,0)                              as points,
  case when linkedin_url is not null then '🔗' else '—' end as linkedin_icon,
  case when avatar_url   is not null then 'photo' else 'initials' end as avatar,
  email
from public.users
order by points desc nulls last
limit 50;

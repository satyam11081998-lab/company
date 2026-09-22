-- revenue_audit.sql — what the admin revenue tile counts, and what it sets aside.
--
-- Run in the Supabase SQL editor. Every Razorpay-verified payment across all
-- four revenue tables, with the reason it is or is not counted as revenue.
-- The COUNTED rows should sum to the "from N customer payments" figure on
-- /admin/users; anything mislabelled here is telling you the filter is wrong.
--
-- If a row shows 'counted' but was really your own test, copy its payment_id
-- into EXCLUDED_PAYMENT_IDS in lib/revenue.ts.

with internal as (
  select id
  from public.users
  where is_admin
     or is_demo
     or email ~* '@(seed\.mece\.in|mece-seed\.local|leaderboard\.mece\.in)$'
),
all_payments as (
  select 'subscriptions' as stream, razorpay_payment_id as payment_id,
         user_id, amount_paise, coalesce(paid_at, created_at) as when_at
    from public.payments
   where status = 'paid'

  union all
  select 'decks', razorpay_payment_id, user_id, amount_paise, created_at
    from public.deck_purchases

  union all
  select 'vault', razorpay_payment_id, user_id, amount_paise, granted_at
    from public.skeleton_access

  union all
  select 'minutes', razorpay_payment_id, user_id, amount_paise, created_at
    from public.realtime_purchases
)
select
  p.stream,
  p.payment_id,
  round(p.amount_paise / 100.0, 2) as amount_inr,
  p.when_at,
  u.email,
  case
    when p.payment_id is null or btrim(p.payment_id) = '' then 'not counted - no razorpay id'
    when p.user_id is null                                then 'not counted - no buyer recorded'
    when i.id is not null                                 then 'not counted - internal account'
    else                                                       'counted'
  end as verdict
from all_payments p
left join internal i on i.id = p.user_id
left join public.users u on u.id = p.user_id
order by p.when_at desc nulls last;

-- One-line reconciliation: the figure the tile should show.
-- select 3494 + coalesce(sum(amount_paise), 0) / 100.0 as revenue_inr from ( ... ) where verdict = 'counted';

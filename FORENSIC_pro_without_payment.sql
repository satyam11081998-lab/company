-- FORENSIC_pro_without_payment.sql
-- Run these READ-ONLY queries in the Supabase SQL editor to confirm HOW
-- patijagannath11@gmail.com became Pro. Nothing here changes data.
--
-- Interpretation guide is at the bottom.

-- ── 1. The user's row: is it really Pro, and how is it dated? ────────────────
select id, email, subscription_tier, subscription_started_at,
       subscription_expires_at, is_admin, is_demo, is_guest, created_at
from public.users
where lower(email) = lower('patijagannath11@gmail.com');
--   ^ note the id; and note whether subscription_started_at is NULL.
--     A NULL started_at with a non-free tier is a strong tell that NO code path
--     set it (verify/webhook/admin all stamp started_at) — i.e. a raw UPDATE.

-- ── 2. Any payment record at all for this user? ──────────────────────────────
select p.id, p.status, p.tier, p.amount_paise, p.razorpay_order_id,
       p.razorpay_payment_id, p.razorpay_signature, p.created_at, p.paid_at
from public.payments p
join public.users u on u.id = p.user_id
where lower(u.email) = lower('patijagannath11@gmail.com')
order by p.created_at desc;
--   ZERO rows  -> they never went through /verify or the webhook. Combined with
--                 "nothing in Razorpay", the tier was written OUTSIDE the money
--                 path (raw browser UPDATE, or a manual DB/dashboard edit).
--   A 'paid' row whose razorpay_payment_id is NOT in your Razorpay dashboard
--                 -> forged/replayed, or a TEST-MODE payment (see note 6).

-- ── 3. Did a coupon do it? ───────────────────────────────────────────────────
select r.*
from public.coupon_redemptions r
join public.users u on u.id = r.user_id
where lower(u.email) = lower('patijagannath11@gmail.com');
--   Even a 100% coupon cannot make it free — discountedPaise() floors at ₹1 and
--   still needs a real signed payment. Expect zero rows.

-- ── 4. Is the privileged-column guard trigger actually present? ──────────────
select tgname
from pg_trigger
where tgrelid = 'public.users'::regclass and not tgisinternal;
--   If trg_guard_user_cols is MISSING here, the browser self-UPDATE exploit was
--   wide open. This is the most likely root cause.

-- ── 5. What can the browser roles currently write on public.users? ───────────
select grantee, privilege_type, column_name
from information_schema.role_column_grants
where table_schema = 'public' and table_name = 'users'
  and grantee in ('anon','authenticated')
  and privilege_type in ('UPDATE','INSERT')
order by grantee, privilege_type, column_name;
--   BEFORE the 0054 fix you will typically see a single row per grantee with
--   column_name = NULL and privilege_type = 'UPDATE' -> that means table-wide
--   UPDATE: the browser can set EVERY column, including subscription_tier.
--   AFTER 0054 you should see UPDATE only on the ~14 profile columns and never
--   on subscription_tier / is_admin / points.

-- ── 6. Is RLS even enabled on users? ─────────────────────────────────────────
select relrowsecurity as rls_enabled
from pg_class where oid = 'public.users'::regclass;
--   f (false) -> migration 0006 was never applied here; the table was fully
--   open. Same fix applies; 0054 re-enables it.

-- ── 7. List every policy on users (spot a stray permissive one) ──────────────
select policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'users'
order by policyname;

-- ─────────────────────────────────────────────────────────────────────────────
-- READING THE RESULTS
--   • Q2 empty + Q3 empty + (Q4 missing trigger OR Q6 false OR Q5 shows table-
--     wide UPDATE)  ==>  self-granted via a raw browser UPDATE. This is the
--     free-Pro loophole. Apply 0054, then revoke this user (below).
--   • Q2 has a 'paid' row not seen in Razorpay  ==> forged signature (key secret
--     leaked) or a test-mode payment. Rotate RAZORPAY_KEY_SECRET, confirm the
--     live key is rzp_live_*, and check Razorpay Test Mode for the payment_id.
--
-- REVOKE THE USER (run only after you've read the above and applied 0054):
--   update public.users
--      set subscription_tier = 'free',
--          subscription_started_at = null,
--          subscription_expires_at = null
--    where lower(email) = lower('patijagannath11@gmail.com');
--   -- must be run as the service role / SQL editor owner; the guard trigger
--   -- blocks non-service writers. In the Supabase SQL editor this runs as a
--   -- superuser and will apply.

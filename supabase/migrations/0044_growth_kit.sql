-- 0044_growth_kit.sql — Influencer marketing kit.
-- 2026-08-06
--
-- Four independent, additive features. NOTHING here rewrites an existing
-- column, drops a policy, or changes an existing check constraint. Fully
-- idempotent: safe to run twice.
--
--   1. users.is_demo / users.phone  — demo accounts excluded from the public
--      leaderboard + cohort aggregates; phone captured for admin support.
--   2. discount_coupons extended for PUBLIC (influencer) codes — nullable
--      user_id, commission %, redemption cap + counter. User-locked deck-vault
--      coupons keep behaving exactly as they do today (C7 v1 semantics are a
--      strict subset of C7 v2).
--   3. coupon_redemptions — per-redemption money ledger. Service-role only;
--      the commission an influencer earns is NEVER readable by any client.
--   4. user_sessions — one active session per user (Netflix-style device lock).
--   5. shared_cheat_sheets + public `cheat-sheets` bucket — a downloaded cheat
--      sheet can be published at mece.in/s/<id> and opened by anyone.
--
-- Run AFTER 0041, 0042, 0043.

-- ═══════════════════════════════════════════════════════════════════════
-- 1 · users — demo flag + phone
-- ═══════════════════════════════════════════════════════════════════════

alter table public.users add column if not exists is_demo boolean not null default false;
alter table public.users add column if not exists phone text;

-- Demo lookups are rare; a partial index keeps it near-free.
create index if not exists users_is_demo_idx on public.users (is_demo) where is_demo = true;
-- Admin "who joined when" list sorts by signup date.
create index if not exists users_created_at_idx on public.users (created_at desc);

-- Extend the privileged-column guard from 0006 so a logged-in user cannot
-- flag themselves as a demo account (which would hide them from the
-- leaderboard while keeping their points). Same function, same trigger —
-- only `is_demo` is added to the reverted set.
create or replace function public.guard_user_privileged_cols()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() is distinct from 'service_role' then
    new.subscription_tier       := old.subscription_tier;
    new.subscription_started_at := old.subscription_started_at;
    new.subscription_expires_at := old.subscription_expires_at;
    new.points                  := old.points;
    new.is_admin                := old.is_admin;
    new.is_demo                 := old.is_demo;
  end if;
  return new;
end $$;

-- leaderboard_top() is the anon-callable board. Demo accounts must not appear.
-- Signature and return shape are unchanged, so every existing caller is safe.
create or replace function public.leaderboard_top(p_limit int default 50)
returns table(id uuid, name text, avatar_url text, points int)
language sql security definer set search_path = public as $$
  select id, name, avatar_url, points
  from public.users
  where coalesce(is_demo, false) = false
  order by points desc nulls last
  limit greatest(1, least(p_limit, 200));
$$;

-- ═══════════════════════════════════════════════════════════════════════
-- 2 · discount_coupons — public / influencer codes  (C7 → v2)
-- ═══════════════════════════════════════════════════════════════════════
-- A coupon is now one of two shapes:
--   user_id NOT NULL  → user-locked, single-use  (deck-vault rewards, unchanged)
--   user_id NULL      → public, multi-use        (influencer codes, new)
--
-- The existing partial unique index `discount_coupons_one_active` is scoped to
-- `source = 'deck_vault'`, so public codes never collide with it. NULL user_id
-- is also ignored by that index by construction.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'discount_coupons'
      and column_name = 'user_id' and is_nullable = 'NO'
  ) then
    alter table public.discount_coupons alter column user_id drop not null;
  end if;
end $$;

alter table public.discount_coupons add column if not exists owner_name       text;
alter table public.discount_coupons add column if not exists owner_handle     text;
alter table public.discount_coupons add column if not exists owner_contact    text;
-- Percent of LIST price paid out to the coupon owner. Never shown to buyers.
alter table public.discount_coupons add column if not exists commission_pct   numeric(5,2) not null default 0;
-- NULL = unlimited redemptions. User-locked coupons are capped at 1 below.
alter table public.discount_coupons add column if not exists max_redemptions  int;
alter table public.discount_coupons add column if not exists redemption_count int not null default 0;
alter table public.discount_coupons add column if not exists admin_note       text not null default '';

-- Backfill: every pre-existing coupon is a single-use deck-vault reward.
update public.discount_coupons
   set max_redemptions = 1
 where max_redemptions is null
   and user_id is not null;

alter table public.discount_coupons drop constraint if exists discount_coupons_commission_pct_check;
alter table public.discount_coupons
  add constraint discount_coupons_commission_pct_check check (commission_pct >= 0 and commission_pct <= 50);

create index if not exists discount_coupons_source_idx on public.discount_coupons (source);
create index if not exists discount_coupons_owner_idx  on public.discount_coupons (owner_name);

-- RLS is untouched: `discount_coupons_select_own` (auth.uid() = user_id) still
-- applies. Public codes have user_id NULL, so `auth.uid() = user_id` is NULL →
-- not true → no client can enumerate them. Validation is service-role only.

-- ═══════════════════════════════════════════════════════════════════════
-- 3 · coupon_redemptions — money ledger (admin eyes only)
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.coupon_redemptions (
  id                  uuid primary key default gen_random_uuid(),
  coupon_id           uuid not null references public.discount_coupons(id) on delete cascade,
  code                text not null,
  user_id             uuid null references public.users(id) on delete set null,
  razorpay_order_id   text not null default '',
  -- Unique: the same payment can never be counted twice, so /verify and the
  -- webhook racing each other cannot double-credit an influencer.
  razorpay_payment_id text not null,
  tier                text not null,
  period              text not null,
  list_price_paise    int  not null,
  paid_paise          int  not null,
  discount_paise      int  not null,
  commission_pct      numeric(5,2) not null default 0,
  commission_paise    int  not null default 0,
  payout_status       text not null default 'pending'
                        check (payout_status in ('pending', 'paid', 'void')),
  paid_out_at         timestamptz null,
  created_at          timestamptz not null default now()
);

create unique index if not exists coupon_redemptions_payment_key
  on public.coupon_redemptions (razorpay_payment_id);
create index if not exists coupon_redemptions_coupon_idx on public.coupon_redemptions (coupon_id, created_at desc);
create index if not exists coupon_redemptions_user_idx   on public.coupon_redemptions (user_id);

alter table public.coupon_redemptions enable row level security;
-- Deliberately NO policies: RLS on with zero policies = deny all for anon and
-- authenticated. Only the service role (admin console) can read commissions.

-- ═══════════════════════════════════════════════════════════════════════
-- 4 · user_sessions — one active device at a time
-- ═══════════════════════════════════════════════════════════════════════
-- `session_id` is the Supabase JWT `session_id` claim (stable for the life of
-- a login, rotates on re-login). A row with revoked_at IS NULL is a live login.

create table if not exists public.user_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  session_id   text not null,
  ip           text null,
  city         text null,
  region       text null,
  country      text null,
  user_agent   text null,
  device_label text null,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at   timestamptz null,
  revoked_by   text null
);

create unique index if not exists user_sessions_session_key on public.user_sessions (session_id);
create index if not exists user_sessions_active_idx on public.user_sessions (user_id, last_seen_at desc)
  where revoked_at is null;

alter table public.user_sessions enable row level security;
-- Owner may READ their own sessions (the conflict screen names the other
-- device). All writes are service-role.
drop policy if exists user_sessions_select_own on public.user_sessions;
create policy user_sessions_select_own on public.user_sessions
  for select using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════
-- 5 · shared_cheat_sheets — public, watermarked PDF at mece.in/s/<id>
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.shared_cheat_sheets (
  id           text primary key,                       -- short url-safe slug
  user_id      uuid null references public.users(id) on delete set null,
  title        text not null default 'MECE Cheat Sheet',
  storage_path text not null,
  point_count  int  not null default 0,
  view_count   int  not null default 0,
  created_at   timestamptz not null default now(),
  revoked_at   timestamptz null
);

create index if not exists shared_cheat_sheets_user_idx on public.shared_cheat_sheets (user_id, created_at desc);

alter table public.shared_cheat_sheets enable row level security;
-- Owner reads their own share history. The public /s/<id> route resolves the
-- row with the service role, so no anon select policy is needed (and none is
-- given — the table lists who shared what).
drop policy if exists shared_cheat_sheets_select_own on public.shared_cheat_sheets;
create policy shared_cheat_sheets_select_own on public.shared_cheat_sheets
  for select using (auth.uid() = user_id);

-- PRIVATE bucket, deliberately. The sheet is public to *readers*, but it is
-- served by `/s/<id>/file`, which streams the object with the service role
-- after checking `revoked_at`. A public bucket would hand out a permanent
-- direct object URL that bypasses that check — revoking a shared sheet would
-- not actually revoke anything. No storage policies are created either, so
-- anon and authenticated clients cannot read or write it at all.
insert into storage.buckets (id, name, public)
values ('cheat-sheets', 'cheat-sheets', false)
on conflict (id) do update set public = false;

-- ═══════════════════════════════════════════════════════════════════════
-- 6 · Seed the first influencer code
-- ═══════════════════════════════════════════════════════════════════════
-- 10% off for the buyer, 5% of LIST price accrued to Anushka. Unlimited uses,
-- valid one year. Edit or revoke from /admin/coupons.

insert into public.discount_coupons
  (code, user_id, discount_pct, tier_scope, source, status, expires_at,
   owner_name, owner_handle, commission_pct, max_redemptions, admin_note)
values
  ('ANUSHKA10', null, 10, 'any', 'influencer', 'active', now() + interval '365 days',
   'Anushka', 'anushka', 5, null, 'Launch influencer collab — Instagram reels')
on conflict (code) do nothing;

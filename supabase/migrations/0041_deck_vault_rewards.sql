-- 0041_deck_vault_rewards.sql — Upload a winning case-comp deck -> discount coupon.
-- Additive + idempotent (safe to run twice). Nothing here touches existing tables.
--
-- Flow: user uploads deck + certificate (private bucket, service-role only)
--   -> deck_submissions row (status 'pending') -> Telegram alert -> admin reviews
--   in /admin/deck-vault -> approve mints a single-use, user-locked coupon in
--   discount_coupons -> user applies it on /upgrade -> Razorpay order/verify/
--   webhook validate + redeem it server-side.
--
-- Discount policy (defaults; admin can override per approval):
--   corporate podium finish -> 60%, b-school podium finish -> 40%.

-- ── 1. Submissions ──────────────────────────────────────────────────────────
create table if not exists public.deck_submissions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  competition_name text not null,
  organizer        text not null default '',
  competition_type text not null check (competition_type in ('corporate', 'bschool')),
  position         text not null check (position in ('winner', 'runner_up', 'second_runner_up')),
  year             int  not null check (year between 2015 and 2035),
  deck_path        text not null,
  certificate_path text not null,
  tnc_accepted_at  timestamptz not null,
  tnc_version      text not null default '2026-07-17',
  status           text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note       text not null default '',
  discount_pct     int null check (discount_pct between 1 and 90),
  coupon_id        uuid null,
  created_at       timestamptz not null default now(),
  reviewed_at      timestamptz null
);

-- One in-flight submission per user (backend also pre-checks for a friendly error).
create unique index if not exists deck_submissions_one_pending
  on public.deck_submissions (user_id) where (status = 'pending');
create index if not exists deck_submissions_user_idx   on public.deck_submissions (user_id);
create index if not exists deck_submissions_status_idx on public.deck_submissions (status);

alter table public.deck_submissions enable row level security;

-- Users may see their own submissions (status page). All writes go through the
-- service role (FastAPI submit / admin actions) — no insert/update policy on purpose.
drop policy if exists "deck_submissions_select_own" on public.deck_submissions;
create policy "deck_submissions_select_own" on public.deck_submissions
  for select using (auth.uid() = user_id);

-- ── 2. Coupons ──────────────────────────────────────────────────────────────
create table if not exists public.discount_coupons (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null unique,
  user_id             uuid not null references public.users(id) on delete cascade,
  discount_pct        int  not null check (discount_pct between 1 and 90),
  tier_scope          text not null default 'pro' check (tier_scope in ('pro', 'lite', 'any')),
  source              text not null default 'deck_vault',
  submission_id       uuid null references public.deck_submissions(id) on delete set null,
  status              text not null default 'active' check (status in ('active', 'redeemed', 'expired', 'revoked')),
  expires_at          timestamptz not null,
  created_at          timestamptz not null default now(),
  redeemed_at         timestamptz null,
  redeemed_payment_id text null
);

-- One live deck-vault coupon per user at a time.
create unique index if not exists discount_coupons_one_active
  on public.discount_coupons (user_id) where (status = 'active' and source = 'deck_vault');
create index if not exists discount_coupons_user_idx on public.discount_coupons (user_id);

alter table public.discount_coupons enable row level security;

-- Users may read their own coupons (to display code + expiry). Writes: service role only.
drop policy if exists "discount_coupons_select_own" on public.discount_coupons;
create policy "discount_coupons_select_own" on public.discount_coupons
  for select using (auth.uid() = user_id);

-- ── 3. Private storage bucket for submissions ───────────────────────────────
-- No storage.objects policies are created, so the anon/authenticated clients
-- cannot read or write it at all — only the service role (FastAPI + admin
-- signed URLs) can touch these files. Decks stay in the vault.
insert into storage.buckets (id, name, public)
values ('deck-vault-submissions', 'deck-vault-submissions', false)
on conflict (id) do nothing;

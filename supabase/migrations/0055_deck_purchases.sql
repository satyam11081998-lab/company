-- 0055_deck_purchases.sql — Deck Vault à-la-carte purchases.
-- Run AFTER 0054. Idempotent.
--
-- Pricing (enforced in code, lib/deck-access.ts, never trusted from the client):
--   ₹99  → unlock ONE deck            → row in public.deck_purchases
--   ₹499 → unlock the WHOLE vault     → row in public.skeleton_access (table
--          already exists from 0007; we only add an owner-read policy here)
--   ₹599 → Pro subscription (unchanged) → unlocks everything as before
--
-- Entitlement to a deck's locked pages = admin OR active Pro OR a skeleton_access
-- row OR a deck_purchases row for that skeleton. Writes are SERVICE-ROLE ONLY
-- (the Razorpay verify/webhook after a captured payment); the browser can read
-- its own rows to render "owned" state but can never insert one.

-- ── single-deck purchases ─────────────────────────────────────────────────────
create table if not exists public.deck_purchases (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  skeleton_id         uuid not null references public.deck_skeletons(id) on delete cascade,
  razorpay_order_id   text not null,
  razorpay_payment_id text not null unique,     -- replay guard (verify + webhook)
  amount_paise        int  not null,
  created_at          timestamptz not null default now(),
  unique (user_id, skeleton_id)                 -- a user owns a deck at most once
);
create index if not exists deck_purchases_user_idx on public.deck_purchases (user_id);

alter table public.deck_purchases enable row level security;

-- Owner may READ their own purchases (to show "owned"); nobody may write from the
-- browser — grants come only from the service role after a verified payment.
drop policy if exists deck_purchases_select_own on public.deck_purchases;
create policy deck_purchases_select_own on public.deck_purchases
  for select using (auth.uid() = user_id);

-- ── whole-vault access (skeleton_access, from 0007) ───────────────────────────
-- The table exists with RLS enabled but no policies (deny-all). Add owner-read so
-- the client can tell it has bought the vault. Writes stay service-role only.
do $$
begin
  if to_regclass('public.skeleton_access') is not null then
    execute 'alter table public.skeleton_access enable row level security';
    execute 'drop policy if exists skeleton_access_select_own on public.skeleton_access';
    execute 'create policy skeleton_access_select_own on public.skeleton_access for select using (auth.uid() = user_id)';
  end if;
end $$;

-- Verify:
--   select tablename, policyname, cmd from pg_policies
--    where tablename in ('deck_purchases','skeleton_access') order by 1,2;

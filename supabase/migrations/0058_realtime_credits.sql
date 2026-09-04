-- Real-time interview minute credits.
--
-- Real-time voice (Gemini Live / OpenAI Realtime) costs ~10x the Groq pipeline,
-- so it cannot be unlimited in the flat Pro sub. Pro gets a monthly INCLUDED
-- allowance; beyond that a user buys minute packs (purchased minutes never
-- expire). Deduction burns included first, then purchased.
--
-- Service-role only (RLS on, no public policy) — balances are read/written by
-- the backend, never the client directly.
create table if not exists public.realtime_credits (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  included_remaining    numeric(10,3) not null default 0,   -- refills monthly for Pro
  included_period_start timestamptz   not null default now(),
  purchased_remaining   numeric(10,3) not null default 0,   -- top-ups; never expire
  updated_at            timestamptz   not null default now()
);
alter table public.realtime_credits enable row level security;

-- Idempotency ledger for purchased minute packs. The razorpay_payment_id PK
-- guarantees a single payment can credit minutes at most once (verify + webhook
-- can both fire).
create table if not exists public.realtime_purchases (
  razorpay_payment_id text primary key,
  user_id             uuid not null,
  minutes             numeric(10,3) not null,
  amount_paise        int,
  created_at          timestamptz not null default now()
);
alter table public.realtime_purchases enable row level security;

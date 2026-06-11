-- ============================================================================
-- 0007: Deck Skeleton Library
-- A one-time-purchase (₹500) repository of original, MECE-authored deck
-- skeleton templates (structure-only rebuilds derived from patterns across
-- winning competition decks — never the original files).
-- ============================================================================

-- The skeletons on offer ------------------------------------------------------
create table if not exists public.deck_skeletons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  case_type text not null,              -- profitability | market entry | growth | marketing | ops | bfsi | ...
  round_type text not null default 'screening',  -- screening (3-5 slides) | finale (8-12 slides)
  slide_count int not null,
  description text not null default '',
  tags text[] not null default '{}',
  storage_path text not null,           -- path inside the private 'skeletons' bucket
  is_active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- One-time access purchases ---------------------------------------------------
create table if not exists public.skeleton_access (
  user_id uuid primary key references public.users(id) on delete cascade,
  razorpay_order_id text not null,
  razorpay_payment_id text not null unique,
  amount_paise int not null,
  granted_at timestamptz not null default now()
);

-- RLS --------------------------------------------------------------------------
alter table public.deck_skeletons enable row level security;
alter table public.skeleton_access enable row level security;

-- Anyone signed in can browse the catalogue (files themselves are gated by API).
drop policy if exists "deck_skeletons_read" on public.deck_skeletons;
create policy "deck_skeletons_read" on public.deck_skeletons
  for select to authenticated using (is_active = true);

-- Users can see their own access row.
drop policy if exists "skeleton_access_read_own" on public.skeleton_access;
create policy "skeleton_access_read_own" on public.skeleton_access
  for select to authenticated using (auth.uid() = user_id);

-- Insert own row (written by the verify route after signature + amount checks,
-- mirroring the existing payments-table pattern).
drop policy if exists "skeleton_access_insert_own" on public.skeleton_access;
create policy "skeleton_access_insert_own" on public.skeleton_access
  for insert to authenticated with check (auth.uid() = user_id);

-- Private storage bucket for the skeleton files ---------------------------------
insert into storage.buckets (id, name, public)
values ('skeletons', 'skeletons', false)
on conflict (id) do nothing;

-- No public read policy on the bucket: files are served exclusively through
-- short-lived signed URLs created by the download API after an access check.

-- =====================================================================
-- Migration 0063: seo_pages — the Growth Agent's programmatic-SEO store.
--
-- The Growth Agent generates grounded, genuinely-useful public articles
-- (e.g. "this week's business news as a case/GD breakdown") from data MECE
-- already owns (news_headlines), self-critiques them for a quality score,
-- and stores them as DRAFTS. An admin approves -> they publish at
-- /insights/<slug> and enter the sitemap. Nothing publishes without a human.
--
-- Additive + idempotent. RLS: public reads PUBLISHED rows only; admins read
-- everything; writes go through the service role (backend generator + admin
-- server actions), which bypasses RLS — so there is no anon/auth write policy.
-- =====================================================================

create extension if not exists pgcrypto;

create table if not exists public.seo_pages (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  kind             text not null default 'news_case'
                     check (kind in ('news_case','firm_guide','concept','other')),
  title            text not null,                 -- <title> + <h1>
  meta_description text not null,
  dek              text,                          -- one-line subtitle / summary
  content          jsonb not null default '{}'::jsonb,   -- structured sections (see seo_writer.py)
  source_refs      jsonb not null default '[]'::jsonb,   -- [{label,url}] grounding
  topic            text,
  keywords         text[] not null default '{}',
  status           text not null default 'draft'
                     check (status in ('draft','approved','published','rejected','archived')),
  quality_score    int,                           -- 0..100 self-critique
  quality_notes    text,
  model            text,
  agent_meta       jsonb not null default '{}'::jsonb,
  source_headline_id uuid references public.news_headlines(id) on delete set null,
  created_by       uuid references public.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  published_at     timestamptz
);

create index if not exists seo_pages_status_idx     on public.seo_pages(status, published_at desc nulls last);
create index if not exists seo_pages_created_idx     on public.seo_pages(created_at desc);
create unique index if not exists seo_pages_slug_uidx on public.seo_pages(slug);

alter table public.seo_pages enable row level security;

-- PUBLIC read: only published rows are visible to anon + authenticated.
drop policy if exists seo_pages_public_read on public.seo_pages;
create policy seo_pages_public_read on public.seo_pages
  for select using (status = 'published');

-- ADMIN read: an admin's own session can read every row (drafts included).
drop policy if exists seo_pages_admin_read on public.seo_pages;
create policy seo_pages_admin_read on public.seo_pages
  for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin)
  );

-- No INSERT/UPDATE/DELETE policy on purpose: all writes go through the service
-- role (backend generator + admin server actions after an is_admin check),
-- which bypasses RLS. Anon/authenticated cannot write.

grant select on public.seo_pages to anon, authenticated;

-- keep updated_at fresh
create or replace function public.touch_seo_pages_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists trg_seo_pages_touch on public.seo_pages;
create trigger trg_seo_pages_touch before update on public.seo_pages
  for each row execute function public.touch_seo_pages_updated_at();

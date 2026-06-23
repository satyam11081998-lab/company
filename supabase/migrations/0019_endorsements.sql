-- =====================================================================
-- Migration 0019: Endorsements — curated, credibility-first social proof,
-- DISTINCT from testimonials.
--
-- Endorsements are solicited from named authorities (placed seniors, mentors,
-- toppers) — NOT crowd-submitted. So: admin/service writes only (no anon insert
-- policy), public reads only PUBLISHED rows, and a `verified` flag drives a
-- "Verified" badge in the UI. No fake seeds — the section hides itself when empty.
--
-- Additive + idempotent. NOT a CONTRACTS surface (standalone table; public-read
-- + admin/service writes). Reuses the existing public 'testimonials' storage
-- bucket for uploaded avatars, so no new bucket/policy is needed.
-- =====================================================================

create table if not exists public.endorsements (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  role          text not null default '',     -- e.g. "Engagement Manager"
  organization  text not null default '',     -- e.g. "Bain & Company"
  credential    text not null default '',     -- e.g. "IIM Ahmedabad '21 | CAT 99.8"
  quote         text not null,
  avatar_url    text,                          -- uploaded (storage) or pasted URL; null => initials
  linkedin_url  text,
  verified      boolean not null default false,-- drives the "Verified" badge
  status        text not null default 'published'
                  check (status in ('published','hidden')),
  position      int  not null default 0,       -- manual ordering (asc)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists endorsements_status_idx
  on public.endorsements(status, position, created_at desc);

-- ── RLS ──────────────────────────────────────────────────────────────
alter table public.endorsements enable row level security;

-- Public (anon or authed) reads PUBLISHED endorsements only.
drop policy if exists endorsements_select_published on public.endorsements;
create policy endorsements_select_published on public.endorsements for select
  using (status = 'published');

-- Admins can read ALL (incl. hidden) via their own session.
drop policy if exists endorsements_select_admin on public.endorsements;
create policy endorsements_select_admin on public.endorsements for select
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin));

-- NOTE: no INSERT/UPDATE/DELETE policies — all writes go through the
-- admin-gated server actions using the SERVICE ROLE, which bypasses RLS.
-- (Unlike testimonials, endorsements are not user-submittable.)

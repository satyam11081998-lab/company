-- =====================================================================
-- Migration 0012: DB-backed testimonials + team ("brains behind").
--
-- Moves testimonials/team from the static lib/testimonials.ts array into the
-- DB so admins can add/remove them and users can submit their own (which the
-- admin verifies before it goes live). The two real, verified profiles
-- (Satyam, Mohit) are seeded as published so the site is never empty.
--
-- Additive + idempotent. NOT a CONTRACTS surface (standalone tables; only
-- public-read + admin/service writes). Seeds use fixed UUID PKs so re-running
-- is a clean no-op (PK is a FULL unique index — avoids the partial-index
-- ON CONFLICT 42P10 gotcha from C1).
-- =====================================================================

-- ── testimonials ─────────────────────────────────────────────────────
create table if not exists public.testimonials (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  school          text not null default '',     -- college / programme, e.g. "IMI Delhi PGDM '27"
  placement       text not null default '',      -- role / internship, e.g. "Summer Intern @ HCCB"
  quote           text not null,
  avatar_url      text,                          -- uploaded (storage) or pasted URL; null => initials
  linkedin_url    text,
  status          text not null default 'published'
                    check (status in ('pending','published','rejected')),
  source          text not null default 'admin'
                    check (source in ('admin','user')),
  submitted_email text,                          -- contact for user submissions
  position        int  not null default 0,       -- manual ordering (asc)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists testimonials_status_idx on public.testimonials(status, position, created_at desc);

-- ── team_members ("brains behind") ───────────────────────────────────
create table if not exists public.team_members (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  school        text not null default '',        -- college / programme
  placement     text not null default '',        -- role / where doing internship
  quote         text not null default '',        -- optional one-liner
  avatar_url    text,
  linkedin_url  text,
  position      int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists team_members_position_idx on public.team_members(position, created_at);

-- ── RLS ──────────────────────────────────────────────────────────────
alter table public.testimonials  enable row level security;
alter table public.team_members  enable row level security;

-- testimonials: anyone can read PUBLISHED ones.
drop policy if exists testimonials_select_published on public.testimonials;
create policy testimonials_select_published on public.testimonials for select
  using (status = 'published');

-- testimonials: anyone (anon or authed) may SUBMIT, but only as a pending
-- user submission. Admin/service writes bypass RLS for publish/edit/delete.
drop policy if exists testimonials_insert_submission on public.testimonials;
create policy testimonials_insert_submission on public.testimonials for insert
  with check (status = 'pending' and source = 'user');

-- testimonials: admins can read ALL (incl. pending) via their own session.
drop policy if exists testimonials_select_admin on public.testimonials;
create policy testimonials_select_admin on public.testimonials for select
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin));

-- team_members: public read; writes are admin/service only.
drop policy if exists team_members_select_all on public.team_members;
create policy team_members_select_all on public.team_members for select using (true);

grant insert on public.testimonials to anon, authenticated;

-- ── public storage bucket for uploaded testimonial/team avatars ──────
insert into storage.buckets (id, name, public)
values ('testimonials', 'testimonials', true)
on conflict (id) do nothing;

drop policy if exists testimonials_bucket_public_read on storage.objects;
create policy testimonials_bucket_public_read on storage.objects for select
  using (bucket_id = 'testimonials');
-- Uploads happen through an admin-gated server route using the service role,
-- which bypasses RLS — so no INSERT policy is needed here.

-- ── seed the two real, verified profiles (idempotent) ────────────────
insert into public.testimonials (id, name, school, placement, quote, avatar_url, linkedin_url, status, source, position)
values
  ('00000000-0000-0000-0000-0000000000a1',
   'Satyam Kumar', 'IMI Delhi PGDM ''27',
   'Ex-TCS | XAT - 99.4 | Mercer Finquest 2025 Winner',
   'MECE caught flaws in my hypothesis-driven thinking that no one else had pointed out. Used it daily for three weeks before placement season.',
   '/testimonials/satyam.jpg', 'https://www.linkedin.com/in/satyam-kumar-8254b4157/', 'published', 'admin', 1),
  ('00000000-0000-0000-0000-0000000000a2',
   'Mohit Kumar Raj', 'TISS HRM & LR ''27',
   'Summer Intern @ Hindustan Coca-Cola Beverages | Ex-Marine Engineer',
   'The 6-dimension scoring is brutally honest — better than mock interviews where peers go easy on you. Pushed me to write tighter syntheses.',
   '/testimonials/mohit.jpg', 'https://www.linkedin.com/in/mohit-kumar-raj-b895b6201/', 'published', 'admin', 2)
on conflict (id) do nothing;

insert into public.team_members (id, name, school, placement, quote, avatar_url, linkedin_url, position)
values
  ('00000000-0000-0000-0000-0000000000b1',
   'Satyam Kumar', 'IMI Delhi PGDM ''27',
   'Ex-TCS | XAT - 99.4 | Mercer Finquest 2025 Winner', '',
   '/testimonials/satyam.jpg', 'https://www.linkedin.com/in/satyam-kumar-8254b4157/', 1),
  ('00000000-0000-0000-0000-0000000000b2',
   'Mohit Kumar Raj', 'TISS HRM & LR ''27',
   'Summer Intern @ Hindustan Coca-Cola Beverages | Ex-Marine Engineer', '',
   '/testimonials/mohit.jpg', 'https://www.linkedin.com/in/mohit-kumar-raj-b895b6201/', 2)
on conflict (id) do nothing;

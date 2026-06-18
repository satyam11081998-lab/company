-- =====================================================================
-- Migration 0011: site-wide feedback & data-flagging.
--
-- One table backs BOTH the global feedback launcher and the contextual
-- "flag this data point" buttons. `category` + `context` jsonb let the admin
-- triage everything in a single queue.
--
-- Additive + idempotent: safe to run twice (create-if-not-exists + drop-policy
-- before create-policy => second run is a no-op).
--
-- NOT a CONTRACTS surface: no other feature reads this table; it only
-- FK-references public.users(id). Does not touch C1 (cases) or C6 (users).
-- =====================================================================

create table if not exists public.feedback_reports (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.users(id) on delete set null,   -- NULL = anonymous
  category      text not null default 'general'
                  check (category in (
                    'data_discrepancy','stale_data','bug','suggestion','content_error','general','other'
                  )),
  message       text not null,
  contact_email text,                          -- optional, for anon follow-up
  path          text,                          -- page path captured client-side
  context       jsonb not null default '{}',   -- { entity_type, entity_id, viewport, ua, ... }
  status        text not null default 'new'
                  check (status in ('new','triaged','in_progress','resolved','dismissed')),
  admin_note    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists feedback_reports_status_idx on public.feedback_reports(status, created_at desc);
create index if not exists feedback_reports_user_idx   on public.feedback_reports(user_id);

alter table public.feedback_reports enable row level security;

-- INSERT: anyone (anon or authed) may file a report.
-- The row's user_id must be NULL (anon) or the caller's own id (authed).
drop policy if exists feedback_insert_any on public.feedback_reports;
create policy feedback_insert_any on public.feedback_reports for insert
  with check (user_id is null or user_id = auth.uid());

-- SELECT: admins only. (Service-role bypasses RLS for server-side admin reads.)
drop policy if exists feedback_select_admin on public.feedback_reports;
create policy feedback_select_admin on public.feedback_reports for select
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin));

-- UPDATE (status / admin_note): admins only.
drop policy if exists feedback_update_admin on public.feedback_reports;
create policy feedback_update_admin on public.feedback_reports for update
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin));

-- No DELETE policy — records are kept; admins 'dismiss' via status.

grant insert on public.feedback_reports to anon, authenticated;

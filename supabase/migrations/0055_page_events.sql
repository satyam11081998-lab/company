-- 0055_page_events.sql — lightweight page + time-on-page analytics.
-- Fed by components/analytics/page-tracker.tsx via POST /api/track (service role).
-- RLS is ON with NO policies: only the server (service role) can read/write it.

create table if not exists public.page_events (
  id           bigint generated always as identity primary key,
  occurred_at  timestamptz not null default now(),
  session_id   text        not null,
  user_id      uuid        references auth.users(id) on delete set null,
  kind         text        not null check (kind in ('view','leave')),
  path         text        not null,
  referrer     text,
  duration_ms  integer,
  device       text,
  ua           text
);

create index if not exists page_events_occurred_idx on public.page_events (occurred_at desc);
create index if not exists page_events_path_idx     on public.page_events (path);
create index if not exists page_events_session_idx  on public.page_events (session_id);
create index if not exists page_events_user_idx     on public.page_events (user_id);

alter table public.page_events enable row level security;

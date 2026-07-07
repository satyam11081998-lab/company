-- 0036_ai_hardening.sql
-- OpenAI cost-incident hardening (2026-07-07). Idempotent; safe to re-run.
-- See ANTIGRAVITY_HANDOFF_openai-cost-hardening.md + MECE_OPENAI_COST_FORENSIC_AUDIT_2026-07-07.md

-- 1. AI usage ledger — one row per billed OpenAI call. Powers: per-user voice/image
--    quotas, the daily-budget kill switch, and the admin cost dashboard.
create table if not exists public.ai_usage_log (
  id                bigint generated always as identity primary key,
  created_at        timestamptz not null default now(),
  user_id           uuid,                      -- null for cron/anon system calls
  endpoint          text not null,             -- e.g. '/transcribe', '/resume/point'
  model             text not null,             -- e.g. 'whisper-1', 'gpt-4o-mini'
  prompt_tokens     int,
  completion_tokens int,
  total_tokens      int,
  audio_minutes     numeric(10,3),             -- whisper only
  est_cost_usd      numeric(10,6),
  latency_ms        int,
  success           boolean not null default true,
  openai_id         text,
  meta              jsonb
);
create index if not exists ai_usage_log_created_at on public.ai_usage_log (created_at);
create index if not exists ai_usage_log_user_day   on public.ai_usage_log (user_id, endpoint, created_at);
alter table public.ai_usage_log enable row level security;  -- service-role writes only; no public policy

-- 2. Cache for Abstract GD briefs (F3) — same topic must never re-bill gpt-4o.
create table if not exists public.abstract_briefs (
  topic_key   text primary key,               -- lower(trim(topic)) with collapsed whitespace
  topic       text not null,
  brief       jsonb not null,
  created_at  timestamptz not null default now()
);
alter table public.abstract_briefs enable row level security;  -- service-role only

-- 3. Run-level marker for the news refresh (F4) — staleness no longer depends on
--    inserts landing, so a dedupe-only refresh doesn't loop all day.
create table if not exists public.news_refresh_log (
  id          bigint generated always as identity primary key,
  ran_at      timestamptz not null default now(),
  source      text not null default 'auto',   -- 'cron' | 'self_heal' | 'auto'
  saved       int not null default 0,
  details     jsonb
);
create index if not exists news_refresh_log_ran_at on public.news_refresh_log (ran_at);

-- 4. One GD brief per headline (F8) — closes the concurrent cache-miss race.
--    Dedupe any existing duplicates first (keep the earliest) so the index can build.
delete from public.gd_briefs a
  using public.gd_briefs b
  where a.headline_id = b.headline_id
    and a.headline_id is not null
    and a.created_at > b.created_at;
create unique index if not exists gd_briefs_headline_unique
  on public.gd_briefs(headline_id)
  where headline_id is not null;

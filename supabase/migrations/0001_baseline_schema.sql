-- =====================================================================
-- MECE — baseline schema (reconstructed 2026-06-04)
-- Source of truth was previously ONLY production Supabase. This file
-- captures the schema the app reads/writes (from lib/types.ts, seed.sql,
-- routes/*, services/*). FULLY IDEMPOTENT and ADDITIVE:
--   * CREATE TABLE IF NOT EXISTS  -> existing prod tables are left untouched
--   * ADD COLUMN IF NOT EXISTS    -> only genuinely-missing columns are added
-- Safe to run against the live DB (fills gaps) AND to bootstrap a fresh env.
-- REVIEW against your prod schema before relying on it as canonical.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- users (mirror of auth.users) ----------
create table if not exists public.users (
  id                      uuid primary key,
  name                    text,
  email                   text not null,
  avatar_url              text,
  points                  int not null default 0,
  created_at              timestamptz not null default now(),
  is_admin                boolean not null default false,
  subscription_tier       text not null default 'free' check (subscription_tier in ('free','lite','pro')),
  subscription_started_at timestamptz,
  subscription_expires_at timestamptz,
  streak_count            int not null default 0,
  streak_last_date        date
);
alter table public.users add column if not exists is_admin boolean not null default false;
alter table public.users add column if not exists subscription_tier text not null default 'free';
alter table public.users add column if not exists subscription_started_at timestamptz;
alter table public.users add column if not exists subscription_expires_at timestamptz;
alter table public.users add column if not exists streak_count int not null default 0;
alter table public.users add column if not exists streak_last_date date;

-- ---------- cases (cases + guesstimates live here) ----------
create table if not exists public.cases (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  type        text not null check (type in ('guesstimate','profitability','market_sizing','growth')),
  difficulty  text not null check (difficulty in ('easy','medium','hard')),
  content     text not null,
  hint        text,
  solution    text,
  code        text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.cases add column if not exists solution text;
alter table public.cases add column if not exists code text;
-- coded guesstimates (G-01..) are unique; generated/daily cases keep code NULL (multiple NULLs allowed)
create unique index if not exists cases_code_unique on public.cases(code);

-- ---------- submissions ----------
create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  case_id       uuid not null references public.cases(id) on delete cascade,
  answer_text   text not null,
  score         int,
  feedback_json jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists submissions_user_created on public.submissions(user_id, created_at desc);

-- ---------- case_attempts ----------
create table if not exists public.case_attempts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  case_id           uuid not null references public.cases(id) on delete cascade,
  submission_id     uuid not null references public.submissions(id) on delete cascade,
  attempt_number    int not null,
  is_first_attempt  boolean not null,
  counted_for_daily boolean not null default false,
  daily_date        date,
  created_at        timestamptz not null default now()
);
create index if not exists case_attempts_user on public.case_attempts(user_id);
create index if not exists case_attempts_user_first on public.case_attempts(user_id, is_first_attempt);
create index if not exists case_attempts_daily on public.case_attempts(daily_date, counted_for_daily);

-- ---------- case_ratings ----------
create table if not exists public.case_ratings (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid not null references public.cases(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  rating        text not null check (rating in ('easier','right','harder')),
  submission_id uuid references public.submissions(id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (case_id, user_id)
);

-- ---------- badges + user_badges ----------
create table if not exists public.badges (
  id            text primary key,
  name          text not null,
  description   text not null,
  icon          text not null,
  category      text not null check (category in ('milestone','streak','mastery','social')),
  rarity        text not null check (rarity in ('common','rare','epic','legendary')),
  points_reward int not null default 0,
  created_at    timestamptz not null default now()
);
create table if not exists public.user_badges (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users(id) on delete cascade,
  badge_id              text not null references public.badges(id) on delete cascade,
  earned_at             timestamptz not null default now(),
  trigger_submission_id uuid references public.submissions(id) on delete set null,
  unique (user_id, badge_id)
);

-- ---------- news_headlines + gd_briefs ----------
create table if not exists public.news_headlines (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  description         text,
  thumbnail_url       text,
  source_url          text not null unique,
  source_name         text not null,
  published_at        timestamptz not null,
  fetched_at          timestamptz not null default now(),
  gd_worthiness_score int,
  keywords            text[] not null default '{}',
  category            text not null,
  is_star             boolean not null default false
);
create table if not exists public.gd_briefs (
  id                uuid primary key default gen_random_uuid(),
  headline_id       uuid references public.news_headlines(id) on delete cascade,
  topic             text,
  summary           text not null,
  gd_type           text,
  likely_questions  text[],
  smart_angles      text[],
  data_points       text[],
  opening_lines     text[],
  counter_arguments text[],
  closing_lines     text[],
  source_url        text,
  -- legacy columns (kept populated for backward compatibility)
  points_for        text[],
  points_against    text[],
  how_to_open       text,
  how_to_close      text,
  created_at        timestamptz not null default now()
);

-- ---------- daily_schedule ----------
create table if not exists public.daily_schedule (
  id                uuid primary key default gen_random_uuid(),
  scheduled_date    date not null unique,
  case_id           uuid references public.cases(id) on delete set null,
  guesstimate_code  text,   -- free text: holds the guesstimate CASE id (no FK)
  brief_headline_id uuid references public.news_headlines(id) on delete set null,
  notes             text,
  created_at        timestamptz not null default now()
);

-- ---------- payments ----------
create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  razorpay_order_id   text not null,
  razorpay_payment_id text,
  razorpay_signature  text,
  tier                text not null check (tier in ('lite','pro')),
  amount_paise        int not null,
  currency            text not null default 'INR',
  status              text not null check (status in ('created','paid','failed','refunded')),
  created_at          timestamptz not null default now(),
  paid_at             timestamptz
);
create index if not exists payments_user on public.payments(user_id);
create index if not exists payments_payment_id on public.payments(razorpay_payment_id);

-- ---------- learn_content (legacy) ----------
create table if not exists public.learn_content (
  id            uuid primary key default gen_random_uuid(),
  case_type     text not null,
  title         text not null,
  body          text not null,
  display_order int not null default 0
);

-- ---------- auth.users -> public.users trigger ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name, avatar_url, points)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

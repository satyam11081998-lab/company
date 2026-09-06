-- Product feedback / testimonials, collected from the in-app prompt shown after
-- a user has completed a few cases. Users insert their own row (RLS below);
-- admins read via the service client.
create table if not exists public.feedback (
  id                bigint generated always as identity primary key,
  user_id           uuid references auth.users(id) on delete set null,
  rating            int,                       -- 1-5 stars
  working_well      text,
  improve           text,
  allow_testimonial boolean not null default false,
  display_name      text,
  created_at        timestamptz not null default now()
);
alter table public.feedback enable row level security;

-- Authenticated users may add their own feedback (and nothing else).
drop policy if exists "feedback insert own" on public.feedback;
create policy "feedback insert own" on public.feedback
  for insert to authenticated
  with check (auth.uid() = user_id);

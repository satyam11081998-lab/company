-- Authenticated READ policies required by lib/daily-server.ts (server-side daily tiles).
-- Idempotent. Run once against Supabase.
alter table public.daily_schedule enable row level security;
alter table public.news_headlines enable row level security;
alter table public.cases enable row level security;

drop policy if exists "daily_schedule readable" on public.daily_schedule;
create policy "daily_schedule readable" on public.daily_schedule for select using (true);

drop policy if exists "news_headlines readable" on public.news_headlines;
create policy "news_headlines readable" on public.news_headlines for select using (true);

drop policy if exists "cases readable" on public.cases;
create policy "cases readable" on public.cases for select using (true);

-- 0003_cheat_sheet.sql — GD Cheat Sheet (Pro). Additive + idempotent (safe to run twice).
create table if not exists public.cheat_sheets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  title       text not null default 'My Cheat Sheet',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists cheat_sheets_user_idx on public.cheat_sheets(user_id);

create table if not exists public.cheat_sheet_items (
  id                 uuid primary key default gen_random_uuid(),
  sheet_id           uuid not null references public.cheat_sheets(id) on delete cascade,
  user_id            uuid not null references public.users(id) on delete cascade,
  source_headline_id uuid references public.news_headlines(id) on delete set null,
  source_topic       text not null default '',  -- snapshot of headline title; survives brief cleanup
  source_kind        text not null default 'data_point'
                       check (source_kind in ('data_point','smart_angle','counter_argument','opening_line','closing_line')),
  content            text not null,
  note               text,
  position           int  not null default 0,
  created_at         timestamptz not null default now()
);
create index if not exists cheat_sheet_items_sheet_idx on public.cheat_sheet_items(sheet_id, position);
create index if not exists cheat_sheet_items_user_idx  on public.cheat_sheet_items(user_id);

alter table public.cheat_sheets      enable row level security;
alter table public.cheat_sheet_items enable row level security;

-- cheat_sheets policies (per-user; INSERT additionally requires pro)
drop policy if exists cheat_sheets_select_own on public.cheat_sheets;
create policy cheat_sheets_select_own on public.cheat_sheets for select using (user_id = auth.uid());
drop policy if exists cheat_sheets_insert_pro on public.cheat_sheets;
create policy cheat_sheets_insert_pro on public.cheat_sheets for insert with check (
  user_id = auth.uid()
  and exists (select 1 from public.users u where u.id = auth.uid() and u.subscription_tier = 'pro')
);
drop policy if exists cheat_sheets_update_own on public.cheat_sheets;
create policy cheat_sheets_update_own on public.cheat_sheets for update using (user_id = auth.uid());
drop policy if exists cheat_sheets_delete_own on public.cheat_sheets;
create policy cheat_sheets_delete_own on public.cheat_sheets for delete using (user_id = auth.uid());

-- cheat_sheet_items policies (per-user; INSERT additionally requires pro)
drop policy if exists cheat_sheet_items_select_own on public.cheat_sheet_items;
create policy cheat_sheet_items_select_own on public.cheat_sheet_items for select using (user_id = auth.uid());
drop policy if exists cheat_sheet_items_insert_pro on public.cheat_sheet_items;
create policy cheat_sheet_items_insert_pro on public.cheat_sheet_items for insert with check (
  user_id = auth.uid()
  and exists (select 1 from public.users u where u.id = auth.uid() and u.subscription_tier = 'pro')
);
drop policy if exists cheat_sheet_items_update_own on public.cheat_sheet_items;
create policy cheat_sheet_items_update_own on public.cheat_sheet_items for update using (user_id = auth.uid());
drop policy if exists cheat_sheet_items_delete_own on public.cheat_sheet_items;
create policy cheat_sheet_items_delete_own on public.cheat_sheet_items for delete using (user_id = auth.uid());

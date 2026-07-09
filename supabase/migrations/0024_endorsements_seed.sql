-- =====================================================================
-- Migration 0024: Ensure the endorsements table exists, then seed mentor
-- endorsements (status='hidden' until the owner adds a photo and publishes).
-- Self-contained + idempotent. Uses dollar-quoted string literals ($ew$...$ew$)
-- so apostrophes never need escaping. Safe to paste/re-run.
-- =====================================================================

create table if not exists public.endorsements (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  role          text not null default '',
  organization  text not null default '',
  credential    text not null default '',
  quote         text not null,
  avatar_url    text,
  linkedin_url  text,
  verified      boolean not null default false,
  status        text not null default 'published'
                  check (status in ('published','hidden')),
  position      int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists endorsements_status_idx
  on public.endorsements(status, position, created_at desc);

alter table public.endorsements enable row level security;

drop policy if exists endorsements_select_published on public.endorsements;
create policy endorsements_select_published on public.endorsements for select
  using (status = 'published');

drop policy if exists endorsements_select_admin on public.endorsements;
create policy endorsements_select_admin on public.endorsements for select
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin));

-- ── Seed (hidden; idempotent by name) ────────────────────────────────
insert into public.endorsements (name, role, organization, credential, quote, linkedin_url, verified, status, position)
select $ew$Kadambini Sachan$ew$, $ew$Strategy & Consulting$ew$, $ew$Accenture$ew$,
  $ew$IIM Lucknow '22 · 10+ yrs in consulting$ew$,
  $ew$I have spent years in consulting, and the thing that still sets strong candidates apart is how cleanly they break a problem down. That is exactly what MECE drills into you. I have pointed a few juniors to it and you can see the structure show up in how they think, not just how they answer.$ew$,
  null, true, $ew$hidden$ew$, 0
where not exists (select 1 from public.endorsements where name = $ew$Kadambini Sachan$ew$);

insert into public.endorsements (name, role, organization, credential, quote, linkedin_url, verified, status, position)
select $ew$Rahul Jayaswal$ew$, $ew$Senior Manager, Strategic Partnerships$ew$, $ew$Hexaware$ew$,
  $ew$Ex-PwC · IIM Mumbai · 12+ yrs$ew$,
  $ew$Having sat on the interviewer side plenty of times, I can usually tell when someone has actually practised structuring versus when they are improvising on the spot. MECE builds the first kind. The six-dimension feedback is close to how we would critique a case in a real review.$ew$,
  null, true, $ew$hidden$ew$, 1
where not exists (select 1 from public.endorsements where name = $ew$Rahul Jayaswal$ew$);

insert into public.endorsements (name, role, organization, credential, quote, linkedin_url, verified, status, position)
select $ew$Saket Srivastava$ew$, $ew$Rewards HR$ew$, $ew$Shell$ew$,
  $ew$TISS HRM & LR '25 · Ex-ITC Limited$ew$,
  $ew$Coming from an HR background I used to think clean case structure was only a consulting thing. MECE changed that for me. The way it makes you organise your thinking helped me in HR case rounds and honestly in everyday problem solving at work too.$ew$,
  $ew$https://www.linkedin.com/in/saket-srivastava/$ew$, true, $ew$hidden$ew$, 2
where not exists (select 1 from public.endorsements where name = $ew$Saket Srivastava$ew$);

insert into public.endorsements (name, role, organization, credential, quote, linkedin_url, verified, status, position)
select $ew$Sanket Bansod$ew$, $ew$Consulting, HR & Tech$ew$, $ew$TISS HRM & LR$ew$,
  $ew$2x Merit Scholar · 7x Intern (Citi, Dr. Reddy's, Sandoz, Tata, UPL) · NIT CSE '23$ew$,
  $ew$Across my internships the one habit that kept paying off was staying structured when the problem got messy. MECE is the first place I found that actually trains that, with feedback that does not sugarcoat. I genuinely wish I had it before my first case interview.$ew$,
  $ew$https://www.linkedin.com/in/b-sanket/$ew$, true, $ew$hidden$ew$, 3
where not exists (select 1 from public.endorsements where name = $ew$Sanket Bansod$ew$);

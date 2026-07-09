-- =====================================================================
-- Migration 0025: Seed peer testimonials as status='pending' (visible in
-- /admin/testimonials; owner adds a photo and publishes per person).
-- Self-contained + idempotent. Dollar-quoted literals ($ew$...$ew$) so
-- apostrophes never need escaping. Safe to paste/re-run.
-- =====================================================================

create table if not exists public.testimonials (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  school          text not null default '',
  placement       text not null default '',
  quote           text not null,
  avatar_url      text,
  linkedin_url    text,
  status          text not null default 'published'
                    check (status in ('pending','published','rejected')),
  source          text not null default 'admin'
                    check (source in ('admin','user')),
  submitted_email text,
  position        int  not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists testimonials_status_idx on public.testimonials(status, position, created_at desc);

alter table public.testimonials enable row level security;

drop policy if exists testimonials_select_published on public.testimonials;
create policy testimonials_select_published on public.testimonials for select
  using (status = 'published');

drop policy if exists testimonials_insert_submission on public.testimonials;
create policy testimonials_insert_submission on public.testimonials for insert
  with check (status = 'pending' and source = 'user');

drop policy if exists testimonials_select_admin on public.testimonials;
create policy testimonials_select_admin on public.testimonials for select
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin));

grant insert on public.testimonials to anon, authenticated;

insert into storage.buckets (id, name, public) values ('testimonials', 'testimonials', true)
on conflict (id) do nothing;

drop policy if exists testimonials_bucket_public_read on storage.objects;
create policy testimonials_bucket_public_read on storage.objects for select
  using (bucket_id = 'testimonials');

-- ── Seed peers (pending; idempotent by name) ─────────────────────────
insert into public.testimonials (name, school, placement, quote, linkedin_url, status, source, position)
select $ew$Anahita Bansal$ew$, $ew$IIM Indore PGP '27$ew$, $ew$Intern @ PwC US · CFA L1 · Ex-EY$ew$,
  $ew$I prepped for my finance interviews almost entirely on here. The honest scoring kept showing me where my synthesis was weak until I finally fixed it, and I walked into my PwC process a lot calmer than I expected.$ew$,
  $ew$https://www.linkedin.com/in/anahita-bansal-897537221/$ew$, $ew$pending$ew$, $ew$admin$ew$, 10
where not exists (select 1 from public.testimonials where name = $ew$Anahita Bansal$ew$);

insert into public.testimonials (name, school, placement, quote, linkedin_url, status, source, position)
select $ew$Anubhav Anurag$ew$, $ew$DMS IIT Delhi MBA '27$ew$, $ew$Summer Intern, Jindal Steel · Ex-BA, Enverus$ew$,
  $ew$Coming from an engineering and analyst background, I used to overcomplicate every case. The frameworks here taught me when to keep it simple, and that one shift is what got me through my summers process.$ew$,
  null, $ew$pending$ew$, $ew$admin$ew$, 11
where not exists (select 1 from public.testimonials where name = $ew$Anubhav Anurag$ew$);

insert into public.testimonials (name, school, placement, quote, linkedin_url, status, source, position)
select $ew$Akansh Shankar$ew$, $ew$IIM Indore '27$ew$, $ew$Ex-RIL GET (PPO) · NIT Hamirpur Mech$ew$,
  $ew$My background is core engineering, so case rounds scared me at first. Doing one structured case a day for a few weeks made them feel routine. The guesstimate walkthroughs were the part that helped me the most.$ew$,
  $ew$https://www.linkedin.com/in/akansh-shankar-630588227/$ew$, $ew$pending$ew$, $ew$admin$ew$, 12
where not exists (select 1 from public.testimonials where name = $ew$Akansh Shankar$ew$);

insert into public.testimonials (name, school, placement, quote, linkedin_url, status, source, position)
select $ew$Richa Singh$ew$, $ew$XIMB MBA-HRM '25-27$ew$, $ew$Summer Intern @ Atomberg$ew$,
  $ew$The GD briefs were a lifesaver on results day. I walked into a group discussion with two or three angles nobody else had thought of, and for an HR role that ability to frame a discussion mattered a lot.$ew$,
  null, $ew$pending$ew$, $ew$admin$ew$, 13
where not exists (select 1 from public.testimonials where name = $ew$Richa Singh$ew$);

insert into public.testimonials (name, school, placement, quote, linkedin_url, status, source, position)
select $ew$Sumit Rathore$ew$, $ew$IIM Indore '27$ew$, $ew$Summer Intern @ TCS · Software Developer$ew$,
  $ew$As a developer moving into management, I had to learn to think in business terms. The casebook actually explains when not to use a framework, which is the part most resources skip, and it changed how I approach problems.$ew$,
  null, $ew$pending$ew$, $ew$admin$ew$, 14
where not exists (select 1 from public.testimonials where name = $ew$Sumit Rathore$ew$);

insert into public.testimonials (name, school, placement, quote, linkedin_url, status, source, position)
select $ew$Khushi Choudhary$ew$, $ew$IIM Indore '27$ew$, $ew$Intern @ Hinduja Group · SXC '25$ew$,
  $ew$I was strong on the creative side but loose on structure. Practising here tightened how I argue a point, which helped in both my marketing case and the interview that followed it.$ew$,
  null, $ew$pending$ew$, $ew$admin$ew$, 15
where not exists (select 1 from public.testimonials where name = $ew$Khushi Choudhary$ew$);

insert into public.testimonials (name, school, placement, quote, linkedin_url, status, source, position)
select $ew$Yash Kumar$ew$, $ew$IIM Indore '27$ew$, $ew$CFA Level 1 · FRM Part 1$ew$,
  $ew$The daily practice gave me a routine in a season where everything felt chaotic. Getting scored on six dimensions instead of a vague good job is what actually pushed me to improve week over week.$ew$,
  null, $ew$pending$ew$, $ew$admin$ew$, 16
where not exists (select 1 from public.testimonials where name = $ew$Yash Kumar$ew$);

insert into public.testimonials (name, school, placement, quote, linkedin_url, status, source, position)
select $ew$Siddharth Sahoo$ew$, $ew$IIM Raipur PGP '27$ew$, $ew$Ex-Software Engineer @ Zensar · VIT '22$ew$,
  $ew$Switching from software to management, I had no idea how to structure a case. The worked examples here were the bridge. I read one most mornings and the patterns slowly became second nature.$ew$,
  null, $ew$pending$ew$, $ew$admin$ew$, 17
where not exists (select 1 from public.testimonials where name = $ew$Siddharth Sahoo$ew$);

insert into public.testimonials (name, school, placement, quote, linkedin_url, status, source, position)
select $ew$Alok Singh$ew$, $ew$IIM Shillong PGP '27$ew$, $ew$Ex-Merchant Navy (TORM)$ew$,
  $ew$After years at sea I was rusty on analytical interviews. The feedback here was blunt in the best way and got me back in shape before placements. The consistency of practising daily is what really did it.$ew$,
  null, $ew$pending$ew$, $ew$admin$ew$, 18
where not exists (select 1 from public.testimonials where name = $ew$Alok Singh$ew$);

insert into public.testimonials (name, school, placement, quote, linkedin_url, status, source, position)
select $ew$Prithviraj Panda$ew$, $ew$IIM Indore '27$ew$, $ew$CAT 99.75%ile · Summer Intern @ UPL$ew$,
  $ew$Guesstimates used to be the part I dreaded. The walkthroughs showed me how to anchor on real numbers instead of guessing, and now I actually enjoy them. That confidence carried straight into my interviews.$ew$,
  null, $ew$pending$ew$, $ew$admin$ew$, 19
where not exists (select 1 from public.testimonials where name = $ew$Prithviraj Panda$ew$);

insert into public.testimonials (name, school, placement, quote, linkedin_url, status, source, position)
select $ew$Priyanka Yadav$ew$, $ew$IIM Indore '27$ew$, $ew$Hansraj College '25$ew$,
  $ew$I am not naturally a disciplined person, so the daily case and guesstimate habit is what kept me going. By the time interviews came around, structuring felt automatic rather than forced.$ew$,
  null, $ew$pending$ew$, $ew$admin$ew$, 20
where not exists (select 1 from public.testimonials where name = $ew$Priyanka Yadav$ew$);

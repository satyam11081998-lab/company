-- =====================================================================
-- Migration 0005: User onboarding + profile + college verification
-- Owner directive 2026-06-08
--
-- Adds the data the dashboard's onboarding flow + profile page need.
-- All column adds are `if not exists`, RLS is scoped to `auth.uid() = id`,
-- and the colleges seed uses `on conflict (slug) do update` so this whole
-- file is idempotent — safe to re-run during dev.
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- 1. Extend `users` with onboarding + profile fields.
-- ─────────────────────────────────────────────────────────────────────
-- Note: `name` already exists (used as display name today). We add a
-- separate `full_name` so we can keep the casual display name editable
-- without losing the formal one collected at onboarding.

alter table public.users
  add column if not exists full_name              text,
  add column if not exists college_id             uuid,
  add column if not exists college_other          text,
  add column if not exists batch_year             int,
  add column if not exists placement_focus        text
    check (placement_focus is null or placement_focus in ('summer','final','both')),
  add column if not exists college_email          text,
  add column if not exists college_email_verified_at timestamptz,
  add column if not exists onboarding_completed_at timestamptz,
  -- Optional / analytics — never required at onboarding.
  add column if not exists linkedin_url           text,
  add column if not exists referral_source        text,
  add column if not exists weekly_hours_target    int,
  add column if not exists goal_text              text,
  -- Avatar URL (Supabase Storage public URL).
  add column if not exists avatar_uploaded_at     timestamptz;

create index if not exists users_college_idx           on public.users(college_id);
create index if not exists users_onboarded_idx         on public.users(onboarding_completed_at)
  where onboarding_completed_at is null;
create unique index if not exists users_college_email_unique
  on public.users(lower(college_email))
  where college_email is not null;

-- ─────────────────────────────────────────────────────────────────────
-- 2. `colleges` taxonomy table.
-- ─────────────────────────────────────────────────────────────────────
-- `tier` is a soft signal: 1 = top IIMs + ISB + FMS / XLRI, 2 = strong
-- non-IIM tier, 3 = the rest. `type` lets us bucket IIM vs. non-IIM in
-- analytics without parsing names.

create table if not exists public.colleges (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,                 -- stable URL/key, e.g. 'iim-a'
  name         text not null,                        -- 'Indian Institute of Management Ahmedabad'
  short_name   text,                                 -- 'IIM Ahmedabad'
  type         text not null check (type in ('iim','mba','engineering','other')),
  tier         int  not null check (tier in (1,2,3)),
  city         text,
  state_code   text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists colleges_tier_idx on public.colleges(tier) where is_active;
create index if not exists colleges_type_idx on public.colleges(type) where is_active;

-- Now wire the FK from users.college_id → colleges.id. NOT VALID so it
-- doesn't scan existing rows (all college_id will be NULL today anyway).
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'users_college_fk'
  ) then
    alter table public.users
      add constraint users_college_fk
      foreign key (college_id) references public.colleges(id) on delete set null
      not valid;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────
-- 3. `college_email_verifications` — pending token table.
-- ─────────────────────────────────────────────────────────────────────
-- One row per outstanding verification attempt. We store the SHA-256 hash
-- of the token (the raw token only exists in the email link); checking
-- on click means hashing the incoming token and comparing. Tokens expire
-- after 24h. Successful verification copies college_email +
-- college_email_verified_at onto users and deletes the row.

create table if not exists public.college_email_verifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  email        text not null,
  token_hash   text not null,                        -- sha256 hex of raw token
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now()
);
create index if not exists cev_user_idx       on public.college_email_verifications(user_id);
create index if not exists cev_token_idx      on public.college_email_verifications(token_hash);
create index if not exists cev_expiry_idx     on public.college_email_verifications(expires_at);

-- ─────────────────────────────────────────────────────────────────────
-- 4. RLS — every new piece is read/write only by the user it belongs to.
-- ─────────────────────────────────────────────────────────────────────

alter table public.colleges enable row level security;
drop policy if exists "colleges public read" on public.colleges;
create policy "colleges public read"
  on public.colleges for select
  using (true);                                       -- taxonomy is public

alter table public.college_email_verifications enable row level security;
drop policy if exists "cev owner read"  on public.college_email_verifications;
drop policy if exists "cev owner write" on public.college_email_verifications;
create policy "cev owner read"
  on public.college_email_verifications for select
  using (auth.uid() = user_id);
create policy "cev owner write"
  on public.college_email_verifications for insert
  with check (auth.uid() = user_id);
-- Service role bypass for the verify endpoint (it runs from the API
-- route with the service key, no user session).
-- (Service role bypasses RLS by default; no explicit policy needed.)

-- users table already has RLS — make sure the new columns are writable.
-- (Assumes existing "users owner write" policy covers `update`. If your
-- policy was tighter, expand it here.)

-- ─────────────────────────────────────────────────────────────────────
-- 5. Seed colleges. ~80 rows: 20 IIMs + ~60 top non-IIM MBA colleges.
--     `on conflict (slug) do update` keeps the seed idempotent so
--     re-running this file just refreshes names/tiers.
-- ─────────────────────────────────────────────────────────────────────

insert into public.colleges (slug, name, short_name, type, tier, city, state_code) values
  -- ─── IIMs (all 20) ────────────────────────────────────────────────
  ('iim-ahmedabad',  'Indian Institute of Management Ahmedabad',  'IIM Ahmedabad',  'iim', 1, 'Ahmedabad',   'GJ'),
  ('iim-bangalore',  'Indian Institute of Management Bangalore',  'IIM Bangalore',  'iim', 1, 'Bangalore',   'KA'),
  ('iim-calcutta',   'Indian Institute of Management Calcutta',   'IIM Calcutta',   'iim', 1, 'Kolkata',     'WB'),
  ('iim-lucknow',    'Indian Institute of Management Lucknow',    'IIM Lucknow',    'iim', 1, 'Lucknow',     'UP'),
  ('iim-kozhikode',  'Indian Institute of Management Kozhikode',  'IIM Kozhikode',  'iim', 1, 'Kozhikode',   'KL'),
  ('iim-indore',     'Indian Institute of Management Indore',     'IIM Indore',     'iim', 1, 'Indore',      'MP'),
  ('iim-shillong',   'Indian Institute of Management Shillong',   'IIM Shillong',   'iim', 2, 'Shillong',    'ML'),
  ('iim-rohtak',     'Indian Institute of Management Rohtak',     'IIM Rohtak',     'iim', 2, 'Rohtak',      'HR'),
  ('iim-udaipur',    'Indian Institute of Management Udaipur',    'IIM Udaipur',    'iim', 2, 'Udaipur',     'RJ'),
  ('iim-trichy',     'Indian Institute of Management Tiruchirappalli', 'IIM Trichy', 'iim', 2, 'Tiruchirappalli', 'TN'),
  ('iim-ranchi',     'Indian Institute of Management Ranchi',     'IIM Ranchi',     'iim', 2, 'Ranchi',      'JH'),
  ('iim-raipur',     'Indian Institute of Management Raipur',     'IIM Raipur',     'iim', 2, 'Raipur',      'CG'),
  ('iim-kashipur',   'Indian Institute of Management Kashipur',   'IIM Kashipur',   'iim', 2, 'Kashipur',    'UK'),
  ('iim-amritsar',   'Indian Institute of Management Amritsar',   'IIM Amritsar',   'iim', 2, 'Amritsar',    'PB'),
  ('iim-bodh-gaya',  'Indian Institute of Management Bodh Gaya',  'IIM Bodh Gaya',  'iim', 2, 'Bodh Gaya',   'BR'),
  ('iim-jammu',      'Indian Institute of Management Jammu',      'IIM Jammu',      'iim', 2, 'Jammu',       'JK'),
  ('iim-nagpur',     'Indian Institute of Management Nagpur',     'IIM Nagpur',     'iim', 2, 'Nagpur',      'MH'),
  ('iim-sambalpur',  'Indian Institute of Management Sambalpur',  'IIM Sambalpur',  'iim', 2, 'Sambalpur',   'OR'),
  ('iim-sirmaur',    'Indian Institute of Management Sirmaur',    'IIM Sirmaur',    'iim', 2, 'Sirmaur',     'HP'),
  ('iim-visakhapatnam', 'Indian Institute of Management Visakhapatnam', 'IIM Vizag', 'iim', 2, 'Visakhapatnam', 'AP'),

  -- ─── Tier 1 non-IIM ───────────────────────────────────────────────
  ('isb-hyderabad',  'Indian School of Business, Hyderabad',      'ISB Hyderabad',  'mba', 1, 'Hyderabad',   'TG'),
  ('isb-mohali',     'Indian School of Business, Mohali',         'ISB Mohali',     'mba', 1, 'Mohali',      'PB'),
  ('fms-delhi',      'Faculty of Management Studies, Delhi University', 'FMS Delhi','mba', 1, 'New Delhi', 'DL'),
  ('xlri-jamshedpur','Xavier School of Management',               'XLRI Jamshedpur','mba', 1, 'Jamshedpur',  'JH'),
  ('mdi-gurgaon',    'Management Development Institute',           'MDI Gurgaon',    'mba', 1, 'Gurgaon',     'HR'),
  ('spjimr-mumbai',  'S. P. Jain Institute of Management & Research', 'SPJIMR',     'mba', 1, 'Mumbai',      'MH'),
  ('iift-delhi',     'Indian Institute of Foreign Trade, Delhi',  'IIFT Delhi',     'mba', 1, 'New Delhi',   'DL'),
  ('iift-kolkata',   'Indian Institute of Foreign Trade, Kolkata','IIFT Kolkata',   'mba', 1, 'Kolkata',     'WB'),
  ('jbims-mumbai',   'Jamnalal Bajaj Institute of Management Studies', 'JBIMS',     'mba', 1, 'Mumbai',      'MH'),
  ('nitie-mumbai',   'National Institute of Industrial Engineering', 'NITIE Mumbai','mba', 1, 'Mumbai',      'MH'),

  -- ─── Tier 2 non-IIM ───────────────────────────────────────────────
  ('nmims-mumbai',   'Narsee Monjee Institute of Management Studies', 'NMIMS Mumbai','mba', 2, 'Mumbai',     'MH'),
  ('imt-ghaziabad',  'Institute of Management Technology',         'IMT Ghaziabad',  'mba', 2, 'Ghaziabad',   'UP'),
  ('imi-delhi',      'International Management Institute, Delhi', 'IMI Delhi',      'mba', 2, 'New Delhi',   'DL'),
  ('sibm-pune',      'Symbiosis Institute of Business Management','SIBM Pune',      'mba', 2, 'Pune',        'MH'),
  ('siib-pune',      'Symbiosis Institute of International Business', 'SIIB Pune','mba', 2, 'Pune',         'MH'),
  ('scmhrd-pune',    'Symbiosis Centre for Management & HRD',     'SCMHRD',         'mba', 2, 'Pune',        'MH'),
  ('tiss-mumbai',    'Tata Institute of Social Sciences',         'TISS Mumbai',    'mba', 2, 'Mumbai',      'MH'),
  ('iim-cap',        'IIM CAP (Common Admissions Process applicant)', 'IIM CAP',    'mba', 2, '—',           null),
  ('great-lakes-chennai', 'Great Lakes Institute of Management',  'Great Lakes',    'mba', 2, 'Chennai',     'TN'),
  ('xim-bhubaneswar','XIM University, Bhubaneswar',               'XIM Bhubaneswar','mba', 2, 'Bhubaneswar', 'OR'),
  ('xim-jabalpur',   'Xavier Institute of Management Jabalpur',   'XIM Jabalpur',   'mba', 2, 'Jabalpur',    'MP'),
  ('xime-bangalore', 'Xavier Institute of Management & Entrepreneurship', 'XIME Bangalore', 'mba', 2, 'Bangalore', 'KA'),
  ('lbsim-delhi',    'Lal Bahadur Shastri Institute of Management', 'LBSIM Delhi',  'mba', 2, 'New Delhi',   'DL'),
  ('imnu-nirma',     'Institute of Management, Nirma University', 'Nirma Ahmedabad','mba', 2, 'Ahmedabad',   'GJ'),
  ('iim-ddu-iift',   'DA-IICT Gandhinagar (MBA-IT)',              'DA-IICT',        'mba', 2, 'Gandhinagar', 'GJ'),
  ('iim-mip',        'MICA (Mudra Institute of Communications)',  'MICA Ahmedabad', 'mba', 2, 'Ahmedabad',   'GJ'),
  ('iim-ndim',       'New Delhi Institute of Management',         'NDIM Delhi',     'mba', 3, 'New Delhi',   'DL'),
  ('iim-fortune',    'Fortune Institute of International Business','FIIB Delhi',    'mba', 3, 'New Delhi',   'DL'),
  ('iim-aimi',       'Asian Institute of Management & Research',  'AIMR',           'mba', 3, 'Mumbai',      'MH'),
  ('iim-amity',      'Amity Business School',                     'Amity Noida',    'mba', 3, 'Noida',       'UP'),
  ('iim-bims',       'Bharati Vidyapeeth Institute of Management', 'BVIMR',         'mba', 3, 'Pune',        'MH'),
  ('iim-chitkara',   'Chitkara Business School',                  'Chitkara',       'mba', 3, 'Chandigarh',  'CH'),
  ('iim-lpu',        'Lovely Professional University',            'LPU Mittal SoB', 'mba', 3, 'Phagwara',    'PB'),
  ('iim-galgotias',  'Galgotias University',                      'Galgotias',      'mba', 3, 'Greater Noida', 'UP'),
  ('iim-ip',         'IP University, Delhi',                      'IPU Delhi',      'mba', 3, 'New Delhi',   'DL'),
  ('iim-bharti',     'Bharati Vidyapeeth',                        'BVP Delhi',      'mba', 3, 'New Delhi',   'DL'),

  -- ─── Engineering schools with strong management interest ─────────
  ('iit-bombay-sjmsom', 'IIT Bombay - Shailesh J. Mehta School of Management', 'SJMSOM Bombay', 'engineering', 1, 'Mumbai', 'MH'),
  ('iit-delhi-dms',  'IIT Delhi - Department of Management Studies', 'DMS IIT Delhi','engineering', 1, 'New Delhi', 'DL'),
  ('iit-kharagpur-vgsom','IIT Kharagpur - Vinod Gupta School of Management','VGSOM','engineering', 1, 'Kharagpur', 'WB'),
  ('iit-madras-dom', 'IIT Madras - Department of Management Studies', 'DOMS IIT Madras', 'engineering', 1, 'Chennai', 'TN'),
  ('iit-kanpur-dom', 'IIT Kanpur - Department of Industrial & Management Engineering', 'IME IIT Kanpur', 'engineering', 1, 'Kanpur', 'UP'),
  ('iit-roorkee-dom','IIT Roorkee - Department of Management Studies', 'DoMS IIT Roorkee', 'engineering', 1, 'Roorkee', 'UK'),
  ('iit-bhu',        'IIT (BHU) Varanasi',                        'IIT BHU',        'engineering', 1, 'Varanasi',    'UP'),
  ('iit-hyderabad',  'IIT Hyderabad',                             'IIT Hyderabad',  'engineering', 1, 'Hyderabad',   'TG'),
  ('iit-guwahati',   'IIT Guwahati',                              'IIT Guwahati',   'engineering', 1, 'Guwahati',    'AS'),
  ('nit-trichy',     'NIT Tiruchirappalli',                       'NIT Trichy',     'engineering', 2, 'Tiruchirappalli', 'TN'),
  ('bits-pilani',    'BITS Pilani',                               'BITS Pilani',    'engineering', 2, 'Pilani',      'RJ'),
  ('vit-vellore',    'VIT Vellore',                               'VIT Vellore',    'engineering', 3, 'Vellore',     'TN'),

  -- ─── Universities / liberal arts ─────────────────────────────────
  ('du-srcc',        'Shri Ram College of Commerce, Delhi University', 'SRCC Delhi','other', 1, 'New Delhi', 'DL'),
  ('du-hindu',       'Hindu College, Delhi University',           'Hindu Delhi',    'other', 2, 'New Delhi',   'DL'),
  ('du-stxavier',    'St. Xavier''s College, Mumbai',             'St. Xavier''s Mumbai','other', 2, 'Mumbai', 'MH'),
  ('du-stephen',     'St. Stephen''s College, Delhi',             'St. Stephen''s', 'other', 1, 'New Delhi',   'DL'),
  ('ashoka-univ',    'Ashoka University',                         'Ashoka',         'other', 1, 'Sonipat',     'HR'),
  ('iisc-bangalore', 'Indian Institute of Science',               'IISc Bangalore', 'other', 1, 'Bangalore',   'KA'),
  ('iiit-bangalore', 'IIIT Bangalore',                            'IIIT Bangalore', 'engineering', 2, 'Bangalore', 'KA')

on conflict (slug) do update set
  name        = excluded.name,
  short_name  = excluded.short_name,
  type        = excluded.type,
  tier        = excluded.tier,
  city        = excluded.city,
  state_code  = excluded.state_code;

-- ─────────────────────────────────────────────────────────────────────
-- 6. Storage bucket for avatars — must be created via Supabase dashboard
--    OR via SQL (works in newer Supabase). Idempotent.
-- ─────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Policies: any logged-in user can upload to a path starting with their
-- user_id; anyone can read (avatars are public on the profile page).
do $$
begin
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='avatars upload by owner') then
    create policy "avatars upload by owner"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='avatars update by owner') then
    create policy "avatars update by owner"
      on storage.objects for update to authenticated
      using (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='avatars delete by owner') then
    create policy "avatars delete by owner"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
  if not exists (select 1 from pg_policies where tablename='objects' and policyname='avatars public read') then
    create policy "avatars public read"
      on storage.objects for select to public
      using (bucket_id = 'avatars');
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────
-- Sanity counts (uncomment after running):
-- select count(*) as colleges from public.colleges;
-- select column_name from information_schema.columns
--  where table_schema='public' and table_name='users'
--  order by ordinal_position;
-- ─────────────────────────────────────────────────────────────────────

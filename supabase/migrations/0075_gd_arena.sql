-- Live moderated Group Discussions ("GD Arena").
-- Idempotent: safe to run more than once.
--
-- THE TWO RULES THIS SCHEMA EXISTS TO ENFORCE (owner, 2026-10-29):
--
--  1. BANDING IS INTERNAL. A candidate is never told which band their college is in and never
--     sees a session they cannot join. The RLS policy below means a candidate's own query
--     returns ONLY the sessions for their own band, so even a hand-rolled PostgREST call
--     cannot enumerate the rest. Never select the band into a client payload, and never put
--     the word "tier" in the UI.
--  2. A COLLEGE EMAIL IS MANDATORY. Personal domains can never qualify (seeded blocked below),
--     the domain must be approved by an admin before anyone from it can book, and the address
--     must actually be verified (`users.college_email_verified_at`).
--
-- The band is NOT stored again here. `colleges.tier` already exists, was researched rather than
-- taken from NIRF (migration 0020 documents the methodology) and is seeded. Duplicating it
-- would guarantee the two copies disagree within a month.
--
-- Video: a Google Meet link per session, opened in a new tab (Meet sends X-Frame-Options and
-- cannot be embedded). Recording and transcript land in the host Workspace account's Drive and
-- are pulled back with the Google Drive integration the Deck Vault already uses (contract C8).
-- Meet recording and transcription need Workspace Business Standard or above.

-- ---------------------------------------------------------------- approved college domains
create table if not exists gd_college_domains (
  id           uuid primary key default gen_random_uuid(),
  domain       text not null unique,                 -- 'iima.ac.in', lowercase, no '@'
  college_id   uuid references colleges(id) on delete set null,   -- band comes from colleges.tier
  approved     boolean not null default false,       -- admin gate; false on purpose
  blocked      boolean not null default false,       -- personal/free providers, permanently out
  approved_by  uuid references users(id) on delete set null,
  approved_at  timestamptz,
  note         text,
  created_at   timestamptz default now()
);
create index if not exists idx_gd_domains_live on gd_college_domains(domain) where approved and not blocked;

-- Free/personal providers can never be a "college email". Seeded as blocked so they cannot be
-- approved by accident from the admin console.
insert into gd_college_domains (domain, approved, blocked, note) values
  ('gmail.com',false,true,'personal'), ('googlemail.com',false,true,'personal'),
  ('outlook.com',false,true,'personal'), ('hotmail.com',false,true,'personal'),
  ('live.com',false,true,'personal'),    ('yahoo.com',false,true,'personal'),
  ('yahoo.in',false,true,'personal'),    ('rediffmail.com',false,true,'personal'),
  ('proton.me',false,true,'personal'),   ('protonmail.com',false,true,'personal'),
  ('icloud.com',false,true,'personal'),  ('zoho.com',false,true,'personal'),
  ('aol.com',false,true,'personal'),     ('gmx.com',false,true,'personal')
on conflict (domain) do nothing;

-- ---------------------------------------------------------------- sessions
create table if not exists gd_slots (
  id              uuid primary key default gen_random_uuid(),
  starts_at       timestamptz not null,
  duration_min    smallint not null default 20 check (duration_min between 10 and 60),
  -- Which band may see and book this. Mirrors colleges.tier (1..3 today, 4 reserved).
  tier            smallint not null check (tier between 1 and 4),
  seats_min       smallint not null default 5 check (seats_min >= 2),
  seats_max       smallint not null default 8 check (seats_max >= seats_min),
  price_inr       integer  not null default 400 check (price_inr >= 0),
  topic           text,                               -- withheld until the session starts
  moderator_id    uuid references users(id) on delete set null,
  -- open: taking bookings · confirmed: hit seats_min, it is running · cancelled: under-filled
  -- at the cutoff, everyone refunded · done: finished, artefacts attached
  status          text not null default 'open'
                  check (status in ('open','confirmed','cancelled','done')),
  -- Revealed to a candidate ONLY once they have paid AND consented. Never in a list payload.
  meet_url        text,
  recording_drive_id   text,                          -- Drive file id, fetched via C8
  transcript_drive_id  text,
  created_at      timestamptz default now()
);
create index if not exists idx_gd_slots_bookable on gd_slots(tier, starts_at)
  where status in ('open','confirmed');

-- ---------------------------------------------------------------- bookings
create table if not exists gd_bookings (
  id          uuid primary key default gen_random_uuid(),
  slot_id     uuid not null references gd_slots(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  payment_id  uuid references payments(id) on delete set null,
  status      text not null default 'booked'
              check (status in ('booked','attended','no_show','refunded','cancelled')),
  -- DPDP: consent is explicit and per session, taken twice - once at payment, once again in
  -- the dialog immediately before joining. No consent timestamp, no Meet link, no recording.
  consent_paid_at     timestamptz,
  consent_join_at     timestamptz,
  score         int,
  feedback_json jsonb,
  created_at    timestamptz default now(),
  unique (slot_id, user_id)                           -- one seat per person per session
);
create index if not exists idx_gd_bookings_user on gd_bookings(user_id, created_at desc);
create index if not exists idx_gd_bookings_slot on gd_bookings(slot_id) where status in ('booked','attended');

-- ---------------------------------------------------------------- RLS
alter table gd_college_domains enable row level security;
alter table gd_slots           enable row level security;
alter table gd_bookings        enable row level security;

-- No policy on gd_college_domains: service role only. A candidate learns their college is
-- recognised by being able to book, never by reading a row that grades it.

-- A candidate sees ONLY the bookable sessions for their own band, and only once their college
-- email is verified AND its domain is approved. Rule 1 lives here, in the database, rather than
-- in a React component - a direct PostgREST call cannot enumerate another band's sessions.
drop policy if exists gd_slots_own_band on gd_slots;
create policy gd_slots_own_band on gd_slots
  for select to authenticated
  using (
    status in ('open','confirmed')
    and tier = (
      select c.tier
        from users u
        join gd_college_domains d
          on d.domain = lower(split_part(u.college_email, '@', 2))
         and d.approved and not d.blocked
        join colleges c
          on c.id = coalesce(d.college_id, u.college_id)
       where u.id = auth.uid()
         and u.college_email is not null
         and u.college_email_verified_at is not null
       limit 1
    )
  );

drop policy if exists gd_bookings_own on gd_bookings;
create policy gd_bookings_own on gd_bookings
  for select to authenticated
  using (user_id = auth.uid());

-- Writes are service-role only. Seat counting, the seats_max check and the payment have to
-- happen in one server-side transaction or two people take the last seat at the same moment.
-- The Meet link is served by a route that re-checks payment and both consents - never by
-- selecting gd_slots.meet_url into a page payload.

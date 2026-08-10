-- 0046_certificates.sql
-- Live-project completion certificates: issuance record + PUBLIC verification.
--
-- Run AFTER 0041..0045.
--
-- ── Security shape (read this before changing anything) ───────────────────────
--
-- public.certificates            RLS on. No grants to anon or authenticated at
--                                all. Only service_role (the admin API routes)
--                                touches it. The admin RLS policy is kept as
--                                defence in depth in case a later migration
--                                restores table grants.
--
-- public.verify_certificate(text)  SECURITY DEFINER, granted to anon. EXACT
--                                match on cert_id, returns at most one row, and
--                                returns ONLY the fields printed on the paper.
--
-- There is deliberately NO public view and NO anon table grant. A view granted
-- to anon is reachable through PostgREST as an unfiltered list endpoint, which
-- would let anyone dump every intern MECE has ever hired. An exact-match RPC
-- cannot be listed.
--
-- cert_id is random, not sequential, for the same reason: MECE-LP-2026-0001..
-- 9999 is a four-digit space that can be walked in minutes. The suffix is six
-- Crockford base32 characters (~1.07e9) so the id cannot be guessed, and the
-- /verify route rate-limits on top of that.
--
-- Fields NEVER exposed by the RPC: recipient_email, work_notes,
-- engagement_type, revoked_reason, created_by, id.

create extension if not exists pgcrypto with schema extensions;

-- ── table ────────────────────────────────────────────────────────────────────
create table if not exists public.certificates (
  id                 uuid primary key default gen_random_uuid(),
  cert_id            text        not null unique,

  -- printed
  recipient_name     text        not null,
  recipient_program  text,
  cert_title         text        not null default 'Certificate of Live Project Completion',
  role_title         text        not null,
  project_title      text        not null,
  start_date         date        not null,
  end_date           date        not null,
  duration_label     text,
  engagement_mode    text,
  reporting_to       text,
  scope_line         text        not null,
  sig1_name          text        not null default 'Kishan Jayaswal',
  sig1_title         text        not null default 'Founder, MECE',
  sig2_name          text        not null default 'Mohit Kumar Raj',
  sig2_title         text        not null default 'Co-Founder, MECE',

  -- internal, never printed and never returned by the public RPC
  recipient_email    text,
  work_notes         text,
  engagement_type    text,
  revoked_reason     text,
  created_by         uuid references public.users(id) on delete set null,

  issued_at          timestamptz not null default now(),
  revoked_at         timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint certificates_dates_ordered check (end_date >= start_date),
  -- House style, enforced at the last possible layer so no code path can bypass
  -- it: no en dash (U+2013) and no em dash (U+2014) in any printed field.
  -- Written with chr() so this file stays pure ASCII and cannot be corrupted by
  -- an editor that guesses the wrong encoding. Both functions are IMMUTABLE, so
  -- they are legal in a CHECK.
  constraint certificates_no_dashes check (
    (coalesce(recipient_name, '') || coalesce(recipient_program, '') ||
     coalesce(cert_title, '')     || coalesce(role_title, '')        ||
     coalesce(project_title, '')  || coalesce(duration_label, '')    ||
     coalesce(engagement_mode, '')|| coalesce(reporting_to, '')      ||
     coalesce(scope_line, '')     || coalesce(sig1_name, '')         ||
     coalesce(sig1_title, '')     || coalesce(sig2_name, '')         ||
     coalesce(sig2_title, ''))
    !~ ('[' || chr(8211) || chr(8212) || ']')
  )
);

create index if not exists certificates_cert_id_idx    on public.certificates (cert_id);
create index if not exists certificates_created_at_idx on public.certificates (created_at desc);
create index if not exists certificates_recipient_idx  on public.certificates (lower(recipient_name));

comment on table public.certificates is
  'Live-project completion certificates. Admin-issued. Public verification goes '
  'through public.verify_certificate(text), never through a table or view grant.';

-- ── updated_at ───────────────────────────────────────────────────────────────
create or replace function public.touch_certificates_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_certificates_updated_at on public.certificates;
create trigger trg_certificates_updated_at
  before update on public.certificates
  for each row execute function public.touch_certificates_updated_at();

-- ── id generation ────────────────────────────────────────────────────────────
-- MECE-LP-<year IST>-<6 x Crockford base32>. Crockford omits I, L, O and U so a
-- human reading the id off paper cannot confuse it with 1, 0 or a rude word.
--
-- 256 / 32 = 8 exactly, so `% 32` over a random byte is unbiased.
create or replace function public.generate_certificate_id(p_prefix text default 'MECE-LP')
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  alphabet constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  y        int  := extract(year from (now() at time zone 'Asia/Kolkata'))::int;
  candidate text;
  i        int;
begin
  for _attempt in 1..20 loop
    candidate := p_prefix || '-' || y::text || '-';
    for i in 1..6 loop
      candidate := candidate ||
        substr(alphabet, 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1);
    end loop;
    if not exists (select 1 from public.certificates c where c.cert_id = candidate) then
      return candidate;
    end if;
  end loop;
  raise exception 'generate_certificate_id: no unique id after 20 attempts';
end;
$$;

-- ── public verification ──────────────────────────────────────────────────────
-- The ONLY anon-reachable surface. Exact match, at most one row, printed
-- fields only. Adding a column here is a decision about what the whole internet
-- can read: re-read the header comment first.
create or replace function public.verify_certificate(p_cert_id text)
returns table (
  cert_id           text,
  recipient_name    text,
  recipient_program text,
  cert_title        text,
  role_title        text,
  project_title     text,
  start_date        date,
  end_date          date,
  duration_label    text,
  engagement_mode   text,
  reporting_to      text,
  scope_line        text,
  sig1_name         text,
  sig1_title        text,
  sig2_name         text,
  sig2_title        text,
  issued_at         timestamptz,
  is_revoked        boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select c.cert_id, c.recipient_name, c.recipient_program, c.cert_title,
         c.role_title, c.project_title, c.start_date, c.end_date,
         c.duration_label, c.engagement_mode, c.reporting_to, c.scope_line,
         c.sig1_name, c.sig1_title, c.sig2_name, c.sig2_title,
         c.issued_at, (c.revoked_at is not null) as is_revoked
  from public.certificates c
  where upper(btrim(c.cert_id)) = upper(btrim(p_cert_id))
  limit 1;
$$;

-- ── RLS + grants ─────────────────────────────────────────────────────────────
alter table public.certificates enable row level security;

drop policy if exists certificates_admin_all on public.certificates;
create policy certificates_admin_all on public.certificates
  for all
  using      (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin));

-- Nothing but service_role reaches the table. Supabase grants table privileges
-- to anon/authenticated by default on new tables in `public`, so revoke here
-- explicitly rather than trusting the default.
revoke all on public.certificates from anon, authenticated;

-- Id generation is an admin-only side effect and must not be an anon RPC.
revoke all on function public.generate_certificate_id(text) from public, anon, authenticated;
grant execute on function public.generate_certificate_id(text) to service_role;

-- The one thing the world may call.
revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated, service_role;

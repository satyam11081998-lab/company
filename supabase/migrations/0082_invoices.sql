-- 0082_invoices.sql
-- 2026-11-08 — Statutory invoicing: a gapless per-financial-year invoice number
-- on every payment, plus the tax snapshot that invoice was raised with.
--
-- WHY
-- CGST Rule 46(b) requires a consecutive serial number, at most 16 characters,
-- unique for a financial year. "Consecutive" and "unique" both have to survive
-- two concurrent payments, so the number is allocated by a single atomic
-- statement in the database and never by the application reading a counter and
-- writing it back (the pattern that already races on users.points — see
-- PROJECT_BRAIN §17 item 19).
--
-- WHY THE TAX FIELDS ARE COPIED ONTO THE ROW RATHER THAN DERIVED ON READ
-- An invoice is an immutable record of what was charged under the law as it
-- stood that day. If the company registers for GST, changes GSTIN, or the rate
-- moves, every invoice already issued must keep rendering exactly as it was
-- issued. Deriving the tax from lib/legal/company.ts at read time would
-- silently rewrite history.
--
-- IDEMPOTENT and deploy-order safe (PROJECT_BRAIN §13.3): this may be run
-- before or after the code that uses it. The code falls back to sending a plain
-- payment confirmation when `invoice_number` cannot be allocated, so deploying
-- the frontend first degrades rather than breaks.
--
-- RUN AS: the Supabase SQL editor (postgres). Safe to re-run.

begin;

-- ── 1. Invoice number columns on payments ──────────────────────────────────
-- All nullable: payments taken before this migration have no invoice, and a
-- failed allocation must leave the payment itself intact.

alter table public.payments add column if not exists invoice_number text;
alter table public.payments add column if not exists invoice_seq bigint;
alter table public.payments add column if not exists invoice_fy text;
alter table public.payments add column if not exists invoice_date timestamptz;

-- Rule 46(k),(l),(m): the tax snapshot, in minor units of `currency`, matching
-- the existing amount_paise convention on this table.
alter table public.payments add column if not exists taxable_value_minor bigint;
alter table public.payments add column if not exists cgst_minor bigint;
alter table public.payments add column if not exists sgst_minor bigint;
alter table public.payments add column if not exists igst_minor bigint;
alter table public.payments add column if not exists tax_rate_percent numeric(5,2);

-- Rule 46(a),(g): who supplied, under which registration, and what service.
-- Null supplier_gstin on a row means the supply was made while unregistered.
alter table public.payments add column if not exists supplier_gstin text;
alter table public.payments add column if not exists sac_code text;

-- Rule 46(n) + the proviso for online services supplied to an unregistered
-- recipient, which requires the recipient's State name on the invoice whatever
-- the value. Nothing collects this yet — see the note at the bottom.
alter table public.payments add column if not exists recipient_state_code text;
alter table public.payments add column if not exists place_of_supply text;

-- Export of services (US/EU sales): zero-rated, carries a prescribed endorsement.
alter table public.payments add column if not exists is_export boolean not null default false;

-- Rule 46(d): a recipient GSTIN turns the sale into B2B and lets them claim
-- input credit. Not collected yet; the column exists so that when a student's
-- employer or college asks for a GST invoice there is somewhere to put it.
alter table public.payments add column if not exists recipient_gstin text;

-- ── 2. Uniqueness ──────────────────────────────────────────────────────────
-- Partial, so the many pre-existing rows with a null invoice_number are fine.
create unique index if not exists payments_invoice_number_key
  on public.payments (invoice_number)
  where invoice_number is not null;

create unique index if not exists payments_invoice_fy_seq_key
  on public.payments (invoice_fy, invoice_seq)
  where invoice_number is not null;

create index if not exists payments_invoice_date_idx
  on public.payments (invoice_date desc)
  where invoice_number is not null;

-- Rule 46(b) shape, enforced at the edge of the system rather than trusted from
-- the application: at most 16 characters, alphanumerics plus hyphen and slash.
alter table public.payments drop constraint if exists payments_invoice_number_check;
alter table public.payments add constraint payments_invoice_number_check
  check (
    invoice_number is null
    or (length(invoice_number) <= 16 and invoice_number ~ '^[A-Za-z0-9/-]+$')
  );

-- ── 3. The counter ─────────────────────────────────────────────────────────

create table if not exists public.invoice_counters (
  fy          text primary key,          -- '26-27'
  next_seq    bigint not null default 1,
  updated_at  timestamptz not null default now()
);

comment on table public.invoice_counters is
  'One row per Indian financial year. next_seq is the number the NEXT invoice '
  'will take. Only allocate_invoice_sequence() should write this.';

alter table public.invoice_counters enable row level security;
-- No policy: the service role bypasses RLS, and nothing else may read or write
-- the counter. A client that could read it could enumerate total sales.

-- ── 4. Atomic allocation ───────────────────────────────────────────────────
-- One statement, so two concurrent payments cannot take the same number. The
-- INSERT ... ON CONFLICT DO UPDATE ... RETURNING pattern takes a row lock for
-- the duration of the statement; the loser blocks and then reads the winner's
-- value. Both branches return (next_seq after the write) - 1:
--   first call   → inserts next_seq = 2, returns 1
--   later calls  → updates n → n + 1, returns n

create or replace function public.allocate_invoice_sequence(p_fy text)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_seq bigint;
begin
  if p_fy is null or p_fy !~ '^\d{2}-\d{2}$' then
    raise exception 'allocate_invoice_sequence: bad financial year %', p_fy;
  end if;

  insert into public.invoice_counters as c (fy, next_seq)
  values (p_fy, 2)
  on conflict (fy) do update
    set next_seq = c.next_seq + 1,
        updated_at = now()
  returning c.next_seq - 1 into v_seq;

  return v_seq;
end;
$$;

comment on function public.allocate_invoice_sequence(text) is
  'Atomically reserve the next invoice sequence number for a financial year '
  '(CGST Rule 46(b): consecutive and unique per FY). Service role only.';

-- Only the server may mint invoice numbers. A user who could call this could
-- burn sequence numbers and leave gaps in a statutory register.
revoke all on function public.allocate_invoice_sequence(text) from public;
revoke all on function public.allocate_invoice_sequence(text) from anon;
revoke all on function public.allocate_invoice_sequence(text) from authenticated;
grant execute on function public.allocate_invoice_sequence(text) to service_role;

commit;

-- ── NOTES ──────────────────────────────────────────────────────────────────
--
-- 1. BACKFILL. Payments already taken have no invoice number and this
--    migration deliberately does not invent one. If invoices are needed for
--    them, allocate in ascending paid_at order so the series stays consecutive:
--
--      do $$
--      declare r record; s bigint;
--      begin
--        for r in
--          select id, paid_at,
--                 to_char(paid_at + interval '5 hours 30 minutes', 'YY') ||'-'||
--                 to_char(paid_at + interval '5 hours 30 minutes' + interval '1 year', 'YY') as fy
--          from public.payments
--          where status = 'paid' and invoice_number is null
--          order by paid_at asc
--        loop
--          -- NOTE: the fy expression above is only correct for a paid_at on or
--          -- after 1 April. Check each row before running this on real data.
--          s := public.allocate_invoice_sequence(r.fy);
--          update public.payments
--             set invoice_seq = s, invoice_fy = r.fy,
--                 invoice_number = 'MI/'|| r.fy ||'/'|| lpad(s::text, 5, '0'),
--                 invoice_date = r.paid_at
--           where id = r.id;
--        end loop;
--      end $$;
--
-- 2. RECIPIENT STATE. `recipient_state_code` is not populated by anything yet.
--    It does not matter while the company is unregistered, because no tax is
--    charged and place of supply carries no meaning. It becomes mandatory on
--    the day of GST registration: the proviso to Rule 46 requires the
--    recipient's State name on an invoice for online services supplied to an
--    unregistered person, regardless of value, and that State name is what
--    decides CGST+SGST against IGST. Add a state selector to checkout before
--    registering, not after.

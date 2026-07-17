-- 0042_deck_vault_filters.sql — structured filter columns for the Deck Vault
-- catalogue + one-time backfill of already-approved reward submissions.
-- Additive + idempotent (safe to run twice). Run AFTER 0041.
--
-- 1. deck_skeletons gains year / organizer (filterable) and
--    source_submission_id (durable link to the rewards submission that produced
--    the row — the auto-publish in admin/deck-vault/actions.ts now writes all three).
-- 2. Rows auto-published BEFORE this migration (no linkage column existed) are
--    linked by storage_path (the auto-publish copies the submission's deck_path
--    verbatim, so equality is exact), then enriched with year/organizer and a
--    normalized result label.
-- 3. Approved submissions that never reached the catalogue (approved before
--    auto-publish existed, or its insert failed non-fatally) are inserted.

-- ── 1. Columns ──────────────────────────────────────────────────────────────
alter table public.deck_skeletons
  add column if not exists year int null check (year is null or year between 2000 and 2035),
  add column if not exists organizer text not null default '',
  add column if not exists source_submission_id uuid null references public.deck_submissions(id) on delete set null;

-- One catalogue row per submission (linkage is optional for admin uploads).
create unique index if not exists deck_skeletons_source_submission
  on public.deck_skeletons (source_submission_id) where (source_submission_id is not null);

-- ── 2. Link + enrich rows published before this migration ───────────────────
with labels as (
  select s.id, s.year, s.organizer, s.deck_path,
         case s.position
           when 'winner'           then 'National Winner'
           when 'runner_up'        then 'National Runner Up'
           else                         'National 2nd Runner Up'
         end as result_label
  from public.deck_submissions s
  where s.status = 'approved'
)
update public.deck_skeletons k
set source_submission_id = l.id,
    year                 = coalesce(k.year, l.year),
    organizer            = case when k.organizer = '' then coalesce(l.organizer, '') else k.organizer end,
    result               = l.result_label
from labels l
where k.storage_path = l.deck_path
  and k.source_submission_id is null;

-- ── 3. Backfill approved submissions missing from the catalogue ─────────────
with approved as (
  select s.*,
         case s.position
           when 'winner'           then 'National Winner'
           when 'runner_up'        then 'National Runner Up'
           else                         'National 2nd Runner Up'
         end as result_label,
         lower(coalesce(substring(s.deck_path from '\.([a-zA-Z0-9]+)$'), '')) as raw_ext
  from public.deck_submissions s
  where s.status = 'approved'
)
insert into public.deck_skeletons
  (title, source_kind, competition, result, case_type, round_type, file_type,
   description, storage_path, is_active, year, organizer, source_submission_id)
select
  a.competition_name || ' ' || a.year || ' — ' || a.result_label || ' Deck',
  a.competition_type,
  case when a.organizer <> '' then a.competition_name || ' · ' || a.organizer
       else a.competition_name end,
  a.result_label,
  'strategy',   -- safe default; admin can edit later
  'finale',
  case when a.raw_ext in ('pdf', 'pptx', 'ppt') then a.raw_ext else 'pdf' end,
  'Verified ' || lower(a.result_label) || ' deck from ' || a.competition_name || ' (' || a.year || ').',
  a.deck_path,
  true,
  a.year,
  a.organizer,
  a.id
from approved a
where not exists (
  select 1 from public.deck_skeletons k
  where k.source_submission_id = a.id
     or k.storage_path = a.deck_path
);

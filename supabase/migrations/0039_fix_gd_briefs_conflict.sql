-- 0039_fix_gd_briefs_conflict.sql
-- Fix: generating a GD brief failed with 42P10 ("no unique or exclusion
-- constraint matching the ON CONFLICT specification").
--
-- Root cause: 0036 created gd_briefs_headline_unique as a PARTIAL unique index
-- (WHERE headline_id IS NOT NULL). The backend saves briefs with
-- ON CONFLICT (headline_id), which Postgres can only match against a FULL
-- unique index/constraint — the CONTRACTS C1 §9.36 gotcha, same as cases.code.
-- A full unique index behaves identically for NULLs (multiple NULLs never
-- conflict), so nothing is lost by dropping the predicate.
--
-- Idempotent: safe to run twice, and safe whether or not 0036 ever ran
-- (run 0036 first if it hasn't been).

-- Dedupe any duplicate briefs per headline (keep the earliest) so the index builds.
delete from public.gd_briefs a
  using public.gd_briefs b
  where a.headline_id = b.headline_id
    and a.headline_id is not null
    and a.created_at > b.created_at;

-- Replace the partial index with a FULL unique index.
drop index if exists public.gd_briefs_headline_unique;
create unique index if not exists gd_briefs_headline_unique
  on public.gd_briefs(headline_id);

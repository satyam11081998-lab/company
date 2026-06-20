-- =====================================================================
-- 0017 — expand cases.type allowed values for new practice domains
--
-- The baseline (0001) constrained cases.type to a fixed set:
--   ('guesstimate','profitability','market_sizing','growth')
-- That is why seed-cases-constellation.sql had to label its Pricing/M&A/Ops
-- starter cases as 'profitability'/'growth' — the CHECK rejected anything else,
-- so the /practice "All domains" dropdown (built from distinct type) only ever
-- showed 3 domains.
--
-- This migration widens the CHECK to admit the new first-class domains used by
-- seed-cases-domains.sql. Purely ADDITIVE: every previously-valid value is still
-- valid, so no existing row or writer breaks. Run this BEFORE seed-cases-domains.sql.
--
-- Idempotent: drop-if-exists then re-add — safe to re-run.
-- =====================================================================

alter table public.cases drop constraint if exists cases_type_check;

alter table public.cases add constraint cases_type_check
  check (type in (
    -- original
    'guesstimate', 'profitability', 'market_sizing', 'growth',
    -- new practice domains (2026-06-21)
    'market entry', 'pricing', 'm&a', 'operations',
    'cost reduction', 'go to market', 'competitive strategy'
  ));

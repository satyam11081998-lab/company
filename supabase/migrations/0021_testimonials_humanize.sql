-- =====================================================================
-- Migration 0021: de-robotize seeded testimonials (remove em dash, more human).
-- Idempotent: plain UPDATEs keyed on the fixed seed UUIDs. Safe to re-run.
-- NOT a CONTRACTS surface.
-- =====================================================================
update public.testimonials
set quote = 'The 6-dimension scoring is brutally honest. In mock interviews my friends always went easy on me; here nothing slipped through, and it pushed me to write much tighter syntheses.',
    updated_at = now()
where id = '00000000-0000-0000-0000-0000000000a2';

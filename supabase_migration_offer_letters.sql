-- ============================================================================
-- Migration: offer_letters table + verify_offer RPC
-- Mirrors the certificate verification pattern (migration 0046).
-- ============================================================================

-- 1. Table
CREATE TABLE IF NOT EXISTS public.offer_letters (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id      text NOT NULL UNIQUE,          -- e.g. MECE-OL-2026-4632
  candidate_name    text NOT NULL,
  candidate_email   text,
  role_title        text NOT NULL,
  engagement_type   text NOT NULL DEFAULT 'Live Project',
  duration          text NOT NULL,             -- e.g. '2 months'
  start_date        date NOT NULL,
  issued_date       date NOT NULL DEFAULT CURRENT_DATE,
  signatory_name    text NOT NULL,
  signatory_title   text NOT NULL,
  is_active         boolean NOT NULL DEFAULT true,
  withdrawn_at      timestamptz,
  withdrawn_reason  text,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- No direct table grant — access is via RPC only, just like certificates.

-- 2. Public verification RPC (anon-safe, exact match only)
CREATE OR REPLACE FUNCTION public.verify_offer(p_offer_id text)
RETURNS TABLE (
  offer_id        text,
  candidate_name  text,
  role_title      text,
  engagement_type text,
  duration        text,
  start_date      text,
  issued_date     text,
  signatory_name  text,
  signatory_title text,
  is_active       boolean
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    ol.offer_id,
    ol.candidate_name,
    ol.role_title,
    ol.engagement_type,
    ol.duration,
    ol.start_date::text,
    ol.issued_date::text,
    ol.signatory_name,
    ol.signatory_title,
    ol.is_active
  FROM public.offer_letters ol
  WHERE ol.offer_id = upper(trim(p_offer_id))
  LIMIT 1;
$$;

-- Grant anon execute so the public /offers page can call it.
GRANT EXECUTE ON FUNCTION public.verify_offer(text) TO anon;

-- 3. Insert Samridhi's offer letter
INSERT INTO public.offer_letters (
  offer_id, candidate_name, candidate_email, role_title,
  engagement_type, duration, start_date, issued_date,
  signatory_name, signatory_title
) VALUES (
  'MECE-OL-2026-4632',
  'Samridhi Kashyap',
  NULL,  -- fill in her email if you like
  'HR Associate (AI & Competency Assessment)',
  'Live Project',
  '2 months',
  '2026-08-24',
  '2026-08-20',
  'Kishan Jayaswal',
  'Co-Founder'
);

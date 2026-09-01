-- 0056_user_actions.sql — Granular user action tracking for journey analytics.
-- Complements page_events (page views) with explicit user interactions:
-- button clicks, case starts/submits, payment events, feature usage, etc.
-- Fed by hooks/use-track-action.ts via POST /api/track (service role).
-- RLS is ON with NO policies: only the server (service role) can read/write.

CREATE TABLE IF NOT EXISTS public.user_actions (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  session_id  text        NOT NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  path        text        NOT NULL,
  action      text        NOT NULL,   -- e.g. 'start_case', 'submit_case', 'initiate_checkout'
  category    text,                   -- e.g. 'case', 'gd', 'deck', 'payment', 'lifecycle'
  label       text,                   -- human-readable context e.g. "Profitability Case #12"
  value       jsonb,                  -- flexible metadata: { case_id, score, attempt_id, … }
  device      text CHECK (device IN ('mobile', 'desktop'))
);

-- Indexes for efficient journey queries
CREATE INDEX idx_user_actions_user_time   ON public.user_actions (user_id, occurred_at DESC);
CREATE INDEX idx_user_actions_session     ON public.user_actions (session_id, occurred_at);
CREATE INDEX idx_user_actions_action      ON public.user_actions (action);
CREATE INDEX idx_user_actions_category    ON public.user_actions (category);
CREATE INDEX idx_user_actions_occurred    ON public.user_actions (occurred_at DESC);

-- Add missing indexes to page_events for user-level journey reconstruction
CREATE INDEX IF NOT EXISTS idx_page_events_user_time    ON public.page_events (user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_events_session_time ON public.page_events (session_id, occurred_at);

-- RLS: locked down like page_events (service-client writes only)
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

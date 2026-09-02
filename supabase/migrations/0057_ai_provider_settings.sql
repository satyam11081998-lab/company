-- 0057_ai_provider_settings.sql — admin-toggleable AI provider per feature.
-- One row per feature; provider is 'openai' | 'groq' | 'google'. The backend
-- reads this (cached ~30s) to pick which provider serves each AI feature, so an
-- admin can switch OpenAI<->Groq (and TTS OpenAI<->Google) live without a deploy.
-- Defaults live in code (services/ai_providers.py FEATURES); a row here overrides.
-- RLS on, no policies: service-role reads/writes only (admin API uses service key).

create table if not exists public.ai_provider_settings (
  feature     text primary key,
  provider    text not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null
);

alter table public.ai_provider_settings enable row level security;

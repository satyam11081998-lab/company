-- =============================================================================
-- Conversational Solve Experience — schema migration
-- Created: 2026-06-05
-- Adds three tables: attempts, attempt_messages, attempt_files.
-- These power the new chat-based solve workspace. The legacy `submissions`
-- and `case_attempts` tables are preserved; on submit we still insert into
-- both so analytics, leaderboards, and the /results page keep working.
-- =============================================================================

-- An "attempt" is a single solve session for one case.
-- One row per opened workspace, regardless of whether it's ever submitted.
create table if not exists public.attempts (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users(id) on delete cascade,
  case_id               uuid not null references public.cases(id) on delete cascade,
  tier_at_start         text not null check (tier_at_start in ('free','lite','pro')),
  clarification_quota   int  not null,    -- snapshot of tier limit at creation (5/15/15+)
  clarification_used    int  not null default 0,
  final_recommendation  text,             -- required string before submit unlocks
  status                text not null default 'active'
                          check (status in ('active','submitted','abandoned')),
  submission_id         uuid references public.submissions(id) on delete set null,
  created_at            timestamptz not null default now(),
  submitted_at          timestamptz
);

create index if not exists attempts_user_case_idx
  on public.attempts(user_id, case_id, created_at desc);
create index if not exists attempts_status_idx
  on public.attempts(status) where status = 'active';

-- One row per message in the conversation. Chronological order is by created_at.
-- `role`     = who produced it (user | assistant | system)
-- `kind`     = how it was produced (text | voice | image | file | recommendation)
-- `content`  = canonical text (for voice this is the transcript; for image/file
--              it is the AI's OCR / extracted text, optional)
create table if not exists public.attempt_messages (
  id              uuid primary key default gen_random_uuid(),
  attempt_id      uuid not null references public.attempts(id) on delete cascade,
  role            text not null check (role in ('user','assistant','system')),
  kind            text not null default 'text'
                    check (kind in ('text','voice','image','file','recommendation','system_note')),
  content         text,
  -- Optional file payload (image, doc). Storage refs live in attempt_files; this is
  -- a lightweight join shortcut for the most common case (one file per message).
  file_id         uuid,
  is_clarification boolean not null default false,  -- true if this user turn consumed quota
  created_at      timestamptz not null default now()
);

create index if not exists attempt_messages_attempt_idx
  on public.attempt_messages(attempt_id, created_at);

-- Storage references for uploaded files (images, screenshots, PDFs, docs).
-- The actual bytes live in a Supabase Storage bucket (recommend: `attempt_uploads`).
create table if not exists public.attempt_files (
  id           uuid primary key default gen_random_uuid(),
  attempt_id   uuid not null references public.attempts(id) on delete cascade,
  message_id   uuid references public.attempt_messages(id) on delete set null,
  storage_path text not null,             -- `attempt_uploads/<user>/<attempt>/<uuid>.<ext>`
  mime_type    text not null,
  file_name    text not null,
  size_bytes   bigint not null,
  created_at   timestamptz not null default now()
);

create index if not exists attempt_files_attempt_idx
  on public.attempt_files(attempt_id, created_at);

-- Back-reference from messages to files (FK added after both tables exist).
alter table public.attempt_messages
  add constraint attempt_messages_file_fk
  foreign key (file_id) references public.attempt_files(id) on delete set null;

-- =============================================================================
-- Row Level Security
-- The backend uses the service-role key (RLS bypass) for all writes; these
-- policies exist for direct frontend reads (`/results/[id]`, attempt history).
-- =============================================================================

alter table public.attempts          enable row level security;
alter table public.attempt_messages  enable row level security;
alter table public.attempt_files     enable row level security;

create policy "attempts: owner read"
  on public.attempts for select
  using (auth.uid() = user_id);

create policy "attempt_messages: owner read"
  on public.attempt_messages for select
  using (
    exists (
      select 1 from public.attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
  );

create policy "attempt_files: owner read"
  on public.attempt_files for select
  using (
    exists (
      select 1 from public.attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
  );

-- =============================================================================
-- Storage bucket (manual — apply via Supabase dashboard or `supabase storage`)
-- =============================================================================
-- Bucket name : attempt_uploads
-- Public      : false
-- Path layout : <user_id>/<attempt_id>/<uuid>.<ext>
-- Read policy : owner only (auth.uid() = (storage.foldername(name))[1]::uuid)
-- Write policy: same (insert constrained to owner's folder)
-- Max size    : 8 MB per object (images), 16 MB (PDF/doc)
-- =============================================================================

-- 0071_attempt_messages_client_turn_id.sql
-- Unified interviewer brain (2026-09-29): durable idempotency for conversation rows.
--
-- A realtime voice turn is saved by the browser (/attempts/{id}/realtime-turn). A retry,
-- a reconnect or a duplicated transcription callback could previously land the same turn
-- twice - and meter its audio twice. The backend now sends a stable key per turn
-- ('u:<item_id>' / 'a:<response_id>' / 'm:<turn_id>' / 'a:<turn_id>') and this partial
-- unique index makes a second insert of the same key fail, which the backend turns into
-- "already saved" (and does not meter again).
--
-- Additive + idempotent. Deploy-safe in either order: until this runs, the backend detects
-- the missing column, inserts without it (old behaviour) and relies on its in-process
-- idempotency cache only.

alter table public.attempt_messages
  add column if not exists client_turn_id text;

create unique index if not exists attempt_messages_client_turn_uidx
  on public.attempt_messages (attempt_id, client_turn_id)
  where client_turn_id is not null;

notify pgrst, 'reload schema';

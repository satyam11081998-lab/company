# ANTIGRAVITY_HANDOFF — interviewer-speed (make every turn fast; V10 untouched)

**Author:** Claude brain (cloud session), 2026-09-28. **Feature:** `interviewer-speed`.
**Branch:** `main`, both repos. The changes are committed locally on the shared drive; the owner pushes.
**Depends on:** V10 interviewer files as on GitHub `main` b5ec67a. Those files are byte-identical before and after this change (sha256 prefixes ec9da68a / 96b0ea76 / 91e17725 / 3ab013b2).
**Type:** performance only. Nothing here changes what the interviewer decides or says, or what is saved.

```
touches:  backend   MOD  routes/attempts.py, routes/speak.py, routes/transcribe.py, routes/realtime.py (comment only),
                         routes/realtime_gemini.py, routes/public_config.py,
                         services/supabase_client.py, services/auth.py, services/ai_usage.py,
                         services/rate_limit.py, services/realtime_credits.py,
                         tests/test_v11_voice_integration.py
                    NEW  services/keyed_lock.py
          frontend  MOD  components/solve/ConversationalSolve.tsx (send()),
                         components/solve/VoiceInterviewGemini.tsx, components/solve/VoiceInterviewRealtime.tsx,
                         lib/interview-api.ts, lib/voice/v11-voice.ts
breaking: no. C4 additive only:
            - new route POST /attempts/{id}/voice-fold {turn_id, commit};
            - optional request fields turn_id, defer_fold, discard_turn_ids on POST /attempts/{id}/voice-decision
              (older clients send none of them and behave exactly as before);
            - a Server-Timing response header on /messages and /voice-decision.
          No schema, scoring (C2), quota (C9) or response-body change.
affects:  Case solve (typed), talk mode (pipeline), realtime voice (OpenAI + Gemini).
```

## What was slow, and the fix for each

- **New Supabase client on every call.** Each one needed a TLS handshake to Tokyo (the backend is in Oregon), plus about 60 ms of CPU to build (10x that on Render's 0.1 CPU). One turn built 3 to 5 of them.
  - **Fix:** one shared client per process, with an HTTP/2 keep-alive of 60 s. A dead pooled connection is retried once, for reads only.
  - **Rollback:** set `SUPABASE_CLIENT_MODE=per_call`.
- **`supabase.auth.get_user()` on every request.**
  - **Fix:** a successful check is cached for 60 s, never past the token's expiry. Guests are never cached. `AUTH_CACHE_TTL_SECONDS=0` turns the cache off.
- **The daily-budget check scanned all of today's `ai_usage_log` rows before every turn, TTS sentence and transcription.**
  - **Fix:** the spend figure is cached for 30 s and refreshed in the background. This process's own spend is added to it immediately.
  - `AI_BUDGET_CACHE_SECONDS=0` restores a read on every check.
- **Usage-log inserts were inline.**
  - **Fix:** they are written by a background pool. The row content is unchanged. `AI_USAGE_LOG_SYNC=1` restores inline writes.
- **8 to 11 database round trips one after another per turn.**
  - **Fix:** independent reads now run concurrently. Errors are still raised in the original order.
  - The transcript and the message count come from one query.
  - Case rows are cached for 120 s (`CASE_CACHE_SECONDS`).
  - The quota snapshot's 4 reads now run in parallel.
  - `/speak` reuses a snapshot for 20 s (`QUOTA_CACHE_SECONDS`). `/transcribe` computes the quota it returns instead of reading it again.
- **`async def` handlers doing blocking I/O froze the single worker.** TTS synthesis, for example, stalled streamed replies.
  - **Fix:** those handlers are now plain `def`; `/transcribe` runs its blocking work in the threadpool.
  - The few read-modify-write spots that relied on the accidental serialisation now take explicit per-key locks: credits, `start_attempt`, `realtime-turn`, and the rate limiter.
- **The session_state fold ran before the reply was returned.**
  - **Fix:** it runs right after, in a per-attempt queue. The next request for that attempt waits for it.
  - Voice decisions are serialised per attempt (`_enter_turn`), so no turn ever reads a stale state.
- **Frontend: the reply was held behind persistence.**
  - The text composer waited for a full `getAttempt` after every reply. It now appends the reply locally and refreshes in the background.
  - Realtime voice waited for the transcript save before speaking. It now speaks first and saves in the background, in speaking order (`SaveQueue` + `CandidateTurnLedger`).
- **Gemini started V11 only after its own (discarded) answer finished.**
  - **Fix:** the words go to V11 as an EARLY decision as soon as Gemini starts that answer.
  - The early decision is used only if the words are unchanged when the turn would have ended anyway.
  - Otherwise it is voided: its session_state fold is never applied (`defer_fold` then `/voice-fold`), and V11 decides the full turn.
  - Result: the same transcript, the same learner state and the same lines as the flow without the early look. The sim asserts this for 5 scenarios.

## Build steps and gates (all run 2026-09-28)

1. Backend
   - `python -m compileall` passes.
   - `python -m tests.test_v11_voice_integration` passes 74/74, including new section 5: deferred folds and per-attempt ordering.
   - The unit suites show the same pass/fail as the untouched b5ec67a baseline.
     - `test_interviewer_mode` (24) and `test_session_signals` (5) fail identically on the baseline. That is engine drift, not this change.
   - The full `main:app` starts under uvicorn.
2. Frontend
   - `tsc --noEmit` is clean.
   - The realtime simulation, with real `lib/voice` modules against the real routes, passes 173/173.
3. Equivalence
   - `/messages` SSE events, rows and state writes are byte-identical to the baseline across 7 scenarios.
   - The overlapping-turn race probe gives the same final state as the baseline.
4. SQL: none.

## Measured (latency-injected benchmark; Oregon↔Tokyo 100 ms RTT, TLS 200 ms, model times fixed; server side only)

| path | before | after |
|---|---|---|
| /voice-decision, no model call | 1.83 s | 0.10 s |
| /voice-decision, assessor + model | 3.53 s | 1.81 s (1.70 s is the model) |
| /messages first token, no model call | 1.47 s | 0.21 s |
| /speak one sentence (0.5 s TTS) | 2.35 s | 0.51 s |
| /transcribe one clip (0.6 s STT) | 2.97 s | 0.75 s |
| stream first token while TTS runs | 3.81 s | 0.21 s |
| CPU per voice decision | ~182 ms | ~8 ms |

## Owner decisions left open

- `REALTIME_SEMANTIC_EAGERNESS` stays at `low`. Setting it to `medium` or `high` shortens OpenAI's end-of-turn wait but changes where turns are cut.
- Render free tier (0.1 CPU, sleeps after inactivity) is now the largest remaining latency. The first request after an idle sleep takes tens of seconds.
- Barge-in segmentation, where a `turnComplete` after an interruption starts the 600 ms settle, is unchanged pre-existing behaviour and is noted in the review.

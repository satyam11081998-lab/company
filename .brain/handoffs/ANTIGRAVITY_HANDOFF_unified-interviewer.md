# ANTIGRAVITY_HANDOFF — unified-interviewer

**Author:** Claude (cloud session), 2026-09-30. **Feature:** Unified interviewer brain — one
decision system for TEXT chat, STT talk mode and realtime voice. **Branch:**
`feat/unified-interviewer-brain` in BOTH repos (backend on `main` `9e009c5`, frontend on `main`
`a73be90`). **Not merged, not pushed to production, flag OFF by default.**

```
touches:  backend  services/interviewer/* (NEW package, 15 modules), routes/attempts_brain.py (NEW),
                   routes/attempts.py (flag branch into the brain; client_turn_id idempotency on
                   /realtime-turn; NEW POST /attempts/{id}/voice-telemetry),
                   routes/realtime.py (env-selectable transcription model, response_conversation in the
                   session response, NEW POST /realtime/transcription-session and
                   /realtime/transcription-usage), services/ai_usage.py (live-transcribe price),
                   services/copilot/engine/prompts_interview.py (unreachable static "no hints" prompt
                   replaced by a fail-closed stub), tests/test_interviewer_brain_*.py, tests/interviewer_fakes.py,
                   tools/{interviewer_chaos_sim,interviewer_load_test,interviewer_cost_model,
                   brain_overhead_bench,voice_latency_report,text_latency_probe,e2e_voice_backend}.py,
                   docs/interviewer/* (4 design docs + 12 reports)
          frontend lib/interview-api.ts, components/solve/{ConversationalSolve,VoiceInterview,
                   VoiceInterviewRealtime}.tsx, lib/voice/{realtime-session,realtime-turns (NEW),
                   live-transcribe (NEW), noise-guard}.ts, qa/** (NEW: unit + browser E2E),
                   supabase/migrations/0071_attempt_messages_client_turn_id.sql (NEW)
          NOT touched: V11 engine files (interview_engine.py, interviewer_decision.py,
                   session_signals.py, interviewer_mode.py, learning_model.py, prompts/*) —
                   byte-identical to main; plans, trial, billing, quotas, scoring, auth.
breaking: no. C4: additive only (new routes above; new optional request fields
          `channel`, `turn_id` on /messages, `session_id` on /voice-decision,
          `client_turn_id` on /realtime-turn;
          new SSE event `silence` and `done.silent`, sent ONLY when the flag is on for the user;
          /realtime/session response gains `response_conversation`, `transcribe_model`).
          C9: ladder and counting UNCHANGED (parity test against count_clarifications);
          exhaustion still never means silence. C2 scoring: unchanged.
affects:  Case solve UX, Voice interview (talk mode), Voice + image input, AI evaluation v2
          (reads the same attempt_messages; silent turns simply have no interviewer row)
```

## What it does (one paragraph)
Every completed candidate turn, on every channel, goes to ONE brain
(`services/interviewer/engine.py`): deterministic signals → Gate A (substantive need) → Gate B
(presence) → otherwise **NO_OUTPUT**. Silence is an explicit event (`event: silence` /
`lane:"SILENCE"`), never an empty bubble, row or TTS clip, and never a disguise for an error.
Help/hint/solution requests are always honoured (ladder MICRO → TARGETED → STRUCTURAL →
DEMONSTRATION → SOLUTION); frustration gets a question-free repair; recovery gets restraint;
reasonable numbers and assumptions are accepted silently; material arithmetic/anchor errors get
one specific correction; META/injection turns get one in-role line without a model call. The
realtime voice model only SAYS approved lines (out-of-band responses, app-controlled barge-in,
held/stale line handling, item_id dedupe). Full spec: `consilio-backend/docs/interviewer/`.

## Env vars (backend) — all optional
| Var | Default | Meaning |
|---|---|---|
| `INTERVIEWER_BRAIN` | `off` | `off` = baseline V11 everywhere; `on` = brain for everyone; `allowlist` = brain only for `INTERVIEWER_BRAIN_ALLOWLIST` |
| `INTERVIEWER_BRAIN_ALLOWLIST` | empty | comma-separated user ids or emails |
| `INTERVIEWER_DEBUG_DECISIONS` | off | adds `mode`/`reason` to voice payloads — **never in production** |
| `INTERVIEWER_ASSESSOR` | `on` | small-model judgement on step-completing analytic turns |
| `INTERVIEWER_ASSESSOR_MODEL` | `gpt-4o-mini` | |
| `INTERVIEWER_BRAIN_PROVIDER` / `INTERVIEWER_BRAIN_MODEL` | admin toggle (`resolve_llm('interviewer')`) | force a provider/model for the brain |
| `INTERVIEWER_BRAIN_TIMEOUT_S` | 12 text / 8 voice | provider timeout |
| `INTERVIEWER_TELEMETRY` | `on` | `[interviewer.turn]` / `[interviewer.timing]` log lines (no content) |
| `REALTIME_TRANSCRIBE_MODEL` | `whisper-1` | realtime input transcription (A/B only after measuring) |
| `REALTIME_RESPONSE_CONVERSATION` | `none` | `none` = out-of-band lines; `auto` = previous in-band behaviour (no frontend deploy needed) |
| `STT_LIVE_MODEL` / `STT_LIVE_DELAY` / `STT_LIVE_LANGUAGES` / `STT_LIVE_KEYWORDS` | `gpt-live-transcribe` / `low` / `en` / domain terms | only used by the opt-in live STT transport |

Frontend build var: `NEXT_PUBLIC_STT_TRANSPORT` = `whisper` (default) | `live`. Keep `whisper`
until the live transport is measured (its minutes are metered from client reports — see the
security report).

## Phased build steps + gates

**Phase 0 — sync.** `git pull` in both repos on `D:\dev\mece`. The branches were fetched into
your local repos as `feat/unified-interviewer-brain` (see the delivery note in the final message);
your `main` working trees were not touched. Backend `main` currently has UNCOMMITTED local
changes (markets, daily, cron, submit, access_guard, …) that are unrelated to this feature —
do not stash/reset them for this; use a worktree:
`git worktree add ..\consilio-backend-brain feat/unified-interviewer-brain`.

**Phase 1 — backend** (`consilio-backend`; never `git add -A` there — dormant CRLF churn):
- Merge or cherry-pick `feat/unified-interviewer-brain` (6 commits on `9e009c5`, the last two are docs).
- Gates:
  - `python -m py_compile routes/attempts.py routes/attempts_brain.py routes/realtime.py services/ai_usage.py services/interviewer/*.py services/copilot/engine/prompts_interview.py` → **EXIT 0 (verified)**
  - `python -m pytest -q tests/test_interviewer_brain_unit.py tests/test_interviewer_brain_routes.py tests/test_interviewer_brain_regression.py tests/test_interviewer_brain_properties.py tests/test_interviewer_brain_adversarial.py` → **354 passed (verified)**
  - `python -m tests.test_v11_voice_integration` → **ALL PASS (verified)** (flag OFF path)
  - `python -m tests.test_count_clarifications` → **14/14 (verified)**
  - `python -m tools.interviewer_chaos_sim --sequences 3000 --turns 25` → **0 violations (verified)**
  - (dummy env for tests: `OPENAI_API_KEY=sk-test SUPABASE_URL=https://x.supabase.co SUPABASE_SERVICE_ROLE_KEY=t`)
- Suggested message: `feat(interviewer): unified interviewer brain behind INTERVIEWER_BRAIN (default off)`

**Phase 2 — frontend** (`consilio`):
- Merge `feat/unified-interviewer-brain` (3 commits on `a73be90`, the last one is this handoff).
- Gates:
  - `npx tsc --noEmit` → **EXIT 0 (verified)**
  - `next build` → **EXIT 0 (verified; Google Fonts mocked offline, so re-run it on your machine)**
  - `node --require ./qa/ts-register.cjs --test qa/voice/*.test.cjs` → **19/19 (verified)**
  - optional browser E2E: see `qa/e2e-voice/run.cjs` header (needs werift, esbuild, playwright-core and a Chromium headless shell) → **24/24 realtime, 13/13 STT (verified)**
- The client changes are safe against a flag-OFF backend: V11 never sends `silence`, and the new
  request fields are optional.

**Phase 3 — migration** `supabase/migrations/0071_attempt_messages_client_turn_id.sql`, after 0070:
- Adds nullable `attempt_messages.client_turn_id` + partial unique index `(attempt_id, client_turn_id) where client_turn_id is not null`, then `notify pgrst`.
- Gate: idempotent (`if not exists` on both) — **verified on a local Postgres by applying twice**;
  existing rows untouched (NULL). The backend works before the migration (falls back to plain
  inserts, re-checks every 10 minutes); the DB-level duplicate guard only exists after it.

**Phase 4 — enable, in this order:**
1. Deploy backend + frontend with `INTERVIEWER_BRAIN=off` (no behaviour change).
2. `INTERVIEWER_BRAIN=allowlist`, `INTERVIEWER_BRAIN_ALLOWLIST=<owner email>`; run the live
   checks in `docs/interviewer/MECE_INTERVIEWER_REALTIME_REPORT.md §4` and the latency
   procedure in `MECE_INTERVIEWER_LATENCY_REPORT.md §4` (N ≥ 30 per condition).
3. Check F16 (`cases.solution` readable by anon?) with the SQL in the security report.
4. Widen the allowlist, then `on`. Rollback at any step = `INTERVIEWER_BRAIN=off` (instant, no deploy of code).

## Proposed LEDGER row (owner to approve; not written)
| **Unified interviewer brain** | Cloud (Claude) | feat/unified-interviewer-brain | BUILT 2026-09-30, NOT MERGED, flag OFF — 354 backend tests, chaos 75k requests 0 violations, browser E2E 24/24 + 13/13, tsc/next build EXIT 0; live-provider latency/quality UNVERIFIED | backend `services/interviewer/*`, `routes/attempts_brain.py`; frontend `lib/voice/realtime-turns.ts`, `lib/voice/live-transcribe.ts` | C4 (additive), C9 (reader, unchanged), Case solve UX, Voice interview (talk mode), Voice + image input |

## Proposed CHANGELOG entry (for Antigravity on merge)
```
## 2026-09-30 — unified-interviewer — <backend sha> + <frontend sha>
One interviewer brain for text / STT / realtime voice behind INTERVIEWER_BRAIN (default off): explicit silence, help always honoured, ladder, repair, restraint, deterministic corrections, app-controlled realtime (out-of-band lines, barge-in, dedupe), migration 0071 (client_turn_id).
touches: see .brain/handoffs/ANTIGRAVITY_HANDOFF_unified-interviewer.md
breaking: no (C4 additive; C9 unchanged)   affects: Case solve UX, Voice interview, Voice + image input
```

## After merging
`git push` in both repos, then `node .brain\sync.mjs` in `consilio` so STATE.md picks up the new
commits. Do not hand-edit STATE.md.

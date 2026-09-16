# ANTIGRAVITY HANDOFF — adaptive interviewer/coach (Phase 1)

**STATUS: Phases 1-3 BUILT by Cowork, 2026-09-17 (FLAG-GATED OFF).** Gates: `py_compile` EXIT 0
on all touched files; `python -m tests.test_session_signals` = 33/33 PASS; adaptive message payload
verified against real production transcripts (no API call). NOT yet run against the live model — see
"Before flipping the flag".

touches: backend `services/session_signals.py` (new), `services/interviewer_decision.py` (new),
`prompts/interview_prompts_v2.py` (new), `tests/test_session_signals.py` (new),
`services/interview_engine.py` (modified — adaptive path behind a flag).
breaking: **no**. Zero contract/schema change. Default behaviour is byte-for-byte v1 (the flag is
off). No migration, no route change, no frontend change in Phase 1.

Full design + evidence: `D:\dev\mece\Claude outputs\MECE_interviewer_redesign.md` (grounded in the code
and 1,296 lines of real session logs). Read it before Phase 2.

## The problem (from the logs)
The interviewer is one un-instrumented model call driven by a single "EXAMINE, DO NOT TEACH, NEVER
HELP" prompt, served by two different models (Groq / gpt-4o-mini) that obey it inconsistently. Result:
a harsh refuser that interrogates stuck learners until they quit ("help, I am not getting it" ->
"That's what I'm here to observe" -> "bye"; a user literally typed "make you less erratic
questionnaire") AND a sycophant that rubber-stamps material errors ("Great! solid structure!"). No
notion of learner state, intent, materiality, or when to change strategy.

## What Phase 1 ships (flag-gated)
1. `services/session_signals.py` — DETERMINISTIC (no model call, no API key) read of the learner each
   turn: intent (help / wants_solution / wants_to_stop / scope_question / meta / answering),
   has_work, recent_probes, interviewer/candidate repetition, turns_without_progress, frustration,
   repair_due, ASR-garbage. Emits a compact SESSION SIGNALS text block. These are SIGNALS, not
   scripted replies — no phrase->reply mapping anywhere.
2. `prompts/interview_prompts_v2.py` — adaptive prompt (case + guesstimate) that JUDGES intent +
   materiality then picks the lightest move (continue / probe / correct / hint-ladder H1-H5 / reframe
   / analogy / repair / skip / demonstrate), under a TEACHING POLICY (exam | coached). Keeps v1's good
   invariants (own facts, identity lock, plain text, no rubber-stamp, no echoed arithmetic) and is
   written to be model-robust. Model prepends a one-line control tag `<<mode=…; intervention=…>>`.
3. `services/interviewer_decision.py` — parses + strips that control tag from the full string and from
   the token STREAM (degrades safely if the model ignores the contract; the reply is never lost).
4. `services/interview_engine.py` — behind `ADAPTIVE_INTERVIEWER`, builds v2 messages + signals and
   strips the tag while streaming. Flag OFF (default) = unchanged v1.

## How to enable (staging first)
- `ADAPTIVE_INTERVIEWER=true` on the backend host.
- `INTERVIEWER_TEACHING_POLICY=coached` (practice) or `exam` (mock realism). Default coached.
- Rollback = unset `ADAPTIVE_INTERVIEWER`. No deploy needed to roll back.

## Before flipping the flag in prod (REQUIRED)
- **Pin the interviewer to ONE model** (or enforce the tag post-check for both) — the two-persona bug
  is model variance, not the prompt. `services/ai_providers.resolve_llm("interviewer")`.
- Run a live-API smoke on staging: the golden situations in the design doc §12 (help-when-stuck ->
  hint not another question; reasonable assumption -> passes; material error -> caught; "leave it" ->
  graceful stop; frustration -> strategy change; repair after 2 failed probes). The deterministic
  signals are unit-tested; the model's USE of them must be eyeballed on real cases first.
- `openai` isn't installed in the local VM, so the engine import + live path can only be exercised on
  the backend host / container — do that on staging.

## Phase 2+ (not in this PR — see design doc §10,13)
- `attempts.session_state jsonb` + `cases.teaching_policy` migration; persist hint_level / repair
  state; enforce hint-ladder monotonicity + invariants in a deterministic post-check.
- `routes/attempts.py`: compute signals there and pass through (Phase 1 computes them inside the
  engine from the transcript, so no route change was needed).
- Frontend coached action row (Hint / Show approach / Show solution / Skip / Explain) + typed intents
  + "End & see results"; transcript summarisation after ~12 turns; `tools/eval_interviewer_behavior.py`
  in CI; reconcile the 0-scored engaged sessions with the validity gate.

## Files to commit (backend, explicit adds — never `git add -A`)
`services/session_signals.py services/interviewer_decision.py prompts/interview_prompts_v2.py tests/test_session_signals.py services/interview_engine.py`

---

## UPDATE — Phases 2 + 3 now built (still flag-gated OFF)
Gates: `py_compile` EXIT 0 (7 backend files); `python -m tests.test_session_signals` = 43/43 PASS;
`python -m tools.eval_interviewer_behavior` (OFFLINE) = 8/8 golden situations classified correctly;
frontend `npx tsc --noEmit` EXIT 0. Live-model eval still pending (staging, needs API).

### Phase 2a — two-persona bug fixed at the source
`services/interview_engine._resolve_adaptive_llm()` — when adaptive is on, the interviewer is PINNED
to one OpenAI model (`INTERVIEWER_ADAPTIVE_MODEL`, default gpt-4o-mini), bypassing the Groq/OpenAI
admin toggle. The same prompt no longer ships two opposite personas. The v1 path still honours the
toggle unchanged.

### Phase 2b — persistent learner state + per-case teaching policy
- Migration `consilio/supabase/migrations/0066_interviewer_adaptive_state.sql` — additive, idempotent:
  `attempts.session_state jsonb default '{}'` + `cases.teaching_policy text default 'coached'`
  (check: exam|coached). Deploy-safe in either order (reads are select("*")-safe; the write is
  try/except -> no-op pre-migration).
- `routes/attempts.py::post_message` now loads `session_state` + per-case `teaching_policy`, passes
  them + a `control_out` holder into the engine, and after the turn folds the model's control tag into
  `session_state` (hint ladder that ESCALATES on repeated stuckness and STEPS DOWN on progress; repair
  count; mode; frustration; a light learner_level). `services/session_signals.compute_signals` takes
  `prior_state` so the current hint rung is fed back into the prompt.

### Phase 2c — deterministic guardrails + telemetry
`services/interviewer_decision`: `StreamTagStripper` now parses the control tag; `update_session_state`
keeps the ladder monotonic; `detect_violations` flags banned "isn't specified" phrases, rubber-stamp,
and over-length. Streaming means we don't rewrite the live reply — violations are LOGGED
(`[interviewer] guardrail_violation ...`) for the eval harness + metrics (Part 16/17). A buffer-then-
check mode can be added later for hard enforcement at a latency cost.

### Phase 2d — offline + live behavioural eval
`tools/eval_interviewer_behavior.py`. OFFLINE (no API): asserts the deterministic signals classify
every real failure situation (8/8 pass now). `--live` (staging): calls the pinned model, strips the
tag, runs `detect_violations` + a gpt-4o-mini judge rubric, prints pass-rate. This is the release gate.

### Phase 3 — coached UI controls
`components/solve/ConversationalSolve.tsx` — a flag-gated ("Stuck?" Hint / Show approach / Skip /
Explain) quick-action row above the composer, sending canonical phrases the intent layer classifies.
Gated on `NEXT_PUBLIC_ADAPTIVE_INTERVIEWER === 'true'` — OFF by default, zero change to current UX.

## Enable (staging) — all OFF by default
- Backend host: `ADAPTIVE_INTERVIEWER=true`, `INTERVIEWER_ADAPTIVE_MODEL=gpt-4o-mini` (or gpt-4o to A/B),
  `INTERVIEWER_TEACHING_POLICY=coached` (fallback; per-case `cases.teaching_policy` wins).
- Run migration `0066_interviewer_adaptive_state.sql`.
- Frontend (Vercel): `NEXT_PUBLIC_ADAPTIVE_INTERVIEWER=true` to show the coached controls.
- **Then run `python -m tools.eval_interviewer_behavior --live` on staging and clear your bar before prod.**
- Rollback = unset `ADAPTIVE_INTERVIEWER`. No deploy needed.

## Files (Phases 2-3, explicit adds — never `git add -A`)
backend: `services/session_signals.py services/interviewer_decision.py prompts/interview_prompts_v2.py services/interview_engine.py routes/attempts.py tools/eval_interviewer_behavior.py tests/test_session_signals.py`
frontend: `supabase/migrations/0066_interviewer_adaptive_state.sql "components/solve/ConversationalSolve.tsx" .brain/handoffs/ANTIGRAVITY_HANDOFF_adaptive-interviewer.md`

## Still open (Phase 4)
Transcript summarisation after ~12 turns (context cost); the metrics dashboard (Part 17) on /admin;
reconcile the 0-scored engaged sessions with the validity gate; add golden eval cases as new failure
shapes surface.

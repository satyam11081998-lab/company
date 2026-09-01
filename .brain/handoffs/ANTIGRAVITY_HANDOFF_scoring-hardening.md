# ANTIGRAVITY_HANDOFF — scoring-hardening

**Owner brain:** Cowork
**Branches:** backend feat/eval (AI-evaluation-v2 surface) · frontend feat/solve (results page)
**Date:** 2026-09-01
**touches:**
- backend, single-answer scorer: `services/answer_validity.py` (NEW), `services/ai_scorer.py`, `prompts/scoring_prompt.py`, `prompts/guesstimate_scoring_prompt.py`, `routes/submit.py`
- backend, CONVERSATIONAL case scorer (the live ConversationalSolve `/attempts/{id}/submit` path): `prompts/interview_prompts.py`, `services/interview_engine.py`, `routes/attempts.py`
- frontend `app/(app)/results/[id]/page.tsx`
**breaking:** NO. C2 · Scoring return contract is **additive-only** — every stable key
(`score`, `breakdown`, `strengths`, `improvements`, `summary`; guesstimate `total`,
`dimensions`, `arithmeticOverridden`, `rawTotal`, `backstop.{findings,summary,notChecked,totalCapFactor}`)
is preserved. New fields (`dimension_feedback`, `red_flags`, `model_answer`, `validity`) are all optional.
**affects:** Case solve UX / results page (reads the new optional fields, safe fallbacks),
Dashboard/Guesstimate/Backstop unaffected (keys unchanged).

Cross-repo change; applied + verified on both trees.

---

## Why
Owner: feedback too thin; **gibberish sometimes still earned a score**; wanted marking
that reads like a real experienced interviewer and is harder to fool. Decision (owner):
richer feedback shown on the results page, and a **hard gate** — clear gibberish/off-topic
still creates a submission but **scores 0** with an explanation.

## What changed

1. **Validity gate (`services/answer_validity.py`, new).** Runs BEFORE the expensive scorer.
   - Layer 1 — deterministic, no API cost: catches only blatant nonsense (near-empty,
     repetition-padding, vowel-less keyboard-mashing). Deliberately conservative — a false
     positive is worse than one cheap call, so anything plausible defers to layer 2.
   - Layer 2 — `gpt-4o-mini`, temp 0: `{verdict: valid|thin|off_topic|gibberish, relevance,
     effort, reason}`. Fails OPEN (returns valid) if the screen errors — never blocks a paying user.
   - `gibberish` → score 0. `off_topic` → score 0 **only if relevance < 25** (a genuine answer
     the screen over-eagerly calls off_topic is scored, just flagged `thin`, so it can't be
     wrongly zeroed). `thin` → scored but the scorer is told not to inflate.
   - Hard-gated answers **skip the gpt-4o call** — abuse gets cheaper, not more expensive.

2. **Evidence-based prompt (`prompts/scoring_prompt.py`).** Every dimension score must cite
   what the candidate actually wrote; application beats mention; keyword/framework stuffing,
   memorised force-fits, restating the prompt, and unshown calculations are penalised and named
   in `red_flags`. Calibrated to be strict (most first attempts 40-65, 80+ reserved). Output is
   richer: per-dimension `{score, evidence, gap, to_improve}`, `red_flags`, and a case-specific
   `model_answer` outline. `max_tokens` 2500 → 4000. Guesstimate prompt gets the same discipline
   + `red_flags`/`model_answer` (calc_chain contract untouched — the backstop still owns arithmetic).

3. **Deterministic enforcement (`services/ai_scorer.py`).** Never trust the model's own sum:
   clamp each dimension to its ceiling and **recompute total = sum(breakdown)**, so the number
   and the bars can never disagree (this was previously unchecked). Normalises the new fields,
   syncs `dimension_feedback` scores to the enforced breakdown, attaches the `validity` verdict.
   Hard-gate returns a genuine, educational 0 (what a real attempt needs + a model-answer outline),
   not a bare error.

4. **`routes/submit.py`.** `SubmissionResponse` gains optional `dimension_feedback`, `red_flags`,
   `model_answer`, `validity`, passed through in both return paths. Additive.

5. **Results page (`app/(app)/results/[id]/page.tsx`).** New: a "not scored as a real attempt"
   banner (verdict gibberish/off_topic), per-dimension `evidence → gap → to improve` under each
   bar, a red-flags card, and a "how a top candidate would approach this" model-answer card. All
   guarded so older submissions (without the fields) render exactly as before.

6. **Conversational case scorer (`/attempts/{id}/submit`).** The live case-interview flow
   (ConversationalSolve) scores through `interview_engine.score_conversation`, NOT `submit.py`.
   Guesstimates there already reuse the hardened `score_guesstimate_answer`; CASES used a separate,
   weaker "holistic" prompt (`CONVERSATION_SCORING_SYSTEM_PROMPT`) with **no validity gate, no
   per-dimension evidence, and no enforcement**. `_score_case_conversation` now runs the SAME gate
   (screening only the candidate's turns + final recommendation, so the interviewer's coherent prods
   can't mask a gibberish session), the SAME evidence-based 6-dimension rubric (rewritten prompt,
   session-framed, with `dimension_feedback`/`red_flags`/`model_answer`), and the SAME deterministic
   enforcement by importing `_enforce_case` / `_rejection_case` / `_is_hard_reject` from `ai_scorer`
   (lazy import — no cycle). `attempts.py` `SubmitResponse` gains the same optional fields. So BOTH
   case entry points and BOTH guesstimate entry points now behave identically, and the same results
   page renders all of them.

## Adversarial notes
- **Off-topic false-positive** is the one way the gate could hurt a real user → relevance floor
  (`_OFF_TOPIC_RELEVANCE_FLOOR = 25`) means only near-zero-relevance text is zeroed.
- **Screen failure** fails open (scored normally) — never a hard block.
- **Consistency** — total is recomputed from clamped dims; can't exceed 100; bars always match.
- **Cost/latency** — +1 cheap mini call per submission (~1s, ~$0.0002); gibberish is *cheaper*
  than before (mini only, no gpt-4o).
- **Points/leaderboard** — score still feeds points; scores will trend lower/more honest going
  forward. Old submissions are NOT re-scored.

## Gates
- `python -m py_compile` on all eight backend files (both scorers) → **OK**.
- Pure-logic tests (clamp→sum enforcement, hard-reject floor, deterministic gate incl.
  false-positive checks on real/number-heavy answers) → **pass**.
- Frontend `npx tsc --noEmit` scoped to the results page → **EXIT 0**.
- **Not done (needs the real environment):** backend deploy; a live submission smoke test with
  `OPENAI_API_KEY` (the device VM can't import the Windows-venv deps); and eyeballing real
  gibberish / thin / strong answers end-to-end on the results page.

## Not touched
STATE.md / LEDGER.md / CONTRACTS.md — Antigravity finalises on merge. C2 stays v2 (additive).

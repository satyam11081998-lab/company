# ANTIGRAVITY HANDOFF - Prep Copilot v2 (role/company-aware, fully isolated)

**STATUS: BACKEND FOUNDATION BUILT + `py_compile` CLEAN. Isolated, flag-gated OFF,
migration NOT run, no UI yet. The Gemini grounding call is NOT runtime-tested (the
dev box has no `google-genai`/key; it compiles and is written to the documented
new-SDK API).** Nothing in the live cases/guesstimates interview or scorer changed.

owner directive captured (2026-09-23): any role or company (free-form) -> Gemini
scours the web + grounds it (with sources) -> a self-improving backend corpus ->
cast into an ISOLATED COPY of the interview engine (tweakable per role/company) ->
scored by an ISOLATED GPT rubric scorer. Gemini researches/generates; GPT scores.
Do NOT touch the existing interview/scoring for cases/guesstimates. USER-facing, Pro.

---

## touches (backend only)
NEW, isolated:
- `services/copilot/__init__.py`, `schemas.py`, `research.py`, `corpus.py`, `casting.py`, `scoring.py`
- `services/copilot/engine/` - VERBATIM COPIES of the interview stack, imports rewired to the
  copies, safe to tweak: `interview_engine.py`, `interviewer_decision.py`, `interviewer_mode.py`,
  `session_signals.py`, `learning_model.py`, `scorer.py` (copy of `services/ai_scorer.py`),
  `prompts_interview.py`, `prompts_interview_v2.py`, `prompts_scoring.py`, `prompts_guess_scoring.py`
- `routes/copilot.py` - Pro-gated, flag-gated route
- `migrations/2026-09-23_copilot_v2.sql` - 5 isolated tables

MODIFIED (additive only):
- `main.py` - 4 lines registering the copilot router (self-gates on the flag; heavy imports are lazy).

**NOT TOUCHED:** `services/interview_engine.py`, `services/ai_scorer.py`, `prompts/*`,
`routes/attempts.py`, `services/access_guard.py`, and everything else in the live path.
> NOTE: `services/session_signals.py` shows as MODIFIED in the working tree - that is ANOTHER
> brain's uncommitted WIP, NOT this feature. Do NOT stage it with this commit. Stage only the
> files listed above (all new) + `main.py`.

## breaking: NO
No CONTRACTS.md surface. New isolated feature, dormant until `COPILOT_V2_ENABLED` is set.
Pricing/quota (C9) untouched. Scoring stays GPT-only (platform lock preserved).

---

## Architecture (what was built)
1. **Research (`research.py`, GEMINI).** `research_pack(role, company)` -> grounded web research via the
   new `google-genai` SDK's `google_search` tool (with citations) -> a JSON-structuring pass -> an
   ADVERSARIAL expansion pass ("what would a real interview ALSO probe?"). Never raises: any failure
   degrades to an honest, LOW-confidence role-typical fallback Pack so the copilot always works.
   Guardrail: company-specific claims must be source-backed, else marked role-typical; never fabricate
   an employer's hiring process.
2. **Corpus (`corpus.py`, self-improving).** `get_or_build()` reuses a fresh stored Pack, else builds +
   stores it; refreshes on staleness (`COPILOT_PACK_TTL_DAYS`, low-confidence sooner) with a version
   bump; logs every build to `copilot_research_log`. Persistence is best-effort (research still serves
   the user if the DB write fails).
3. **Casting (`casting.py`).** Picks a Scenario and builds the interviewer's `case_content` + a
   role-emphasis block - CASTS what the interviewer asks, without altering the copied engine's adaptive
   logic (the engine copy is there to tweak later for deeper role-adaptive behavior).
4. **Engine (`services/copilot/engine/`).** A full copy of the live interviewer, tweakable. Driven via
   the same `complete_interviewer_reply(case_content, case_type, transcript, new_user_message)` contract.
5. **Scoring (`scoring.py`, GPT-only, ISOLATED).** `score_role_answer(pack, scenario, transcript)` builds
   the scoring system prompt FROM THE PACK RUBRIC (role dimensions, anchors, red flags) while keeping the
   original's evidence-based / anti-gaming spine; clamps each dimension, forces the sum. Never imports the
   live scorer's functions.
6. **Route (`routes/copilot.py`).** `GET /copilot/status`; `POST /copilot/pack`; `POST /copilot/practice/{start,message,submit}`. All Pro-gated, rate-limited, `assert_daily_budget()`-guarded, and behind `COPILOT_V2_ENABLED`.

## Tables (migration `2026-09-23_copilot_v2.sql`) - service-role only (RLS on, NO policy)
`copilot_packs` (the corpus, unique (role_key, company_key)), `copilot_research_log`,
`copilot_runs`, `copilot_messages`, `copilot_scores`. The client never queries these; the route mediates.

## Env
- `COPILOT_V2_ENABLED` = off by default; set truthy to turn the route on.
- `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) - required for real research; without it, fallback packs only.
- `COPILOT_RESEARCH_MODEL` (default `gemini-2.5-flash`), `COPILOT_PACK_TTL_DAYS` (30), `COPILOT_MAX_TURNS` (40).

---

## Phased steps + GATES
1. **DB.** Run `migrations/2026-09-23_copilot_v2.sql`. Gate: idempotent (run twice = no-op);
   `select count(*) from copilot_packs;` works; anon/authenticated see 0 rows (RLS).
2. **Backend deploy.** Gate: `python -m compileall services/copilot routes/copilot.py main.py` (DONE, clean).
   Ensure `google-genai>=1.0.0` installed (already in requirements) and `GEMINI_API_KEY` set.
3. **Runtime-verify the ONE unproven path (Gemini grounding).** With the flag on for a canary Pro user:
   `POST /copilot/pack {"role":"asset management","company":"BNY Mellon"}` -> expect a pack whose
   `sources[]` has real URLs, `assessment.numericals_expected` set, 5-7 role-specific rubric dims summing
   100, and 4-6 scenarios. If `google-genai` model name errors, set `COPILOT_RESEARCH_MODEL` to a
   grounding-capable model. Confirm the fallback path by unsetting the key (should return a low-confidence
   role-typical pack, not a 500).
4. **FRONTEND (next session), USER-facing, Pro-gated - the remaining slice:**
   - A `/copilot` (or extended `/coach`) page: free-text role + company intake -> call `/copilot/pack` ->
     render the grounded pack (rubric, frameworks, what-they-assess, "numericals expected", sources +
     confidence badge) -> "Start practice" -> conversation UI (COPY `components/solve/ConversationalSolve.tsx`
     into a copilot version calling `/copilot/practice/*`, do NOT reuse the live one) -> scored debrief from
     the isolated rubric (reuse the results deck).
   - **Simplify `app/(app)/upgrade/page.tsx`** (currently 516 lines, overexplained) to: one headline, the
     price, three role-spanning value bullets, CTA. Keep the C9 clarification-quota number consistent with
     `lib/tier.ts`. (Owner: "don't overexplain, keep it simple.")
   - Gate: `tsc --noEmit`, `next build`.
5. **Turn on** `COPILOT_V2_ENABLED` only after 3+4 pass QA.

## Guardrail checklist (the "grounded to truth" mandate)
- [ ] Every company-specific claim in a pack is source-backed, else labeled role-typical (research prompt enforces; spot-check).
- [ ] No fabricated hiring process; low-confidence packs are visibly flagged in the UI.
- [ ] Scoring is GPT-only (locked); research/generation is Gemini-only.
- [ ] Copilot tables are service-role only; no client query path.
- [ ] Live cases/guesstimates interview + scorer unchanged (diff shows only new files + additive main.py).

## Open (owner) decisions still live
- How far to push curated company depth vs. pure dynamic research (currently: fully dynamic + guard-railed).
- Whether to seed a few hand-authored packs (e.g., Area Sales Manager) as high-confidence anchors.

git: stage ONLY the new copilot files + `main.py` (NOT `session_signals.py`), commit, **push**, then `node .brain\sync.mjs`.

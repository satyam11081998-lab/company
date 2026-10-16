# ANTIGRAVITY HANDOFF — Interviewer arena (admin A/B test window)

## v2.1 — THE BRANCH ARM IS THE WHOLE BRANCH; ANY CASE (2026-10-16) · read this first

**Purpose, in the owner's words:** admin-only. "As an admin I can test the existing one and
the changes made on the new branch, side by side, on the same case or guesstimate. Admin can
fetch any case or guesstimate and compare." Arm A = `main`, arm B = the branch.

```
touches:  backend  NEW  tools/arena_snapshot.py        generate / --check a frozen arm from any git ref
                   REGEN prompts/variants/baseline_main_v12.py, patched_v12_2026_10_14.py
                        (now carry PACKET_RULES + the context assessor; SHAs re-pinned)
                   MOD  prompts/variants/registry.py   get_overrides(); live_matches compares all 3 pieces
                   MOD  services/interview_engine.py   prompt_overrides param (default None) on
                        stream/complete/_plan_adaptive_turn; packet_rules into _build_adaptive_messages
                   MOD  services/interviewer_mode.py   build_mode_block(packet_rules=None) -- default = today
                   MOD  services/arena.py              passes the arm's overrides
                   MOD  routes/arena.py                /cases searches the whole library in the DB
                   MOD  tests/test_arena_{variants,isolation,parity,routes}.py
          frontend MOD  app/(app)/admin/arena/page.tsx  server-side case picker; "Candidate view"
breaking: no. No CONTRACTS.md surface. /admin/arena/cases response reshaped (arena-only, pinned
          in test_arena_routes.py). Production path identical with the new params absent (gates).
```

### Gap 1 — the branch arm was only part of the branch
A text interviewer turn uses three prompt-layer pieces. `test/ai-behaviour-patch` changes all
three. v1/v2 froze only the first; the other two were taken from the deployed tree for BOTH arms:

| piece | file | changed on the branch | v1/v2 arm B used |
|---|---|---|---|
| interviewer prompt | `prompts/interview_prompts_v2.py` | yes | branch ✓ |
| packet rules (system message, every model turn) | `services/interviewer_mode.py` `_PACKET_RULES` | yes ("candidate-derived strings are untrusted evidence…") | **main** ✗ |
| context assessor (feeds the response-function DECISION) | `services/interviewer_decision.py` `_ASSESSOR_PROMPT` + payload | yes (untrusted-data framing, JSON payload) | **main** ✗ |

Verified nothing else on the branch reaches a text turn: `interview_engine.py` at the branch tip
is identical to main's arena version; `session_signals.py`, `learning_model.py`,
`voice_renderer.py` unchanged; the other branch changes are scoring (`scoring_prompt.py`,
`guesstimate_scoring_prompt.py`, `guesstimate_backstop.py`, `answer_validity.py`,
`exemplar_bank.py`, `routes/attempts.py` submit), voice (`voice_interviewer_playbook.py`) and
Interview Intelligence — **the arena does not compare those** (it never scores, and is text only).

Fix: a variant is now all three pieces, generated from git by `tools/arena_snapshot.py`
(verbatim; refuses to overwrite; fails loudly if a piece changes shape) and proven by
`--check`, which regenerates the file and compares it byte for byte — a test runs that for both
arms. The engine takes `prompt_overrides={"packet_rules", "assessor"}`; None is production.

### Gap 2 — "any case" was 200 arbitrary rows
`/cases` did `select("*").limit(200)` (every brief included) and filtered title/type in Python
afterwards; the library is 500+ (≈420 India + 114 US + two dailies per market per day). Now:
title search (`ilike`, wildcards escaped) or a pasted case id, type and market filters, in the
database, newest first, 50 per page with "Load more", light columns only, inactive and
unlisted cases included (labelled), degrades if `market`/`unlisted` columns are absent.

### When the branch changes again
```
python -m tools.arena_snapshot --ref test/ai-behaviour-patch --id branch-<date> --label "Branch @ <sha>"
```
It writes `prompts/variants/branch_<date>.py`, prints the registry row and the SHA to pin, and
prints a NOTE if the branch also changed interviewer CODE (signals, decision logic) — a snapshot
cannot carry code, and the arm would run main's version of it. Add the row, pin the SHA, run
`pytest tests/test_arena_variants.py`.

### Gates run (2026-10-16, owner's machine via the device shell)
- `python -m tools.arena_snapshot --check prompts/variants/baseline_main_v12.py prompts/variants/patched_v12_2026_10_14.py`
  → both **identical** to `5f66b3b` / `c4674d7`. The branch TIP (`f0fbbba`) has the same prompt
  layer as `c4674d7` (snapshots differ only in their header); its only code note is `a096831`,
  arena plumbing main already has.
- Arena suite: `pytest tests/test_arena_variants.py tests/test_arena_isolation.py
  tests/test_arena_routes.py tests/test_arena_parity.py` → **80 passed, 0 skipped**, including:
  each frozen arm reproduces from git; the frozen `main` arm's text is byte-identical to
  production on every lane (`live_matches` = `baseline-main` on all three pieces); each arm is
  briefed with its OWN packet rules and runs its OWN assessor; /cases filters in the database.
- **Mutation:** with `get_overrides` forced back to v2 behaviour (no overrides), the packet-rules
  and assessor tests both fail.
- **Production unchanged:** `git archive HEAD` copy vs patched tree, outputs diffed —
  `test_response_functions` (identical apart from ms timings), `test_interviewer_mode` (24
  known), `test_session_signals` (5 known), `test_learning_model`, `test_count_clarifications`,
  `test_markets`, offline `eval_interviewer_behavior` (16 known) → identical.
- `compileall` exit 0; router booted with the REAL admin gate → all 6 endpoints 401 (no token /
  bogus JWT); scoped `tsc --noEmit` on `page.tsx` + imports → exit 0; the picker exercised in
  headless Chromium inside the admin layout (search, type + market filters, Load more, pasted
  id, start) at 1440 and 390 px, no errors, no horizontal scroll.
- Not run: `next build` (Windows SWC binary); a live-model turn (OpenAI unreachable from the
  device sandbox).

---

## v2 — PRODUCTION PARITY (2026-10-16)

**STATUS (2026-10-16):** v1 below was ported to local `main` in both repos on 2026-10-14
(backend `12d59d5`, frontend `e3d93eb`/`848a2f7`/`a4fa137`) — **not pushed**; GitHub `main`
is still `5f66b3b` / `e8061be`. v2 lands on top of that, also on local `main`, not pushed.

**Why v2:** "so I can check the response in how it's working." The arena has to show the
text a candidate would actually receive. It didn't always.

```
touches:  backend  MOD  services/interview_engine.py  stream_interviewer_reply gains the same three
                        optional params complete_interviewer_reply already had (messages_builder,
                        llm_override, usage_out); _contextual_line gains llm/usage_out; one new
                        helper _record_or_log. ALL default to None = production, unchanged.
                   MOD  services/arena.py   runs stream_interviewer_reply, not complete_interviewer_reply
                   MOD  routes/arena.py     both arms in parallel; "Case ready" opening note; C9 quota by plan
                   NEW  tests/test_arena_parity.py   (12 tests)
                   MOD  tests/test_arena_routes.py   (+5 tests, contract keys updated)
                   MOD  tests/test_arena_isolation.py (fake model now answers streamed calls)
          frontend MOD  app/(app)/admin/arena/page.tsx
breaking: no. No CONTRACTS.md surface. Arena-only response keys added (session: opening_transcript,
          clarification; turn: clarification; config: tiers, default_tier) and pinned in
          test_arena_routes.py. Production streaming path: identical behaviour with the new params
          absent — proven, see gates.
affects:  Case interviewer (text, V12) — the production streaming function gained default-off params.
```

### What was wrong in v1 (proven, not suspected)

1. **The arena showed a cleaner interviewer than users get.** Production text turns run
   `stream_interviewer_reply`. In the question-allowed functions (OPEN, TARGETED_QUESTION,
   TARGETED_PROBE, RETHINK_CUE, CONTINUE_AS_AGREED, PROBE, NOISE, CHALLENGE_CLAIM,
   SANITY_CHECK) it streams the model's words with **no `sanitize_reply`**. v1 called
   `complete_interviewer_reply`, which sanitises every reply (strips praise openers, cuts a
   reply to its first question). Same faked model reply, same turn (OPEN):
   production sent *"…What's the split between dine-in and delivery? And how many outlets are
   company-owned?"*; v1's arena showed only the first question. So the `stacked questions`
   flag could never fire in the arena on the turns where users actually receive them.
2. **The pinned model did not reach presence lines.** `_contextual_line` always used the live
   default model, while the arena reported the pinned one (e.g. said "gpt-4o" when
   gpt-4o-mini answered).
3. **No opening note.** Every real attempt starts with the server-seeded system_note
   (`Case ready: <title>. Ask any clarifying questions before structuring.`) and the engine
   reads it every turn. v1 started from an empty transcript — and the two snapshot variants
   differ precisely in how they treat a system turn (review FIX 3), so v1 never exercised it.
4. **No clarification quota.** Production spends 7/12/20 questions by plan and, once spent,
   tells the interviewer to decline. v1 never sent that directive unless forced.
5. Seeded history disappeared from the panes after the first turn (render bug).

### What v2 does

- Each arm runs `stream_interviewer_reply` and joins the chunks exactly as
  `routes/attempts.py post_message` does. With `usage_out` passed, the engine hands its model
  calls back instead of logging them as production traffic; the arena logs each under
  `/admin/arena/turn` with real tokens and `meta.engine_endpoint`. Zero-cost fast-lane beats
  are not logged (nothing spent). `raw_reply` = the model text before post-processing;
  `enforced` now means "production post-processing changed this", which on streamed turns
  is correctly almost never.
- `model`/`provider` are `None` when no model ran (deterministic lane) instead of naming one.
- Both arms run concurrently (thread pool, 4 workers): one turn's wait, not two. Latency is
  still per arm.
- `/session` returns `opening_transcript`; the page seeds both arms with it (and prepends it
  to seeded scenarios). Quota copied from `routes/attempts.py` — `CLARIFICATION_QUOTA` and the
  note template are **copies pinned by test** (importing `routes.attempts` drags the whole
  attempts stack into the arena), so a change there fails `test_arena_parity.py`.
- Quota: `tier` on `/session` (default **free**, what most users are on), counted with the same
  `count_clarifications`, spent before the model call, "exhausted" only on a turn that asks for
  something once the quota is gone — `post_message`'s exact rule.
- Page: panes render with the solve chat's own bubble styles (system pill, red candidate
  bubble, "INTERVIEWER" label, `renderWithBold(stripSayLabel())`), a pending "thinking…" bubble,
  a **User view / Diagnostics** switch (remembered per browser; user view = only what the
  candidate sees; diagnostics = function, mode, intervention, guardrail flags, latency, words,
  model, raw-text toggle, "why"), a "Questions remaining" pill, a plan picker, per-turn
  quota/guardrail lines in the verdict bar. A silence renders as "the candidate sees no reply".

### Gates run (2026-10-16, on the owner's machine via the device shell, Python 3.10)

- `python -m pytest -q tests/test_arena_variants.py tests/test_arena_isolation.py
  tests/test_arena_routes.py tests/test_arena_parity.py` → **62 passed**.
- **Mutation check:** re-running the parity tests with the arena forced back to v1's
  `complete_interviewer_reply` fails exactly the question-turn parity, stacked-question and
  model-pin tests (3 failed / 4 passed — the lanes where v1 genuinely matched still pass).
- **Production unchanged, byte for byte:** `git archive HEAD` extracted to a scratch tree; same
  `.env`; outputs diffed. `tests.test_response_functions` (drives `stream_interviewer_reply`),
  `tests.test_interviewer_mode` (24 known failures), `tests.test_session_signals` (5 known
  failures), `tests.test_learning_model` → **identical output** to HEAD.
  `python -m tools.eval_interviewer_behavior` (offline) → identical (16 known mismatches;
  only the saved-file path line differs). `test_count_clarifications`, `test_markets`,
  `test_visuals_sanitizer` pass.
- `python -m compileall -q prompts services routes tests` → exit 0.
- Arena router booted with the REAL admin gate: all 6 endpoints → **401** with no token and with
  a bogus bearer.
- Frontend: scoped `tsc --noEmit` over `page.tsx` and everything it imports, using the repo
  tsconfig → exit 0 (canary file with a deliberate error through the same `@/` aliases → caught,
  so the check is not vacuous). Full-repo `tsc` exceeds the device shell's 3-minute limit.
- Rendered the real `page.tsx` (esbuild + the repo's Tailwind config/globals.css, backend mocked
  with v2-shaped responses) in headless Chromium at 1440 and 390 px: setup → three turns
  (question turn with a stacked question, fast-lane turn, hint-vs-silence turn) → Diagnostics →
  raw toggle → vote → reveal. No runtime errors, no horizontal scroll at 390 px.

**Not run:** `next build` (Windows SWC binary in `node_modules`; run on the dev machine);
a live-model turn (OpenAI is not reachable from the device sandbox) — that is acceptance step 3.

### Owner acceptance (replaces Phase 3 below where they overlap)

1. `npx next build` in `consilio` — clean.
2. Backend from `D:\dev\mece\consilio-backend` on `main`: `venv\Scripts\activate`,
   `python -m uvicorn main:app --port 8000`. Frontend: temporarily
   `NEXT_PUBLIC_API_URL="http://localhost:8000"` in `.env.local`, `npm run dev`, open
   `http://localhost:3000/admin/arena`. (Put the prod URL back after.)
3. Self-noise first (both arms `baseline-main`), then `baseline-main` vs `patched-2026-10-14`,
   plan **free**. Open with a clarifying question — that turn routes to OPEN, a question-allowed
   function, so you now see what users get, stacked questions included.
4. Spend 7 questions, then ask an 8th: the verdict bar says "out of questions — both
   interviewers were told to decline"; read how each arm declines.
5. `/admin/ai-usage` shows the turns under `/admin/arena/turn`.
6. Optional: run `migrations/2026-10-14_arena_votes.sql` so votes are tallied.
To check it on mece.in instead: push both repos (Render + Vercel deploy from `main`). That is a
production deploy of `services/interview_engine.py` — default-off params, proven identical
above, but still the live interviewer's file. Your call.

### Findings for separate tickets (pre-existing, NOT changed here)

- **Production may be shipping stacked questions.** On question-allowed turns the streamed reply
  skips `sanitize_reply`, so a two-question or praise-opening model reply reaches the candidate
  as-is (`_fold_session_state` only prints a `guardrail_violation`). The arena now makes this
  visible; whether to sanitise the stream (e.g. buffer to the first sentence boundary) is a
  product decision with a latency cost.
- **The behavioural eval has v1's blind spot.** `tools/eval_interviewer_behavior.py --live` and
  `tools/eval_interview_scoring.py` call `complete_interviewer_reply`, so on question turns
  they grade a sanitised reply users never get. Switch them to the streaming path before
  trusting their interviewer verdicts.
- **Context-assessor spend is unlogged.** `assess_context_with_llm` (hard-pinned gpt-4o-mini)
  writes no `ai_usage_log` row — invisible to the $10/day kill switch and the AI usage report,
  in production and in the arena alike.

---

## v1 — original build (2026-10-14)

**v1 STATUS (2026-10-14, superseded by the v2 section above): BUILT, usable core complete.**
Backend `test/ai-behaviour-patch` @ `ada42e4` (on top of the review fixes `c4674d7`).
Frontend `feat/interviewer-arena` @ `e3d93eb` (off frontend `main` @ `e8061be`).
**Why (owner):** "a test window in the admin panel for this feature only, because it is
the heart of the product … two chat windows, one existing main and one the branch …
like GPT gives two responses and asks which one was better … do adversarial checks at
every stage."

```
touches:  backend  NEW  prompts/variants/{__init__,registry}.py
                        prompts/variants/baseline_main_v12.py        (FROZEN snapshot, main @ 5f66b3b)
                        prompts/variants/patched_v12_2026_10_14.py   (FROZEN snapshot, c4674d7)
                   NEW  services/arena.py                            (isolated turn runner)
                   NEW  routes/arena.py                              (5 admin-gated endpoints)
                   NEW  migrations/2026-10-14_arena_votes.sql        (idempotent; OPTIONAL)
                   NEW  tests/test_arena_{variants,isolation,routes}.py  (34 tests)
                   MOD  services/interview_engine.py   (+3 optional params, all defaulting
                        to live behaviour: messages_builder, llm_override, usage_out)
                   MOD  main.py                        (include_router)
          frontend NEW  app/(app)/admin/arena/page.tsx
                   MOD  components/admin/admin-nav.tsx (one nav row)
breaking: no. C4 (routes) ADDITIVE: new admin-gated prefix /admin/arena, no existing
          route touched or renamed. C2 (scoring) untouched. C1/C6 schema untouched —
          arena_votes is a NEW table, nothing else altered. No frontend contract change.
affects:  Case interviewer (text, V12) — gains 3 optional engine params, default-off.
          Nothing else. No user-facing surface changes.
```

## The decision that shaped it

The ask was "one arm is main, one is the branch". Two git branches cannot be imported
into one Python process, and — the deeper problem — **a vote recorded against "the
branch" stops meaning anything the moment that branch moves or merges.** So an arm
selects a **frozen prompt-stack snapshot**, not a git ref. Baselines are measurement
instruments: `tests/test_arena_variants.py` pins each snapshot's SHA256 so an
accidental edit fails loudly instead of quietly invalidating every vote already cast
against it, and every vote row stores the fingerprint it was judged against.

Ships with three: `baseline-main` (5f66b3b, pre-patch), `patched-2026-10-14` (c4674d7,
the reviewed fixes), and `live` (the working tree — the arm you iterate with, and the
only one whose results are not reproducible later, which the UI says on its face).

Adding a variant is the extension point: copy the prompt file into `prompts/variants/`,
add a row to `registry.py`, pin its SHA in the test.

## Fidelity: the arena runs the real turn

`services/arena.py` calls `interview_engine.complete_interviewer_reply` — the same
function production uses. Session signals, the intervention gate, the response-function
decision, the control packet, tag parsing, mode enforcement and reply sanitising are all
the shared code path. **Only `messages_builder` differs per arm.** An arena that
reimplemented the turn would measure a fiction, which is why the engine got three small
optional params instead.

## Isolation (enforced by test, not by intention)

No `attempts` or `attempt_messages` row, no clarification quota spent, no learner
profile persisted. The learning-model functions are pure, so each arm's `prior_state`
lives in its own dict — and **each arm carries its own**, because sharing one would let
arm A's hint ladder and repetition memory drive arm B's reply and void the comparison.
`test_arena_isolation.py` proves the module cannot reach those tables (AST + source
scan) and that the caller's state dict is never mutated.

The one deliberate non-isolation: **arena spend IS written to `ai_usage_log`** under
`/admin/arena/turn` with real token counts, because the $10/day kill switch reads that
table and silent arena spend would be the worse bug. `assert_daily_budget()` runs
before either arm is called.

## Two findings that change how you must read a result

Both were discovered while building this, both are surfaced per turn, and neither was
in the original plan:

1. **V11 answers MOST candidate turns in a deterministic lane** — silence, or a canned
   beat ("Mm-hm. Go on."). No prompt is built at all, so both arms emit byte-identical
   text. Verified: of three realistic turns, two routed to `render=fast` and only an
   explicit "help na i'm not getting this" reached the model. The turn is therefore
   marked `comparable: false`, the reason is shown, and **the vote buttons are
   disabled**. Reading those turns as "the prompts are equivalent" is the easiest wrong
   conclusion this tool could invite.
2. **`enforce_mode` can replace a reply outright.** In HINT mode a canned model reply
   came back as "Consider a different structural approach here." — the enforcer's words,
   not the prompt's. Each arm therefore reports `raw_reply` next to the shipped reply
   plus an `enforced` flag, and the UI offers a raw/shipped toggle. Without it the prompt
   gets credit or blame for the enforcer's rewrite.

## Adversarial checks, by stage

**Variant layer** (`test_arena_variants.py`, 9) — frozen SHAs pinned; frozen snapshots
import nothing but `typing` (AST-checked, so a baseline cannot move when you edit live);
the two baselines must actually *differ* (identical arms would make any "winner" pure
noise); every variant conforms to the messages interface; an unknown id **raises instead
of falling back**, because a silent fallback would attribute one variant's replies to
another; provenance asserted (the "before" really does claim a human interviewer, the
"after" really does carry the restored banned-phrase list).

**Turn runner** (`test_arena_isolation.py`, 9) — static isolation proof; full end-to-end
turn against a **faked model** (free, deterministic, no network); control tag never
reaches the reply in either the shipped or raw text; spend logged with real token counts;
input state not mutated and arms' states distinct; violations detected; a fast-lane turn
flagged as not consulting the prompt and spending nothing; a failing arm degrades to an
error row instead of killing the comparison; unknown variant refused before any spend.

**HTTP layer** (`test_arena_routes.py`, 16) — **blinding: no variant id appears anywhere
in the session or turn response** (asserted against the serialised JSON, including the
stub's deliberate `SHOULD-BE-STRIPPED` canary); every endpoint admin-gated (asserted by
source inspection, since the gate is patched out elsewhere); one admin cannot act in
another's session; validation and the budget cap run **before** any arm executes;
unknown variant → 400; bad policy → 400; missing session → 404; tie/both_bad record no
winner; an unsaved vote says so and still reveals; same-variant flagged as a self-noise
run; response shapes pinned against what the page reads.

**Live boot** — app starts with the router; all five endpoints return **401**
unauthenticated and with a bogus bearer token.

**Migration** — parses under `pglast` as 5 valid PostgreSQL statements; all 4 creates
guarded by `if not exists`; RLS on with no policy, so anon/authenticated see nothing.

**Frontend** — `tsc --noEmit` clean; no `dangerouslySetInnerHTML` anywhere (all model
output renders as escaped text nodes).

**Method guards in the UI** — sides randomised per session and held only server-side;
reveal strictly after the vote; seeding from the 50 adversarial eval scenarios, because
inventing your own turns drifts to the happy path which is exactly where the prompt never
runs; **once you vote the session is flagged "no longer blind"** and later turns are
tagged "judged after the reveal", since there is no un-knowing the pairing; a single vote
returns a small-n warning; same-variant-both-arms is labelled a self-noise check that
measures the judge rather than the prompts.

## Known limitations — read before trusting it

- **The blinding map is in process.** `routes/arena.py::_SESSIONS` holds only the
  side→variant assignment (deliberately, so the browser cannot know it). Consequences:
  the backend must run **`--workers 1`** (which `RENDER_OOM_FIX.md` already recommends
  for memory reasons — confirm the Render start command), and a worker recycle
  (`gunicorn --max-requests 300`, also suggested in that doc) ends in-flight arena
  sessions. The failure is graceful and explicit — a 404 saying the blinding cannot be
  recovered, start a new session — but it will happen if the worker recycles mid-run.
  Fix only if it becomes annoying: an encrypted client-held token would survive both.
- **Only the prompt layer is swappable.** A code change — `guesstimate_backstop.py`,
  `assessment.py`, the signals or the gate — cannot be expressed as a variant. That is
  the deferred remote-arm proxy.
- **`next build` was not run**: this VM has the Windows SWC binary in `node_modules`.
  Run it on the dev machine before merging. `tsc --noEmit` is clean.
- **No live-model end-to-end run.** Every test fakes the model. The first real turn needs
  an admin JWT and spends money — that is the acceptance test below.
- **One vote is noise.** The tally that would make votes actionable is deferred.

## Deferred (agreed scope: "usable core")

Blind LLM judge (hidden until you vote so it cannot anchor you) · results page with
per-variant win rates by scenario shape and an n-too-small guard · remote-arm proxy for
code-level changes · voice-path arena (text only for now).

## Phased build steps + gates

**Phase 1 — variants + runner. DONE.** Gates: `python -m pytest -q
tests/test_arena_variants.py tests/test_arena_isolation.py` → 18 pass ·
`python -m py_compile services/arena.py prompts/variants/registry.py` exit 0 ·
frozen SHAs match the pins.

**Phase 2 — routes + migration + page. DONE.** Gates: `python -m pytest -q
tests/test_arena_routes.py` → 16 pass · `python -m compileall -q prompts services routes
tests` exit 0 · migration parses under pglast · app boots, all five endpoints 401
unauthenticated · `npx tsc --noEmit` clean.

**Phase 3 — acceptance on the dev machine. OWNER, NOT DONE.**
1. `npx next build` in `consilio` must be clean.
2. Optional but recommended: run `migrations/2026-10-14_arena_votes.sql` in Supabase SQL
   Editor. Without it the arena works and says, on every vote, that nothing was saved.
   (The exemplar bank has been dormant since September because its migration was never
   run — hence the loud banner.)
3. Backend on `test/ai-behaviour-patch`, frontend on `feat/interviewer-arena`, point
   `NEXT_PUBLIC_API_URL` at `http://localhost:8000`, open `/admin/arena`.
4. **First run must be a self-noise check**: set BOTH arms to `baseline-main`, seed
   `help_when_stuck_with_work`, play six turns and vote each. If you "prefer" one side
   more than about four times out of six on two identical systems, that is your noise
   floor and no close result should be believed.
5. Then `baseline-main` vs `patched-2026-10-14`, model pinned to `openai-mini`, seeded
   from `own_the_facts`-shaped and `wants_to_stop_frustrated` scenarios. Watch
   specifically whether the baseline says "isn't specified" and the patched one states a
   number — that is the FIX 2 claim from the review, live.
6. Confirm an arena turn appears in `/admin/ai-usage` under `/admin/arena/turn`. If it
   does not, the spend is invisible to the kill switch and that is a bug to report.

**Phase 4 — regression, already green.** `test_learning_model`,
`test_count_clarifications`, `test_visuals_sanitizer`, `test_markets` all pass ·
`test_interviewer_mode` 24 failures, `test_session_signals` 5 failures,
`python -m tools.eval_interviewer_behavior` 16 signal mismatches — **all identical to
baseline `5f66b3b`**, pre-existing in `services/session_signals.py`, untouched here.
Those 29 + 16 remain their own ticket.

## Blast radius
Everything is additive. The only shared file with behaviour in it is
`services/interview_engine.py`, which gained three optional parameters that all default
to exactly the live path; `stream_interviewer_reply` (the production streaming entry
point) is untouched. Rollback is a branch revert on either repo independently; the
frontend page is inert without the backend routes, and the backend routes are inert
without an admin calling them.

## Reminders
`git pull` before starting; `git push origin test/ai-behaviour-patch` and
`git push origin feat/interviewer-arena`, then `node .brain\sync.mjs` from
`D:\dev\mece\consilio`. Work in `D:\dev\mece` only, one profile at a time.

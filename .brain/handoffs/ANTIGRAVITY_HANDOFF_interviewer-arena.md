# ANTIGRAVITY HANDOFF — Interviewer arena (admin A/B test window)

**STATUS: BUILT 2026-10-14, usable core complete, NOT pushed, NOT on main.**
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

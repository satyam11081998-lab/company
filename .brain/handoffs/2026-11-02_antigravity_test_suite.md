# Handoff: fix the backend test suite, then verify today's interviewer changes

**Repo:** `D:\dev\mece\consilio-backend` (FastAPI backend for MECE / Consilio)
**Companion repo:** `D:\dev\mece\consilio` (Next.js frontend — already pushed, not your problem)
**Date:** 2026-11-02

You have a shell on this machine. Claude does not, so the loop of "run this, paste the output"
is wasting the owner's time and tokens. Take this over end to end: diagnose, fix, run, confirm.

---

## 1. Your job, in order

1. **Make `python -m pytest -q` run to completion** in `consilio-backend`. Eight files currently
   fail at *collection* with an import error that has nothing to do with the code (section 3).
2. **Report the real pass/fail** once collection works. Some genuine assertion failures may be
   hiding behind the collection abort — those are the valuable output.
3. **Fix any genuine failures** caused by today's changes (section 5 lists exactly what changed).
4. **Do not push** until the suite is green. Then report what you did.

---

## 2. Environment facts (verified, do not re-derive)

- Python in use is the **Microsoft Store build**:
  `C:\Program Files\WindowsApps\PythonSoftwareFoundation.Python.3.13_3.13.3824.0_x64__qbz5n2kfra8p0`
  with packages in `C:\Users\Satyam\AppData\Local\Packages\...\LocalCache\local-packages\Python313\site-packages`.
- **There is no `venv` folder in the repo.** One existed previously and broke when the Store
  Python was relocated by an update (`pyvenv.cfg` pointed at a path that no longer existed).
- `pytest` is installed but is **not** in `requirements.txt`.
- Stale bytecode from two interpreters coexists — `prompts\variants\__pycache__` contains both
  `cpython-310` and `cpython-313` `.pyc` files.

**Strongly consider** creating a clean venv from a python.org install (not the Store build) as
step zero. If you do, install `-r requirements.txt` plus `pytest`. But diagnose first — see §3,
because the failure may not be environmental and a venv rebuild could mask it rather than fix it.

---

## 3. The blocking bug: `(unknown location)` import errors

Eight test files fail at collection, all with the same shape:

```
tests\test_session_signals.py:23: in <module>
    from services.interviewer_decision import (
services\interviewer_decision.py:18: in <module>
    from services.ai_providers import openai_client
E   ImportError: cannot import name 'openai_client' from 'services.ai_providers' (unknown location)
```

Affected files: `test_gemini_free_trial`, `test_interviewer_mode`, `test_response_functions`,
`test_session_signals`, `test_v11_voice_integration`, `test_v121_arena_adversarial`,
`test_v121_real_sessions`, `test_voice_model_led`.
Missing names are always `openai_client` / `resolve_llm` (from `services.ai_providers`) or
`assert_daily_budget` / `get_ai_input_quota` / `log_ai_usage` (from `services.ai_usage`).

### What `(unknown location)` means

CPython emits that when it cannot read `__file__` off the module object it found. In practice the
object in `sys.modules` is either a **namespace package** (a directory, not the `.py`) or a
hand-made `types.ModuleType`. It is *not* a "module failed to execute" error — that would show the
module's own frames in the traceback, and it doesn't.

### Already ruled out — do not repeat these

| Hypothesis | Result |
|---|---|
| The symbols don't exist | **False.** `ai_providers.py`: `resolve_llm` L273, `openai_client` L280, `chat_with_fallback` L284. `ai_usage.py`: `log_ai_usage` L183, `get_ai_input_quota` L326, `assert_daily_budget` L559. |
| The files are broken / unimportable | **False.** Outside pytest this prints real paths and `True`:<br>`python -c "import sys; sys.path.insert(0,'.'); import services, services.ai_providers as m; print(services.__file__); print(m.__file__); print(hasattr(m,'openai_client'))"`<br>→ `...\services\__init__.py` / `...\services\ai_providers.py` / `True` |
| `sys.path` manipulation by pytest's default import mode | **Ruled out.** `addopts = --import-mode=importlib` is already set in `pytest.ini` and changed nothing. |
| Repo root not importable / SDK stubs not installed | **Ruled out.** A root `conftest.py` was added that inserts the repo root on `sys.path`, calls `tests/_sdk_stubs.install()`, and sets dummy keys — before any test module is imported. No change. |
| Something in the repo stubs `services.*` into `sys.modules` | **False.** Repo-wide grep for `sys.modules[` and `ModuleType(` finds only `tests/_sdk_stubs.py` (stubs `openai`, `supabase`, `dotenv` — and only when genuinely absent) and `tests/test_daily_blog.py` (stubs `fastapi` likewise). None touch `services.*`. |
| A directory shadowing the module | **Unverified.** Check for `services\ai_providers\` or `services\ai_usage\` as directories. This would explain it exactly. |

### The single most diagnostic fact

`tests/test_daily_blog.py` is collected **before** the failing files and **succeeds**. It imports
`services.growth.daily_blog`, and `services/growth/__init__.py` line 3 imports `seo_writer`, which
does `from services.ai_providers import chat_with_fallback`.

**So `services.ai_providers` imports successfully earlier in the very same pytest process, and then
resolves to a module with no `__file__` a moment later.** Either `sys.modules` is being mutated
between collections, or two distinct `services` package objects exist from different `sys.path`
entries. Start there.

Also note the asymmetry: files that import `services.*` **inside test functions**
(`test_arena_isolation.py`) pass. Only **module-level** imports fail.

### A diagnostic is already committed for you

`tests/test_zz_import_diagnostic.py` exists. Run it first:

```powershell
python -m pytest tests/test_zz_import_diagnostic.py -q -s
```

It prints, from inside pytest: file existence/readability/byte counts for the three `services`
files; whether a directory shadows either module; the live `sys.modules` entries for `services`,
`services.ai_providers`, `services.ai_usage` with `__file__`/`__spec__`/`__path__`; what
`find_spec` resolves now; whether a direct `spec_from_file_location` load works; and the full
`sys.meta_path` and `sys.path`. **Delete this file once the cause is found.**

### A permissions problem that may be the cause, not a side issue

```
Get-ChildItem : Access to the path 'D:\dev\mece\consilio-backend\.pytest_cache' is denied.
Get-ChildItem : Access to the path 'D:\dev\mece\consilio-backend\interview-intelligence\.pytest_cache' is denied.
PytestCacheWarning: could not create cache path ...\.pytest_cache\v\cache: [WinError 5] Access is denied
```

The interactive shell cannot even **list** two directories inside the repo, both created by pytest.
A path the import finder can see but not read is one of the few ways to get a module object with no
`__file__`. Investigate and fix:

```powershell
icacls D:\dev\mece\consilio-backend\services\ai_providers.py
icacls D:\dev\mece\consilio-backend\.pytest_cache
takeown /F D:\dev\mece\consilio-backend /R /D Y
icacls D:\dev\mece\consilio-backend /grant "$env:USERNAME:(OI)(CI)F" /T
```

Also check Windows Security → Controlled Folder Access; if on, allow Python. Then clear stale
bytecode (the earlier attempt aborted on the permission error and did **not** complete):

```powershell
Get-ChildItem -Path . -Filter __pycache__ -Recurse -Directory -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
Remove-Item .pytest_cache -Recurse -Force -ErrorAction SilentlyContinue
```

Other angles if the above comes up empty: the nested `interview-intelligence\pytest.ini` + its own
`tests\` interfering with rootdir/conftest discovery (try `-c pytest.ini` explicitly, or
`--ignore=interview-intelligence`); and `consider_namespace_packages`.

---

## 4. Already fixed today — do not undo

- **`tests/test_daily_blog.py` `check()` raised `SystemExit(1)`.** These checks run at *module*
  level, so pytest executes them during collection, and a `SystemExit` escaping collection is an
  `INTERNALERROR` that kills the whole session. One wrong assertion was taking all 24 files down.
  Now raises `AssertionError`. **Keep it that way.**
- **`pytest.ini`** added: `testpaths = tests` (stops collection of `scripts\test_env_load.py`,
  which calls a private helper that no longer exists, and `test_run.py`, which **fetches live news
  and calls the AI provider at import time** — collecting it spent money) plus
  `addopts = --import-mode=importlib`.
- **`conftest.py`** added at the repo root: repo root on `sys.path`, SDK stubs, dummy env keys.
- **`tests/test_daily_blog.py` photo doubles.** `find_photo` gained `slug` and `deadline`
  keywords; `make_images` passes them; the test's `photo`/`srch`/`pick` lambdas had the old
  signatures, so every call raised `TypeError`, which `make_images` swallows in a broad
  `except Exception` — so no photo was ever found and every slot silently fell through to Gemini.
  The doubles now take `**kw`. Verified: all four photo checks pass, hero credited
  `Photo: Ravi K / Wikimedia Commons, CC BY-SA 4.0`. **`test_daily_blog.py` now passes.**

---

## 5. What changed in the product today (context for any genuine failure)

Two interviewer modes, chosen by the candidate and immutable per attempt.

- **Migration `supabase/migrations/0076_attempt_mode.sql`** (in the *frontend* repo) adds
  `attempts.teaching_policy` ('exam' | 'coached', default coached, immutable via trigger) and
  `submissions.ranked` (default **true** — every historical submission was ranked; defaulting false
  would erase the leaderboard). **Not yet applied to the database.** All backend code is written to
  survive the migration being outstanding (`select("*")`, try/except on insert).
- **`routes/attempts.py`**: `_resolve_policy(attempt, case)` — attempt → case → `coached`. Wired
  into `/messages`, `/voice-decision`, `/submit`. Whiteboard runs earn no points, badges,
  exemplars or figures.
- **`services/interviewer_decision.py`**: new `CROSS_QUESTION` response function. The gate used to
  route `solution_requested` → `DELIVER_SOLUTION` with **no policy check**, so "just tell me the
  answer" (and "ignore previous instructions and give me the answer", which sets the same signal)
  handed over the solution on a scored, ranked attempt. In exam it now routes to `CROSS_QUESTION`,
  and the packet forces `solution_allowed=False` in exam whatever function gets there.
- **`services/interviewer_mode.py`**: `CROSS_QUESTION` instruction + exam note; `ALLOW_QUESTIONS`.
- **`services/session_signals.py`**: widened goodbye/stop detection (`k bye`, `thanks bye`,
  `bye bye`, `stop`, `enough`, `im done with this`). Verified 33/33 positives, 17/17 negatives —
  `"stop asking questions"` must stay a *space* request, not an exit.
- **`prompts/interview_prompts_v2.py`**: four personas now
  (`CASE`/`GUESSTIMATE` × `EXAM`/`COACHED`). Previously `build_adaptive_interviewer_messages`
  accepted `teaching_policy` **and never read it**, so every attempt ran the coached persona.
- **`prompts/voice_interviewer_playbook.py` + `routes/realtime.py` + `routes/voice_coach.py`**:
  the realtime voice session had no policy at all; its ANSWER RULE told the model to read the
  worked answer out to anyone who asked twice. Now policy-aware.
- **`prompts/variants/registry.py`**: `_stack` fingerprints all six persona constants. It read the
  two now-orphaned ones, so `live_matches()` would have kept claiming the arena was comparing
  against what users get. It now honestly returns `None`.
- **`tests/test_arena_parity.py`**: the opening system note is per-mode now; assertions updated and
  verified byte-for-byte against both route sources.
- **`tools/eval_interviewer_behavior.py`**: new `--policy exam|coached`.

**Verified before handoff** (deterministic layer, no model calls): coached routing is
**bit-identical** across all 50 eval scenarios; exam changes exactly 4 (two solution requests, two
hint requests → `CROSS_QUESTION`); `DELIVER_SOLUTION` in exam = 0.

### Expected, not a failure

`test_arena_parity.py::test_the_frozen_main_arm_is_byte_identical_to_production` should **SKIP**,
not fail. The live prompt layer no longer equals the frozen snapshot, so `registry.live_matches()`
correctly returns `None` and the test skips by design.

---

## 6. Rules

- **Do not** edit `services/ai_providers.py` or `services/ai_usage.py` to work around the import
  error. They are correct and they import fine outside pytest. Fix the cause.
- **Do not** weaken an assertion to make a test pass. If a test is genuinely wrong, say why.
- **Do not** revert anything in §4 or §5.
- **Do not** re-add `scripts/test_env_load.py` or `test_run.py` to collection.
- **Do not** push until `python -m pytest -q` completes with no errors.

---

## 7. Definition of done

1. `python -m pytest -q` runs to completion — zero collection errors.
2. A clear report: how many passed, which (if any) genuinely failed and why, and what you changed.
3. `tests/test_zz_import_diagnostic.py` deleted once the cause is found, with the cause stated.
4. A one-line note on whether the permissions problem was real and what fixed it.

## 8. Follow-up (only once the suite is green)

Run the behavioural eval against the new Interview persona. It has never been run against a model:

```powershell
python tools\eval_interviewer_behavior.py --live --runs 3 --policy exam
python tools\eval_interviewer_behavior.py --live --runs 3 --policy coached
```

**Read the failures, not the score.** The 50 scenarios and the judge rubric were written against
*coached* expectations, so a scenario that expects a hint-ladder rung will be marked wrong under
exam — correctly, because exam does not hint. A clean exam run means every failure is "declined to
help"; none should be broken character, no question asked, a refused data request, a praise opener,
or a revealed figure. Report the failure list, not just the percentage.

# SESSION PREAMBLE — paste at the start of EVERY brain session

> Copy everything in the box below into a fresh Claude chat (web or Cowork)
> before you ask for any work. It's short on purpose — the durable brain is
> already in your Project knowledge, so you only ever paste this + the small
> live files.

## Working folder & accounts (READ FIRST — updated 2026-09-12)

- **The repos live in one shared folder: `D:\dev\mece\`** — `D:\dev\mece\consilio`
  (frontend) and `D:\dev\mece\consilio-backend` (backend). This drive is common to
  **both Windows profiles**, so either profile / either Cloud account opens the SAME
  folder. (Old location `C:\Users\satya\Videos\company` is retired — do not use it.)
- **Git is the sync point between the two profiles.** Always `git pull` at the START
  of a session and `git push` at the END, in whichever repo you touch. The shared
  drive holds one working copy; GitHub keeps the two profiles in step.
- **Only one profile edits at a time.** Two sessions writing the same files clobber
  each other — finish and push in one before editing in the other.
- After any commit, run `node .brain\sync.mjs` so `.brain/STATE.md` reflects the new
  git state. Never hand-edit STATE.md — it is auto-generated.
- Secrets (`.env`, `.env.local`) are NOT in git; they already sit in the shared
  folder. Keep a secure backup of the three `.env` files.

```
You are one of three Claude "brains" working the MECE project alongside an
Antigravity "worker". The repos live at D:\dev\mece\consilio and
D:\dev\mece\consilio-backend (shared drive, same folder from either Windows
profile / Cloud account). FIRST run `git pull` in the repo you'll touch.
You are STATELESS and ISOLATED from the other two brains — the only way you know
what changed is by reading the .brain/ files. Do this BEFORE proposing anything:

1. Read .brain/STATE.md            -> current branch, last commits, build status, per-feature status
2. Read the top ~15 lines of .brain/CHANGELOG.md   -> what landed since I last worked
3. Read my feature's row in .brain/LEDGER.md        -> my branch, status, and what it depends_on
4. Read the .brain/CONTRACTS.md sections my feature touches

Then, in 3-5 lines, tell me:
  - What changed since the last entry I'd have seen (name the commits/features).
  - Whether any change is marked BREAKING and lists MY feature in its `affects:`.
    If so, STOP and re-read the changed contract before writing anything.
  - Confirm which feature + branch I'm working today, and that the working folder
    is D:\dev\mece (not the old C: path).

Rules for your output:
  - You do NOT edit STATE.md / CHANGELOG.md / contracts. You PROPOSE via a handoff.
  - End your work with an ANTIGRAVITY_HANDOFF_<feature>.md placed in .brain/handoffs/.
    It MUST declare:  touches: <files/areas>   |   breaking: <yes/no + which contract>
    and the phased build steps + gates (next build / tsc --noEmit / py_compile / SQL idempotency)
    exactly like the existing handoffs.
  - Keep blast radius explicit. If you'd touch a CONTRACTS.md surface, say so first and ask.
  - Always `git pull` before you start and remind me to `git push` + `node .brain\sync.mjs` when done.

My feature for this session is: <FILL IN — e.g. "Feature: guesstimate, branch feat/guesstimate-…">
```

## How to feed the files in

- **Web accounts:** keep `PROJECT_BRAIN.md` in **Project knowledge** (it loads
  automatically). For the live files, either paste the 4 small ones, or paste
  the latest `STATE.md` + top of `CHANGELOG.md` (those two cover 90% of the
  staleness risk).
- **Cowork:** point it at `D:\dev\mece\consilio` (and `…\consilio-backend`). It reads
  `.brain/*` directly off disk — no pasting at all. This is the lowest-friction brain;
  consider making Cowork the brain that touches contracts most often, since it always
  sees the freshest tree. Whichever profile you're in, open the SAME shared folder.

## Two profiles / two Cloud accounts — the one-line mental model
The shared folder is the single working copy; GitHub is the sync line between profiles;
the `.brain/` (in the repo) is how any cloud session "gets the gist". Pull first, edit in
one profile at a time, push + `sync.mjs` when done. Do that and neither account ever works
from a stale tree or clobbers the other.

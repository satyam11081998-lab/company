# MECE Build Ecosystem — Operating Guide

A formal, step-by-step runbook for running 3 Claude "brains" + 1 Antigravity
"worker" against the MECE codebase without anyone going blind or stale.

> **Read once, top to bottom. Then you only ever use §2 (daily loop), §4 (the
> Antigravity prompt), and §5 (errors).**

---

## 0. The model in one breath

- **3 brains** (2 Claude web + 1 Cowork) = THINK + AUTHOR. They never run code, never push, never edit shared state. They produce code + a **handoff file**.
- **Antigravity** = HANDS. It is the *only* actor that touches git and the *only* writer of `STATE.md` / `CHANGELOG.md` / `LEDGER` status. It applies handoffs, runs the gates, merges to `main`, regenerates state, pushes.
- **`main` + `.brain/`** = the shared memory. A brain "wakes up" by reading `.brain/` at the start of every session. That read is the thing that stops the other two from being blank.

One rule above all: **brains propose, the worker disposes.** Single writer = no races.

---

## 1. One-time setup (do this once, carefully)

### 1.1 Decide where `.brain/` lives — you have TWO repos
This is the thing most easily missed. You have **`company-main` (frontend)** and
**`backend-main` (FastAPI)**. Features routinely span both (the scoring contract
is backend `ai_scorer.py` + frontend `lib/scoring/*`; a guesstimate is frontend
`practice-hub.tsx` + backend SQL). So coordination state must live in **one place
that covers both repos**, not duplicated.

**Recommended:** put `.brain/` at the root of **`company-main`** (your primary
repo) and let it coordinate *both*. `CONTRACTS.md` already names backend surfaces
(C2 scoring, C4 API), so this works. Antigravity already has both repos on disk
under `…\consilio\`, so it can apply backend edits in `backend-main` while reading
`.brain/` from `company-main`.

**Cleanest alternative (optional):** a tiny third repo `mece-brain` that holds only
`.brain/`. Both code repos stay pure; the brain is versioned on its own. More tidy,
one more clone to keep pulled. Pick the first unless you like the separation.

### 1.2 Install the files
1. Copy the `.brain/` folder into the chosen repo root. Commit + push.
2. The durable architecture brain is **`.brain/PROJECT_BRAIN.md`** (the full updated
   project brain, the one big file in this folder — there is no second copy). Brains read it from the
   repo via the GitHub integration / off disk — they do **not** paste it. *(Optional
   later optimization: split §1–§19 into a leaner durable file and let the §9.x log
   live only in `CHANGELOG.md`. Not required — the `SESSION_PREAMBLE` already points
   brains at the small live files, so the full doc just serves as the searchable
   architecture reference.)*
3. (Optional but recommended) wire the auto-sync so `STATE.md` is never hand-maintained:
   ```bash
   # from repo root, one time:
   echo 'node .brain/sync.mjs' > .git/hooks/post-merge && chmod +x .git/hooks/post-merge
   ```

### 1.3 Set up the three Claude brains (GitHub-connected, RAG-aware)
**One Project per account, created once. A new *chat* per work session — never a new
project per session.** Each brain reads the repo through the **native GitHub
integration**, not through pasted text.

> **How the web brains see the repo:** Claude.ai has a built-in GitHub integration
> (all plans incl. Free; beta). In a chat or project, click the **"+"** (lower-left) →
> **"Add from GitHub"** → browse and select the `.brain/` folder plus only that brain's
> code dirs → then **"Sync now"** to pull the latest. It is a **synced snapshot, NOT
> live** — you must hit *Sync now* at the start of every session or the brain reads
> stale files. Docs: support.claude.com/en/articles/10167454 · claude.com/docs/connectors/github

| Account | One-time setup | Every work session |
|---|---|---|
| Web #1 (Brain A) | Create a Project ("MECE"). **Add from GitHub** → select `.brain/` + Brain A's lane dirs into Project knowledge. Paste the **Instructions-box text** below. | New chat in the project → **Sync now** → paste `SESSION_PREAMBLE`. |
| Web #2 (Brain B) | Same, its own "MECE" project. | New chat → **Sync now** → preamble. |
| Cowork (Brain C) | Point it at the **local repo folder** (it uses your computer/files directly — freshest brain). | **`git pull`** the folder first → open it → preamble. No GitHub sync needed. |

**Correction to an earlier assumption — Project knowledge does NOT reliably
"auto-load" the whole brain.** Projects use **RAG**: when knowledge grows past a
threshold (which can trigger early — around a dozen files), Claude *searches* the
files instead of loading them all into context. So a chat may not have the full
architecture in front of it. Two defenses:

1. **Put the must-never-be-wrong rules in the Project Instructions box** (always
   injected, never RAG'd — keep it short). Paste exactly this:
   ```
   You are one MECE "brain". Before any work: Sync the GitHub repo, then read
   .brain/STATE.md, the top of .brain/CHANGELOG.md, your LEDGER row, and the
   CONTRACTS sections your feature touches. State the latest CHANGELOG entry back
   to me BEFORE proposing anything — if you can't, you're stale: stop and re-sync.
   Never edit STATE/CHANGELOG/CONTRACTS or run git; only AUTHOR code + a handoff in
   .brain/handoffs/ declaring `touches:` and `breaking:`. Antigravity is the only
   actor that builds, merges, and pushes.
   ```
2. **Keep the selected file set tight** (`.brain/` + that lane's dirs only) so you
   stay in direct-load mode longer and RAG retrieves cleanly when it does kick in.

**Note on "three parallel codex" — you are NOT running three code processes.** Only
Antigravity ever executes, builds, or pushes. The three Claudes only think and write
files; they don't run in real time and nothing races at runtime. "Parallel" just means
a different feature open in each account. Three thinkers, one set of hands.

**Feature lanes** (record in `LEDGER.md` as each brain's default home):
- Brain A → case-solve / dashboard UX (frontend)
- Brain B → backend / scoring / guesstimate pipeline (Python + SQL)
- Brain C (Cowork, always-fresh) → casebook content + nav, and **contract-touching work** (give the freshest brain the surfaces that hurt most when stale)

Lanes are a default, not a wall — `LEDGER` + `CONTRACTS` tell any brain what it'll collide with.

### 1.4 Set up Antigravity (worker) — fresh start
1. Open **both repos** as the Antigravity workspace (the `…\consilio\` parent folder).
2. Paste the **Worker Prompt (§4)** as its persistent rules / standing context.
3. Confirm it can run, from a terminal it controls: `git`, `npm run build`,
   `npx tsc --noEmit`, `python -m py_compile`, and `node .brain/sync.mjs`.
4. Create the long-lived branch convention: `main` is protected/green; feature
   work happens on `feat/<area>-<short>`.

### 1.5 The Proof-of-Sync Gate — the single safeguard that matters most
There is no true "zero error" when a human shuttles context between stateless
agents — *you* are the bus. The one mechanism that gets closest is a **double
freshness check bracketing every change**, and it costs nothing but discipline:

- **Entry check (brain side):** a brain may not propose anything until it has
  restated the latest `CHANGELOG.md` entry back to you. If it can't name a recent
  change, its snapshot is stale → **stop, Sync now / `git pull`, restart the read.**
  (This is enforced by the Instructions-box text in §1.3 and the `SESSION_PREAMBLE`.)
- **Exit check (worker side):** before applying a handoff, Antigravity re-reads
  `.brain/` and **refuses** if the handoff's assumptions contradict current `main`
  (enforced by step 3 of the Worker Prompt in §4).

Skip the Sync and the entry check catches it. Pass the entry check and the change is
built on truth; the exit check then confirms truth hasn't moved since. Two independent
checks, run by two different actors — that redundancy is what makes a missed step
*recoverable* instead of *silent*.

---

## 2. The daily loop (every session, step by step)

1. **Pick** the feature + which brain owns it (`LEDGER.md`).
2. **New chat** in that brain's project → **Sync now** (web) or **`git pull`** the
   folder (Cowork). Paste `SESSION_PREAMBLE`, fill in `Feature: … / branch feat/…`.
3. **Brain passes the entry gate (§1.5).** It reads `STATE → CHANGELOG (top ~15) →
   its LEDGER row → relevant CONTRACTS` and **restates the latest CHANGELOG entry**
   plus whether any `BREAKING` entry lists its feature in `affects:`. If it can't
   name a recent change, it's stale — stop, re-sync, restart. If a contract it
   depends on changed, it re-reads that contract before writing.
4. **You give the task.** Brain authors the code + an
   `ANTIGRAVITY_HANDOFF_<feature>.md` in `.brain/handoffs/`, declaring `touches:`
   and `breaking:` and the phased build + gates.
5. **Hand off to Antigravity.** Paste the worker trigger (§4) pointing at that handoff.
6. **Antigravity lands it** (full sequence in §3).
7. **Done.** Next time B and C wake up, step 3 surfaces this change automatically.

---

## 3. Going into `main` (the exact flow Antigravity runs)

Branch-per-feature so git catches collisions for you. The worker executes:

```bash
git checkout main && git pull --ff-only
git checkout -b feat/<area>-<short>        # or checkout if it exists
# ...apply the files listed in the handoff (frontend -> company-main, backend -> backend-main)...

# GATES — all must pass or STOP (do not merge):
npm run build            # frontend
npx tsc --noEmit         # frontend types
python -m py_compile services/*.py routes/*.py prompts/*.py   # backend
# + any SQL idempotency check the handoff names (run twice in a scratch DB)

git add -A
git commit -m "feat(<area>): <summary>" -m "Touches: <files>" -m "Breaking: <no|contract>"
git checkout main && git merge --no-ff feat/<area>-<short>    # git refuses on collision -> see §5
node .brain/sync.mjs                                          # regenerates STATE.md
# append the CHANGELOG entry + flip the LEDGER status cell (worker does this)
git add -A && git commit -m "chore(brain): sync state for <area>"
git push origin main
git tag pre-merge-<date>-<area>   # optional safety tag BEFORE risky merges (see §6)
```

**The golden rule: `main` is always green.** A feature that doesn't pass all gates
never reaches `main`. That is what keeps Vercel deploys clean while work is in flight.

---

## 4. The Antigravity Worker Prompt (paste verbatim as standing rules)

```
You are the WORKER for the MECE project. Two repos are open: company-main (Next.js
frontend) and backend-main (FastAPI). Coordination state lives in company-main/.brain/.

YOUR ROLE: you are the only actor that touches git and the only writer of
.brain/STATE.md, .brain/CHANGELOG.md, and the Status column of .brain/LEDGER.md.
The three Claude "brains" only ever produce code + a handoff file. You apply it.

FOR EACH handoff in .brain/handoffs/ that I point you to:
1. Read it fully. Note its `touches:` and `breaking:` fields and its phased steps.
2. git checkout main && git pull --ff-only. Then checkout/create the feature branch
   named in the handoff (feat/<area>-<short>).
3. Apply ONLY the files the handoff lists. Frontend files -> company-main, backend
   files -> backend-main. Do NOT invent or "improve" code beyond the handoff. If a
   file in the handoff conflicts with current main (someone changed it since), STOP
   and report which file + which CONTRACTS.md surface is involved. Do not guess.
4. Run the gates the handoff specifies AND the standard ones: `npm run build`,
   `npx tsc --noEmit` (frontend), `python -m py_compile` on touched .py (backend),
   and run any SQL twice against a scratch DB to prove idempotency. If ANY gate
   fails: STOP, do not merge, paste the exact error, and wait.
5. On all-green: commit with a conventional message plus trailers
   `Touches:` and `Breaking:` taken from the handoff. Merge to main with --no-ff.
6. If the merge reports a conflict: DO NOT auto-resolve. List the conflicting files
   and stop — a human (or the owning brain) decides.
7. After a clean merge: run `node .brain/sync.mjs`, then PREPEND a CHANGELOG entry
   (date — area — short sha; one line; `touches:`; `breaking:` + `affects:`) and
   flip that feature's Status cell in LEDGER.md. Commit as `chore(brain): sync`.
   Push main.
8. Report back: branch, commit sha, gates passed, what landed, what's now in
   STATE/CHANGELOG. One short paragraph.

NEVER: edit code a brain didn't hand you; push a red build to main; silently resolve
a conflict; change a CONTRACTS.md surface without the handoff explicitly saying
`breaking: yes` and naming it.
```

---

## 5. Error playbook — when X happens, do Y

| Symptom | Who fixes | What to do |
|---|---|---|
| **`npm run build` / `tsc` fails on the branch** | Worker reports → owning brain | Worker stops, pastes the error. Feed the exact error back to the brain that authored the handoff; it patches the handoff. Never merge a red branch. |
| **`py_compile` fails (backend)** | same | Same loop. Backend gates are cheap — always run them even though backend rarely changes. |
| **SQL migration error (e.g. `42P10` ON CONFLICT)** | owning brain | Known class — your §9.36 case. `ON CONFLICT (col)` needs a **FULL** unique index, not partial. Worker runs the migration in a scratch DB first; if it throws, brain corrects the index/constraint before it ever touches prod. |
| **`git merge` reports a conflict** | human + owning brain | This is the collision alarm working as designed — two features touched the same file. Worker stops and lists the files. Decide which change wins, or have the later brain re-author against the new `main`. **Do not let the LLM auto-resolve unreviewed.** |
| **A brain proposed against stale state** | caught at §2.3 | If the brain's sync report doesn't mention a recent `CHANGELOG` entry it should have seen, it read stale files. Re-paste the latest `STATE.md` + `CHANGELOG` top and make it re-sync before it writes. |
| **`BREAKING` change to a contract** | all affected brains | Worker bumps the `CONTRACTS.md` version + lists `affects:` in the changelog. Every brain whose feature is on that list must re-read the contract at its next session before working. The `SESSION_PREAMBLE` enforces this. |
| **Deploy (Vercel/backend) fails but build was green** | human | Almost always env/secrets or a runtime-only path. Check the brain doc §3 (env vars) + §14 (deploy). Tag/rollback: `git revert` the merge commit, push; `main` returns to last-green. |
| **Antigravity edited shared state or stray code by mistake** | human | `git revert` that commit. Reinforce the Worker Prompt's NEVER list. Shared-state writes only happen via `sync.mjs` + the changelog/ledger step. |
| **Two brains clearly working the same surface** | you, proactively | `LEDGER.md` "collision watch" lists these (DB:`cases`, Scoring-contract). If two lanes both need it the same day, sequence them: land one, sync, then the second brain re-syncs and builds on top. |

---

## 6. What you may have missed — and a few outside-the-box upgrades

- **Two repos, one brain (covered in §1.1).** Easy to forget the backend exists when 90% of churn is frontend. Keep `.brain/` singular and cross-repo, or you'll re-create the blindness across repos.
- **The monolith will rot if you don't split it.** A 2,677-line append-only doc is a great *archive* and a terrible *working file*. Durable facts go in `PROJECT_BRAIN.md` (Project knowledge, auto-loaded); point-in-time changes go in `CHANGELOG.md`. Compact the `§9.x` log periodically — archive entries older than ~30 days into `ARCHIVE_BRAIN.md` so the live changelog stays a screenful.
- **Tag before risky merges.** `git tag pre-merge-<date>` before a schema or scoring-contract change. Rollback becomes one command instead of archaeology.
- **Let git generate the changelog.** Because the worker commits with `Touches:`/`Breaking:` trailers, you can later derive `CHANGELOG.md` straight from `git log` — zero hand-maintenance, fully trustworthy. (Phase 2, once the habit sticks.)
- **Add a CI gate (GitHub Actions).** A workflow that runs `npm run build` + `tsc --noEmit` on every push to a `feat/*` branch means `main` *cannot* go red even if someone skips the local gate. You already use Actions for daily-cases/news/keep-alive — this is the same muscle.
- **Make Cowork the contract owner.** It reads the live tree off disk, so it's always the freshest brain. Give it the lane that touches `CONTRACTS.md` surfaces most (schema, scoring) — the brain least likely to be stale should own the things that hurt most when stale.
- **Secrets discipline.** `.env*` never goes into `.brain/`, handoffs, or Project knowledge. Double-check `.gitignore` covers `.env*` in both repos before you push `.brain/`.
- **Keep brains hands-off git.** Don't let a brain run `git push` from Cowork's shell "to save a step." The instant two actors push, you get the exact races this system exists to prevent. Brain authors; worker pushes. Always.
- **Rate-limit reality.** Three accounts = three separate usage caps, but also three context windows you're keeping warm. Batch a feature's work into one brain-session where you can, so you're not paying the sync tax 10× a day.
- **A "session-end" ritual.** The only artifact that must leave a chat is the handoff in `.brain/handoffs/`. Once it's written, the chat is disposable — close it freely. Nothing lives in the chat; everything lives in the repo. That's what makes "fresh start every time" safe.
```

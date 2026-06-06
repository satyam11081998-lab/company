# .brain — START HERE (everything lives in this one folder)

This is the shared memory for 3 Claude "brains" (2 web + 1 Cowork) + 1 Antigravity
"worker". **Everything is inside `.brain/`. Nothing lives outside it.** Drop this
whole folder at the root of your `company-main` repo, commit, push — done.

> `.brain` starts with a dot, so it's a **hidden folder**. If you don't see it,
> turn on "show hidden files" (Finder: Cmd+Shift+. / VS Code shows it by default / `ls -a`).

## What every file is (one line each)

| File | What it is | Who edits it | You touch it… |
|---|---|---|---|
| `README.md` | this page — the map + setup + loop | you (rarely) | once |
| `OPERATING_GUIDE.md` | the full runbook (setup detail, merge flow, worker prompt, error table) | you (rarely) | when stuck |
| `PROJECT_BRAIN.md` | the **durable architecture** doc (the big one — stack, schema, all history) | brains, via handoff | read-only reference |
| `SESSION_PREAMBLE.md` | the block you paste at the start of **every** brain chat | you (rarely) | every session (paste it) |
| `CONTRACTS.md` | the shared surfaces that break things when they drift (DB, scoring, casebook, API) | brains, via handoff | when a contract changes |
| `LEDGER.md` | who owns which feature + what it depends on | worker (status) | to assign lanes |
| `CHANGELOG.md` | newest-first feed of what landed | **worker only** | read at session start |
| `STATE.md` | auto-generated "what's true right now" | **`sync.mjs` only** | read at session start |
| `sync.mjs` | regenerates `STATE.md` from git | the worker runs it | never by hand |
| `handoffs/` | where brains drop `ANTIGRAVITY_HANDOFF_*.md` proposals | brains write, worker consumes | every task |

**The two docs vs. the machinery:** `README.md` + `OPERATING_GUIDE.md` are *for you*
(read to set up). Everything else is the *running system* the brains and worker read
and write. `PROJECT_BRAIN.md` is the one big reference; there is no second copy.

## The model in one breath
Brains **think + author** (code + a handoff). The worker (Antigravity) **builds,
merges, pushes**, and is the *only* thing that touches git or writes `STATE`/`CHANGELOG`.
`main` + this folder are the shared memory. A brain "wakes up" by reading this folder.

## Set up once (full detail in `OPERATING_GUIDE.md`)
1. Commit + push this `.brain/` folder into `company-main` (it coordinates both repos).
2. (optional) auto-sync hook: `echo 'node .brain/sync.mjs' > .git/hooks/post-merge && chmod +x .git/hooks/post-merge`
3. **2 web brains:** one Claude Project each -> "+" -> Add from GitHub -> select `.brain/` + that brain's code dirs -> paste the Instructions-box text (OPERATING_GUIDE 1.3).
4. **Cowork (3rd brain):** point it at the local repo folder (reads `.brain/` off disk).
5. **Antigravity:** open both repos -> paste the Worker Prompt (OPERATING_GUIDE 4).
6. Assign feature lanes in `LEDGER.md`.

## Every session (the loop)
1. New chat -> **Sync now** (web) / **`git pull`** (Cowork).
2. Paste `SESSION_PREAMBLE`, fill in feature + branch.
3. Brain restates the latest `CHANGELOG` entry before working — if it can't, it's stale -> re-sync.
4. You give the task -> brain writes code + `handoffs/ANTIGRAVITY_HANDOFF_<feature>.md`.
5. Hand to Antigravity -> it branches, gates, merges, runs `sync.mjs`, pushes.
6. Other brains see it next session (step 1).

## The one rule
**Brains propose, the worker disposes.** Only Antigravity touches git or writes
shared state. Never let a brain push.

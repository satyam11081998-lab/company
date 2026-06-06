# CHANGELOG — newest first, one entry per landed change

Format (Antigravity appends on each merge):
```
## <date> — <feature> — <commit short sha>
<one line: what changed>
touches: <files/areas>
breaking: <no | yes — which CONTRACTS.md surface>   affects: <features that must re-sync>
```
A brain reading this at session start only needs the top ~15 lines.

---

## 2026-06-06 — reconciliation-audit — Phase 1 verification
Verified file presence and wiring for Guesstimate end-to-end (G1-G4), AI evaluation v2, Dashboard tiles, and Casebook misc frameworks. All confirmed present and flipped to BUILT.
touches: .brain/LEDGER.md
breaking: no   affects: none

## 2026-06-06 — reconciliation-audit — doc-vs-code sweep
Verified file presence + wiring against the latest upload. Flipped a whole cluster from "pending/not-built" to **BUILT & LIVE**: §9.31 daily-content+admin+keep-alive, §9.32 news pipeline, §9.33 dashboard daily tiles, §9.28 interviewer+conversational solve, plus structured items — payments audit trail (Razorpay verify+webhook write `payments`), voice input (Whisper/transcribe), image input (vision/extract-text), rate limiting (attempts.py), analytics (@vercel/analytics), privacy+terms pages, and badge_awarder (wired, graceful — not a crash). Still genuinely open: `vercel.json` (region pin), refund-policy page, `users.streak_count` column write. See PROJECT_BRAIN_MERGED.md "2026-06-06 FULL RECONCILIATION AUDIT".
touches: (status reconciliation only — no code change)
breaking: no   affects: none

## 2026-06-06 — casebook-guesstimates — (in tree, build-gate pending)
Guesstimates promoted from last section to **B** (`defaultOpen`); new 239-line "The Pain & The Promise" overview page (names the 30/25/20/15/10 rubric); 9 dead placeholder nav nodes removed; sections re-lettered C..F. See brain §9.38.
touches: lib/casebook/tree.ts, lib/casebook/content/index.ts, lib/casebook/content/guesstimates/pain-and-promise.ts
breaking: no — Casebook-Page-schema (C3) consumer only; route count changes on build (+1 real, −9 dead)   affects: Casebook

## 2026-06-06 — case-solve-unified — (in tree, build-gate pending)
`ConversationalSolve` now takes `initialCase` (server-passed, no re-fetch) / `historyPanel` / `lockedOverlay`; lock renders as an overlay (not a separate page); history+rating render inside the workspace. See brain §9.39.
touches: app/(app)/cases/[id]/page.tsx, components/solve/ConversationalSolve.tsx
breaking: no — reads existing cases shape (C1 reader only)   affects: none

## 2026-06-06 — nav+history-persistence — (in tree, build-gate pending)
Casebook nav-tree and attempt-history expand/collapse state now persist to `sessionStorage` with an `isMounted` hydration guard; nav defaults open only for "Getting Started"; attempt accordion defaults collapsed. See brain §9.40–9.41.
touches: components/casebook/nav-tree.tsx, components/case-attempt-history.tsx
breaking: no   affects: none

## 2026-06-06 — practice-hub-polish — (in tree, build-gate pending)
"Attempted" badge restyled to a success pill and relocated next to the difficulty chip; long attempt answers scroll-capped at 35vh. See brain §9.41.
touches: components/practice-hub.tsx, components/case-attempt-history.tsx
breaking: no   affects: none

## 2026-06-02 — backstop-fix — **BUILT & LIVE** (verified in code 2026-06-06)
Rewrote guesstimate arithmetic backstop: base/literal steps use stated value (never 0), only derived steps with all-finite inputs are flagged, `percent_of` handles %/ref/commas without crashing; if nothing verifiable, defer to LLM arithmetic. Fixed live false "all-zero" (e-rickshaw scored 71→77). `guesstimate_backstop.py` carries the "2026-06-02 hardening" docstring.
touches: services/guesstimate_backstop.py, prompts/guesstimate_scoring_prompt.py
breaking: no — return keys unchanged (total/dimensions/arithmeticOverridden/rawTotal + backstop.findings/summary/notChecked/totalCapFactor)   affects: none

## 2026-06-02 — guesstimate-G4 — **BUILT & LIVE** (verified in code 2026-06-06)
69 static guesstimates are attemptable `cases` rows; `code` column + FULL `cases_code_unique` index folded into `0001_baseline_schema.sql`; practice-hub Guesstimates tab is DB-driven (`cases` where `type='guesstimate'`); answer hidden pre-attempt. The standalone `add-code-column.sql`/`seed-guesstimates.sql` files were merged into baseline and no longer exist separately. **Guesstimate answerable end-to-end (G1–G4): DONE.**
touches: components/practice-hub.tsx, lib/types.ts, supabase/migrations/0001_baseline_schema.sql
breaking: yes — DB:`cases` gained `code text` (additive, now in baseline)   affects: Daily-content, Dashboard (no read change)

## 2026-06-02 — daily-content/admin/keep-alive — §9.31
Daily case/guesstimate generator rewritten to the REAL `cases` schema (was inserting nonexistent columns → 500s); admin 401/500 fixed; self-contained GitHub-Actions keep-alive + cold-start pre-warm.
touches: services/content_generator.py, routes/daily.py, routes/cron.py, app/(app)/admin/*, .github/workflows/*
breaking: no   affects: none

## 2026-06-02 — dashboard — §9.23–9.26
Dashboard rebuilt: Readiness Score v1, radar→bullet charts, next-action engine, monetization surface; /home merged into /dashboard; entry choreography + ambient motion (reduced-motion gated); Supabase getSession→getUser auth fix. 143 static pages.
touches: components/dashboard/*, lib/readiness.ts, lib/next-action.ts, app/(app)/dashboard/page.tsx
breaking: no   affects: none

## 2026-06-01 — casebook — §9.18–9.21
Casebook Core-Frameworks 9/9 + Toolkit 9/9 complete (10 cards across 9 nav slots); Miscellaneous Frameworks node authored as M&A-style hybrid.
touches: lib/casebook/content/**, components/casebook/*
breaking: yes (historical) — Casebook-Page-schema: NO `subtitleEmphasize`; `kind:"toolkit"` added   affects: any future Casebook page

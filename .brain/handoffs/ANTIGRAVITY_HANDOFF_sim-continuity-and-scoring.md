# ANTIGRAVITY_HANDOFF — sim continuity + question-scoring (owner spec, 2026-08-25)

Follows the landing redesign. **C0 is BUILT** (frontend-only, in this repo).
**C1–C3 are a spec, not code** — they touch the **separate FastAPI backend repo**
(`services/ai_scorer.py`, `routes/attempts.py`, `routes/submit.py` — NOT in this
`consilio` folder) and/or the **C2 scoring contract**, so they can't be built or
build-tested from the Cowork session. Each below names the real file + contract.

```
touches:  C0 → components/landing/interview-sim.tsx, components/dashboard/warmup-card.tsx (NEW), app/(app)/dashboard/page.tsx  [this repo, DONE]
          C1 → backend services/ai_scorer.py + services/clarification_counter.py; CONTRACTS C2 (scoring return); frontend results + dashboard
          C2 → backend routes/attempts.py + routes/submit.py; frontend a compare view
          C3 → mostly ALREADY EXISTS (components/leaderboard/leaderboard-client.tsx daily board)
breaking: C1 bumps CONTRACTS C2 (adds a field to the score payload) → coordinate both repos.
```

---

## C0 · Warm-up baseline (BUILT — for the record)
The landing sim is a tap-through on a SAMPLE case. Persisting its score as a real
rank would pollute the leaderboard (a tapped 84 ≠ a free-form 84) and teach users
the easy number is "theirs". So instead of ranking it, we **carry it forward as a
labelled baseline**:
- `components/landing/interview-sim.tsx` writes the result to `localStorage`
  (`mece:warmup` = `{score, craft, mode, dims[], ts}`) when it reaches the result
  phase. Click-only; `/` stays static.
- `components/dashboard/warmup-card.tsx` (NEW, `'use client'`) reads it on mount
  and renders a "Your warm-up · N/100 · Strong X / Work on Y" card with a CTA to
  today's real case; renders `null` when absent, stale (>14d), or dismissed.
- `app/(app)/dashboard/page.tsx` mounts `<WarmupCard caseId guessId />` above
  `<DashboardClient/>`.
- The sim's result CTA already funnels into the real case (`startReal()` → guest
  session → `/cases/{id}`), so the warm-up is a baseline the user then *beats*.

**Result:** no empty post-login state (the churn risk the owner flagged), effort
preserved and visible, ranks kept honest.

---

## C1 · Score the clarifying questions (interview-craft KPI)
**The sim promises this; the live product must deliver it or the landing over-claims.**

Foundation already exists: `services/clarification_counter.py` +
`count_clarifications()` (contract **C9**) already detect and count a candidate's
clarifying questions per attempt. C1 adds a **quality** read on top of the count.

- **Backend (`services/ai_scorer.py`):** when serializing the attempt for scoring,
  also assess the clarifying questions the candidate asked — did they surface the
  high-value unknowns (for a profitability case: channel mix, cost structure)
  before solving? Return a compact `question_craft: { score: 0–5, note: string }`
  alongside the existing 6-dimension rubric. **Keep it OUT of the 100-pt total** —
  it's a separate craft signal, not a 7th rubric dimension (changing the 100-pt
  rubric is a harder, more BREAKING change and dilutes the existing scores).
- **Respect C2 v2 addendum:** the scorer must not see WHICH turns were spoken —
  feed question text through the same `voice→text` collapse the rubric path uses.
- **Contract:** bump **C2 (scoring return)** to add the optional `question_craft`
  field. Both repos must agree; frontend must tolerate its absence (older backend).
- **Frontend (this repo):** surface it on `app/(app)/results/[id]/page.tsx` and in
  the dashboard as a small "interview craft" chip — mirroring the sim's read.
- **Gate:** the sim's landing copy already hedges ("interview-craft read"); once
  C1 ships, it's truthful. Until then, don't harden that claim.

## C2 · Guided vs free-form compare, in the real product
The sim demos this (round-2). In-product it means letting a user take the **same
daily case twice** — a guided/assisted pass and a free-form pass — and seeing both
scores side by side.
- **Backend (`routes/attempts.py` / `routes/submit.py`):** allow a second attempt
  on the same case/day tagged with a `mode` (guided|free), rather than one attempt
  per case/day. The `attempts` + `attempt_messages` tables already exist; this is a
  policy + a `mode` column, plus a compare read.
- **Frontend:** a compare view on the results/dashboard showing guided vs free
  deltas per dimension (the sim's `CompareBar` is the visual reference).
- **Decision needed:** does free-form replace guided on the leaderboard, or do both
  count? Recommend: **only free-form ranks** (guided is training wheels), so the
  board stays a fair test.

## C3 · Per-case "today's case" leaderboard — MOSTLY EXISTS
`components/leaderboard/leaderboard-client.tsx` already renders a daily-case board
(Podium + ranks, "N attempts today"). The zero-state ("No one has solved today's
case yet") was removed on owner instruction. **Remaining work is small:**
- Decide the empty-state (currently renders nothing) — a neutral "Scores appear as
  people finish today's case" line, or leave blank. Owner said "we'll work on this."
- If C2 lands, tag each board row with guided|free so a tapped run can't top a real
  one.
- No new backend needed unless you want a case-scoped board outside the daily one.

---

## Build order (when the backend repo is in hand)
1. C1 backend `question_craft` in `ai_scorer.py` (reuse `clarification_counter`);
   bump C2 contract; frontend surfaces it; unflag the sim's craft claim.
2. C2 `mode` on attempts + compare view; decide leaderboard policy.
3. C3 empty-state + guided/free tagging.

## Gates
Backend: `python -m tests.test_count_clarifications` still green; new
`test_question_craft` for C1. Frontend (this repo): `npx tsc --noEmit` EXIT 0,
`npm run build` EXIT 0 with `/` still `○ (Static)`. Results/dashboard tolerate a
backend that doesn't yet return `question_craft` (feature-detect, don't crash).

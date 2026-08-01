# ANTIGRAVITY_HANDOFF — interviewer-voice + solve-scroll + daily-done-state

**Author:** Cowork brain, 2026-08-01 (second batch of the session).
**Feature:** Case solve UX (`feat/solve`) + Dashboard (`feat/dashboard`).
**Trigger:** owner tested the live site straight after the quota fix landed and found
three things — the interviewer sounded robotic, the thread hid its own last messages,
and the dashboard still said "Start the case" on a case already solved.

```
touches:  backend  prompts/interview_prompts.py, services/interview_engine.py
          frontend lib/dashboard/daily-progress.ts (NEW), app/(app)/dashboard/page.tsx,
                   components/dashboard-client.tsx, components/dashboard/hero.tsx,
                   components/dashboard/guesstimate-card.tsx,
                   components/solve/ConversationalSolve.tsx
breaking: no. All new props are optional (`progress?`); undefined reproduces the
          previous behaviour exactly. No schema change, no migration.
affects:  Case solve UX, Dashboard, AI evaluation v2 (prompt file only — the
          SCORING prompts and their temperatures are untouched)
```

---

## 1. Interviewer voice

**Symptom.** A 7-question transcript where all seven replies began "Let's assume …".
Factually correct, completely lifeless.

**Cause, both halves.**
- `CASE_INTERVIEWER_SYSTEM_PROMPT` and `GUESSTIMATE_INTERVIEWER_SYSTEM_PROMPT`
  literally instructed: *invent a reasonable assumption and say "Let's assume X"*.
  The model obeyed, every single turn.
- `temperature=0.4` on the live turn. Low temperature + an explicit phrase to copy =
  a template.

**Fix.** Both prompts gain a `SOUND LIKE A PERSON, NOT A TEMPLATE` block:
never open two consecutive replies the same way (called out as a *failure*, not a
preference); a sample bank of varied hand-overs; react to what the candidate actually
said; occasionally turn the question back (~1 in 4-5, never twice running); shift
register once they move from questions into structure; never mention quotas/plans/
billing or that you are an AI. Sampling is now named constants in
`services/interview_engine.py`:

```
INTERVIEWER_TEMPERATURE        = 0.75   # was 0.4
INTERVIEWER_FREQUENCY_PENALTY  = 0.35
INTERVIEWER_PRESENCE_PENALTY   = 0.25
```

applied to BOTH `stream_interviewer_reply` and `complete_interviewer_reply`.
Penalties are deliberately small — the interviewer must be free to repeat domain
nouns (revenue, segment, market) turn after turn.

**Preserved verbatim — do not let a future edit drop these:** 1-3 sentences,
never solves the case, no praise or evaluation language, no bullets/headings,
Indian English register (Rs / lakh / crore), `max_tokens=180`, the refusal line for
"just solve it", and the wrap-up prompt. The `CLARIFICATIONS_EXHAUSTED_DIRECTIVE`
added earlier today is unchanged and still fires on spent quota.

**Scoring is untouched.** `ai_scorer.py` (0.3) and `score_conversation` (0.3) keep
their own low temperatures. The new constants are interviewer-only by design and
named so nobody reuses them for scoring.

## 2. Solve thread scroll

`ConversationalSolve` positions the composer `absolute bottom-0` OVER the thread, and
the thread cleared it with a hard-coded `pb-32` (128px). Every feature that grew the
composer — the clarification-quota banner, the voice-allowance line, a textarea
wrapping to a second line, the mic waveform — pushed the newest turns underneath it,
unreachable by scrolling. Now a `ResizeObserver` on the composer feeds
`composerH` (+24px breathing room) into the thread's `paddingBottom`, and the
scroll-to-bottom effect re-runs when that height changes.

## 3. Daily done-state (cases AND guesstimates)

**New:** `lib/dashboard/daily-progress.ts` — `getDailyProgress(submissions, caseId,
guesstimateId)` returns `{attempted, score, submissionId, attempts}` per item.
Derived from the `submissions` rows `app/(app)/dashboard/page.tsx` already fetches,
so this adds **zero database round-trips**.

Wired via an optional `progress` prop → `Hero` (all three variants: HeroCase,
HeroStreak, HeroReadiness) and `GuesstimateCard`. Two new exports from `hero.tsx`,
`DailyCaseCta` and `DailyDoneBadge`, keep the three variants consistent so a future
change lands in one place.

Behaviour once attempted: tick + "Attempted today · 85"; primary CTA opens
`/results/<best submission>`; secondary "Practice more" goes to the practice hub
filtered to that type. Attempted-but-unscored (abandoned, or scoring failed) still
counts as attempted but routes back to the case as "Finish it" rather than a dead
results link. The guesstimate card's four mock MCQ buttons hide once done.

Why it mattered: on free tier "Start the case" on an already-solved daily walks
straight into the one-attempt-per-case lock in `services/access_guard.py`.

## Phased build + gates

**Phase 1 — backend** (explicit adds only; dormant CRLF churn, never `git add -A`):
`prompts/interview_prompts.py`, `services/interview_engine.py`.
Gate: `python -m py_compile` on both → **EXIT 0 (verified)**.
Both files were LF-normalised so the diff is 65 lines, not the whole file.

**Phase 2 — frontend:** the six files above + the new `lib/dashboard/daily-progress.ts`.
Gate: scoped `tsc -p .tsc-clarification.json` (include list extended to cover the
dashboard files) → **EXIT 0 (verified)**. Full `npx tsc --noEmit` + `next build`
still to run locally — the authoring sandbox times out on the full pass.

**Phase 3 — deploy:** both repos together. No migration.

## Test plan

- **Fresh case, 3+ clarifications** — no two consecutive replies open with the same
  words; none of them start "Let's assume"; replies stay 1-3 sentences; the
  interviewer never hands over the answer or praises the candidate.
- **Guesstimate round** — same check on the sizing interviewer.
- **Burn the quota** — the exhausted decline still fires and still redirects.
- **Scroll** — with the quota banner AND the voice line visible, the last interviewer
  message is fully readable; type a 3-line message and confirm nothing clips.
- **Dashboard, daily case not yet done** — unchanged: "Start the case" (+ the drill /
  readiness secondary buttons still present in their variants).
- **Dashboard, daily case done** — tick, score, "View your score" → correct results
  page, "Practice more" → `/practice?tab=scored`.
- **Same for the guesstimate card**, → `/practice?tab=guesstimates`.
- **Attempted but unscored** — shows "Finish it", routes to the case, not `/results/`.
- **All three hero variants** (newcomer / streak / readiness) — check each renders the
  done state, since the variant is chosen by user state.

## Still open from earlier today

- Migration `0043_clarification_quota_uplift.sql` is committed but **not yet run** in
  Supabase.
- Contract **C9** (clarification-quota tier surface) proposed in
  `ANTIGRAVITY_HANDOFF_clarification-quota.md`, awaiting owner approval.
- STATE blocker 1 (Vercel prod build failing on `NEXT_PUBLIC_SUPABASE_*`) still gates
  all of this reaching real users.

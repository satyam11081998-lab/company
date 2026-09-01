# ANTIGRAVITY_HANDOFF — dictation-continuous-and-token

**Owner brain:** Cowork
**Branch:** feat/solve (Case solve UX surface) — land direct or fold into the next solve PR
**Date:** 2026-09-01
**touches:** `components/solve/ConversationalSolve.tsx` (ONLY)
**breaking:** no — no CONTRACTS.md surface changes. `/transcribe` (C4) and the
spoken-turn counting rule (C9 v2) are untouched: dictated drafts still post with
`kind: 'voice'`, typed drafts with `kind: 'text'`.
**affects:** nobody must re-sync. Pure client UX inside the case-solve composer.

Applied and type-checked on the live tree already (Cowork has direct disk
access). This handoff is the record + the gates for Antigravity to re-verify and
land.

---

## Why

Owner report on the case-solve dictation mic:
1. Speaking for a long time → transcription "took too much time to translate"
   and mid-way it threw **invalid token**, forcing a page refresh.
2. **Enter did nothing** — you had to click the ✓ (check) button.
3. Once transcribed, the text was trapped in a tiny fixed-height box; you
   couldn't see what was written without scrolling a 40px slot.

Root causes:
- The inline mic recorded ONE blob for the whole take and transcribed it once at
  the very end → the long end-of-speech wait, and a single point of failure.
- Both the inline mic AND `send()` reused the `token` captured at mount. A case
  interview outlives a Supabase access token (~1h), so the stale JWT started
  coming back as *invalid token*. (The separate `DictationButton` never had this
  bug — it fetches a fresh token per call. The inline composer mic did not.)
- Enter was wired only to `send('text')` on the textarea, and the textarea was
  REPLACED by the waveform during recording, so Enter had no target while
  dictating.
- Textarea was `max-h-32 … resize-none`.

## What changed (all in ConversationalSolve.tsx)

1. **Continuous transcription (segment rotation).** Recording now runs as a
   chain of ~`SEGMENT_MS` (18s) segments on one persistent `getUserMedia`
   stream. Each finished segment is transcribed on its own and its text is
   appended to the composer **in order** (serialised through
   `transcribeChainRef`), so the transcript appears WHILE you keep talking and a
   dropped/expired request loses at most one 18s segment, never the whole take.
   The gap between segments is a couple of ms (stream stays open).

2. **Fresh token everywhere.** New `freshToken()` calls
   `supabase.auth.getSession()` and refreshes when the access token is at/near
   expiry, pushes the value back into state, and is awaited before every
   `/transcribe` call and inside `send()` (used for `postMessageStream` +
   `getAttempt`). Kills the "invalid token" mid-session.

3. **Enter.** While recording, Enter (caught at window level, since the box may
   not hold focus while you talk) = STOP + flush the transcript into the box
   (same as the ✓ button). Once idle, Enter = send. So: speak → Enter (review in
   box) → Enter (send). Send button stays disabled while recording so speech is
   never posted un-reviewed.

4. **Resizable + visible composer.** Textarea is now `resize-y` and auto-grows
   with its content up to `COMPOSER_MAX_PX` (240px) then scrolls, and it stays
   VISIBLE during recording (the waveform moved to a slim strip ABOVE the box)
   so the streaming transcript is readable.

Cancellation semantics: the ✗ (cross) stops and discards only the in-flight
segment; anything already transcribed into the box is kept (consistent with
"nothing said is lost"). Component unmount mid-recording hard-stops the mic so
the OS mic light dies.

Left untouched on purpose: `SubmitDialog`'s `DictationButton` (final-rec box) —
it already fetches a fresh token per call, and owner's report was about the main
conversation composer.

## Phased build / gates

- **Phase 1 — types.** `npx tsc --noEmit -p .tsc-clarification.json` → **EXIT 0**
  (this config already includes `components/solve/ConversationalSolve.tsx`).
  ✅ run by Cowork 2026-09-01.
- **Phase 2 — full build.** `npm run build` on the real tree (the mounted-FS
  build exceeds the Cowork tool timeout — same limit noted for certificates /
  voice-interview). **NOT run by Cowork — Antigravity to run.**
- **Phase 3 — browser QA (cannot be done headless).** Verify on a real mic:
  - long dictation (>60s): text lands in chunks as you speak; no giant wait.
  - let the session sit past token expiry, then dictate + send: no "invalid
    token", no refresh needed.
  - Enter while recording stops + fills the box; Enter again sends.
  - box grows with the transcript and can be dragged taller.
  - ✗ discards only the current chunk; earlier text stays.
  - daily voice limit reached mid-take: capture stops, saved text remains,
    typing still works.

## Not touched
STATE.md / CHANGELOG.md / CONTRACTS.md / LEDGER.md — per brain rules, Antigravity
appends the CHANGELOG entry and flips the LEDGER status on merge.

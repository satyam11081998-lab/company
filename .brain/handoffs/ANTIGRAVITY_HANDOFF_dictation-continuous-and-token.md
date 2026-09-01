# ANTIGRAVITY_HANDOFF — dictation-continuous-and-token

**Owner brain:** Cowork
**Branch:** feat/solve (Case solve UX surface)
**Date:** 2026-09-01 (rev 2 — mechanism changed from fixed-segment to VAD-endpointed)
**touches:** `components/solve/ConversationalSolve.tsx` (ONLY)
**breaking:** no — no CONTRACTS.md surface changes. `/transcribe` (C4) and the
spoken-turn counting rule (C9 v2) are untouched: dictated drafts still post with
`kind: 'voice'`, typed drafts with `kind: 'text'`.
**affects:** nobody must re-sync. Client UX inside the case-solve composer.

Applied + type-checked on the live tree (Cowork has direct disk access). This is
the record + the gates for Antigravity to re-verify and land.

---

## Why

Owner wanted the composer mic to transcribe **live/continuously** — "keep on
transcribing as someone speaks", like Google's mic — with **zero UX hampered**,
while staying on Whisper (so quality, the voice-minutes meter, and cross-browser
support are all preserved). Whisper cannot stream a live partial transcript (it
decodes a finished audio file), so "live" here means: the mic never stops, and
each PHRASE is transcribed the instant you pause, landing in the box a second or
two behind your voice — phrase-by-phrase, not word-by-word.

Earlier problems this also closes: long single-blob takes that "took too long to
translate" and threw **invalid token** mid-session; Enter doing nothing; and a
tiny fixed-height box you couldn't read the transcript in.

## What changed (all in ConversationalSolve.tsx)

1. **Continuous, VAD-endpointed dictation.** The mic opens and STAYS open. A
   rolling `MediaRecorder` always runs, and the existing `Vad` (`lib/voice/vad.ts`,
   the same detector talk mode uses) watches the same stream. On each pause
   (`onSpeechEnd`) the current phrase's recorder is stopped and sent to Whisper
   while a fresh recorder starts immediately — so listening never breaks and a
   word is never sliced mid-phrase (which is what a blind 5s timer would do).
   Phrases are transcribed through a serialised promise chain so they land in
   spoken order. Tuning: `VAD_SILENCE_MS=850`, `VAD_MIN_UTTERANCE_MS=500`,
   `VAD_MAX_UTTERANCE_MS=15000` (force-flush a run-on), plus `IDLE_RECYCLE_MS=4000`
   to recycle the rolling recorder during silence so a long think is not uploaded
   as dead air (mirrors talk mode's IDLE_RECYCLE guard).

2. **Fresh token everywhere.** `freshToken()` calls `getSession()` and refreshes
   at/near expiry, and is awaited before every `/transcribe` and inside `send()`.
   Fixes the "invalid token" that a long session hit with the mount-captured JWT.

3. **Enter.** While recording, Enter (caught at window level) = STOP + flush the
   phrase in progress into the box; once idle, Enter = send. Speak → Enter
   (review) → Enter (send). Send stays disabled while recording.

4. **Resizable + visible composer.** Textarea auto-grows to `COMPOSER_MAX_PX`
   then scrolls, is `resize-y`, and stays visible during recording (waveform
   moved to a slim strip above it) so the streaming transcript is readable.

## Robustness (adversarial pass, before landing)

Each recorder owns its OWN chunk array (`chunksMapRef` WeakMap) so starting the
next recorder can never clobber the one still finalising. Hardened against:
- **Double-start** during the `getUserMedia` await — `startMic` claims on the ref
  synchronously (the `recording` state is still 'idle' during the await), so a
  second tap cannot open a second mic; a cancel/unmount during the await revokes
  the claim and releases the just-granted stream.
- **Last-phrase clipping** — on STOP the mic stream is released only inside the
  final recorder's `onstop`, after its blob is captured (stopping the track
  earlier truncates the final `dataavailable`).
- **Stuck "transcribing"** — idle is reached via BOTH the drain callback and an
  8s fail-safe timeout that also releases the mic, so a track killed by the OS
  can't strand the UI or leave the mic light on.
- **Mic disconnect** (unplug / another app grabs it / permission revoked) — the
  track `ended` listener finishes the take and saves what was transcribed.
- **Cancel** discards only the in-flight audio; phrases already in the box stay.
- **Voice limit hit mid-take** — capture stops, saved text remains, typing works.
- `MediaRecorder` construct/start, `getUserMedia`, `vad.start()` and every
  `stop()` are guarded; `MicWaveform` uses its own `AudioContext`, so sharing the
  stream with the VAD is safe.

## Phased build / gates

- **Phase 1 — types.** `npx tsc --noEmit -p .tsc-clarification.json` → **EXIT 0**
  (this config already includes `components/solve/ConversationalSolve.tsx`).
  ✅ run by Cowork 2026-09-01 (rev 2).
- **Phase 2 — full build.** `npm run build` on the real tree — **re-run for rev 2**
  (rev 1 built green; the mic internals were rewritten since). Antigravity to run.
- **Phase 3 — browser QA (real mic, cannot be done headless).**
  - long continuous dictation: text appears phrase by phrase as you pause; mic
    never stops; a 20–30s think in the middle uploads no dead air.
  - let the session sit past token expiry, then dictate + send: no "invalid
    token", no refresh.
  - Enter while recording flushes + fills the box; Enter again sends.
  - box grows with the transcript and can be dragged taller; visible while
    recording.
  - ✗ discards only the current phrase; earlier text stays. Unplug the mic
    mid-take → take is finished and saved.
  - daily voice limit reached mid-take: capture stops, saved text remains.
  - Safari: audio records as mp4 and still transcribes (recorder mimeType path).

## Not touched
STATE.md / LEDGER.md / CONTRACTS.md — Antigravity finalises those on merge. The
CHANGELOG top entry was corrected to describe the VAD mechanism (rev 2).

# ANTIGRAVITY_HANDOFF — mic-recording-ux (Brain / Cowork, 2026-06-30)

touches:
- consilio/components/dictation-button.tsx — REWRITTEN. Now a forwardRef component exposing an
  imperative handle `DictationHandle { isRecording(): boolean; finalize(): Promise<string|null> }`
  plus an `onRecordingChange?(recording)` prop. Behaviour: tap mic → record; tap the square → CANCEL
  (discard, no transcription); committing is done by the parent's Send button calling `finalize()`
  (stop + transcribe, resolves with text). While recording it shows the square with two concentric
  pulsing rings (animate-ping, 700ms stagger) so "it's recording" is obvious. Backward-incompatible:
  the square no longer auto-transcribes, so every consumer's Send must call finalize() — done below.
- consilio/components/submission-form.tsx — case answer box. dictRef + recording state; handleSubmit
  finalizes the mic first (folds transcript in with \n\n) then submits; Submit button stays enabled
  while recording (`disabled={!isValid && !recording}`); removed the textarea `required` (validation
  moved into handleSubmit so an empty box can still submit a voice answer).
- consilio/components/solve/ConversationalSolve.tsx — TWO mics:
  (1) the main composer mic (inline MediaRecorder, not DictationButton) was rewritten: `toggleMic`
      removed; added `startMic` / `cancelMic` / `micButtonClick` / `finalizeMic` / `handleComposerSend`
      + `micCancelledRef` / `micResolveRef`. Square = cancel; the composer Send button (now
      `handleComposerSend`) finalizes + `send('voice', text)` in one tap and is enabled while
      recording. Added the concentric pulsing rings to the composer mic button.
  (2) the final-recommendation SubmitDialog DictationButton: dictRef + recording; `handleConfirm`
      finalizes then calls `onConfirm(mergedText)`. Parent `handleSubmit` now takes an optional
      `overrideText` so the freshly-transcribed text isn't lost to stale state. Submit button enabled
      while recording.
- consilio/components/resume/bullet-lab.tsx — dictRef + recording; `run()` finalizes the mic and folds
  the transcript into the achievement before generating; Generate button reads "Stop & generate" while
  recording (and is already enabled since it only disables on `loading`).

breaking: no CONTRACTS.md surface. Pure frontend UX. The DictationButton prop/handle change is internal
to the 4 call sites listed (all updated). No API/SQL changes.

## Behaviour (owner-confirmed)
- Recording is clearly visible (pulsing concentric rings around a stop-square).
- The square CANCELS/discards. The Send button (never dimmed during recording) COMMITS.
- Tapping Send while recording = stop + transcribe + send in ONE tap (no review step). Confirmed by owner.
- Applied to every mic on the site (case answer, case/guesstimate solve composer, final-rec dialog,
  resume bullet lab).

## Phased build steps + gates (run on the real tree, not the Cowork sandbox mount)
1. `cd consilio && npx tsc --noEmit` — must be clean. NOTE: the Cowork bash mount served stale/truncated
   copies this session, so its tsc reported false "TS1002 unterminated string / no closing tag" on these
   files AND on unedited files (leaderboards.ts:247, leaderboard-client.tsx:452). Authoritative files on
   disk are intact (verified by re-reading). Trust the real-tree tsc, not the sandbox's.
2. `next build` — must pass.
3. Manual QA per surface (mic needs a real browser + permission — cannot be tested in CI):
   - Tap mic → see the pulsing rings + square. Tap square → recording discarded, nothing sent, no
     transcription call.
   - Tap mic, speak, tap Send → one tap stops, transcribes, and sends/submits. Send is clickable the
     whole time (not dimmed).
   - Surfaces: /cases/[id] answer box; the conversational solve composer (per-turn) AND its "Submit
     session" final-recommendation dialog; /resume bullet lab "Generate".
   - Deny mic permission → graceful toast, returns to idle.
4. Redeploy frontend (these are client component changes; no SQL).

## Commit
git add consilio/components/dictation-button.tsx consilio/components/submission-form.tsx \
  consilio/components/solve/ConversationalSolve.tsx consilio/components/resume/bullet-lab.tsx \
  .brain/handoffs/ANTIGRAVITY_HANDOFF_mic-recording-ux.md

# ANTIGRAVITY_HANDOFF — voice-model-led

**Author:** Claude (cloud session). **Updated:** 2026-10-02 (human-interviewer prompt, no live
transcript, faster Gemini). **Feature:** live (model-led) realtime voice interviewer — the speech
model converses by itself, speech to speech, from one prompt. **Branch:** `main` (owner's
instruction). Full spec: `consilio-backend/docs/VOICE_MODEL_LED.md`.

```
touches:  frontend components/solve/VoiceInterviewGemini.tsx (no live drafts, 64 ms mic chunks,
                   config step-down, auto-reconnect + resume, meter connected time only),
                   components/solve/VoiceInterviewRealtime.tsx (no live drafts in live mode),
                   lib/voice/gemini-live.ts (onLiveClose policy), qa/voice/gemini-live.test.cjs,
                   qa/e2e-voice/{mock-gemini-live-server,run-gemini-live,run-model-led}.cjs
          backend  prompts/voice_interviewer_playbook.py (human-interviewer playbook; case read-outs
                   replaced in history), routes/realtime_gemini.py (newest live model, config tiers,
                   `tier` in/out, en transcription), routes/realtime.py (eagerness high, en
                   transcription), tests/test_voice_model_led.py, tools/e2e_voice_model_led.py, docs
breaking: no. C4 additive only: /realtime-gemini/session takes optional `tier`, returns `tier` and
          `tiers`. Transcript saving (/realtime-turn), C9 counting, credits, metering rates,
          scoring, plans, auth: unchanged.
affects:  Voice interview (realtime voice, Gemini Live and OpenAI Realtime transports)
```

## What changed (2026-10-02)
- Prompt: says only what the moment needs (go-ahead / "you're on the right track" / answer /
  "Are you sure about that?" / food for thought); never apologises; no filler; never repeats a
  question or the case; analogies by case type; answer rule without "I can't".
- No transcript on screen while people talk; finished turns appear and are saved as before.
- Gemini: newest general live model on the key (`gemini-3.8-live`), English transcription,
  quick end-of-turn, echo/noise-resistant start; step-down if Google refuses a config;
  reconnect + resume when Google ends the connection (~every 10 min).
- OpenAI Realtime: semantic VAD eagerness `high`, transcription language `en`.

## Gates (run 2026-10-02)
- backend: `python -m tests.test_voice_model_led` → **ALL PASS (110)**; `test_v11_voice_integration`
  (74), `test_response_functions` (105) → ALL PASS. `test_interviewer_mode` / `test_session_signals`
  failures are pre-existing (identical before this change). `py_compile` on changed files → OK.
- frontend: `npx tsc --noEmit` → EXIT 0; `next build` → EXIT 0; `node --test qa/voice/*.test.cjs` → 18/18.
- browser E2E: `run-gemini-live.cjs` → **25/25**; `run-model-led.cjs` → **20/20**.
- NOT verified: real Gemini / OpenAI voice quality and latency (no network to Google from here).

## After merging
`git push` in both repos, then `node .brain\sync.mjs` in `consilio`. Do not hand-edit STATE.md.
If `GEMINI_LIVE_MODEL` is set on Render, remove it so the newest live model is picked.

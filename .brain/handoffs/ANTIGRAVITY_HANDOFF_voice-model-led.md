# ANTIGRAVITY_HANDOFF — voice-model-led

**Author:** Claude (cloud session), 2026-10-01. **Feature:** model-led realtime voice interviewer —
the speech model converses by itself (ChatGPT-voice style); the backend coaches alongside.
**Branch:** delivered on `main` (owner's instruction), behind a backend switch that is OFF by
default. Full spec: `consilio-backend/docs/VOICE_MODEL_LED.md`.

```
touches:  frontend lib/voice/model-led.ts (NEW), lib/voice/realtime-session.ts (interviewer mode,
                   tool-call events, updateInstructions / sendToolResult / cancelAndSteer),
                   components/solve/VoiceInterviewRealtime.tsx (model-led turn handling, tool relay,
                   live answer-leak guardrail), lib/interview-api.ts (postVoiceCoach, postVoiceTool),
                   qa/voice/model-led.test.cjs (NEW), qa/e2e-voice/* (NEW browser E2E)
          backend  prompts/voice_interviewer_playbook.py (NEW), services/voice_coach.py (NEW),
                   routes/voice_coach.py (NEW: /attempts/{id}/voice-coach, /voice-tool),
                   routes/realtime.py (model-led session config + `interviewer` field), main.py,
                   tests/test_voice_model_led.py (NEW), tools/e2e_voice_model_led.py (NEW), docs
breaking: no. C4 additive: two new attempt routes, /realtime/session gains `interviewer`.
          With VOICE_INTERVIEWER unset the session is byte-for-byte today's renderer session and
          the client takes today's path. C9 counting, credits, scoring, plans: unchanged.
affects:  Voice interview (talk mode, OpenAI realtime transport only)
```

## Gates (all run 2026-10-01)
- backend: `python -m tests.test_voice_model_led` → **ALL PASS (48)**; `tests.test_v11_voice_integration`,
  `tests.test_response_functions`, `tests.test_count_clarifications`, `tests.test_learning_model` → pass.
- frontend: `npx tsc --noEmit` → **EXIT 0**; `next build` → **EXIT 0** (Google Fonts mocked offline);
  `node --test qa/voice/model-led.test.cjs` → **5/5**.
- browser E2E: `qa/e2e-voice/run-model-led.cjs` → **22/22, three consecutive runs**.
- NOT verified: the real gpt-realtime model's conversation quality and latency with this playbook.

## Enable (owner only first)
Render: `VOICE_INTERVIEWER=allowlist`, `VOICE_INTERVIEWER_ALLOWLIST=<owner email>`, restart.
Admin voice mode must be `realtime`. Off again: unset `VOICE_INTERVIEWER`.

## After merging
`git push` in both repos, then `node .brain\sync.mjs` in `consilio`. Do not hand-edit STATE.md.

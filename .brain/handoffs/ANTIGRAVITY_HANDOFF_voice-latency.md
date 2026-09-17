# ANTIGRAVITY_HANDOFF — voice-latency

**owner brain:** Cowork · **date:** 2026-09-17
**design record:** project doc `MECE_voice_latency_audit.md` (full stage-by-stage trace)

**touches:** LANDED — frontend `components/solve/VoiceInterview.tsx`.
DEFERRED (specs below) — backend `routes/speak.py`, `routes/transcribe.py`, `routes/attempts.py`, `main.py`; frontend `lib/voice/tts-queue.ts`, `lib/voice/vad.ts`, `components/solve/ConversationalSolve.tsx`.
**breaking:** NO. No CONTRACTS.md surface changed. C4 (`/speak` = audio/mpeg) and C9 v2 (voice counting) are untouched. If deferred item #1 moves `/speak` to chunked streaming it stays audio/mpeg → additive C4 note, non-breaking.

## Root cause (static code trace)
Default `voice_mode = pipeline` (Groq STT → LLM → Google/OpenAI TTS) is three separate, serial, blocking browser→server round-trips with nothing overlapping — dead air ≈ their SUM. `realtime` mode (OpenAI s2s, browser↔OpenAI) already streams and is fine; `/attempts/{id}/realtime-turn` is only bookkeeping. TTS is already fed sentence-by-sentence, so only LLM time-to-first-SENTENCE is on the path, not the full completion.

## LANDED this session (frontend only, gated)
- `VoiceInterview.tsx`: per-turn stage instrumentation → `console.log("[voice-timing] to_transcript=… first_token=… reply=… total=…ms")`; captures speech-end → transcript → first-token → done.
- `VoiceInterview.tsx`: VAD endpoint `silenceMs` 1200 → 1000 (passed at the `new Vad(...)` call site, not the default).
- **Gate:** `tsc --noEmit` EXIT 0. **NOT browser-QA'd** — mic/autoplay/VAD cannot be tested headless (same constraint as `ANTIGRAVITY_HANDOFF_voice-interview-mode.md`).
- **Watch:** confirm 1000ms doesn't clip thinking pauses; revert to 1200 if it does.

## DO FIRST — measure before building Tier-2
Read the console `[voice-timing]` over ~10 real spoken turns + the STT/TTS `latency_ms` already logged to `ai_usage_log`. Get p50/p95 per stage. Fix the stage that actually dominates; do not build the fixes below blind.

## DEFERRED — ranked by return ÷ effort (each needs a browser QA pass)
1. **Stream TTS (biggest win).** `routes/speak.py _synthesize` → Google `streaming_synthesize` / OpenAI chunked; return `StreamingResponse(media_type="audio/mpeg")`; `lib/voice/tts-queue.ts` plays chunks as they arrive so first audio starts before the sentence fully renders. Gate: `py_compile` + browser listen. Contract: additive C4 note, non-breaking.
2. **Collapse hot-path auth + parallelize pre-LLM reads.** `routes/attempts.py` `/messages`: verify the JWT locally / cache the verified user for the turn instead of the 3 separate Supabase `get_verified_user()` round-trips; `asyncio.gather` the `_load_attempt`/`_load_case`/`_fetch_transcript` reads. CAUTION: `attempts.py` is AI-evaluation (B) + Rate-limiting (B) territory and the collision-watched `send()`/SSE path — do NOT rename SSE events or fork `send()`, and the auth change must preserve the security posture. Propose to Brain B before landing.
3. **Chunked/streaming STT.** `routes/transcribe.py`, or reuse the phrase-flush the text path already has (`ConversationalSolve` transcribes per-pause) so transcription overlaps speech instead of waiting for the whole clip.
4. **Warm the Google TTS client at startup** (turn-1 penalty only). `main.py` startup hook → `speak._get_google_tts()`. Small.
5. **Adaptive VAD silence.** `lib/voice/vad.ts`: shorter endpoint after a long confident utterance, longer for a short one.

## Parent-side instrumentation to finish the chain (small, do with #1/#2)
Add `first_audio_byte` / `first_audible` marks in `ConversationalSolve` / `lib/voice/tts-queue.ts`. `VoiceInterview` already covers speech-end → transcript → first-token → total.

## Gates for every deferred item
`next build` (real tree) · `tsc --noEmit` · `py_compile` · **browser QA (mic + autoplay + audio playback) — mandatory for anything touching STT/TTS/VAD.**

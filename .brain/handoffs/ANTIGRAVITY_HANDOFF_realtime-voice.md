# ANTIGRAVITY_HANDOFF — realtime-voice (Cowork brain, 2026-08-16)

Replaces the talk-mode TRANSPORT with the OpenAI Realtime API. Everything above
the transport — overlay, state machine, noise guard, idle guards, session cap,
scoring parity — stays.

touches: frontend `lib/voice/realtime-session.ts` (new), `components/solve/VoiceInterview.tsx`,
`lib/api.ts`; backend `routes/realtime.py` (new), `main.py`, `services/ai_usage.py`,
`routes/attempts.py`
breaking: **C4 additive** (new `POST /realtime/session`, new `POST /attempts/{id}/realtime-turn`).
**C2 NOT touched.** C9 needs a decision — see OPEN ITEM 2.
affects: Case solve UX, Voice interview, AI evaluation v2 (transcript source changes)

---

## Why

The pipeline is ~3.0-4.5s per turn and the owner is right that it does not feel
like a conversation. Measured budget:

| stage | cost |
|---|---|
| VAD waits out the silence | 1200ms |
| upload + Whisper (browser → Render → OpenAI) | 800-1500ms |
| interviewer first sentence | 600-1000ms, **grows every turn** |
| TTS first clip | 400-800ms |

Two of those are network hops that exist only because our backend sits in the
middle. Realtime removes both: the browser talks to OpenAI directly over WebRTC.

## Decisions already made (owner, 2026-08-16)

1. **Go Realtime**, not pipeline tuning. Target ~500ms and true talk-over.
2. **Unmetered per-user for now.** Watch `ai_usage_log`, set the cap from real
   data. The global `assert_daily_budget()` is the only backstop, so realtime
   spend MUST reach it — see OPEN ITEM 1.
3. **10-minute hard cap per session** (already shipped, `MAX_SESSION_MS` in
   VoiceInterview). Reopening is one tap. This is what bounds the worst case:
   audio is billed as streamed, silence included, so an unattended open mic
   costs money whether or not anyone is talking.

## Cost, verified 2026-08-16

`gpt-realtime`: audio in **$32/1M tok**, audio out **$64/1M tok**, cached in
**$0.40/1M**. User audio is 1 tok/100ms (600 tok/min); assistant audio is
1 tok/50ms (1200 tok/min).

- 25-min session ≈ **$0.72** (vs ~$0.24 pipeline) — about **3x**, not the order
  of magnitude originally feared. Cheap cached input is what stops the re-sent
  context ballooning.
- With the 10-min cap: **~$0.50 absolute worst case** per session.
- Pro is ₹599/mo ≈ $6.80, so break-even is ~16 capped sessions/month before
  Razorpay fees, gpt-4o scoring, and infra. Watch the log.

---

## Architecture

```
browser ──WebRTC(audio)──> OpenAI Realtime          (no hop through Render)
   │
   ├─ ephemeral token  <── POST /realtime/session    (our backend, Pro-gated)
   └─ transcript events ─> POST /attempts/{id}/realtime-turn  (persist + meter)
```

### Backend: `POST /realtime/session` (new, `routes/realtime.py`)

Mints an ephemeral client secret so the real key never reaches the browser.

- `POST https://api.openai.com/v1/realtime/client_secrets` with the standard key.
- Model `gpt-realtime-2.1` (verify at build time; the family moves fast).
- Gate exactly like `/speak`: auth, guest 403, **Pro 403**, rate limit,
  `assert_daily_budget()`. Reuse the single-quota-snapshot pattern — do not
  reintroduce the nine-round-trip version.
- **The `instructions` (interviewer prompt) are set HERE, server-side.** They must
  not come from the browser: it is the prompt, the guardrails and the case
  content. Build them with the existing `build_interviewer_messages` inputs so
  the interviewer's voice and behavioural rules stay identical to the typed path.
- Returns `{ client_secret, expires_at, model, voice }`.

### Backend: `POST /attempts/{id}/realtime-turn` (new, in `routes/attempts.py`)

Persists ONE turn reported by the browser. Same `attempt_messages` insert the
typed path uses, so scoring reads identical rows.

- Body: `{ role: 'user'|'assistant', content: str, kind: 'voice' }`.
- Reuses the existing message cap and rate limit.
- Does **NOT** call the interviewer — realtime already produced the reply.
- Applies `count_clarifications(content, 'voice')` for user turns (C9 v2).

### Frontend: `lib/voice/realtime-session.ts` (new)

1. `POST /realtime/session` for the token.
2. `new RTCPeerConnection()`, add the mic track, create a data channel.
3. `createOffer()` → POST the SDP → set the remote answer.
4. Remote audio track → an `<audio>` element. That is the interviewer.
5. Data-channel events:
   - `conversation.item.input_audio_transcription.completed` → user turn
   - `response.audio_transcript.done` → assistant turn
   - `response.done` → carries **usage**; forward it for metering
   - `error` → surface and fall back
6. Turn detection: server VAD, so barge-in is free.

### Frontend: `VoiceInterview.tsx`

Swap the transport only. Delete the local VAD/MediaRecorder/TTS-queue path from
this component; keep the overlay, the phase machine, the transcript rail, the
noise guard on incoming transcripts, the idle guards and the 10-min cap.

---

## OPEN ITEMS — decide before P3

**1. Metering must reach the kill switch.** Usage arrives in the browser's
`response.done`. Forward it to `/attempts/{id}/realtime-turn` and log to
`ai_usage_log` with `endpoint='/realtime'` and a real `est_cost_usd`, priced from
the audio-token rates above. **If this books $0, realtime spend is invisible to
`spend_today_usd()` and therefore to `assert_daily_budget()`** — the same trap
that the TTS cost branch already fell into once. Gate: after one session,
`select est_cost_usd from ai_usage_log where endpoint='/realtime'` must be
non-zero.

**2. C9 clarification quota.** The realtime model runs the turn loop itself, so
we cannot block mid-stream the way `post_message` does. Options: (a) count
clarifications from the reported transcript and, on exhaustion, `session.update`
new instructions telling the interviewer to decline in character; (b) exempt
realtime sessions from the quota and say so in the pricing copy. (a) preserves
C9; (b) is simpler and honest. **Owner call.**

**3. Transcript trust.** The transcript now originates in the browser, so a
determined user could forge one. The stakes are low — they would be cheating
their own practice score — but leaderboard points exist. Recommend: accept it,
and record `attempts.source = 'realtime'` so it can be audited or excluded later
if it ever matters.

---

## Phases and gates

**P1 — backend token endpoint.** `routes/realtime.py` + `main.py`.
GATE: `py_compile` EXIT 0. `curl` with a Pro token returns a `client_secret`; a
Lite token 403s; a guest 403s.

**P2 — client session module.** `lib/voice/realtime-session.ts`, wired to a
throwaway test page, not yet to VoiceInterview.
GATE: `tsc --noEmit` EXIT 0. In a real browser: audio both ways, transcript
events arriving in the console.

**P3 — persistence + metering.** `/attempts/{id}/realtime-turn`, usage logging.
GATE: a spoken turn appears in `attempt_messages` with `kind='voice'`;
`ai_usage_log` shows a non-zero `/realtime` cost.

**P4 — swap VoiceInterview's transport.** Keep the pipeline behind an env flag
for one release so a regression is a config change, not a redeploy.
GATE: `tsc --noEmit` + `npm run build` EXIT 0. Full spoken case end to end.
**Score a spoken case against a typed one at the same case** — that is the only
proof scoring parity survived the transport change.

**P5 — delete the pipeline** once P4 is proven in production.

**No migration** unless OPEN ITEM 3 is taken (`attempts.source` would need one).

---

## Do not lose these

- The **10-min cap**, the **noise guard**, the **idle guards** and the
  **tab-hidden mic stop** are transport-independent. They exist because an open
  mic is not a neutral idle state. Keep every one of them.
- **Voice collapses to text for scoring** (`prompts/interview_prompts.py`,
  `_flatten_for_legacy_scorer`). A realtime attempt must be scored on the same
  document as a typed one.
- `AI_TTS_MIN_PRO=0` is the current kill switch. Realtime needs an equivalent
  env flag before it is unflagged.

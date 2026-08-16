# ANTIGRAVITY_HANDOFF — voice-interview-mode ("Talk mode") (Cowork brain, 2026-08-13)

**Proposed feature row:** Voice interview mode | Cowork (proposal) | `feat/voice-interview` | PROPOSED
**Owner-confirmed decisions (2026-08-13):** pipeline architecture · Pro only at launch ·
cases AND guesstimates together · voice clarifications counted by intent, not by `?`.

touches: frontend `components/solve/VoiceInterview.tsx` (new), `lib/voice/{vad,tts-queue,markdown-strip}.ts` (new),
`components/solve/ConversationalSolve.tsx`, `lib/api.ts`, `lib/tier.ts`, pricing copy
(`components/pricing-plans.tsx`, `app/(app)/upgrade/page.tsx`, `app/pricing/page.tsx`);
backend `routes/speak.py` (new), `main.py`, `services/ai_usage.py`, `services/interview_engine.py`,
`routes/attempts.py`
breaking: **YES — C9 · Clarification quota (v1 → v2)**, counting method only, ladder numbers UNCHANGED.
Plus **C4 additive** (new backend route `POST /speak`). **C2 NOT touched** (no return key changes),
but see the OPEN DECISION on the scorer's `(voice)` turn tag — resolving it may edit the
scoring prompt, which is AI evaluation v2's surface.
affects: Case solve UX, Voice + image input, Free-tier rework / Payments (pricing copy),
AI evaluation v2 (transcript tagging — decision pending)

---

## ⛔ P0 — DO NOT START UNTIL THIS IS CLEARED

STATE.md lists **`interviewer-voice + solve-scroll + daily-done-state` (2026-08-01) as
IN FLIGHT and uncommitted**. That work edits three of the same files this feature edits:
`components/solve/ConversationalSolve.tsx` (the ResizeObserver composer-height fix),
`services/interview_engine.py` (the `INTERVIEWER_TEMPERATURE / FREQUENCY / PRESENCE`
constants) and `prompts/interview_prompts.py`.

Building talk mode on top of an uncommitted working tree will produce a conflicted diff
that nobody can review and will make it impossible to tell which change caused a voice
regression. **Commit or stash the 2026-08-01 work first, then branch `feat/voice-interview`
off that commit.** This handoff assumes that has happened.

Related: `influencer-growth-kit` (2026-08-06) is BREAKING on C7 but its `affects:` list is
Payments / Deck Vault Rewards / Admin — it does not touch this feature. `certificates`
(2026-08-11) is unrelated; its migration 0046 is still unrun but does not block this.

---

## What this actually is

Not a new interview engine. Talk mode is a **presentation layer over the existing turn
loop**. The candidate speaks instead of typing and hears the interviewer instead of
reading it. Everything under the UI is byte-for-byte the current flow:

```
mic → VAD endpoint → MediaRecorder blob
    → POST /transcribe                       (EXISTING, unchanged)
    → postMessageStream(..., kind: 'voice')  (EXISTING, unchanged)
    → POST /attempts/{id}/messages           (EXISTING, unchanged)
    → SSE tokens → sentence buffer → POST /speak → audio queue → playback
    → playback ends → mic reopens
```

**Persistence needs zero changes.** `routes/attempts.py` already persists every turn to
`attempt_messages`, and `kind` already accepts `'voice'` (line ~390:
`body.kind if body.kind in ("text","voice","image","file")`). `MessageKind` in
`lib/interview-api.ts` already declares `'voice'`. **C2 (scoring return contract) is not
touched** — no return key is added, renamed or removed.

**But scoring is NOT automatically identical — see the open decision below.**

**Why both cases and guesstimates come for free.** Both render through
`app/(app)/cases/[id]/page.tsx` → `ConversationalSolve`, and the backend already branches
on `case["type"]` inside `stream_interviewer_reply`. One component, one endpoint, both
formats. The only guesstimate-specific work is making sure the MCQ teaser and the
`components/dashboard/guesstimate-card.tsx` done-state are not broken by the overlay.

**Why the server must stay the one writing the transcript.** This is the whole reason the
pipeline was chosen over the Realtime API. Every guard the app depends on lives in
`post_message`: `check_rate_limit`, `assert_daily_budget`, the message cap
(`MAX_MESSAGES_PER_ATTEMPT` / `GUEST_MAX_MESSAGES_PER_ATTEMPT`), the clarification quota,
and the `attempt_messages` insert that happens *before* the AI call so the transcript
survives a failed turn. A client-side speech-to-speech session would move all of that into
the browser and hand the scorer a transcript it cannot trust. Do not "optimise" this later
by letting the client own the loop.

---

## ✅ DECIDED (owner, 2026-08-13) — the scorer must NOT see that a turn was spoken

Found while verifying this handoff, and it contradicts the obvious assumption. The
transcript handed to the scorer is tagged with `kind`, on **both** scoring paths:

- `prompts/interview_prompts.py:238-240` (**cases**) —
  `tag = f"[{turn_idx}] {role}"` … `if kind != "text": tag += f" ({kind})"`
- `services/interview_engine.py:178` (**guesstimates**, legacy flatten) —
  `prefix = role if kind == "text" else f"{role} ({kind})"`

So a spoken turn reaches the model as `[3] USER (voice)` where a typed one reaches it as
`[3] USER`. Today that fires only on the occasional dictated turn. **In talk mode every
single candidate turn carries the tag**, so the scorer receives a visibly different
document for a spoken attempt than for a typed one — same rubric, same return keys,
different input. Nobody has ever scored a fully-spoken transcript, so the direction of the
effect is unmeasured.

There is a real fairness argument on both sides. Whisper transcribes speech verbatim:
filler words, restarts, run-on sentences, no paragraph breaks. A scorer that does not know
the turn was spoken may read that as poor communication. A scorer that does know may go
soft on structure. Three ways to resolve it:

**(a) Make it literally identical.** Collapse `voice` → `text` at the scorer boundary only
(keep `image` / `file` tagged, since those genuinely change what the turn means). One line
in each of the two tag sites. Scoring input for a spoken attempt becomes byte-identical to
a typed one. Matches the owner's stated requirement most directly. Risk: the model silently
marks down transcription artefacts as bad communication.

**(b) Keep the tag, teach the scorer what it means.** Add one line to the scoring prompt:
spoken turns are transcribed speech — judge substance, ignore filler, restarts and missing
punctuation; do not reward or penalise a turn for having been spoken. Fairer in principle.
Cost: it edits the scoring prompt, which is **AI evaluation v2's** surface (brain B) and
sits on the LEDGER collision-watch list. Not a C2 break (return keys unchanged), but it
must be announced with `affects:` and it changes live scoring behaviour for everyone,
including existing dictated turns.

**(c) Ship as-is and measure.** Run the same case twice, once typed and once spoken, diff
the scores. Decide with data. Slowest, but the only option that is not a guess.

**OWNER DECISION (2026-08-13): (a).** Collapse `voice` → `text` at the scorer boundary.
Implement in P4:
- `prompts/interview_prompts.py:239` — `if kind not in ("text", "voice"): tag += f" ({kind})"`
- `services/interview_engine.py:178` — `prefix = role if kind in ("text", "voice") else f"{role} ({kind})"`

`image` and `file` stay tagged — those genuinely change what a turn means and the scorer
should know a chart was uploaded. The scoring prompt body is **NOT** edited, so AI
evaluation v2's surface stays untouched and this does not become a cross-brain change.

Note this also normalises the **existing** dictated turns, which have been reaching the
scorer tagged `(voice)` all along. That is a live behaviour change on typed sessions that
happened to use the mic, not just on new talk-mode sessions — call it out in the CHANGELOG
entry so it is not discovered later as an unexplained scoring shift.

Revisit (b) — teaching the scorer to forgive transcription artefacts — only once real
spoken transcripts exist and there is evidence the model is marking down filler.

---

## Contract change being PROPOSED (do not edit CONTRACTS.md without owner sign-off)

### C9 · Clarification quota — tier surface   (v1 → v2)

**Ladder is UNCHANGED: free 7 · lite 12 · pro 20. No migration. No backfill.** The three
mirrored constants (`routes/attempts.py CLARIFICATION_QUOTA`, `lib/tier.ts
TIER_LIMITS.maxHintQuestions`, pricing copy) all keep their current values, so the
collision-watch rule is satisfied trivially — nothing moves.

What changes is the **counting method for `kind='voice'` turns only**, and C9 currently
documents that method explicitly ("`count_clarifications()` counts every `?`"), which is
why this is a version bump rather than a silent edit.

**The problem.** `count_clarifications()` (services/interview_engine.py:284) returns
`text.count("?")`. Whisper punctuates on rising intonation, and spoken case answers are
full of questions that are not clarifications:

> "So I'd size this top-down — does that make sense? I'll assume urban households only,
> is that fair? Then I'd split by income band, right?"

That is **one** structure statement and **zero** requests for case information. Under the
current rule it costs a free user 3 of their 7. A typical spoken case would exhaust the
quota inside five minutes and push the candidate into the
`CLARIFICATIONS_EXHAUSTED_DIRECTIVE` branch for the rest of the session — the interviewer
would spend the back half of every voice interview declining to answer. That is a worse
version of the exact P0 that C9 was written to prevent.

**The fix — deterministic, no extra model call.**

```python
def count_clarifications(text: str, kind: str = "text") -> int:
```

Default arg means **every existing call site is unchanged**; only `post_message` passes
`kind=body.kind`. For `kind != "voice"` the function returns exactly what it returns today.

For `kind == "voice"`:

1. Split the turn into sentences.
2. Keep only interrogatives.
3. Drop **conversational-management** questions — ones that ask about the conversation, not
   about the case. Seed list (keep it in one named constant, `_VOICE_FILLER_QUESTIONS`, so
   it is reviewable and testable): *does that make sense · make sense · right · correct ·
   is that fair · is that okay · is that fine · shall I · should I continue · should I
   proceed · should I move on · can I go ahead · are you with me · sound good · am I on
   the right track · you know · yeah*.
4. **Clamp the result to 1 per voice turn.** The anti-packing rationale in the current
   docstring ("prevents users from packing 5 questions into a single message") is a typing
   behaviour. A speaker cannot pack five distinct data requests into one breath without it
   being one clarification in substance, and Whisper's punctuation is not reliable enough
   to adjudicate. One spoken turn = at most one quota point.

**Why deterministic and not a classifier call.** This repo has already been through a
cost-hardening pass (`ANTIGRAVITY_HANDOFF_openai-cost-hardening.md`, `assert_daily_budget`,
per-tier meters). `post_message` is described in its own comments as "the hottest path in
the app", and the quota decision has to be made *before* the interviewer call because it
sets `clarifications_exhausted` in the prompt. Adding a blocking model call there buys
accuracy at the cost of latency and spend on every single turn. Ship the filter, log
disagreements, and only escalate to a `gpt-4o-mini` classifier if real transcripts show it
misfiring. **Flag for the owner: if you would rather have the classifier from day one, say
so now — it is a 20-line change in P4, but it is a permanent per-turn cost.**

**Proposed C9 v2 text** (Antigravity to apply to CONTRACTS.md only after owner sign-off):

> **v2 (2026-08-__)**: the ladder is unchanged. `count_clarifications()` now takes
> `kind` and applies a voice-specific rule for `kind='voice'`: conversational-management
> questions ("does that make sense?", "shall I continue?") are not clarifications, and a
> single spoken turn can spend at most 1 quota point. Rationale: Whisper punctuates on
> intonation, so `text.count("?")` massively over-counts speech. Text turns are unaffected.
> Affects: Case solve UX, Voice + image input.

### C4 · API / route contract — additive note

> **Note (2026-08-__)**: new backend route `routes/speak.py` (`POST /speak`) — text in,
> `audio/mpeg` out. Auth-required, guest-blocked, **Pro-only** (403 otherwise),
> rate-limited, bounded by `assert_daily_budget()` and a per-day TTS-minute meter, logged
> to `ai_usage_log` under `endpoint='/speak'`. Additive; no existing route changes shape.

---

## Frontend build

### `lib/voice/vad.ts` (new)
Endpointing off a Web Audio `AnalyserNode` on the live `MediaStream` — RMS over a short
window, no library, no model.
- Speech starts when RMS crosses the threshold for ~150ms (rejects a door slam).
- Turn ends after **~1200ms** below threshold, but only if the utterance ran ≥ ~700ms
  (a breath or an "um" must not end the turn).
- Calibrate the noise floor from the first ~400ms of silence after the mic opens, rather
  than a hard-coded threshold — a laptop fan and a quiet room are not the same baseline.
- Hard cap the utterance at ~120s → force endpoint. `/transcribe` rejects >6MB
  (`MAX_AUDIO_BYTES`) and a 5-minute monologue would 413 and lose the whole turn.
- Export a plain observable state (`'silent' | 'speaking'`) plus current level so the
  overlay can drive the orb animation from the same source.

### `lib/voice/tts-queue.ts` (new)
The latency trick: **do not wait for the full reply.** Buffer `onToken` chunks and flush
on a sentence boundary (`.`, `?`, `!`, or ~120 chars), POST each sentence to `/speak`, and
play the returned clips in order through a single `Audio` element / `AudioContext`.
Interviewer replies are 1-3 sentences by prompt contract, so the candidate hears the first
sentence while the second is still generating.
- Strict FIFO. Never let clip 2 start before clip 1 finishes.
- `cancel()` must stop playback, drop the queue and abort in-flight `/speak` fetches
  (`AbortController`) — used by interrupt and by leaving talk mode.
- Emit `onSpeakingChange` so the state machine knows when to reopen the mic.

### `lib/voice/markdown-strip.ts` (new)
The interviewer emits `**bold**` (that is why `renderWithBold` exists in
ConversationalSolve). TTS would read the asterisks or stumble on them. Strip `**`, `*`,
backticks and stray markdown **client-side, in the queue, before the `/speak` call**.

**Do NOT touch `prompts/interview_prompts.py` to solve this.** Those prompts were rewritten
on 2026-08-01 and the change is still uncommitted; editing them here risks the interviewer
voice regressing and makes it impossible to attribute the cause.

### `components/solve/VoiceInterview.tsx` (new)
Full-screen overlay mounted over the existing solve page. Explicit state machine — this is
where voice UIs rot if the states are implicit:

```
idle → listening → capturing → transcribing → thinking → speaking → listening
                                                       ↘ error → listening
```

- One central orb/waveform reflecting the live mic level (reuse `components/mic-waveform.tsx`).
- A slim scrolling transcript rail beside it. Cheap to add, and it is what makes the mode
  reviewable after the fact.
- Persistent controls: **mute/hold**, **interrupt** (tap or spacebar → `ttsQueue.cancel()`
  then straight to `listening`), **switch to typing** (closes the overlay, keeps the
  attempt alive), **end session** (opens the existing `SubmitDialog` — the final
  recommendation flow is unchanged).
- The overlay owns no attempt state. It calls the existing `send('voice', text)` in
  `ConversationalSolve` so optimistic messages, quota toasts and `getAttempt` refresh all
  behave identically.

**Barge-in honesty:** the pipeline gives tap-to-interrupt, not true talk-over. Automatic
barge-in needs always-on VAD during playback plus echo cancellation, and it false-triggers
on the interviewer's own audio through laptop speakers. Ship tap-to-interrupt; revisit
with `echoCancellation: true` + a raised threshold as a stretch in P5.

### `components/solve/ConversationalSolve.tsx` (edit — keep it small)
Add a "Talk mode" entry button near the composer and mount `<VoiceInterview />` when
active. **Reuse the existing `send()`.** Do not fork the send path. The existing mic
(`startMic` / `finalizeMic` / `handleComposerSend`) stays exactly as it is — dictation and
talk mode are different features and both should keep working.

### `lib/tier.ts` (edit)
Add `voiceInterview: boolean` to `TIER_LIMITS` — `free: false`, `lite: false`, `pro: true`.
Client gate only, for UI. **The server gate in `/speak` is the real one.**

### Pricing copy (edit)
`components/pricing-plans.tsx`, `app/(app)/upgrade/page.tsx`, `app/pricing/page.tsx` — add
talk mode as a Pro line. C9's standing rule is that user-facing quota/tier copy must move
in the same commit train as the constants; the same discipline applies to a Pro-only
feature claim.

---

## Backend build

### `routes/speak.py` (new)
`POST /speak` — modelled on `routes/transcribe.py`, which already has the right shape.

```python
uid, user_obj = get_verified_user(supabase, authorization)   # 401
if is_guest_user(user_obj): 403
if effective_tier(supabase, uid) != "pro": 403               # server-side Pro gate
check_rate_limit(f"speak:{uid}", max_calls=40, window_seconds=60)
assert_daily_budget()                                        # 503 global backstop
assert_tts_quota(supabase, uid)                              # 429 per-user daily
```

- Cap input at ~1200 chars (interviewer turns are 1-3 sentences; anything larger is abuse).
- `client.audio.speech.create(model=..., voice=..., input=text)` → stream back `audio/mpeg`.
- Bounded client like transcribe (`timeout=60.0, max_retries=1`).
- `log_ai_usage(user_id=uid, endpoint="/speak", model=<tts model>, audio_minutes=<est>,
  latency_ms=..., success=..., meta={"chars": len(text)})`.
- **Voice choice:** pick one with a neutral, unhurried register that suits Indian English
  case interviews and does not sound salesy. Worth the owner listening to 2-3 candidates on
  a real interviewer reply before it is fixed in code — put the model + voice in named
  constants at the top of the file so swapping is a one-line change.

### `services/ai_usage.py` (edit — no migration)
`voice_minutes_used_today` filters `endpoint == "/transcribe"`, so TTS logged under
`/speak` **cannot pollute the existing voice meter**. Add alongside it:

```python
TTS_MIN_PER_DAY = {"free": 0, "lite": 0, "pro": _int_env("AI_TTS_MIN_PRO", 60)}
def speak_minutes_used_today(supabase, uid) -> float:   # _rows_today(..., "/speak")
def assert_tts_quota(supabase, uid) -> float:           # 429, same copy style as voice
```
Estimate minutes from characters (~900 chars ≈ 1 min of speech) since the TTS response
carries no duration.

**⚠️ COST-LOGGING TRAP — do not add the TTS model to `PRICES`.** `PRICES` holds
`(input $/1M, output $/1M)` **token** tuples, and `log_ai_usage` (line 101) only bypasses
`_est_cost()` for `model == "whisper-1"`. A TTS call has no `response.usage`, so
`pt`/`ct` are `None` and `_est_cost()` returns **0** — talk-mode spend would be logged at
zero and become **invisible to `spend_today_usd()`, which is what `assert_daily_budget()`
reads**. The global catastrophe backstop would not see the single most expensive thing the
app does. Correct pattern — a scalar beside `WHISPER_PER_MIN`, plus one branch:

```python
TTS_PER_MIN = 0.015          # NOT in PRICES — that dict is token-priced

# in log_ai_usage:
if model == "whisper-1" and audio_minutes is not None:
    cost = audio_minutes * WHISPER_PER_MIN
elif model.startswith("tts") and audio_minutes is not None:
    cost = audio_minutes * TTS_PER_MIN
else:
    cost = _est_cost(model, pt, ct)
```

GATE for P1: after the first `/speak` call, `select est_cost_usd from ai_usage_log where
endpoint = '/speak'` must be **non-zero**. Extend `get_ai_input_quota` with a `"speak"` block so
`fetchAiQuota()` / `AiQuota` can show remaining talk-mode minutes — **additive key, existing
`voice` and `images` blocks untouched**, so `lib/api.ts AiQuota` only gains an optional field.

Talk mode burns the existing `/transcribe` meter too (Pro = 60 min/day today). A full
spoken case is realistically 20-40 min of candidate audio, so one long session would consume
most of a Pro user's daily voice minutes.

**OWNER DECISION (2026-08-13): raise the Pro cap before launch.** Set `AI_VOICE_MIN_PRO`
to cover two to three full spoken cases a day (≈150-180) and set `AI_TTS_MIN_PRO` to match.
**Env-var change on the backend host — no code edit, and it must be applied before talk
mode is unflagged**, or the first Pro user to attempt a second case that day gets a 429
mid-interview. `assert_daily_budget()` remains the global backstop against a mic left open.

### `services/interview_engine.py` (edit)
`count_clarifications(text, kind="text")` per C9 v2 above. Keep the docstring honest about
what the voice branch does and why.

### `routes/attempts.py` (edit — one line)
`clar_count = count_clarifications(body.content, body.kind)`. Nothing else in
`post_message` changes.

### `main.py` (edit)
Include the speak router.

---

## Phased build steps + gates

**P0 — clear the tree.** Confirm the 2026-08-01 in-flight work is committed. Branch
`feat/voice-interview` off it. GATE: `git status` clean in both repos before the first edit.

**P1 — backend `/speak` + accounting + Pro gate.**
GATE: `cd consilio-backend && python -m py_compile routes/speak.py services/ai_usage.py main.py` EXIT 0.
GATE: curl with a Pro token returns playable audio; a lite token returns 403; a guest token
returns 403; the 41st call in a minute returns 429; `ai_usage_log` has a `/speak` row with
non-zero `audio_minutes`.

**P2 — hear the interviewer, no mic yet.** Wire `tts-queue.ts` + `markdown-strip.ts` to the
existing typed flow behind the Pro flag. Type a message, hear the reply.
GATE: `npx tsc --noEmit` EXIT 0. Manual: first sentence starts speaking before the reply
finishes streaming; no asterisks audible; two replies never overlap; navigating away kills
audio. **This is the cheapest possible checkpoint on voice quality and latency — get owner
sign-off on the voice here, before building the mic loop.**

**P3 — mic loop + overlay.** `vad.ts` + `VoiceInterview.tsx` + the entry point.
GATE: `npx tsc --noEmit` EXIT 0, `npm run build` EXIT 0.
Manual (real browser + real mic, cannot be CI'd): full spoken case end to end; permission
denied → graceful toast, overlay closes; a 3-second pause mid-sentence does not end the
turn; a 2-minute monologue force-endpoints instead of 413ing; tap-to-interrupt cuts audio
within ~200ms; switching to typing mid-session keeps the attempt alive; refresh mid-session
resumes from `getAttempt` with the transcript intact.

**P4 — voice clarification counting (C9 v2) + the scorer-tag decision.**
Apply the owner's choice from the OPEN DECISION section above. If (a): collapse
`voice` → `text` at `prompts/interview_prompts.py:239` and
`services/interview_engine.py:178` only, leaving `image` / `file` tagged.
GATE: `python -m py_compile services/interview_engine.py routes/attempts.py prompts/interview_prompts.py` EXIT 0.
GATE: score the SAME case twice — once typed, once spoken — and record both scores in the
CHANGELOG entry. This is the only evidence that "scoring stays the same" is true rather
than assumed.
GATE: a **unit test table** for `count_clarifications(text, kind='voice')` — at minimum:
pure structure narration with 3 rhetorical marks → 0; one genuine data request → 1; a
genuine request plus two confirmations → 1; five stacked data requests in one turn → 1
(clamp); the same strings with `kind='text'` → unchanged legacy counts. This is the
riskiest logic in the feature and the only part that can silently make interviews unfair.
GATE: owner sign-off on the C9 v2 text before CONTRACTS.md is edited.

**P5 — polish + hardening.** Quota exhaustion mid-session (429 from `/speak` → fall back to
reading the reply on screen, do not kill the attempt); `/transcribe` 429 → same; network
drop mid-turn; end-session → existing `SubmitDialog`; mobile Safari (autoplay policy — the
first `Audio.play()` must be inside the user gesture that opened talk mode, or nothing will
ever play); guesstimate parity check.
GATE: full `npx tsc --noEmit` + `npm run build` EXIT 0, both repos `py_compile` EXIT 0.

**Migration: NONE.** No schema change, no SQL, so the SQL-idempotency gate is N/A for this
handoff. `attempt_messages.kind` already accepts `'voice'`; the TTS meter reads existing
`ai_usage_log` rows.

**Deploy:** frontend and backend together. The client calls `/speak`, which does not exist
on a stale backend — talk mode must be flag-gated so it cannot be entered until both sides
are live.

---

## Cost check before widening beyond Pro

After the first real spoken case, read `ai_usage_log` for that user and total the
`/transcribe` + `/speak` + interviewer-turn rows for the session. Pipeline maths should land
around **$0.10-0.20 per 25-minute session** (Whisper per audio minute + a few hundred TTS
characters per turn + the existing `gpt-4o-mini` interviewer turns, which are unchanged).
**Confirm against the actual log before opening this to Lite or Free** — that measured
number, not an estimate in a handoff, is what should drive the tier decision.

---

## Commit

```
git add consilio/components/solve/VoiceInterview.tsx \
  consilio/lib/voice/vad.ts consilio/lib/voice/tts-queue.ts consilio/lib/voice/markdown-strip.ts \
  consilio/components/solve/ConversationalSolve.tsx consilio/lib/api.ts consilio/lib/tier.ts \
  consilio/components/pricing-plans.tsx consilio/app/\(app\)/upgrade/page.tsx consilio/app/pricing/page.tsx \
  .brain/handoffs/ANTIGRAVITY_HANDOFF_voice-interview-mode.md
# backend repo — add files EXPLICITLY, never `git add -A` (dormant CRLF/LF churn, see STATE.md)
git add routes/speak.py main.py services/ai_usage.py services/interview_engine.py routes/attempts.py
```

# ANTIGRAVITY HANDOFF — voice-guest-gate (sign in for voice; beta note removed)

**Author:** Claude brain (cloud session), 2026-10-03. **Feature:** NEW — `voice-guest-gate`
(extends `voice-interview-mode`). **Repo:** frontend `consilio` only. Committed straight to `main` by
`apply-voice-guest-gate.ps1` at the owner's request (same delivery as the broadcast work).
**Type:** UI. No backend change, no migration, no new dependency. One env var retired (below).

```
touches:  frontend  NEW  lib/voice/access.ts (pure: voiceAccessKind, voicePlanFor, voiceReturnPath)
                    NEW  components/solve/VoiceAccessCard.tsx (signin | upgrade | credits card)
                    NEW  scripts/test-voice-access.mjs (15 checks)
                    MOD  components/solve/ConversationalSolve.tsx (talkState 'guest'; Talk opens the
                         voice sign-in prompt for guests; Escape / click outside / "Continue in chat"
                         close it and focus the composer)
                    MOD  components/solve/VoiceInterviewGemini.tsx (session refusals 403 guest /
                         403 Pro / 402 minutes render VoiceAccessCard instead of "Connection issue";
                         beta note removed)
                    MOD  components/solve/VoiceInterviewRealtime.tsx, components/solve/VoiceInterview.tsx
                         (beta note removed)
                    DEL  components/solve/VoiceBetaNotice.tsx
breaking: no. No API, schema or CONTRACTS.md surface. Reads the existing 403/402 `detail` strings of
          POST /realtime-gemini/session (routes/realtime_gemini.py); unknown errors stay "Connection issue".
affects:  Solve screen (/cases/[id]) voice entry, India and US alike. Chat, dictation mic, submit and
          the guest save wall are unchanged.
```

## Why (owner report, 2026-10-03)
1. A guest (anonymous session) tapping **Talk** got the voice overlay, then **"Connection issue —
   Create an account to use voice interview mode."** The server refuses guests on Gemini Live (403);
   the overlay showed that refusal as a connection failure. Owner: don't say "connection issue" to
   someone who just isn't signed in; ask them to sign in to continue to voice, or let them carry on in
   chat without signing up, in a way that makes signing up attractive.
2. The **"Voice interview BETA"** note ("We're actively making voice faster…") is no longer true —
   owner: voice is fixed, remove it.

## What ships
**Guest taps Talk** -> no session is requested. A centred prompt opens over the solve screen:
"Voice interview / Sign in to continue to voice interview mode", one line on what voice does, three
ticks (say your structure and hear the reply; live follow-ups on your numbers; your work on this case
comes with you), **Sign up free** (primary) and **Log in**, then "or" and **Continue in chat without
signing up** (closes the prompt, puts the cursor in the chat box). Escape or a click outside also
closes it. Sign-up / log-in links carry `next=/cases/<id>`; the guest's attempt moves to the new
account through the existing GuestClaimBridge (same tab), so nothing is lost by leaving the page.
- Honest fine print, by voice mode (`/public-config` voice_mode): Gemini Live and the standard pipeline
  are Pro-only on the server -> "Free to sign up. Voice interview is included with Pro."; OpenAI
  Realtime gives new accounts a one-time trial -> "New accounts get a free voice interview trial."
- The Talk button itself looks the same as for a signed-in user (not a lock): voice is on offer.

**Signed-in accounts the server refuses** (Gemini overlay), answered in place of "Connection issue":
- 403 "Voice interview is a Pro feature." -> "Voice interview is a Pro feature" card, **See Pro plans**
  (/upgrade?from=voice) + **Continue in chat**.
- 402 out of minutes / free trial used -> "You're out of voice minutes" card with the server's own
  sentence; **See Pro plans** only when that sentence mentions upgrading; **Continue in chat**.
- 403 guest (stale session) -> the same sign-in card as above.
- Everything else (5xx, network, socket refused) still shows "Connection issue" with the detail.

**Beta note**: removed from all three voice overlays and the component deleted.
`NEXT_PUBLIC_VOICE_BETA_NOTICE` is no longer read; if it is set in Vercel it can be deleted (harmless
if left).

Not changed on purpose: talkState for signed-in users (Gemini/Realtime still let anyone signed in
launch and the server decides; pipeline stays Pro-only in the UI); the OpenAI Realtime overlay's
start errors stay a toast (it never showed "Connection issue").

## Gates (cloud sandbox, on origin/main 23d8a31 tree)
- `npx tsc --noEmit` clean; `node scripts/test-voice-access.mjs` 15/15 (exact backend strings ->
  signin / upgrade / credits; 503/500/404/region-403/non-string -> connection; plan by voice mode;
  encoded return path); `next build` clean (/cases/[id] 38.5 kB).
- Browser (Playwright, production build, local Supabase + backend stand-in, voice_mode gemini):
  guest -> Talk opens the prompt (no "Connection issue", no "Beta" anywhere), links
  `/signup?next=%2Fcases%2F<id>` and `/login?next=…`, "Continue in chat" closes and focuses the
  textarea, Escape and outside click close; phone 390 px no horizontal overflow; free account -> Pro
  card; Pro out of minutes -> minutes card; "Continue in chat" leaves voice; no page errors.

## Deploy
Frontend only. Vercel redeploy picks it up; nothing to run on the backend.

## Proposed LEDGER row
| **Voice guest gate** | Claude (cloud) | main | **BUILT 2026-10-03** | `lib/voice/access.ts`, `components/solve/{VoiceAccessCard,ConversationalSolve,VoiceInterviewGemini,VoiceInterviewRealtime,VoiceInterview}.tsx` | voice-interview-mode, guest mode (0045), GuestClaimBridge (0068) |

## Proposed CHANGELOG line
`2026-10-03 · voice-guest-gate · frontend · non-breaking — Guests tapping Talk get a "Sign in to continue to voice interview mode" prompt (sign up / log in / continue in chat) instead of "Connection issue"; signed-in refusals (not Pro, out of minutes) get upgrade/minutes cards; the voice BETA note is removed. touches: see handoff. affects: Solve screen voice entry.`

---

## Addendum 2026-10-03 (b) — free voice trial on Gemini Live; "Switch to chat" back on every voice screen

```
touches:  backend   MOD  routes/realtime_gemini.py (non-Pro accounts use the one-time free trial:
                         per-network daily cap, 402 when used up, max_session_seconds 420 or what
                         is left, token expiry = cap + 3 min; Pro unchanged; free_session_cap())
                    NEW  tests/test_gemini_free_trial.py (19 checks, fakes only)
          frontend  MOD  components/solve/VoiceInterviewGemini.tsx (session clock from
                         max_session_seconds, carried across reconnects; 1-minute warning; ends
                         the call at the cap with "Free voice time for this session is up")
                    NEW  components/solve/SwitchToChatButton.tsx (top right of every voice screen,
                         replaces the bare X); footer "Type instead" renamed "Switch to chat";
                         header/footer wrap on phones
                    MOD  components/solve/VoiceInterviewRealtime.tsx, VoiceInterview.tsx (same button)
                    MOD  lib/voice/access.ts (gemini -> 'trial'; FREE_VOICE_TRIAL_MIN 14 /
                         FREE_VOICE_SESSION_MIN 7), components/solve/VoiceAccessCard.tsx (trial
                         line, "score at the end" line), scripts/test-voice-access.mjs (17 checks)
breaking: no. C4 (API): POST /realtime-gemini/session gains one additive response key
          `max_session_seconds` (int | null) and now answers non-Pro accounts with a session
          instead of 403 "Voice interview is a Pro feature". Old frontends ignore the new key
          (they would not end a free call at 7 min; the token expiry still bounds it).
affects:  Solve screen voice (Gemini Live). OpenAI Realtime and the pipeline are unchanged.
```

**Why (owner, 2026-10-03):** the free voice allowance (14 minutes per account, 7 per case) was built
on the OpenAI Realtime route (`routes/realtime.py` + `services/realtime_credits.FREE_TRIAL_MIN`). The
Gemini Live route was written Pro-only on 2026-09-04 and never picked it up, so once voice_mode was
switched to gemini every free account got "Voice interview is a Pro feature". And with the BETA note
gone, its "Switch to chat" button went too; the exit has to stay obvious.

**Now:** a signed-in free account taps Talk and gets a live Gemini interview with a `7:00 left` clock
(less when the trial is nearly used). At one minute left a toast warns; at zero the call ends with
"Free voice time for this session is up — everything you said is saved; carry on in the chat, or
upgrade to Pro". Usage is reported as before (/realtime-gemini/usage deducts the trial). When the
14 minutes are used: "You're out of voice minutes" card with See Pro plans + Continue in chat. Same
per-network daily cap key as OpenAI (`rt_ip_day:<ip>`, REALTIME_FREE_IP_PER_DAY). Pro: no session
cap, 30-minute token, same 402 minute-pack message as before.

Guest prompt now reads "14 free minutes of voice interview when you sign up, up to 7 minutes per
case", fine print "Free to sign up. No card needed.", and under "Continue in chat without signing
up": "Solve the whole case in chat. You only need an account at the end, to see your score and
feedback." (true: GuestSaveWall asks at submit).

**Gates:** backend `python -m tests.test_gemini_free_trial` 19/19, `tests.test_markets` 48/48,
`tests.test_broadcast_market` 34/34, py_compile clean. Frontend `tsc --noEmit` clean,
`test-voice-access` 17/17, `next build` clean. Browser (production build, local stand-ins incl. a
fake Gemini socket): free account -> live session, clock 1:05 -> warning toast -> call ends at 0 with
the toast, usage reported (15+15+15+15+6 s); trial used -> minutes card; phone 390 px: header wraps,
"Chat" pill visible, footer Hold / Switch to chat / End & submit all on screen; Switch to chat
returns to the chat.

**Deploy order:** backend first is best (until it lands, a free account sees the Pro card, as today).
Either order is safe.

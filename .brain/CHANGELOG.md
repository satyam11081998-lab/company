# CHANGELOG â€” newest first, one entry per landed change

Format (Antigravity appends on each merge):
```
## <date> â€” <feature> â€” <commit short sha>
<one line: what changed>
touches: <files/areas>
breaking: <no | yes â€” which CONTRACTS.md surface>   affects: <features that must re-sync>
```
A brain reading this at session start only needs the top ~15 lines.

---

## 2026-08-13 — voice-interview-mode (talk mode) — <pending commit; cross-repo, branch feat/voice-interview>
Talk mode: the candidate speaks the case out loud and hears the interviewer back, for BOTH cases and guesstimates (they share `ConversationalSolve` and the backend already branches on `case["type"]`). Pipeline, not speech-to-speech: mic → client VAD endpoint → MediaRecorder → the EXISTING `/transcribe` → the EXISTING `send('voice', text)` → the EXISTING `/attempts/{id}/messages` SSE → sentence-buffered TTS via a new `POST /speak` → ordered playback → mic reopens. Chosen over the Realtime API deliberately: every guard the product depends on (rate limit, daily budget, message cap, clarification quota, and the `attempt_messages` insert that happens BEFORE the AI call so a failed turn still persists) lives in `post_message`. A client-side speech-to-speech session would move all of that into the browser and hand the scorer a transcript it cannot trust. `VoiceInterview` therefore owns no attempt state — it drives mic/VAD/TTS and delegates every turn to the parent's existing `send()`. Audio starts on the first sentence boundary rather than waiting for the full reply (interviewer replies are 1-3 sentences by prompt contract), with strict FIFO playback, `AbortController` cancellation on interrupt so an interrupted reply stops costing TTS minutes, and client-side markdown stripping so `**bold**` is not read aloud — deliberately NOT a prompt edit, to leave the 2026-08-01 interviewer voice untouched. TWO SCORING-PARITY FIXES landed with it, both found while verifying rather than while building: (1) both scorer serializers tagged non-text turns, so in talk mode every candidate turn would have reached the model as `[3] USER (voice)` and a spoken attempt would have been scored from a visibly different document than a typed one — `voice` now collapses to `text` at both sites while `image`/`file` stay tagged (this also normalises the pre-existing dictated turns, which had been tagged since dictation shipped); (2) C9's `count_clarifications()` counted every `?`, and Whisper punctuates on rising intonation, so "I'd size this top-down, does that make sense? Urban households only, is that fair?" — one structure statement, zero information requests — scored 2 and would have burned a free user's 7 in minutes. Also fixed a live C9 drift found in passing: `app/pricing/page.tsx` still advertised "Interviewer Hints — free: none, lite: 5 per case, pro: Unlimited" long after the 7/12/20 ladder landed on 2026-08-01, which is precisely the three-way drift C9 exists to prevent.
ADVERSARIAL PASS (same session, before any merge) found nine further defects, seven of them in code written earlier the same session. Worth listing because most would only have shown up in production, on a phone, mid-interview. (1) SELF-TALK RACE: the mic reopened on `ttsQueue.isSpeaking === false`, but when a reply finishes streaming the clips are typically still being FETCHED — so the mic went live a few hundred ms before playback started, recorded the interviewer's own voice, and posted it back as the candidate's next turn. Added a `hasWork` getter (playing OR pending OR queued) and gate on that. (2) SILENCE BILLING: the recorder ran the entire time the candidate was thinking, so a 90-second pause was uploaded and billed as 90 seconds of Whisper, and a long enough think would breach `/transcribe`'s 6 MB cap and lose the answer that followed. The VAD's `maxUtteranceMs` measures from speech ONSET so it never protected this. Fixed by recycling the recorder after 3s idle — NOT by trimming chunks, because MediaRecorder puts the container header in the first chunk and dropping it yields a file Whisper cannot decode. (3) A follow-on bug in that very fix: a cough set `uttering` true with no matching speech-end, which pinned the phase at `capturing` and disabled recycling permanently; handled via the VAD's silent transition. (4) STALE JWT, three places: `VoiceInterview` boots once and holds its callbacks for the whole session, so the captured `token` and the captured `send()` were frozen at mount — and a spoken case outlives a Supabase access token. Routed through refs. (5) MUTE IGNORED: muting during the interviewer's reply was undone the instant playback ended, reopening the mic on a candidate who had deliberately paused. (6) TTS GENERATION RACE: a `/speak` request in flight when a turn was interrupted could resolve after `reset()` and inject audio from the abandoned turn into the next one. (7) DEGRADED TOAST fired per failed clip instead of once (state read inside a `[]`-dep effect). (8) DEAD HEADER: `X-Speak-Remaining-Min` is invisible to the browser because `main.py`'s CORSMiddleware sets no `expose_headers` — removed rather than left looking like a feature; the client already refreshes the `speak` block from every `/transcribe` response. (9) HOT-PATH COST: `effective_tier()` + `assert_tts_quota()` + a second `get_ai_input_quota()` for the header meant NINE Supabase round-trips per spoken sentence, 20-30 per turn, on the one path where latency is the product — now one snapshot, four. Also fixed a PRE-EXISTING bug in dictation while there: `new Blob(chunks, {type:'audio/webm'})` and the hard-coded `recording.webm` filename mislabelled Safari's audio, which records `audio/mp4` — the backend's extension whitelist passed it because the NAME looked right. Both now read the recorder's own `mimeType`; Chromium behaviour is byte-identical.
ABANDONED-SESSION HARDENING (owner raised idle sessions; the honest answer was worse than "wasted tokens"). An open mic is not a neutral idle state: the VAD keeps listening to the ROOM, and anything that trips it costs a Whisper call, an interviewer call and a TTS call. A television in the background could take turns by itself until the daily quota was gone — and those turns land in the transcript the scorer reads afterwards, so an unattended session would also corrupt the score. Six guards: (1) NOISE GUARD (`lib/voice/noise-guard.ts`, new) — Whisper does not return silence for silence, it returns confident filler ("Thank you.", "Thanks for watching!", "you", a lone period), which posted into a live interview makes the interviewer reply to a turn the candidate never took. Exact-match artefact list, deliberately conservative: dropping a real answer is far worse than letting one "Thank you." through, so anything with sentence structure passes ("Thank you, that helps. Now let me structure the problem" survives). (2) IDLE WARN at 3 min, AUTO-CLOSE at 5 min — safe because the attempt stays ACTIVE and every turn is already persisted, so the candidate resumes exactly where they left off. Muting counts as presence, not idleness. (3) VISIBILITY — tab hidden / screen locked / app switched stops the mic and cancels audio; a live mic while the candidate is elsewhere is a privacy problem before it is a cost one. (4) TRACK-ENDED — headphones unplugged, device stolen by another app, permission revoked from site settings; previously the UI would sit at "Listening" forever against a dead track. (5) TRANSCRIBE FAILURE STREAK — 3 consecutive failures backs out to chat instead of retrying into a dead network forever. (6) SEND FAILURE STREAK — `send()` now returns whether the turn landed, because talk mode drives ITSELF in a loop: when an attempt hits `MAX_MESSAGES_PER_ATTEMPT` (200), or the token expires, or the tier lapses, the failure is permanent and identical every time, and each retry was paying for another Whisper transcription. Typed callers ignore the return value. Server-side the existing meters remain the real backstop — these guards reduce waste, they are not what makes it safe.
touches: frontend `components/solve/VoiceInterview.tsx` (new), `lib/voice/{vad,tts-queue,markdown-strip,noise-guard}.ts` (new), `components/solve/ConversationalSolve.tsx` (talk-mode entry + token/done sinks + Pro gate; `send()` untouched), `lib/api.ts` (`speakText`, optional `AiQuota.speak`), `lib/tier.ts` (`voiceInterview` flag), `components/pricing-plans.tsx`, `app/(app)/upgrade/page.tsx`, `app/pricing/page.tsx` (+ the C9 hints-row correction), `components/dictation-button.tsx` (Safari mime fix), `lib/api.ts` (`audioExt` + real filename); backend `routes/speak.py` (new), `main.py`, `services/ai_usage.py` (TTS_PER_MIN + TTS_MIN_PER_DAY + `speak_minutes_used_today` + `assert_tts_quota` + additive `speak` quota block + the cost branch), `services/clarification_counter.py` (new — C9 logic EXTRACTED from interview_engine, which builds an OpenAI client at import time and raises without a key, so the one heuristic that can silently make an interview unfair used to require a real API key plus fastapi plus supabase just to test; interview_engine re-exports it, so every existing importer is untouched), `services/interview_engine.py` (re-export + legacy-flatten tag), `prompts/interview_prompts.py` (case scorer tag only — prompt BODY untouched), `routes/attempts.py` (one line: pass `body.kind`), `tests/test_count_clarifications.py` (new)
breaking: YES — C9 · Clarification quota (v1 → v2), counting method only, ladder unchanged at free 7 / lite 12 / pro 20. C4 additive (`POST /speak`). C2 NOT touched (no return key changes).   affects: Case solve UX, Voice + image input, Free-tier rework / Payments (pricing copy), AI evaluation v2 (transcript tagging only, prompt body untouched)
GATES: **no migration** — `attempt_messages.kind` already accepted `'voice'` and the TTS meter reads existing `ai_usage_log` rows, so the SQL-idempotency gate is N/A. `npx tsc --noEmit` EXIT 0. `python -m py_compile` EXIT 0 over all six touched backend files. `tests/test_count_clarifications.py` 14/14 PASS (voice + text + default-arg regression). Scorer tag collapse verified by executing BOTH serializers and asserting `(voice)` absent / `(image)` present. TTS cost branch verified to book $0.003 for a 180-char reply where the naive `PRICES` approach books $0.000 — that zero would have made talk-mode spend invisible to `spend_today_usd()`, which is what `assert_daily_budget()` reads. `stripMarkdown` 11/11 by transpiling and executing the real module (bold, fences, links, headings, lists, unbalanced markers, `snake_case` preserved). Sentence boundary 7/7 against the real `findBoundary` source — decimals matter here, since "Rs 1.2 crore" and "20.5% growth" are what a case interview is MADE of and splitting on them would have chopped every number in half mid-word. Noise guard 23/23 by transpiling and executing the real module — 15 Whisper artefacts dropped AND 8 real candidate turns preserved, the second half being the one that matters, since a false positive silently deletes someone's answer. Regression surface checked by enumeration: all `count_clarifications` call sites (1 changed), all `get_ai_input_quota` readers (additive key, `/usage/ai-quota` has no response_model so nothing strips it), all `TIER_LIMITS` consumers (explicit-key access only), the pricing table's generic `CellValue` renderer, and both `transcribeAudio` callers (byte-identical on Chromium). Stale-closure audit over `VoiceInterview`: the boot effect runs once, so every value its callbacks read is now either a ref or evaluated at mount — verified by enumerating the non-ref reads.

KNOWN GAPS, not fixed here: (a) an abandoned ATTEMPT still stays `status='active'` forever — pre-existing behaviour, unrelated to talk mode, but a reaper would now be worth having; (b) true barge-in is tap/space to interrupt, not talk-over, which needs always-on VAD during playback and false-triggers on the interviewer's own audio through laptop speakers; (c) the VAD constants (1200ms silence, 700ms minimum utterance, 2.5x calibrated noise floor) are reasoned defaults that have never met a real microphone. `npm run build` NOT COMPLETED in the Cowork sandbox (the mounted-filesystem build exceeds the tool timeout — same environment limit noted on the certificates entry); run it on the real tree before merging. NOT YET QA'd in a real browser: mic, autoplay and VAD tuning cannot be exercised headless. BEFORE UNFLAGGING: raise `AI_VOICE_MIN_PRO` (~150-180) and `AI_TTS_MIN_PRO` on the backend host — a single spoken case eats 20-40 of the current 60 daily Whisper minutes — and audition the TTS voice (`TTS_VOICE` env, default `alloy`).

## 2026-08-11 — certificates — 464f806, 4120ca4, 5019501, e5174da (+ backend edafb57)
Live-project completion certificates: admin issues at /admin/certificates, drafts the role title and scope line from plain prose with AI, downloads a print-ready A4 landscape PDF, and hands the holder a link a recruiter can check with no login. One renderer (@react-pdf/renderer) feeds both the live preview and the download, so the preview cannot drift from what the recipient receives. Public verification is an exact-match SECURITY DEFINER RPC returning only the printed fields, NOT a view granted to anon (a view is reachable through PostgREST as an unfiltered list endpoint and would expose the whole register); cert ids are random 6-char Crockford base32 for the same reason. House style (no em/en dashes) enforced in the UI, at the API and as a CHECK constraint. The AI drafter may not cite a figure absent from the admin's notes, verified in Python rather than only prompted. Certificates are revoked, never deleted. Two pre-existing bugs fixed on the way: next.config.js aliased `fontkit` to false, which silently disabled ALL font embedding in @react-pdf/renderer (fontkit is not a pdf.js dependency; the Cheat Sheet never noticed because it uses built-in Helvetica), and the preview iframe had a fixed pixel height that letterboxed a landscape page into a portrait box.
touches: supabase/migrations/0046_certificates.sql, next.config.js, lib/{certificates,constants}.ts, components/certificates/certificate-pdf.tsx, components/admin/admin-nav.tsx, app/(app)/admin/certificates/*, app/api/admin/certificates/{,[id],draft}/route.ts, app/verify/[certId]/page.tsx, public/fonts/*, public/certificates/*, package.json, package-lock.json, yarn.lock; backend main.py, routes/certificates.py, services/certificate_ai.py
breaking: no — C4 additive note only   affects: Admin (new nav entry + page)
GATES: `tsc --noEmit` EXIT 0, `py_compile` EXIT 0, SQL parsed with pglast v8.4 and both non-trigger plpgsql functions compile, PDF render verified end to end (1 page, 297.0x210.0mm, 1808 chars selectable) and QR decoded back to the correct /verify URL. `npm run build` NOT RUN (no network for next/font in that environment). Run migration 0046 after 0041..0045.

## 2026-08-06 — influencer-growth-kit — <pending commit>
Influencer marketing launch: (1) Demo / showcase account (users.is_demo = true, excluded from public leaderboards, activity feed, peer-proximity; exempt from session lock; 77% constellation seeded; skill-graph column name fallback fixed). (2) Admin Users panel (/admin/users with 30-day signup chart, filters, full user drawer, session details, demo toggle, sign out everywhere). (3) Influencer coupons (C7 v2: public/unlimited coupons, max_redemptions cap, list-price commission, ANUSHKA10 seeded, /admin/coupons management and payout tracking; lost-update fixed via coupon_redemptions recount). (4) Single active session lock (Netflix-style user_sessions on JWT session_id, conflict screen with takeover valve, fails open; non-session direct navigation handled). (5) Branded watermarked cheat sheet PDF with self-referencing share links (/s/[id] public landing & streaming; private bucket for secure revocation; cached demo ID lookups). Verification script: supabase/check-growth-kit.sql (10 read-only health checks).
touches: supabase/migrations/0044_growth_kit.sql, supabase/seed-demo-account.sql, supabase/check-growth-kit.sql, lib/{coupons,sessions,tier,types,constants}.ts, lib/dashboard/{demo-users,skill-graph,leaderboards,peer-proximity,activity-feed}.ts, lib/supabase/{auth-cached,middleware}.ts, app/(app)/layout.tsx, app/(app)/dashboard/page.tsx, app/(app)/cheat-sheet/page.tsx, app/(app)/admin/{users,coupons}/*, app/api/razorpay/{order,verify,webhook}/route.ts, app/api/coupons/validate/route.ts, app/api/cheat-sheet/share/route.ts, app/api/session/end/route.ts, app/s/[id]/*, app/session-conflict/*, components/cheat-sheet/*, components/admin/admin-nav.tsx, components/sign-out-button.tsx
breaking: YES — C7 · Discount coupons (v1 → v2)   affects: Payments, Deck Vault Rewards, Admin
GATES: `tsc --noEmit` EXIT 0, `npm run build` EXIT 0, Postgres grammar + plpgsql compile validated. Run 0044 migration in Supabase.

## 2026-08-01 — interviewer-voice + solve-scroll + daily-done-state — <pending commit; cross-repo>
Three UX fixes found by owner testing right after the quota fix landed (9d80195 / 2c3da6f). (1) INTERVIEWER VOICE: every reply opened "Let's assume X" — a 7-question transcript read as one sentence with different nouns. Cause was twofold: the system prompt literally instructed `say "Let's assume X"`, and `temperature=0.4` locked the phrasing in. Both interviewer prompts (case + guesstimate) now carry a SOUND LIKE A PERSON block — never open two consecutive replies the same way, a sample bank of varied assumption hand-overs, react to what the candidate actually said, occasionally turn the question back (~1 in 4-5, never twice running), shift register once they move into structure. Sampling moved to `INTERVIEWER_TEMPERATURE = 0.75` + small frequency/presence penalties (0.35 / 0.25), named constants so scoring's low temperature can never be confused with the interviewer's. Every behavioural guardrail preserved verbatim: 1-3 sentences, never solves the case, no praise/scoring language, no bullets, Indian English register, 180-token cap. (2) SOLVE SCROLL: the composer is absolutely positioned over the thread and the thread cleared it with a hard-coded `pb-32` (128px) — so the moment the composer grew (quota banner + voice line + wrapped textarea) the newest turns were hidden underneath and unreachable. Thread padding is now driven by a ResizeObserver on the composer (+24px), and the scroll-to-bottom effect re-runs on height change. (3) DAILY DONE-STATE: dashboard showed "Start the case" / "Start the guesstimate" even after the user had solved today's daily — and on free tier that CTA walks straight into the one-attempt-per-case lock. New `lib/dashboard/daily-progress.ts` derives attempted/score/best-submission from the `submissions` rows the dashboard ALREADY fetches (zero extra queries); all three hero variants and the guesstimate card now show a tick + "Attempted today · 85", primary CTA opens that attempt's results, secondary goes to the practice hub. Unscored/abandoned attempts still count as attempted but route back to the case ("Finish it") instead of a dead results link. Guesstimate MCQ teaser hides once done.
touches: backend `prompts/interview_prompts.py` (both system prompts), `services/interview_engine.py` (INTERVIEWER_TEMPERATURE/FREQUENCY/PRESENCE constants, both call sites); frontend `lib/dashboard/daily-progress.ts` (new), `app/(app)/dashboard/page.tsx`, `components/dashboard-client.tsx`, `components/dashboard/hero.tsx` (+ exported `DailyCaseCta`, `DailyDoneBadge`), `components/dashboard/guesstimate-card.tsx`, `components/solve/ConversationalSolve.tsx`
breaking: no — additive props (`progress?`) with undefined = previous behaviour   affects: Case solve UX, Dashboard, AI evaluation v2 (prompt file only, scoring untouched)
GATES: no migration. Scoped `tsc` EXIT 0 over all changed files; `py_compile` EXIT 0. Deploy backend + frontend together as before. Prompt changes are live-behaviour — worth eyeballing one real transcript after deploy to confirm the interviewer stopped repeating itself and did not get chattier than 1-3 sentences.

## 2026-08-01 — fix-clarification-quota-dead-end — 9d80195 (backend) · 2c3da6f (frontend)
P0 UX BUG: a brand-new free user asking their first question in a live case got "Clarification quota used up" and NO interviewer reply at all. Root cause was two-part — `CLARIFICATION_QUOTA["free"] = 0` in backend `routes/attempts.py`, combined with `count_clarifications()` firing on ANY '?', meant the exhausted branch caught the very first message (and any structure containing a question mark), returning JSON with `assistant_message: None` and never calling the AI. The 2026-06-20 fix f87fe5d had hidden the counter whenever quota was 0, so free users also had zero signal that a limit existed. THREE fixes: (1) ladder is now free 7 / lite 12 / pro 20 per attempt — free tier is gated on case ACCESS (daily pair + 1 lifetime extra, access_guard.py), not conversation quality; (2) the early-return dead-end is GONE — on exhaustion the interviewer still streams a reply, told by `CLARIFICATIONS_EXHAUSTED_DIRECTIVE` to decline the clarification in-character and redirect ("make an assumption and take me through your structure") rather than the server going silent; (3) SSE `meta` now carries `clarifications_spent` so the client toast fires ONLY on a genuinely declined turn instead of inferring it from `remaining === 0 && assistantText === ''` (which also misfired when a stream errored on the last question). Also: `clarification_used` is clamped to the quota on write (a packed multi-'?' turn could push it past quota and drive remaining negative in the DB); `lib/tier.ts` pro was `Infinity` while the backend hard-capped at 15 — now an honest 20 on both sides; every FastAPI error in `lib/interview-api.ts` surfaced its raw JSON body in a toast (`post message failed (400): {"detail":...}`) and now shows the `detail` sentence.
touches: backend `routes/attempts.py` (CLARIFICATION_QUOTA, exhausted branch, meta payload, used-clamp), `prompts/interview_prompts.py` (+CLARIFICATIONS_EXHAUSTED_DIRECTIVE, build_interviewer_messages arg), `services/interview_engine.py` (stream_/complete_interviewer_reply pass-through); frontend `lib/interview-api.ts`, `lib/tier.ts`, `components/solve/ConversationalSolve.tsx`, `components/pricing-plans.tsx`, `app/(app)/upgrade/page.tsx`, `app/pricing/page.tsx`, `supabase/migrations/0043_clarification_quota_uplift.sql` (new)
breaking: no — but ADDS a new contract C9 (clarification-quota tier surface, v1) to CONTRACTS.md   affects: Case solve UX, Free-tier rework, Payments/Pricing copy, AI evaluation v2 (prompt file)
GATES: RUN 0043 in Supabase after 0041+0042 — without it, users with an ACTIVE attempt created before this change keep the 0 quota baked in at tier_at_start and stay broken. Backend must redeploy WITH the frontend (the client reads `clarifications_spent` from meta; an old backend degrades to the legacy JSON branch, which still works).

## 2026-07-18 — deck-vault-discount-revision — <pending commit; cross-repo>
Discount matrix revised: corporate 60% → 35%, b-school 40% → 25% (owner decision). Changed in all three constants (backend routes/deck_vault.py DEFAULT_PCT, lib/deck-vault-api.ts DECK_VAULT_PCT, admin client DEFAULT_PCT) + every marketing string (pricing strip, upgrade banner/popup, /deck-vault hero + T&C §4) + doc comments. T&C version bumped '2026-07-17' → '2026-07-18' (backend TNC_VERSION) since the displayed terms changed. Existing active coupons keep their minted % (coupon row is authoritative at redemption — C7 unchanged).
touches: routes/deck_vault.py (backend), lib/deck-vault-api.ts, components/deck-vault/deck-vault-promo.tsx, components/pricing-plans.tsx, app/(app)/deck-vault/page.tsx, app/(app)/admin/deck-vault/{page,deck-vault-admin-client,actions}.tsx/.ts, app/(app)/upgrade/page.tsx (comment)
breaking: no   affects: Deck Vault Rewards, Pricing copy

## 2026-07-17 — deck-vault-filters + approved-backfill — <pending commit>
Deck Vault catalogue gains structured filters + the full approved→vault pipeline. Migration 0042: `deck_skeletons` + `year`, `organizer`, `source_submission_id` (unique-linked to deck_submissions); links rows auto-published before linkage existed (storage_path match) and BACKFILL-inserts every approved submission missing from the catalogue (ext whitelist, result-label normalization). Auto-publish + admin uploader now write year/organizer; result labels corrected ('National 2nd Runner Up', filter-accurate). /skeletons library: search box (title/competition/organizer/description) + Year / Company-College / Result / Domain selects, year on cards, unified Clear-all. RUN 0042 AFTER 0041.
touches: supabase/migrations/0042_deck_vault_filters.sql (new), app/(app)/admin/deck-vault/actions.ts, components/admin/deck-upload-manager.tsx, components/skeleton-library.tsx, app/(app)/skeletons/page.tsx
breaking: no — C8 additive (catalogue schema v2)   affects: Deck Vault & DRM, Deck Vault Rewards, Admin

## 2026-07-17 — deck-vault-rewards-auto-publish + drive file_type fix — 1f49694 + <pending commit>
Approving a rewards submission now ALSO auto-publishes the deck into the public Deck Vault library (`deck_skeletons` insert: title "<comp> <year> — <result> Deck", result via POSITION_TO_RESULT map, case_type 'strategy' / round_type 'finale' defaults, is_active true, storage_path shared with the submission — non-fatal on failure, coupon still issued). PENDING COMMIT on top: file_type derivation fixed for Drive-stored decks — `deck_path.split('.')` wrote garbage for `gdrive:<id>` paths; new `deckFileType()` asks Drive for the stored filename (`fetchFileName()` added to lib/google-drive.ts) and clamps to pdf/pptx/ppt.
touches: app/(app)/admin/deck-vault/actions.ts, lib/google-drive.ts
breaking: no   affects: Deck Vault & DRM (library gets user-sourced rows), Admin

## 2026-07-17 — deck-vault-rewards-drive-storage — 6a7f496 (backend)
Reward submissions now store deck+certificate in the Google Drive vault (same folder + `gdrive:<fileId>` convention as the library — see C8): new `services/gdrive.py` (Python twin of lib/google-drive.ts; OAuth-refresh OR service-account JWT, SAME env names; server-side resumable upload; delete). Supabase bucket `deck-vault-submissions` remains as automatic fallback when Drive env is absent. telegram_notify now accepts TELEGRAM_CHAT_ID or TELEGRAM_ADMIN_CHAT_ID. OPS GATE: backend host (Render) needs the Google + Telegram env vars copied from Vercel or alerts no-op + storage falls back to bucket.
touches: services/gdrive.py (new), routes/deck_vault.py, services/telegram_notify.py, .env.example (backend)
breaking: no (C8 additive)   affects: Deck Vault Rewards, Admin file door

## 2026-07-17 — deck-vault-rewards — 849a0dc + 47764c2 (frontend) · 41a5f50 (backend) — cross-repo, landed direct-to-main
NEW FEATURE: "Won a case competition? Get up to 60% off Pro." Users upload winning deck + certificate (+T&C rights grant) at /deck-vault → private storage → Telegram ping to admin → manual review at /admin/deck-vault (default corporate 60% / bschool 40%, editable) → approval mints single-use, user-locked, 30-day, Pro-scope coupon MECE-DECK-XXXXXX → applied on /upgrade (coupon box; discounted PriceBlock) and enforced SERVER-SIDE in razorpay order/verify/webhook via shared `discountedPaise()` (see C7). Surfaces: pricing-page strip (public), upgrade banner, one-time popups (dashboard+upgrade, non-Pro, localStorage), admin nav "Deck Rewards", admin file door /api/admin/deck-vault/file/[id] (streams Drive, signs bucket legacy). Backend: /deck-vault/submit (multipart, magic-byte+size+enum validation, rate-limited, one-pending + no-repeat-after-approval) + /deck-vault/status. DB: migration 0041 (deck_submissions, discount_coupons, RLS select-own, partial unique indexes, private bucket). 47764c2 fixed two build breakers (React18 RefObject; CouponRow `as typeof` never-narrowing).
touches: supabase/migrations/0041_deck_vault_rewards.sql, lib/{tier,deck-vault-api}.ts, app/api/razorpay/{order,verify,webhook}/route.ts, app/api/coupons/validate/route.ts, app/api/admin/deck-vault/file/[submissionId]/route.ts, app/(app)/deck-vault/page.tsx, app/(app)/admin/deck-vault/*, app/(app)/{upgrade,dashboard}/page.tsx, components/deck-vault/deck-vault-promo.tsx, components/{pricing-plans,admin/admin-nav}.tsx; backend routes/deck_vault.py, services/telegram_notify.py, main.py
breaking: no — new contracts C7 + C8 (additive); razorpay order accepts optional `coupon` (C4 note)   affects: Payments, Deck Vault & DRM, Admin, Pricing/Upgrade
GATES: run 0041 in Supabase; Vercel prod build currently FAILING at prerender on missing NEXT_PUBLIC_SUPABASE_* (see STATE.md blockers) — feature not visible on live site until resolved.

## 2026-07-17 — cv-pointer-lab-prompt-fix — 7adc9d2 (backend)
CV Pointer Lab engine (services/resume_ai.py /resume/point): missing NUMBERS are no longer a reason to ask a clarifying question — bullets are written with natural placeholders (XX%, XX+, ₹XX, XX Cr, XX clients…); clarify is reserved for genuine role/function ambiguity only. _SHARED_RULES upgraded: impact-first structure (Action + Impact → Method → Context), expanded verb list, full placeholder set; band-expand step emits XX-style placeholders.
touches: services/resume_ai.py (backend)
breaking: no   affects: Resume Lab / CV Pointer Lab

## 2026-07-14: Landing Deck Vault & ISR Migration
- **Feature**: Added Deck Vault section to landing page (`DeckVaultVignette`).
- **Perf**: Migrated `/` to ISR (`revalidate = 300`) with static Supabase client.
- **A11y**: Flattened `<Link><button>` nesting across landing and auth CTAs.
- **Motion**: `EndorsementWall` and `HeroInterviewDemo` now respect `prefers-reduced-motion` and pause off-screen.
- **UI**: Fixed dark-mode inversion on geometric shapes and auth page logos.

## 2026-07-10 — landing-vignettes — <pending commit>
Scroll-triggered play-once vignettes on the landing page (shared IntersectionObserver hook, reduced-motion safe): GD-brief card now assembles itself (summary → smart angles stagger in → data-point chip → opening line types out); leaderboard rows slide in with points counting up and "You" highlighted; hero stats (6 dimensions / 60s) count up. CV-lab vignette skipped per owner. Nothing loops in parallel with the hero demo.
touches: components/landing-vignettes.tsx (new), app/page.tsx
breaking: no   affects: Landing page

## 2026-07-10 — hero-interview-demo — <pending commit>
Landing hero right column replaced: static dashboard mockup → auto-playing typed AI case-interview demo (interviewer Q → structured answer → pushback → answer → score card with animated dimension bars + "Would advance"), looping, chat-style, pure DOM/CSS (no video). Respects prefers-reduced-motion (renders finished state). Shows the core product loop to visitors who never explore features.
touches: components/hero-interview-demo.tsx (new), app/page.tsx
breaking: no   affects: Landing page

## 2026-07-10 — abstract-gd-library — <pending commit; backend prompt upgrade pending>
Abstract GD page rebuilt: generated briefs now land in a SHARED cross-user library (left rail on desktop, collapsible card on mobile) read from the abstract_briefs cache via new /api/abstract-briefs (list = any signed-in; full view = Lite/Pro, server-checked). Fixes the "Generating… but where?" bug — the viewer now sits directly under the generator and we scroll TO it (was: scroll-to-top with the result buried below the topic bank). Topic chips show ✓ when already generated and open instantly (zero tokens); topic-bank categories are collapsible (first open) so mobile is no longer cluttered. Renders optional `perspectives` (editorial-style, 3-4 views with data) when the backend starts emitting it — see handoff for the prompt spec.
touches: app/(app)/gd-briefs/abstract/page.tsx, lib/abstract-gd.ts, app/api/abstract-briefs/route.ts (new)
breaking: no   affects: GD Briefs (abstract)

## 2026-07-10 — daily-tile-fallback — <pending commit>
Dashboard daily case/guesstimate tiles no longer dead-link to /practice before the morning cron: lib/daily-server.ts + lib/access.ts now take the MOST RECENT daily_schedule row on/before today (was exact-date match → no row between IST midnight and the cron → both tiles fell back). Access gate uses the same row so free users aren't charged their one-time credit for clicking the shown daily. Backend must mirror (routes/daily.py, access_guard.py) — see handoff.
touches: lib/daily-server.ts, lib/access.ts
breaking: no   affects: Dashboard daily tiles, Case solve UX (free gating), Daily content

## 2026-07-10 — ai-credit-monitor-card — <pending commit>
Admin → AI usage gains a Credit monitor card (display-only, simplified from the original Telegram-alert design): today's IST spend from ai_usage_log vs AI_DAILY_BUDGET_USD with progress bar + within/exceeded badge, and a Telegram configured/not-configured indicator (TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID env). NOTE: actual Telegram SENDING (low-credit ping, cron watch, migration 0037) was dropped in the simplification — rebuild pending if owner wants the alert itself.
touches: lib/ai-credit.ts (new), components/admin/ai-credit-monitor.tsx (new), app/(app)/admin/ai-usage/page.tsx, .env.example
breaking: no   affects: Admin (AI usage)

## 2026-07-10 — free-tier-rework — c96e952 (2 repos; backend pending)
Free tier = taste of everything: dailies + ONE lifetime bank case + ONE guesstimate ('free-extra-used' lock after); ONE lifetime GD brief (gd_brief_unlocks) incl. cheat-sheet save + PDF; news list visible but source links dead for free; cheat sheet now Lite+ full (was Pro; client-only RLS hole closed in 0038); CV Pointer Lab = Pro with 2 lifetime free tries (feature_trials); pricing page updated. NOTE: run 0038; BACKEND SPEC PENDING (access_guard mirror, news.py unlock logic + source_url strip, resume trial counter) — see handoff.
touches: lib/{tier,access}.ts, app/(app)/cases/[id]/page.tsx, app/(app)/gd-briefs/{page,[id]/page}.tsx, components/cheat-sheet/add-to-cheat-sheet-button.tsx, app/(app)/cheat-sheet/page.tsx, app/(app)/resume/page.tsx, components/resume/bullet-lab.tsx, components/pricing-plans.tsx, supabase/migrations/0038_free_tier_rework.sql
breaking: TIER-SURFACE change (cross-repo). affects: Case solve UX, Practice hub, GD Briefs, Cheat Sheet, Resume Lab, Pricing

## 2026-07-10 — casebook-mobile-ux — 7b8457a
Mobile casebook UX: red icon-only hamburger (was ☰ Contents pill), drawer nav tree fully collapsed on every open, headline-first page header with Read more (dek/byline/meta collapsed on mobile). Desktop pixel-unchanged.
touches: components/casebook/{casebook-reader,page-intro (new),casebook-search,nav-tree,primer-workspace}.tsx
breaking: no   affects: Casebook (mobile)

## 2026-06-27 — direct-pdf-download — pending
direct-pdf-download — Resume Lab + Cheat Sheet download a real text PDF directly via @react-pdf/renderer (no print dialog / headers)
touches: package.json, next.config.js, components/resume/resume-pdf.tsx, components/resume/resume-editor.tsx, components/cheat-sheet/cheat-sheet-pdf.tsx, components/cheat-sheet/cheat-sheet-client.tsx
breaking: no   affects: Resume Lab, Cheat Sheet

## 2026-06-21 — leaderboard-college-linkedin — <pending commit + DB run>
Leaderboard rows + podium now show COLLEGE under the name and an optional LinkedIn 'in' icon to connect. LinkedIn is opt-OUT (default ON via new migration 0018 users.show_linkedin); a profile toggle and an onboarding question let users switch it off. Data layer (leaderboards.ts) now selects college_id/college_other/linkedin_url/show_linkedin, resolves college display names, and only emits linkedinUrl when show_linkedin !== false. NOTE: run migration 0018 on Supabase.
touches: supabase/migrations/0018_leaderboard_linkedin.sql (new), lib/dashboard/leaderboards.ts, components/leaderboard/leaderboard-client.tsx, components/profile/profile-client.tsx, components/onboarding/onboarding-form.tsx, app/api/onboarding/complete/route.ts, lib/types-onboarding.ts, lib/types.ts
breaking: no — additive column + UI. affects: Leaderboard, Profile, Onboarding (C6 users-schema: additive col)

## 2026-06-21 — casebook-darkmode-contrast — <pending commit>
Fixed dark-mode text visibility across the casebook chrome + content blocks. Root cause: `text-navy` / `.tag-navy` use the `--navy` token, which stays DARK in dark mode → dark-on-dark, invisible. Added `dark:text-navy-foreground` to the left-nav section labels + 'MECE Casebook' header, case-section headings, reveal/clarifying headers, math-box, quote, prev-next, dialogue interviewer bubble, primer source links; and added `.dark .tag-*` overrides (subtle dark fills + legible light text) so the tag chips are readable. Light mode unchanged.
touches: components/casebook/{nav-tree,casebook-search,prev-next,primer-embed}.tsx, components/casebook/blocks/{case-section,dialogue,math-box,quote,reveal}.tsx, app/globals.css
breaking: no   affects: Casebook dark-mode legibility (all pages)

## 2026-06-21 — guesstimate-data-cheatsheet — <pending commit>
New casebook page guesstimates/data-cheatsheet (first under B·Guesstimates): a dense, infographic-style reference of India macro+micro anchors for market-sizing — 4 inline SVG panels (anchor-number grid, age structure, income pyramid, economy/digital/mobility) + 3 reference tables (conversions/time, per-capita rates, default assumptions) + tip/warning callouts + takeaways. Adds a 'Going deeper → Industry Primers' callout that LINKS the overlapping sector data to the existing primers (Telecom/Payments/E-Commerce/Automobile/EV/FMCG/etc.) instead of duplicating it. Figures verified mid-2026 (UN/Worldometer, IMF WEO Oct-2025, NPCI, MoRTH, IAMAI) and labelled as planning anchors; adversarial note flags household-count/smartphone/sector-vs-jobs caveats. Reuses existing block types (no schema change).
touches: lib/casebook/content/guesstimates/data-cheatsheet.ts (new), lib/casebook/content/index.ts, lib/casebook/tree.ts
breaking: no   affects: Casebook content/tree

## 2026-06-21 — gd-news-free-access — <pending commit, 2 repos>
Free members can now browse the GD news list (backend GET /news/headlines opened to all signed-in users; was Lite-gated). Generating AND viewing a GD brief stays Lite/Pro — server-enforced on both /news/briefs/{id} endpoints — with an 'Unlock with Lite' upgrade CTA on each headline card (full-page wall removed). Also bounded the headline-classifier OpenAI call (timeout=45,max_retries=2) to finish the cron-robustness review.
touches: consilio/app/(app)/gd-briefs/page.tsx, consilio/app/(app)/gd-briefs/[id]/page.tsx; consilio-backend/routes/news.py, services/headline_classifier.py
breaking: no   affects: GD Briefs, News pipeline (tier surface)

## 2026-06-21 — harden-cron-keepalive — <pending commit>
Made the automated daily jobs fool-proof against Render free-tier cold starts: (1) daily-news.yml now WAITS for /health=200 before firing work + stronger retries (6x, 600s) + always-chains schedule-daily; (2) new keep-alive.yml pre-warms the dyno every 10 min in the 00:00 UTC window; (3) /api/cron/refresh rewritten with a warm-up poll loop + retried kicks that treat a timeout as 'work continues server-side' and always return 200 (a slow-but-working backend no longer shows as a failed cron); also accepts x-cron-secret. Both triggers (GH Actions + Vercel cron) are idempotent and redundant.
touches: .github/workflows/daily-news.yml, .github/workflows/keep-alive.yml (new), app/api/cron/refresh/route.ts
breaking: no   affects: Daily content + keep-alive (cron triggers only; backend job code unchanged)

## 2026-06-21 — daily-guesstimate-cta — <pending commit>
Added a dedicated 'Start the guesstimate' primary button to the dashboard daily-guesstimate card (mirrors the daily case's 'Start the case' CTA); routes to /cases/{id}, replaces the subtle 'attempt now →' text. Falls back to 'Browse guesstimates' when no daily.
touches: components/dashboard/guesstimate-card.tsx
breaking: no   affects: Dashboard daily tiles

## 2026-06-21 — fix-daily-link-resolution — <pending commit>
Daily case + guesstimate tiles fell back to /practice whenever the day's guesstimate was scheduled by short code: daily-server resolved guesstimate_code via eq('id', <code>) against the uuid id column, which threw and — under Promise.all — rejected the whole batch, nulling BOTH daily picks. Now resolves daily refs by id OR code (UUID_RE) and uses Promise.allSettled so one bad lookup can't null the others. access.ts likewise matches the daily guesstimate by id or code (was wrongly locking free users out of the daily guesstimate); caller passes caseRow.code. Recurs-on-new-daily bug.
touches: lib/daily-server.ts, lib/access.ts, app/(app)/cases/[id]/page.tsx
breaking: no   affects: Dashboard daily tiles, Case solve UX (free-tier daily gating)

## 2026-06-21 — practice-domains-seed — <pending commit + DB run>
Added supabase/seed-cases-domains.sql: 7 new practice domains as first-class case TYPES — `market entry`, `pricing`, `m&a`, `operations`, `cost reduction`, `go to market`, `competitive strategy` — 5 mixed-difficulty cases each; topped up `market_sizing` (+4); +6 mixed-difficulty guesstimates. 45 rows total. Mirrors seed-cases-constellation.sql exactly (markdown ~15-min prompts, interview_meta, skill_cluster tag, skill_node NULL). Requires new migration 0017_cases_type_expand.sql (widens the cases.type CHECK — additive, non-breaking) to run first; also added display labels for the new types in lib/constants.ts (CASE_TYPE_LABELS). Idempotent ON CONFLICT (code). With existing profitability/growth, the /practice 'All domains' dropdown becomes ~10 domains, each with >=5 attemptable questions. NOTE: must be run against Supabase to take effect (data, not schema).
touches: supabase/seed-cases-domains.sql (new)
breaking: no — additive rows to `cases` (no column/schema change, not a C1 contract event)   affects: Practice hub, DB:cases (rows)

## 2026-06-21 — testimonials-carousel-overhaul — <pending commit>
Redesigned the landing testimonials carousel: uniform fixed-height (340px) cards with the quote clamped (line-clamp-6) and the author pinned to the bottom, so varying quote lengths no longer distort the row or leave one card clipped. Removed the bulky outer Card frame; hidden the native scrollbar and added soft edge-fades + polished round arrow controls. ≤3 testimonials center; >3 become a snap carousel.
touches: components/testimonials-carousel.tsx
breaking: no   affects: landing page

## 2026-06-21 — fix-practice-domains-and-caselib-links — <pending commit>
/practice domain dropdown now lists only real scored-case categories, so every domain resolves to attemptable practice questions. Removed the Case Studies tab/cards and ALL read-only deep-links: /learn/practice-case-library# (study cards + randomizer fallback) and the guesstimate card's /learn/guesstimates-market-sizing# 'Walkthrough'. Tabs now All/Scored/Guesstimates/Attempted; guesstimate card shows only Solve →. Legacy ?tab=studies is sanitized to 'all'.
touches: components/practice-hub.tsx
breaking: no   affects: Practice hub (Guesstimate end-to-end / Case solve UX surface)

## 2026-06-20 — mece-framework-page — <pending commit>
Added a dedicated MECE page (Mutually Exclusive, Collectively Exhaustive) as the FIRST entry under Core Frameworks; covers the two failure modes (overlap/gap), five MECE-by-construction split axes, a 10-second check, and cross-links Structuring fundamentals. Runtime-verified (12 blocks, valid types, 5×3 table, on-grammar SVG).
touches: lib/casebook/content/frameworks/mece.ts (new), lib/casebook/content/index.ts, lib/casebook/tree.ts
breaking: no   affects: Casebook content/tree

## 2026-06-20 — fix-free-clarification-counter — f87fe5d
Free tier (0 clarification quota) no longer shows a misleading red 'Questions remaining: 0' chip + 'used all clarifications' banner on the working daily case/guesstimate; counter/banner render only when the tier actually has a quota (hasClarifications), with a structure-focused composer placeholder for free.
touches: components/solve/ConversationalSolve.tsx
breaking: no   affects: Case solve UX

## 2026-06-20 — landing-testimonials-placement — 055ce98
Moved testimonials from page-bottom to mid-page (right after the Cases feature, ~40% vs ~85% scroll) + a strong testimonial beside the final navy CTA; testimonials section bg set to plain to avoid card-on-card stacking.
touches: app/page.tsx
breaking: no   affects: landing page

## 2026-06-20 — pricing-drop-annual-b2b — 2901f0b
Removed the Annual billing option from the /upgrade and /pricing toggles (BILLING_PERIODS → monthly + quarter). The BillingPeriod type, TIER_PRICING, BILLING_PERIOD_DAYS/LABELS/SUFFIX and isBillingPeriod() still keep 'annual' so legacy annual subscribers and the Razorpay order route stay backward-compatible. Added a low-emphasis "Colleges & clubs" B2B contact strip (mailto:team@mece.in, no public quote) beneath the plan cards on both pages.
touches: lib/tier.ts, app/(app)/upgrade/page.tsx, app/pricing/page.tsx, components/teams-contact-banner.tsx (new)
breaking: no   affects: Payments / pricing UI

## 2026-06-20 — primer-fullscreen-collapsible — 3fe6c89
Industry Primer pages get an in-app full-screen overlay (Back button top-left) + native Fullscreen API toggle, and a collapsible desktop nav rail that reflows the grid to full reading width. UI/chrome only; the primer bundles in public/primers are untouched. Dark-mode for the primer bundles deferred.
touches: components/casebook/primer-embed.tsx (now client), components/casebook/primer-workspace.tsx (new), components/casebook/casebook-reader.tsx
breaking: no   affects: Industry Primers, Casebook reader chrome

## 2026-06-20 — learn-clarifying-dropdowns — bf4c2b4
Every casebook worked example (26 guesstimates + 26 cases) now opens with a collapsible clarifying-questions dialogue (candidate↔interviewer + why-notes + a closing "What the questions locked" insight). Cases standardized from caseSection to the reveal dropdown; guesstimates newly added. Reuses existing reveal/dialogue/callout blocks.
touches: lib/casebook/content/guesstimates/*.ts (26), lib/casebook/content/cases/**/*.ts (26)
breaking: no   affects: Casebook (content)

## 2026-06-20 — nav-more-font-fix — 27a0be3
'More' nav item font size aligned to the other links (text-sm); removed a legacy globals.css override.
touches: components/app-nav.tsx, app/globals.css
breaking: no   affects: none

## 2026-06-19 — dynamic-domains-db — <hash>
Added per-user case_tags table (user-defined "domains"): FULL unique index on (user_id,case_id,tag_norm), 1-30 char check, RLS owner-only. Additive — does not touch cases. Migration verified idempotent (run twice) + dedup/length behaviour. UI to follow.
touches: supabase/migrations/0013_case_tags.sql
breaking: no   affects: none

## 2026-06-19 — gd-brief-summary — <hash>
GD-brief summary upgraded from a 2-3 sentence line to a substantive, neutral 120-180 word context paragraph (background + central tension, fairly stated, no side-taking); prompt-only, 8-key shape unchanged. Note: briefs cache per headline, so this affects new briefs.
touches: services/brief_generator.py
breaking: no   affects: none

## 2026-06-19 — input-limits — <hash>
Added max_length caps (20,000) to answer_text, conversational message content, and final_recommendation via net-new services/limits.py; mins unchanged; verified compile + behaviour (long structure posts still accepted, abuse dumps rejected).
touches: services/limits.py, routes/submit.py, routes/attempts.py, lib/limits.ts, submission-form.tsx, ConversationalSolve.tsx
breaking: no — C4 announce (request-shape constraint tightened)   affects: callers of /submit and /attempts/*

## 2026-06-19 — legal-refund — <hash>
Refund & Cancellation policy updated (no money-back guarantee, team@mece.in) and contrast bug fixed (text uses semantic foreground/muted tokens).
touches: app/refund/page.tsx
breaking: no   affects: none

## 2026-06-19 — feat/mobile-polish — <hash>
mobile-polish — fix pricing billing-toggle overflow on phones (full-width, stacked save%, 44px targets; desktop reverts at sm:); bottom-nav tap feedback; remove touch tap-flash
breaking: no — affects: none

## 2026-06-18 — feat/ui-batch-2 — <hash>
ui-batch-2 — mobile chat-first case session + case/attempts drawer; equal-height testimonials; profile sign-out; DraggableFab for feedback + casebook menu
breaking: no — affects: none

## 2026-06-18 — feat/engaging-loading — <hash>
engaging-loading — case prompt renders immediately (no full-screen spinner) + rotating curated quotes/facts loader (lib/loading-content + EngagingLoader) on case boot & GD-brief generation
breaking: no — affects: none

## 2026-06-18 — feat/testimonials-admin — <hash>
feat/testimonials-admin — Notion admin shell + DB-backed testimonials and team grid
touches: components/testimonials-carousel.tsx, components/team-grid.tsx, app/api/testimonials/route.ts, app/about/page.tsx, admin routes
breaking: no   affects: none
Notes: two new routes (/api/testimonials, /api/admin/testimonials/upload), new tables testimonials/team_members, storage bucket testimonials, admin restructured to routed sections.

## 2026-06-18 — fix/mobile-ui-pass — <hash>
mobile-ui-pass — hide tab bar + feedback on case session (composer no longer hidden) + safe-area pad; casebook menu FAB ? bottom-left (no feedback collision); landing Today's-case card mobile position; dark-mode rose chips
touches: components/mobile-bottom-nav.tsx, components/feedback/feedback-launcher.tsx, components/solve/ConversationalSolve.tsx, components/casebook/casebook-reader.tsx, app/page.tsx
breaking: no   affects: none

## 2026-06-18 — feat/feedback — <hash>
Global feedback launcher, panel, and admin triage queue.
touches: app/api/feedback/route.ts, components/feedback/*, app/(app)/layout.tsx, app/(app)/admin/feedback/*, lib/feedback.ts, supabase/migrations/0011_feedback.sql
breaking: no   affects: none
Notes: new route `app/api/feedback` (C4 additive), new table `feedback_reports`.
## 2026-06-18 — feat/cheatsheet — <hash>
Notion-style cheat sheet redesign with category rail.
touches: components/cheat-sheet/category-rail.tsx, components/cheat-sheet/cheat-sheet-client.tsx, app/(app)/cheat-sheet/page.tsx
breaking: no   affects: none
Notes: Client-side presentational layout shift only.

## 2026-06-14 â€” logo-swap â€” f1e00a6
feat(brand): new MECE logo across app â€” theme-aware, compact-in-nav / full-in-footer+auth. Overwrote legacy placeholders with modern mark + lockup variants.
touches: public/logo*, components/logo.tsx, components/footer.tsx, app/login/page.tsx, app/signup/page.tsx
breaking: no   affects: none
## 2026-06-14 â€” news-freshness â€” 2e4a9ee
GD briefs: /news/headlines now newest-first (last 3 days, star pinned, score tiebreak) + self-heal (auto-refetch if newest >24h old, retry once, 15-min throttle). Fetch logic extracted to services/news_pipeline.py; /cron/fetch-news delegates to it. New GitHub Actions daily 06:00 IST scheduler (fetch-news + schedule-daily + cleanup).
touches: consilio-backend/services/news_pipeline.py, consilio-backend/routes/news.py, consilio-backend/routes/cron.py, consilio/.github/workflows/daily-news.yml
breaking: no (behavioural; response shapes unchanged)   affects: News pipeline, Daily content
## 2026-06-14 â€” guesstimate-modules â€” 853905e
casebook: Guesstimates Pages 2-4 â€” Four Approaches, Ideal Flow, Pressure-Testing & Traps.
Inserted in Section B after Pain & Promise; +3 routes. P5 (cheat sheet) + P6 (worked solve) not wired.
touches: lib/casebook/content/guesstimates/{four-approaches,ideal-flow,pressure-testing}.ts, lib/casebook/tree.ts, lib/casebook/content/index.ts
breaking: no   affects: none

## 2026-06-13 â€” seo-entity-hardening â€” 9dcc745
seo-entity-hardening: entity disambiguation schema, reframed /about, detailed /methodology, homepage FAQ schema + scroll motion, mobile nav drawers, .gitattributes
touches: lib/seo.ts, components/casebook/eeat-signals.tsx, app/page.tsx, app/about/page.tsx, app/methodology/page.tsx, components/scroll-animations.tsx, app/globals.css, .gitattributes, components/landing-mobile-nav.tsx, components/app-nav.tsx
breaking: no   affects: none

## 2026-06-12 â€” industry-primers-ott â€” (pending)
industry-primers: add "20 Â· OTT" static bundle and wire up casebook registry
touches: public/primers/ott/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-12 â€” industry-primers-oil-gas â€” 817d216
industry-primers: add "19 Â· Oil & Gas" static bundle and wire up casebook registry
touches: public/primers/oil-gas/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-12 â€” industry-primers-logistics â€” d3f0ed9
industry-primers: add "18 Â· Logistics" static bundle and wire up casebook registry
touches: public/primers/logistics/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-12 â€” industry-primers-it-ites â€” 2237f73
industry-primers: add "17 Â· IT & ITeS" static bundle and wire up casebook registry
touches: public/primers/it-ites/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 â€” industry-primers-iron-steel â€” 65971b7
industry-primers: add "16 Â· Iron & Steel" static bundle and wire up casebook registry
touches: public/primers/iron-steel/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 â€” industry-primers-insurance â€” 254de4c
industry-primers: add "15 Â· Insurance" static bundle and wire up casebook registry
touches: public/primers/insurance/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 â€” industry-primers-hospitality â€” f174214
industry-primers: add "14 Â· Hospitality" static bundle and wire up casebook registry
touches: public/primers/hospitality/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 â€” industry-primers-cement â€” 39e4f21
industry-primers: add "13 Â· Cement" static bundle and wire up casebook registry
touches: public/primers/cement/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 â€” industry-primers-automobile â€” de3573e
industry-primers: add "12 Â· Automobile" static bundle and wire up casebook registry
touches: public/primers/automobile/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 â€” industry-primers-healthcare â€” c5d70b9
industry-primers: add "11 Â· Healthcare" static bundle and wire up casebook registry
touches: public/primers/healthcare/index.html, lib/primers/index.ts, lib/casebook/tree.ts
breaking: no   affects: none

## 2026-06-11 â€” deck-vault-drm-and-pro-pivot â€” ce11ebf
vault: heavy canvas PDF viewer (react-pdf), sticky blur blackout, hostile keyboard screenshot blockers, forensic identity watermarking (MECE - Email - UserID).
touches: components/pdf-viewer.tsx, app/(app)/skeletons/view/[id]/page.tsx, components/skeleton-library.tsx, app/(app)/skeletons/page.tsx, app/api/skeletons/file/[deckId]/route.ts
breaking: yes â€” file proxy streams PDF to canvas, native browser downloads and right-clicks are totally disabled. Vault access now requires the 'pro' subscription_tier instead of standalone purchase.   affects: Vault, Payments

## 2026-06-09 â€” news-daily-fix â€” Vercel Cron backup for /cron/fetch-news + /cron/schedule-daily (daily brief refresh no longer depends on GitHub Actions), news fetch timeouts + "waking up" hint so GD Briefs never spins forever
breaking: no

## 2026-06-09 â€” dashboard-polish â€” real constellation locks (no attempt on locked nodes), removed decorative PRO ghost strip, Recent card real-only (no mock), proof rail shows first names, constellation contrast boost
breaking: no

## 2026-06-09 â€” onboarding-503-fix â€” move onboarding gate from (app) layout (fragile headers() path read -> redirect loop -> 503) into middleware (reliable pathname)
breaking: no

## 2026-06-09 â€” leaderboard-rebuild â€” 3 live views (All-India / Daily / Cohort) + FOMO standing card + LinkedIn share
touches: lib/dashboard/leaderboards.ts (new), leaderboard page + client
breaking: no

## 2026-06-09 â€” dashboard-fomo-real â€” peer-proximity / proof-rail / guesstimate-card now use live data, honest empty states
breaking: no

## 2026-06-09 â€” qa-loggedin-phase1 â€” users RLS + service-role leaderboard/dashboard reads
touches: 0006_rls.sql, leaderboard, dashboard
breaking: data-access policy (announce); deploy code before SQL â€” affects: leaderboard/dashboard

## 2026-06-09 â€” qa-loggedin-phase2 â€” GD-brief/headlines Lite+ gate + results IDOR filter
touches: routes/news.py, lib/api.ts, gd-briefs pages, results/[id]
breaking: news GET now needs Lite JWT (frontend updated)

## 2026-06-09 â€” qa-loggedin-phase3 â€” onboarding x-pathname-on-request, free clarifications=0, college-email throttle+domain, lite bookmarks=0, API_URL guard
breaking: no

## 2026-06-09 â€” qa-loggedin-phase4 â€” block inactive cases, useEffect page-reset, eslintrc
breaking: no

## 2026-06-09 â€” industry-primers â€” FMCG primer added (No. 23)
Third Industry Primer "FMCG" (No. 23) shipped as a fact-checked static page at /primers/fmcg,
registered in lib/primers/index.ts. Data verified & restated (FY2030 size $1,288Bâ†’~$643B;
CAGR ~28%â†’~17%; internet users 780Mâ†’~1.0Bn; GDP ~3.5%â†’~3%; urban share 65%â†’~62%; "81% domestic /
1.3% global" flagged as unverified). Additive â€” registry entry + static asset only; no
route/nav/contract change.
touches: public/primers/fmcg/**, lib/primers/index.ts
breaking: no   affects: none

## 2026-06-09 â€” industry-primers â€” Cement primer added (No. 22)
Second Industry Primer "Cement" (No. 22) shipped as a fact-checked static page at
/primers/cement, registered in lib/primers/index.ts. Data verified & restated
(industry size $143Bâ†’~$27B; GST 28%â†’18% now law (Sep 2025); top-5 share ~60%; global
capacity >8%; India Cements/Kesoram now under UltraTech; "Top-4 75%"â†’Top-20 ~70% output).
Additive â€” registry entry + static asset only; no route/nav/contract change.
touches: public/primers/cement/**, lib/primers/index.ts
breaking: no   affects: none

## 2026-06-08 â€” industry-primers â€” (in tree, build-gate pending)
New Learn â†’ Industry Primers section; first primer "Aviation" (No. 21) shipped as a
self-contained, fact-checked static page embedded via /primers/aviation. Data verified
& restated (SAF 1% by 2027/intl-first, Indian-carrier intl share ~45%, order book ~1,600,
Air India Group ~27% post-Vistara merger, market ~$26B/~12% CAGR, Bharatiya Vayuyan
Adhiniyam 2024). New routes + static asset only; no contract change.
touches: public/primers/**, app/(app)/learn/industry-primers/**, lib/primers/*
breaking: no   affects: none

## 2026-06-08 â€” dashboard-mobile-darkmode + onboarding-profile â€” 8cbdb69
Dashboard: mobile-responsive (useIsMobile hook + stacked grids in
dashboard-client/hero/constellation/command-panel/consistency-card/news-card),
dark-mode parity (--card-hex / --map-center / --hero-grad-*, --cluster-*
palette flipped per theme), cardinal red restored to #C8102E in both modes
(.dark --red / --primary / --cluster-prof previously drifted to salmon).
New feature: user onboarding (single-scroll form: name, college combobox
with 'Other', batch year, placement focus, optional analytics fields) +
forced redirect via (app)/layout, profile page rebuild with avatar upload
(Supabase Storage), college email verification flow (Supabase
admin.generateLink + SHA-256 token, 24h expiry).
touches: hooks/use-is-mobile.tsx, components/dashboard/*,
components/dashboard-client.tsx, components/onboarding/onboarding-form.tsx,
components/profile/profile-client.tsx, app/globals.css,
app/(app)/onboarding/page.tsx, app/(app)/profile/page.tsx,
app/(app)/layout.tsx, lib/supabase/middleware.ts, lib/types.ts,
lib/types-onboarding.ts, app/api/onboarding/complete/route.ts,
app/api/college-email/{send,verify}/route.ts,
supabase/migrations/0005_user_onboarding.sql
breaking: yes â€” C6 users schema (new). Additive only; existing readers unaffected.
affects: Dashboard, Profile, future GD-cohort feature

## 2026-06-08 â€” dashboard-wire â€” 3304ecf
Constellation wired to live data (per-node mastery, real recent attempts,
data-driven dots + halo, cluster routing, backfilled cases, 11 seed cases for
empty clusters). Hero/News/Guesstimate buttons functional. Career ladder
extended to 10 exponential tiers with auto-scroll + breathing halo. Loading
skeletons + cached auth = ~200â€“400ms shaved per nav. Bossâ†’Today's focus.
touches: lib/dashboard/*, lib/career-tiers.ts, lib/supabase/auth-cached.ts,
app/(app)/dashboard/*, app/(app)/layout.tsx, app/(app)/gd-briefs/[id]/page.tsx,
app/(app)/loading.tsx, app/api/news/[briefId]/to-case/route.ts,
components/dashboard/*, components/dashboard-client.tsx,
components/practice-hub.tsx, app/globals.css,
supabase/migrations/0004_dashboard_skills.sql,
supabase/seed-skill-graph.sql, supabase/seed-cases-constellation.sql
breaking: yes â€” C1 cases (v3 â†’ v4)   affects: Dashboard, Guesstimate, Daily-content, Casebook

## 2026-06-07 â€” dashboard-focusplus â€” 7b8a2a7
Focus+ redesign ported to live data: FocusHero, SkillConstellation (9 real nodes, oval-fixed HTML halo), recomposed dashboard-client; social proof dropped; Â§G3 guesstimate exclusion preserved. Route count 143->142 (main branch baseline was 142, no routes added or dropped).
touches: components/dashboard/*, dashboard-client.tsx, dashboard/page.tsx, globals.css
breaking: no   affects: none

## 2026-06-06 â€” gd-cheatsheet â€” d61c7c0
Pro-only Cheat Sheet: "Add to cheat sheet" on GD-brief data points captures them to new per-user `cheat_sheets`/`cheat_sheet_items` (RLS, pro-gated at UI + /api/cheatsheet + INSERT policy); new /cheat-sheet page groups saved points by topic with per-item notes/delete. Frontend + Supabase only; wires the previously-unused TierGate.
touches: supabase/migrations/0003_cheat_sheet.sql, lib/types.ts, lib/cheatsheet.ts, app/api/cheatsheet/{route,[itemId]/route}.ts, app/(app)/cheat-sheet/page.tsx, components/cheat-sheet/*, app/(app)/gd-briefs/[id]/page.tsx, components/app-nav.tsx
breaking: no   affects: none

## 2026-06-06 â€” reconciliation-audit â€” Phase 1 verification
Verified file presence and wiring for Guesstimate end-to-end (G1-G4), AI evaluation v2, Dashboard tiles, and Casebook misc frameworks. All confirmed present and flipped to BUILT.
touches: .brain/LEDGER.md
breaking: no   affects: none

## 2026-06-06 â€” reconciliation-audit â€” doc-vs-code sweep
Verified file presence + wiring against the latest upload. Flipped a whole cluster from "pending/not-built" to **BUILT & LIVE**: Â§9.31 daily-content+admin+keep-alive, Â§9.32 news pipeline, Â§9.33 dashboard daily tiles, Â§9.28 interviewer+conversational solve, plus structured items â€” payments audit trail (Razorpay verify+webhook write `payments`), voice input (Whisper/transcribe), image input (vision/extract-text), rate limiting (attempts.py), analytics (@vercel/analytics), privacy+terms pages, and badge_awarder (wired, graceful â€” not a crash). Still genuinely open: `vercel.json` (region pin), refund-policy page, `users.streak_count` column write. See PROJECT_BRAIN_MERGED.md "2026-06-06 FULL RECONCILIATION AUDIT".
touches: (status reconciliation only â€” no code change)
breaking: no   affects: none

## 2026-06-06 â€” casebook-guesstimates â€” (in tree, build-gate pending)
Guesstimates promoted from last section to **B** (`defaultOpen`); new 239-line "The Pain & The Promise" overview page (names the 30/25/20/15/10 rubric); 9 dead placeholder nav nodes removed; sections re-lettered C..F. See brain Â§9.38.
touches: lib/casebook/tree.ts, lib/casebook/content/index.ts, lib/casebook/content/guesstimates/pain-and-promise.ts
breaking: no â€” Casebook-Page-schema (C3) consumer only; route count changes on build (+1 real, âˆ’9 dead)   affects: Casebook

## 2026-06-06 â€” case-solve-unified â€” (in tree, build-gate pending)
`ConversationalSolve` now takes `initialCase` (server-passed, no re-fetch) / `historyPanel` / `lockedOverlay`; lock renders as an overlay (not a separate page); history+rating render inside the workspace. See brain Â§9.39.
touches: app/(app)/cases/[id]/page.tsx, components/solve/ConversationalSolve.tsx
breaking: no â€” reads existing cases shape (C1 reader only)   affects: none

## 2026-06-06 â€” nav+history-persistence â€” (in tree, build-gate pending)
Casebook nav-tree and attempt-history expand/collapse state now persist to `sessionStorage` with an `isMounted` hydration guard; nav defaults open only for "Getting Started"; attempt accordion defaults collapsed. See brain Â§9.40â€“9.41.
touches: components/casebook/nav-tree.tsx, components/case-attempt-history.tsx
breaking: no   affects: none

## 2026-06-06 â€” practice-hub-polish â€” (in tree, build-gate pending)
"Attempted" badge restyled to a success pill and relocated next to the difficulty chip; long attempt answers scroll-capped at 35vh. See brain Â§9.41.
touches: components/practice-hub.tsx, components/case-attempt-history.tsx
breaking: no   affects: none

## 2026-06-02 â€” backstop-fix â€” **BUILT & LIVE** (verified in code 2026-06-06)
Rewrote guesstimate arithmetic backstop: base/literal steps use stated value (never 0), only derived steps with all-finite inputs are flagged, `percent_of` handles %/ref/commas without crashing; if nothing verifiable, defer to LLM arithmetic. Fixed live false "all-zero" (e-rickshaw scored 71â†’77). `guesstimate_backstop.py` carries the "2026-06-02 hardening" docstring.
touches: services/guesstimate_backstop.py, prompts/guesstimate_scoring_prompt.py
breaking: no â€” return keys unchanged (total/dimensions/arithmeticOverridden/rawTotal + backstop.findings/summary/notChecked/totalCapFactor)   affects: none

## 2026-06-02 â€” guesstimate-G4 â€” **BUILT & LIVE** (verified in code 2026-06-06)
69 static guesstimates are attemptable `cases` rows; `code` column + FULL `cases_code_unique` index folded into `0001_baseline_schema.sql`; practice-hub Guesstimates tab is DB-driven (`cases` where `type='guesstimate'`); answer hidden pre-attempt. The standalone `add-code-column.sql`/`seed-guesstimates.sql` files were merged into baseline and no longer exist separately. **Guesstimate answerable end-to-end (G1â€“G4): DONE.**
touches: components/practice-hub.tsx, lib/types.ts, supabase/migrations/0001_baseline_schema.sql
breaking: yes â€” DB:`cases` gained `code text` (additive, now in baseline)   affects: Daily-content, Dashboard (no read change)

## 2026-06-02 â€” daily-content/admin/keep-alive â€” Â§9.31
Daily case/guesstimate generator rewritten to the REAL `cases` schema (was inserting nonexistent columns â†’ 500s); admin 401/500 fixed; self-contained GitHub-Actions keep-alive + cold-start pre-warm.
touches: services/content_generator.py, routes/daily.py, routes/cron.py, app/(app)/admin/*, .github/workflows/*
breaking: no   affects: none

## 2026-06-02 â€” dashboard â€” Â§9.23â€“9.26
Dashboard rebuilt: Readiness Score v1, radarâ†’bullet charts, next-action engine, monetization surface; /home merged into /dashboard; entry choreography + ambient motion (reduced-motion gated); Supabase getSessionâ†’getUser auth fix. 143 static pages.
touches: components/dashboard/*, lib/readiness.ts, lib/next-action.ts, app/(app)/dashboard/page.tsx
breaking: no   affects: none

## 2026-06-01 â€” casebook â€” Â§9.18â€“9.21
Casebook Core-Frameworks 9/9 + Toolkit 9/9 complete (10 cards across 9 nav slots); Miscellaneous Frameworks node authored as M&A-style hybrid.
touches: lib/casebook/content/**, components/casebook/*
breaking: yes (historical) â€” Casebook-Page-schema: NO `subtitleEmphasize`; `kind:"toolkit"` added   affects: any future Casebook page














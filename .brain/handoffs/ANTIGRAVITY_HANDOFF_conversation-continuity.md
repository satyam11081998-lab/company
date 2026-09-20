# ANTIGRAVITY HANDOFF — conversation continuity + solution presentation

**STATUS: BUILT + ADVERSARIALLY REVIEWED, NOT COMMITTED.** (v2, 2026-09-20 evening: adds the Pro paywall on case figures, and the fixes from an independent adversarial pass — see §7. Migration 0069 is NEW and must be run alongside 0068.)

**ORIGINAL STATUS:** Frontend `tsc --noEmit` EXIT 0; backend `py_compile`
clean on every touched file; `python -m tests.test_visuals_sanitizer` = 25/25 PASS;
migration `0068` parses clean (pglast, including the plpgsql body).
**Migration 0068 has NOT been run.** Everything degrades safely until it is (see Gates).

touches (frontend): `supabase/migrations/0068_conversation_continuity.sql` (NEW),
`app/api/guest/claim/route.ts` (NEW), `components/guest/guest-claim-bridge.tsx` (NEW),
`app/(app)/history/page.tsx` + `app/(app)/history/[attemptId]/page.tsx` (NEW),
`components/results/results-deck.tsx` (NEW), `components/results/charts/primitives.tsx` (NEW),
`components/results/charts/case-visuals.tsx` (NEW), `lib/results/visuals.ts` (NEW),
`lib/dashboard/case-insights.ts` (NEW), `components/dashboard/solution-study.tsx` (NEW),
`components/dashboard/solution-study-section.tsx` (NEW);
modified `app/layout.tsx`, `app/globals.css`, `tailwind.config.js`, `lib/constants.ts`,
`components/app-nav.tsx`, `components/guest/guest-save-wall.tsx`,
`components/solve/ConversationalSolve.tsx`, `components/admin/journey-timeline.tsx`,
`app/api/admin/journey-detail/route.ts`, `app/(app)/results/[id]/page.tsx`,
`app/(app)/dashboard/page.tsx`.

touches (backend): `routes/attempts.py`, `routes/submit.py`, `services/ai_scorer.py`,
`prompts/scoring_prompt.py`, `prompts/interview_prompts.py`,
`prompts/guesstimate_scoring_prompt.py`, `tests/test_session_signals.py`,
`tests/test_interviewer_mode.py`; NEW `services/case_figures.py`,
`tests/_sdk_stubs.py`, `tests/test_visuals_sanitizer.py`.
**No file owned by the GitHub interviewer rework is modified.**

breaking: **yes — one surface.** `0068 §5` enables RLS on `public.submissions`, which
previously had none. Verified against every caller first (all frontend reads are already
`.eq('user_id', <caller>)`; aggregates and writes use the service role; there are no
client-side writes). It is also a SECURITY FIX — without it any authenticated user could
read every user's `submissions`, `answer_text` included, straight from PostgREST.
Rollback line is in the migration. affects: results, profile, onboarding, dashboard.

---

## 1 · Why conversations went missing (three separate bugs)

1. **`submissions` had no link to its conversation.** `submissions` (0001) predates
   `attempts` (0002). The forward link `attempts.submission_id` existed; nothing pointed
   back. Every consumer starting from a submission had to guess.
2. **The admin viewer guessed — and the guess was wrong three ways.** It resolved
   "most recent attempt for this case, optionally by this user, limit 1", so:
   a re-attempt always showed the LATER transcript against the EARLIER timeline row;
   a row with no `user_id` dropped the user filter and could render **a stranger's
   conversation** (a privacy leak, not just a bug); and a miss said "Attempt not found",
   which reads as "the conversation is gone" when the truth is almost always "this
   visitor opened the case but never sent a message".
3. **A guest who logged in to an account they already had lost everything.** Conversion
   via `updateUser`/`linkIdentity` keeps the same auth row and was always safe. Signing
   IN to an existing account produces a different uuid, so the work stayed parented to
   the throwaway guest row — invisible, and collected by the 30-day guest cleanup. The
   old code did this deliberately (`guest-save-wall.tsx` told users "today's practice
   won't carry over") because re-parenting corrupts `case_attempts` first-attempt
   semantics.

### Fixes
- `submissions.attempt_id` + index, **backfilled** from `attempts.submission_id` — this
  recovers the conversation for every historical submission; it was never lost, only
  unreachable. Written at submit time by `routes/attempts.py`, with a fallback insert so
  a pre-0068 DB cannot fail a real score.
- `claim_guest_data(guest, target)` re-parents attempts, messages (by FK), submissions,
  `case_attempts`, `page_events`, `user_actions`, `user_sessions` and the skill profile,
  then **renumbers `case_attempts` chronologically for only the affected cases** — which
  is what makes the merge safe and removes the original objection. `guest_claims` audits
  every move. The guest's own rows are left in place for the normal cleanup, never
  deleted inline (a racing request may still hold that JWT).
- `POST /api/guest/claim` requires possession of **both** sessions: the target via cookie
  (and it must not itself be anonymous), the guest via an access token **verified against
  Supabase**, not decoded. Without that, the endpoint would let any logged-in user vacuum
  up any guest's work by uuid. `claim_guest_data` is revoked from anon/authenticated.
- `GuestClaimBridge` (root layout) watches auth state: snapshots the guest token while
  anonymous, claims the moment a different non-anonymous user appears. One component
  because there are four routes into a session and two of them are full-page redirects.
- `journey-detail?type=case` now resolves `attempt_id` → `submission_id` → (case+user),
  **never across users**, and reports `resolved_by` / `sibling_attempts` / `claimed_from`
  so a guessed match is visible in the admin UI instead of silent. `start_case` and
  `send_message` now carry `attempt_id`.

## 2 · Per-user history (NEW)
`attempt_history` — a `security_invoker` view, so the existing owner-read RLS does the
ownership check rather than a hand-written filter. `/history` lists every conversation;
`/history/[attemptId]` renders the transcript. Linked from the Practice nav group.

## 3 · Solution view: deck, not scroll
`/results/[id]` was ~10 stacked cards in the scorer's output order. It is now a panelled
deck (`results-deck.tsx`) — verdict → scorecard → where the marks went → case figures →
your line tightened → a stronger line → the other angle → your answer — with a tablist
rail and arrow-key nav. Panels are conditional, so a thin submission has fewer steps
rather than empty sections.

**Charts.** `--viz-*` tokens in `globals.css`, light AND dark, validated with the palette
validator (lightness band, chroma floor, CVD separation, normal-vision floor, contrast —
all PASS both modes). These are deliberately separate from `--chart-*`, which fails as a
categorical chart palette: `--chart-1` navy is L 0.235, `--chart-5` reads gray at C 0.018,
`--chart-2` vs `--chart-3` sit at ΔE 6.4 under deuteranopia, and **no `--chart-*` token was
ever redefined for dark mode**, so every chart using them paints near-black on near-black.

`ScoreRadar` / `PointsBridge` / `DimensionBars` draw from data EVERY existing submission
already has — no backend change needed for them to work on historical rows. The bridge
converts guesstimate 0..100 dimensions through the published weights so "this gap cost you
8 marks" is literally true and the waterfall lands on the real score.

## 4 · Case-specific figures — a typed contract, not chart code
`visuals`: six shapes (`quadrant`, `waterfall`, `bar`, `line`, `funnel`, `tree`). The
scorer emits **data**; the app owns every pixel. Sanitised on BOTH sides and neither
assumes the other did it: `sanitize_visuals` (backend, 25 tests) and `parseVisuals`
(frontend). Malformed figures are dropped, never repaired, never raised on. Prompts in all
three scoring paths instruct `[]` when the case has no figures — **a fabricated chart is
worse than no chart**, because it looks authoritative and candidates revise from it.

## 5 · Dashboard — two permissions, kept separate
"Study a solution": cohort stats (attempts / average / best / your best), the case figures,
and the attempt gate. The two permissions are deliberately NOT the same:
- **May they look?** `SHOW_VISUALS_BEFORE_ATTEMPT` in `lib/dashboard/case-insights.ts`.
  Default **false** — the figures give the case away, so they unlock once the user has
  attempted it (or on pro). One constant, so the product call flips in one line.
- **May they attempt?** `lib/access.ts`, mirroring `services/access_guard.py`. UX only;
  the backend submit gate remains the boundary.

---

## 6 · ⚠ FOUND IN THE PULLED PIPELINE — needs an owner decision, NOT fixed here

`origin/main` `1400467` (the chatbot→pipeline rework, pulled this session over `e06ed4b`)
regresses the mode selector that `ANTIGRAVITY_HANDOFF_interviewer-behavior.md` recorded at
**50/50 mapping and 200/200 generalization**. Current state on `main`:

- `tests.test_interviewer_mode` → **24 of 50 mismatches**
- `tests.test_session_signals` → **5 failures**

Root cause is structural, not threshold tuning. `select_mode()` delegates entirely to
`evaluate_intervention_gate()`, which **can only ever return 15 of the 21 declared modes**.
Unreachable: **`ACK_ADVANCE`, `SANITY_CHECK`, `CHALLENGE_CLAIM`, `RELEASE`,
`STRUCTURAL_HINT`, `TARGETED_PROBE`**. **`HOLD_SPACE` no longer exists anywhere.**
That accounts for the mismatches exactly (12 ACK_ADVANCE + 4 HOLD_SPACE + 2 SANITY_CHECK +
2 CHALLENGE_CLAIM + 1 RELEASE unreachable/removed, + 3 REPAIR threshold).

Behaviourally that means the interviewer currently **cannot** acknowledge a good answer and
move on, **cannot** challenge a confidently wrong claim, and **cannot** cue a sanity check
on a material unit error — it falls back to `LISTENING_BEAT` / `HAND_BACK` / `RETHINK_CUE`.

Left alone on purpose: it is a deliberate rework and only the owner can say which of those
moves the pipeline is meant to retire vs restore. The prior implementations are preserved
at `wip/local-interviewer-iterations-2026-09-20` (`246ba11`) and in
`D:\dev\mece\_archive\interview-engine-BEFORE-pipeline-2026-09-20\`.

**THE FIVE GITHUB FILES ARE UNTOUCHED.** `services/interview_engine.py`,
`interviewer_decision.py`, `interviewer_mode.py`, `learning_model.py` and
`session_signals.py` are byte-identical to `origin/main` @ `1400467` — verified with
`git diff --stat origin/main -- <the five>` returning empty. They are maintained directly
on GitHub, so this repo does not edit them; an earlier pass in this session DID apply a
lazy import to `interviewer_decision.py` and it has been reverted with
`git checkout origin/main -- services/interviewer_decision.py`.

**The import problem was fixed on the test side instead.** The rework added
`from services.ai_providers import openai_client` at module scope, and `ai_providers`
does `from openai import OpenAI` at import time — so the whole deterministic layer became
unimportable without the SDK, and `tests/test_session_signals.py` /
`tests/test_interviewer_mode.py` died at the import rather than at an assertion, despite
both being documented to run "on the standard library alone (no OpenAI, no network)".
New `tests/_sdk_stubs.py` installs a minimal stand-in for `openai` / `supabase` ONLY when
the real package is absent, so on CI or the server the real path is exercised unchanged.
The suites import and run again; no production code and no GitHub file was touched.

---

## Phased build steps + gates

1. **DB.** Run `supabase/migrations/0068_conversation_continuity.sql`.
   Gate: idempotent — run it twice, second run is a no-op.
   Gate: `select count(*) from submissions where attempt_id is not null;` > 0 (backfill).
   Gate: `select * from attempt_history limit 1;` as a normal user returns only own rows.
2. **Backend.** Deploy `routes/attempts.py` + `services/ai_scorer.py` + the three prompts.
   Gate: `python -m py_compile` on each; `python -m tests.test_visuals_sanitizer` = ALL PASS.
   Gate: submit one case — `submissions.attempt_id` is populated.
3. **Frontend.** Gate: `npx tsc --noEmit` EXIT 0 (verified). Gate: `npm run build`.
4. **Manual QA (the reason this feature exists):**
   a. Incognito → solve a case as a guest → log in to an EXISTING account →
      the attempt appears under `/history` and a toast confirms the move.
   b. Admin → Journeys → "View Conversation" on that session shows the transcript with a
      "solved as a guest, later claimed" chip.
   c. Re-attempt a case → the older timeline row shows ITS transcript, not the newer one.
   d. `/results/[id]` on an OLD submission (no `visuals`) renders the deck with the figures
      panel absent and nothing broken.
5. **Not done:** `npm run build` has not been run on the device, and 0068 has not been run.


---

# 7 · Pro paywall + adversarial review (v2)

An independent reviewer went over the whole change set. It found the paywall
**not actually enforced** and several data-loss paths in the claim. All of the
below is FIXED in this working tree unless marked otherwise.

## 7.1 The paywall was decorative — FIXED by moving the data

`lib/tier.ts` gained `TIER_LIMITS.*.caseFigures` + `canSeeCaseFigures()`, and
`app/(app)/results/[id]/page.tsx` withheld the figures correctly. That was
still worthless, because the figures were stored in `submissions.feedback_json`
— a row the user owns — and **four** routes handed them over anyway:

| # | Route | How |
|---|---|---|
| A1 | `/dashboard` | `feedback_json` selected and passed verbatim into `DashboardClient` (a client component) → RSC payload |
| A2 | `/cases/[id]` | `submissions(score, feedback_json, …)` embed → `CaseAttemptHistory` (client) |
| A3 | `/profile` | `.select('*')` → `ProfileClient` (client) |
| A4 | PostgREST | `submissions_select_own` (0006) + the browser's own JWT: `GET /rest/v1/submissions?select=feedback_json&user_id=eq.<me>` |

A4 cannot be closed by any UI change — RLS is row-level and `feedback_json`
comes with the row.

**Fix — migration 0069 + `services/case_figures.py` + `lib/dashboard/case-figures.ts`.**
The figures move OUT of `feedback_json` into `public.case_figures`, one row per
CASE, **RLS enabled with no policy** — service role only, so there is no grant
to forget and no policy to get subtly wrong. Both submit paths
(`routes/attempts.py` AND the legacy `routes/submit.py`, which was missed on
the first pass) now go through `pop_figures()` / `bank_figures()`, so nothing
can put them back. Reads go through one server helper that takes the
entitlement as an argument and throws if imported client-side.

**No backfill needed:** the scorer only began emitting `visuals` in this same
change set and nothing is deployed, so no stored row contains them. After a
release this move would have needed a data migration.

## 7.2 Claim data loss — FIXED

- **Points** (`0068 §4g`): the backend awards points to the guest's own `users`
  row with no guest check, and the claim did not move them — so a claimed 82/100
  showed in history while rank and leaderboard never moved, and the points were
  destroyed at day 30. Now transferred (with the 0045-§2b `request.jwt.claims`
  override that `guard_user_privileged_cols` requires) and zeroed on the guest
  so a replay cannot double-credit.
- **Badges** (`0068 §4c2`): not re-parented, so guest badges were destroyed by
  the 30-day cleanup. Worse, `user_badges` carries `unique (user_id, badge_id)`
  (0001 L110), so a naive re-parent would have **aborted the whole claim** the
  first time a guest earned a badge the target already held. Duplicates are
  dropped first, then the rest move.
- **The renumber was replaced with APPEND** (`0068 §4c`). Chronological
  re-ranking rewrote rows whose points and badges were already banked, and
  `is_first_attempt` is read by the free-tier quota (`lib/access.ts`) — so a
  claim could silently REFUND a consumed lifetime extra. Claimed rows now
  append after whatever the target had; the target's own rows are never
  rewritten.
- **Daily leaderboard** (`0068 §4c`): two `counted_for_daily` rows for the same
  `daily_date` put the user on today's leaderboard TWICE with two scores
  (`routes/daily.py` emits one entry per row). Claimed duplicates are demoted;
  the target's own row always wins.

## 7.3 Shared-device claim — FIXED

`guest-claim-bridge.tsx` kept the guest token in `localStorage` under a fixed
key for 24h and auto-claimed for any non-anonymous user that appeared. On a
college lab or hostel PC — the normal case for this audience — person B signing
in at 14:00 silently absorbed person A's 09:00 practice: cross-user disclosure
for A, irreversible loss for A, invisible server-side.

Now a `sessionStorage` same-tab marker gates it: **same tab claims silently,
anything else ASKS** (a toast with "Add it" / "Not mine"). The snapshot is also
cleared on `SIGNED_OUT`, and claim failures are surfaced instead of swallowed —
the save wall promises the work moves across, so a silent failure was a lie.

## 7.4 Migration defects — FIXED

- **§5's premise was false.** It claimed `submissions` had no RLS; `0006_rls.sql`
  L74-77 already enabled it with an owner-select policy. Worse, the documented
  one-line rollback (`disable row level security`) would have disabled 0006's
  protection too — **creating** the breach the comment imagined it was closing.
  Corrected, with a safe rollback (drop the policy, leave RLS on).
- **`attempt_history` used an INNER JOIN on `cases`.** With `security_invoker`
  the caller's RLS applies, and the base `cases` policy keys on `is_active` — so
  retiring a case would have deleted every user's conversation with it from
  `/history` and 404'd the detail page. Now `left join`, title coalesced.
- `page_events` / `user_actions` updates are `to_regclass`-guarded like the others.
- `notify pgrst, 'reload schema'` added to both migrations: without it the app
  reports "run migration 0068" *after* it has been run.

## 7.5 Dashboard + chart bugs — FIXED

- `attemptedByUser` was derived from a global top-600-by-score slice, so a
  **paying** user who scored low on a popular case was told "solve it first" for
  a case they had solved. Now an exact per-user query.
- The lock screen counted SCORED SUBMISSIONS to decide "are there figures?", so
  any pre-figures case advertised the Pro upsell and delivered an empty panel
  after purchase. Now asks `case_figures` directly.
- N+1 (one query per case, twice) collapsed into two bulk queries.
- The points bridge did not land on the score when the arithmetic backstop
  capped a guesstimate — it walked 100 down to 74 then drew the final bar at 60,
  a cliff with nothing explaining it. An explicit **Adjustment / Credit** bar now
  reconciles it.
- `wrapLabel` still overflowed on a single long token (the ellipsis branch only
  fires at `maxLines`); hard-cut added.
- Waterfall: an exactly-zero step rendered green and labelled `−0`.
- Line chart: an all-identical or all-negative series collapsed both axis labels
  onto one pixel / put the baseline outside the plot.
- Both sanitisers now reject booleans (`float(True) == 1.0`) and bound magnitude
  at 1e15. Tests extended: `python -m tests.test_visuals_sanitizer` = 29/29.

## 7.6 The free/Pro line, stated

**FREE keeps everything about YOUR OWN attempt** — score, radar, the marks-lost
bridge, per-dimension evidence, red flags, your line tightened, the three
approaches, `model_answer`, the case author's prose `solution`, your full
transcript and `/history`. Nothing that was free became paid.

**PRO buys the worked FIGURES** (profit bridge / 2×2 / driver tree), and only
for cases the user has already attempted. `lib/tier.ts`'s comment used to say
Pro buys "the worked answer to the CASE" — corrected, because the prose worked
answer renders free for every tier and always has. **Open product question:**
either that prose should also be Pro, or the marketing should stop implying the
answer is paid. Left as-is (free) because changing it is a takeaway.

**LITE is excluded** too — Lite buys volume, Pro buys depth, same line as Prep
Copilot and the full CV Lab.

## 7.7 NOT fixed — carried forward

- `app/(app)/results/[id]/page.tsx` queries `user_badges` by
  `trigger_submission_id` with **no `user_id` filter**. It is saved only by
  `user_badges_select_own` RLS, i.e. by accident rather than by design. Add the
  filter.
- `npm run build` has still not been run on the device (the cloud container has
  Windows binaries in `node_modules` and no npm network). `tsc --noEmit` is EXIT 0.

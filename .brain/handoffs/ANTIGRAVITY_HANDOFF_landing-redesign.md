# ANTIGRAVITY_HANDOFF — landing-redesign + de-geo (owner spec, 2026-08-25, rev 2)

Three parts, increasing blast radius. **A (de-geo)** is safe, do-now. **B (landing
hero = interview sim)** is presentation-only and stays static — ship it without
touching the backend. **C** is the set of PRODUCT changes the sim *promises*
(scoring the candidate's questions, guided-vs-free compare, a per-case board);
those touch the scorer / a CONTRACTS surface, so they are **proposed here, not to
be built without the owner's sign-off.** Companion: the clickable prototype v2.

```
touches:  A → app/page.tsx, lib/seo.ts, app/layout.tsx, app/llms.txt/route.ts,
              app/methodology/page.tsx, app/about/page.tsx, app/signup/page.tsx,
              app/opengraph-image.tsx, components/footer.tsx
          B → app/page.tsx + NEW components/landing/interview-sim.tsx ('use client')
          C → PROPOSAL ONLY — backend scorer, CONTRACTS (rubric/attempts), leaderboard
breaking: A + B → none (copy + presentation). C → may bump a rubric/scoring contract; STOP and ask.
affects:  Landing, SEO/AEO. C also affects Scoring, Leaderboard.
```

---

## Part A — the de-geo (surgical, copy-only) — UNCHANGED, do first

Owner's rule: drop the word **"Indian"** (and geo qualifiers "across India" /
"nationwide") from **audience-descriptor / positioning** lines only. **Keep "MBA"
and "PGDM".** Touch **nothing** in casebook / cases / guesstimates / learn modules
/ India-set scenarios — those are practice material, not positioning.

### A1 · HIGHEST PRIORITY — what AI & search quote about the brand
- `lib/seo.ts` `SITE_DESC` (~L14): `...MBA & PGDM placement-interview prep for India. Free to start.`
  → delete ` for India`. *(Feeds meta description + OpenGraph + Twitter + llms.txt — highest-leverage string on the site.)*
- `lib/seo.ts` SoftwareApplication JSON-LD (~L173): `...platform for Indian students.` → `...platform for MBA & PGDM students.`
- `lib/seo.ts` JSON-LD (~L320): `audienceType: 'MBA and PGDM students in India'` → `'MBA and PGDM students'`; (~L317) `inLanguage: 'en-IN'` → `'en'`.
- `app/llms.txt/route.ts` (~L21): `...platform for Indian MBA/PGDM students.` → drop `Indian`.
- `app/layout.tsx`: keyword `'consulting interview prep India'` → `'consulting interview prep'`; `openGraph.locale: 'en_IN'` → `'en_US'`.

### A2 · Visible page copy
- `app/page.tsx` FAQ L28 `for Indian students` → `for MBA & PGDM students`; L33 `helps Indian MBA and PGDM students` → drop `Indian`; L38 `Indian MBA and PGDM students preparing` → drop `Indian`; hero L130 `for Indian MBA & PGDM students` → drop `Indian`; L131 `aspirants nationwide` → `aspirants`; L456 `preparing across India` → `preparing right now`; FAQ intro L566 `for Indian MBA & PGDM students` → drop `Indian`.
- `components/footer.tsx` L18 `for Indian MBA students` → `for MBA & PGDM students`.
- `app/opengraph-image.tsx` L49 `for Indian MBA students` → `for MBA & PGDM students`.
- `app/methodology/page.tsx` L14/L20/L45/L193: drop `across India`.
- `app/about/page.tsx` L19/L41/L56/L94/L141/L180: drop `Indian` / `across India`; keep story + MBA/PGDM.
- `app/signup/page.tsx` L9 `MBA aspirants across India` → `MBA aspirants`.

### A3 · DO NOT TOUCH
`components/hero-interview-demo.tsx` L20, `components/landing-vignettes.tsx` L76,
`app/page.tsx` sample-case titles L185/L382, all `lib/casebook/**`.

---

## Part B — landing hero = the interview sim (SAFE, static, presentation-only)

**Goal:** kill the bounce by making the hero the product performing. See prototype
v2 for the exact target: a client-island card that walks a stranger through a real
4-step case (or guesstimate, via a toggle) and scores it — a **front-end
simulation**, no backend call. It reuses none of the real scorer; it just *looks
and feels* like the real thing so a cold visitor has something to do in screen one.

### B0 · Header Log in / Sign up
The nav must show explicit **Log in** + **Sign up** affordances (owner request).
The existing `<AuthCTA variant="nav" />` already renders these for a logged-out
visitor and switches to the account state when authed — keep using it; just make
sure both actions read clearly (a ghost "Log in" + a primary "Sign up"). The
prototype shows the target treatment.

### B1 · New hero copy (replaces the current hero block in `app/page.tsx`)
- Eyebrow: `Live interview · scored on the real rubric`
- H1: `Sit one real case. See if you'd actually get the offer.`
- Sub: `Peers go easy on you. This won't. Take today's case the way an interviewer runs it — clarify, structure, solve, recommend — and get scored on the six things they actually weigh. Right here, no sign-up.`

### B2 · `components/landing/interview-sim.tsx` — BUILT & IN THE TREE
A ready, drop-in client component is already committed at
`components/landing/interview-sim.tsx` (type-checks clean under strict +
noUnusedLocals; uses `ui-card` / `btn-primary` / `tag` / `text-muted-foreground`
etc., lucide icons, a `useReducer` state machine). It is **static-safe**: no
fetch, no session mint, no `useSearchParams`, scoring is a front-end simulation.
Just import and render it in the hero:

```tsx
import InterviewSim from '@/components/landing/interview-sim';
// …in the hero right column, replacing <HeroInterviewDemo/>:
<InterviewSim />
// optional: mirror the live daily case (keep it static — build the prop from the
// already-fetched `daily` object, do NOT add a fetch):
// <InterviewSim today={simCaseFromDaily(daily)} signupHref={signupHref} loginHref={loginHref} />
```

Props: `today?: SimCase` (override the baked-in sample), `signupHref='/signup'`,
`loginHref='/login'` (pass AuthCTA's pathname-preserving hrefs if you want the
`?next=` behaviour). The component already renders a Log in / Sign up footer and
CTA links. **Verify it against the real Tailwind build** — it relies on opacity
modifiers (`bg-muted/50`, `bg-primary/5`) and `emerald`/`amber` palette classes,
all of which your current `app/page.tsx` and config already use.

It reproduces the prototype's state machine:
- **Toggle** Case / Guesstimate at the top of the card.
- **4 steps**, each with **5 options**, a **"write my own"** textarea, and on the
  first (Clarify / Assumptions) step **multi-select up to 2 + "ask your own question"**.
- Step progress bar; interviewer "reply" nugget after the clarify step.
- **Score reveal:** the 6-dimension rubric bars + composite count-up, a separate
  **"interview craft"** read on the questions asked, one strength + one fix line,
  and an honest **result-slip** (guest sees their score; **rank & streak show
  "unlocks on save"**, never a fabricated cohort number).
- **Round 2** button → free-form textarea → a second score, shown **side-by-side**
  with the guided score.
- CTAs: "Save my score & claim my rank" → the real signup/onboarding; "Round 2 real"
  → in production this should open the **actual solve page** for today's case (guest
  flow), not the simulated textarea. The simulated round-2 in the prototype is only
  to demo the compare on the landing page.

### B3 · Static-safety (hard gate)
- **`/` MUST stay `○ (Static)`.** The island is pure client state + hardcoded/sample
  case content, OR today's case passed as a prop from the existing `daily` object
  (already fetched with the `'static'` client). **No new server fetch, no `cookies()`
  in this subtree.** Keep `export const revalidate = 300`.
- The scoring shown here is **simulated for the demo**. Do **not** wire it to the
  real `/score` endpoint from `/` — that would break static and leak quota to
  anonymous hits. Real scoring stays behind the solve flow.
- Respect `prefers-reduced-motion` (instant, no count-up). One-thumb mobile:
  full-width card, 44px+ targets, sticky bottom CTA.

### B4b · Scroll layer (v3 — presentation only, still static-safe)
Port the prototype's scroll engine: (1) a thin header **progress line** = overall scroll %; (2) a fixed **"path to the offer" stage rail** (desktop ≥1180px) + a stage label in the header (mobile) that advance via an IntersectionObserver on the `[data-stage]` milestone sections — order: The case → Your score → Round 2 → Your rank → The habit → The offer; (3) **reveal-on-scroll** for `[data-reveal]` blocks; (4) two one-shot scrollytelling beats — the "anatomy of a score" bars filling + count-up, and the flywheel nodes lighting sequentially; (5) board number count-ups. All pure client JS, no data. **Must honour `prefers-reduced-motion`** (reveals become instant, no sequential timing, no count-ups) and must not introduce layout shift or horizontal scroll. This is polish on top of B2/B4 — ship the sim + honest copy first; the scroll layer is additive.

### B4 · Rest of page (from prototype)
Authority section titled **"Scored the way the real interview is"** with a
monochrome **logo wall** (firm wordmarks) + the 6 rubric chips — this REPLACES the
old "How every answer is scored" mechanics framing (owner: sell the authority, not
the how). Honest result-slip + round-2 explainer. **Campus + today's-case boards**
as the "what you unlock" payoff. Use the **real mountain mark** (inline SVG, see
`public/logo-mece-*.svg`), not a flame. Keep the real testimonials.

> ⚠️ **Logo wall:** use tasteful monochrome wordmarks of firms candidates target
> ("prepare for roles at"), consistent with the existing trust strip. Keep it
> factual; don't imply partnership/endorsement.

---

## Part C — PRODUCT changes the sim implies (PROPOSAL — get sign-off first)

The v2 sim promises three things the live product may not do yet. Shipping B while
the product can't back these up makes the landing over-claim. Each is a real change
with blast radius — **do not build without the owner deciding; C1 likely touches a
CONTRACTS scoring surface, so flag it before writing.**

- **C1 · Score the candidate's clarifying questions ("interview craft").** New
  signal: evaluate the questions a candidate asks, not just the answer. Touches the
  backend scorer and probably the rubric contract (the 6-dim / 100-pt surface). If
  kept as a *separate* qualitative read (not folded into the 100), it's additive;
  if it changes the 100-pt rubric, that's BREAKING — re-read CONTRACTS and ask.
  **Until this ships, soften the landing's craft claim so it isn't promising a
  feature that doesn't exist.**
- **C2 · Guided vs free-form compare on the same daily case.** Let a user re-take
  today's case free-form and compare the two scores. The attempts model already
  stores attempts; this needs a compare view + allowing two attempt-modes on one
  case/day. Product decision, not a landing tweak.
- **C3 · Per-case ("today's case") leaderboard.** The campus leaderboard exists;
  a board scoped to a single daily case may be new. Confirm before the landing
  shows it as live.

---

## Build order
1. Part A1 → commit; verify rendered `/` `<meta name="description">` and `/llms.txt` no longer say India/Indian.
2. Part A2 → commit.
3. Part B: build `interview-sim.tsx` (simulated, static-safe) + new hero + authority/logo-wall/boards from the prototype. Keep landing claims within what the product actually does today (see C1 caveat).
4. Park Part C for an owner decision; open a separate handoff for whichever of C1–C3 is approved.

## Gates
`npx tsc --noEmit` EXIT 0 · `npm run build` EXIT 0 **and `/` prints `○ (Static)` (or ISR), never `ƒ (Dynamic)`** · phone-viewport incognito: toggle works, all 4 steps + write-own + ask-own complete one-thumb, score + round-2 reveal animate, reduced-motion instant · view-source `/` and `/llms.txt`: no "Indian"/"across India" in positioning copy · no new network call fired from `/` on load or during the sim.

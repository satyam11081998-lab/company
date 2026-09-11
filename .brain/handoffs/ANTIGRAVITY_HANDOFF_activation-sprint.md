# ANTIGRAVITY_HANDOFF — activation-sprint

**Author:** Cowork brain (growth diagnostic session, 2026-09-11)
**touches:** `lib/next-action.ts`, `components/dashboard/getting-started-checklist.tsx`, `lib/sessions.ts`
**breaking:** no — no CONTRACTS.md surface changes. Pure frontend/UX. No migration. No backend.
**affects:** Dashboard first-run (Case solve UX unchanged — same deep-links), Auth/session-lock (loosened, still fails-open)

---

## Why this sprint exists (the number that forced it)

Pulled live from Supabase on 2026-09-11:

- **146 real signups** (excl. guests, seed `@leaderboard.mece.in` rows, `demo@mece.in`); 72 in the last 30 days.
- **Only 35 (24%) ever reached a single score.** 76% sign up and never activate.
- Of the 35 who activated, **~14% have paid** — a *healthy* rate. Willingness to pay is not the problem.
- Lifetime revenue: ₹3,295 (5 payments). Weekly-active real users: 9.

**Conclusion:** the highest-leverage internal lever is activation. Because activated→paid already works at ~14%, dragging activation from 24%→50% roughly doubles revenue **with zero new traffic.** This sprint attacks the three confirmed activation leaks in the first-run path.

Root causes found by reading the code:
1. `nextAction()` prescribes a **cold 25-minute scored case** as a brand-new user's very first move.
2. `GettingStartedChecklist` puts **"skim the 7-page guide"** as step 1 — sending tired first-time visitors into a reading rabbit hole (visible in the journey logs: fresh users land on `/learn/casebook/getting-started/*` and leave).
3. `sessions.ts` **never expires old sessions**, so a genuine user who switches laptop→phone is bounced to `/session-conflict` (seen in journeys, e.g. the same user landing on `/session-conflict` twice).

---

## Change 1 — First prescribed action = 60-second guesstimate, not a 25-min case

**File:** `lib/next-action.ts` — the cold-start branch of `nextAction()`.

The fastest possible "aha" on MECE is a 60-second guesstimate that returns an instant score. Prescribe THAT for the very first move (`subsDone === 0`); keep the scored-case prescription for everyone who already has one submission.

**BEFORE:**
```ts
  // 1) cold start
  if (r.status === 'calibrating') {
    const needTypes = r.typesNeeded - r.typesDone;
    return {
      kind: 'calibrate',
      label: r.subsDone === 0 ? 'Solve your first case' : 'Finish calibrating',
      reason:
        needTypes > 0
          ? `Do ${Math.max(r.subsNeeded - r.subsDone, needTypes)} more across ${needTypes} new case type${needTypes > 1 ? 's' : ''} to unlock your readiness score.`
          : `${r.subsNeeded - r.subsDone} more case${r.subsNeeded - r.subsDone > 1 ? 's' : ''} to unlock your readiness score.`,
      cta: 'Start a case',
      href: '/practice?tab=scored',
      paywalled: false,
    };
  }
```

**AFTER:**
```ts
  // 1) cold start
  if (r.status === 'calibrating') {
    // ACTIVATION (2026-09-11): a brand-new user's FIRST move is the 60-second
    // guesstimate — instant score, fastest path to the "aha". Only 24% of real
    // signups ever reach a score; a cold 25-min scored case is the wall. Once
    // they have ANY submission we go back to prescribing scored cases below.
    if (r.subsDone === 0) {
      return {
        kind: 'calibrate',
        label: 'Try a 60-second guesstimate',
        reason:
          'One quick estimate, scored the instant you submit — the fastest way to see how MECE grades you. Your first real case is one tap after that.',
        cta: 'Start guesstimate',
        href: '/practice?tab=guesstimates',
        paywalled: false,
      };
    }
    const needTypes = r.typesNeeded - r.typesDone;
    return {
      kind: 'calibrate',
      label: 'Finish calibrating',
      reason:
        needTypes > 0
          ? `Do ${Math.max(r.subsNeeded - r.subsDone, needTypes)} more across ${needTypes} new case type${needTypes > 1 ? 's' : ''} to unlock your readiness score.`
          : `${r.subsNeeded - r.subsDone} more case${r.subsNeeded - r.subsDone > 1 ? 's' : ''} to unlock your readiness score.`,
      cta: 'Start a case',
      href: '/practice?tab=scored',
      paywalled: false,
    };
  }
```

Nothing else in the file changes. `subsDone` is already on `ReadinessResult`. No new imports.

---

## Change 2 — Reorder the Getting Started checklist: DO first, read last

**File:** `components/dashboard/getting-started-checklist.tsx` — the `steps` array + subtitle copy.

Put the 60-second guesstimate first, the scored case second, and demote "read the guide" to an optional last step. Rewrite the subtitle so the promise is speed, not homework.

**BEFORE** (the `steps` array, lines ~43–76):
```tsx
  const steps: {
    id: string;
    label: string;
    href: string;
    cta: string;
    done: boolean;
    onClick?: () => void;
  }[] = [
    {
      id: 'read',
      label: 'Skim the 7-page Getting Started guide',
      href: '/learn/casebook/getting-started/what-it-tests',
      cta: 'Read',
      done: readGuide,
      onClick: () => {
        try { localStorage.setItem(READ_KEY, '1'); } catch {}
        setReadGuide(true);
      },
    },
    {
      id: 'guess',
      label: 'Solve your first guesstimate',
      href: '/practice?tab=guesstimates',
      cta: 'Start',
      done: guesstimateSolved > 0,
    },
    {
      id: 'case',
      label: 'Solve your first scored case',
      href: '/practice?tab=scored',
      cta: 'Start',
      done: scoredSolved > 0,
    },
  ];
```

**AFTER** (guesstimate first; case second; guide last, reworded):
```tsx
  const steps: {
    id: string;
    label: string;
    href: string;
    cta: string;
    done: boolean;
    onClick?: () => void;
  }[] = [
    {
      id: 'guess',
      label: 'Get your first score — a 60-second guesstimate',
      href: '/practice?tab=guesstimates',
      cta: 'Start',
      done: guesstimateSolved > 0,
    },
    {
      id: 'case',
      label: 'Solve your first full case',
      href: '/practice?tab=scored',
      cta: 'Start',
      done: scoredSolved > 0,
    },
    {
      id: 'read',
      label: 'Optional: skim the Getting Started guide',
      href: '/learn/casebook/getting-started/what-it-tests',
      cta: 'Read',
      done: readGuide,
      onClick: () => {
        try { localStorage.setItem(READ_KEY, '1'); } catch {}
        setReadGuide(true);
      },
    },
  ];
```

**Subtitle copy** (line ~104–106):

BEFORE:
```tsx
      <p className="text-[13px] text-muted-foreground mb-4">
        Three quick steps to your first scored answer — {doneCount} of {steps.length} done.
      </p>
```
AFTER:
```tsx
      <p className="text-[13px] text-muted-foreground mb-4">
        Your first score is 60 seconds away — {doneCount} of {steps.length} done.
      </p>
```

No logic changes — `done` still derives from `guesstimateSolved` / `scoredSolved` / the localStorage read; `allDone` still hides the card. Pure reorder + copy.

---

## Change 3 — Session lock: ignore STALE other-device sessions (stop bouncing real device-switchers)

**File:** `lib/sessions.ts` — inside `touchSession()`, where `other` is computed.

The lock is well-built (fails-open, offers a takeover button), but because sessions never expire, a user who used their laptop yesterday and opens their phone today hits `/session-conflict`. Treat an other-device session that hasn't been seen within a staleness window as NOT a live conflict — this login then proceeds and claims its own row. Genuinely concurrent sharing (both seen within the window) still trips the conflict screen.

**BEFORE** (lines ~131–136):
```ts
    const live = (data as LiveSession[] | null) ?? [];
    const mine = live.find((s) => s.session_id === sessionId) ?? null;
    const other = live.find((s) => s.session_id !== sessionId) ?? null;

    // Someone else holds the account and we are not already registered.
    if (!mine && other) return { status: 'conflict', other };
```

**AFTER:**
```ts
    const live = (data as LiveSession[] | null) ?? [];
    const mine = live.find((s) => s.session_id === sessionId) ?? null;

    // ACTIVATION/UX (2026-09-11): only a RECENTLY-seen other device is a real
    // conflict. Sessions never expire on their own, so without this a user who
    // switched laptop -> phone gets bounced to /session-conflict for a device
    // they simply walked away from. `last_seen_at` is heartbeat-updated every
    // 5 min while a device is active, so a >24h-stale row means "not in use".
    const SESSION_STALE_MS = 24 * 60 * 60 * 1000;
    const other =
      live.find(
        (s) =>
          s.session_id !== sessionId &&
          Date.now() - new Date(s.last_seen_at).getTime() < SESSION_STALE_MS,
      ) ?? null;

    // Someone else is ACTIVELY holding the account and we are not registered.
    if (!mine && other) return { status: 'conflict', other };
```

`claimSession()` / `endSession()` are unchanged. Still fails-open to `untracked` on any error. The takeover button still works for genuine concurrent conflicts. Optional follow-up (not required): the takeover query could also revoke stale rows, but leaving them is harmless — they're ignored on the next check.

---

## Build gates (run on the real tree — the Cowork sandbox can't `npm run build`)

- [ ] `npx tsc --noEmit` → EXIT 0 (all three files are typed; no new types introduced).
- [ ] `npm run build` → EXIT 0.
- [ ] Manual smoke, incognito, as a brand-new account:
  - After onboarding, the dashboard's primary "Do this next" CTA reads **"Try a 60-second guesstimate"** and deep-links to `/practice?tab=guesstimates`.
  - The Getting Started checklist lists the guesstimate first, the case second, the guide last.
  - Sign in on a second browser; confirm you are NOT sent to `/session-conflict` when the first browser has been idle > 24h (to test fast, temporarily lower `SESSION_STALE_MS`), and that two genuinely-active sessions still trigger the conflict screen + takeover button.

No migration. No backend. No contract change. Deploy frontend alone.

---

## What this sprint deliberately does NOT include (next sprint)

- **Contextual paywall at first score.** `nextAction()` already computes a `paywalled` flag for re-attempts; the bigger win is a Pro nudge shown the instant a free user sees their first score (pricing view is currently ~0 — nobody is ever asked to buy at peak intent). Separate component, separate sprint.
- **Deferring onboarding.** Onboarding is currently mandatory before the dashboard (`app/(app)/onboarding/page.tsx` redirects until `onboarding_completed_at`). 14% of exits are on `/onboarding`. Making it skippable ("do this after your first case") is a plausible activation win but a bigger change — validate with the fixed analytics events first.
- **Analytics event fix.** `sign_up` / `view_pricing` / `payment` events read 0 in the admin funnel while the DB clearly shows signups and 5 payments. Fix this next so the activation lift is measurable.

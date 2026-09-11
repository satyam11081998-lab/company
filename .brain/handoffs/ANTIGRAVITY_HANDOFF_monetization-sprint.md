# ANTIGRAVITY_HANDOFF — monetization-sprint (Sprint 2)

**Author:** Cowork brain (growth diagnostic session, 2026-09-11)
**touches:** `app/(app)/results/[id]/page.tsx`, `components/results/first-score-paywall.tsx` (new), plus THREE one-line tracking additions (pricing/upgrade page, post-signup, Razorpay verify success)
**breaking:** no — no CONTRACTS.md surface changes. No migration. Frontend + one analytics call on the verify success path.
**affects:** Results page (adds an upsell for free users), Admin funnel (three previously-dead steps start recording), Payments (adds a tracking call on success — does NOT touch the money path)
**depends_on:** ships AFTER `activation-sprint` (which gets users to the score in the first place). PLACEMENT2026 coupon is already LIVE in /admin/coupons (30% off Pro, first 100, expires 10 Nov 2026).

---

## Why (the two leaks this closes)

From the live database + admin funnel, 2026-09-11:
- **Activated → paid is ~14% — healthy.** The problem isn't willingness to pay.
- But the admin funnel's **"Viewed Pricing" and "Completed Payment" both read 0**, and **"Signed Up" reads 0** — while the DB clearly shows signups and 5 real payments. Those three funnel steps are simply **never fired**, so you're blind on the exact stages that make money.
- And on the surface where intent peaks — the **results page, right after a free user sees their first score** — there is **no upgrade ask at all**. The only CTAs are "Go to your dashboard" and "Try another case." Pricing is never brought to the user; they'd have to go find it. They don't.

Two fixes: (A) fire the three missing analytics events so the funnel is measurable; (B) put a contextual Pro upsell on the results page for free users, anchored to their own weakest dimension.

---

## How the analytics system works (so the fix is correct)

- `hooks/use-track-action.ts` → `useTrackAction()` returns `trackAction(action, category?, label?, value?)`, which beacons `{kind:'action', ...}` to `/api/track` → `user_actions` table.
- There is also a declarative wrapper used on the results page: `components/analytics/track-page-action.tsx`, used as
  `<TrackPageAction action="view_results" category="case" label={...} value={{...}} />` — fires once on mount. Use THIS for page-level events.
- Events already firing correctly (seen in `/admin/journeys`): `complete_onboarding`, `start_case`, `send_message`, `submit_case`, `view_results`.
- Events the funnel expects but that never fire: **`sign_up`, `view_pricing`, `complete_payment`.**

> ⚠️ **Confirm the exact event-name strings before wiring.** The admin funnel (the component/query behind `/admin/journeys` → the "Conversion Funnel" tab) maps action names to the labels "Signed Up", "Viewed Pricing", "Completed Payment". Open that mapping and match its strings EXACTLY. The names below (`sign_up`, `view_pricing`, `complete_payment`) follow the existing snake_case convention and are almost certainly right — but a one-character mismatch is why this has read 0, so verify rather than assume.

### Fix A1 — `view_pricing`
Add to the pricing page (`app/pricing/page.tsx`) AND the in-app upgrade page (`app/(app)/upgrade/page.tsx`), at the top of the returned JSX:
```tsx
<TrackPageAction action="view_pricing" category="pricing" />
```
(Import it the same way the results page does: `import TrackPageAction from '@/components/analytics/track-page-action';`. If either page is a Server Component, `TrackPageAction` is a client component and drops in fine.)

### Fix A2 — `sign_up`
Fire once when a brand-new account first lands authenticated. Cleanest single site: the onboarding-complete handler (where `onboarding_completed_at` gets set and the user is routed to `/dashboard`) OR the auth callback for a first-time user. Use the hook:
```ts
const trackAction = useTrackAction();
// after a successful first sign-up / onboarding completion:
trackAction('sign_up', 'auth', linkedinConnected ? 'linkedin' : 'email');
```
Do NOT fire it on every login — gate it on "row was just created" / "first onboarding completion" so it counts signups, not sessions.

### Fix A3 — `complete_payment`
Fire on the Razorpay **verify success** path (the client handler that runs after `app/api/razorpay/verify` returns ok — where the success toast / redirect happens). Do NOT touch the money path itself; this is one added line in the success branch:
```ts
trackAction('complete_payment', 'payment', tier, { amount_paise, coupon: couponCode ?? null });
```

All three are fire-and-forget and never throw (see `lib/analytics.ts`).

---

## Fix B — Contextual paywall on the results page (free users only)

### B1 — New component `components/results/first-score-paywall.tsx`
```tsx
'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, RotateCcw, Infinity as InfinityIcon, Mic } from 'lucide-react';

/**
 * Shown on the results page to FREE users, right under their score. The moment
 * of peak intent: they've just seen how MECE grades them and where they're weak.
 * Anchored to their own weakest dimension so the pitch is personal, not generic.
 * Pro users and unscored/gibberish attempts never see it (gated by the caller).
 */
export default function FirstScorePaywall({
  weakDimLabel,
}: {
  weakDimLabel: string | null;
}) {
  return (
    <div className="mt-6 rounded-xl border border-primary/25 bg-primary/[0.04] p-6">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-primary">
        <Sparkles className="h-4 w-4" /> Turn this score into an offer
      </div>
      <p className="mt-2 text-body leading-relaxed text-foreground/80">
        {weakDimLabel
          ? <>Your lowest dimension right now is <strong>{weakDimLabel}</strong>. On Pro you can re-attempt this exact case to lift it, practise unlimited cases, and run full voice interviews.</>
          : <>On Pro you can re-attempt any case to lift your weakest dimension, practise unlimited cases, and run full voice interviews.</>}
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-3">
        <li className="flex items-center gap-2 text-small text-foreground/70"><RotateCcw className="h-4 w-4 text-primary" /> Unlimited re-attempts</li>
        <li className="flex items-center gap-2 text-small text-foreground/70"><InfinityIcon className="h-4 w-4 text-primary" /> Unlimited practice bank</li>
        <li className="flex items-center gap-2 text-small text-foreground/70"><Mic className="h-4 w-4 text-primary" /> Voice interview mode</li>
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href="/upgrade?src=results"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          See Pro <ArrowRight className="h-4 w-4" />
        </Link>
        <span className="text-small text-muted-foreground">
          Placement-season offer: <strong className="text-foreground">30% off Pro</strong> with code{' '}
          <span className="font-mono font-semibold text-primary">PLACEMENT2026</span>
        </span>
      </div>
    </div>
  );
}
```

### B2 — Wire it into `app/(app)/results/[id]/page.tsx`

This page is a Server Component. Two small additions.

**(i) Fetch the tier and compute the weakest dimension.** After the existing `submission` load, add:
```ts
import { effectiveTier } from '@/lib/tier';
import FirstScorePaywall from '@/components/results/first-score-paywall';

// ...inside the component, after `breakdown` is defined:
const { data: userRow } = await supabase
  .from('users').select('*').eq('id', authUser.id).maybeSingle();
const tier = effectiveTier(userRow as any);

// weakest dimension by % of its max (same logic the breakdown bars use)
let weakDimLabel: string | null = null;
{
  const dims = isGuesstimate ? GUESSTIMATE_DIMENSIONS : SCORE_DIMENSIONS;
  let worst = Infinity;
  for (const dim of dims) {
    const rawMax = isGuesstimate ? guessMax : (SCORE_DIMENSION_MAX[dim] ?? 100);
    const pct = rawMax ? Number(breakdown[dim] ?? 0) / rawMax : 1;
    if (pct < worst) {
      worst = pct;
      weakDimLabel = isGuesstimate ? GUESSTIMATE_DIMENSION_LABELS[dim] : SCORE_DIMENSION_LABELS[dim];
    }
  }
}
```

**(ii) Render the paywall** — free tier only, and not on a gibberish/off-topic 0. Put it right after the score `Card` (after the `notScored` card block, ~line 122), so it sits high, under the score:
```tsx
{tier === 'free' && !notScored && (
  <FirstScorePaywall weakDimLabel={weakDimLabel} />
)}
```

That's it. Pro/Lite users and unscored attempts never see it. The `/upgrade?src=results` link carries attribution and lands on the page where Fix A1 fires `view_pricing`.

---

## Build gates (run on the real tree)

- [ ] `npx tsc --noEmit` → EXIT 0.
- [ ] `npm run build` → EXIT 0.
- [ ] Manual, as a FREE account: solve a case → on results, the paywall shows under the score, names your weakest dimension, and links to `/upgrade?src=results`. As a PRO account: no paywall.
- [ ] `/admin/journeys` → Funnel tab: after a fresh signup + a visit to `/upgrade` + a test payment, confirm **Signed Up / Viewed Pricing / Completed Payment** now increment (they've been stuck at 0). This is the whole point of Fix A — verify the names matched.

No migration. No backend logic change. Deploy frontend together with the one tracking line on the verify-success path.

---

## Sequencing note

Ship **activation-sprint first** (fills the top of the funnel), then this. Together: activation gets more people to a score, and this converts more of them at the moment they see it. The PLACEMENT2026 coupon (already live) is the hook the paywall points to. After both deploy, the funnel finally measures itself end to end — which is what lets you tune from here instead of guessing.

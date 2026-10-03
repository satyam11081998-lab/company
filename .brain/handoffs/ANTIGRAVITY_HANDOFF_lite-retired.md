# ANTIGRAVITY_HANDOFF — lite-retired (India): Free and Pro only

**Author:** Claude (cloud session, Project "project"). **Date:** 2026-10-04.
**Owner decision (2026-10-04):** "make it Free … Pro. Remove Lite. Remove the ₹299 one."
**Branch:** `main` (consilio).

```
touches:  consilio (frontend only; UI copy and the purchase surfaces)
            EDIT app/(app)/upgrade/page.tsx        Lite card removed; Free | Pro grid; "Everything in Free";
                                                   Pro list gains "Unlimited re-attempts", "Unlimited GD briefs";
                                                   a Lite subscriber sees "Lite is no longer sold. You keep
                                                   everything in it until your plan ends…"
            EDIT components/pricing-plans.tsx      public cards: Lite removed; Pro "Everything in Free" + the
                                                   three Lite lines it already covered
            EDIT app/pricing/page.tsx              meta, FAQ ("What happened to the Lite plan?"), JSON-LD (Free,
                                                   Pro), comparison table Free | Pro. Prices now from priceFor()
                                                   and limits from TIER_LIMITS — the page said Lite ₹199 / Pro ₹499
                                                   long after the prices moved, and several rows were wrong for
                                                   Free (GD brief, cheat sheet, daily cases)
            EDIT app/(app)/cases/[id]/page.tsx     free-user upsells point to Pro ('lite-quota' copy kept: it is
                                                   what an existing Lite subscriber sees)
            EDIT app/(app)/gd-briefs/{page,[id]/page,abstract/page,radar/page,radar/[slug]/page}.tsx,
                 components/cheat-sheet/add-to-cheat-sheet-button.tsx, app/api/abstract-briefs/route.ts
                                                   "Lite/Pro" upsell copy -> "Pro"
breaking: no. The `lite` tier is NOT removed anywhere it runs: lib/tier (TIER_LIMITS, TIER_PRICING),
          lib/tier-core, user-context, Razorpay order/verify/webhook, coupons, admin, backend access_guard
          and CLARIFICATION_QUOTA all still know `lite`, so every current Lite subscriber keeps exactly
          what they paid for until their plan ends. Gating (`hasTierAccess('lite')`) is unchanged.
          C9 (clarification quota) user-facing copy files are touched but the numbers are unchanged
          (free 7 · pro 20, now read from TIER_LIMITS); the Lite "12" simply isn't advertised.
```

## Not changed — owner decisions
1. **US / Europe** still sells Lite ($29) per the 2026-09-25 decision (`app/us/pricing`,
   `components/intl/*`, `lib/intl-plans.ts`, `lib/us-market/llms.ts`). Retire it there too? Say so and
   it is the same kind of UI-only change.
2. **Terms / Privacy** mention Lite. Legal copy: change with legal review, not as a UI tweak.
3. **Server-side:** `/api/razorpay/order` still accepts `tier: 'lite'` (needed for the US, and for any
   Lite checkout already open). To stop India Lite orders hard, reject `tier === 'lite' && currency ===
   'INR'` there — a Payments surface, so ask first.
4. **Coupons scoped to Lite** (`tierScope: 'lite'`) now cover nothing sold in India; retire or re-scope
   them in Admin → Coupons.
5. `components/solve/ConversationalSolve.tsx` has two comments mentioning Lite (no user-facing text);
   left alone because another session owns `components/solve/*`.

## Gates
`tsc --noEmit` EXIT 0 (full project); `next build` OK (copy); browser: /pricing renders Free | Pro on
desktop and phone (no sideways scroll, ₹599 from priceFor, no ₹199), the only "Lite" left is the FAQ
explaining it; the II plans page has no Lite column. /upgrade needs a signed-in session, so it is
verified by tsc + build only — open it once after deploy.

## After merging
`git push` in `consilio`, then `node .brain\sync.mjs`. Do not hand-edit STATE.md.

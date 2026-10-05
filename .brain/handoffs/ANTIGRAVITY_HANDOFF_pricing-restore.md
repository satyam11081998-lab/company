# ANTIGRAVITY_HANDOFF — pricing-restore (Free / Lite / Pro back; Prep Copilot out of Pro)

**Author:** Claude (cloud session, Project "project"). **Date:** 2026-10-06.
**Owner decision (2026-10-06):** "bring back Lite and Pro as it was … remove the Prep Copilot from Pro right now
because it is in development … the AI interviewer and Ultra we will bring later. Keep it as it was except Prep Copilot."
**Branch:** `main` (consilio).

```
touches:  consilio
            REVERT 7c20bf5 (Lite retired)  -> cda08a1: /upgrade, the public pricing cards, /pricing, the case and GD-brief
                                              upsells and the cheat-sheet button are exactly as before (Free | Lite | Pro)
            EDIT app/(app)/upgrade/page.tsx, components/pricing-plans.tsx, app/pricing/page.tsx  (e2f1113)
                   Prep Copilot removed from the Pro lists, the /pricing table and the Pro JSON-LD description
            EDIT components/app-nav.tsx      Prep Copilot menu entry hidden for Pro (PREP_COPILOT_IN_NAV = false);
                                              /coach still opens by URL for testing
            EDIT components/interview-intelligence/Plans.tsx   Prep Copilot row removed (hidden page)
            EDIT app/pricing/page.tsx        meta, FAQ and JSON-LD prices read priceFor (they said ₹199 / ₹499;
                                              the real prices are ₹299 / ₹599)
breaking: no. C9 copy files touched, numbers unchanged. No tier, payment or backend change.
```

The ANTIGRAVITY_HANDOFF_lite-retired.md handoff was removed by the revert (it described the change now undone).
Interview Intelligence plans (Free 10 min / Pro 20 min / Ultra) stay as built and hidden; nothing about them is
public. When Prep Copilot launches: set `PREP_COPILOT_IN_NAV = true` and add it back to the three Pro lists.

## Gates
`tsc --noEmit` EXIT 0; `next build` OK (copy); browser: /pricing shows Free ₹0 | Lite ₹299 | Pro ₹599 with no Prep
Copilot, desktop and phone, no sideways scroll. /upgrade needs a signed-in session: tsc + build only.

## After merging
`git push` in consilio, then `node .brain\sync.mjs`.

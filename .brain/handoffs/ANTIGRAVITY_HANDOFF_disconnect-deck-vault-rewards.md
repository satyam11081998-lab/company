# ANTIGRAVITY_HANDOFF — disconnect-deck-vault-rewards (Brain / Cowork, 2026-08-21)

Owner asked to **remove / disconnect the case-competition discount feature** ("corporate case
comp and school case comp discount thing... the feature and popup too and anything related to
that"). Scope chosen by the owner: **DISCONNECT (reversible)** — pull every user-facing entry
point so the discount can no longer be seen, reached, or issued, while leaving the backend API,
DB tables (`deck_submissions`), and any already-issued coupons intact so it can be turned back on.

IMPORTANT DISAMBIGUATION — there are two "Deck Vault" things in this repo; only ONE was touched:
- **Deck Vault *Rewards*** (the discount) = winning-deck upload -> verify -> personal coupon
  (corporate 35% / B-school 25% off Pro). **THIS is what was disconnected.**
- **The Deck Vault *catalogue*** (`/skeletons`, `DeckVaultVignette` on the landing page,
  `/admin/decks`, "Deck Vault lifetime access" Pro feature) = a separate, LIVE content feature.
  **UNTOUCHED — left exactly as-is.**

The shared **coupon system** (`/api/coupons/validate`, the CouponBox on `/upgrade`, the
server-side discount in `razorpay/{order,verify,webhook}`) is used by influencer coupons too
(e.g. ANUSHKA10), so it was **left fully intact** — only the deck-vault promo/issuance surfaces
were removed.

touches:
FRONTEND (consilio) — 6 files edited:
- `app/(app)/dashboard/page.tsx` — removed the `DeckVaultPopup` import + `<DeckVaultPopup surface="dashboard"/>` (the auto-opening one-time popup).
- `app/(app)/upgrade/page.tsx` — removed the `{ DeckVaultBanner, DeckVaultPopup }` import, the `<DeckVaultPopup surface="upgrade"/>`, and the `<DeckVaultBanner/>` strip. CouponBox / PriceBlock / coupon flow untouched; `tier` still used elsewhere.
- `components/pricing-plans.tsx` — removed the "Won a case competition? ... 35% off Pro" promo `<Link href="/deck-vault">` block; dropped the now-unused `Trophy` + `ArrowRight` lucide imports. "Deck Vault lifetime access" catalogue feature line kept.
- `app/(app)/deck-vault/page.tsx` — the upload/submission UI replaced with a server-component stub that `redirect('/upgrade')`s. Original submission client code lives in git history.
- `app/(app)/admin/deck-vault/page.tsx` — the "Deck Rewards" review panel replaced with a stub that `redirect('/admin')`s. Original review UI lives in git history.
- `components/admin/admin-nav.tsx` — removed the `{ href: '/admin/deck-vault', label: 'Deck Rewards' }` nav entry; dropped the now-unused `Ticket` import (`TicketPercent` for the Coupons entry is unchanged).

LEFT AS ORPHANS ON PURPOSE (reversible; no longer imported anywhere):
- `components/deck-vault/deck-vault-promo.tsx` (DeckVaultBanner + DeckVaultPopup) — dead code now, kept on disk so a revert is a one-line re-import. Safe to `git rm` if you want it gone.
- `app/(app)/admin/deck-vault/deck-vault-admin-client.tsx` — no longer imported by its page (page is a redirect stub). Safe to `git rm` in a cleanup.

NOT TOUCHED (backend / data / catalogue, intentionally):
- `lib/deck-vault-api.ts`, `app/api/admin/deck-vault/**`, `app/api/coupons/validate/route.ts`, `app/api/razorpay/**`.
- `deck_submissions` table + migration `0041_deck_vault_rewards.sql`.
- Deck Vault CATALOGUE: `/skeletons`, `components/skeleton-library.tsx`, `components/landing-vignettes.tsx` (`DeckVaultVignette`), `app/page.tsx` Feature 5, `/admin/decks`.

breaking: **no** — no CONTRACTS.md surface changed. C7 (coupons) and C8 (deck_skeletons auto-publish)
are code-intact and merely no longer *fed* by the deck-vault flow. affects: Payments / upgrade page
(one promo strip + popup gone; coupon box unchanged), Admin (one nav entry gone), Dashboard (popup gone).

## Gates
- Static reference sweep: no remaining import/usage of `deck-vault-promo`, `DeckVaultPopup`, or
  `DeckVaultBanner` outside the orphaned component file itself; no "won a case comp / 35% off Pro"
  copy live outside that orphan; both routes confirmed as redirect stubs; admin-nav has no
  Deck Rewards / deck-vault / Ticket references; no now-unused lucide imports left behind
  (Trophy/ArrowRight/Ticket removed; Link/Ticket-in-CouponBox still used).
- `npx tsc --noEmit` **NOT RUN in the Cowork sandbox** — tsc/build over the mounted filesystem
  exceeds the device tool timeout (same limitation noted on the voice-interview / certificates
  entries). **Run `npx tsc --noEmit` (expect EXIT 0) and `npm run build` on the real tree before
  merging.** The changes are pure deletions plus two minimal `redirect()` server components, so the
  type surface is small.

## ACTION REQUIRED
1) Review the 6 edited files; `npx tsc --noEmit` and `npm run build` on the real tree.
2) (optional cleanup) `git rm components/deck-vault/deck-vault-promo.tsx app/(app)/admin/deck-vault/deck-vault-admin-client.tsx` if you don't want the orphaned files kept for reversibility.
3) (optional, only if you later want it GONE for good, not just disconnected) remove the backend
   deck-vault API + a migration to drop `deck_submissions`. Left undone deliberately — this handoff
   is the reversible "disconnect", not a teardown.
4) Any users mid-flow with an already-issued deck-vault coupon can still redeem it (coupon system
   intact). New submissions are no longer possible.

# ANTIGRAVITY_HANDOFF — payment-path hardening + privileged-column lock

**Session:** Cowork brain, 2026-08-22
**Trigger:** owner reported user patijagannath11@gmail.com showing Pro (3-month)
+ Lite in the admin dashboard with nothing visible in the Razorpay dashboard and
no admin grant.

touches:
- `app/api/razorpay/verify/route.ts` (hardened)
- `app/api/razorpay/webhook/route.ts` (hardened)
- `supabase/migrations/0054_lock_privileged_user_columns.sql` (new, defence-in-depth)
- `FORENSIC_pro_without_payment.sql` (new, repo root, read-only diagnostics)

breaking: **no** — no CONTRACTS surface changes shape. Additive validation + a
DB privilege tightening behind C6 (users) and the Payments/RLS surface.

## What the forensics proved (live DB, service-role query 2026-08-22)

The user's row and payments were pulled directly:

- `subscription_started_at` = `2026-08-18T15:50:23.764Z`, exactly matching the
  Pro payment's `paid_at` → tier was stamped by **`/verify`**, NOT a raw DB edit.
- Two `payments` rows, both `status=paid`, both `has_signature=true` (webhook does
  not store a signature → they came through `/verify`):
  - lite, `amount_paise=29900` (₹299 monthly), `pay_TRHu0OPV8zp19x`, order `order_TRHr1yFSHiycFG`
  - pro,  `amount_paise=149900` (₹1499 3-month), `pay_TRHv8Hgzq3fc2r`, order `order_TRHv4GJYnUZGJb`
- Amounts are the EXACT list prices → no amount tampering; he used the real checkout.
- DB defences all intact: `rls_enabled=true`, `guard_trigger_present=true`,
  `browser_can_write_tier=false`.
- `pro_or_lite_users_with_NO_paid_payment = 5` (separate cohort — Jagannath is
  NOT one of them; likely admin comps, but review them).

**Conclusion:** the browser self-UPDATE loophole I first suspected is NOT the
cause here (it is genuinely closed). He came through the real `/verify` path with
a VALID signature and correct amounts. A valid signature only exists if Razorpay
produced it (a real TEST or LIVE payment) or the key secret was leaked (forgery).
Since nothing shows in Live, root cause is one of:
- **(A) production Razorpay keys are TEST keys** → free test-card checkout passes
  `/verify` and grants real Pro; visible only in Razorpay Test Mode. *Most likely.*
- **(B) LIVE keys but `RAZORPAY_KEY_SECRET` leaked** → forged signature, fabricated
  `pay_…` id, no real money.
Owner to confirm via the `NEXT_PUBLIC_RAZORPAY_KEY_ID` prefix + a Test-Mode lookup
of the two ids.

## The code fix (deploy required)

`/verify` previously trusted the signature and re-fetched only the ORDER. Now it
also **`payments.fetch(razorpay_payment_id)`** and asserts `status==='captured'`,
`order_id` matches, and `amount===expectedPaise` — a fabricated id (case B) 404s
and is rejected. Both routes now also **refuse test-mode keys in production**
(`VERCEL_ENV==='production' && RAZORPAY_KEY_ID startsWith 'rzp_test'` → 503 /
no-op) — defeats case A. Webhook additionally asserts the payload payment is
captured.

## The DB fix (0054 — appears already applied)

Column-level privilege lock so the browser `authenticated` role can UPDATE only
the ~14 profile columns and never `subscription_tier` / `is_admin` / `points`.
Enforced beneath RLS and before triggers; cannot be shadowed by a policy. The
live query shows `browser_can_write_tier=false` and grants limited to exactly the
0054 column set, so 0054 (or an equivalent) is in place. Keep it — it makes the
lock permanent even if the guard trigger is ever dropped.

## Owner action items

1. Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` (Vercel Production) — test vs live — and
   look up the two `order_`/`pay_` ids in Razorpay Test Mode. Confirms A vs B.
2. If A: set Production to `rzp_live_*` keys (both `RAZORPAY_KEY_ID/SECRET` and
   `NEXT_PUBLIC_RAZORPAY_KEY_ID`) + the live `RAZORPAY_WEBHOOK_SECRET`.
   If B: rotate `RAZORPAY_KEY_SECRET` immediately.
3. **Rotate `SUPABASE_SERVICE_ROLE_KEY`** — it was pasted in plaintext into the
   chat during this investigation.
4. Deploy the two hardened routes.
5. Revoke the user (SQL at the bottom of `FORENSIC_pro_without_payment.sql`) and
   review the 5 no-payment Pro/Lite accounts.

Proposing via handoff only — STATE.md / CHANGELOG.md / CONTRACTS.md not edited.

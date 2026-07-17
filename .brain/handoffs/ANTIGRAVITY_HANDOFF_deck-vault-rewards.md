# ANTIGRAVITY_HANDOFF — deck-vault-rewards (RECONCILIATION + 1 pending commit)

**Type:** reconciliation. This feature was authored by the Cowork brain and pushed
DIRECT TO MAIN by the owner during the 2026-07-17 session (worker bypassed — an
exception, not the new normal). This handoff is (a) the durable record, (b) ONE
pending commit to land, (c) the gate checklist that is still open.

## Landed (already on main — do not re-apply)
- frontend `849a0dc` — full rewards program (see CHANGELOG 2026-07-17 entries)
- frontend `47764c2` — build fixes (React18 RefObject; CouponRow never-narrowing) + admin Drive streaming
- frontend `1f49694` — approve() auto-publishes into `deck_skeletons` (owner-authored)
- backend `41a5f50` — /deck-vault submit+status, Telegram alert, validations
- backend `6a7f496` — Google Drive storage (services/gdrive.py), bucket fallback, TELEGRAM_CHAT_ID alias
- backend `7adc9d2` — CV Pointer Lab prompt policy fix

## Pending commit (apply + land)
Files already in the working tree, typechecked (scoped tsc, EXIT 0):
- `app/(app)/admin/deck-vault/actions.ts` — `deckFileType()`: Drive-stored decks
  (`gdrive:<id>`, no extension) previously wrote garbage into `deck_skeletons.file_type`
  via `split('.')`; now resolved from Drive filename metadata, clamped to pdf/pptx/ppt.
- `lib/google-drive.ts` — new `fetchFileName(fileId)` (metadata-only, null on failure).
Suggested message:
`fix(deck-vault): derive library file_type from Drive filename for gdrive: paths (fetchFileName)`
Gate: `next build` (or `tsc --noEmit`); no runtime migration needed.

## Open gates (owner/ops — mirrored in STATE.md blockers)
1. Vercel prod build failing on missing NEXT_PUBLIC_SUPABASE_* at prerender → recreate
   both as PLAIN vars (Production+Preview) and redeploy; or diagnose via `vercel env ls`.
2. Confirm migration `supabase/migrations/0041_deck_vault_rewards.sql` ran in Supabase.
3. Backend host env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, GOOGLE_DRIVE_{REFRESH_TOKEN,
   CLIENT_ID,CLIENT_SECRET}, GDRIVE_FOLDER_ID (+ optional GDRIVE_SUBMISSIONS_FOLDER_ID).
4. Rotated Google client secret → update value on Vercel AND backend host.
5. T&C legal review (/deck-vault page constant, v2026-07-17).

## Test plan (after deploy goes Ready)
Free account: /pricing shows the strip → /deck-vault upload (pdf deck + png cert)
→ owner gets Telegram ping → /admin/deck-vault: files open (Drive-streamed), approve
at 1% → user sees MECE-DECK-* on /deck-vault → /upgrade apply code → Pro card shows
slashed price → pay (₹6ish) → verify grants Pro, coupon flips to redeemed, payments
row has discounted amount_paise → deck appears in /admin/decks (auto-published, correct
file_type) → refund from Razorpay dashboard → webhook downgrades to free.
Negative: reuse coupon (400), another user's code (invalid), Lite purchase with Pro
coupon (frontend omits, server 400s), second submission while pending (409),
post-approval submission (409), 25MB deck (413), .exe renamed .pdf (magic-byte 400).

## Review flags for the owner (deliberately NOT changed)
- `POSITION_TO_RESULT`: second_runner_up → "National Semi Finalist" is semantically
  off (a 2nd runner-up beat the semifinalists). Consider "National 2nd Runner Up" —
  but check what `result` values the skeleton-library UI filters on before renaming.
- Auto-publish hardcodes `case_type:'strategy'`, `round_type:'finale'`, and goes
  `is_active:true` immediately — a just-approved user deck is publicly visible with
  zero curation delay. If unwanted, flip to `is_active:false` + activate from /admin/decks.
- Coupon-then-flip ordering in approve(): if the submission update failed after coupon
  insert, a coupon could exist for a pending submission (the one-active index prevents
  double-mint; worst case is benign but worth knowing).

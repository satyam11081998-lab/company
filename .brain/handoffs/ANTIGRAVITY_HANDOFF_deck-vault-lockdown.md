# ANTIGRAVITY_HANDOFF — deck-vault-lockdown (Brain / Cowork, 2026-06-23)

Deck Vault is in development: locked to ADMINS ONLY everywhere. Pro users no longer
get access (they see the "in development" message). Plus a full regression sweep.

touches:
- consilio/app/(app)/skeletons/page.tsx                  (hasAccess = is_admin only; dropped effectiveTier import)
- consilio/app/(app)/skeletons/view/[id]/page.tsx        (redirect unless is_admin; dropped effectiveTier import)
- consilio/app/api/skeletons/file/[deckId]/route.ts      (403 unless is_admin; dropped effectiveTier import)
- consilio/components/skeleton-library.tsx               (isVaultUnlocked = hasAccess; dropped isPro)

breaking: no — tightens access only. No schema change.

## What changed and why
Previously all three Deck Vault gates allowed `pro || admin`, so Pro subscribers could
open the library, view decks, and stream files. Since the vault is in development, all
three are now ADMIN-ONLY:
  1. /skeletons (library)        -> hasAccess is is_admin only; non-admins see the dev message.
  2. /skeletons/view/[id]        -> redirects to /skeletons unless is_admin.
  3. /api/skeletons/file/[deckId]-> 403 "Deck Vault is in development" unless is_admin.
Admins retain access to test/manage. (If you want it blocked for admins too, flip the
three is_admin checks to `false`.) The earlier copy change ("in development" instead of
Upgrade to Pro) stays.

## Regression sweep (this session's work)
- FRONTEND: `npx tsc --noEmit` on the whole project (fresh, no incremental) -> CLEAN.
- BACKEND: `python3 -m py_compile` on main.py + all routes/services/prompts -> CLEAN.
- New pages have default exports: /admin/status, /admin/endorsements, /gd-briefs/abstract,
  /testimonials. New route /api/endorsements exports GET.
- No references to removed symbols (getWithWake, ABSTRACT_TOPIC_BANK).
- Admin nav targets all exist (status, endorsements, testimonials, team).
- ESLint clean on the 4 vault files (the import-removal risk).
- NOT run: a full `next build` / runtime e2e (project-wide ESLint timed out in the sandbox).
  Recommend AGV run `npm run build` once before deploy as the final gate.

## ACTION REQUIRED
- git add app/(app)/skeletons/page.tsx "app/(app)/skeletons/view/[id]/page.tsx" "app/api/skeletons/file/[deckId]/route.ts" components/skeleton-library.tsx
  commit -m "fix(vault): lock Deck Vault to admins only while in development" ; push origin main
- Run `npm run build` as the final pre-deploy gate.

### Suggested CHANGELOG line
deck-vault-lockdown — Deck Vault locked to admins only while in development (library, viewer, file API); Pro users now see the dev message — breaking: no — affects: Deck Vault

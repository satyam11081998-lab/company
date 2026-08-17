# ANTIGRAVITY_HANDOFF — deck-public-access (Cowork brain, 2026-08-17)

Owner-directed BUILD session (Cowork authored code directly, same bypass as the
voice-interview / deck-vault-rewards sessions — recorded here as the design +
reconciliation record). Fixes what broke when `deck-seo-paywall` shipped: the
public deck pages 404'd for the logged-out visitors they exist for, and the
guest surfacing the owner specified was missing.

```
touches:  supabase/migrations/0049_deck_public_read.sql (NEW),
          lib/decks.ts (read via SECURITY DEFINER RPCs, not a table select),
          components/auth-cta.tsx, components/decks/deck-guest-overlay.tsx (NEW),
          app/decks/[slug]/page.tsx
          (also bundles already-uncommitted working-tree edits to
           lib/decks.ts, app/decks/[slug]/page.tsx, components/admin/deck-upload-manager.tsx
           — the deckHeading() fix + exhaustive round/result/domain lists)
breaking: NO contract version bump, but SHARED SURFACE: deck_skeletons RLS gains
          an `anon` read policy. Announce to Deck Vault & DRM (A),
          Deck Vault Rewards (Cowork), Admin (per LEDGER collision-watch).
affects:  Deck Vault & DRM, Deck Vault Rewards, Admin, Auth, SEO, Landing/guest
```

---

## The bug that mattered most: public deck pages 404 for the public

`deck_skeletons` RLS was SELECT **`to authenticated`** only (0007) plus an admin
`for all to authenticated` (0008). No policy grants `anon`. So:

- logged-IN visitor → role `authenticated` → row visible → `/decks/[slug]` renders.
- logged-OUT visitor / crawler → role `anon` → **zero rows** → `getDeckBySlug()`
  returns null → `notFound()` → **404**.

`deck-seo-paywall` (0047) added the public page and a PRIVATE page-image bucket
but never opened the catalogue row to anon. The whole point of the feature —
search traffic, shared links, answer-engine crawlers — could not reach it.

**Fix: `0049_deck_public_read.sql`** — the certificates pattern (0046), NOT a
table grant. A blanket `grant select ... to anon` (or an anon RLS policy on top
of Supabase's default table grant) would expose EVERY column of every active
deck through the public PostgREST endpoint — including `storage_path` (the
`gdrive:` id behind the paywall) and `source_submission_id`. So anon never
touches the table:

```sql
drop policy if exists "deck_skeletons_anon_read" on public.deck_skeletons; -- undo unsafe draft
revoke select on public.deck_skeletons from anon;                          -- close direct access

create function public.get_public_deck(p_slug text) returns table (...page-safe cols...)
  language sql stable security definer set search_path = public as $$
    select ... , public.effective_free_pages(d.free_pages, d.page_count), ...
    from public.deck_skeletons d where d.slug = p_slug and d.is_active = true; $$;
create function public.list_indexable_decks() returns table (slug, created_at, pages_rendered_at)
  language sql stable security definer set search_path = public as $$ ... $$;

grant execute on function public.get_public_deck(text) to anon, authenticated;
grant execute on function public.list_indexable_decks() to anon, authenticated;
```

`lib/decks.ts` now calls `.rpc('get_public_deck', {p_slug})` and
`.rpc('list_indexable_decks')` instead of `.from('deck_skeletons').select(...)`.
The functions return ONLY page-safe columns, so `storage_path` is never
reachable by anon. The slide IMAGES are untouched — `/api/decks/[slug]/page/[n]`
uses the service-role client and 403s past the free limit, so locked bytes still
never leave the private bucket. Idempotent, and it also UNDOES the unsafe
broad-grant draft if that was applied first.

## Guest surfacing on the public deck page (owner spec)

1. **Login/sign-up overlay for logged-out visitors** —
   `components/decks/deck-guest-overlay.tsx` (NEW, client). The free preview +
   summary stay readable behind a soft backdrop; one card invites login/sign-up.
   DISMISSIBLE — dismissing lets them keep browsing anonymously (owner: "if they
   don't log in from the deck overlay, anonymous user type"). Renders NOTHING on
   the server (no cloaking — crawlers get the full preview) and NOTHING for
   anyone who already holds a session (real or anonymous). Auth links carry
   `?next=/decks/<slug>`. Dismissal remembered in sessionStorage.
2. **Product nav on the deck page** — reuses `GuestPreviewNav`
   (Dashboard / Practice / Leaderboard / Casebook) under the top bar, plus
   "How it works" + "Pricing" awareness links. Each destination is already a
   guest-previewable route (middleware `PREVIEW_ROUTES` + the (app) GuestChrome),
   so the product is visible and its real actions gate behind sign-in.

## Login/sign-up returns you to where you were (cross-site)

`auth-form.tsx` already honoured `?next=` (OAuth, email confirm, password). The
gap was `auth-cta.tsx` hardcoding `/login` and `/signup` with no `next`, so the
nav auth buttons always dumped the visitor on `/dashboard`. Now it computes
`?next=<pathname>` via `usePathname()` (NOT useSearchParams — keeps "/" statically
rendered) and every Log in / Sign up link in every variant carries it.

## Phases and gates

**P1 — migration.** GATE: run `0049` in Supabase (prod = `ihwhvjoykwpvxoaivbjz`;
this Cowork session could only reach a different, inactive project so it could
NOT run it). Verify: `curl https://mece.in/decks/<slug>` with NO cookie → 200 and
the summary is in the HTML; the same slug still 200s when signed in.

**P2 — frontend.** GATE (run on the real tree — the mounted-FS build exceeds the
Cowork tool timeout, same limit as the voice-interview + certificates entries):
`npx tsc --noEmit` EXIT 0 · `npm run build` EXIT 0 and **`/` still prints
`○ (Static)`** (the useSearchParams-free auth-cta change protects this).
Manual: incognito open a deck link → overlay appears over a readable preview →
dismiss → still readable → Dashboard/Practice reachable → Log in → lands back on
the same deck.

**P3 — env.** For the intended anonymous-dashboard experience, set
`NEXT_PUBLIC_GUEST_MODE=true` in prod (it is empty in the working `.env.local`)
AND confirm Supabase Anonymous sign-ins are enabled + migration 0045 has run
(see `lib/guest.ts` for the three failure modes).

## Still open (not fixed here)

- The deck the owner saw with a filename heading was uploaded BEFORE the
  `deckHeading()` fix + the no-filename-prefill uploader (both currently
  UNCOMMITTED in the working tree). After deploy, re-save/re-upload that deck (or
  edit its `title`/`competition`/`year`/`result`) so the composed H1 is correct.
  The exhaustive round/result/domain lists are already in the uploader.
- CONTRACTS/STATE/CHANGELOG/LEDGER are deliberately NOT edited by this brain.
  PROPOSED updates for the owner/worker: (a) add the missing `deck-seo-paywall`
  CHANGELOG entry + LEDGER row (it landed on main with no ledger row); (b) note
  the `deck_skeletons` anon-read policy on whatever contract covers deck access;
  (c) append this feature to the CHANGELOG.

## Do not

- Do not make the deck image route trust the client for the free-page count — it
  stays server-side (0047 rule).
- Do not grant anon read on the `deck-pages` storage bucket — it stays PRIVATE.
- Do not add `useSearchParams()` to auth-cta — it would force "/" out of static
  rendering. `usePathname()` only.
- Do not change a published deck slug (0047/0048 rule — breaks the ranking).

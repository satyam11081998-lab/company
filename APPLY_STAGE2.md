# Deck Vault — Stage 2 frontend (Related decks). Complete files, no patch needed.

Extract at the ROOT of your `company` repo. It overwrites 2 files and adds 1:

  lib/decks.ts                                   (adds getRelatedDecks + RelatedDeck)
  app/decks/[slug]/page.tsx                      (renders the "Related winning decks" rail)
  supabase/migrations/0053_deck_related_decks.sql (NEW — the anon-safe RPC)

Then run the migration in Supabase:  0053_deck_related_decks.sql
(Also make sure 0052 from Stage 1 has been run.)

No new npm deps. Verify with your normal:  npx tsc --noEmit  &&  npm run build

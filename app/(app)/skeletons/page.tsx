import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DeckVault, { type VaultDeck } from '@/components/skeleton-library';

export const dynamic = 'force-dynamic';

export default async function DeckVaultPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [decksRes, userRowRes] = await Promise.all([
    supabase
      .from('deck_skeletons')
      .select('id, slug, title, source_kind, competition, result, case_type, round_type, file_type, description, tags, year, organizer')
      .eq('is_active', true)
      .order('sort', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase.from('users').select('subscription_tier, subscription_expires_at, is_admin').eq('id', user.id).maybeSingle(),
  ]);

  const decks = (decksRes.data as VaultDeck[] | null) || [];
  // Deck Vault is LIVE (2026-08-16). Was admin-only while the secure reader was
  // being built; that gate now sends every non-admin to a "coming soon" screen
  // even though the decks exist and the public /decks/<slug> pages are indexed.
  //
  // The library itself is open to every signed-in user — browsing the catalogue
  // is the argument for upgrading, and hiding it argues nothing. What a free or
  // Lite user gets from a card is the PUBLIC deck page: free preview pages, then
  // the paywall. `hasAccess` now means "may open the full DRM reader", which
  // stays Pro (or admin) and is still enforced server-side in
  // /skeletons/view/[id] and /api/skeletons/file/[deckId].
  const deckRow = userRowRes.data;
  const isPro =
    deckRow?.subscription_tier === 'pro' &&
    (!deckRow?.subscription_expires_at || new Date(deckRow.subscription_expires_at) > new Date());
  const hasAccess = !!deckRow?.is_admin || !!isPro;

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-6xl py-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-h1 text-foreground">The Deck Vault</h1>
          <p className="mt-2 text-body text-muted-foreground max-w-2xl">
            Real case-competition decks — national winners, finalists and problem statements from
            corporate flagships and B-school competitions. Study the structures; build your own.
          </p>
        </div>
        <DeckVault decks={decks} hasAccess={hasAccess} />
      </main>
    </div>
  );
}

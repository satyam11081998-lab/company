import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DeckVault, { type VaultDeck } from '@/components/skeleton-library';
import { effectiveTier } from '@/lib/tier';

export const dynamic = 'force-dynamic';

export default async function DeckVaultPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [decksRes, userRowRes] = await Promise.all([
    supabase
      .from('deck_skeletons')
      .select('id, title, source_kind, competition, result, case_type, round_type, file_type, description, tags')
      .eq('is_active', true)
      .order('sort', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase.from('users').select('subscription_tier, subscription_expires_at, is_admin').eq('id', user.id).single(),
  ]);

  const decks = (decksRes.data as VaultDeck[] | null) || [];
  const hasAccess = effectiveTier(userRowRes.data as any) === 'pro' || !!userRowRes.data?.is_admin;

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

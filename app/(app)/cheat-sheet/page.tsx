import { createClient } from '@/lib/supabase/server';
import { effectiveTier } from '@/lib/tier';
import { CheatSheetClient } from '@/components/cheat-sheet/cheat-sheet-client';
import TierGate from '@/components/tier-gate';

export const dynamic = 'force-dynamic';

export default async function CheatSheetPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="mx-auto max-w-3xl px-4 py-10">Please sign in.</div>;

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  const isPro = effectiveTier(profile) === 'pro';

  if (!isPro) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold mb-2">Cheat Sheet</h1>
        <p className="text-muted-foreground mb-6">
          Capture data points from GD briefs and keep them in one structured place to revise before interviews.
        </p>
        <TierGate
          required="pro"
          variant="card"
          lockedTitle="Cheat Sheet is a Pro feature"
          lockedMessage="Save data points from any GD brief and organise them for revision."
        >
          {null}
        </TierGate>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Cheat Sheet</h1>
          <p className="text-muted-foreground mb-6">
            Your saved data points, organised by domain. Pick a category on the left to revise fast.
          </p>
        </div>
      </div>
      <CheatSheetClient />
    </div>
  );
}

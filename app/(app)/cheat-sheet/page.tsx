import { createClient } from '@/lib/supabase/server';
import { effectiveTier } from '@/lib/tier';
import { listCheatSheetItems } from '@/lib/cheatsheet';
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
        {/* Phase 1 #4 RESOLVED: real interface is { required, children (required), variant?, lockedTitle?, lockedMessage? } */}
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

  const items = await listCheatSheetItems(supabase, user.id);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-1">Cheat Sheet</h1>
      <p className="text-muted-foreground mb-6">
        Your saved data points, grouped by topic. Add a note or remove anything you don’t need.
      </p>
      <CheatSheetClient initialItems={items} />
    </div>
  );
}

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { effectiveTier } from '@/lib/tier';
import { CheatSheetClient } from '@/components/cheat-sheet/cheat-sheet-client';

export const dynamic = 'force-dynamic';

export default async function CheatSheetPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="mx-auto max-w-3xl px-4 py-10">Please sign in.</div>;

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
  // Free-tier rework: the sheet is open to every tier. What a user can ADD is
  // gated at the source (Lite/Pro: any brief; free: only their one unlocked
  // brief — enforced by RLS, migration 0038). Viewing + PDF download work for all.
  const isFree = effectiveTier(profile) === 'free';

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
      {isFree && (
        <div className="mb-6 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          Free plan: your sheet holds points saved from your <span className="font-medium text-foreground">one free GD brief</span> — including
          PDF download.{' '}
          <Link href="/upgrade" className="font-semibold text-primary hover:underline">
            Upgrade
          </Link>{' '}
          to save points from every brief.
        </div>
      )}
      <CheatSheetClient />
    </div>
  );
}

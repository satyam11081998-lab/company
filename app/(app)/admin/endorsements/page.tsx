import { createClient } from '@/lib/supabase/server';
import type { EndorsementRow } from '@/lib/types';
import { EndorsementsAdminClient } from './endorsements-admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminEndorsementsPage() {
  const supabase = createClient();
  // RLS endorsements_select_admin lets an admin read all rows (incl. hidden).
  const { data } = await supabase
    .from('endorsements')
    .select('*')
    .order('status', { ascending: true })
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });

  const rows = (data as EndorsementRow[] | null) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Endorsements</h1>
        <p className="text-muted-foreground mt-1">
          Curated, credibility-first quotes from named authorities (placed seniors, mentors, toppers).
          Keep the set small and verifiable — published ones show on the landing page. No user submissions.
        </p>
      </div>
      <EndorsementsAdminClient initialRows={rows} />
    </div>
  );
}

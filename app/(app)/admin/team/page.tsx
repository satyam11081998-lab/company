import { createClient } from '@/lib/supabase/server';
import type { TeamMemberRow } from '@/lib/types';
import { TeamAdminClient } from './team-admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminTeamPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('team_members')
    .select('*')
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  const rows = (data as TeamMemberRow[] | null) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Who builds MECE</h1>
        <p className="text-muted-foreground mt-1">
          The team shown on the About page. Add or remove people — paste a LinkedIn URL, upload a photo, and add their college / internship.
        </p>
      </div>
      <TeamAdminClient initialRows={rows} />
    </div>
  );
}

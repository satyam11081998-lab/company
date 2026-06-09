import { SupabaseClient } from '@supabase/supabase-js';

export interface ProofRailData {
  names: string[];          // up to 5 real FIRST names of people who started today's case
  totalStartedToday: number;
}

function todayIstDate(): string {
  const istMs = Date.now() + 5.5 * 60 * 60 * 1000;
  return new Date(istMs).toISOString().slice(0, 10);
}

/**
 * REAL social proof: how many distinct people started today's daily case, with
 * up to 5 real FIRST names. No mock avatars, no artificial floor — if nobody has
 * started yet we return zero and the UI shows an honest "be the first" line.
 * Call with the SERVICE client (submissions are owner-scoped under RLS).
 */
export async function getProofRail(supabase: SupabaseClient, caseId: string | null): Promise<ProofRailData> {
  if (!caseId) return { names: [], totalStartedToday: 0 };
  const today = todayIstDate();

  const { data: subs, error } = await supabase
    .from('submissions')
    .select('user_id, users(name)')
    .eq('case_id', caseId)
    .gte('created_at', today + 'T00:00:00Z');

  if (error || !subs || subs.length === 0) return { names: [], totalStartedToday: 0 };

  const seen = new Map<string, string>();
  for (const s of subs as any[]) {
    if (!seen.has(s.user_id)) seen.set(s.user_id, (s.users && s.users.name) || '');
  }

  // Real FIRST names (capitalised), de-duped, up to 5 for the overlapping row.
  const names = Array.from(seen.values())
    .filter(Boolean)
    .slice(0, 5)
    .map((full) => {
      const first = full.trim().split(/\s+/)[0] || '';
      return first ? first.charAt(0).toUpperCase() + first.slice(1) : '';
    })
    .filter(Boolean);

  return { names, totalStartedToday: seen.size };
}

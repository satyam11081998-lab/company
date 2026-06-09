import { SupabaseClient } from '@supabase/supabase-js';

export interface ProofRailData {
  initials: string[];
  totalStartedToday: number;
}

function todayIstDate(): string {
  const istMs = Date.now() + 5.5 * 60 * 60 * 1000;
  return new Date(istMs).toISOString().slice(0, 10);
}

/**
 * REAL social proof: how many distinct people started today's daily case, with
 * up to 4 real initials. No mock avatars, no artificial floor — if nobody has
 * started yet we return zero and the UI shows an honest "be the first" line.
 * Call with the SERVICE client (submissions are owner-scoped under RLS).
 */
export async function getProofRail(supabase: SupabaseClient, caseId: string | null): Promise<ProofRailData> {
  if (!caseId) return { initials: [], totalStartedToday: 0 };
  const today = todayIstDate();

  const { data: subs, error } = await supabase
    .from('submissions')
    .select('user_id, users(name)')
    .eq('case_id', caseId)
    .gte('created_at', today + 'T00:00:00Z');

  if (error || !subs || subs.length === 0) return { initials: [], totalStartedToday: 0 };

  const seen = new Map<string, string>();
  for (const s of subs as any[]) {
    if (!seen.has(s.user_id)) seen.set(s.user_id, (s.users && s.users.name) || '');
  }

  const initials = Array.from(seen.values())
    .filter(Boolean)
    .slice(0, 4)
    .map((name) => {
      const parts = name.trim().split(/\s+/);
      return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
    });

  return { initials, totalStartedToday: seen.size };
}

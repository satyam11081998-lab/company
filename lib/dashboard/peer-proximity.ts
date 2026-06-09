import { SupabaseClient } from '@supabase/supabase-js';

export interface PeerInfo {
  name: string;
  ptsBehind: number;
  dailyGainRate: number; // REAL: their last-7d first-attempt points / 7
  etaHours: number;      // REAL: ptsBehind / dailyGainRate, in hours
}

export interface PeerProximityData {
  competitor: PeerInfo | null;       // the chaser directly behind you, only if they're actually gaining
  newAspirantsThisWeek: number;      // REAL count of users created in the last 7 days
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Real rivalry signal for the dashboard hero. Everything is computed from live
 * rows — no fabricated rates. Call with the SERVICE client (users/submissions
 * are owner-scoped under RLS). If the chaser has earned nothing in the last 7
 * days we return `competitor: null` rather than inventing a pace, so the UI
 * falls back to an honest line instead of a fake "gaining 150/day".
 */
export async function getPeerProximity(supabase: SupabaseClient, userId: string): Promise<PeerProximityData> {
  const since = new Date(Date.now() - WEEK_MS).toISOString();

  const { count: newCount } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since);
  const newAspirantsThisWeek = newCount || 0;

  const { data: me } = await supabase.from('users').select('points').eq('id', userId).maybeSingle();
  if (!me) return { competitor: null, newAspirantsThisWeek };
  const myPoints = (me as any).points ?? 0;

  // The aspirant directly behind you — the one who could overtake.
  const { data: behind } = await supabase
    .from('users')
    .select('id, name, points')
    .lt('points', myPoints)
    .order('points', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!behind) return { competitor: null, newAspirantsThisWeek };

  const ptsBehind = myPoints - ((behind as any).points ?? 0);

  // REAL 7-day points for the chaser: sum of their first-attempt submission scores.
  let weekPts = 0;
  try {
    const { data: subs } = await supabase
      .from('case_attempts')
      .select('submissions(score)')
      .eq('user_id', (behind as any).id)
      .eq('is_first_attempt', true)
      .gte('created_at', since);
    for (const r of (subs as any[]) || []) weekPts += r?.submissions?.score ?? 0;
  } catch {
    /* no data → treated as idle below */
  }

  const dailyGainRate = Math.round(weekPts / 7);
  if (dailyGainRate <= 0) {
    // Chaser is idle this week — no honest "catching up" story. Skip the rival
    // line entirely rather than fabricate a pace.
    return { competitor: null, newAspirantsThisWeek };
  }

  const etaHours = Math.max(1, Math.round((ptsBehind / dailyGainRate) * 24));
  return {
    competitor: { name: (behind as any).name || 'An aspirant', ptsBehind, dailyGainRate, etaHours },
    newAspirantsThisWeek,
  };
}

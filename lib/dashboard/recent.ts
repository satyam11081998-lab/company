import { SupabaseClient } from '@supabase/supabase-js';
import { formatDistanceToNowStrict } from 'date-fns';

export interface ActivityItem {
  id: string;            // submission id
  title: string;         // case title
  domain: string;        // human-readable case type (Profitability / Market Sizing / …)
  when: string;          // relative time e.g. "12h"
  duration: string;      // e.g. "15m" (stub for now)
  score: number | null;
  // skill_cluster — needed so the constellation side panel can filter
  // "Recent attempts" by the selected node's cluster. Added 2026-06-07.
  cluster: string | null;
}

// Bumped from 4 → 20 because two consumers now slice from this:
//   - RecentCard (last 3 across all clusters)
//   - ConstellationSection side panel (filter by cluster, up to 3)
// Server cost is negligible; saves a duplicate round-trip.
const FEED_LIMIT = 20;

export async function getActivityFeed(supabase: SupabaseClient, userId: string): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id,
      score,
      created_at,
      cases ( title, type, skill_cluster )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(FEED_LIMIT);

  if (error || !data) return [];

  return data.map((sub: any) => {
    const cType = sub.cases?.type || 'guesstimate';
    let domain = 'Misc';
    if (cType === 'profitability') domain = 'Profitability';
    if (cType === 'market_sizing') domain = 'Market Sizing';
    if (cType === 'growth') domain = 'Market Entry';
    if (cType === 'guesstimate') domain = 'Guesstimate';

    const date = new Date(sub.created_at);
    let whenStr = formatDistanceToNowStrict(date);
    whenStr = whenStr.replace(' days', 'd').replace(' day', 'd')
                     .replace(' hours', 'h').replace(' hour', 'h')
                     .replace(' minutes', 'm').replace(' minute', 'm')
                     .replace(' seconds', 's').replace(' second', 's');

    return {
      id: sub.id,
      title: sub.cases?.title || 'Unknown Case',
      domain,
      when: whenStr,
      duration: '15m', // Submissions don't store duration natively yet
      score: sub.score,
      cluster: sub.cases?.skill_cluster ?? null,
    };
  });
}

import { SupabaseClient } from '@supabase/supabase-js';

export interface PeerInfo {
  name: string;
  ptsBehind: number;
  dailyGainRate: number;
  etaHours: number;
}

export interface PeerProximityData {
  competitor: PeerInfo | null;
  newAspirantsThisWeek: number;
}

export async function getPeerProximity(supabase: SupabaseClient, userId: string): Promise<PeerProximityData> {
  const { data: me } = await supabase.from('users').select('points').eq('id', userId).single();
  if (!me) return { competitor: null, newAspirantsThisWeek: 0 };
  const myPoints = me.points;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const { count: newCount } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString());

  const newAspirantsThisWeek = newCount || 0;

  const { data: behind } = await supabase
    .from('users')
    .select('id, name, points')
    .lt('points', myPoints)
    .order('points', { ascending: false })
    .limit(1)
    .single();

  if (!behind) return { competitor: null, newAspirantsThisWeek };

  const ptsBehind = myPoints - behind.points;

  const { data: subs } = await supabase
    .from('submissions')
    .select('score')
    .eq('user_id', behind.id)
    .gte('created_at', oneWeekAgo.toISOString());

  let pointsEarnedLast7d = 0;
  if (subs) {
    pointsEarnedLast7d = subs.reduce((sum, s) => sum + (s.score || 0), 0);
  }
  
  const dailyGainRate = pointsEarnedLast7d > 0 ? Math.round(pointsEarnedLast7d / 7) : 150;
  const etaHours = dailyGainRate > 0 ? Math.round((ptsBehind / dailyGainRate) * 24) : 48;

  return {
    competitor: {
      name: behind.name || 'anonymous',
      ptsBehind,
      dailyGainRate,
      etaHours
    },
    newAspirantsThisWeek
  };
}

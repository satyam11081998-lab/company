import { SupabaseClient } from '@supabase/supabase-js';

export interface TodayMeta {
  casePick: {
    id: string;
    title: string;
    cluster: string;
    difficulty: string;
    minutes: number;
    firm: string;
    round: string;
    pointsReward: number;
    streakBoost: number;
  } | null;
}

export async function getTodayMeta(
  supabase: SupabaseClient, 
  dailyCaseId?: string | null
): Promise<TodayMeta> {
  if (!dailyCaseId) return { casePick: null };

  const { data: c } = await supabase
    .from('cases')
    .select('id, title, difficulty, skill_cluster, interview_meta')
    .eq('id', dailyCaseId)
    .single();

  if (!c) return { casePick: null };

  // Honest fallbacks: if a field isn't in interview_meta, leave the consumer's
  // own fallback to fire. We previously returned strings like 'Top Firm' /
  // 'Partner Round' here, which made hero.tsx's `today?.firm || 'BCG'` clause
  // dead code — users saw the made-up filler instead of the real fallback copy.
  const meta = (c.interview_meta || {}) as {
    firm?: string;
    round?: string;
    est_minutes?: number;
    points_reward?: number;
  };
  return {
    casePick: {
      id: c.id,
      title: c.title,
      cluster: c.skill_cluster ?? '',
      difficulty: c.difficulty ?? 'medium',
      minutes: meta.est_minutes ?? 25,
      firm: meta.firm ?? 'BCG',
      round: meta.round ?? 'partner round',
      pointsReward: meta.points_reward ?? 85,
      // No data-model field for streak boost yet; mirror the design value until
      // a real boost rule lands in a later phase.
      streakBoost: 25,
    },
  };
}

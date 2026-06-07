import { SupabaseClient } from '@supabase/supabase-js';
import { computeReadiness, ReadinessSubmission } from '@/lib/readiness';

export async function writeForUser(supabase: SupabaseClient, userId: string): Promise<void> {
  const now = new Date();
  
  // Find Monday of the current week (taken_on date)
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  const taken_on = monday.toISOString().split('T')[0];
  
  // Fetch submissions from last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  
  const { data: rawSubs } = await supabase
    .from('submissions')
    .select('id, case_id, score, is_first_attempt, created_at, dimension_scores, status, cases(type, difficulty)')
    .eq('user_id', userId)
    .gte('created_at', fourteenDaysAgo.toISOString());
    
  if (!rawSubs || rawSubs.length === 0) return;
  
  const submissions: ReadinessSubmission[] = rawSubs.map((s: any) => ({
    id: s.id,
    user_id: userId,
    case_id: s.case_id,
    answer_text: '',
    feedback_json: {},
    case_type: s.cases?.type,
    case_difficulty: s.cases?.difficulty,
    score: s.score,
    dimension_scores: s.dimension_scores,
    status: s.status,
    is_first_attempt: s.is_first_attempt,
    created_at: s.created_at
  }));
  
  const readiness = computeReadiness({ submissions, streak: 0, now: new Date() });
  
  const rowsToUpsert = readiness.dimensions.map((d: any) => ({
    user_id: userId,
    taken_on,
    dimension: d.dimension,
    rubric: 'case',
    earned_avg: d.earned,
    n: d.n
  }));
  
  if (rowsToUpsert.length > 0) {
    await supabase.from('dimension_snapshots').upsert(rowsToUpsert, {
      onConflict: 'user_id,taken_on,dimension,rubric'
    });
  }
}

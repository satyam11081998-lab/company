import { SupabaseClient } from '@supabase/supabase-js';
import { formatDistanceToNowStrict } from 'date-fns';

export interface TapeEvent {
  who: string;
  what: string;
  where: string;
  tone: 'red' | 'amber' | 'green' | 'navy';
  t: string;
}

export async function getCohortActivity(supabase: SupabaseClient): Promise<TapeEvent[]> {
  // Query recent global submissions
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id,
      score,
      created_at,
      user_id,
      users!inner(name),
      cases(title, type)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data) return [];

  return data.map((sub: any) => {
    // PII rule: e.g. "Arjun Reddy" -> "arjun.r"
    const rawName = sub.users?.name || 'anonymous';
    const parts = rawName.toLowerCase().split(' ');
    const who = parts.length > 1 ? `${parts[0]}.${parts[1][0]}` : parts[0];

    const isGuesstimate = sub.cases?.type === 'guesstimate';
    const score = sub.score;

    let what = 'completed a case';
    let tone: TapeEvent['tone'] = 'navy';
    
    if (score !== null) {
      if (score >= 85) {
        what = `scored ${score}`;
        tone = 'green';
      } else if (score >= 70) {
        what = `scored ${score}`;
        tone = 'amber';
      } else {
        what = `scored ${score}`;
        tone = 'navy';
      }
    } else if (isGuesstimate) {
      what = 'solved a guesstimate';
      tone = 'navy';
    }

    const where = sub.cases?.title || 'Unknown Case';

    const date = new Date(sub.created_at);
    let t = formatDistanceToNowStrict(date);
    t = t.replace(' seconds', 's').replace(' second', 's')
         .replace(' minutes', 'm').replace(' minute', 'm')
         .replace(' hours', 'h').replace(' hour', 'h')
         .replace(' days', 'd').replace(' day', 'd') + ' ago';

    return { who, what, where, tone, t };
  });
}

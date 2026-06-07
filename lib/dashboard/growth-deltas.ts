import { SupabaseClient } from '@supabase/supabase-js';

import { SCORE_DIMENSION_LABELS } from '../constants';

export interface GrowthDelta {
  l: string;  // label (dimension name)
  v: number;  // current value (score 0-100)
  d: number;  // delta (+ or -)
  c: string;  // color css variable
}

export async function getGrowthDeltas(supabase: SupabaseClient, userId: string): Promise<GrowthDelta[]> {
  // Try to read from snapshots first
  const { data: snaps } = await supabase
    .from('dimension_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(2);

  let currentDims: Record<string, number> = {};
  let pastDims: Record<string, number> = {};
  let hasData = false;

  if (snaps && snaps.length >= 2) {
    currentDims = snaps[0].dimensions;
    pastDims = snaps[1].dimensions;
    hasData = true;
  } else {
    // Fallback: Inline calculation (30d vs prev-30d)
    const now = new Date();
    const d30 = new Date(now); d30.setDate(d30.getDate() - 30);
    const d60 = new Date(now); d60.setDate(d60.getDate() - 60);

    const { data: subs } = await supabase
      .from('submissions')
      .select('created_at, feedback_json')
      .eq('user_id', userId)
      .gte('created_at', d60.toISOString());

    const currentScores: Record<string, number[]> = {};
    const pastScores: Record<string, number[]> = {};

    if (subs && subs.length > 0) {
      hasData = true;
      for (const sub of subs) {
        if (!sub.feedback_json?.breakdown) continue;
        
        const date = new Date(sub.created_at);
        const breakdown = sub.feedback_json.breakdown as Record<string, number>;
        const target = date >= d30 ? currentScores : pastScores;

        for (const [dim, score] of Object.entries(breakdown)) {
          if (!target[dim]) target[dim] = [];
          target[dim].push(score);
        }
      }
    }

    // Average the arrays
    for (const dim of Object.keys(currentScores)) {
      currentDims[dim] = Math.round(currentScores[dim].reduce((a, b) => a + b, 0) / currentScores[dim].length);
    }
    for (const dim of Object.keys(pastScores)) {
      pastDims[dim] = Math.round(pastScores[dim].reduce((a, b) => a + b, 0) / pastScores[dim].length);
    }
  }

  // Stable triplet
  const displayDims = ['quantitative', 'structure', 'business_judgment'];
  const colors = ['var(--green)', 'var(--red)', 'var(--ink-3)'];
  
  if (!hasData || Object.keys(currentDims).length === 0) {
    // Fallback defaults if no data (to match prototype roughly but with real labels)
    return [
      { l: SCORE_DIMENSION_LABELS['quantitative'], v: 30, d: 0, c: 'var(--green)' },
      { l: SCORE_DIMENSION_LABELS['structure'], v: 48, d: 0, c: 'var(--red)' },
      { l: SCORE_DIMENSION_LABELS['business_judgment'], v: 55, d: 0, c: 'var(--ink-3)' }
    ];
  }

  return displayDims.map((dim, i) => {
    const cur = currentDims[dim] || 0;
    const past = pastDims[dim] || cur;
    return {
      l: SCORE_DIMENSION_LABELS[dim] || dim,
      v: cur,
      d: cur - past,
      c: colors[i] || 'var(--ink-3)'
    };
  });
}

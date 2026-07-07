/**
 * Aggregations over `ai_usage_log` (migration 0036) for the admin "AI usage" page.
 *
 * Read with the service-role client (the table has RLS enabled with no public policy,
 * so only trusted server code can read it). Postgres `numeric` comes back from
 * PostgREST as a STRING, so cost/minute fields are coerced with Number().
 *
 * Aggregation is done in JS with simple pagination — fine at current volume. If the
 * log grows very large, move these rollups into a SQL function/RPC.
 */

import { createServiceClient } from '@/lib/supabase/service';

interface RawUsageRow {
  endpoint: string;
  model: string;
  est_cost_usd: string | number | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  audio_minutes: string | number | null;
  created_at: string;
  success: boolean;
  user_id: string | null;
}

/** Map a raw endpoint to a user-facing feature bucket. */
const FEATURE_BY_ENDPOINT: Record<string, string> = {
  '/transcribe': 'Voice → text (Whisper)',
  '/extract-text': 'Image OCR (vision)',
  '/resume/point': 'Resume / Bullet Lab',
  '/resume/refine-bullet': 'Resume / Bullet Lab',
  '/resume/generate-bullets': 'Resume / Bullet Lab',
  '/resume/fit-bullet': 'Resume / Bullet Lab',
  '/resume/band-fix': 'Resume / Bullet Lab',
  '/resume/rebuild': 'Resume / Bullet Lab',
  '/news/briefs': 'GD Briefs',
  '/news/abstract-brief': 'Abstract GD',
  '/news/classify': 'News classification',
  '/cron/schedule-daily': 'Daily case generation',
  '/submit': 'Case scoring (one-shot)',
  '/attempts/messages': 'Interviewer turns',
  '/attempts/submit': 'Session scoring',
};

function featureOf(endpoint: string): string {
  return FEATURE_BY_ENDPOINT[endpoint] ?? 'Other';
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** UTC instant of the most recent IST midnight (matches the backend quota/budget window). */
function istMidnightUtc(): number {
  const istNow = new Date(Date.now() + IST_OFFSET_MS);
  const istMid = Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate(), 0, 0, 0);
  return istMid - IST_OFFSET_MS;
}

/** IST calendar date (YYYY-MM-DD) for a UTC timestamp. */
function istDate(iso: string): string {
  return new Date(new Date(iso).getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export interface FeatureUsage {
  key: string;
  calls: number;
  cost: number;
  promptTokens: number;
  completionTokens: number;
  audioMinutes: number;
  errors: number;
}

export interface AiUsageReport {
  windowDays: number;
  generatedAt: string;
  overall: { calls: number; cost: number; promptTokens: number; completionTokens: number; errors: number };
  todayCost: number;
  todayCalls: number;
  byFeature: FeatureUsage[];
  byModel: { key: string; calls: number; cost: number }[];
  byDay: { day: string; calls: number; cost: number }[];
  topUsers: { userId: string; name: string | null; calls: number; cost: number }[];
}

export async function getAiUsageReport(windowDays = 14): Promise<AiUsageReport> {
  const supabase = createServiceClient();
  const sinceIso = new Date(Date.now() - windowDays * 86_400_000).toISOString();

  // Pull the window with simple pagination (PostgREST caps a single page at ~1000).
  const rows: RawUsageRow[] = [];
  const PAGE = 1000;
  const MAX_ROWS = 20_000;
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await supabase
      .from('ai_usage_log')
      .select('endpoint, model, est_cost_usd, prompt_tokens, completion_tokens, total_tokens, audio_minutes, created_at, success, user_id')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    rows.push(...(data as RawUsageRow[]));
    if (data.length < PAGE) break;
  }

  const num = (v: string | number | null): number => (v == null ? 0 : Number(v) || 0);

  const todayStart = istMidnightUtc();
  const overall = { calls: 0, cost: 0, promptTokens: 0, completionTokens: 0, errors: 0 };
  let todayCost = 0;
  let todayCalls = 0;

  const feature = new Map<string, FeatureUsage>();
  const model = new Map<string, { key: string; calls: number; cost: number }>();
  const day = new Map<string, { day: string; calls: number; cost: number }>();
  const user = new Map<string, { userId: string; calls: number; cost: number }>();

  for (const r of rows) {
    const cost = num(r.est_cost_usd);
    const pt = r.prompt_tokens ?? 0;
    const ct = r.completion_tokens ?? 0;
    const ok = r.success !== false;

    overall.calls += 1;
    overall.cost += cost;
    overall.promptTokens += pt;
    overall.completionTokens += ct;
    if (!ok) overall.errors += 1;

    if (new Date(r.created_at).getTime() >= todayStart) {
      todayCost += cost;
      todayCalls += 1;
    }

    const fk = featureOf(r.endpoint);
    const f = feature.get(fk) ?? { key: fk, calls: 0, cost: 0, promptTokens: 0, completionTokens: 0, audioMinutes: 0, errors: 0 };
    f.calls += 1;
    f.cost += cost;
    f.promptTokens += pt;
    f.completionTokens += ct;
    f.audioMinutes += num(r.audio_minutes);
    if (!ok) f.errors += 1;
    feature.set(fk, f);

    const mk = r.model || 'unknown';
    const m = model.get(mk) ?? { key: mk, calls: 0, cost: 0 };
    m.calls += 1;
    m.cost += cost;
    model.set(mk, m);

    const dk = istDate(r.created_at);
    const d = day.get(dk) ?? { day: dk, calls: 0, cost: 0 };
    d.calls += 1;
    d.cost += cost;
    day.set(dk, d);

    if (r.user_id) {
      const u = user.get(r.user_id) ?? { userId: r.user_id, calls: 0, cost: 0 };
      u.calls += 1;
      u.cost += cost;
      user.set(r.user_id, u);
    }
  }

  const byFeature = [...feature.values()].sort((a, b) => b.cost - a.cost);
  const byModel = [...model.values()].sort((a, b) => b.cost - a.cost);
  const byDay = [...day.values()].sort((a, b) => (a.day < b.day ? 1 : -1)); // newest first
  const topUsersRaw = [...user.values()].sort((a, b) => b.cost - a.cost).slice(0, 10);

  // Attach display names for the top spenders.
  let topUsers: AiUsageReport['topUsers'] = topUsersRaw.map((u) => ({ ...u, name: null }));
  if (topUsersRaw.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, name')
      .in('id', topUsersRaw.map((u) => u.userId));
    const nameById = new Map((users ?? []).map((u: { id: string; name: string | null }) => [u.id, u.name]));
    topUsers = topUsersRaw.map((u) => ({ ...u, name: nameById.get(u.userId) ?? null }));
  }

  return {
    windowDays,
    generatedAt: new Date().toISOString(),
    overall,
    todayCost,
    todayCalls,
    byFeature,
    byModel,
    byDay,
    topUsers,
  };
}

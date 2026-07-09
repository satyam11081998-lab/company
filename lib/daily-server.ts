import { createClient } from '@/lib/supabase/server';
import type { DailyContentResponse } from '@/lib/api';

/**
 * Today's date in IST (Asia/Kolkata), YYYY-MM-DD.
 * Mirrors the backend's today_ist_date() (IST = UTC+5:30) so the
 * scheduled_date lookup matches exactly what the generator wrote.
 */
function todayIstDate(): string {
  const istMs = Date.now() + 5.5 * 60 * 60 * 1000;
  return new Date(istMs).toISOString().slice(0, 10);
}

/** A canonical UUID (v4-ish) — used to tell a real `cases.id` from a short `code`. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Server-side read of today's daily picks, DIRECT from Supabase.
 *
 * Faithful port of the FastAPI GET /daily/today handler. Runs inside the
 * dashboard server component so tiles paint instantly.
 *
 * Resilience note: `daily_schedule.guesstimate_code` (and occasionally
 * `case_id`) may carry EITHER the case's UUID id OR its short `code`
 * (e.g. "G-45"), depending on which generator wrote the row. We resolve by the
 * correct column — querying the uuid `id` column with a non-uuid value throws,
 * and the old Promise.all would let that single error reject the whole batch,
 * nulling BOTH daily picks (so every tile fell back to /practice whenever the
 * day's guesstimate was scheduled by code). allSettled isolates each lookup.
 *
 * Never throws — on any miss returns null fields; the strip shows its graceful
 * "Browse…" fallbacks.
 */
export async function getDailyTodayServerSide(): Promise<DailyContentResponse> {
  const today = todayIstDate();
  const empty: DailyContentResponse = {
    date: today,
    case: null,
    guesstimate: null,
    guesstimate_code: null,
    guesstimate_title: null,
    brief: null,
  };

  try {
    const supabase = createClient();

    // Today's schedule row — falling back to the MOST RECENT one on/before
    // today. Between IST midnight and the morning cron (or on a cron-failure
    // day) there is no row for `today` yet; the old exact-date match returned
    // nothing and BOTH tiles fell back to /practice. Yesterday's picks are a
    // strictly better experience than dead tiles, and the tiles auto-heal the
    // moment the new schedule lands. Keep in sync with lib/access.ts, which
    // uses the same fallback so "the daily" means the same row for gating.
    const { data: schedRows } = await supabase
      .from('daily_schedule')
      .select('case_id, guesstimate_code, scheduled_date')
      .lte('scheduled_date', today)
      .order('scheduled_date', { ascending: false })
      .limit(1);
    const sched = schedRows?.[0] ?? null;

    const caseRef = sched?.case_id ?? null;
    const guessRef = sched?.guesstimate_code ?? null; // UUID id OR short code

    // Resolve a daily ref against the right column (id vs code).
    const resolveCase = (val: string) =>
      supabase
        .from('cases')
        .select('id, title, type, difficulty')
        .eq(UUID_RE.test(val) ? 'id' : 'code', val)
        .limit(1);

    const [caseRes, guessRes, starRes] = await Promise.allSettled([
      caseRef ? resolveCase(caseRef) : Promise.resolve({ data: null }),
      guessRef ? resolveCase(guessRef) : Promise.resolve({ data: null }),
      // star headline of the day = today's brief (mirrors backend: is_star, newest first)
      supabase
        .from('news_headlines')
        .select('id, title, source_name, thumbnail_url')
        .eq('is_star', true)
        .order('published_at', { ascending: false })
        .limit(1),
    ]);

    const dataOf = (r: PromiseSettledResult<{ data: unknown }>): any[] | null =>
      r.status === 'fulfilled' ? ((r.value?.data as any[] | null) ?? null) : null;

    const caseRow = dataOf(caseRes)?.[0] ?? null;
    const guessRow = dataOf(guessRes)?.[0] ?? null;
    const starRow = dataOf(starRes)?.[0] ?? null;

    return {
      date: today,
      case: caseRow
        ? { id: caseRow.id, title: caseRow.title, type: caseRow.type, difficulty: caseRow.difficulty }
        : null,
      guesstimate: guessRow
        ? { id: guessRow.id, title: guessRow.title, type: guessRow.type, difficulty: guessRow.difficulty }
        : null,
      guesstimate_code: guessRef,
      guesstimate_title: guessRow?.title ?? null,
      brief: starRow
        ? {
            id: starRow.id,
            title: starRow.title,
            source_name: starRow.source_name,
            thumbnail_url: starRow.thumbnail_url ?? null,
          }
        : null,
    };
  } catch {
    // Any failure (incl. RLS denial) → empty, never breaks the dashboard render.
    return empty;
  }
}

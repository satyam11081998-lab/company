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

/**
 * Server-side read of today's daily picks, DIRECT from Supabase.
 *
 * This is a faithful port of the FastAPI GET /daily/today handler — same
 * queries, same selection rules — so behaviour is identical, but it runs
 * inside the dashboard server component (no client round-trip, no Render
 * dependency for the read). Tiles paint instantly with the page.
 *
 * Reads three tables with the USER's session (RLS applies): daily_schedule,
 * cases, news_headlines. Requires authenticated SELECT on daily_schedule +
 * news_headlines (see supabase/daily-read-policies.sql); cases is already readable.
 *
 * Never throws — on any miss returns null fields, exactly like the backend
 * (the strip then shows its graceful "Browse…" fallbacks).
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

    // today's schedule row
    const { data: schedRows } = await supabase
      .from('daily_schedule')
      .select('case_id, guesstimate_code')
      .eq('scheduled_date', today)
      .limit(1);
    const sched = schedRows?.[0] ?? null;

    // case + guesstimate are both `cases` rows; fetch in parallel with the star headline
    const caseId = sched?.case_id ?? null;
    const guessId = sched?.guesstimate_code ?? null; // holds the guesstimate case's id

    const [caseRes, guessRes, starRes] = await Promise.all([
      caseId
        ? supabase.from('cases').select('id, title, type, difficulty').eq('id', caseId).limit(1)
        : Promise.resolve({ data: null }),
      guessId
        ? supabase.from('cases').select('id, title, type, difficulty').eq('id', guessId).limit(1)
        : Promise.resolve({ data: null }),
      // star headline of the day = today's brief (mirrors backend: is_star, newest first)
      supabase
        .from('news_headlines')
        .select('id, title, source_name, thumbnail_url')
        .eq('is_star', true)
        .order('published_at', { ascending: false })
        .limit(1),
    ]);

    const caseRow = (caseRes.data as any[] | null)?.[0] ?? null;
    const guessRow = (guessRes.data as any[] | null)?.[0] ?? null;
    const starRow = (starRes.data as any[] | null)?.[0] ?? null;

    return {
      date: today,
      case: caseRow
        ? { id: caseRow.id, title: caseRow.title, type: caseRow.type, difficulty: caseRow.difficulty }
        : null,
      guesstimate: guessRow
        ? { id: guessRow.id, title: guessRow.title, type: guessRow.type, difficulty: guessRow.difficulty }
        : null,
      guesstimate_code: guessId,
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

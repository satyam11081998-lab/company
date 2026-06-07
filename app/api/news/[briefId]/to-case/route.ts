import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { computeFreeQuota } from '@/lib/next-action';
import type { ReadinessSubmission } from '@/lib/readiness';
import type { SubscriptionTier } from '@/lib/types';

// Use the service-role client when the env var is configured (production /
// staging where SUPABASE_SERVICE_ROLE_KEY is set). In local dev that key is
// often absent — fall back to the regular user-scoped client so the route
// still runs end-to-end instead of crashing with "process.env.X is undefined".
function getAdminClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      return createServiceClient();
    } catch {
      // fall through to user client below
    }
  }
  return null;
}

// Notes for future maintainers:
// - This route used to spawn a Python process via child_process.exec. That
//   approach cannot run on Vercel (no Python runtime, no shell) and was
//   silently broken in production. Per CONTRACTS C4, frontend talks to backend
//   over HTTP. This rewrite uses the same env var as the rest of the app
//   (NEXT_PUBLIC_API_URL) and falls back to an inline template insertion when
//   the FastAPI endpoint is not reachable or not yet built.
// - The handoff explicitly authorizes the inline-write path: "writes the row
//   directly via the supabase server client" (Phase 4, news→case backend).
// - When the FastAPI worker `routes/news.py :: POST /news/briefs/:id/to-case`
//   ships, this route will get LLM-generated content for free.

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface NewsRow {
  id: string;
  title: string;
  description: string | null;
  source_name: string;
  keywords: string[] | null;
  category: string | null;
}

function inferCaseType(keywords: string[] | null, category: string | null): string {
  const hay = [...(keywords ?? []), category ?? ''].join(' ').toLowerCase();
  if (/(growth|expansion|market entry|geo|launch)/.test(hay)) return 'growth';
  if (/(size|tam|sam|market size)/.test(hay)) return 'market_sizing';
  // Default: profitability is the most common case style for news-driven cases.
  return 'profitability';
}

function inferFirm(category: string | null): string | null {
  if (!category) return null;
  // Hook for later: map category -> firm. Today, leave null so the hero's
  // own fallback (`BCG`) fires.
  return null;
}

function buildInlineCaseContent(news: NewsRow): string {
  // Honest, structured 15-minute case skeleton. Reads as a real prompt the
  // user can actually solve, not "case content goes here". Template will be
  // upgraded to LLM-generated text once the FastAPI worker exists.
  const summary = (news.description ?? '').trim();
  return `# ${news.title}

**Source:** ${news.source_name}

${summary ? summary + '\n\n---\n\n' : ''}## Your task (≈ 15 min)

You're advising the leadership team. Based on the situation above:

1. **Frame the problem.** What's the single most important question to answer first, and why?
2. **Structure your approach.** Lay out a MECE breakdown of the drivers that matter.
3. **Quantify what you can.** Estimate at least one number that anchors the discussion (size, share, impact). State your assumptions.
4. **Recommend.** What would you tell the CEO to do in the next 90 days, and what's the one risk that could derail it?

Submit a structured answer when you're done.`;
}

export async function POST(
  _req: Request,
  { params }: { params: { briefId: string } },
) {
  try {
    return await runPost(params.briefId);
  } catch (err: any) {
    // Top-level guard: any unexpected throw (missing env var, network failure,
    // unhandled rejection) returns a JSON error body so the frontend's
    // `payload.error` toast surfaces the real message instead of a bare
    // "Failed (HTTP 500)".
    console.error('news-to-case fatal', err);
    return NextResponse.json(
      { error: `route crashed: ${err?.message ?? String(err)}` },
      { status: 500 },
    );
  }
}

async function runPost(briefId: string | undefined) {
  if (!briefId) {
    return NextResponse.json({ error: 'Missing briefId' }, { status: 400 });
  }

  // User-scoped client for auth + user reads (respects RLS).
  const supabase = createClient();
  // Service-role client for writes to shared content tables (cases is shared
  // content, not user-owned). Falls back to the user client in local dev when
  // SUPABASE_SERVICE_ROLE_KEY isn't set — that mode will only succeed if RLS
  // on public.cases grants INSERT to authenticated users. In prod, the
  // service key is expected to be set and writes go through cleanly.
  const admin = getAdminClient() ?? supabase;

  // ─── 1. Auth ──────────────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ─── 2. Idempotency check (maybeSingle — does NOT error on empty) ─────
  // Per the handoff, the `source_brief_id` column carries a partial unique
  // index, so the same brief becomes at most one case across all users.
  // Use the admin client so RLS doesn't hide a row authored by someone else.
  const { data: existing, error: existingErr } = await admin
    .from('cases')
    .select('id')
    .eq('source_brief_id', briefId)
    .maybeSingle();
  if (existingErr) {
    return NextResponse.json(
      { error: `idempotency lookup failed: ${existingErr.message}` },
      { status: 500 },
    );
  }
  if (existing?.id) {
    return NextResponse.json({ case_id: existing.id });
  }

  // ─── 3. Quota check (sync helper, correct signature) ──────────────────
  const { data: userRow } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .maybeSingle();
  const tier: SubscriptionTier = (userRow?.subscription_tier as SubscriptionTier) ?? 'free';

  // Pull this user's submissions so computeFreeQuota can count today's first
  // attempts. Same shape consumed everywhere else in the app.
  const { data: subRows } = await supabase
    .from('submissions')
    .select('id, user_id, case_id, answer_text, score, feedback_json, created_at')
    .eq('user_id', user.id);
  const submissions = (subRows ?? []) as ReadinessSubmission[];
  const quota = computeFreeQuota(tier, submissions);
  if (!quota.unlimited && quota.remaining <= 0) {
    return NextResponse.json(
      { error: 'Daily free tier quota exhausted.' },
      { status: 429 },
    );
  }

  // ─── 4. Load the news headline (admin so any future RLS tightening
  //         on news_headlines doesn't silently break this) ──────────────
  const { data: news, error: newsErr } = await admin
    .from('news_headlines')
    .select('id, title, description, source_name, keywords, category')
    .eq('id', briefId)
    .maybeSingle<NewsRow>();
  if (newsErr) {
    return NextResponse.json(
      { error: `headline lookup failed: ${newsErr.message}` },
      { status: 500 },
    );
  }
  if (!news) {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
  }

  // ─── 5. Try FastAPI worker first; fall back to inline template ────────
  let title = news.title;
  let content = buildInlineCaseContent(news);
  let usedBackend = false;

  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/news/briefs/${encodeURIComponent(briefId)}/to-case`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
        // Tight timeout — if the backend doesn't have the endpoint yet, fall
        // through to inline generation rather than blocking the request.
        signal: AbortSignal.timeout(8000),
      },
    );
    if (backendRes.ok) {
      const payload = (await backendRes.json()) as {
        title?: string;
        content?: string;
        case_id?: string;
      };
      // If the backend already inserted the row, return its id directly.
      if (payload.case_id) {
        return NextResponse.json({ case_id: payload.case_id });
      }
      if (payload.title) title = payload.title;
      if (payload.content) content = payload.content;
      usedBackend = true;
    }
  } catch {
    // Backend unreachable / 404 / timeout — proceed with inline content.
  }

  // ─── 6. Insert the new case row ───────────────────────────────────────
  const caseType = inferCaseType(news.keywords, news.category);
  const firm = inferFirm(news.category);

  const { data: inserted, error: insertErr } = await admin
    .from('cases')
    .insert({
      title,
      type: caseType,
      difficulty: 'medium',
      content,
      is_active: true,
      code: null,
      source_brief_id: briefId,
      skill_cluster: caseType === 'profitability'
        ? 'prof'
        : caseType === 'market_sizing'
          ? 'size'
          : caseType === 'growth'
            ? 'ent'
            : 'soft',
      interview_meta: {
        firm,
        est_minutes: 15,
        source: usedBackend ? 'news_backend' : 'news_inline',
        generated_for: user.id,
      },
    })
    .select('id')
    .single();

  if (insertErr || !inserted?.id) {
    // Surface the actual postgres error so the toast on the frontend
    // shows something actionable instead of a generic "Failed to create case".
    console.error('news-to-case insert failed', { briefId, userId: user.id, err: insertErr });
    return NextResponse.json(
      { error: `case insert failed: ${insertErr?.message ?? 'unknown'}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ case_id: inserted.id });
}

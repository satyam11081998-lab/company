import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * GET /api/admin/journey-detail?type=case&case_id=xxx
 * GET /api/admin/journey-detail?type=brief&headline_id=xxx
 * GET /api/admin/journey-detail?type=results&submission_id=xxx
 *
 * Admin-only endpoint for fetching detailed content linked from
 * the user journey timeline — case conversations, GD briefs, results.
 * Uses the service client to bypass RLS (admin verified below).
 */
export async function GET(req: NextRequest) {
  // ── Auth: verify admin ──────────────────────────────────────────
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!(profile as { is_admin?: boolean } | null)?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const svc = createServiceClient();
  const type = req.nextUrl.searchParams.get('type');

  // ── Case conversation ───────────────────────────────────────────
  if (type === 'case') {
    const caseId = req.nextUrl.searchParams.get('case_id');
    const userId = req.nextUrl.searchParams.get('user_id');
    if (!caseId) return NextResponse.json({ error: 'case_id required' }, { status: 400 });

    // Find the attempt for this user+case (most recent)
    let query = svc.from('attempts')
      .select('id, status, created_at, submitted_at, final_recommendation, case_id')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .limit(1);
    if (userId) query = query.eq('user_id', userId);

    const { data: attempts } = await query;
    const attempt = (attempts as any[])?.[0];
    if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });

    // Fetch case title
    const { data: caseRow } = await svc.from('cases').select('title, type, difficulty').eq('id', caseId).single();

    // Fetch messages
    const { data: messages } = await svc.from('attempt_messages')
      .select('id, role, kind, content, is_clarification, created_at')
      .eq('attempt_id', attempt.id)
      .order('created_at', { ascending: true })
      .limit(200);

    return NextResponse.json({
      attempt_id: attempt.id,
      case_title: (caseRow as any)?.title ?? 'Unknown Case',
      case_type: (caseRow as any)?.type ?? null,
      difficulty: (caseRow as any)?.difficulty ?? null,
      status: attempt.status,
      submitted_at: attempt.submitted_at,
      final_recommendation: attempt.final_recommendation,
      messages: (messages ?? []).map((m: any) => ({
        role: m.role,
        kind: m.kind,
        content: m.content,
        is_clarification: m.is_clarification,
        created_at: m.created_at,
      })),
    });
  }

  // ── GD Brief detail ─────────────────────────────────────────────
  if (type === 'brief') {
    const headlineId = req.nextUrl.searchParams.get('headline_id');
    if (!headlineId) return NextResponse.json({ error: 'headline_id required' }, { status: 400 });

    const { data: brief } = await svc.from('gd_briefs')
      .select('headline_id, headline_title, headline_source_url, brief_data, created_at')
      .eq('headline_id', headlineId)
      .maybeSingle();

    if (!brief) return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
    const b = brief as any;
    const data = b.brief_data ?? {};

    return NextResponse.json({
      headline_id: b.headline_id,
      headline_title: b.headline_title,
      source_url: b.headline_source_url,
      summary: data.executive_summary ?? data.summary ?? null,
      data_points: data.data_points ?? [],
      gd_talking_points: data.gd_talking_points ?? [],
    });
  }

  // ── Submission / Results detail ─────────────────────────────────
  if (type === 'results') {
    const submissionId = req.nextUrl.searchParams.get('submission_id');
    if (!submissionId) return NextResponse.json({ error: 'submission_id required' }, { status: 400 });

    const { data: sub } = await svc.from('submissions')
      .select('id, score, feedback_json, created_at, case_id')
      .eq('id', submissionId)
      .maybeSingle();

    if (!sub) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    const s = sub as any;
    const fb = s.feedback_json ?? {};

    // Get case title
    let caseTitle = 'Unknown';
    if (s.case_id) {
      const { data: c } = await svc.from('cases').select('title').eq('id', s.case_id).single();
      if (c) caseTitle = (c as any).title;
    }

    return NextResponse.json({
      submission_id: s.id,
      score: s.score,
      case_title: caseTitle,
      summary: fb.summary ?? null,
      strengths: fb.strengths ?? [],
      improvements: fb.improvements ?? [],
      breakdown: fb.breakdown ?? {},
    });
  }

  return NextResponse.json({ error: 'Invalid type. Use: case, brief, or results' }, { status: 400 });
}

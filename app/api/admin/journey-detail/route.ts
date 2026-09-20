import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * GET /api/admin/journey-detail?type=case&attempt_id=xxx      (exact)
 * GET /api/admin/journey-detail?type=case&submission_id=xxx   (exact)
 * GET /api/admin/journey-detail?type=case&case_id=xxx&user_id=xxx (fallback)
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
  // Accepts, in order of precision:
  //   attempt_id     — exact. Sent by every tracked solve action since 0068.
  //   submission_id  — exact, resolved through submissions.attempt_id (0068)
  //                    with a fallback to the forward link attempts.submission_id
  //                    for rows written before the backfill.
  //   case_id[+user_id] — the legacy guess.
  //
  // WHY THIS CHANGED. The old version ONLY had the last form, and resolved it
  // as "most recent attempt for this case, optionally by this user, limit 1".
  // That is wrong in three separate ways, and between them they are the whole
  // of the "conversation not found" report:
  //   1. a user who attempted a case twice always got their LATER conversation
  //      shown against their EARLIER timeline entry — silently, with no way to
  //      tell from the UI;
  //   2. when the timeline row had no user_id, dropping the user filter made it
  //      return a STRANGER'S conversation for that case — a privacy leak, not
  //      just a bug;
  //   3. when nothing matched it said "Attempt not found", which reads as "the
  //      conversation is gone" when the truth is almost always "this visitor
  //      opened the case but never sent a message, so no attempt row exists".
  // Each of those now has its own answer.
  if (type === 'case') {
    const attemptId = req.nextUrl.searchParams.get('attempt_id');
    const submissionId = req.nextUrl.searchParams.get('submission_id');
    const caseId = req.nextUrl.searchParams.get('case_id');
    const userId = req.nextUrl.searchParams.get('user_id');

    const ATTEMPT_COLS =
      'id, user_id, status, created_at, submitted_at, final_recommendation, case_id, claimed_from_user_id';

    let attempt: any = null;
    let resolvedBy: 'attempt_id' | 'submission_id' | 'latest_for_user' | 'latest_for_case' | null = null;
    let siblingCount = 0;

    // 1 · exact, by attempt id
    if (attemptId) {
      const { data } = await svc.from('attempts').select(ATTEMPT_COLS).eq('id', attemptId).maybeSingle();
      attempt = data;
      resolvedBy = 'attempt_id';
    }

    // 2 · exact, by submission id
    if (!attempt && submissionId) {
      const { data: sub } = await svc
        .from('submissions')
        .select('attempt_id')
        .eq('id', submissionId)
        .maybeSingle();
      const viaColumn = (sub as { attempt_id?: string } | null)?.attempt_id;
      if (viaColumn) {
        const { data } = await svc.from('attempts').select(ATTEMPT_COLS).eq('id', viaColumn).maybeSingle();
        attempt = data;
      } else {
        // Pre-0068 row, or the backfill has not run: the forward link still works.
        const { data } = await svc
          .from('attempts')
          .select(ATTEMPT_COLS)
          .eq('submission_id', submissionId)
          .maybeSingle();
        attempt = data;
      }
      if (attempt) resolvedBy = 'submission_id';
    }

    // 3 · fall back to the guess — but never across users
    if (!attempt) {
      if (!caseId) {
        return NextResponse.json(
          { error: 'attempt_id, submission_id or case_id required' },
          { status: 400 },
        );
      }
      let q = svc
        .from('attempts')
        .select(ATTEMPT_COLS)
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(25);
      // The user filter is NOT optional any more when we have one. Dropping it
      // is what let one visitor's timeline render another visitor's answers.
      if (userId) q = q.eq('user_id', userId);

      const { data: rows } = await q;
      const list = (rows as any[]) ?? [];
      attempt = list[0] ?? null;
      siblingCount = list.length;
      resolvedBy = userId ? 'latest_for_user' : 'latest_for_case';
    }

    if (!attempt) {
      // Distinguish "never started" from "lost". If this visitor has attempts on
      // OTHER cases, the account is intact and this particular case simply never
      // became an attempt — which is a real, common funnel event (opened the
      // workspace, never sent a message) and not a data problem.
      let hint = 'No attempt row exists for this case.';
      if (userId) {
        const { count } = await svc
          .from('attempts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        hint =
          (count ?? 0) > 0
            ? 'This visitor opened the case but never sent a message, so no conversation was recorded. Their other attempts are intact.'
            : 'This visitor has no attempts at all — they opened the workspace but never started a conversation.';
      }
      return NextResponse.json({ error: hint, no_conversation: true }, { status: 404 });
    }

    const { data: caseRow } = await svc
      .from('cases')
      .select('title, type, difficulty')
      .eq('id', attempt.case_id)
      .single();

    const { data: messages } = await svc
      .from('attempt_messages')
      .select('id, role, kind, content, is_clarification, created_at')
      .eq('attempt_id', attempt.id)
      .order('created_at', { ascending: true })
      .limit(500);

    return NextResponse.json({
      attempt_id: attempt.id,
      case_title: (caseRow as any)?.title ?? 'Unknown Case',
      case_type: (caseRow as any)?.type ?? null,
      difficulty: (caseRow as any)?.difficulty ?? null,
      status: attempt.status,
      started_at: attempt.created_at,
      submitted_at: attempt.submitted_at,
      final_recommendation: attempt.final_recommendation,
      // Provenance, so the admin can trust what they are reading:
      //   resolved_by      — exact id, or a best guess
      //   sibling_attempts — how many attempts this user has on this case; > 1
      //                      means a guess could have picked the wrong one
      //   claimed_from     — this conversation was done anonymously and later
      //                      claimed onto the account (migration 0068)
      resolved_by: resolvedBy,
      sibling_attempts: siblingCount,
      claimed_from: attempt.claimed_from_user_id ?? null,
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
      .select('id, score, feedback_json, created_at, case_id, attempt_id')
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
      // 0068: lets "View Score" offer a direct jump to the conversation that
      // produced it, instead of the caller having to guess the attempt.
      attempt_id: s.attempt_id ?? null,
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

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateOnboarding, type OnboardingFormData } from '@/lib/types-onboarding';

/**
 * POST /api/onboarding/complete
 *
 * Persists the onboarding form to the `users` row and stamps
 * `onboarding_completed_at`. After this returns 200, the (app) layout's
 * "if not onboarded, redirect to /onboarding" guard lets the user through
 * to the dashboard.
 *
 * RLS: writes happen via the user-scoped client. The (existing) users-table
 * policy must allow `update` on `auth.uid() = id` for this to work. If your
 * policy is read-only, add `using (auth.uid() = id)` on update + a matching
 * with check clause.
 */
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as OnboardingFormData | null;
    if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

    // Re-validate server-side — never trust the client.
    const missing = validateOnboarding(body);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 },
      );
    }

    // Normalise: when user picked "Other", college_id should be null and
    // college_other has the free text.
    const collegeIsOther = body.college_id === '__other__' || body.college_id === null;
    const college_id = collegeIsOther ? null : body.college_id;
    const college_other = collegeIsOther ? body.college_other.trim() : null;

    const patch: Record<string, any> = {
      full_name: body.full_name.trim(),
      name: body.full_name.trim(), // mirror to existing display-name field
      college_id,
      college_other,
      batch_year: body.batch_year,
      placement_focus: body.placement_focus,
      linkedin_url: body.linkedin_url.trim() || null,
      referral_source: body.referral_source || null,
      weekly_hours_target: body.weekly_hours_target ?? null,
      goal_text: body.goal_text.trim() || null,
      onboarding_completed_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('users').update(patch).eq('id', user.id);
    if (error) {
      return NextResponse.json(
        { error: `Profile save failed: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('onboarding/complete fatal', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}

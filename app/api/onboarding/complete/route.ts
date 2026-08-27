import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateOnboarding, type OnboardingFormData } from '@/lib/types-onboarding';
import { notifyAdmin } from '@/lib/telegram';
import { sendWelcomeEmail } from '@/lib/email/send';

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
      show_linkedin: body.show_linkedin ?? true,
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

    // ── Welcome email ──────────────────────────────────────────────────
    // Sent once, the moment a real person finishes onboarding. Transactional
    // (via Google Workspace SMTP), and strictly non-blocking: a mail failure
    // must never make a successful signup look broken to the user. Skipped
    // automatically when there is no email address (e.g. an anonymous guest).
    try {
      if (user.email) {
        await sendWelcomeEmail(user.email, { name: patch.full_name });
      }
    } catch (e) {
      console.error('[onboarding] welcome email failed:', e);
    }

    // ── Admin alert ────────────────────────────────────────────────────
    // Fired HERE, on onboarding completion, and deliberately not on the
    // creation of a public.users row. Under guest mode every anonymous
    // visitor gets a row, so a row-level trigger would ping the phone for
    // people who are only reading — and the details worth knowing (name,
    // college, batch, goal) do not exist until this point anyway. This is the
    // first moment a real person has actually joined.
    //
    // Awaited but never allowed to fail the request: the profile is already
    // saved, and a Telegram outage must not make a successful signup look
    // broken to the user. notifyAdmin swallows its own errors and returns
    // false; the try/catch is belt and braces.
    try {
      const collegeLabel =
        college_other ||
        (college_id
          ? (
              await supabase.from('colleges').select('short_name, name').eq('id', college_id).maybeSingle()
            ).data?.short_name ?? 'Unknown college'
          : '—');

      await notifyAdmin(
        [
          '🎉 New MECE signup',
          '',
          `Name:      ${patch.full_name}`,
          `Email:     ${user.email ?? '—'}`,
          `College:   ${collegeLabel}`,
          `Batch:     ${body.batch_year ?? '—'}`,
          `Focus:     ${body.placement_focus ?? '—'}`,
          `LinkedIn:  ${patch.linkedin_url ?? '—'}`,
          `Heard via: ${body.referral_source || '—'}`,
          `Hrs/week:  ${body.weekly_hours_target ?? '—'}`,
          body.goal_text?.trim() ? `Goal:      ${body.goal_text.trim()}` : '',
          '',
          `User ID:   ${user.id}`,
        ]
          .filter(Boolean)
          .join('\n'),
      );
    } catch {
      /* never block a successful signup on an alert */
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

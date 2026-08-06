'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { UserRow } from '@/lib/types';
import type { UserDetail } from './types';

/**
 * Admin-only user inspection.
 *
 * Everything here runs with the SERVICE-ROLE client because `users`,
 * `payments`, `submissions` and `user_sessions` are all owner-scoped under RLS
 * (migration 0006) — a cookie client would legitimately see nothing. Access is
 * gated on users.is_admin, checked on every call, not just in the layout.
 */

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!(data as Partial<UserRow>)?.is_admin) throw new Error('Forbidden');
  return user.id;
}

export async function getUserDetail(
  userId: string,
): Promise<{ success: boolean; error?: string; data?: UserDetail }> {
  try {
    await requireAdmin();
    const svc = createServiceClient();

    const { data: uRaw, error } = await svc
      .from('users').select('*').eq('id', userId).maybeSingle();
    if (error) return { success: false, error: error.message };
    if (!uRaw) return { success: false, error: 'User not found.' };
    const u = uRaw as Record<string, any>;

    // Tables added by later migrations may not exist on every environment, so
    // each optional read is individually tolerant — one missing table must not
    // blank the whole panel.
    const safe = async <T,>(p: PromiseLike<{ data: T | null }>): Promise<T[]> => {
      try {
        const { data } = await p;
        return (data as unknown as T[]) ?? [];
      } catch {
        return [];
      }
    };

    const [college, payments, coupons, sessions, subs] = await Promise.all([
      u.college_id
        ? svc.from('colleges').select('short_name, name').eq('id', u.college_id).maybeSingle()
        : Promise.resolve({ data: null }),
      safe<any>(svc.from('payments')
        .select('id, tier, amount_paise, status, created_at, paid_at, razorpay_payment_id')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(50)),
      safe<any>(svc.from('coupon_redemptions')
        .select('id, code, tier, period, paid_paise, discount_paise, created_at')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(50)),
      safe<any>(svc.from('user_sessions')
        .select('id, ip, city, region, country, user_agent, device_label, created_at, last_seen_at, revoked_at')
        .eq('user_id', userId).order('last_seen_at', { ascending: false }).limit(20)),
      safe<any>(svc.from('submissions')
        .select('id, score, created_at, cases(title, type)')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(400)),
    ]);

    const scored = subs.filter((s: any) => typeof s.score === 'number');
    const avg = scored.length
      ? Math.round(scored.reduce((a: number, s: any) => a + s.score, 0) / scored.length)
      : null;
    const best = scored.length ? Math.max(...scored.map((s: any) => s.score)) : null;

    const collegeRow = (college as any)?.data as { short_name?: string; name?: string } | null;

    return {
      success: true,
      data: {
        id: u.id,
        name: u.name ?? null,
        fullName: u.full_name ?? null,
        email: u.email,
        phone: u.phone ?? null,
        avatarUrl: u.avatar_url ?? null,
        createdAt: u.created_at,
        onboardedAt: u.onboarding_completed_at ?? null,
        referralSource: u.referral_source ?? null,

        collegeName: collegeRow?.short_name || collegeRow?.name || null,
        collegeOther: u.college_other ?? null,
        collegeEmail: u.college_email ?? null,
        collegeEmailVerifiedAt: u.college_email_verified_at ?? null,
        batchYear: u.batch_year ?? null,
        placementFocus: u.placement_focus ?? null,

        linkedinUrl: u.linkedin_url ?? null,
        showLinkedin: u.show_linkedin ?? null,
        linkedinFollowClaimedAt: u.linkedin_follow_claimed_at ?? null,

        weeklyHoursTarget: u.weekly_hours_target ?? null,
        goalText: u.goal_text ?? null,

        tier: u.subscription_tier ?? 'free',
        subStartedAt: u.subscription_started_at ?? null,
        subExpiresAt: u.subscription_expires_at ?? null,
        isAdmin: !!u.is_admin,
        isDemo: !!u.is_demo,

        points: u.points ?? 0,
        streak: u.streak_count ?? 0,
        streakLastDate: u.streak_last_date ?? null,
        submissionCount: subs.length,
        avgScore: avg,
        bestScore: best,
        lastActiveAt: subs[0]?.created_at ?? null,

        payments: payments.map((p: any) => ({
          id: p.id, tier: p.tier, amountPaise: p.amount_paise, status: p.status,
          createdAt: p.created_at, paidAt: p.paid_at, paymentId: p.razorpay_payment_id ?? null,
        })),
        couponsUsed: coupons.map((c: any) => ({
          id: c.id, code: c.code, tier: c.tier, period: c.period,
          paidPaise: c.paid_paise, discountPaise: c.discount_paise, createdAt: c.created_at,
        })),
        sessions: sessions.map((s: any) => ({
          id: s.id, ip: s.ip, city: s.city, region: s.region, country: s.country,
          userAgent: s.user_agent, deviceLabel: s.device_label,
          createdAt: s.created_at, lastSeenAt: s.last_seen_at, revokedAt: s.revoked_at,
        })),
        recentSubmissions: subs.slice(0, 25).map((s: any) => ({
          id: s.id,
          caseTitle: s.cases?.title ?? 'Untitled',
          caseType: s.cases?.type ?? null,
          score: s.score,
          createdAt: s.created_at,
        })),
      },
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to load user.' };
  }
}

/** Flag or unflag a showcase account (hidden from leaderboard + aggregates). */
export async function setDemoFlag(
  userId: string,
  isDemo: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const callerId = await requireAdmin();
    if (callerId === userId) {
      return { success: false, error: 'Do not flag your own account as a demo.' };
    }
    const svc = createServiceClient();
    const { data, error } = await svc
      .from('users').update({ is_demo: isDemo }).eq('id', userId).select('id');
    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) return { success: false, error: 'No rows updated.' };
    revalidatePath('/admin/users');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to update.' };
  }
}

/** Force-sign-out every live session for a user (support escape hatch). */
export async function revokeAllSessions(
  userId: string,
): Promise<{ success: boolean; error?: string; data?: { count: number } }> {
  try {
    await requireAdmin();
    const svc = createServiceClient();
    const { data, error } = await svc
      .from('user_sessions')
      .update({ revoked_at: new Date().toISOString(), revoked_by: 'admin' })
      .eq('user_id', userId)
      .is('revoked_at', null)
      .select('id');
    if (error) return { success: false, error: error.message };
    return { success: true, data: { count: data?.length ?? 0 } };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to revoke sessions.' };
  }
}

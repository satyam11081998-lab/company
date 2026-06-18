'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendBulk, unsubscribeUrl } from '@/lib/email/send';
import { broadcastEmail } from '@/lib/email/templates';
import type { UserRow } from '@/lib/types';

type SegmentType = 'all' | 'tier' | 'activity' | 'lifecycle';
type PreviewResult = { success: boolean; count?: number; error?: string };
type BroadcastResult = { success: boolean; sent?: number; failed?: number; total?: number; error?: string };

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!(data as Partial<UserRow>)?.is_admin) throw new Error('Forbidden: Admins only');
}

interface Recipient {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Resolve the recipient set for a segment, ALWAYS excluding opted-out users.
 * At MECE's scale (tens–hundreds of users) we fetch + classify in memory, which
 * keeps the segment logic simple and correct. Revisit with SQL if the base grows large.
 */
async function resolveRecipients(segmentType: SegmentType, segmentValue: string): Promise<Recipient[]> {
  const db = createServiceClient();
  const { data: users } = await db
    .from('users')
    .select('id, email, name, subscription_tier, subscription_expires_at, marketing_opt_out');

  let pool = (users || []).filter((u: any) => u.email && !u.marketing_opt_out) as any[];
  const now = Date.now();

  if (segmentType === 'tier') {
    pool = pool.filter((u) => (u.subscription_tier || 'free') === segmentValue);
  } else if (segmentType === 'lifecycle') {
    pool = pool.filter((u) => {
      const exp = u.subscription_expires_at ? new Date(u.subscription_expires_at).getTime() : null;
      if (exp === null) return false;
      if (segmentValue === 'expiring') return exp > now && exp < now + 7 * 86_400_000;
      if (segmentValue === 'expired') return exp < now;
      return false;
    });
  } else if (segmentType === 'activity') {
    const since = new Date(now - 30 * 86_400_000).toISOString();
    const { data: recent } = await db.from('submissions').select('user_id').gte('created_at', since);
    const activeSet = new Set((recent || []).map((s: any) => s.user_id));
    if (segmentValue === 'active') {
      pool = pool.filter((u) => activeSet.has(u.id));
    } else {
      const { data: ever } = await db.from('submissions').select('user_id');
      const everSet = new Set((ever || []).map((s: any) => s.user_id));
      if (segmentValue === 'dormant') pool = pool.filter((u) => !activeSet.has(u.id) && everSet.has(u.id));
      else if (segmentValue === 'never') pool = pool.filter((u) => !everSet.has(u.id));
    }
  }
  // 'all' → no extra filter (still excludes opted-out)

  return pool.map((u) => ({ id: u.id, email: u.email, name: u.name ?? null }));
}

/** Count how many users a segment would reach (admin preview before sending). */
export async function previewRecipients(segmentType: SegmentType, segmentValue: string): Promise<PreviewResult> {
  await requireAdmin();
  try {
    const r = await resolveRecipients(segmentType, segmentValue);
    return { success: true, count: r.length };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to count recipients' };
  }
}

/** Send a branded broadcast to a segment via Resend, with a per-user unsubscribe link. */
export async function sendBroadcast(input: {
  subject: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  segmentType: SegmentType;
  segmentValue: string;
}): Promise<BroadcastResult> {
  await requireAdmin();
  const subject = (input.subject || '').trim();
  const heading = (input.heading || input.subject || '').trim();
  const bodyHtml = (input.bodyHtml || '').trim();
  if (!subject) return { success: false, error: 'Subject is required.' };
  if (!bodyHtml) return { success: false, error: 'Message body is required.' };

  let recipients: Recipient[];
  try {
    recipients = await resolveRecipients(input.segmentType, input.segmentValue);
  } catch (e: any) {
    return { success: false, error: `Could not resolve recipients: ${e?.message || e}` };
  }
  if (recipients.length === 0) return { success: false, error: 'No recipients match this segment.' };

  const messages = recipients.map((r) => ({
    to: r.email,
    subject,
    html: broadcastEmail({
      heading,
      bodyHtml,
      ctaLabel: input.ctaLabel,
      ctaUrl: input.ctaUrl,
      unsubscribeUrl: unsubscribeUrl(r.id),
    }),
  }));

  const result = await sendBulk(messages);
  if (result.skipped) {
    return { success: false, error: result.error || 'Bulk email not configured (set RESEND_API_KEY).' };
  }
  return { success: true, sent: result.sent, failed: result.failed, total: recipients.length };
}

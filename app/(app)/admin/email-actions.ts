'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendBulk, unsubscribeUrl } from '@/lib/email/send';
import { broadcastEmail, baseEmailLayout } from '@/lib/email/templates';
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
  // When true, bodyHtml is a COMPLETE email document and is sent verbatim —
  // it is NOT wrapped in baseEmailLayout (no extra header/footer). Any
  // `{{UNSUBSCRIBE}}` token in it is replaced per-recipient with their unique
  // unsubscribe link. Use this for full custom designs; leave off for the
  // composer's simple heading+body path.
  bodyIsFullHtml?: boolean;
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

  const messages = recipients.map((r) => {
    const unsub = unsubscribeUrl(r.id);
    return {
      to: r.email,
      subject,
      html: input.bodyIsFullHtml
        ? bodyHtml.replace(/\{\{\s*UNSUBSCRIBE\s*\}\}/g, unsub)
        : broadcastEmail({
            heading,
            bodyHtml,
            ctaLabel: input.ctaLabel,
            ctaUrl: input.ctaUrl,
            unsubscribeUrl: unsub,
          }),
      listUnsubscribe: unsub,
    };
  });

  const result = await sendBulk(messages);
  if (result.skipped) {
    return { success: false, error: result.error || 'Bulk email not configured (set RESEND_API_KEY).' };
  }
  return { success: true, sent: result.sent, failed: result.failed, total: recipients.length };
}

/* ───────────────────────────────────────────────────────────────────────────
 * Single-recipient send — email ONE specific person, not a whole segment.
 * A deliberate 1:1 admin email, so it is not filtered by marketing_opt_out; it
 * still carries a real unsubscribe link when the address is a known user.
 * ─────────────────────────────────────────────────────────────────────────── */
export async function sendToOne(input: {
  email: string;
  subject: string;
  heading?: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  bodyIsFullHtml?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const email = (input.email || '').trim();
  const subject = (input.subject || '').trim();
  const bodyHtml = (input.bodyHtml || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { success: false, error: 'Enter a valid email address.' };
  if (!subject) return { success: false, error: 'Subject is required.' };
  if (!bodyHtml) return { success: false, error: 'Message body is required.' };

  const db = createServiceClient();
  const { data: u } = await db.from('users').select('id').eq('email', email).maybeSingle();
  const unsub = (u as any)?.id
    ? unsubscribeUrl((u as any).id)
    : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mece.in'}/unsubscribe`;

  const looksFull = input.bodyIsFullHtml || /^\s*<(?:!doctype|html)\b/i.test(bodyHtml);
  const html = looksFull
    ? bodyHtml.replace(/\{\{\s*UNSUBSCRIBE\s*\}\}/g, unsub)
    : broadcastEmail({
        heading: (input.heading || subject).trim(),
        bodyHtml: bodyHtml.replace(/\n/g, '<br/>'),
        ctaLabel: input.ctaLabel,
        ctaUrl: input.ctaUrl,
        unsubscribeUrl: unsub,
      });

  const result = await sendBulk([{ to: email, subject, html, listUnsubscribe: (u as any)?.id ? unsub : undefined }]);
  if (result.skipped) return { success: false, error: result.error || 'Email not configured (set RESEND_API_KEY or GMAIL_*).' };
  if ((result.failed ?? 0) > 0 || (result.sent ?? 0) === 0) return { success: false, error: 'Send failed — check the address and email config.' };
  return { success: true };
}

/* ───────────────────────────────────────────────────────────────────────────
 * Daily digest — auto-compose today's guesstimate + case + top news into a
 * ready-to-send email. Returns full HTML with a {{UNSUBSCRIBE}} token that
 * sendBroadcast fills in per recipient. The admin previews it and sends (a cron
 * can call this same builder to auto-send later).
 * ─────────────────────────────────────────────────────────────────────────── */
const _SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://mece.in';

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function digestCard(label: string, title: string, sub: string, href: string, cta: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;border:1px solid #E7E3DC;border-radius:12px;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#C8102E;">${esc(label)}</p>
      <p style="margin:0 0 ${sub ? '4' : '12'}px;font-size:17px;font-weight:700;color:#0F1C33;line-height:1.3;">${esc(title)}</p>
      ${sub ? `<p style="margin:0 0 12px;font-size:13px;color:#5B6472;line-height:1.5;">${esc(sub)}</p>` : ''}
      <a href="${href}" style="display:inline-block;background:#C8102E;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:9px 18px;border-radius:8px;">${esc(cta)} &rarr;</a>
    </td></tr>
  </table>`;
}

export async function generateDailyDigest(): Promise<{ success: boolean; subject?: string; html?: string; note?: string; error?: string }> {
  await requireAdmin();
  try {
    const db = createServiceClient();
    // Today's date in IST (UTC+5:30), matching the backend's daily_schedule key.
    const today = new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10);

    const { data: sched } = await db
      .from('daily_schedule')
      .select('case_id, guesstimate_code')
      .eq('scheduled_date', today)
      .maybeSingle();

    let caseRow: any = null;
    let guessRow: any = null;
    if ((sched as any)?.case_id) {
      const { data } = await db.from('cases').select('id, title, difficulty').eq('id', (sched as any).case_id).maybeSingle();
      caseRow = data;
    }
    if ((sched as any)?.guesstimate_code) {
      const { data } = await db.from('cases').select('id, title, difficulty').eq('id', (sched as any).guesstimate_code).maybeSingle();
      guessRow = data;
    }

    // Top news from the last ~2 days for the GD angle.
    const since = new Date(Date.now() - 2 * 86_400_000).toISOString();
    const { data: news } = await db
      .from('news_headlines')
      .select('title, source_name')
      .gte('published_at', since)
      .order('published_at', { ascending: false })
      .limit(3);

    let body = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1A2233;">The people who crack case interviews don&rsquo;t cram the night before &mdash; they do a little, every day. Here&rsquo;s today&rsquo;s set. Ten focused minutes now beats a panicked all-nighter later.</p>`;

    if (guessRow) {
      body += digestCard('Today’s guesstimate', guessRow.title, 'A fast, fun number to crack. Structure it top-down — don’t just guess.', `${_SITE}/cases/${guessRow.id}`, 'Crack the guesstimate');
    }
    if (caseRow) {
      const diff = caseRow.difficulty ? ` · ${esc(caseRow.difficulty)}` : '';
      body += digestCard(`Today’s case${diff}`, caseRow.title, 'Clarify, structure, quantify, recommend — then let the AI interviewer grade you on the 100-point rubric.', `${_SITE}/cases/${caseRow.id}`, 'Solve today’s case');
    }
    if (!guessRow && !caseRow) {
      body += digestCard('Practice', 'Your daily case & guesstimate', 'Jump in and keep the streak alive.', `${_SITE}/dashboard`, 'Open the dashboard');
    }

    if (news && news.length > 0) {
      const items = news
        .map((n: any) => `<li style="margin:0 0 6px;">${esc(n.title)}${n.source_name ? ` <span style="color:#5B6472;">— ${esc(n.source_name)}</span>` : ''}</li>`)
        .join('');
      body += `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;border:1px solid #E7E3DC;border-radius:12px;">
        <tr><td style="padding:18px 20px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#C8102E;">In the news — for your GD</p>
          <ul style="margin:0 0 12px;padding-left:18px;font-size:14px;line-height:1.55;color:#1A2233;">${items}</ul>
          <a href="${_SITE}/gd-briefs" style="display:inline-block;background:#0F1C33;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:9px 18px;border-radius:8px;">Read the GD briefs &rarr;</a>
        </td></tr>
      </table>`;
    }

    body += `<p style="margin:16px 0 0;font-size:14px;color:#5B6472;line-height:1.6;">Miss a day and momentum resets. Do today&rsquo;s set &mdash; future-you at the interview table will thank you.</p>`;

    const html = baseEmailLayout({
      preheader: guessRow || caseRow ? 'Today’s guesstimate + case are live — about 12 focused minutes.' : 'Your daily practice is waiting.',
      heading: 'Your daily reps are ready',
      contentHtml: body,
      unsubscribeUrl: '{{UNSUBSCRIBE}}',
    });

    const subject = 'Today’s guesstimate + case are live — 10 minutes to sharper thinking';
    const note = !sched ? 'No daily schedule set for today (IST) — generated a generic practice nudge. Set today’s schedule for the full case + guesstimate digest.' : undefined;
    return { success: true, subject, html, note };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Could not build the digest.' };
  }
}

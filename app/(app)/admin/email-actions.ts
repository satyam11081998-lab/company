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
  // Guard against the classic slip of typing an address into the Subject box —
  // an email-address subject is never intentional and looks broken in the inbox.
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(subject)) {
    return { success: false, error: 'The subject line looks like an email address — enter a real subject (e.g. “Your MECE practice for today”).' };
  }
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
  // An email-address subject is never intentional (usually the address was typed
  // into the Subject box). Refuse it so it can't land in someone's inbox.
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(subject)) return { success: false, error: 'The subject line looks like an email address — enter a real subject (e.g. “Your MECE practice for today”).' };
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

    let body = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1A2233;">Here&rsquo;s the set — about 10 focused minutes, start to finish.</p>`;

    if (guessRow) {
      body += digestCard('Today’s guesstimate', guessRow.title, 'Build your estimate step by step, make your assumptions explicit, and arrive at a defendable number.', `${_SITE}/cases/${guessRow.id}`, 'Practice the guesstimate');
    }
    if (caseRow) {
      const diff = caseRow.difficulty ? ` · ${esc(caseRow.difficulty)}` : '';
      body += digestCard(`Today’s case${diff}`, caseRow.title, 'Clarify, structure, quantify, and recommend — then get scored by the MECE AI interviewer.', `${_SITE}/cases/${caseRow.id}`, 'Start the case');
    }
    if (!guessRow && !caseRow) {
      body += digestCard('Practice', 'Your daily case & guesstimate', 'Your case and guesstimate for today are inside.', `${_SITE}/dashboard`, 'Open the dashboard');
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
          <a href="${_SITE}/gd-briefs" style="display:inline-block;background:#0F1C33;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:9px 18px;border-radius:8px;">Read today’s GD briefs &rarr;</a>
        </td></tr>
      </table>`;
    }

    body += `<p style="margin:16px 0 0;font-size:14px;color:#5B6472;line-height:1.6;">That&rsquo;s it for today. Keep practicing.</p>`;

    const html = baseEmailLayout({
      preheader: guessRow || caseRow ? 'A fresh guesstimate and case to sharpen your thinking.' : 'Your practice set is ready inside.',
      heading: 'Your MECE practice for today',
      contentHtml: body,
      unsubscribeUrl: '{{UNSUBSCRIBE}}',
    });

    const subject = 'Your MECE practice for today';
    const note = !sched ? 'No daily schedule set for today (IST) — generated a generic practice nudge. Set today’s schedule for the full case + guesstimate digest.' : undefined;
    return { success: true, subject, html, note };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Could not build the digest.' };
  }
}


/* ───────────────────────────────────────────────────────────────────────────
 * Targeted practice — company/topic-specific case or guesstimate for a broadcast.
 * Generation + save run on the FastAPI backend (cost-metered via ai_usage_log and
 * gated by assert_daily_budget); this action forwards the admin's Supabase JWT so
 * the backend re-verifies is_admin. The chosen option is saved as an UNLISTED case
 * (is_active=false, unlisted=true) — attemptable by direct link from the email and
 * scored through the normal interview pipeline. See backend routes/broadcast.py.
 * ─────────────────────────────────────────────────────────────────────────── */
const BROADCAST_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/** Verify admin AND return the caller's Supabase access token for the backend. */
async function adminBearer(): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!(data as Partial<UserRow>)?.is_admin) throw new Error('Forbidden: Admins only');
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('No active session — sign in again.');
  return token;
}

export async function generateBroadcastOptions(input: {
  topic: string;
  kind: 'case' | 'guesstimate';
  difficulty: string;
  count?: number;
}): Promise<{ success: boolean; options?: any[]; kind?: string; error?: string }> {
  let token: string;
  try { token = await adminBearer(); } catch (e: any) { return { success: false, error: e?.message || 'Unauthorized' }; }
  if (!(input.topic || '').trim()) return { success: false, error: 'Enter a company or topic to generate around.' };
  try {
    const res = await fetch(`${BROADCAST_API}/broadcast/generate-options`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({
        topic: input.topic.trim(),
        kind: input.kind,
        difficulty: input.difficulty,
        count: input.count ?? 3,
      }),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) return { success: false, error: (data as any)?.detail || `Generation failed (${res.status}).` };
    return { success: true, options: (data as any).options || [], kind: (data as any).kind };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Could not reach the generator.' };
  }
}

export async function materializeBroadcastOption(input: {
  option: any;
  topic: string;
}): Promise<{ success: boolean; case_id?: string; title?: string; type?: string; difficulty?: string; url?: string; error?: string }> {
  let token: string;
  try { token = await adminBearer(); } catch (e: any) { return { success: false, error: e?.message || 'Unauthorized' }; }
  if (!input.option) return { success: false, error: 'No option selected.' };
  try {
    const res = await fetch(`${BROADCAST_API}/broadcast/materialize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ option: input.option, topic: (input.topic || '').trim() }),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) return { success: false, error: (data as any)?.detail || `Save failed (${res.status}).` };
    const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://mece.in';
    const d = data as any;
    return { success: true, case_id: d.case_id, title: d.title, type: d.type, difficulty: d.difficulty, url: `${site}/cases/${d.case_id}` };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Could not save the option.' };
  }
}

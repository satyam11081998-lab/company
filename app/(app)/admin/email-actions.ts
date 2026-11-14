'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendBulk, unsubscribeUrl } from '@/lib/email/send';
import { broadcastEmail, emailTagline } from '@/lib/email/templates';
import { buildDailyDigest, type DigestResult } from '@/lib/email/digest';
import { contentMarketOf, type ContentMarket } from '@/lib/market';
import { MARKET_LABEL, audienceProblem, inAudience, parseAudience, parseContentMarket, type Audience } from '@/lib/broadcast-audience';
import type { UserRow } from '@/lib/types';

type SegmentType = 'all' | 'tier' | 'activity' | 'lifecycle';
// Audience (2026-10-02): India, US & Europe, or both — see lib/broadcast-audience.ts.
type PreviewResult = { success: boolean; count?: number; byMarket?: Record<ContentMarket, number>; error?: string };
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
  /** The bank the account practises: 'IN', or 'US' for US + Europe accounts. */
  content: ContentMarket;
}

/**
 * Resolve the recipient set for a segment, ALWAYS excluding opted-out users.
 * At MECE's scale (tens–hundreds of users) we fetch + classify in memory, which
 * keeps the segment logic simple and correct. Revisit with SQL if the base grows large.
 */
async function resolveRecipients(segmentType: SegmentType, segmentValue: string, audience: Audience): Promise<Recipient[]> {
  const db = createServiceClient();
  const cols = 'id, email, name, subscription_tier, subscription_expires_at, marketing_opt_out';
  let { data: users, error } = await db.from('users').select(`${cols}, market`);
  if (error && /market/i.test(error.message || '')) {
    // Before migration 0070 there is no users.market: every account is India.
    ({ data: users, error } = await db.from('users').select(cols));
  }
  if (error) throw new Error(error.message);

  let pool = (users || []).filter((u: any) => u.email && !u.marketing_opt_out) as any[];
  pool = pool.filter((u) => inAudience(u.market, audience));
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

  return pool.map((u) => ({ id: u.id, email: u.email, name: u.name ?? null, content: contentMarketOf(u.market) }));
}

/** Count how many users a segment would reach (admin preview before sending), split by market. */
export async function previewRecipients(segmentType: SegmentType, segmentValue: string, audience: Audience): Promise<PreviewResult> {
  await requireAdmin();
  try {
    const r = await resolveRecipients(segmentType, segmentValue, parseAudience(audience));
    const byMarket: Record<ContentMarket, number> = { IN: 0, US: 0 };
    for (const x of r) byMarket[x.content] += 1;
    return { success: true, count: r.length, byMarket };
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
  /** India, US & Europe, or both (see Audience). */
  audience: Audience;
  /**
   * The market the email's practice links belong to, when it has any (a daily
   * digest or targeted practice built for one market). The send is refused if
   * it does not match the audience — those links would not open for the others.
   */
  contentMarket?: ContentMarket;
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

  let audience: Audience;
  let contentMarket: ContentMarket | undefined;
  try {
    audience = parseAudience(input.audience);
    contentMarket = parseContentMarket(input.contentMarket);
  } catch (e: any) {
    return { success: false, error: e?.message || 'Invalid audience.' };
  }
  const mismatch = audienceProblem(audience, contentMarket ? [contentMarket] : []);
  if (mismatch) return { success: false, error: mismatch };

  let recipients: Recipient[];
  try {
    recipients = await resolveRecipients(input.segmentType, input.segmentValue, audience);
  } catch (e: any) {
    return { success: false, error: `Could not resolve recipients: ${e?.message || e}` };
  }
  if (recipients.length === 0) {
    return { success: false, error: audience === 'all' ? 'No recipients match this segment.' : `No ${MARKET_LABEL[audience]} recipients match this segment.` };
  }

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
            // Each recipient's footer describes their own market.
            tagline: emailTagline(r.content),
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
  /** Market of the email's practice links, if any — refused if the person is in the other market. */
  contentMarket?: ContentMarket;
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

  let contentMarket: ContentMarket | undefined;
  try {
    contentMarket = parseContentMarket(input.contentMarket);
  } catch (e: any) {
    return { success: false, error: e?.message || 'Invalid practice market.' };
  }

  const db = createServiceClient();
  let { data: u, error: uErr } = await db.from('users').select('id, market').eq('email', email).maybeSingle();
  if (uErr && /market/i.test(uErr.message || '')) {
    ({ data: u } = await db.from('users').select('id').eq('email', email).maybeSingle());
  }
  // A known account in the other market could not open these practice links.
  const personMarket: ContentMarket | null = (u as any)?.id ? contentMarketOf((u as any).market) : null;
  if (contentMarket && personMarket && audienceProblem(personMarket, [contentMarket])) {
    return {
      success: false,
      error: `${email} has an account in the ${MARKET_LABEL[personMarket]} market, and this email links to ${MARKET_LABEL[contentMarket]} practice they can’t open. Rebuild it for ${MARKET_LABEL[personMarket]}.`,
    };
  }
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
        tagline: emailTagline(personMarket ?? contentMarket ?? 'IN'),
      });

  const result = await sendBulk([{ to: email, subject, html, listUnsubscribe: (u as any)?.id ? unsub : undefined }]);
  if (result.skipped) return { success: false, error: result.error || 'Email not configured (set RESEND_API_KEY or GMAIL_*).' };
  if ((result.failed ?? 0) > 0 || (result.sent ?? 0) === 0) return { success: false, error: 'Send failed — check the address and email config.' };
  return { success: true };
}

/* ───────────────────────────────────────────────────────────────────────────
 * Daily digest — auto-compose today's guesstimate + case + top news into a
 * ready-to-send email. Returns full HTML with a {{UNSUBSCRIBE}} token that
 * sendBroadcast fills in per recipient.
 *
 * The builder itself moved to lib/email/digest.ts (2026-11-11) so the nightly
 * cron can call it too. Everything in THIS file is a server action — publicly
 * reachable by RPC and gated on an admin session — which is exactly what a cron
 * cannot provide. The output is unchanged; only the subject line is now built
 * from the day's actual guesstimate instead of being the constant "Your MECE
 * practice for today".
 * ─────────────────────────────────────────────────────────────────────────── */
export async function generateDailyDigest(market: ContentMarket = 'IN', extra: number = 2): Promise<DigestResult> {
  await requireAdmin();
  let m: ContentMarket;
  try {
    m = parseContentMarket(market) ?? 'IN';
  } catch (e: any) {
    return { success: false, error: e?.message || 'Unknown market.' };
  }
  return buildDailyDigest(m, extra);
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
  /** Which audience the practice is for: India register or US register. */
  market: ContentMarket;
}): Promise<{ success: boolean; options?: any[]; kind?: string; market?: ContentMarket; error?: string }> {
  let token: string;
  try { token = await adminBearer(); } catch (e: any) { return { success: false, error: e?.message || 'Unauthorized' }; }
  if (!(input.topic || '').trim()) return { success: false, error: 'Enter a company or topic to generate around.' };
  let market: ContentMarket;
  try {
    market = parseContentMarket(input.market) ?? 'IN';
  } catch (e: any) {
    return { success: false, error: e?.message || 'Unknown market.' };
  }
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
        market,
      }),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) return { success: false, error: (data as any)?.detail || `Generation failed (${res.status}).` };
    // An older backend ignores `market` and answers in the India register; it
    // also omits `market` from the response. Refuse rather than mislabel it.
    if (market === 'US' && (data as any).market !== 'US') {
      return { success: false, error: 'The backend has not been updated for US practice yet (deploy the backend first).' };
    }
    const options = ((data as any).options || []).map((o: any) => ({ ...o, market: o?.market ?? market }));
    return { success: true, options, kind: (data as any).kind, market };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Could not reach the generator.' };
  }
}

export async function materializeBroadcastOption(input: {
  option: any;
  topic: string;
  market: ContentMarket;
}): Promise<{ success: boolean; case_id?: string; code?: string; title?: string; type?: string; difficulty?: string; url?: string; market?: ContentMarket; error?: string }> {
  let token: string;
  try { token = await adminBearer(); } catch (e: any) { return { success: false, error: e?.message || 'Unauthorized' }; }
  if (!input.option) return { success: false, error: 'No option selected.' };
  let market: ContentMarket;
  try {
    market = parseContentMarket(input.market) ?? 'IN';
  } catch (e: any) {
    return { success: false, error: e?.message || 'Unknown market.' };
  }
  try {
    const res = await fetch(`${BROADCAST_API}/broadcast/materialize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ option: input.option, topic: (input.topic || '').trim(), market }),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) return { success: false, error: (data as any)?.detail || `Save failed (${res.status}).` };
    if (market === 'US' && (data as any).market !== 'US') {
      return { success: false, error: 'The backend saved this as an India case (it has not been updated for US practice yet). Deploy the backend, then generate again.' };
    }
    const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://mece.in';
    const d = data as any;
    // Short shareable link (mece.in/p/<code>) when the backend returned a code;
    // fall back to the full /cases/<id> path for older rows without one.
    const url = d.code ? `${site}/p/${d.code}` : `${site}/cases/${d.case_id}`;
    return { success: true, case_id: d.case_id, code: d.code, title: d.title, type: d.type, difficulty: d.difficulty, url, market };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Could not save the option.' };
  }
}

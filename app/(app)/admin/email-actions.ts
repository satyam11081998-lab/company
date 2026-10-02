'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendBulk, unsubscribeUrl } from '@/lib/email/send';
import { broadcastEmail, baseEmailLayout, emailTagline } from '@/lib/email/templates';
import { contentMarketOf, marketToday, type ContentMarket } from '@/lib/market';
import { MARKET_LABEL, audienceProblem, inAudience, parseAudience, parseContentMarket, type Audience } from '@/lib/broadcast-audience';
import { marketScoped } from '@/lib/market-db';
import { usTypeLabel } from '@/lib/us-market/labels';
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

type DigestResult = { success: boolean; subject?: string; html?: string; note?: string; market?: ContentMarket; error?: string };

type DigestItem = { id: string; title: string; type: string; difficulty: string | null };

const DIGEST_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DIGEST_COLS = 'id, title, type, difficulty';

/** A daily-schedule ref is a case UUID or, for some generators, the short `code` (see lib/daily-server.ts). */
async function resolveCaseRef(db: ReturnType<typeof createServiceClient>, ref: string | null | undefined): Promise<DigestItem | null> {
  if (!ref) return null;
  const { data } = await db.from('cases').select(DIGEST_COLS).eq(DIGEST_UUID.test(ref) ? 'id' : 'code', ref).limit(1);
  return ((data as DigestItem[] | null) ?? [])[0] ?? null;
}

/**
 * The market's daily pair, exactly as its dashboard shows it: today's row, or
 * the most recent one before it when today's has not been written yet (the
 * India cron runs after IST midnight, and GitHub often starts it hours late).
 */
async function digestDailyPair(db: ReturnType<typeof createServiceClient>, market: ContentMarket) {
  const today = marketToday(market);
  let date: string | null = null;
  let caseRef: string | null = null;
  let guessRef: string | null = null;
  if (market === 'US') {
    const { data } = await db
      .from('market_daily_schedule')
      .select('case_id, guesstimate_id, scheduled_date')
      .eq('market', 'US')
      .lte('scheduled_date', today)
      .order('scheduled_date', { ascending: false })
      .limit(1);
    const row = ((data as any[] | null) ?? [])[0];
    if (row) ({ scheduled_date: date, case_id: caseRef, guesstimate_id: guessRef } = row);
  } else {
    const { data } = await db
      .from('daily_schedule')
      .select('case_id, guesstimate_code, scheduled_date')
      .lte('scheduled_date', today)
      .order('scheduled_date', { ascending: false })
      .limit(1);
    const row = ((data as any[] | null) ?? [])[0];
    if (row) ({ scheduled_date: date, case_id: caseRef, guesstimate_code: guessRef } = row);
  }
  const [c, g] = await Promise.all([resolveCaseRef(db, caseRef), resolveCaseRef(db, guessRef)]);
  return { today, date, case: c, guess: g };
}

/**
 * A stable hash (FNV-1a + murmur3's final mix), so a given day's picks are the
 * same every time the digest is rebuilt, and change from one day to the next.
 */
function digestHash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * `n` more practice items from the market's live bank (is_active only, so never
 * an unlisted broadcast case or someone's private case), different every day and
 * never repeating the daily pair.
 */
async function digestBankPicks(
  db: ReturnType<typeof createServiceClient>,
  market: ContentMarket,
  kind: 'case' | 'guesstimate',
  n: number,
  exclude: Set<string>,
  seed: string,
): Promise<DigestItem[]> {
  if (n <= 0) return [];
  const base = () => {
    const q = db.from('cases').select(DIGEST_COLS).eq('is_active', true);
    return kind === 'guesstimate' ? q.eq('type', 'guesstimate') : q.neq('type', 'guesstimate');
  };
  const { data } = await marketScoped(
    market,
    () => base().eq('market', market).order('created_at', { ascending: false }).limit(500),
    () => base().order('created_at', { ascending: false }).limit(500),
  );
  return ((data as DigestItem[] | null) ?? [])
    .filter((c) => c && c.id && c.title && !exclude.has(c.id))
    .map((c) => ({ c, k: digestHash(`${seed}:${c.id}`) }))
    .sort((a, b) => a.k - b.k)
    .slice(0, n)
    .map((x) => x.c);
}

function digestTypeLabel(item: DigestItem, market: ContentMarket): string {
  if (item.type === 'guesstimate') return market === 'US' ? 'Market sizing' : 'Guesstimate';
  const t = market === 'US' ? usTypeLabel(item.type) : item.type.replace(/_/g, ' ');
  return `Case · ${t.charAt(0).toUpperCase()}${t.slice(1)}`;
}

/** Compact list of extra practice links (one row per case / guesstimate). */
function digestMoreBlock(items: DigestItem[], market: ContentMarket): string {
  if (!items.length) return '';
  const rows = items
    .map((it, i) => {
      const href = `${_SITE}/cases/${it.id}`;
      const meta = [digestTypeLabel(it, market), it.difficulty ? `${it.difficulty.charAt(0).toUpperCase()}${it.difficulty.slice(1)}` : '']
        .filter(Boolean)
        .join(' · ');
      return `
      <tr><td style="padding:12px 20px ${i === items.length - 1 ? '16' : '12'}px;border-top:1px solid #F0ECE6;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;">
            <p style="margin:0 0 3px;font-size:12px;color:#5B6472;line-height:1.4;">${esc(meta)}</p>
            <a href="${href}" style="font-size:15px;font-weight:600;color:#0F1C33;text-decoration:none;line-height:1.35;">${esc(it.title)}</a>
          </td>
          <td align="right" style="vertical-align:middle;padding-left:14px;white-space:nowrap;">
            <a href="${href}" style="font-size:13px;font-weight:600;color:#C8102E;text-decoration:none;">Practice &rarr;</a>
          </td>
        </tr></table>
      </td></tr>`;
    })
    .join('');
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;border:1px solid #E7E3DC;border-radius:12px;">
    <tr><td style="padding:16px 20px 10px;">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#C8102E;">More practice${market === 'US' ? '' : ' from the case bank'}</p>
    </td></tr>${rows}
  </table>`;
}

/**
 * Today's digest for ONE market. Every digest links to real cases and
 * guesstimates — today's daily pair (the same one the market's dashboard shows)
 * plus `extra` more of each from that market's bank, different every day — and
 * never only to the dashboard. India adds the GD news block; US & Europe uses US
 * copy and no GD block (GD briefs are an India-only product).
 */
export async function generateDailyDigest(market: ContentMarket = 'IN', extra: number = 2): Promise<DigestResult> {
  await requireAdmin();
  let m: ContentMarket;
  try {
    m = parseContentMarket(market) ?? 'IN';
  } catch (e: any) {
    return { success: false, error: e?.message || 'Unknown market.' };
  }
  const nExtra = Math.max(0, Math.min(4, Math.floor(Number(extra) || 0)));
  const us = m === 'US';
  try {
    const db = createServiceClient();
    const pair = await digestDailyPair(db, m);
    const seed = `${m}:${pair.today}`;
    const exclude = new Set([pair.case?.id, pair.guess?.id].filter(Boolean) as string[]);
    // One more of each kind is fetched in case the daily pair is missing and a
    // bank pick has to stand in for it.
    const [moreCases, moreGuesses] = await Promise.all([
      digestBankPicks(db, m, 'case', nExtra + (pair.case ? 0 : 1), exclude, seed),
      digestBankPicks(db, m, 'guesstimate', nExtra + (pair.guess ? 0 : 1), exclude, seed),
    ]);
    const headCase = pair.case ?? moreCases.shift() ?? null;
    const headGuess = pair.guess ?? moreGuesses.shift() ?? null;
    const caseIsDaily = !!pair.case;
    const guessIsDaily = !!pair.guess;

    const more: DigestItem[] = [];
    for (let i = 0; i < Math.max(moreCases.length, moreGuesses.length); i++) {
      if (moreCases[i]) more.push(moreCases[i]);
      if (moreGuesses[i]) more.push(moreGuesses[i]);
    }

    let body: string;
    if (us) {
      body = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1A2233;">Here&rsquo;s today&rsquo;s pair${more.length ? ', plus a few more from the case bank if you have time' : ''}. Work through each like a real interview, then see your score.</p>`;
      if (headCase) {
        const diff = headCase.difficulty ? ` · ${esc(headCase.difficulty)}` : '';
        body += digestCard(`${caseIsDaily ? 'Today’s case' : 'Case to practice'}${diff}`, headCase.title, 'Clarify, structure, run the numbers and make a recommendation. The MECE interviewer pushes back, then scores you.', `${_SITE}/cases/${headCase.id}`, 'Start the case');
      }
      if (headGuess) {
        body += digestCard(guessIsDaily ? 'Today’s market sizing' : 'Market sizing to practice', headGuess.title, 'Build your estimate step by step, state your assumptions and land on a number you can defend.', `${_SITE}/cases/${headGuess.id}`, 'Practice market sizing');
      }
    } else {
      body = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1A2233;">${more.length ? 'Here&rsquo;s today&rsquo;s set — the daily guesstimate and case, plus a few more from the case bank if you have time.' : 'Here&rsquo;s the set — about 10 focused minutes, start to finish.'}</p>`;
      if (headGuess) {
        body += digestCard(guessIsDaily ? 'Today’s guesstimate' : 'Guesstimate to practise', headGuess.title, 'Build your estimate step by step, make your assumptions explicit, and arrive at a defendable number.', `${_SITE}/cases/${headGuess.id}`, 'Practice the guesstimate');
      }
      if (headCase) {
        const diff = headCase.difficulty ? ` · ${esc(headCase.difficulty)}` : '';
        body += digestCard(`${caseIsDaily ? 'Today’s case' : 'Case to practise'}${diff}`, headCase.title, 'Clarify, structure, quantify, and recommend — then get scored by the MECE AI interviewer.', `${_SITE}/cases/${headCase.id}`, 'Start the case');
      }
    }
    if (!headCase && !headGuess) {
      // Only when the bank itself is empty: never the normal outcome.
      body += digestCard('Practice', us ? 'Your daily case and market sizing question' : 'Your daily case & guesstimate', 'Open MECE to practise.', `${_SITE}/practice`, 'Open practice');
    }
    body += digestMoreBlock(more, m);

    if (!us) {
      // Top news from the last ~2 days for the GD angle (India only).
      const since = new Date(Date.now() - 2 * 86_400_000).toISOString();
      const { data: news } = await db
        .from('news_headlines')
        .select('title, source_name')
        .gte('published_at', since)
        .order('published_at', { ascending: false })
        .limit(3);
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
    }

    body += `<p style="margin:16px 0 0;font-size:14px;color:#5B6472;line-height:1.6;">That&rsquo;s it for today. Keep practicing.</p>`;

    const html = baseEmailLayout({
      preheader: us ? 'A fresh case and market sizing question to sharpen your thinking.' : 'A fresh guesstimate and case to sharpen your thinking.',
      heading: 'Your MECE practice for today',
      contentHtml: body,
      unsubscribeUrl: '{{UNSUBSCRIBE}}',
      ...(us ? { tagline: emailTagline('US') } : {}),
    });

    const label = us ? 'US' : 'India';
    const zone = us ? 'US Eastern' : 'IST';
    const total = [headCase, headGuess].filter(Boolean).length + more.length;
    let note: string;
    if (!pair.date) {
      note = `No ${label} daily pair has been scheduled yet, so all ${total} links come from the ${label} case bank.`;
    } else if (pair.date !== pair.today) {
      note = `${label} digest built with ${total} practice links. Today’s ${label} pair (${pair.today}, ${zone}) isn’t scheduled yet — the daily job runs after midnight and often starts late — so this uses the latest one (${pair.date}), which is what ${label} users see on their dashboard right now.`;
    } else {
      note = `${label} digest built with ${total} practice links — today’s pair plus ${more.length} from the bank. Preview it on the right, then send.`;
    }
    if (!pair.case && pair.date) note += ` The scheduled case could not be found, so a bank case stands in.`;
    if (!pair.guess && pair.date) note += ` The scheduled ${us ? 'market sizing question' : 'guesstimate'} could not be found, so a bank one stands in.`;
    return { success: true, subject: 'Your MECE practice for today', html, note, market: m };
  } catch (e: any) {
    return { success: false, error: e?.message || `Could not build the ${us ? 'US' : 'India'} digest.` };
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

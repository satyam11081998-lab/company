/**
 * Daily digest builder — today's guesstimate + case + (India) the GD news block,
 * as a complete email document with a `{{UNSUBSCRIBE}}` token per recipient.
 *
 * Moved out of app/(app)/admin/email-actions.ts (2026-11-11) for one reason: that
 * file is `'use server'`, so every export in it is a publicly callable server
 * action and nothing in it can run without an admin session. The nightly cron has
 * no session, so the builder lives here as a plain module and the admin action is
 * now a thin wrapper around it. Identical output — the admin preview is unchanged.
 *
 * Pure except for reads. Never sends; never writes.
 */
import { createServiceClient } from '@/lib/supabase/service';
import { baseEmailLayout, emailTagline } from '@/lib/email/templates';
import { marketToday, type ContentMarket } from '@/lib/market';
import { marketScoped } from '@/lib/market-db';
import { usTypeLabel } from '@/lib/us-market/labels';

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

export type DigestResult = {
  success: boolean;
  subject?: string;
  html?: string;
  note?: string;
  market?: ContentMarket;
  error?: string;
  /** Set when the build succeeded: what the digest actually points at. */
  picked?: { caseId: string | null; caseTitle: string | null; guessId: string | null; guessTitle: string | null; date: string };
};

export type DigestItem = { id: string; title: string; type: string; difficulty: string | null };

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

/* ───────────────────────────────────────────────────────────────────────────
 * Subject line.
 *
 * The old subject was the constant "Your MECE practice for today". A constant
 * subject is the worst case on two counts at once: on a phone the notification
 * says nothing (so it is ignored), and Gmail groups a repeated subject from a
 * repeated sender into one Promotions thread.
 *
 * So the subject IS the question. It leads with the real guesstimate title, which
 * changes every day, and the framing rotates on a hash of the date so two
 * consecutive days never read the same way. Nothing here is brand-prefixed:
 * "MECE:" in front of a subject buys nothing and costs the first 5 characters of
 * the notification.
 * ─────────────────────────────────────────────────────────────────────────── */

/** Trim to a mobile notification's useful width, on a word boundary. */
function clip(s: string, max = 78): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[,;:.\s]+$/, '')}…`;
}

/**
 * Strip a leading "Estimate the…" scaffold down to the subject itself. Used by the
 * preheader, where the title is being quoted mid-sentence; the subject line
 * leaves the title exactly as written.
 */
function coreOf(title: string): string {
  return title
    .replace(/\s+/g, ' ')
    .replace(/^\s*(estimate|guesstimate|calculate|work out|figure out)\s+(the\s+)?/i, '')
    .replace(/[.?!]\s*$/, '')
    .trim();
}

/**
 * The framings. Every one of these only ADDS to the question — none of them
 * rewrites it. That is the whole trick: the generator phrases a title either as
 * "Estimate the number of…" or as "How many…?", and a prefix that assumes one
 * shape reads broken against the other ("Today's number: number of air
 * purifiers…"). Appending, or prefixing with a bare time word, is grammatical
 * against both.
 */
const FRAMINGS: ((q: string) => string)[] = [
  (q) => q,
  (q) => `${q} — ten minutes, start to finish`,
  (q) => `Tonight: ${q}`,
];

/**
 * Subject for one day's digest.
 *
 * Deterministic, so a preview and a re-send never disagree with what went out —
 * and rotated on the DAY NUMBER rather than on a hash of the date. A hash
 * collides: two days running would land on the same framing roughly a fifth of
 * the time, which is exactly the repetition this is meant to remove. A day index
 * cycles cleanly and can never repeat on consecutive days.
 */
export function dailySubject(market: ContentMarket, guessTitle: string | null, caseTitle: string | null, dateKey: string): string {
  const lead = (guessTitle || caseTitle || '').replace(/\s+/g, ' ').trim();
  // No content at all — the only case where a generic subject is honest.
  if (!lead) return market === 'US' ? 'Your case practice for today' : 'Your practice for today';
  const day = Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / 86_400_000);
  const i = Number.isFinite(day) ? ((day % FRAMINGS.length) + FRAMINGS.length) % FRAMINGS.length : 0;
  return clip(FRAMINGS[i](lead));
}

/** Preheader (the grey line next to the subject in the inbox). Also varies. */
function dailyPreheader(market: ContentMarket, caseTitle: string | null, dateKey: string): string {
  const us = market === 'US';
  const opts = caseTitle
    ? [
        `Plus today's case: ${coreOf(caseTitle)}.`,
        `Today's case is in here too — ${coreOf(caseTitle)}.`,
        `And a full case: ${coreOf(caseTitle)}.`,
      ]
    : us
      ? ['A fresh case and market sizing question to sharpen your thinking.']
      : ['A fresh guesstimate and case to sharpen your thinking.'];
  return clip(opts[digestHash(`pre:${market}:${dateKey}`) % opts.length], 110);
}

/**
 * Today's digest for ONE market. Every digest links to real cases and
 * guesstimates — today's daily pair (the same one the market's dashboard shows)
 * plus `extra` more of each from that market's bank, different every day — and
 * never only to the dashboard. India adds the GD news block; US & Europe uses US
 * copy and no GD block (GD briefs are an India-only product).
 *
 * No authentication: callers decide who may run it. The admin action gates on
 * is_admin; the nightly cron gates on CRON_SECRET.
 */
export async function buildDailyDigest(market: ContentMarket = 'IN', extra: number = 2): Promise<DigestResult> {
  const m: ContentMarket = market === 'US' ? 'US' : 'IN';
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
        const items = (news as any[])
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

    const dateKey = pair.date || pair.today;
    const subject = dailySubject(m, headGuess?.title ?? null, headCase?.title ?? null, dateKey);

    const html = baseEmailLayout({
      preheader: dailyPreheader(m, headCase?.title ?? null, dateKey),
      // The heading stays stable inside the email — it is the subject line that
      // has to earn the open, and a heading that repeats the subject wastes the
      // first line of the body.
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
    return {
      success: true,
      subject,
      html,
      note,
      market: m,
      picked: {
        caseId: headCase?.id ?? null,
        caseTitle: headCase?.title ?? null,
        guessId: headGuess?.id ?? null,
        guessTitle: headGuess?.title ?? null,
        date: dateKey,
      },
    };
  } catch (e: any) {
    return { success: false, error: e?.message || `Could not build the ${us ? 'US' : 'India'} digest.` };
  }
}

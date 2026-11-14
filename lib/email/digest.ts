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
import { statutoryIdentityLines } from '@/lib/legal/company';
import { renderDailyLetter } from '@/lib/email/digest-letter';
import { marketToday, type ContentMarket } from '@/lib/market';
import { marketScoped } from '@/lib/market-db';

// Same default as lib/email/send.ts. It was 'https://mece.in', so every link in
// the digest pointed at a redirect — one more thing a spam filter counts.
const _SITE = ((process.env.NEXT_PUBLIC_SITE_URL || '').trim() || 'https://www.mece.in').replace(/\/+$/, '');

export type DigestResult = {
  success: boolean;
  subject?: string;
  html?: string;
  /** The hand-written text/plain part. */
  text?: string;
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

// The subject, preview line and body live in ./digest-letter (pure, tested).
export { dailySubject } from '@/lib/email/digest-letter';

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
    // India only: the top headline from the last ~2 days, for the GD line.
    let headline: string | null = null;
    if (!us) {
      const since = new Date(Date.now() - 2 * 86_400_000).toISOString();
      const { data: news } = await db
        .from('news_headlines')
        .select('title')
        .gte('published_at', since)
        .order('published_at', { ascending: false })
        .limit(1);
      headline = ((news as Array<{ title: string }> | null)?.[0]?.title as string) ?? null;
    }

    const dateKey = pair.date || pair.today;
    const letter = renderDailyLetter({
      market: m,
      site: _SITE,
      dateKey,
      guess: headGuess ? { id: headGuess.id, title: headGuess.title } : null,
      kase: headCase ? { id: headCase.id, title: headCase.title, difficulty: headCase.difficulty } : null,
      headline,
      identity: statutoryIdentityLines(),
      unsubscribe: '{{UNSUBSCRIBE}}',
    });
    const subject = letter.subject;
    const html = letter.html;
    const text = letter.text;

    const label = us ? 'US' : 'India';
    const zone = us ? 'US Eastern' : 'IST';
    const total = letter.links;
    let note: string;
    if (!pair.date) {
      note = `No ${label} daily pair has been scheduled yet, so all ${total} links come from the ${label} case bank.`;
    } else if (pair.date !== pair.today) {
      note = `${label} digest built with ${total} practice links. Today’s ${label} pair (${pair.today}, ${zone}) isn’t scheduled yet — the daily job runs after midnight and often starts late — so this uses the latest one (${pair.date}), which is what ${label} users see on their dashboard right now.`;
    } else {
      note = `${label} digest built with ${total} practice links — a plain letter, no images. Preview it on the right, then send.`;
    }
    if (!pair.case && pair.date) note += ` The scheduled case could not be found, so a bank case stands in.`;
    if (!pair.guess && pair.date) note += ` The scheduled ${us ? 'market sizing question' : 'guesstimate'} could not be found, so a bank one stands in.`;
    return {
      success: true,
      subject,
      html,
      text,
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

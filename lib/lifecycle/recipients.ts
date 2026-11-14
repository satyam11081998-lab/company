/**
 * Who gets which lifecycle email.
 *
 * Segmentation is DETERMINISTIC — plain SQL reads and set arithmetic, no model
 * call. That is deliberate: a model asked "why did this person leave?" from a
 * row count will invent a reason, and an invented reason produces a worse email
 * than the honest one ("you started this and didn't finish"). The behaviour is
 * the message.
 *
 * At MECE's scale the pool is fetched and classified in memory, the same way
 * admin/email-actions.ts does it. Revisit with SQL if the base grows large.
 *
 * Server-only.
 */
import { createServiceClient } from '@/lib/supabase/service';
import { contentMarketOf, type ContentMarket } from '@/lib/market';

export interface LifecycleUser {
  id: string;
  email: string;
  name: string | null;
  market: ContentMarket;
  createdAt: string | null;
  tier: string;
}

/** The behavioural buckets. One user lands in at most one of them. */
export type NudgeKind =
  /** Opened a case, produced turns, never submitted. The biggest bucket, and the only one worth an email. */
  | 'abandoned'
  /** Submitted at least one case and hasn't been back. */
  | 'finished'
  /** Signed up, never opened a case at all. */
  | 'never_started';

export interface NudgeTarget {
  user: LifecycleUser;
  kind: NudgeKind;
  /** The case they walked away from / last finished, when there is one. */
  caseId: string | null;
  caseTitle: string | null;
  /** Their score on the last submitted case (finished only). */
  score: number | null;
  /** Days since the behaviour that put them in this bucket. */
  daysAgo: number;
}

const USER_COLS = 'id, email, name, subscription_tier, marketing_opt_out, created_at';
const USER_FETCH_LIMIT = 5000;
const ROW_FETCH_LIMIT = 5000;

/**
 * Every account that may receive marketing email, for one market.
 * `marketing_opt_out` is honoured here and again at send time.
 */
export async function optedInUsers(market: ContentMarket): Promise<LifecycleUser[]> {
  const db = createServiceClient();
  // The limit is explicit because PostgREST caps a response at 1000 rows by
  // default, and an unbounded select would truncate there without saying so —
  // which, for an audience query, means quietly not emailing people.
  let { data, error }: { data: any; error: any } = await db.from('users').select(`${USER_COLS}, market`).limit(USER_FETCH_LIMIT);
  if (error && /market/i.test(error.message || '')) {
    // Before migration 0070 there is no users.market: every account is India.
    ({ data, error } = await db.from('users').select(USER_COLS).limit(USER_FETCH_LIMIT));
    if (!error && market === 'US') return [];
  }
  if (error) throw new Error(error.message);
  if ((data as any[] | null)?.length === USER_FETCH_LIMIT) {
    console.warn(`[lifecycle] users fetch hit the ${USER_FETCH_LIMIT}-row limit — move segmentation into SQL before the base grows further.`);
  }
  return ((data as any[]) || [])
    .filter((u) => u?.email && !u.marketing_opt_out)
    .map((u) => ({
      id: u.id as string,
      email: String(u.email).toLowerCase(),
      name: (u.name as string) ?? null,
      market: contentMarketOf(u.market),
      createdAt: (u.created_at as string) ?? null,
      tier: (u.subscription_tier as string) || 'free',
    }))
    .filter((u) => u.market === market);
}

/** Rows we can read without caring whether a given column exists yet. */
async function softRows<T>(fn: () => PromiseLike<{ data: any; error: any }>): Promise<T[]> {
  try {
    const { data, error } = await fn();
    if (error) return [];
    return (data as T[]) || [];
  } catch {
    return [];
  }
}

const DAY = 86_400_000;
const days = (iso: string | null | undefined) =>
  iso ? Math.floor((Date.now() - new Date(iso).getTime()) / DAY) : Number.POSITIVE_INFINITY;

/**
 * Classify a market's users into the three buckets.
 *
 * The windows are chosen so an email is useful rather than annoying:
 *   abandoned     — 1 to 10 days since the unfinished attempt. Earlier than a day
 *                   and they may still be mid-session; later than ten and the
 *                   context is gone.
 *   finished      — 3 to 21 days since their last submit, and nothing since.
 *   never_started — 1 to 14 days since signup, zero attempts.
 *
 * Anyone already emailed for the same bucket inside `cooldownDays` is dropped, so
 * nobody gets the same nudge twice. The cooldown is read from crm_outbox, which
 * is the only record of what actually went out.
 */
export async function nudgeTargets(market: ContentMarket, cooldownDays = 21): Promise<NudgeTarget[]> {
  const users = await optedInUsers(market);
  if (!users.length) return [];
  const byId = new Map(users.map((u) => [u.id, u]));

  const db = createServiceClient();

  // Live sessions (an attempt row is created when a case is opened) …
  const attempts = await softRows<{ user_id: string; case_id: string | null; created_at: string }>(() =>
    db
      .from('attempts')
      .select('user_id, case_id, created_at')
      .gte('created_at', new Date(Date.now() - 45 * DAY).toISOString())
      .order('created_at', { ascending: false })
      .limit(ROW_FETCH_LIMIT),
  );
  // … and the submits. `case_attempts` is written on submit; `submissions` is the
  // older record. Either one means "they finished something".
  const [caseAttempts, submissions] = await Promise.all([
    softRows<{ user_id: string; case_id: string | null; score: number | null; created_at: string }>(() =>
      db
        .from('case_attempts')
        .select('user_id, case_id, score, created_at')
        .order('created_at', { ascending: false })
        .limit(ROW_FETCH_LIMIT),
    ),
    softRows<{ user_id: string; created_at: string }>(() =>
      db.from('submissions').select('user_id, created_at').order('created_at', { ascending: false }).limit(ROW_FETCH_LIMIT),
    ),
  ]);

  /** newest-first arrays → first hit per user is their latest */
  const latestAttempt = new Map<string, { case_id: string | null; created_at: string }>();
  for (const a of attempts) if (a.user_id && !latestAttempt.has(a.user_id)) latestAttempt.set(a.user_id, a);

  const latestSubmit = new Map<string, { case_id: string | null; score: number | null; created_at: string }>();
  for (const s of caseAttempts) if (s.user_id && !latestSubmit.has(s.user_id)) latestSubmit.set(s.user_id, s);
  for (const s of submissions) {
    if (!s.user_id) continue;
    const have = latestSubmit.get(s.user_id);
    if (!have || new Date(s.created_at) > new Date(have.created_at)) {
      latestSubmit.set(s.user_id, { case_id: null, score: null, created_at: s.created_at });
    }
  }

  // The set of (user, case) pairs that WERE submitted, so an attempt on a case
  // the user later finished is not "abandoned".
  const submittedPairs = new Set(caseAttempts.filter((s) => s.case_id).map((s) => `${s.user_id}:${s.case_id}`));

  // Case titles for the ones we are going to mention by name.
  const wantedCaseIds = [...new Set([...latestAttempt.values(), ...latestSubmit.values()].map((x) => x.case_id).filter(Boolean) as string[])];
  const titles = new Map<string, string>();
  for (let i = 0; i < wantedCaseIds.length; i += 200) {
    const rows = await softRows<{ id: string; title: string }>(() =>
      db.from('cases').select('id, title').in('id', wantedCaseIds.slice(i, i + 200)),
    );
    for (const r of rows) if (r.title) titles.set(r.id, r.title);
  }

  // Cooldown: who already received each nudge kind recently.
  const since = new Date(Date.now() - cooldownDays * DAY).toISOString();
  const recentSends = await softRows<{ to_email: string; source_id: string | null }>(() =>
    db
      .from('crm_outbox')
      .select('to_email, source_id')
      .gte('created_at', since)
      .like('source_id', 'lifecycle:%')
      .limit(ROW_FETCH_LIMIT),
  );
  const alreadySent = new Set(recentSends.map((r) => `${r.to_email}|${r.source_id}`));

  const out: NudgeTarget[] = [];
  for (const u of byId.values()) {
    const att = latestAttempt.get(u.id);
    const sub = latestSubmit.get(u.id);
    const subAge = days(sub?.created_at);
    const attAge = days(att?.created_at);

    let kind: NudgeKind | null = null;
    let caseId: string | null = null;
    let score: number | null = null;
    let daysAgo = 0;

    if (att && !submittedPairs.has(`${u.id}:${att.case_id}`) && attAge >= 1 && attAge <= 10 && subAge > attAge) {
      // Started something, never finished it, and hasn't submitted anything since.
      kind = 'abandoned';
      caseId = att.case_id;
      daysAgo = attAge;
    } else if (sub && subAge >= 3 && subAge <= 21 && attAge >= subAge) {
      // Finished, nothing since.
      kind = 'finished';
      caseId = sub.case_id;
      score = typeof sub.score === 'number' ? sub.score : null;
      daysAgo = subAge;
    } else if (!att && !sub) {
      const age = days(u.createdAt);
      if (age >= 1 && age <= 14) {
        kind = 'never_started';
        daysAgo = age;
      }
    }
    if (!kind) continue;
    if (alreadySent.has(`${u.email}|lifecycle:${kind}`)) continue;

    out.push({ user: u, kind, caseId, caseTitle: caseId ? titles.get(caseId) ?? null : null, score, daysAgo });
  }

  // Freshest behaviour first: a one-day-old abandon is worth far more than a
  // nine-day-old one, and the cap should spend itself on the good ones.
  const rank: Record<NudgeKind, number> = { abandoned: 0, never_started: 1, finished: 2 };
  return out.sort((a, b) => rank[a.kind] - rank[b.kind] || a.daysAgo - b.daysAgo);
}

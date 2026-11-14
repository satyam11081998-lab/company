/**
 * Upgrade emails — the database half. Finds the people, writes DRAFTS into the
 * CRM outbox as `pending`, and sends only the drafts a person approves.
 *
 * Nothing in this file sends on a schedule. There is deliberately no cron for
 * upgrade mail: every one of these asks somebody for money using their own
 * numbers, and a wrong number in that sentence is worse than no email. A human
 * reads each draft first.
 *
 * India only. The US price list and checkout are separate (lib/pricing-intl.ts)
 * and the US site is switched off; quoting rupees to a US account would be wrong.
 *
 * Server-only.
 */
import { createServiceClient } from '@/lib/supabase/service';
import { sendBulk, unsubscribeUrl } from '@/lib/email/send';
import { suppressionReason } from '@/lib/crm/server/outbox';
import { contentMarketOf } from '@/lib/market';
import { TIER_PRICING, periodSavingPct } from '@/lib/tier';
import { prepare, type PrepareRow } from './run';
import { readLifecycleSettings } from './settings';
import type { LifecycleUser } from './recipients';
import { classifyUpgrade, renderUpgrade, whyLine, UPGRADE_LABEL, type Offer, type UpgradeFacts, type UpgradeSegment } from './upgrade-copy';
import type { UpgradeDraft, UpgradeScan } from './types';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mece.in').replace(/\/+$/, '');
const DAY = 86_400_000;
const FETCH_LIMIT = 5000;
/** Nobody gets a second upgrade email inside this window, whatever the segment. */
const COOLDOWN_DAYS = 30;
/** One drafting pass never writes more than this; review does not scale past it anyway. */
const MAX_DRAFTS = 150;
const SOURCE = 'lifecycle:upgrade:';

export function currentOffer(): Offer {
  return {
    liteMonthly: TIER_PRICING.lite.monthly,
    proMonthly: TIER_PRICING.pro.monthly,
    proQuarter: TIER_PRICING.pro.quarter,
    proQuarterSaving: periodSavingPct('pro', 'quarter'),
  };
}

export interface UpgradeTarget {
  user: LifecycleUser;
  facts: UpgradeFacts;
}

async function soft<T>(fn: () => PromiseLike<{ data: any; error: any }>): Promise<T[]> {
  try {
    const { data, error } = await fn();
    return error ? [] : ((data as T[]) || []);
  } catch {
    return [];
  }
}

/** Everyone who currently warrants an upgrade email, best prospects first. */
export async function upgradeTargets(): Promise<UpgradeTarget[]> {
  const db = createServiceClient();
  const cols = 'id, email, name, subscription_tier, subscription_expires_at, marketing_opt_out, created_at';
  let { data, error }: { data: any; error: any } = await db.from('users').select(`${cols}, market`).limit(FETCH_LIMIT);
  if (error && /market/i.test(error.message || '')) ({ data, error } = await db.from('users').select(cols).limit(FETCH_LIMIT));
  if (error) throw new Error(error.message);
  const users = ((data as any[]) || []).filter((u) => u?.email && !u.marketing_opt_out && contentMarketOf(u.market) === 'IN');
  if (!users.length) return [];

  const submits = await soft<{ user_id: string; case_id: string | null; score: number | null; created_at: string }>(() =>
    db.from('case_attempts').select('user_id, case_id, score, created_at').order('created_at', { ascending: true }).limit(FETCH_LIMIT * 4),
  );
  const byUser = new Map<string, typeof submits>();
  for (const s of submits) {
    if (!s.user_id) continue;
    const a = byUser.get(s.user_id);
    if (a) a.push(s);
    else byUser.set(s.user_id, [s]);
  }

  // Titles only for each user's latest case — the one the email names.
  const lastIds = [...new Set([...byUser.values()].map((a) => a[a.length - 1].case_id).filter(Boolean) as string[])];
  const titles = new Map<string, string>();
  for (let i = 0; i < lastIds.length; i += 200) {
    for (const r of await soft<{ id: string; title: string }>(() => db.from('cases').select('id, title').in('id', lastIds.slice(i, i + 200)))) {
      if (r.title) titles.set(r.id, r.title);
    }
  }

  // Everything already drafted or sent. Rejected drafts do not count: a person
  // rejecting a draft is a verdict on the wording, not on the recipient.
  const prior = await soft<{ to_email: string; source_id: string | null; created_at: string; status: string }>(() =>
    db.from('crm_outbox').select('to_email, source_id, created_at, status').like('source_id', `${SOURCE}%`).neq('status', 'rejected').limit(FETCH_LIMIT),
  );
  const recent = new Set<string>();
  const everLite = new Set<string>();
  for (const p of prior) {
    const mail = String(p.to_email).toLowerCase();
    if (Date.now() - new Date(p.created_at).getTime() <= COOLDOWN_DAYS * DAY) recent.add(mail);
    // The Lite email promises "I won't send it again". Keep the promise.
    if (p.source_id === `${SOURCE}lite_to_pro`) everLite.add(mail);
  }

  const out: UpgradeTarget[] = [];
  for (const u of users) {
    const email = String(u.email).toLowerCase();
    if (recent.has(email)) continue;
    const mine = byUser.get(u.id) ?? [];
    const tier = u.subscription_tier === 'lite' || u.subscription_tier === 'pro' ? u.subscription_tier : 'free';
    const facts = classifyUpgrade({
      storedTier: tier,
      expiresAt: (u.subscription_expires_at as string) ?? null,
      submits: mine.map((s) => ({ at: s.created_at, score: typeof s.score === 'number' ? s.score : null, title: s.case_id ? titles.get(s.case_id) ?? null : null })),
    });
    if (!facts) continue;
    if (facts.segment === 'lite_to_pro' && everLite.has(email)) continue;
    out.push({
      user: { id: u.id, email, name: (u.name as string) ?? null, market: 'IN', createdAt: (u.created_at as string) ?? null, tier },
      facts,
    });
  }

  // Money that is about to leave first, then the people most in use of the product.
  const rank: Record<UpgradeSegment, number> = { expiring: 0, lapsed: 1, improving: 2, plateau: 3, habit: 4, lite_to_pro: 5 };
  return out.sort((a, b) => rank[a.facts.segment] - rank[b.facts.segment] || b.facts.last30 - a.facts.last30);
}

/** Count and sample, writing nothing. */
export async function scanUpgrades(): Promise<UpgradeScan> {
  const targets = await upgradeTargets();
  const offer = currentOffer();
  const by = new Map<UpgradeSegment, UpgradeScan['segments'][number]>();
  for (const t of targets) {
    let row = by.get(t.facts.segment);
    if (!row) {
      const m = renderUpgrade(t.facts, t.user, offer, SITE, '#');
      row = { segment: t.facts.segment, label: UPGRADE_LABEL[t.facts.segment], count: 0, sampleSubject: m.subject, sampleHtml: m.html, sampleWhy: whyLine(t.facts) };
      by.set(t.facts.segment, row);
    }
    row.count += 1;
  }
  return { total: targets.length, segments: [...by.values()] };
}

/** Write one pending draft per target. Safe to run twice: the dedupe key is per person per day. */
export async function draftUpgrades(): Promise<{ drafted: number; duplicate: number; suppressed: number; capped: number; error?: string }> {
  const all = await upgradeTargets();
  const targets = all.slice(0, MAX_DRAFTS);
  const offer = currentOffer();
  const day = new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
  const rows: PrepareRow[] = targets.map((t) => {
    const m = renderUpgrade(t.facts, t.user, offer, SITE, '{{UNSUBSCRIBE}}');
    return {
      user: t.user,
      to: t.user.email,
      subject: m.subject,
      html: m.html,
      text: m.text,
      dedupeKey: `${SOURCE}${t.user.id}:${day}`,
      sourceId: `${SOURCE}${t.facts.segment}`,
      why: whyLine(t.facts),
    };
  });
  const s = await readLifecycleSettings();
  const prep = await prepare(rows, { openPixel: s.openPixel, dryRun: false, status: 'pending' });
  return { drafted: prep.msgs.length, duplicate: prep.duplicate, suppressed: prep.suppressed, capped: all.length - targets.length, error: prep.error };
}

/** The review queue. */
export async function listUpgradeDrafts(): Promise<UpgradeDraft[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from('crm_outbox')
    .select('id, to_email, to_name, subject, html, source_id, status_reason, created_at')
    .eq('status', 'pending')
    .like('source_id', `${SOURCE}%`)
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);
  return ((data as any[]) || []).map((r) => {
    const segment = String(r.source_id).slice(SOURCE.length) as UpgradeSegment;
    return {
      id: r.id,
      to: r.to_email,
      name: r.to_name ?? null,
      subject: r.subject,
      html: r.html,
      segment,
      label: UPGRADE_LABEL[segment] ?? segment,
      why: r.status_reason ?? '',
      createdAt: r.created_at,
    };
  });
}

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

/** Reject drafts. They stay in the outbox as a record and are never sent. */
export async function rejectUpgradeDrafts(ids: string[], actorId: string): Promise<number> {
  const list = ids.filter(isUuid).slice(0, 300);
  if (!list.length) return 0;
  const db = createServiceClient();
  const { data, error } = await db
    .from('crm_outbox')
    .update({ status: 'rejected', decided_by: actorId, decided_at: new Date().toISOString(), status_reason: 'rejected in review' })
    .in('id', list)
    .eq('status', 'pending')
    .like('source_id', `${SOURCE}%`)
    .select('id');
  if (error) throw new Error(error.message);
  return (data ?? []).length;
}

/**
 * Send one draft to the TEST address instead of its recipient. The draft itself
 * is untouched and stays pending.
 */
export async function testUpgradeDraft(id: string): Promise<{ ok: boolean; to?: string; error?: string }> {
  if (!isUuid(id)) return { ok: false, error: 'Unknown draft.' };
  const s = await readLifecycleSettings();
  if (!s.testEmail) return { ok: false, error: 'Set a test address first.' };
  const db = createServiceClient();
  const { data } = await db.from('crm_outbox').select('subject, html, text_body').eq('id', id).eq('status', 'pending').like('source_id', `${SOURCE}%`).maybeSingle();
  const m = data as { subject: string; html: string; text_body: string | null } | null;
  if (!m) return { ok: false, error: 'That draft is no longer pending.' };
  const r = await sendBulk([{ to: s.testEmail, subject: m.subject, html: m.html, text: m.text_body ?? undefined, listUnsubscribe: `${SITE}/api/unsubscribe`, replyTo: s.replyTo || undefined }]);
  return r.sent === 1 ? { ok: true, to: s.testEmail } : { ok: false, error: r.error || 'The mail transport refused it.' };
}

/**
 * Approve and send. Each row is claimed atomically (pending → sending), so two
 * people approving the same draft, or one double click, send it once.
 *
 * Re-checked at send time, because a draft can sit in review for days:
 *   · the address is not on the privacy blocklist,
 *   · the person has not unsubscribed since the draft was written,
 *   · the person has not ALREADY bought what the email is selling.
 */
export async function approveUpgradeDrafts(ids: string[], actorId: string): Promise<{ sent: number; failed: number; skipped: number; error?: string }> {
  const out = { sent: 0, failed: 0, skipped: 0 } as { sent: number; failed: number; skipped: number; error?: string };
  const list = ids.filter(isUuid).slice(0, 100);
  if (!list.length) return out;
  const s = await readLifecycleSettings();
  if (s.mode === 'off') return { ...out, error: 'Email is switched off. Set the mode to manual or auto before sending.' };
  const db = createServiceClient();

  for (const id of list) {
    const { data: claimed } = await db
      .from('crm_outbox')
      .update({ status: 'sending', decided_by: actorId, decided_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending')
      .like('source_id', `${SOURCE}%`)
      .select('id, to_email, subject, html, text_body, source_id')
      .maybeSingle();
    const m = claimed as { id: string; to_email: string; subject: string; html: string; text_body: string | null; source_id: string } | null;
    if (!m) continue;

    const skip = async (reason: string) => {
      await db.from('crm_outbox').update({ status: 'suppressed', status_reason: `at send time: ${reason}` }).eq('id', m.id);
      out.skipped += 1;
    };

    if (await suppressionReason(db, null, m.to_email, 'marketing')) {
      await skip('blocklisted');
      continue;
    }
    const { data: u } = await db.from('users').select('id, marketing_opt_out, subscription_tier, subscription_expires_at').eq('email', m.to_email).limit(1).maybeSingle();
    const user = u as { id: string; marketing_opt_out: boolean | null; subscription_tier: string | null; subscription_expires_at: string | null } | null;
    if (!user) {
      await skip('account no longer exists');
      continue;
    }
    if (user.marketing_opt_out) {
      await skip('unsubscribed');
      continue;
    }
    const segment = m.source_id.slice(SOURCE.length) as UpgradeSegment;
    const activeUntil = user.subscription_expires_at ? new Date(user.subscription_expires_at).getTime() : Infinity;
    const paidNow = (user.subscription_tier === 'lite' || user.subscription_tier === 'pro') && activeUntil > Date.now();
    const boughtAlready =
      (segment === 'lite_to_pro' && user.subscription_tier === 'pro' && paidNow) ||
      ((segment === 'improving' || segment === 'plateau' || segment === 'habit' || segment === 'lapsed') && paidNow) ||
      (segment === 'expiring' && activeUntil - Date.now() > 6 * DAY);
    if (boughtAlready) {
      await skip('already upgraded or renewed');
      continue;
    }

    let res: { sent: number; failed: number; error?: string };
    try {
      res = await sendBulk([{ to: m.to_email, subject: m.subject, html: m.html, text: m.text_body ?? undefined, listUnsubscribe: unsubscribeUrl(user.id), replyTo: s.replyTo || undefined }]);
    } catch (e) {
      res = { sent: 0, failed: 1, error: String((e as Error)?.message ?? e) };
    }
    if (res.sent === 1) {
      out.sent += 1;
      await db.from('crm_outbox').update({ status: 'sent', sent_at: new Date().toISOString(), status_reason: null }).eq('id', m.id);
    } else {
      out.failed += 1;
      if (!out.error && res.error) out.error = res.error;
      await db.from('crm_outbox').update({ status: 'failed', status_reason: (res.error ?? 'send failed').slice(0, 300) }).eq('id', m.id);
    }
  }
  return out;
}

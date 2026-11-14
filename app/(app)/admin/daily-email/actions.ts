'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { readLifecycleSettings, writeLifecycleSettings, readRun, marketHour, type LifecycleSettings } from '@/lib/lifecycle/settings';
import { runLifecycle } from '@/lib/lifecycle/run';
import { nudgeTargets } from '@/lib/lifecycle/recipients';
import { NUDGE_LABEL, renderNudge } from '@/lib/lifecycle/nudges';
import { buildDailyDigest } from '@/lib/email/digest';
import { dnsChecks, structuralChecks, worstVerdict, fromDomain } from '@/lib/lifecycle/deliverability';
import { approveUpgradeDrafts, draftUpgrades, listUpgradeDrafts, rejectUpgradeDrafts, scanUpgrades, testUpgradeDraft } from '@/lib/lifecycle/upgrade';
import type { UpgradeDraft, UpgradeScan } from '@/lib/lifecycle/types';
import type { BucketCount, Funnel, LifecycleInsights, LifecycleOverview, LifecycleRunResult } from '@/lib/lifecycle/types';
import type { ContentMarket } from '@/lib/market';
import type { UserRow } from '@/lib/types';

async function requireAdmin(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!(data as Partial<UserRow>)?.is_admin) throw new Error('Forbidden: Admins only');
  return user.id;
}

/** Click / unsubscribe counts for every lifecycle email over the last 30 days. */
async function loadFunnels(): Promise<{ funnels: Funnel[]; missing: boolean }> {
  const db = createServiceClient();
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data, error } = await db
    .from('crm_outbox')
    .select('id, source_id, status, click_count')
    .gte('created_at', since)
    .like('source_id', 'lifecycle:%')
    .limit(5000);
  if (error) return { funnels: [], missing: /does not exist|schema cache|could not find/i.test(error.message || '') };

  const rows = (data as Array<{ id: string; source_id: string; status: string; click_count: number | null }>) || [];
  const by = new Map<string, Funnel>();
  for (const r of rows) {
    const key = r.source_id || 'lifecycle:?';
    const f = by.get(key) ?? { source: key, queued: 0, sent: 0, failed: 0, suppressed: 0, clicked: 0, unsubscribed: 0 };
    f.queued += 1;
    if (r.status === 'sent') f.sent += 1;
    else if (r.status === 'failed') f.failed += 1;
    else if (r.status === 'suppressed' || r.status === 'cancelled') f.suppressed += 1;
    if ((r.click_count ?? 0) > 0) f.clicked += 1;
    by.set(key, f);
  }

  // Unsubscribes come from the event log, in pages — an `in()` over thousands of
  // ids builds a URL long enough to be rejected.
  if (rows.length) {
    const sourceOf = new Map(rows.map((r) => [r.id, r.source_id || 'lifecycle:?']));
    const ids = rows.map((r) => r.id);
    for (let i = 0; i < ids.length; i += 200) {
      const { data: ev } = await db
        .from('crm_email_events')
        .select('outbox_id')
        .in('outbox_id', ids.slice(i, i + 200))
        .eq('kind', 'unsubscribe');
      for (const e of (ev as Array<{ outbox_id: string }>) || []) {
        const f = by.get(sourceOf.get(e.outbox_id) ?? '');
        if (f) f.unsubscribed += 1;
      }
    }
  }
  return { funnels: [...by.values()].sort((a, b) => b.queued - a.queued), missing: false };
}

/**
 * The fast half: settings, the run ledger and three indexed counts. Nothing here
 * reaches DNS or a model, so the page is on screen before the reader notices.
 * `loadInsights` fills in the rest afterwards.
 */
export async function loadOverview(): Promise<{ success: boolean; data?: LifecycleOverview; error?: string }> {
  try {
    await requireAdmin();
    const [settings, lastDigestIn, lastDigestUs, lastNudgeIn, lastNudgeUs, funnelRes] = await Promise.all([
      readLifecycleSettings(),
      readRun('IN', 'digest'),
      readRun('US', 'digest'),
      readRun('IN', 'nudge'),
      readRun('US', 'nudge'),
      loadFunnels(),
    ]);
    return {
      success: true,
      data: {
        settings,
        hours: { in: marketHour('IN'), us: marketHour('US') },
        lastDigest: { IN: lastDigestIn, US: lastDigestUs },
        lastNudge: { IN: lastNudgeIn, US: lastNudgeUs },
        funnels: funnelRes.funnels,
        ...(funnelRes.missing ? { tablesMissing: true } : {}),
      },
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Could not load.' };
  }
}

/** The slow half: DNS lookups, the behavioural segmentation, tonight's subjects. */
export async function loadInsights(): Promise<{ success: boolean; data?: LifecycleInsights; error?: string }> {
  try {
    await requireAdmin();
    const settings = await readLifecycleSettings();
    const domain = fromDomain();
    const [bucketsIn, bucketsUs, digestIn, digestUs, dns] = await Promise.all([
      nudgeTargets('IN').catch(() => []),
      nudgeTargets('US').catch(() => []),
      buildDailyDigest('IN', 2).catch(() => null),
      buildDailyDigest('US', 2).catch(() => null),
      dnsChecks(domain).catch(() => []),
    ]);

    const tally = (list: Awaited<ReturnType<typeof nudgeTargets>>): BucketCount[] => {
      const by = new Map<string, number>();
      for (const t of list) by.set(t.kind, (by.get(t.kind) ?? 0) + 1);
      return (['abandoned', 'never_started', 'finished'] as const).map((k) => ({ kind: k, label: NUDGE_LABEL[k], count: by.get(k) ?? 0 }));
    };

    const checks = [
      ...dns,
      ...structuralChecks({
        openPixel: settings.openPixel,
        replyTo: settings.replyTo,
        hasResendKey: !!process.env.RESEND_API_KEY,
        hasSmtp: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
        unsubscribeHeader: true,
        textPart: true,
      }),
    ];

    return {
      success: true,
      data: {
        buckets: { IN: tally(bucketsIn), US: tally(bucketsUs) },
        deliverability: { domain, verdict: worstVerdict(checks), checks },
        previewSubjects: { IN: digestIn?.subject ?? null, US: digestUs?.subject ?? null },
      },
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Could not load the checks.' };
  }
}

export async function saveSettings(patch: Partial<LifecycleSettings>): Promise<{ success: boolean; settings?: LifecycleSettings; error?: string }> {
  try {
    const actor = await requireAdmin();
    return { success: true, settings: await writeLifecycleSettings(patch, actor) };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Could not save.' };
  }
}

/**
 * Run the job right now, ignoring the hour window.
 *
 * This respects the mode: in `manual` it mails the test address, which is the
 * point of the button. It will not quietly mail everyone because somebody
 * clicked "run now".
 */
export async function runNow(market?: ContentMarket, dryRun = false): Promise<{ success: boolean; result?: LifecycleRunResult; error?: string }> {
  try {
    await requireAdmin();
    return { success: true, result: await runLifecycle({ force: true, dryRun, only: market }) };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Run failed.' };
  }
}

/** The rendered digest, for the preview pane. */
export async function previewDigest(market: ContentMarket): Promise<{ success: boolean; subject?: string; html?: string; note?: string; error?: string }> {
  try {
    await requireAdmin();
    const d = await buildDailyDigest(market, 2);
    return d.success ? { success: true, subject: d.subject, html: d.html, note: d.note } : { success: false, error: d.error };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Preview failed.' };
  }
}

/** One rendered sample of each behavioural email, for review before switching them on. */
export async function previewNudges(
  market: ContentMarket,
): Promise<{ success: boolean; samples?: Array<{ kind: string; label: string; subject: string; html: string }>; error?: string }> {
  try {
    await requireAdmin();
    const targets = await nudgeTargets(market);
    const seen = new Set<string>();
    const samples: Array<{ kind: string; label: string; subject: string; html: string }> = [];
    for (const t of targets) {
      if (seen.has(t.kind)) continue;
      seen.add(t.kind);
      const m = renderNudge(t, market, '#');
      samples.push({ kind: t.kind, label: NUDGE_LABEL[t.kind], subject: m.subject, html: m.html });
    }
    return { success: true, samples };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Preview failed.' };
  }
}

/* ── upgrade emails: drafted here, sent only on approval ─────────────────── */

/** Who would be written to and what each segment's email says. Writes nothing. */
export async function upgradeScan(): Promise<{ success: boolean; scan?: UpgradeScan; error?: string }> {
  try {
    await requireAdmin();
    return { success: true, scan: await scanUpgrades() };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Scan failed.' };
  }
}

export async function upgradeDrafts(): Promise<{ success: boolean; drafts?: UpgradeDraft[]; error?: string }> {
  try {
    await requireAdmin();
    return { success: true, drafts: await listUpgradeDrafts() };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Could not load drafts.' };
  }
}

/** Write the drafts into the review queue. Sends nothing. */
export async function upgradeWrite(): Promise<{ success: boolean; drafted?: number; duplicate?: number; capped?: number; error?: string }> {
  try {
    await requireAdmin();
    const r = await draftUpgrades();
    return r.error ? { success: false, error: r.error } : { success: true, drafted: r.drafted, duplicate: r.duplicate, capped: r.capped };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Drafting failed.' };
  }
}

export async function upgradeTest(id: string): Promise<{ success: boolean; to?: string; error?: string }> {
  try {
    await requireAdmin();
    const r = await testUpgradeDraft(id);
    return r.ok ? { success: true, to: r.to } : { success: false, error: r.error };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Test send failed.' };
  }
}

export async function upgradeDecide(
  ids: string[],
  approve: boolean,
): Promise<{ success: boolean; sent?: number; failed?: number; skipped?: number; rejected?: number; error?: string }> {
  try {
    const actor = await requireAdmin();
    if (!approve) return { success: true, rejected: await rejectUpgradeDrafts(ids, actor) };
    const r = await approveUpgradeDrafts(ids, actor);
    return { success: !r.error || r.sent > 0, sent: r.sent, failed: r.failed, skipped: r.skipped, error: r.error };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Could not send.' };
  }
}

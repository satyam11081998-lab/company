/**
 * Scheduled CRM work.
 *
 * Vercel Hobby runs a cron at most once a day, so time-based work has two
 * drivers:
 *   - daily cron (/api/cron/crm): everything, including the MECE sync and
 *     segment refresh;
 *   - "tick": light, frequent work (SLA escalation, due emails, scheduled
 *     workflow actions, cadence steps). It runs when someone opens the CRM,
 *     at most once every 5 minutes (an atomic claim on crm_settings stops two
 *     page loads running it twice), and from the cron. An external pinger can
 *     also call /api/cron/crm?scope=tick with the cron secret.
 * Each job is isolated: one failing never stops the others.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient } from './svc';
import { loadMetaWith, type Meta } from './meta';

type JobResult = Record<string, unknown>;

async function step(out: JobResult, name: string, fn: () => Promise<unknown>) {
  try {
    out[name] = await fn();
  } catch (e) {
    out[`${name}Error`] = String((e as Error)?.message ?? e).slice(0, 300);
    console.error(`[crm] job ${name} failed:`, e);
  }
}

/** Light, frequent work. */
export async function runTick(svc: SupabaseClient, meta: Meta): Promise<JobResult> {
  const out: JobResult = {};
  const { stampMissingSla, escalateOverdue } = await import('./service');
  const { sendApproved } = await import('./outbox');
  await step(out, 'slaStamped', () => stampMissingSla(svc));
  await step(out, 'escalated', () => escalateOverdue(svc, meta));
  await step(out, 'emails', () => sendApproved(svc, null, undefined, 25));
  const auto = await import('./automation').catch(() => null);
  if (auto && 'runScheduled' in auto && typeof (auto as { runScheduled?: unknown }).runScheduled === 'function') {
    await step(out, 'scheduled', () => (auto as unknown as { runScheduled: (s: SupabaseClient, m: Meta) => Promise<unknown> }).runScheduled(svc, meta));
  }
  return out;
}

/** Daily work (cron). */
export async function runDaily(svc: SupabaseClient, meta: Meta): Promise<JobResult> {
  const out: JobResult = {};
  const { refreshAllSegments } = await import('./segments');
  await step(out, 'segments', () => refreshAllSegments(meta));
  const extra = await import('./automation').catch(() => null);
  if (extra && 'runDaily' in extra && typeof (extra as { runDaily?: unknown }).runDaily === 'function') {
    await step(out, 'automationDaily', () => (extra as unknown as { runDaily: (s: SupabaseClient, m: Meta) => Promise<unknown> }).runDaily(svc, meta));
  }
  // AI: retrain weekly (models are small), then refresh every score so views/workflows see today's numbers
  const ai = await import('./ai');
  await step(out, 'aiTrain', async () => {
    const { data } = await svc.from('crm_ai_models').select('kind, trained_at').in('kind', ['churn', 'conversion']).eq('active', true);
    const fresh = new Set(((data ?? []) as Array<{ kind: string; trained_at: string }>).filter((m) => Date.now() - new Date(m.trained_at).getTime() < 7 * 86_400_000).map((m) => m.kind));
    const res: Record<string, unknown> = {};
    for (const kind of ['churn', 'conversion'] as const) if (!fresh.has(kind)) res[kind] = (await ai.trainModel(null, meta, kind)).ok;
    return res;
  });
  await step(out, 'aiScores', () => ai.refreshScores(svc, meta));
  await step(out, 'anomalies', () => ai.notifyAnomalies(svc));
  await step(out, 'privacy', () => privacyReminders(svc));
  await step(out, 'housekeeping', async () => {
    await svc.from('crm_api_usage').delete().lt('minute', new Date(Date.now() - 30 * 86_400_000).toISOString());
    return true;
  });
  Object.assign(out, await runTick(svc, meta));
  return out;
}

/** Remind privacy managers of rights requests due within 3 days (once a day, from the cron). */
async function privacyReminders(svc: SupabaseClient) {
  const soon = new Date(Date.now() + 3 * 86_400_000).toISOString();
  const { data } = await svc.from('crm_privacy_requests').select('id, kind, due_at').in('status', ['open', 'in_progress']).lt('due_at', soon).limit(50);
  const rows = (data ?? []) as Array<{ id: string; kind: string; due_at: string }>;
  if (!rows.length) return 0;
  const { data: admins } = await svc.from('users').select('id').eq('is_admin', true).limit(20);
  const { notify } = await import('./records');
  const late = rows.filter((r) => new Date(r.due_at).getTime() < Date.now()).length;
  for (const a of (admins ?? []) as Array<{ id: string }>) {
    await notify(svc, a.id, 'privacy', `${rows.length} privacy request(s) due within 3 days${late ? ` — ${late} overdue` : ''}`, null, '/crm/privacy');
  }
  return rows.length;
}

const TICK_EVERY_MS = 5 * 60_000;

/**
 * Run the tick if nobody has in the last 5 minutes. Cheap when not due (one
 * conditional update). Never throws; returns null when skipped.
 */
export async function maybeTick(): Promise<JobResult | null> {
  try {
    const svc = createServiceClient();
    const now = Date.now();
    const cutoff = new Date(now - TICK_EVERY_MS).toISOString();
    // claim: insert the row the first time, else move `at` forward only if it is old enough
    await svc.from('crm_settings').upsert({ key: 'jobs.tick', value: { at: '1970-01-01T00:00:00.000Z' } }, { onConflict: 'key', ignoreDuplicates: true });
    const { data } = await svc.from('crm_settings').update({ value: { at: new Date(now).toISOString() }, updated_at: new Date(now).toISOString() })
      .eq('key', 'jobs.tick').lt('value->>at', cutoff).select('key');
    if (!data?.length) return null;
    const meta = await loadMetaWith(svc);
    return await runTick(svc, meta);
  } catch (e) {
    console.error('[crm] tick failed:', e);
    return null;
  }
}

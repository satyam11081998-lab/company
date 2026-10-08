/**
 * Segments (Zoho "Segmentation"): criteria segments and RFM segments.
 * An RFM segment scores its population 1–5 on Recency / Frequency / Monetary
 * (automatic percentiles, or admin thresholds) and names each person's
 * segment. The segment marked "write to records" stores the scores on the
 * contact (rfm_r / rfm_f / rfm_m / rfm_segment) so views, workflows and
 * campaigns can use them. Refreshed daily by the cron and on demand.
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import { canSetup } from '@/lib/crm/permissions';
import { validateCriteria } from '@/lib/crm/criteria';
import { scoreRfm, type ManualThresholds, RFM_LABELS } from '@/lib/crm/rfm';
import { isUuid } from '@/lib/crm/fields';
import type { Criteria, CrmContext, CrmRecord } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { audit } from './db';
import { queryAll, SYSTEM_CTX } from './records';
import type { Meta } from './meta';

export interface SegmentConfig {
  type: 'criteria' | 'rfm';
  module: string;
  criteria?: Criteria | null;
  rfm?: {
    recencyField: string;   // a date/datetime field — days since
    frequencyField: string; // a number field
    monetaryField: string;  // a currency/number field
    manual?: ManualThresholds | null;
    writeToRecords?: boolean;
  };
  description?: string;
  lastRefresh?: { at: string; members: number; byLabel?: Record<string, number>; avg?: { r: number; f: number; m: number } };
}

export const DEFAULT_RFM_SEGMENTS: Array<{ name: string; config: SegmentConfig }> = [
  {
    name: 'Engagement RFM (all users)',
    config: {
      type: 'rfm', module: 'contacts', description: 'Recency = days since last active, Frequency = cases solved, Monetary = verified lifetime revenue.',
      criteria: { match: 'all', conditions: [{ field: 'mece_internal', op: 'neq', value: true }, { field: 'mece_signed_up_at', op: 'not_empty' }] },
      rfm: { recencyField: 'mece_last_active_at', frequencyField: 'mece_cases_solved', monetaryField: 'mece_revenue_inr', writeToRecords: true },
    },
  },
  {
    name: 'Purchase RFM (paying customers)',
    config: {
      type: 'rfm', module: 'contacts', description: 'Only people who ever paid: Recency = days since last payment, Frequency = paid orders, Monetary = revenue.',
      criteria: { match: 'all', conditions: [{ field: 'mece_internal', op: 'neq', value: true }, { field: 'mece_payments_count', op: 'gt', value: 0 }] },
      rfm: { recencyField: 'mece_last_paid_at', frequencyField: 'mece_payments_count', monetaryField: 'mece_revenue_inr', writeToRecords: false },
    },
  },
];

export function cleanSegment(raw: unknown, meta: Meta): SegmentConfig {
  const r = (raw ?? {}) as Partial<SegmentConfig>;
  const module = String(r.module ?? 'contacts');
  if (!meta.module(module)) throw new CrmUserError('Pick a module.');
  const fields = meta.fields(module);
  const criteria = r.criteria ? validateCriteria(r.criteria, fields) : null;
  if (r.type === 'rfm') {
    const has = (f: unknown, types: string[]) => typeof f === 'string' && fields.some((x) => x.api_name === f && types.includes(x.type));
    const rf = r.rfm ?? ({} as NonNullable<SegmentConfig['rfm']>);
    if (!has(rf.recencyField, ['date', 'datetime'])) throw new CrmUserError('Recency needs a date field.');
    if (!has(rf.frequencyField, ['integer', 'decimal', 'rollup'])) throw new CrmUserError('Frequency needs a number field.');
    if (!has(rf.monetaryField, ['currency', 'decimal', 'integer', 'rollup'])) throw new CrmUserError('Monetary needs a currency or number field.');
    const cuts = (a: unknown) => (Array.isArray(a) ? a.map(Number).filter((x) => Number.isFinite(x)).slice(0, 4).sort((x, y) => x - y) : undefined);
    const manual = rf.manual ? { r: cuts(rf.manual.r), f: cuts(rf.manual.f), m: cuts(rf.manual.m) } : null;
    return { type: 'rfm', module, criteria, rfm: { recencyField: rf.recencyField, frequencyField: rf.frequencyField, monetaryField: rf.monetaryField, manual, writeToRecords: !!rf.writeToRecords }, description: r.description ? String(r.description).slice(0, 300) : undefined };
  }
  if (!criteria) throw new CrmUserError('A criteria segment needs at least one condition.');
  return { type: 'criteria', module, criteria, description: r.description ? String(r.description).slice(0, 300) : undefined };
}

export async function ensureDefaultSegments() {
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('id').eq('kind', 'segment').limit(1);
  if (data?.length) return;
  const { error } = await svc.from('crm_config').insert(DEFAULT_RFM_SEGMENTS.map((s, i) => ({ kind: 'segment', module: s.config.module, name: s.name, position: (i + 1) * 10, config: s.config })));
  if (error && error.code !== '23505') throw error;
}

const days = (v: unknown, now: number) => {
  const t = typeof v === 'string' ? new Date(v).getTime() : NaN;
  return Number.isFinite(t) ? Math.max(0, (now - t) / 86_400_000) : null;
};
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

/** Compute a segment. `ctx` null = system refresh (all records). */
export async function computeSegment(ctx: CrmContext | null, meta: Meta, cfg: SegmentConfig) {
  const { rows } = await queryAll(ctx ?? SYSTEM_CTX, meta, cfg.module, cfg.criteria ?? null, 50_000);
  if (cfg.type !== 'rfm' || !cfg.rfm) return { rows, scores: null as null };
  const now = Date.now();
  const scores = scoreRfm(rows.map((r) => ({ id: r.id, recencyDays: days(r.data[cfg.rfm!.recencyField], now), frequency: num(r.data[cfg.rfm!.frequencyField]), monetary: num(r.data[cfg.rfm!.monetaryField]) })), cfg.rfm.manual ?? undefined);
  return { rows, scores };
}

export async function refreshSegment(ctx: CrmContext | null, meta: Meta, segmentId: string) {
  if (ctx && !canSetup(ctx, 'manage_marketing')) throw new CrmAccessError('You can’t manage segments.');
  if (!isUuid(segmentId)) throw new CrmAccessError('Segment not found.');
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('id, name, config').eq('id', segmentId).eq('kind', 'segment').maybeSingle();
  const seg = data as { id: string; name: string; config: SegmentConfig } | null;
  if (!seg) throw new CrmAccessError('Segment not found.');
  const cfg = cleanSegment(seg.config, meta);
  // Writing scores to records must see every record, whoever presses refresh.
  const { rows, scores } = await computeSegment(cfg.rfm?.writeToRecords ? null : ctx, meta, cfg);
  const lastRefresh: SegmentConfig['lastRefresh'] = { at: new Date().toISOString(), members: rows.length };
  if (scores) {
    const byLabel: Record<string, number> = Object.fromEntries(RFM_LABELS.map((l) => [l, 0]));
    for (const s of scores) byLabel[s.label] = (byLabel[s.label] ?? 0) + 1;
    lastRefresh.byLabel = byLabel;
    const avg = (k: 'r' | 'f' | 'm') => (scores.length ? Math.round((scores.reduce((n, s) => n + s[k], 0) / scores.length) * 10) / 10 : 0);
    lastRefresh.avg = { r: avg('r'), f: avg('f'), m: avg('m') };
    if (cfg.rfm?.writeToRecords && cfg.module === 'contacts') {
      const patch = scores.map((s) => ({ id: s.id, data: { rfm_r: s.r, rfm_f: s.f, rfm_m: s.m, rfm_segment: s.label } }));
      for (let i = 0; i < patch.length; i += 500) {
        const { error } = await svc.rpc('crm_merge_data', { p_rows: patch.slice(i, i + 500) });
        if (error) throw error;
      }
    }
  }
  await svc.from('crm_config').update({ config: { ...seg.config, lastRefresh }, updated_at: new Date().toISOString() }).eq('id', seg.id);
  await audit(svc, { actor_id: ctx?.userId ?? null, actor_kind: ctx ? 'user' : 'system', action: 'segment_refresh', module: cfg.module, meta: { segment: seg.name, members: rows.length } });
  return lastRefresh;
}

export async function refreshAllSegments(meta: Meta) {
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('id').eq('kind', 'segment').eq('active', true);
  let n = 0;
  for (const s of (data ?? []) as Array<{ id: string }>) {
    try { await refreshSegment(null, meta, s.id); n++; } catch (e) { console.error('[crm] segment refresh failed', e); }
  }
  return n;
}

/** Records in a segment (for "add to campaign"), visible to ctx. */
export async function segmentMembers(ctx: CrmContext, meta: Meta, segmentId: string, label?: string | null): Promise<CrmRecord[]> {
  if (!isUuid(segmentId)) throw new CrmAccessError('Segment not found.');
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('config').eq('id', segmentId).eq('kind', 'segment').maybeSingle();
  if (!data) throw new CrmAccessError('Segment not found.');
  const cfg = cleanSegment((data as { config: unknown }).config, meta);
  const { rows, scores } = await computeSegment(ctx, meta, cfg);
  if (!label || !scores) return rows;
  const keep = new Set(scores.filter((s) => s.label === label).map((s) => s.id));
  return rows.filter((r) => keep.has(r.id));
}


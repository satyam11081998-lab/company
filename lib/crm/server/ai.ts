/**
 * Iris, the CRM's AI assistant (server half). See lib/crm/ml.ts for the maths.
 *
 *  - Models (churn, lead conversion, custom predictions) train on the
 *    viewer-independent full data set (admins with manage_ai only), are
 *    stored with their holdout metrics, and are used only if reliable.
 *  - Scores (health, churn risk, conversion probability, deal health, next
 *    best action) are refreshed daily into system fields so views, workflows
 *    and segments can use them. People who withdrew AI-profiling consent, and
 *    records under a privacy restriction, are not scored (fields cleared).
 *  - Every insight shows its factors; anyone with access to the record can
 *    agree, disagree or override with a reason (crm_ai_feedback, audited).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/crm/server/svc';
import {
  type FeatureSpec, type LogitModel, bestTime, dealHealth, detectAnomalies, expandFeatures, explain, featureVector, healthScore, nextBestActions,
  predictProba, trainAndEvaluate,
} from '@/lib/crm/ml';
import { parseQuestion, type ParsedQuery } from '@/lib/crm/nlq';
import { validateCriteria } from '@/lib/crm/criteria';
import { isUuid } from '@/lib/crm/fields';
import { allows, canSetup, fieldAccess } from '@/lib/crm/permissions';
import { groupKey } from '@/lib/crm/reports';
import type { CrmContext, CrmRecord } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { RECORD_COLS, audit, fetchAll, normalizeRecord } from './db';
import { loadMembers } from './members';
import { accessTo, getRecord, notify, queryAll, SYSTEM_CTX, updateRecord } from './records';
import { llmAvailable, llmComplete } from './llm';
import type { Meta } from './meta';

// ---------------------------------------------------------------------------
// Datasets
// ---------------------------------------------------------------------------

const CHURN_FEATURES: FeatureSpec[] = [
  { kind: 'number', field: 'mece_cases_solved', log: true },
  { kind: 'number', field: 'mece_avg_score' },
  { kind: 'number', field: 'mece_best_score' },
  { kind: 'number', field: 'mece_payments_count' },
  { kind: 'number', field: 'mece_voice_minutes', log: true },
  { kind: 'number', field: 'mece_streak', log: true },
  { kind: 'category', field: 'mece_tier', values: ['free', 'lite', 'pro'] },
  { kind: 'category', field: 'market', values: ['IN', 'US', 'EU'] },
  { kind: 'category', field: 'mece_placement_focus', values: ['summer', 'final', 'both'] },
  { kind: 'present', field: 'mece_onboarded_at' },
  { kind: 'present', field: 'nps_last' },
];
// deliberately NO recency features (last active, active days): they define the label
const HEALTH_FIELDS = ['mece_active_days_30', 'mece_last_active_at', 'mece_tier', 'mece_payments_count', 'mece_avg_score', 'nps_last', 'csat_last'];

const CONVERSION_FEATURES: FeatureSpec[] = [
  { kind: 'category', field: 'lead_source', values: ['Website', 'Web form', 'Campus event', 'Referral', 'Instagram', 'LinkedIn', 'WhatsApp', 'Partner college', 'Cold outreach', 'Import'] },
  { kind: 'category', field: 'segment', values: ['Student (B2C)', 'College / B-school (B2B)', 'Consulting club', 'Corporate', 'Coaching institute'] },
  { kind: 'category', field: 'rating', values: ['Hot', 'Warm', 'Cold'] },
  { kind: 'number', field: 'no_of_students', log: true },
  { kind: 'number', field: 'annual_budget', log: true },
  { kind: 'present', field: 'email' },
  { kind: 'present', field: 'phone' },
  { kind: 'present', field: 'website' },
];

const churnLabel = (now: number) => (d: Record<string, unknown>): 0 | 1 | null => {
  const signed = typeof d.mece_signed_up_at === 'string' ? new Date(d.mece_signed_up_at).getTime() : NaN;
  if (!Number.isFinite(signed) || now - signed < 60 * 86_400_000 || d.mece_internal === true) return null;
  if (!(Number(d.mece_cases_solved) > 0)) return null; // never activated: an activation problem, not churn
  const last = typeof d.mece_last_active_at === 'string' ? new Date(d.mece_last_active_at).getTime() : NaN;
  return !Number.isFinite(last) || now - last > 45 * 86_400_000 ? 1 : 0;
};
const conversionLabel = (d: Record<string, unknown>): 0 | 1 | null => (d.lead_status === 'Converted' ? 1 : d.lead_status === 'Unqualified' || d.lead_status === 'Closed - lost' ? 0 : null);

async function allRecords(svc: SupabaseClient, module: string): Promise<CrmRecord[]> {
  const { rows } = await fetchAll<Record<string, unknown>>((o) => svc.from('crm_records').select(RECORD_COLS, o).eq('module', module).is('deleted_at', null).is('merged_into', null).order('id'), 50_000);
  return rows.map(normalizeRecord);
}

const labelsOf = (meta: Meta, module: string) => Object.fromEntries(meta.fields(module).map((f) => [f.api_name, f.label]));

// ---------------------------------------------------------------------------
// Prediction configs (prediction builder) and training
// ---------------------------------------------------------------------------

export interface PredictionConfig { module: string; target: { field: string; positive: string }; features: string[]; description?: string }

export function featureSpecsFor(meta: Meta, module: string, fields: string[], exclude: string): FeatureSpec[] {
  const out: FeatureSpec[] = [];
  for (const api of fields.slice(0, 20)) {
    const f = meta.field(module, api);
    if (!f || api === exclude) continue;
    if (['integer', 'decimal', 'currency', 'percent', 'rollup'].includes(f.type)) out.push({ kind: 'number', field: api, log: f.type === 'currency' });
    else if (f.type === 'boolean') out.push({ kind: 'boolean', field: api });
    else if (f.type === 'picklist') out.push({ kind: 'category', field: api, values: (f.options?.picklist ?? []).map((p) => p.value).slice(0, 12) });
    else if (f.type === 'date' || f.type === 'datetime') out.push({ kind: 'days_since', field: api });
    else out.push({ kind: 'present', field: api });
  }
  return out;
}

export async function savePrediction(ctx: CrmContext, meta: Meta, input: { id?: string | null; name: string; config: unknown }) {
  if (!canSetup(ctx, 'manage_ai')) throw new CrmAccessError('You can’t manage AI models.');
  const r = (input.config ?? {}) as Partial<PredictionConfig>;
  const mod = meta.module(String(r.module ?? ''));
  if (!mod) throw new CrmUserError('Pick a module.');
  const target = meta.field(mod.api_name, String(r.target?.field ?? ''));
  if (!target || !['picklist', 'boolean'].includes(target.type)) throw new CrmUserError('The predicted field must be a picklist or yes/no field.');
  const positive = target.type === 'boolean' ? 'true' : String(r.target?.positive ?? '');
  if (target.type === 'picklist' && !(target.options?.picklist ?? []).some((p) => p.value === positive)) throw new CrmUserError('Pick the value that counts as “yes”.');
  const features = (Array.isArray(r.features) ? r.features : []).filter((f) => typeof f === 'string' && meta.field(mod.api_name, f) && f !== target.api_name).slice(0, 20);
  if (features.length < 2) throw new CrmUserError('Pick at least two fields to learn from.');
  const name = String(input.name ?? '').trim().slice(0, 120);
  if (!name) throw new CrmUserError('Give the prediction a name.');
  const cfg: PredictionConfig = { module: mod.api_name, target: { field: target.api_name, positive }, features, description: typeof r.description === 'string' ? r.description.slice(0, 300) : undefined };
  const svc = createServiceClient();
  if (input.id) {
    if (!isUuid(input.id)) throw new CrmAccessError('Not found.');
    await svc.from('crm_config').update({ name, module: mod.api_name, config: cfg, updated_by: ctx.userId, updated_at: new Date().toISOString() }).eq('id', input.id).eq('kind', 'prediction');
    return input.id;
  }
  const { data, error } = await svc.from('crm_config').insert({ kind: 'prediction', name, module: mod.api_name, config: cfg, created_by: ctx.userId }).select('id').single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function trainModel(ctx: CrmContext | null, meta: Meta, kind: 'churn' | 'conversion' | 'prediction', configId?: string) {
  if (ctx && !canSetup(ctx, 'manage_ai')) throw new CrmAccessError('You can’t train AI models.');
  const svc = createServiceClient();
  const now = Date.now();
  let module: string;
  let specs: FeatureSpec[];
  let label: (d: Record<string, unknown>) => 0 | 1 | null;
  if (kind === 'churn') { module = 'contacts'; specs = CHURN_FEATURES; label = churnLabel(now); }
  else if (kind === 'conversion') { module = 'leads'; specs = CONVERSION_FEATURES; label = conversionLabel; }
  else {
    if (!isUuid(configId)) throw new CrmAccessError('Not found.');
    const { data } = await svc.from('crm_config').select('config').eq('id', configId).eq('kind', 'prediction').maybeSingle();
    if (!data) throw new CrmAccessError('Not found.');
    const cfg = (data as { config: PredictionConfig }).config;
    module = cfg.module;
    specs = featureSpecsFor(meta, module, cfg.features, cfg.target.field);
    label = (d) => { const v = d[cfg.target.field]; if (v === null || v === undefined || v === '') return null; return String(v) === cfg.target.positive ? 1 : 0; };
  }
  const recs = (await allRecords(svc, module)).filter((r) => r.data.consent_profiling !== 'Withdrawn' && r.locked?.kind !== 'dpdp_restricted');
  const features = expandFeatures(specs, labelsOf(meta, module));
  const report = trainAndEvaluate(recs.map((r) => ({ id: r.id, data: r.data })), label, features, now);
  const { data: prev } = await svc.from('crm_ai_models').select('version').eq('kind', kind).eq('config_id', configId ?? '00000000-0000-0000-0000-000000000000').order('version', { ascending: false }).limit(1);
  const version = Number((prev?.[0] as { version?: number } | undefined)?.version ?? 0) + 1;
  if (report.ok && report.model) {
    await svc.from('crm_ai_models').update({ active: false }).eq('kind', kind).eq('config_id', configId ?? '00000000-0000-0000-0000-000000000000');
    await svc.from('crm_ai_models').insert({ kind, config_id: configId ?? '00000000-0000-0000-0000-000000000000', module, version, model: report.model, metrics: { ...report.metrics, importance: report.importance, reason: report.reason ?? null }, trained_by: ctx?.userId ?? null, active: true });
  }
  await audit(svc, { actor_id: ctx?.userId ?? null, actor_kind: ctx ? 'user' : 'system', action: 'ai_train', module, meta: { kind, ok: report.ok, metrics: report.metrics, reason: report.reason } });
  return { kind, version: report.ok ? version : null, ok: report.ok, reason: report.reason ?? null, metrics: report.metrics, importance: report.importance ?? [] };
}

async function activeModel(svc: SupabaseClient, kind: string, configId?: string) {
  const { data } = await svc.from('crm_ai_models').select('id, version, model, metrics, trained_at').eq('kind', kind).eq('config_id', configId ?? '00000000-0000-0000-0000-000000000000').eq('active', true).order('trained_at', { ascending: false }).limit(1);
  const m = (data?.[0] ?? null) as { id: string; version: number; model: LogitModel; metrics: { reliable?: boolean; auc?: number | null; examples?: number }; trained_at: string } | null;
  return m;
}

// ---------------------------------------------------------------------------
// Scores refresh (daily + on demand)
// ---------------------------------------------------------------------------

const BAND = (x: number | null) => (x === null ? 'none' : x >= 76 ? 'high' : x >= 51 ? 'mid' : 'low');

export async function refreshScores(svc: SupabaseClient, meta: Meta): Promise<Record<string, number>> {
  const now = Date.now();
  const out = { contacts: 0, leads: 0, deals: 0, cleared: 0 };
  const churn = await activeModel(svc, 'churn');
  const conv = await activeModel(svc, 'conversion');

  // contacts: health, churn risk, next best action
  const contacts = await allRecords(svc, 'contacts');
  const { data: openCases } = await svc.from('crm_records').select('data').eq('module', 'cases').is('deleted_at', null).limit(20_000);
  const open = new Map<string, number>();
  for (const c of (openCases ?? []) as Array<{ data: Record<string, unknown> }>) {
    if (['Resolved', 'Closed'].includes(String(c.data.status))) continue;
    const id = c.data.contact_id as string | undefined;
    if (id) open.set(id, (open.get(id) ?? 0) + 1);
  }
  const patches: Array<{ id: string; data: Record<string, unknown> }> = [];
  for (const c of contacts) {
    if (c.data.mece_internal === true) continue;
    if (c.data.consent_profiling === 'Withdrawn' || c.locked?.kind === 'dpdp_restricted' || c.locked?.kind === 'dpdp_erased') {
      if (c.data.health_score !== null && c.data.health_score !== undefined) { patches.push({ id: c.id, data: { health_score: null, churn_risk: null, next_best_action: null } }); out.cleared++; }
      continue;
    }
    const h = healthScore(c.data, now);
    const risk = churn?.metrics.reliable ? Math.round(predictProba(churn.model, featureVector(churn.model.features, c.data, now)) * 100) : Math.max(0, Math.min(100, 100 - h.score));
    const nba = nextBestActions(c.data, { health: h.score, churnRisk: risk, openCases: open.get(c.id) ?? 0, consent: { marketing: c.data.email_opt_out !== true && c.data.consent_marketing !== 'Withdrawn', profiling: true, restricted: false } }, now)[0];
    const patch = { health_score: h.score, churn_risk: risk, next_best_action: nba?.allowed ? nba.title : nba ? `${nba.title} (blocked: ${nba.blockedBy})` : null };
    if (c.data.health_score !== patch.health_score || c.data.churn_risk !== patch.churn_risk || c.data.next_best_action !== patch.next_best_action) patches.push({ id: c.id, data: patch });
  }
  for (let i = 0; i < patches.length; i += 500) { const { data } = await svc.rpc('crm_merge_data', { p_rows: patches.slice(i, i + 500) }); out.contacts += Number(data ?? 0); }

  // leads: conversion probability
  const leads = await allRecords(svc, 'leads');
  const lp: Array<{ id: string; data: Record<string, unknown> }> = [];
  for (const l of leads) {
    if (l.locked?.kind === 'converted' || l.locked?.kind === 'dpdp_restricted' || l.locked?.kind === 'dpdp_erased' || l.data.consent_profiling === 'Withdrawn') continue;
    const p = conv?.metrics.reliable
      ? Math.round(predictProba(conv.model, featureVector(conv.model.features, l.data, now)) * 100)
      : Math.round(Math.max(1, Math.min(95, 50 + (l.score ?? 0) / 2 + (l.data.rating === 'Hot' ? 20 : l.data.rating === 'Cold' ? -20 : 0))));
    if (l.data.conversion_probability !== p) lp.push({ id: l.id, data: { conversion_probability: p } });
  }
  for (let i = 0; i < lp.length; i += 500) { const { data } = await svc.rpc('crm_merge_data', { p_rows: lp.slice(i, i + 500) }); out.leads += Number(data ?? 0); }

  // deals: health (open deals only). Band changes go through the save path so workflows can react (MK615 S16).
  const deals = await allRecords(svc, 'deals');
  const openStates = new Map<string, Set<string>>();
  for (const p of meta.pipelines) openStates.set(p.name, new Set(p.config.stages.filter((s) => s.state === 'open').map((s) => s.key)));
  const ids = deals.map((d) => d.id);
  const hist = new Map<string, Array<{ to_value: string | null; changed_at: string; seconds_in_from: number | null; from_value: string | null }>>();
  for (let i = 0; i < ids.length; i += 300) {
    const { data } = await svc.from('crm_stage_history').select('record_id, from_value, to_value, changed_at, seconds_in_from').in('record_id', ids.slice(i, i + 300)).eq('field', 'stage').order('changed_at');
    for (const h of (data ?? []) as Array<{ record_id: string; from_value: string | null; to_value: string | null; changed_at: string; seconds_in_from: number | null }>) hist.set(h.record_id, [...(hist.get(h.record_id) ?? []), h]);
  }
  const stageDurations = new Map<string, number[]>();
  for (const list of hist.values()) for (const h of list) if (h.from_value && h.seconds_in_from) stageDurations.set(h.from_value, [...(stageDurations.get(h.from_value) ?? []), h.seconds_in_from / 86_400]);
  const median = (xs: number[] | undefined) => { if (!xs?.length) return null; const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  for (const d of deals) {
    if (d.locked?.kind === 'dpdp_erased') continue;
    const isOpen = openStates.get(String(d.data.pipeline))?.has(String(d.data.stage)) ?? false;
    const h = hist.get(d.id) ?? [];
    const entered = h.length ? h[h.length - 1].changed_at : d.created_at;
    const r = dealHealth(d.data, { daysInStage: (now - new Date(entered).getTime()) / 86_400_000, medianDaysInStage: median(stageDurations.get(String(d.data.stage))), lastActivityAt: d.last_activity_at, medianAmount: null, open: isOpen }, now);
    const v = r ? r.score : null;
    if (d.data.deal_health === v || (v === null && d.data.deal_health === undefined)) continue;
    if (BAND(v) !== BAND((d.data.deal_health as number) ?? null) && d.external_key === null) {
      try { await updateRecord(null, meta, 'deals', d.id, { deal_health: v }, { allowSystem: ['deal_health'], source: 'automation', actorKind: 'automation', allowDuplicate: true }); out.deals++; continue; } catch { /* locked etc.: fall back to a silent write */ }
    }
    await svc.rpc('crm_merge_data', { p_rows: [{ id: d.id, data: { deal_health: v } }] });
    out.deals++;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Record insights + human feedback
// ---------------------------------------------------------------------------

export async function recordInsights(ctx: CrmContext, meta: Meta, rec: CrmRecord) {
  const svc = createServiceClient();
  const now = Date.now();
  const restricted = rec.locked?.kind === 'dpdp_restricted';
  const profilingOff = rec.data.consent_profiling === 'Withdrawn';
  const out: Record<string, unknown> = { module: rec.module, profilingOff, restricted };
  if (profilingOff || restricted) return out;
  // an insight is shown only if the viewer may see every field it is computed from (no leaks through scores or factors)
  const seesAll = (fields: string[]) => fields.every((f) => fieldAccess(ctx, rec.module, f) !== 'hidden');
  const modelFields = (m: LogitModel) => [...new Set(m.features.map((f) => f.spec.field))];
  const HIDDEN = { hidden: true, note: 'Built from fields your profile can’t see.' };
  const { data: fb } = await svc.from('crm_ai_feedback').select('kind, verdict, value, reason, user_id, created_at').eq('record_id', rec.id).order('created_at', { ascending: false }).limit(20);
  out.feedback = fb ?? [];
  if (rec.module === 'contacts') {
    if (!seesAll(HEALTH_FIELDS)) out.health = HIDDEN;
    else {
      out.health = healthScore(rec.data, now);
      const churn = await activeModel(svc, 'churn');
      if (churn?.metrics.reliable && !seesAll(modelFields(churn.model))) out.churn = HIDDEN;
      else if (churn?.metrics.reliable) {
        const x = featureVector(churn.model.features, rec.data, now);
        out.churn = { probability: Math.round(predictProba(churn.model, x) * 100), model: `trained model v${churn.version} (holdout AUC ${churn.metrics.auc})`, factors: explain(churn.model, x) };
      } else out.churn = { probability: Math.max(0, 100 - (out.health as { score: number }).score), model: 'rule-based (no reliable model yet: 100 − health)', factors: null };
      const { count: openCases } = await svc.from('crm_records').select('id', { count: 'exact', head: true }).eq('module', 'cases').is('deleted_at', null).eq('data->>contact_id', rec.id).not('data->>status', 'in', '("Resolved","Closed")');
      const NBA_FIELDS = ['mece_tier', 'mece_cases_solved', 'mece_payments_count', 'mece_signed_up_at', 'mece_last_active_at', 'mece_tier_expires_at', 'nps_last'];
      if (seesAll(NBA_FIELDS)) out.nba = nextBestActions(rec.data, { health: (out.health as { score: number }).score, churnRisk: (out.churn as { probability?: number }).probability ?? null, openCases: openCases ?? 0, consent: { marketing: rec.data.email_opt_out !== true && rec.data.consent_marketing !== 'Withdrawn', profiling: true, restricted } }, now);
    }
  }
  if (rec.module === 'leads') {
    const conv = await activeModel(svc, 'conversion');
    if (conv?.metrics.reliable && !seesAll(modelFields(conv.model))) out.conversion = HIDDEN;
    else if (conv?.metrics.reliable) {
      const x = featureVector(conv.model.features, rec.data, now);
      out.conversion = { probability: Math.round(predictProba(conv.model, x) * 100), model: `trained model v${conv.version} (holdout AUC ${conv.metrics.auc})`, factors: explain(conv.model, x) };
    } else out.conversion = { probability: rec.data.conversion_probability ?? null, model: 'rule-based (rating + score) — not enough converted/lost history to train', factors: null };
  }
  if (rec.module === 'deals') {
    const { data: h } = await svc.from('crm_stage_history').select('changed_at').eq('record_id', rec.id).eq('field', 'stage').order('changed_at', { ascending: false }).limit(1);
    const entered = (h?.[0] as { changed_at?: string } | undefined)?.changed_at ?? rec.created_at;
    const open = meta.pipelines.some((p) => p.name === rec.data.pipeline && p.config.stages.some((s) => s.key === rec.data.stage && s.state === 'open'));
    out.dealHealth = !seesAll(['probability', 'closing_date']) ? HIDDEN : dealHealth(rec.data, { daysInStage: (now - new Date(entered).getTime()) / 86_400_000, medianDaysInStage: null, lastActivityAt: rec.last_activity_at, medianAmount: null, open }, now);
  }
  if (rec.module === 'contacts' || rec.module === 'leads') {
    const { data: ob } = await svc.from('crm_outbox').select('id').eq('record_id', rec.id).eq('status', 'sent').limit(200);
    const obIds = ((ob ?? []) as Array<{ id: string }>).map((o) => o.id);
    const { data: ev } = obIds.length ? await svc.from('crm_email_events').select('at').in('outbox_id', obIds).in('kind', ['open', 'click']).limit(500) : { data: [] };
    out.bestTime = bestTime(((ev ?? []) as Array<{ at: string }>).map((e) => e.at));
  }
  // custom predictions for this module
  const { data: preds } = await svc.from('crm_config').select('id, name, config').eq('kind', 'prediction').eq('module', rec.module).eq('active', true).limit(10);
  const pr: unknown[] = [];
  for (const p of (preds ?? []) as Array<{ id: string; name: string; config: PredictionConfig }>) {
    if (fieldAccess(ctx, rec.module, p.config.target.field) === 'hidden') continue;
    const m = await activeModel(svc, 'prediction', p.id);
    if (!m?.metrics.reliable || !seesAll(modelFields(m.model))) continue;
    const x = featureVector(m.model.features, rec.data, now);
    pr.push({ name: p.name, probability: Math.round(predictProba(m.model, x) * 100), target: `${p.config.target.field} = ${p.config.target.positive}`, factors: explain(m.model, x), auc: m.metrics.auc });
  }
  out.predictions = pr;
  return out;
}

export async function aiFeedback(ctx: CrmContext, meta: Meta, input: { recordId: string; kind: string; verdict: string; value?: unknown; reason?: string }) {
  if (!isUuid(input.recordId)) throw new CrmAccessError('Record not found.');
  const svc = createServiceClient();
  const { data } = await svc.from('crm_records').select(RECORD_COLS).eq('id', input.recordId).maybeSingle();
  if (!data) throw new CrmAccessError('Record not found.');
  const rec = normalizeRecord(data as Record<string, unknown>);
  if (!allows(accessTo(ctx, meta, rec), 'read')) throw new CrmAccessError('Record not found.');
  const verdict = ['agree', 'disagree', 'override', 'like', 'dislike'].includes(input.verdict) ? input.verdict : null;
  const kind = /^[a-z_]{2,40}$/.test(input.kind) ? input.kind : null;
  if (!verdict || !kind) throw new CrmUserError('Bad feedback.');
  const reason = String(input.reason ?? '').trim().slice(0, 1000);
  if ((verdict === 'override' || verdict === 'disagree') && reason.length < 5) throw new CrmUserError('Say why (a short reason is kept with the record).');
  let value: unknown = null;
  if (verdict === 'override') {
    const n = Number(input.value);
    if (!Number.isFinite(n) || n < 0 || n > 100) throw new CrmUserError('Override with a number from 0 to 100.');
    value = Math.round(n);
  }
  await svc.from('crm_ai_feedback').insert({ record_id: rec.id, kind, verdict, value, reason: reason || null, user_id: ctx.userId });
  await audit(svc, { actor_id: ctx.userId, action: 'ai_feedback', module: rec.module, record_id: rec.id, meta: { kind, verdict, value } });
}

// ---------------------------------------------------------------------------
// Anomalies
// ---------------------------------------------------------------------------

export async function anomalies(svc: SupabaseClient) {
  const { data } = await svc.rpc('crm_daily_metrics', { p_days: 70 });
  const rows = (data ?? []) as Array<{ day: string; signups: number; payments: number; revenue_paise: number; solves: number; reports: number }>;
  const series = (k: keyof (typeof rows)[number], scale = 1) => rows.map((r) => ({ day: String(r.day), value: Number(r[k]) / scale }));
  const list = [
    ...detectAnomalies('Sign-ups', series('signups'), { increaseIsGood: true, minAbs: 3 }),
    ...detectAnomalies('Payments', series('payments'), { increaseIsGood: true, minAbs: 2 }),
    ...detectAnomalies('Revenue (₹)', series('revenue_paise', 100), { increaseIsGood: true, minAbs: 1000 }),
    ...detectAnomalies('Cases solved', series('solves'), { increaseIsGood: true, minAbs: 10 }),
    ...detectAnomalies('Problem reports', series('reports'), { increaseIsGood: false, minAbs: 3 }),
  ].sort((a, b) => b.day.localeCompare(a.day));
  return { anomalies: list, series: rows.slice(-30) };
}

export async function notifyAnomalies(svc: SupabaseClient) {
  const { anomalies: list } = await anomalies(svc);
  const today = new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
  const fresh = list.filter((a) => a.day >= new Date(Date.now() + 330 * 60_000 - 2 * 86_400_000).toISOString().slice(0, 10));
  if (!fresh.length) return 0;
  const { data: admins } = await svc.from('users').select('id').eq('is_admin', true).limit(20);
  let n = 0;
  for (const a of fresh) {
    // one alert per metric per day, however often the job runs
    const { data: ins } = await svc.from('crm_jobs').upsert({ kind: 'date_trigger', run_at: new Date().toISOString(), status: 'done', dedupe_key: `anomaly:${a.metric}:${a.day}`, payload: { anomaly: a } }, { onConflict: 'dedupe_key', ignoreDuplicates: true }).select('id');
    if (!ins?.length) continue;
    for (const u of (admins ?? []) as Array<{ id: string }>) await notify(svc, u.id, 'anomaly', `${a.metric} ${a.direction === 'up' ? 'spiked' : 'dropped'} on ${a.day}`, `${a.value} vs ~${a.expected} expected (z = ${a.z})${a.good === false ? ' — needs a look' : ''}`, '/crm/ai?tab=anomalies');
    n++;
  }
  void today;
  return n;
}

// ---------------------------------------------------------------------------
// Ask Iris
// ---------------------------------------------------------------------------

async function llmParse(meta: Meta, q: string): Promise<ParsedQuery | null> {
  if (!llmAvailable()) return null;
  const mods = ['leads', 'contacts', 'deals', 'cases', 'campaigns', 'tasks', 'invoices', 'accounts'];
  const schema = mods.map((m) => `${m}: ${meta.fields(m).filter((f) => !['json', 'line_items'].includes(f.type)).slice(0, 40).map((f) => `${f.api_name}(${f.type})`).join(', ')}`).join('\n');
  const txt = await llmComplete(
    'Translate a CRM question into JSON {"module","fn":"count|sum|avg|min|max","field"?,"criteria"?:{"match":"all","conditions":[{"field","op","value"?}]},"groupBy"?,"limit"?}. ops: eq,neq,contains,gt,gte,lt,lte,in,empty,not_empty,today,this_week,this_month,last_month,this_quarter,this_year,in_last_days. Use only these modules and fields:\n' + schema,
    q.slice(0, 300), { json: true, maxTokens: 300 },
  );
  if (!txt) return null;
  try {
    const j = JSON.parse(txt) as Partial<ParsedQuery>;
    if (!j.module || !mods.includes(j.module)) return null;
    return { module: j.module, fn: (['count', 'sum', 'avg', 'min', 'max'] as const).includes(j.fn as never) ? j.fn! : 'count', field: j.field, criteria: j.criteria ?? null, groupBy: j.groupBy, limit: j.limit, explanation: 'Interpreted with the AI model; check the reading below before relying on it.' };
  } catch {
    return null;
  }
}

export async function askCrm(ctx: CrmContext, meta: Meta, question: string) {
  let parsed = parseQuestion(question);
  if ('error' in parsed) {
    const viaLlm = await llmParse(meta, question);
    if (!viaLlm) return { ok: false as const, message: parsed.error, suggestions: parsed.suggestions };
    parsed = viaLlm;
  }
  const p = parsed;
  const mod = meta.module(p.module);
  if (!mod) return { ok: false as const, message: 'That module is not available.', suggestions: [] };
  // every field must exist and be visible to this user; criteria re-validated
  const fields = meta.fields(p.module);
  const known = (f: string | undefined) => !f || ['owner_id', 'created_at', 'updated_at', 'last_activity_at', 'score', 'name'].includes(f) || fields.some((x) => x.api_name === f);
  if (!known(p.field) || !known(p.groupBy)) return { ok: false as const, message: 'That question uses a field I don’t know.', suggestions: [] };
  for (const f of [p.field, p.groupBy]) if (f && fieldAccess(ctx, p.module, f) === 'hidden') return { ok: false as const, message: 'That question needs a field you can’t see.', suggestions: [] };
  let criteria;
  try { criteria = p.criteria ? validateCriteria(p.criteria, fields) : null; } catch { return { ok: false as const, message: 'I couldn’t build a safe filter from that question.', suggestions: [] }; }
  const { rows } = await queryAll(ctx, meta, p.module, criteria, 50_000);
  const agg = (list: CrmRecord[]) => {
    if (p.fn === 'count' || !p.field) return list.length;
    const xs = list.map((r) => Number(r.data[p.field!])).filter((x) => Number.isFinite(x));
    if (!xs.length) return null;
    const v = p.fn === 'sum' ? xs.reduce((a, b) => a + b, 0) : p.fn === 'avg' ? xs.reduce((a, b) => a + b, 0) / xs.length : p.fn === 'max' ? Math.max(...xs) : Math.min(...xs);
    return Math.round(v * 100) / 100;
  };
  const members = await loadMembers();
  let groups: Array<{ key: string; value: number | null }> | null = null;
  if (p.groupBy) {
    const by = new Map<string, CrmRecord[]>();
    const stageLabel = (pipeline: unknown, key: string) => meta.pipelines.find((pl) => pl.name === pipeline)?.config.stages.find((x) => x.key === key)?.label ?? key;
    for (const r of rows) {
      let k = groupKey(r, { field: p.groupBy, bucket: p.bucket });
      if (p.groupBy === 'stage' && p.module === 'deals' && k !== '(none)') k = stageLabel(r.data.pipeline, k);
      by.set(k, [...(by.get(k) ?? []), r]);
    }
    groups = [...by.entries()].map(([k, list]) => ({ key: p.groupBy === 'owner_id' ? members.find((m) => m.id === k)?.name ?? (k === '(none)' ? 'Unassigned' : 'Former user') : k, value: agg(list) }));
    groups.sort((a, b) => (p.bucket ? a.key.localeCompare(b.key) : (b.value ?? -Infinity) - (a.value ?? -Infinity)));
    if (p.limit) groups = groups.slice(0, p.limit);
  }
  await audit(createServiceClient(), { actor_id: ctx.userId, action: 'ask_crm', module: p.module, meta: { question: question.slice(0, 300), fn: p.fn, groupBy: p.groupBy ?? null } });
  return { ok: true as const, explanation: p.explanation, module: mod.label, value: groups ? null : agg(rows), groups, records: rows.length, interpretation: { fn: p.fn, field: p.field ?? null, criteria, groupBy: p.groupBy ?? null } };
}

// ---------------------------------------------------------------------------
// AI email draft (human edits it; it still goes through the Outbox)
// ---------------------------------------------------------------------------

export async function aiDraft(ctx: CrmContext, meta: Meta, recordId: string, purpose: string) {
  const raw = await (await import('./records')).loadRecordRaw(createServiceClient(), recordId);
  if (!raw) throw new CrmAccessError('Record not found.');
  const rec = await getRecord(ctx, meta, raw.module, recordId);
  if (raw.locked?.kind === 'dpdp_restricted' || raw.locked?.kind === 'dpdp_erased') throw new CrmUserError('A privacy request applies to this person, so Iris won’t draft for them.');
  const goal = String(purpose ?? '').slice(0, 200) || 'a helpful check-in';
  const profilingOff = rec.data.consent_profiling === 'Withdrawn';
  // data minimisation: the name never leaves MECE (the draft uses the {{first_name}} merge tag);
  // only plan and usage counts go to the model, and nothing at all for someone who opted out of profiling
  const facts = profilingOff ? 'Nothing (they opted out of personalisation).' : `Plan: ${rec.data.mece_tier ?? 'unknown'}. Cases solved: ${rec.data.mece_cases_solved ?? 'unknown'}. Placement focus: ${rec.data.mece_placement_focus ?? 'unknown'}.`;
  const txt = await llmComplete(
    'You write short, warm, honest emails for MECE, an Indian MBA placement-prep platform (case interviews, guesstimates). Plain text. No made-up facts, discounts or deadlines. 80–120 words. Reply as JSON {"subject","body"}. Use {{first_name}} for the name.',
    `Goal: ${goal}\nAbout the person: ${facts}`, { json: true, maxTokens: 400 },
  );
  let subject = '';
  let body = '';
  let source = 'template';
  if (txt) {
    try { const j = JSON.parse(txt) as { subject?: string; body?: string }; subject = String(j.subject ?? '').slice(0, 200); body = String(j.body ?? '').slice(0, 4000); source = 'ai'; } catch { /* fall back */ }
  }
  if (!subject || !body) {
    subject = `{{first_name}}, a quick note from MECE`;
    body = `Hi {{first_name}},\n\n${goal.charAt(0).toUpperCase()}${goal.slice(1)} — I wanted to reach out personally.\n\n[Add one specific, true sentence about their prep here.]\n\nReply to this email if there is anything we can do better.\n\n{{owner_name}}`;
  }
  await audit(createServiceClient(), { actor_id: ctx.userId, action: 'ai_draft', module: rec.module, record_id: rec.id, meta: { source, profilingOff } });
  return { subject, body, source, note: source === 'ai' ? 'Draft by Iris — read and edit before sending. It still waits for approval in the Outbox.' : 'Iris has no language model configured, so this is a template to edit.' };
}

// ---------------------------------------------------------------------------
// AI overview page
// ---------------------------------------------------------------------------

export async function aiOverview(ctx: CrmContext, meta: Meta) {
  if (!canSetup(ctx, 'manage_ai') && !canSetup(ctx, 'view_analytics')) throw new CrmAccessError();
  const svc = createServiceClient();
  const [churn, conv] = await Promise.all([activeModel(svc, 'churn'), activeModel(svc, 'conversion')]);
  const { data: preds } = await svc.from('crm_config').select('id, name, module, config, active').eq('kind', 'prediction').order('name');
  const predictions = [];
  for (const p of (preds ?? []) as Array<{ id: string; name: string; module: string; config: PredictionConfig; active: boolean }>) {
    const m = await activeModel(svc, 'prediction', p.id);
    predictions.push({ ...p, model: m ? { version: m.version, metrics: m.metrics, trainedAt: m.trained_at } : null });
  }
  const contacts = (await queryAll(ctx, meta, 'contacts', { match: 'all', conditions: [{ field: 'mece_internal', op: 'neq', value: true }, { field: 'health_score', op: 'not_empty' }] }, 50_000)).rows;
  const dist = { excellent: 0, good: 0, attention: 0 };
  for (const c of contacts) { const h = Number(c.data.health_score); if (h >= 76) dist.excellent++; else if (h >= 51) dist.good++; else dist.attention++; }
  const atRiskDeals = (await queryAll(ctx, meta, 'deals', { match: 'all', conditions: [{ field: 'deal_health', op: 'lt', value: 51 }] }, 5000)).rows.slice(0, 20).map((d) => ({ id: d.id, name: d.name, health: d.data.deal_health, stage: d.data.stage, amount: d.data.amount }));
  const highRisk = contacts.filter((c) => Number(c.data.churn_risk) >= 70 && Number(c.data.mece_payments_count) > 0).slice(0, 20).map((c) => ({ id: c.id, name: c.name, risk: c.data.churn_risk, nba: c.data.next_best_action }));
  const { data: fb } = await svc.from('crm_ai_feedback').select('kind, verdict, value, reason, created_at, record_id, user_id').order('created_at', { ascending: false }).limit(50);
  const { count: profilingOff } = await svc.from('crm_records').select('id', { count: 'exact', head: true }).in('module', ['contacts', 'leads']).eq('data->>consent_profiling', 'Withdrawn');
  const meta2 = (m: Awaited<ReturnType<typeof activeModel>>) => (m ? { version: m.version, metrics: m.metrics, trainedAt: m.trained_at } : null);
  return { churn: meta2(churn), conversion: meta2(conv), predictions, healthDistribution: dist, scored: contacts.length, atRiskDeals, highRisk, feedback: fb ?? [], profilingOff: profilingOff ?? 0, llm: llmAvailable(), canManage: canSetup(ctx, 'manage_ai') };
}

export { SYSTEM_CTX };

/**
 * The pure half of saving a record: permission + type checks, defaults,
 * required fields, deal stage → probability/forecast, line totals, formulas
 * and the record name. The server half (records.ts) adds uniqueness, locks,
 * auto-numbers, the write itself, audit, and automation.
 */
import { coerceValue, computeTotals, FieldError, isEmpty } from './fields';
import { castFormula, evalFormula, parseFormula } from './formula';
import { recordName } from './modules';
import { fieldAccess } from './permissions';
import type { CrmContext, CrmRecord, FieldDef, LineItem, ModuleDef, PipelineConfig } from './types';

export interface PrepareInput {
  module: ModuleDef;
  fields: FieldDef[];
  existing: Pick<CrmRecord, 'data' | 'external_key'> | null;
  patch: Record<string, unknown>;
  ctx: CrmContext;
  /** system fields this internal caller may set (conversion, SLA, sync) */
  allowSystem?: string[];
  /** set by sync and trusted internal callers: synced fields may be written */
  allowSynced?: boolean;
  pipelines?: Array<{ name: string; active: boolean; config: PipelineConfig }>;
  defaultPipeline?: string;
  /** extra required fields from layout rules */
  extraRequired?: string[];
  now?: Date;
}

export interface PrepareResult {
  data: Record<string, unknown>;
  name: string;
  changed: string[];
  errors: Array<{ field: string; message: string }>;
}

const COMPUTED = new Set(['autonumber', 'formula', 'rollup', 'json']);

/** A record mirrors a MECE row (user, payment, report …) when it has an external key. */
export function isSyncedRecord(r: Pick<CrmRecord, 'external_key'> | null | undefined): boolean {
  return !!r?.external_key;
}

/**
 * Synced fields the CRM may still edit, by module and external-key prefix.
 * A renewal deal is created by sync but worked by people (reminder sent,
 * win-back offer); a case comes from an in-app report but its status and
 * triage belong to support.
 */
export const SYNC_UNLOCKED: Record<string, Record<string, string[]>> = {
  deals: { 'renewal:': ['stage', 'lost_reason', 'probability'] },
  cases: { 'report:': ['status', 'type', 'contact_id'] },
};

export function syncedFieldLocked(module: string, externalKey: string | null | undefined, field: string): boolean {
  if (!externalKey) return false;
  const rules = SYNC_UNLOCKED[module] ?? {};
  for (const [prefix, unlocked] of Object.entries(rules)) {
    if (externalKey.startsWith(prefix) && unlocked.includes(field)) return false;
  }
  return true;
}

export function prepareRecord(i: PrepareInput): PrepareResult {
  const errors: PrepareResult['errors'] = [];
  const byName = new Map(i.fields.map((f) => [f.api_name, f]));
  const isCreate = !i.existing;
  const synced = isSyncedRecord(i.existing);
  const allowSystem = new Set(i.allowSystem ?? []);
  const coerced: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(i.patch)) {
    const f = byName.get(key);
    if (!f || f.active === false) {
      errors.push({ field: key, message: `Unknown field "${key}".` });
      continue;
    }
    const label = f.label;
    if (!allowSystem.has(key)) {
      const access = fieldAccess(i.ctx, i.module.api_name, key);
      if (access !== 'rw') {
        errors.push({ field: key, message: `You can't edit ${label}.` });
        continue;
      }
      if (f.system || f.readonly || COMPUTED.has(f.type)) {
        errors.push({ field: key, message: `${label} is set automatically.` });
        continue;
      }
      if (f.synced && synced && !i.allowSynced && syncedFieldLocked(i.module.api_name, i.existing?.external_key, key)) {
        errors.push({ field: key, message: `${label} comes from MECE and can't be edited here.` });
        continue;
      }
    }
    try {
      coerced[key] = COMPUTED.has(f.type) && allowSystem.has(key) ? raw : coerceValue(f, raw);
    } catch (e) {
      errors.push({ field: key, message: e instanceof FieldError ? `${label} ${e.message}` : `${label} is invalid.` });
    }
  }

  const data: Record<string, unknown> = { ...(i.existing?.data ?? {}), ...coerced };

  // Defaults on create
  if (isCreate) {
    for (const f of i.fields) {
      const d = f.options?.defaultValue;
      if (d !== undefined && isEmpty(data[f.api_name]) && f.active !== false) {
        try {
          data[f.api_name] = COMPUTED.has(f.type) ? null : coerceValue(f, d);
        } catch {
          /* bad default: ignore */
        }
      }
    }
  }

  // Deals: pipeline + stage drive probability and forecast category
  if (i.module.api_name === 'deals' && i.pipelines) {
    const pipes = i.pipelines.filter((p) => p.active);
    let pipe = pipes.find((p) => p.name === data.pipeline);
    if (!pipe && (isCreate || 'pipeline' in coerced)) {
      if (data.pipeline) errors.push({ field: 'pipeline', message: 'Pipeline is not one of the active pipelines.' });
      pipe = pipes.find((p) => p.name === i.defaultPipeline) ?? pipes[0];
      if (pipe && !data.pipeline) data.pipeline = pipe.name;
    }
    if (pipe) {
      const stages = pipe.config.stages;
      let stage = stages.find((s) => s.key === data.stage || s.label === data.stage);
      if (!stage) {
        if (isCreate && isEmpty(data.stage)) stage = stages[0];
        else if ('stage' in coerced || 'pipeline' in coerced || isCreate) {
          errors.push({ field: 'stage', message: `Stage must be one of: ${stages.map((s) => s.label).join(', ')}.` });
        }
      }
      if (stage) {
        const stageChanged = data.stage !== stage.key || 'stage' in coerced || isCreate;
        data.stage = stage.key;
        if (stageChanged && !('probability' in coerced)) data.probability = stage.probability;
        data.forecast_category = stage.forecast;
      }
    }
  }

  // Line items → totals
  const li = i.fields.find((f) => f.type === 'line_items' && f.options?.mode !== 'pricebook');
  if (li && byName.has('grand_total')) {
    const items = (Array.isArray(data[li.api_name]) ? data[li.api_name] : []) as LineItem[];
    const t = computeTotals(items, typeof data.adjustment === 'number' ? data.adjustment : 0);
    Object.assign(data, t);
  }

  // Required fields
  const extra = new Set(i.extraRequired ?? []);
  for (const f of i.fields) {
    if (f.active === false || COMPUTED.has(f.type) || f.system) continue;
    if (!(f.required || extra.has(f.api_name))) continue;
    const touched = isCreate || f.api_name in i.patch;
    if (touched && isEmpty(data[f.api_name]) && !(synced && f.synced)) {
      errors.push({ field: f.api_name, message: `${f.label} is required.` });
    }
  }

  // Formulas (two passes so a formula may reference another formula)
  const formulas = i.fields.filter((f) => f.type === 'formula' && f.options?.expr);
  for (let pass = 0; pass < 2; pass++) {
    for (const f of formulas) {
      try {
        const tree = parseFormula(f.options!.expr!, i.fields.map((x) => x.api_name));
        data[f.api_name] = castFormula(evalFormula(tree, data, i.now), f.options?.returns);
      } catch {
        data[f.api_name] = null;
      }
    }
  }

  const name = recordName(i.module.settings, data);
  if (!name && !errors.some((e) => i.module.settings.nameFields.includes(e.field))) {
    errors.push({ field: i.module.settings.nameFields[0], message: 'A name is required.' });
  }

  const before = i.existing?.data ?? {};
  const changed = Object.keys(data).filter((k) => JSON.stringify(before[k] ?? null) !== JSON.stringify(data[k] ?? null));
  return { data, name, changed, errors };
}

/** Field-level diff for the audit log. Hidden from nobody — audit is admin-only. */
export function diff(before: Record<string, unknown>, after: Record<string, unknown>, keys: string[]) {
  const out: Record<string, { from: unknown; to: unknown }> = {};
  for (const k of keys) out[k] = { from: before[k] ?? null, to: after[k] ?? null };
  return out;
}

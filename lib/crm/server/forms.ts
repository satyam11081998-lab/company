/**
 * Web forms (web-to-lead, web-to-case, any module). Public page /f/<key>,
 * public POST /api/crm/forms/<key>.
 *
 * Abuse controls, all server-side:
 *  - only fields the form lists are accepted; hidden fields take their value
 *    from the form config, never from the browser,
 *  - honeypot field + a signed render timestamp (too fast / too old = spam),
 *  - per-IP limits (5 per form per hour, 20 per day overall) using a salted
 *    hash of the IP — the raw IP is never stored,
 *  - optional Cloudflare Turnstile when TURNSTILE_SECRET_KEY is set,
 *  - consent (DPDP notice) recorded with the exact text shown.
 */
import { createHash, randomBytes } from 'crypto';
import { createServiceClient } from '@/lib/crm/server/svc';
import { canSetup } from '@/lib/crm/permissions';
import { isEmpty, isUuid } from '@/lib/crm/fields';
import type { CrmContext, FieldDef } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { audit } from './db';
import { createRecord, notify, SaveError } from './records';
import { isActiveMember } from './members';
import { queueEmails, sign, verify } from './outbox';
import { validateTemplate } from '@/lib/crm/templates';
import type { Meta } from './meta';
import { PURPOSES, type Purpose } from '@/lib/crm/privacy';
import { blocklistHash } from './blocklist';
import { recordConsent } from './privacy';

export interface WebformField { field: string; label?: string; required?: boolean; hidden?: boolean; value?: string }
export interface WebformConfig {
  module: string;
  title: string;
  intro?: string;
  button?: string;
  thankYou?: string;
  fields: WebformField[];
  ownerId?: string | null;
  consent?: { required: boolean; text: string; purposes?: Purpose[] };
  autoResponseTemplateId?: string | null;
  notifyOwner?: boolean;
  abTest?: boolean;
  variantB?: { title?: string; intro?: string; button?: string };
}

const FORM_TYPES = new Set(['text', 'textarea', 'email', 'phone', 'url', 'integer', 'decimal', 'currency', 'percent', 'date', 'boolean', 'picklist', 'multipicklist']);

export function cleanWebform(raw: unknown, meta: Meta): WebformConfig {
  const r = (raw ?? {}) as Partial<WebformConfig>;
  const module = String(r.module ?? 'leads');
  const mod = meta.module(module);
  if (!mod) throw new CrmUserError('Pick a module.');
  const fields = meta.fields(module);
  const seen = new Set<string>();
  const out: WebformField[] = [];
  for (const f of (Array.isArray(r.fields) ? r.fields : []).slice(0, 30)) {
    const def = fields.find((x) => x.api_name === f?.field);
    if (!def || seen.has(def.api_name) || def.system || def.readonly || !FORM_TYPES.has(def.type)) continue;
    seen.add(def.api_name);
    const hidden = !!f.hidden;
    const value = hidden ? String(f.value ?? '').slice(0, 255) : undefined;
    if (hidden && (!!f.required || !!def.required) && !value) throw new CrmUserError(`"${def.label}" is hidden and required, so give it a value.`);
    out.push({ field: def.api_name, label: f.label ? String(f.label).slice(0, 120) : undefined, required: !!f.required || !!def.required, hidden, value });
  }
  // every required field of the module must be on the form (shown or hidden with a value)
  for (const def of fields.filter((x) => x.required && x.active !== false && !x.system)) {
    if (!out.some((f) => f.field === def.api_name)) throw new CrmUserError(`The form must include "${def.label}" (it's required).`);
  }
  if (!out.length) throw new CrmUserError('Add at least one field.');
  return {
    module, title: String(r.title ?? 'Get in touch').slice(0, 120), intro: r.intro ? String(r.intro).slice(0, 1000) : undefined,
    button: String(r.button ?? 'Submit').slice(0, 40), thankYou: String(r.thankYou ?? 'Thanks — we’ll be in touch shortly.').slice(0, 500),
    fields: out, ownerId: isUuid(r.ownerId) ? r.ownerId : null,
    consent: r.consent?.text ? {
      required: !!r.consent.required, text: String(r.consent.text).slice(0, 1000),
      purposes: (Array.isArray(r.consent.purposes) ? r.consent.purposes : ['marketing']).filter((x: unknown): x is Purpose => (PURPOSES as readonly unknown[]).includes(x)).slice(0, 4),
    } : undefined,
    autoResponseTemplateId: isUuid(r.autoResponseTemplateId) ? r.autoResponseTemplateId : null,
    notifyOwner: r.notifyOwner !== false, abTest: !!r.abTest,
    variantB: r.variantB ? { title: r.variantB.title?.slice(0, 120), intro: r.variantB.intro?.slice(0, 1000), button: r.variantB.button?.slice(0, 40) } : undefined,
  };
}

export async function saveWebform(ctx: CrmContext, meta: Meta, input: { id?: string | null; name: string; active?: boolean; config: unknown }) {
  if (!canSetup(ctx, 'manage_marketing')) throw new CrmAccessError('You can’t manage web forms.');
  const config = cleanWebform(input.config, meta);
  if (config.ownerId && !(await isActiveMember(config.ownerId))) throw new CrmUserError('The owner must be an active CRM user.');
  const svc = createServiceClient();
  const name = String(input.name ?? '').trim().slice(0, 120) || config.title;
  if (input.id) {
    if (!isUuid(input.id)) throw new CrmAccessError('Form not found.');
    const { error } = await svc.from('crm_config').update({ name, active: input.active !== false, config, module: config.module, updated_by: ctx.userId, updated_at: new Date().toISOString() }).eq('id', input.id).eq('kind', 'webform');
    if (error) throw error;
    await audit(svc, { actor_id: ctx.userId, action: 'webform_save', module: config.module, meta: { name } });
    return input.id;
  }
  const key = randomBytes(9).toString('base64url');
  const { data, error } = await svc.from('crm_config').insert({ kind: 'webform', module: config.module, name, active: input.active !== false, public_key: key, config, created_by: ctx.userId }).select('id').single();
  if (error) throw error.code === '23505' ? new CrmUserError('A form with this name exists.') : error;
  await audit(svc, { actor_id: ctx.userId, action: 'webform_create', module: config.module, meta: { name } });
  return (data as { id: string }).id;
}

export async function loadPublicForm(key: string) {
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(key)) return null;
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('id, name, active, config').eq('kind', 'webform').eq('public_key', key).maybeSingle();
  const f = data as { id: string; name: string; active: boolean; config: WebformConfig } | null;
  return f && f.active ? f : null;
}

export function renderToken(formId: string): string {
  const ts = Date.now().toString(36);
  return `${ts}.${sign(`f.${formId}.${ts}`)}`;
}

function tokenAgeMs(formId: string, token: string): number | null {
  const [ts, sig] = String(token ?? '').split('.');
  if (!ts || !sig || !verify(`f.${formId}.${ts}`, sig)) return null;
  const t = parseInt(ts, 36);
  return Number.isFinite(t) ? Date.now() - t : null;
}

/** Keyed hash of the IP (HMAC via the CRM signing key): rate limits work, the raw IP is never stored. */
export function hashIp(ip: string): string {
  return createHash('sha256').update(sign(`ip.${ip}`)).digest('hex').slice(0, 32);
}

async function turnstileOk(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== 'string' || !token) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: new URLSearchParams({ secret, response: token, remoteip: ip }), signal: AbortSignal.timeout(5000),
    });
    return !!((await r.json()) as { success?: boolean }).success;
  } catch {
    return false;
  }
}

export type SubmitOutcome = { status: 200 | 400 | 404 | 429; body: { ok: boolean; message: string; errors?: Record<string, string> } };

export async function submitForm(meta: Meta, key: string, payload: unknown, ip: string): Promise<SubmitOutcome> {
  const form = await loadPublicForm(key);
  if (!form) return { status: 404, body: { ok: false, message: 'This form is no longer available.' } };
  const p = (payload && typeof payload === 'object' ? payload : {}) as { fields?: Record<string, unknown>; hp?: string; t?: string; variant?: string; consent?: boolean; turnstile?: string };
  const svc = createServiceClient();
  const ipHash = hashIp(ip || 'unknown');
  const variant = p.variant === 'B' ? 'B' : 'A';
  const log = (status: string, recordId: string | null = null, consent: unknown = null) =>
    svc.from('crm_form_submissions').insert({ form_id: form.id, variant, ip_hash: ipHash, status, record_id: recordId, consent });

  // Spam: honeypot filled, or submitted faster than a person could, or a forged/expired token.
  const age = tokenAgeMs(form.id, String(p.t ?? ''));
  if ((typeof p.hp === 'string' && p.hp.trim() !== '') || age === null || age < 2500 || age > 86_400_000) {
    await log('spam');
    // look successful to bots
    return { status: 200, body: { ok: true, message: form.config.thankYou ?? 'Thanks!' } };
  }
  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  const [{ count: perForm }, { count: perDay }] = await Promise.all([
    svc.from('crm_form_submissions').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).eq('form_id', form.id).eq('status', 'accepted').gte('created_at', hourAgo),
    svc.from('crm_form_submissions').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', dayAgo),
  ]);
  if ((perForm ?? 0) >= 5 || (perDay ?? 0) >= 20) {
    await log('rate_limited');
    return { status: 429, body: { ok: false, message: 'Too many submissions from your network. Please try again later.' } };
  }
  if (!(await turnstileOk(p.turnstile, ip))) {
    await log('spam');
    return { status: 400, body: { ok: false, message: 'Please complete the check and try again.' } };
  }
  const cfg = form.config;
  if (cfg.consent?.required && p.consent !== true) {
    await log('invalid');
    return { status: 400, body: { ok: false, message: 'Please tick the consent box to continue.', errors: { _consent: 'Required' } } };
  }
  const input = (p.fields && typeof p.fields === 'object' ? p.fields : {}) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  const defs = new Map<string, FieldDef>(meta.fields(cfg.module).map((f) => [f.api_name, f]));
  for (const f of cfg.fields) {
    const def = defs.get(f.field);
    // re-checked at submit time: a field made read-only/system after the form was saved is never writable from outside
    if (!def || def.active === false || def.system || def.readonly || !FORM_TYPES.has(def.type)) continue;
    const v = f.hidden ? f.value : input[f.field];
    if (isEmpty(v)) {
      if (f.required && !f.hidden) errors[f.field] = `${f.label || def.label} is required.`;
      continue;
    }
    patch[f.field] = typeof v === 'string' ? v.slice(0, 32_000) : v;
  }
  if (Object.keys(errors).length) {
    await log('invalid');
    return { status: 400, body: { ok: false, message: 'Please fill in the required fields.', errors } };
  }
  if (cfg.module === 'leads' && isEmpty(patch.lead_source)) patch.lead_source = 'Web form';
  if (cfg.module === 'cases' && isEmpty(patch.case_origin)) patch.case_origin = 'Web form';
  const consent = cfg.consent ? { given: p.consent === true, text: cfg.consent.text, at: new Date().toISOString() } : null;
  let ownerId: string | null = null;
  if (cfg.ownerId && (await isActiveMember(cfg.ownerId))) ownerId = cfg.ownerId;
  try {
    const rec = await createRecord(null, meta, cfg.module, patch, {
      actorKind: 'public', source: 'webform', sourceRef: form.id, ownerId, allowDuplicate: true, tags: ['web form'],
    });
    await log('accepted', rec.id, consent);
    // DPDP consent ledger: one row per purpose named in the notice, with the exact text shown
    if (cfg.consent && p.consent === true) {
      for (const purpose of cfg.consent.purposes?.length ? cfg.consent.purposes : (['marketing'] as Purpose[])) {
        await recordConsent(svc, { recordId: rec.id, purpose, status: 'given', notice: cfg.consent.text, channel: 'webform', evidence: { form: form.id, variant } });
      }
    }
    // someone who was erased and comes back through a form of their own accord is no longer blocked
    const email = typeof rec.data.email === 'string' ? rec.data.email : null;
    if (email) {
      const { data: un } = await svc.from('crm_blocklist').delete().eq('email_hash', blocklistHash(email)).select('email_hash');
      if (un?.length) await audit(svc, { actor_id: null, actor_kind: 'public', action: 'blocklist_cleared', module: cfg.module, record_id: rec.id, meta: { reason: 'new web-form submission' } });
    }
    await audit(svc, { actor_id: null, actor_kind: 'public', action: 'webform_submit', module: cfg.module, record_id: rec.id, meta: { form: form.name, variant } });
    if (ownerId && cfg.notifyOwner) await notify(svc, ownerId, 'webform', `New ${meta.module(cfg.module)?.singular.toLowerCase()} from “${form.name}”`, rec.name, `/crm/m/${cfg.module}/${rec.id}`);
    if (cfg.autoResponseTemplateId) {
      const { data: t } = await svc.from('crm_config').select('id, config').eq('id', cfg.autoResponseTemplateId).eq('kind', 'email_template').maybeSingle();
      if (t) {
        try {
          await queueEmails(null, meta, { module: cfg.module, recordIds: [rec.id], template: validateTemplate((t as { config: unknown }).config), templateId: (t as { id: string }).id, source: 'webform', sourceId: form.id, dedupe: (rid) => `webform:${form.id}:${rid}` });
        } catch (e) {
          console.error('[crm] web-form auto-response not queued:', e);
        }
      }
    }
    return { status: 200, body: { ok: true, message: cfg.thankYou ?? 'Thanks!' } };
  } catch (e) {
    if (e instanceof SaveError) {
      await log('invalid');
      return { status: 400, body: { ok: false, message: 'Please check the highlighted fields.', errors: Object.fromEntries(e.errors.map((x) => [x.field, x.message])) } };
    }
    throw e;
  }
}

export async function formStats(formId: string) {
  const svc = createServiceClient();
  const [{ data: views }, { data: subs }] = await Promise.all([
    svc.from('crm_form_views').select('variant, views').eq('form_id', formId),
    svc.from('crm_form_submissions').select('variant, status').eq('form_id', formId).limit(20_000),
  ]);
  const out: Record<string, { views: number; accepted: number; spam: number; rate: number | null }> = {};
  for (const v of (views ?? []) as Array<{ variant: string; views: number }>) {
    out[v.variant] ??= { views: 0, accepted: 0, spam: 0, rate: null };
    out[v.variant].views += v.views;
  }
  for (const s of (subs ?? []) as Array<{ variant: string | null; status: string }>) {
    const k = s.variant ?? 'A';
    out[k] ??= { views: 0, accepted: 0, spam: 0, rate: null };
    if (s.status === 'accepted') out[k].accepted++;
    if (s.status === 'spam') out[k].spam++;
  }
  for (const k of Object.keys(out)) out[k].rate = out[k].views ? Math.round((out[k].accepted / out[k].views) * 1000) / 10 : null;
  return out;
}

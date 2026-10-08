/**
 * Marketing admin: email templates, segments, one-off emails from a record,
 * and the Outbox list/settings. Every function checks its own permission.
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import { can, canSetup, allows } from '@/lib/crm/permissions';
import { isUuid } from '@/lib/crm/fields';
import { mergeFieldsIn, validateTemplate, type TemplateConfig } from '@/lib/crm/templates';
import type { CrmContext } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { audit, fetchAll } from './db';
import { queueEmails, renderEmail } from './outbox';
import { accessTo, getRecord } from './records';
import { cleanSegment, type SegmentConfig } from './segments';
import { loadMembers } from './members';
import type { Meta } from './meta';

const DEFAULT_TEMPLATES: Array<{ name: string; config: TemplateConfig }> = [
  {
    name: 'Welcome nudge — first case',
    config: {
      subject: '{{first_name}}, your first case takes 15 minutes',
      heading: 'Start with one case today',
      body: 'Hi {{first_name}},\n\nMost people who crack consulting interviews practise one case a day. Your first one takes about 15 minutes and you get a detailed score at the end.\n\n- Pick any case from the practice page\n- Talk or type through it\n- See exactly where you lost marks',
      cta: { label: 'Solve my first case', url: 'https://www.mece.in/practice' },
      category: 'marketing',
    },
  },
  {
    name: 'Win-back — inactive 45 days',
    config: {
      subject: 'We kept your progress, {{first_name}}',
      heading: 'Your prep is right where you left it',
      body: 'Hi {{first_name}},\n\nYou have solved **{{mece_cases_solved}}** cases on MECE. Placement season moves fast — one case a day keeps the structure fresh.\n\nReply to this email if something stopped you; we read every reply.',
      cta: { label: 'Continue practising', url: 'https://www.mece.in/dashboard' },
      category: 'marketing',
    },
  },
  {
    name: 'Renewal reminder',
    config: {
      subject: 'Your MECE {{plan}} plan renews soon',
      heading: 'Keep your plan going',
      body: 'Hi {{first_name}},\n\nYour **{{plan}}** plan ends on {{mece_plan_expires_at}}. Renew to keep unlimited cases, voice interviews and your full history.',
      cta: { label: 'Renew my plan', url: 'https://www.mece.in/upgrade' },
      category: 'marketing',
    },
  },
  {
    name: 'Support reply',
    config: {
      subject: 'Re: {{subject}} ({{case_number}})',
      heading: 'About your request',
      body: 'Hi {{first_name}},\n\nThanks for writing in about **{{subject}}**.\n\n[Write the answer here.]\n\n{{owner_name}}, Team MECE',
      cta: null,
      category: 'service',
    },
  },
  {
    name: 'Campus partnership intro (B2B)',
    config: {
      subject: 'Placement prep for {{company}} students',
      heading: 'A placement-prep partnership',
      body: 'Hi {{first_name}},\n\nMECE helps MBA students practise case, guesstimate and HR interviews with instant, detailed feedback. Several placement committees use it before the summer and final placement seasons.\n\nWould a 20-minute call next week work to see if it fits {{company}}?\n\n{{owner_name}}',
      cta: null,
      category: 'marketing',
    },
  },
];

export async function ensureDefaultTemplates() {
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('id').eq('kind', 'email_template').limit(1);
  if (data?.length) return;
  const { error } = await svc.from('crm_config').insert(DEFAULT_TEMPLATES.map((t, i) => ({ kind: 'email_template', name: t.name, position: (i + 1) * 10, config: t.config })));
  if (error && error.code !== '23505') throw error;
}

export async function listTemplates() {
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('id, name, active, config, updated_at').eq('kind', 'email_template').order('position').order('name');
  return ((data ?? []) as Array<{ id: string; name: string; active: boolean; config: TemplateConfig; updated_at: string }>);
}

export async function saveTemplate(ctx: CrmContext, input: { id?: string | null; name: string; active?: boolean; config: unknown }) {
  if (!canSetup(ctx, 'manage_marketing')) throw new CrmAccessError('You can’t manage email templates.');
  let config: TemplateConfig;
  try { config = validateTemplate(input.config); } catch (e) { throw new CrmUserError((e as Error).message); }
  const name = String(input.name ?? '').trim().slice(0, 120);
  if (!name) throw new CrmUserError('Give the template a name.');
  const svc = createServiceClient();
  if (input.id) {
    if (!isUuid(input.id)) throw new CrmAccessError('Template not found.');
    const { error } = await svc.from('crm_config').update({ name, active: input.active !== false, config, updated_by: ctx.userId, updated_at: new Date().toISOString() }).eq('id', input.id).eq('kind', 'email_template');
    if (error) throw error.code === '23505' ? new CrmUserError('A template with this name exists.') : error;
    await audit(svc, { actor_id: ctx.userId, action: 'template_save', meta: { name } });
    return input.id;
  }
  const { data, error } = await svc.from('crm_config').insert({ kind: 'email_template', name, active: input.active !== false, config, created_by: ctx.userId }).select('id').single();
  if (error) throw error.code === '23505' ? new CrmUserError('A template with this name exists.') : error;
  await audit(svc, { actor_id: ctx.userId, action: 'template_create', meta: { name } });
  return (data as { id: string }).id;
}

/** Preview a template against a sample (or a specific visible) record. */
export async function previewTemplate(ctx: CrmContext, meta: Meta, input: { config: unknown; module: string; recordId?: string | null }) {
  let t: TemplateConfig;
  try { t = validateTemplate(input.config); } catch (e) { throw new CrmUserError((e as Error).message); }
  const mod = meta.module(input.module);
  if (!mod) throw new CrmUserError('Pick a module.');
  let values: Record<string, unknown> = {
    first_name: 'Aarav', full_name: 'Aarav Sharma', name: 'Aarav Sharma', owner_name: 'Team MECE', college: 'IIM Lucknow', company: 'IIM Lucknow',
    plan: 'Pro', mece_cases_solved: 12, mece_plan_expires_at: '2026-11-30', subject: 'Voice interview stopped halfway', case_number: 'CS-00042',
    survey_link: 'https://www.mece.in/survey/preview',
  };
  if (input.recordId) {
    const rec = await getRecord(ctx, meta, mod.api_name, input.recordId);
    const full = String(rec.data.full_name ?? [rec.data.first_name, rec.data.last_name].filter(Boolean).join(' ') ?? rec.name);
    values = { ...values, ...rec.data, full_name: full || rec.name, name: full || rec.name, first_name: (rec.data.first_name as string) || full.split(/\s+/)[0] || 'there' };
  }
  const known = new Set([...meta.fields(mod.api_name).map((f) => f.api_name), ...Object.keys(values)]);
  const unknown = [...mergeFieldsIn(t.subject), ...mergeFieldsIn(t.body), ...(t.cta ? mergeFieldsIn(t.cta.url) : [])].filter((f) => !known.has(f));
  const r = renderEmail(t, values, '00000000-0000-4000-8000-000000000000', { marketing: t.category !== 'service', unsubscribe: 'https://www.mece.in/api/unsubscribe?preview=1', intl: false });
  return { subject: r.subject, html: r.html, unknownFields: [...new Set(unknown)] };
}

// ---------------------------------------------------------------------------
// One-off email from a record ("Send email" on a lead/contact/case)
// ---------------------------------------------------------------------------

export async function composeEmail(ctx: CrmContext, meta: Meta, input: { module: string; recordId: string; templateId?: string | null; config?: unknown; sendNow?: boolean }) {
  const mod = meta.module(input.module);
  if (!mod) throw new CrmAccessError('Module not found.');
  if (!can(ctx, mod.api_name, 'email')) throw new CrmAccessError(`You can’t email ${mod.label.toLowerCase()}.`);
  const rec = await getRecord(ctx, meta, mod.api_name, input.recordId);
  if (!allows(accessTo(ctx, meta, rec), 'read')) throw new CrmAccessError('Record not found.');
  let template: TemplateConfig;
  let templateId: string | null = null;
  if (input.templateId) {
    if (!isUuid(input.templateId)) throw new CrmUserError('Pick a template.');
    const svc = createServiceClient();
    const { data } = await svc.from('crm_config').select('id, config').eq('id', input.templateId).eq('kind', 'email_template').maybeSingle();
    if (!data) throw new CrmUserError('That template no longer exists.');
    templateId = input.templateId;
    // the composer may have edited the template text before sending
    try { template = validateTemplate(input.config ?? (data as { config: unknown }).config); } catch (e) { throw new CrmUserError((e as Error).message); }
  } else {
    try { template = validateTemplate(input.config); } catch (e) { throw new CrmUserError((e as Error).message); }
  }
  if (mod.api_name === 'cases') template = { ...template, category: 'service' };
  const res = await queueEmails(ctx, meta, {
    module: mod.api_name, recordIds: [rec.id], template, templateId, source: 'manual', sendNow: !!input.sendNow,
  });
  if (res.noEmail) throw new CrmUserError('This record has no email address.');
  return res;
}

// ---------------------------------------------------------------------------
// Segments (save / delete); compute & refresh live in segments.ts
// ---------------------------------------------------------------------------

export async function saveSegment(ctx: CrmContext, meta: Meta, input: { id?: string | null; name: string; config: unknown }) {
  if (!canSetup(ctx, 'manage_marketing')) throw new CrmAccessError('You can’t manage segments.');
  const config: SegmentConfig = cleanSegment(input.config, meta);
  const name = String(input.name ?? '').trim().slice(0, 120);
  if (!name) throw new CrmUserError('Give the segment a name.');
  const svc = createServiceClient();
  if (input.id) {
    if (!isUuid(input.id)) throw new CrmAccessError('Segment not found.');
    const { data: ex } = await svc.from('crm_config').select('config').eq('id', input.id).eq('kind', 'segment').maybeSingle();
    if (!ex) throw new CrmAccessError('Segment not found.');
    const keep = (ex as { config: SegmentConfig }).config.lastRefresh;
    const { error } = await svc.from('crm_config').update({ name, module: config.module, config: { ...config, lastRefresh: keep }, updated_by: ctx.userId, updated_at: new Date().toISOString() }).eq('id', input.id);
    if (error) throw error.code === '23505' ? new CrmUserError('A segment with this name exists.') : error;
    await audit(svc, { actor_id: ctx.userId, action: 'segment_save', module: config.module, meta: { name } });
    return input.id;
  }
  const { data, error } = await svc.from('crm_config').insert({ kind: 'segment', module: config.module, name, config, created_by: ctx.userId }).select('id').single();
  if (error) throw error.code === '23505' ? new CrmUserError('A segment with this name exists.') : error;
  await audit(svc, { actor_id: ctx.userId, action: 'segment_create', module: config.module, meta: { name } });
  return (data as { id: string }).id;
}

// ---------------------------------------------------------------------------
// Outbox
// ---------------------------------------------------------------------------

export const OUTBOX_STATUSES = ['pending', 'approved', 'sending', 'sent', 'suppressed', 'rejected', 'failed', 'cancelled'] as const;

export async function listOutbox(ctx: CrmContext, status: string, page = 1) {
  if (!canSetup(ctx, 'approve_outbox') && !canSetup(ctx, 'manage_marketing')) throw new CrmAccessError();
  const st = (OUTBOX_STATUSES as readonly string[]).includes(status) ? status : 'pending';
  const svc = createServiceClient();
  const size = 50;
  const { data, count } = await svc.from('crm_outbox')
    .select('id, record_id, to_email, to_name, subject, category, source, status, status_reason, created_by, created_at, decided_by, decided_at, sent_at, opened_at, clicked_at, open_count, click_count, campaign_id', { count: 'exact' })
    .eq('status', st).order('created_at', { ascending: st === 'pending' || st === 'approved' }).range((page - 1) * size, page * size - 1);
  const counts: Record<string, number> = {};
  await Promise.all(OUTBOX_STATUSES.map(async (s) => {
    const { count: c } = await svc.from('crm_outbox').select('id', { count: 'exact', head: true }).eq('status', s);
    counts[s] = c ?? 0;
  }));
  const istMidnight = new Date(Math.floor((Date.now() + 330 * 60_000) / 86_400_000) * 86_400_000 - 330 * 60_000).toISOString();
  const { count: sentToday } = await svc.from('crm_outbox').select('id', { count: 'exact', head: true }).gte('sent_at', istMidnight);
  const { data: cap } = await svc.from('crm_settings').select('value').eq('key', 'outbox.daily_cap').maybeSingle();
  const members = await loadMembers();
  const name = (id: string | null) => (id ? members.find((m) => m.id === id)?.name ?? 'Someone' : 'Automation');
  return {
    status: st, page, total: count ?? 0, counts, sentToday: sentToday ?? 0,
    dailyCap: Number((cap as { value?: { n?: number } } | null)?.value?.n) || 300,
    rows: ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({ ...r, created_by_name: name(r.created_by as string | null), decided_by_name: r.decided_by ? name(r.decided_by as string) : null })),
  };
}

export async function outboxPreview(ctx: CrmContext, id: string) {
  if (!canSetup(ctx, 'approve_outbox') && !canSetup(ctx, 'manage_marketing')) throw new CrmAccessError();
  if (!isUuid(id)) throw new CrmAccessError('Not found.');
  const svc = createServiceClient();
  const { data } = await svc.from('crm_outbox').select('id, to_email, to_name, subject, html, text_body, status, status_reason, source, category, links').eq('id', id).maybeSingle();
  if (!data) throw new CrmAccessError('Not found.');
  return data as { id: string; to_email: string; to_name: string | null; subject: string; html: string; text_body: string | null; status: string; status_reason: string | null; source: string; category: string; links: string[] };
}

export async function setDailyCap(ctx: CrmContext, n: number) {
  if (!canSetup(ctx, 'approve_outbox')) throw new CrmAccessError();
  const v = Math.round(Number(n));
  if (!Number.isFinite(v) || v < 1 || v > 5000) throw new CrmUserError('The daily cap must be between 1 and 5,000.');
  const svc = createServiceClient();
  await svc.from('crm_settings').upsert({ key: 'outbox.daily_cap', value: { n: v }, updated_at: new Date().toISOString(), updated_by: ctx.userId });
  await audit(svc, { actor_id: ctx.userId, action: 'outbox_cap', meta: { n: v } });
}

/** Email engagement for one record (timeline + compose). */
export async function recordEmails(ctx: CrmContext, meta: Meta, module: string, recordId: string) {
  await getRecord(ctx, meta, module, recordId); // access check
  const svc = createServiceClient();
  const { rows } = await fetchAll<Record<string, unknown>>(
    (o) => svc.from('crm_outbox').select('id, subject, status, status_reason, source, created_at, sent_at, opened_at, clicked_at, open_count, click_count', o).eq('record_id', recordId).order('created_at', { ascending: false }).order('id'),
    200,
  );
  return rows;
}

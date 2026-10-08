/**
 * Outbox: every email the CRM sends to a customer, approve-before-send.
 *
 *  queueEmails   → renders per recipient, checks opt-out/consent/blocklist,
 *                  writes crm_outbox rows as `pending` (or `suppressed`).
 *                  A person with approve_outbox sending ONE manual email is
 *                  their own approver; automated sources always wait.
 *  approve/reject→ approve_outbox permission; approval sends immediately.
 *  sendApproved  → claims rows atomically (approved → sending), re-checks
 *                  suppression AT SEND TIME, enforces the daily cap, sends.
 *  tracking      → signed open-pixel / click tokens; clicks only redirect to
 *                  URLs stored on the outbox row (no open redirect).
 */
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/crm/server/svc';
import { baseEmailLayout, emailTagline } from '@/lib/email/templates';
import { sendBulk, unsubscribeUrl } from '@/lib/email/send';
import { allows, can, canSetup, fieldAccess } from '@/lib/crm/permissions';
import { escapeHtml, merge, renderBody, trackLinks, type TemplateConfig } from '@/lib/crm/templates';
import { isUuid } from '@/lib/crm/fields';
import type { CrmContext, CrmRecord } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { RECORD_COLS, audit, normalizeRecord } from './db';
import { loadMembers } from './members';
import { accessTo } from './records';
import type { Meta } from './meta';
import { isBlocked } from './blocklist';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mece.in').replace(/\/$/, '');
const DEFAULT_DAILY_CAP = 300;

/**
 * Key for tracking / unsubscribe / form tokens. A dedicated CRM_TRACKING_SECRET
 * wins; otherwise one is derived from the service-role key (always set where
 * the CRM runs, never sent to a browser). There is deliberately no hard-coded
 * fallback: without a key, signing throws instead of minting forgeable tokens.
 */
function secret(): string {
  const k = process.env.CRM_TRACKING_SECRET || process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!k) throw new Error('CRM signing key missing (set CRM_TRACKING_SECRET)');
  return k;
}
export function sign(payload: string): string {
  return createHmac('sha256', secret()).update('crm:' + payload).digest('base64url').slice(0, 22);
}
export function verify(payload: string, sig: string): boolean {
  const a = Buffer.from(sign(payload));
  const b = Buffer.from(String(sig ?? ''));
  return a.length === b.length && timingSafeEqual(a, b);
}
export const openUrl = (id: string) => `${SITE}/api/crm/t/o.${id}.${sign('o.' + id)}`;
export const clickUrl = (id: string, i: number) => `${SITE}/api/crm/t/c.${id}.${i}.${sign(`c.${id}.${i}`)}`;
export const crmUnsubUrl = (id: string) => `${SITE}/api/crm/unsub?t=${id}.${sign('u.' + id)}`;

export interface QueueInput {
  module: string;
  recordIds: string[];
  template: TemplateConfig;
  templateId?: string | null;
  source: 'manual' | 'campaign' | 'workflow' | 'cadence' | 'macro' | 'survey' | 'webform' | 'system';
  sourceId?: string | null;
  campaignId?: string | null;
  dedupe?: (recordId: string) => string | null;
  extraValues?: (rec: CrmRecord) => Record<string, unknown>;
  /** trusted HTML appended under the body (survey score buttons); never user input */
  extraHtml?: (rec: CrmRecord) => string;
  scheduledFor?: string | null;
  /** only honoured for source=manual, one recipient, approve_outbox permission */
  sendNow?: boolean;
}

export interface QueueResult { queued: number; suppressed: number; noEmail: number; duplicate: number; sent: number; ids: string[] }

function emailOf(meta: Meta, rec: CrmRecord): string | null {
  const ef = meta.module(rec.module)?.settings.emailField;
  const v = ef ? rec.data[ef] : null;
  return typeof v === 'string' && v.includes('@') ? v.toLowerCase() : null;
}

/** Why this person must not get this email right now, or null. */
export async function suppressionReason(svc: SupabaseClient, rec: CrmRecord | null, email: string, category: 'marketing' | 'service'): Promise<string | null> {
  if (await isBlocked(svc, email)) return 'erased (privacy request)';
  if (rec?.locked?.kind === 'dpdp_restricted') return 'processing restricted (privacy request)';
  if (category === 'service') return null; // replies to a support case are not marketing
  if (rec?.data.email_opt_out === true) return 'opted out of email';
  if (rec?.data.consent_marketing === 'Withdrawn' || rec?.data.consent_marketing === 'withdrawn') return 'marketing consent withdrawn';
  if (rec?.mece_user_id) {
    const { data } = await svc.from('users').select('marketing_opt_out').eq('id', rec.mece_user_id).maybeSingle();
    if ((data as { marketing_opt_out?: boolean } | null)?.marketing_opt_out) return 'unsubscribed from MECE emails';
  }
  return null;
}

function valuesFor(ctx: CrmContext | null, meta: Meta, rec: CrmRecord, ownerName: string): Record<string, unknown> {
  const v: Record<string, unknown> = {};
  for (const f of meta.fields(rec.module)) {
    if (ctx && fieldAccess(ctx, rec.module, f.api_name) === 'hidden') continue;
    v[f.api_name] = rec.data[f.api_name];
  }
  const full = String(rec.data.full_name ?? [rec.data.first_name, rec.data.last_name].filter(Boolean).join(' ') ?? rec.name ?? '').trim() || rec.name;
  v.full_name = full;
  v.name = full;
  v.first_name = (rec.data.first_name as string) || full.split(/\s+/)[0] || 'there';
  v.owner_name = ownerName || 'Team MECE';
  v.college = rec.data.mece_college ?? rec.data.company ?? '';
  v.plan = rec.data.mece_tier ?? '';
  return v;
}

/** Render one email for one record (also used by the compose preview). */
export function renderEmail(t: TemplateConfig, values: Record<string, unknown>, outboxId: string, opts: { marketing: boolean; unsubscribe: string | null; intl: boolean; extraHtml?: string }) {
  const subject = merge(t.subject, values, false).slice(0, 300) || 'A note from MECE';
  const body = renderBody(t.body, values);
  const headingText = merge(t.heading || t.subject, values, false);
  const ctaUrl = t.cta ? merge(t.cta.url, values, false) : null;
  let html = baseEmailLayout({
    heading: escapeHtml(headingText),
    contentHtml: body.html + (opts.extraHtml ?? ''),
    cta: t.cta && ctaUrl && /^https?:\/\//i.test(ctaUrl) ? { label: t.cta.label, url: escapeHtml(ctaUrl) } : undefined,
    unsubscribeUrl: opts.marketing && opts.unsubscribe ? escapeHtml(opts.unsubscribe) : undefined,
    tagline: emailTagline(opts.intl ? 'US' : 'IN'),
  });
  // Track links in the body + CTA (not the footer/unsubscribe links)
  const cut = html.indexOf('<tr><td style="padding:24px 28px 8px;');
  const head = cut > 0 ? html.slice(0, cut) : html;
  const tail = cut > 0 ? html.slice(cut) : '';
  const tracked = trackLinks(head, (i) => clickUrl(outboxId, i));
  html = tracked.html + tail;
  html = html.replace('</body>', `<img src="${openUrl(outboxId)}" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px"/></body>`);
  const text = `${body.text}${t.cta && ctaUrl ? `\n\n${t.cta.label}: ${ctaUrl}` : ''}${opts.marketing && opts.unsubscribe ? `\n\nUnsubscribe: ${opts.unsubscribe}` : ''}\n\nTeam MECE · mece.in`;
  return { subject, html, text, links: tracked.links };
}

export async function queueEmails(ctx: CrmContext | null, meta: Meta, input: QueueInput): Promise<QueueResult> {
  const mod = meta.module(input.module);
  if (!mod) throw new CrmAccessError('Module not found.');
  if (ctx && !can(ctx, input.module, 'email')) throw new CrmAccessError(`You can’t email ${mod.label.toLowerCase()}.`);
  if (!mod.settings.emailField) throw new CrmUserError(`${mod.label} have no email field.`);
  const ids = [...new Set(input.recordIds.filter(isUuid))].slice(0, 2000);
  const svc = createServiceClient();
  const members = await loadMembers();
  const res: QueueResult = { queued: 0, suppressed: 0, noEmail: 0, duplicate: 0, sent: 0, ids: [] };
  const category = input.template.category === 'service' ? 'service' : 'marketing';
  const sendNow = !!input.sendNow && input.source === 'manual' && ids.length === 1 && !!ctx && canSetup(ctx, 'approve_outbox');

  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await svc.from('crm_records').select(RECORD_COLS).in('id', ids.slice(i, i + 200)).eq('module', input.module).is('deleted_at', null);
    const recs = ((data ?? []) as Record<string, unknown>[]).map(normalizeRecord);
    const rows: Record<string, unknown>[] = [];
    for (const rec of recs) {
      if (ctx && !allows(accessTo(ctx, meta, rec), 'read')) continue;
      const email = emailOf(meta, rec);
      if (!email) { res.noEmail++; continue; }
      const id = randomUUID();
      const reason = await suppressionReason(svc, rec, email, category);
      const values = { ...valuesFor(ctx, meta, rec, members.find((m) => m.id === rec.owner_id)?.name ?? ''), ...(input.extraValues?.(rec) ?? {}) };
      const unsub = rec.mece_user_id ? unsubscribeUrl(rec.mece_user_id) : crmUnsubUrl(id);
      const intl = rec.data.market === 'US' || rec.data.market === 'EU';
      const r = renderEmail(input.template, values, id, { marketing: category === 'marketing', unsubscribe: unsub, intl, extraHtml: input.extraHtml?.(rec) });
      rows.push({
        id, record_id: rec.id, to_email: email, to_name: String(values.full_name ?? '').slice(0, 200), subject: r.subject, html: r.html, text_body: r.text,
        category, source: input.source, source_id: input.sourceId ?? null, template_id: input.templateId ?? null, campaign_id: input.campaignId ?? null,
        links: r.links, status: reason ? 'suppressed' : sendNow ? 'approved' : 'pending', status_reason: reason,
        dedupe_key: input.dedupe?.(rec.id) ?? null, scheduled_for: input.scheduledFor ?? null, created_by: ctx?.userId ?? null,
        decided_by: sendNow && !reason ? ctx!.userId : null, decided_at: sendNow && !reason ? new Date().toISOString() : null,
      });
      if (reason) res.suppressed++; else res.queued++;
    }
    if (!rows.length) continue;
    // dedupe_key is UNIQUE: a workflow firing twice can't queue the same email twice
    const { data: ins, error } = await svc.from('crm_outbox').upsert(rows, { onConflict: 'dedupe_key', ignoreDuplicates: true }).select('id, status');
    if (error) throw error;
    const inserted = (ins ?? []) as Array<{ id: string; status: string }>;
    res.duplicate += rows.length - inserted.length;
    res.ids.push(...inserted.map((x) => x.id));
  }
  res.queued = Math.max(0, res.queued - res.duplicate);
  await audit(svc, { actor_id: ctx?.userId ?? null, actor_kind: ctx ? 'user' : 'automation', action: 'email_queue', module: input.module, meta: { source: input.source, queued: res.queued, suppressed: res.suppressed, campaign: input.campaignId ?? null } });
  if (sendNow && res.ids.length) res.sent = (await sendApproved(svc, ctx!.userId, res.ids)).sent;
  return res;
}

export async function decide(ctx: CrmContext, ids: string[], approve: boolean, reason = '') {
  if (!canSetup(ctx, 'approve_outbox')) throw new CrmAccessError('Only people allowed to approve emails can do this.');
  const list = ids.filter(isUuid).slice(0, 500);
  if (!list.length) return { changed: 0, sent: 0 };
  const svc = createServiceClient();
  const { data, error } = await svc.from('crm_outbox')
    .update({ status: approve ? 'approved' : 'rejected', decided_by: ctx.userId, decided_at: new Date().toISOString(), status_reason: approve ? null : reason.slice(0, 200) || 'rejected' })
    .in('id', list).eq('status', 'pending').select('id');
  if (error) throw error;
  const changed = (data ?? []).map((r) => (r as { id: string }).id);
  await audit(svc, { actor_id: ctx.userId, action: approve ? 'email_approve' : 'email_reject', meta: { count: changed.length } });
  let sent = 0;
  if (approve && changed.length) sent = (await sendApproved(svc, ctx.userId, changed)).sent;
  return { changed: changed.length, sent };
}

async function dailyCap(svc: SupabaseClient): Promise<number> {
  const { data } = await svc.from('crm_settings').select('value').eq('key', 'outbox.daily_cap').maybeSingle();
  const v = Number((data as { value?: { n?: number } } | null)?.value?.n);
  return Number.isFinite(v) && v > 0 ? Math.min(v, 5000) : DEFAULT_DAILY_CAP;
}

/** Send approved emails (all due ones, or the given ids). Safe to run concurrently. */
export async function sendApproved(svc: SupabaseClient, actorId: string | null, ids?: string[], max = 100) {
  const istMidnight = new Date(Math.floor((Date.now() + 330 * 60_000) / 86_400_000) * 86_400_000 - 330 * 60_000).toISOString();
  const { count: sentToday } = await svc.from('crm_outbox').select('id', { count: 'exact', head: true }).gte('sent_at', istMidnight);
  let budget = (await dailyCap(svc)) - (sentToday ?? 0);
  const out = { sent: 0, failed: 0, suppressed: 0, deferred: 0 };
  if (budget <= 0) return { ...out, deferred: ids?.length ?? 0 };
  let q = svc.from('crm_outbox').select('id').eq('status', 'approved').or(`scheduled_for.is.null,scheduled_for.lte.${new Date().toISOString()}`).order('created_at').limit(Math.min(budget, max, 100));
  if (ids) q = q.in('id', ids.filter(isUuid));
  const { data: due } = await q;
  for (const row of (due ?? []) as Array<{ id: string }>) {
    if (budget <= 0) { out.deferred++; continue; }
    // atomic claim: only one sender wins a row
    const { data: claimed } = await svc.from('crm_outbox').update({ status: 'sending' }).eq('id', row.id).eq('status', 'approved')
      .select('id, record_id, to_email, subject, html, text_body, category, campaign_id').maybeSingle();
    const m = claimed as { id: string; record_id: string | null; to_email: string; subject: string; html: string; text_body: string | null; category: 'marketing' | 'service'; campaign_id: string | null } | null;
    if (!m) continue;
    const rec = m.record_id ? normalizeRecord(((await svc.from('crm_records').select(RECORD_COLS).eq('id', m.record_id).maybeSingle()).data ?? { id: m.record_id, data: {} }) as Record<string, unknown>) : null;
    const reason = await suppressionReason(svc, rec, m.to_email, m.category);
    if (reason) {
      await svc.from('crm_outbox').update({ status: 'suppressed', status_reason: `at send time: ${reason}` }).eq('id', m.id);
      out.suppressed++;
      continue;
    }
    let ok = false;
    let err: string | undefined;
    if (process.env.CRM_EMAIL_SINK === '1') {
      ok = true; // test sink: never set in production
    } else {
      const unsub = m.category === 'marketing' ? (rec?.mece_user_id ? unsubscribeUrl(rec.mece_user_id) : crmUnsubUrl(m.id)) : undefined;
      const r = await sendBulk([{ to: m.to_email, subject: m.subject, html: m.html, text: m.text_body ?? undefined, listUnsubscribe: unsub }]);
      ok = r.sent === 1;
      err = r.error;
    }
    if (ok) {
      budget--;
      out.sent++;
      await svc.from('crm_outbox').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', m.id);
      if (m.record_id) await svc.from('crm_records').update({ last_activity_at: new Date().toISOString() }).eq('id', m.record_id);
      if (m.campaign_id) await memberStatus(svc, m.id, 'Sent');
      // a reply on a support case is its first response
      if (rec && rec.module === 'cases' && m.category === 'service' && !rec.data.first_response_at) {
        await svc.rpc('crm_merge_data', { p_rows: [{ id: rec.id, data: { first_response_at: new Date().toISOString() } }] });
      }
    } else {
      out.failed++;
      await svc.from('crm_outbox').update({ status: 'failed', status_reason: (err ?? 'send failed').slice(0, 300) }).eq('id', m.id);
    }
  }
  if (out.sent || out.failed) await audit(svc, { actor_id: actorId, actor_kind: actorId ? 'user' : 'system', action: 'email_send', meta: out });
  return out;
}

/** Tracking: o.<id>.<sig> (open) or c.<id>.<i>.<sig> (click). Returns redirect URL for clicks. */
export async function track(token: string, ua: string): Promise<{ kind: 'open' | 'click' | 'bad'; url?: string }> {
  const parts = String(token ?? '').replace(/\.gif$/, '').split('.');
  const svc = createServiceClient();
  if (parts[0] === 'o' && parts.length === 3 && isUuid(parts[1]) && verify(`o.${parts[1]}`, parts[2])) {
    await svc.rpc('crm_track', { p_outbox: parts[1], p_kind: 'open', p_link: null, p_ua: ua });
    await memberStatus(svc, parts[1], 'Opened');
    return { kind: 'open' };
  }
  if (parts[0] === 'c' && parts.length === 4 && isUuid(parts[1]) && /^\d{1,3}$/.test(parts[2]) && verify(`c.${parts[1]}.${parts[2]}`, parts[3])) {
    const { data } = await svc.from('crm_outbox').select('links').eq('id', parts[1]).maybeSingle();
    const links = ((data as { links?: unknown } | null)?.links ?? []) as unknown[];
    const url = links[Number(parts[2])];
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return { kind: 'bad' };
    await svc.rpc('crm_track', { p_outbox: parts[1], p_kind: 'click', p_link: Number(parts[2]), p_ua: ua });
    await memberStatus(svc, parts[1], 'Clicked');
    return { kind: 'click', url };
  }
  return { kind: 'bad' };
}

const MEMBER_RANK = ['Planned', 'Sent', 'Opened', 'Clicked', 'Responded', 'Converted'];
async function memberStatus(svc: SupabaseClient, outboxId: string, status: string) {
  const { data } = await svc.from('crm_outbox').select('campaign_id, record_id').eq('id', outboxId).maybeSingle();
  const o = data as { campaign_id: string | null; record_id: string | null } | null;
  if (!o?.campaign_id || !o.record_id) return;
  const { data: link } = await svc.from('crm_links').select('id, data').eq('from_id', o.campaign_id).eq('to_id', o.record_id).eq('kind', 'campaign_member').maybeSingle();
  const l = link as { id: string; data: { status?: string } } | null;
  // never downgrade (a member who already clicked stays "Clicked"); manual end states stay put
  const cur = l?.data?.status ?? 'Planned';
  if (!l || ['Bounced', 'Opted out'].includes(cur) || MEMBER_RANK.indexOf(cur) >= MEMBER_RANK.indexOf(status)) return;
  await svc.from('crm_links').update({ data: { ...(l.data ?? {}), status } }).eq('id', l.id);
}

/** CRM-level unsubscribe for people who are not MECE users (leads, B2B contacts). */
export async function crmUnsubscribe(token: string): Promise<boolean> {
  const [id, sig] = String(token ?? '').split('.');
  if (!isUuid(id) || !verify('u.' + id, sig)) return false;
  const svc = createServiceClient();
  const { data } = await svc.from('crm_outbox').select('record_id, to_email').eq('id', id).maybeSingle();
  const o = data as { record_id: string | null; to_email: string } | null;
  if (!o) return false;
  if (o.record_id) {
    const { data: r } = await svc.from('crm_records').select('id, data, mece_user_id').eq('id', o.record_id).maybeSingle();
    const rec = r as { id: string; data: Record<string, unknown>; mece_user_id: string | null } | null;
    if (rec) {
      await svc.rpc('crm_merge_data', { p_rows: [{ id: rec.id, data: { email_opt_out: true } }] });
      if (rec.mece_user_id) await svc.from('users').update({ marketing_opt_out: true }).eq('id', rec.mece_user_id);
    }
  }
  await svc.from('crm_email_events').insert({ outbox_id: id, kind: 'unsubscribe' });
  await svc.from('crm_audit').insert({ actor_kind: 'public', action: 'unsubscribe', record_id: o.record_id, meta: { via: 'crm email' } });
  // Cancel anything still waiting for this address
  await svc.from('crm_outbox').update({ status: 'cancelled', status_reason: 'recipient unsubscribed' }).eq('to_email', o.to_email).in('status', ['pending', 'approved']).eq('category', 'marketing');
  return true;
}

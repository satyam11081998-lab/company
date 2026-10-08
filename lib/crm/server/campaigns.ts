/**
 * Campaigns: members (leads/contacts), member status, emailing members via
 * the Outbox, and results. Attribution is reported three ways, never blended:
 *   direct  — won deals whose Campaign source is this campaign
 *   coupon  — won deals that used the campaign's coupon code
 *   email   — members who paid within 30 days after this campaign emailed them
 * ROI = (attributed revenue − actual cost) / actual cost, rupees only.
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import { allows, can } from '@/lib/crm/permissions';
import { isUuid } from '@/lib/crm/fields';
import type { Criteria, CrmContext, CrmRecord } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { RECORD_COLS, audit, fetchAll, normalizeRecord } from './db';
import { accessTo, getRecord, loadRecordRaw, present, queryAll } from './records';
import { queueEmails } from './outbox';
import type { TemplateConfig } from '@/lib/crm/templates';
import type { Meta } from './meta';

export const MEMBER_STATUSES = ['Planned', 'Sent', 'Opened', 'Clicked', 'Responded', 'Converted', 'Bounced', 'Opted out'];

async function campaignFor(ctx: CrmContext, meta: Meta, id: string, need: 'read' | 'rw') {
  if (!isUuid(id)) throw new CrmAccessError('Campaign not found.');
  const svc = createServiceClient();
  const c = await loadRecordRaw(svc, id);
  if (!c || c.module !== 'campaigns' || c.deleted_at) throw new CrmAccessError('Campaign not found.');
  const lvl = accessTo(ctx, meta, c);
  if (!lvl || !allows(lvl, need) || (need === 'rw' && !can(ctx, 'campaigns', 'edit'))) throw new CrmAccessError('Campaign not found.');
  return { svc, c };
}

export async function addMembers(ctx: CrmContext, meta: Meta, campaignId: string, module: string, input: { ids?: string[]; criteria?: Criteria | null; segmentId?: string | null }) {
  if (module !== 'leads' && module !== 'contacts') throw new CrmUserError('Only leads and contacts can be campaign members.');
  const { svc, c } = await campaignFor(ctx, meta, campaignId, 'rw');
  let targets: CrmRecord[] = [];
  if (input.ids?.length) {
    const ids = input.ids.filter(isUuid).slice(0, 5000);
    for (let i = 0; i < ids.length; i += 200) {
      const { data } = await svc.from('crm_records').select(RECORD_COLS).in('id', ids.slice(i, i + 200)).eq('module', module).is('deleted_at', null);
      targets.push(...((data ?? []) as Record<string, unknown>[]).map(normalizeRecord));
    }
    targets = targets.filter((r) => accessTo(ctx, meta, r));
  } else if (input.criteria !== undefined) {
    targets = (await queryAll(ctx, meta, module, input.criteria ?? null, 20_000)).rows;
  }
  if (!targets.length) return 0;
  const rows = targets.map((r) => ({ from_id: c.id, to_id: r.id, kind: 'campaign_member', data: { status: 'Planned', module }, created_by: ctx.userId }));
  let added = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const { data, error } = await svc.from('crm_links').upsert(rows.slice(i, i + 500), { onConflict: 'from_id,to_id,kind', ignoreDuplicates: true }).select('id');
    if (error) throw error;
    added += (data ?? []).length;
  }
  await audit(svc, { actor_id: ctx.userId, action: 'campaign_members_add', module: 'campaigns', record_id: c.id, meta: { added, module } });
  return added;
}

export async function removeMembers(ctx: CrmContext, meta: Meta, campaignId: string, recordIds: string[]) {
  const { svc, c } = await campaignFor(ctx, meta, campaignId, 'rw');
  const { data } = await svc.from('crm_links').delete().eq('from_id', c.id).eq('kind', 'campaign_member').in('to_id', recordIds.filter(isUuid).slice(0, 5000)).select('id');
  return (data ?? []).length;
}

export async function setMemberStatus(ctx: CrmContext, meta: Meta, campaignId: string, recordId: string, status: string) {
  if (!MEMBER_STATUSES.includes(status)) throw new CrmUserError('Unknown member status.');
  const { svc, c } = await campaignFor(ctx, meta, campaignId, 'rw');
  await svc.from('crm_links').update({ data: { status } }).eq('from_id', c.id).eq('to_id', recordId).eq('kind', 'campaign_member');
}

export async function emailMembers(ctx: CrmContext, meta: Meta, campaignId: string, template: TemplateConfig, templateId: string | null, statuses: string[] = ['Planned']) {
  const { svc, c } = await campaignFor(ctx, meta, campaignId, 'read');
  const { rows: links } = await fetchAll<{ to_id: string; data: { status?: string; module?: string } }>(
    (o) => svc.from('crm_links').select('to_id, data', o).eq('from_id', c.id).eq('kind', 'campaign_member').order('id'), 20_000);
  const byModule = new Map<string, string[]>();
  for (const l of links) {
    if (statuses.length && !statuses.includes(l.data?.status ?? 'Planned')) continue;
    const m = l.data?.module ?? 'contacts';
    byModule.set(m, [...(byModule.get(m) ?? []), l.to_id]);
  }
  const out = { queued: 0, suppressed: 0, noEmail: 0, duplicate: 0 };
  for (const [module, ids] of byModule) {
    const r = await queueEmails(ctx, meta, {
      module, recordIds: ids, template, templateId, source: 'campaign', sourceId: c.id, campaignId: c.id,
      // one email per member per template per campaign, however often this is pressed
      dedupe: (rid) => `campaign:${c.id}:${templateId ?? 'adhoc:' + template.subject}:${rid}`,
    });
    out.queued += r.queued; out.suppressed += r.suppressed; out.noEmail += r.noEmail; out.duplicate += r.duplicate;
  }
  return out;
}

export interface CampaignStats {
  members: number;
  byStatus: Record<string, number>;
  emails: { queued: number; sent: number; opened: number; clicked: number; suppressed: number };
  revenue: { direct: number; coupon: number; email: number; dealsDirect: number; dealsCoupon: number; buyersEmail: number };
  cost: number;
  roi: number | null;
}

export async function campaignStats(ctx: CrmContext, meta: Meta, campaignId: string): Promise<CampaignStats> {
  const { svc, c } = await campaignFor(ctx, meta, campaignId, 'read');
  const { rows: links } = await fetchAll<{ to_id: string; data: { status?: string } }>(
    (o) => svc.from('crm_links').select('to_id, data', o).eq('from_id', c.id).eq('kind', 'campaign_member').order('id'), 20_000);
  const byStatus: Record<string, number> = {};
  for (const l of links) byStatus[l.data?.status ?? 'Planned'] = (byStatus[l.data?.status ?? 'Planned'] ?? 0) + 1;
  const { data: ob } = await svc.from('crm_outbox').select('record_id, status, sent_at, opened_at, clicked_at').eq('campaign_id', c.id).limit(20_000);
  const obs = (ob ?? []) as Array<{ record_id: string | null; status: string; sent_at: string | null; opened_at: string | null; clicked_at: string | null }>;
  const emails = {
    queued: obs.filter((o) => ['pending', 'approved', 'sending'].includes(o.status)).length,
    sent: obs.filter((o) => o.status === 'sent').length,
    opened: obs.filter((o) => o.opened_at).length,
    clicked: obs.filter((o) => o.clicked_at).length,
    suppressed: obs.filter((o) => o.status === 'suppressed').length,
  };
  const deals = can(ctx, 'deals', 'view') ? (await queryAll(ctx, meta, 'deals', { match: 'all', conditions: [{ field: 'stage', op: 'eq', value: 'closed_won' }] }, 20_000)).rows : [];
  const inr = (d: CrmRecord) => ((d.data.currency ?? 'INR') === 'INR' && typeof d.data.amount === 'number' && !d.data.internal_test ? (d.data.amount as number) : 0);
  const direct = deals.filter((d) => d.data.campaign_id === c.id);
  const coupon = typeof c.data.coupon_code === 'string' && c.data.coupon_code ? deals.filter((d) => String(d.data.coupon_code ?? '').toUpperCase() === String(c.data.coupon_code).toUpperCase()) : [];
  // email-influenced: a member's won deal within 30 days after a sent campaign email
  const sentAt = new Map<string, number>();
  for (const o of obs) if (o.status === 'sent' && o.record_id && o.sent_at) sentAt.set(o.record_id, Math.min(sentAt.get(o.record_id) ?? Infinity, new Date(o.sent_at).getTime()));
  const emailDeals = deals.filter((d) => {
    const cid = typeof d.data.contact_id === 'string' ? d.data.contact_id : null;
    const t0 = cid ? sentAt.get(cid) : undefined;
    const paid = new Date(String(d.data.paid_at ?? d.data.closing_date ?? '')).getTime();
    return t0 !== undefined && Number.isFinite(paid) && paid >= t0 && paid - t0 <= 30 * 86_400_000;
  });
  const sum = (xs: CrmRecord[]) => Math.round(xs.reduce((n, d) => n + inr(d), 0) * 100) / 100;
  const cost = typeof c.data.actual_cost === 'number' ? (c.data.actual_cost as number) : 0;
  const attributed = sum([...new Map([...direct, ...coupon, ...emailDeals].map((d) => [d.id, d])).values()]);
  return {
    members: links.length, byStatus, emails,
    revenue: { direct: sum(direct), coupon: sum(coupon), email: sum(emailDeals), dealsDirect: direct.length, dealsCoupon: coupon.length, buyersEmail: new Set(emailDeals.map((d) => d.data.contact_id)).size },
    cost,
    roi: cost > 0 ? Math.round(((attributed - cost) / cost) * 1000) / 10 : null,
  };
}

export async function campaignMembers(ctx: CrmContext, meta: Meta, campaignId: string, page = 1) {
  const { svc, c } = await campaignFor(ctx, meta, campaignId, 'read');
  void (await getRecord(ctx, meta, 'campaigns', c.id));
  const { data, count } = await svc.from('crm_links').select('to_id, data, created_at', { count: 'exact' }).eq('from_id', c.id).eq('kind', 'campaign_member')
    .order('created_at', { ascending: false }).range((page - 1) * 50, page * 50 - 1);
  const links = (data ?? []) as Array<{ to_id: string; data: { status?: string; module?: string }; created_at: string }>;
  const { data: recs } = links.length ? await svc.from('crm_records').select(RECORD_COLS).in('id', links.map((l) => l.to_id)) : { data: [] };
  const map = new Map(((recs ?? []) as Record<string, unknown>[]).map(normalizeRecord).map((r) => [r.id, r]));
  return {
    total: count ?? links.length,
    rows: links.map((l) => {
      const r = map.get(l.to_id);
      const visible = r && accessTo(ctx, meta, r);
      return { id: l.to_id, module: l.data?.module ?? 'contacts', name: visible ? r!.name : 'Restricted', email: visible ? String(present(ctx, r!).data.email ?? '') : '', status: l.data?.status ?? 'Planned' };
    }),
  };
}

/**
 * Conversions: Lead → Contact + Account (+ Deal), Quote → Sales Order,
 * Sales Order → Invoice. Zoho behaviour, MECE-sized:
 *  - the Contact is matched by email first (fill empty fields only), the
 *    Account by exact name; nothing is duplicated on a retry,
 *  - lead source / campaign carry to Contact and Deal, notes are copied,
 *    open activities and tags move to the Contact,
 *  - the lead is marked Converted and locked LAST, so a failure part-way
 *    leaves it convertible again.
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import { isEmpty, isUuid } from '@/lib/crm/fields';
import { can } from '@/lib/crm/permissions';
import type { CrmContext, CrmRecord } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { RECORD_COLS, audit, ilikeEscape, normalizeRecord } from './db';
import { accessTo, createRecord, getRecord, loadRecordRaw, updateRecord } from './records';
import { allows } from '@/lib/crm/permissions';
import type { Meta } from './meta';

export interface ConvertLeadInput {
  leadId: string;
  createDeal: boolean;
  deal?: { name?: string; amount?: number | null; closing_date?: string | null; pipeline?: string; stage?: string };
  /** use these existing records instead of matching */
  contactId?: string | null;
  accountId?: string | null;
}

export async function convertLead(ctx: CrmContext, meta: Meta, input: ConvertLeadInput) {
  if (!can(ctx, 'leads', 'convert')) throw new CrmAccessError('You can’t convert leads.');
  const svc = createServiceClient();
  const lead = await loadRecordRaw(svc, input.leadId);
  if (!lead || lead.module !== 'leads' || lead.deleted_at) throw new CrmAccessError('Lead not found.');
  if (!allows(accessTo(ctx, meta, lead), 'rw')) throw new CrmAccessError('Lead not found.');
  if (lead.data.lead_status === 'Converted' || lead.locked?.kind === 'converted') throw new CrmUserError('This lead is already converted.');
  if (lead.approval_status === 'pending') throw new CrmUserError('This lead is waiting for approval.');
  const d = lead.data;

  // ---- contact
  let contact: CrmRecord | null = null;
  if (input.contactId) {
    contact = await getRecord(ctx, meta, 'contacts', input.contactId);
  } else if (typeof d.email === 'string' && d.email) {
    const { data } = await svc.from('crm_records').select(RECORD_COLS).eq('module', 'contacts').is('deleted_at', null)
      .ilike('data->>email', ilikeEscape(d.email)).limit(1);
    const hit = data?.[0] ? normalizeRecord(data[0] as Record<string, unknown>) : null;
    if (hit && accessTo(ctx, meta, hit)) contact = hit;
  }
  const fullName = [d.first_name, d.last_name].filter((x) => !isEmpty(x)).join(' ');
  const contactFields: Record<string, unknown> = {
    full_name: fullName, email: d.email ?? null, phone: d.phone ?? null, title: d.title ?? null, lead_source: d.lead_source ?? null,
    campaign_id: d.campaign_id ?? null, linkedin_url: d.linkedin_url ?? null, city: d.city ?? null, market: d.market ?? null,
    contact_type: d.segment === 'Student (B2C)' ? 'Student' : d.segment ? 'Placement officer' : 'Student', description: d.description ?? null,
  };
  if (contact) {
    // fill only empty, editable fields (a synced MECE user keeps its MECE data)
    const fill: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(contactFields)) {
      const f = meta.field('contacts', k);
      if (!f || isEmpty(v) || !isEmpty(contact.data[k])) continue;
      if (f.synced && contact.external_key) continue;
      fill[k] = v;
    }
    fill.converted_from_lead_id = lead.id;
    contact = await updateRecord(ctx, meta, 'contacts', contact.id, fill, { source: 'convert', allowSystem: ['converted_from_lead_id'], allowDuplicate: true });
  } else {
    if (!can(ctx, 'contacts', 'create')) throw new CrmAccessError('You can’t create contacts.');
    contact = await createRecord(ctx, meta, 'contacts', { ...stripEmpty(contactFields), converted_from_lead_id: lead.id }, {
      source: 'convert', sourceRef: lead.id, allowSystem: ['converted_from_lead_id'], allowDuplicate: true, ownerId: ownerFor(ctx, lead.owner_id), tags: lead.tags,
    });
  }

  // ---- account
  let account: CrmRecord | null = null;
  if (input.accountId) {
    account = await getRecord(ctx, meta, 'accounts', input.accountId);
  } else if (typeof d.company === 'string' && d.company.trim()) {
    const { data } = await svc.from('crm_records').select(RECORD_COLS).eq('module', 'accounts').is('deleted_at', null)
      .ilike('name', ilikeEscape(d.company.trim())).limit(1);
    const hit = data?.[0] ? normalizeRecord(data[0] as Record<string, unknown>) : null;
    if (hit && accessTo(ctx, meta, hit)) account = hit;
    else {
      if (!can(ctx, 'accounts', 'create')) throw new CrmAccessError('You can’t create accounts.');
      account = await createRecord(ctx, meta, 'accounts', stripEmpty({
        account_name: d.company, website: d.website, city: d.city, country: d.country, no_of_students: d.no_of_students, annual_budget: d.annual_budget,
        account_type: d.segment === 'Consulting club' ? 'Consulting club' : d.segment === 'Corporate' ? 'Company' : d.segment === 'Coaching institute' ? 'Coaching institute' : 'College / B-school',
        rating: d.rating,
      }), { source: 'convert', sourceRef: lead.id, ownerId: ownerFor(ctx, lead.owner_id) });
    }
  }
  if (account && contact && isEmpty(contact.data.account_id) && !(contact.external_key && meta.field('contacts', 'account_id')?.synced)) {
    contact = await updateRecord(ctx, meta, 'contacts', contact.id, { account_id: account.id }, { source: 'convert', allowDuplicate: true });
  }

  // ---- deal
  let deal: CrmRecord | null = null;
  if (input.createDeal) {
    if (!can(ctx, 'deals', 'create')) throw new CrmAccessError('You can’t create deals.');
    const b2b = d.segment && d.segment !== 'Student (B2C)';
    deal = await createRecord(ctx, meta, 'deals', stripEmpty({
      deal_name: input.deal?.name || (typeof d.company === 'string' && d.company) || fullName,
      pipeline: input.deal?.pipeline || (b2b ? 'Campus partnerships (B2B)' : undefined),
      stage: input.deal?.stage,
      amount: input.deal?.amount ?? d.annual_budget ?? null,
      closing_date: input.deal?.closing_date ?? null,
      contact_id: contact?.id, account_id: account?.id, lead_source: d.lead_source, campaign_id: d.campaign_id,
      type: b2b ? 'Campus licence' : 'New business',
    }), { source: 'convert', sourceRef: lead.id, ownerId: ownerFor(ctx, lead.owner_id) });
  }

  // ---- carry notes, activities, campaign membership
  const { data: notes } = await svc.from('crm_notes').select('body, created_by, created_at').eq('record_id', lead.id).is('deleted_at', null);
  const targets = [deal?.id ?? contact?.id].filter(Boolean) as string[];
  for (const t of targets) {
    if ((notes ?? []).length) await svc.from('crm_notes').insert((notes as any[]).map((n) => ({ record_id: t, body: n.body, created_by: n.created_by, created_at: n.created_at })));
  }
  if (contact) {
    const { data: acts } = await svc.from('crm_records').select('id, data').in('module', ['tasks', 'calls', 'meetings']).is('deleted_at', null).eq('data->related_to->>id', lead.id);
    for (const a of (acts ?? []) as Array<{ id: string; data: Record<string, unknown> }>) {
      await svc.from('crm_records').update({ data: { ...a.data, related_to: { module: 'contacts', id: contact.id } }, updated_at: new Date().toISOString() }).eq('id', a.id);
    }
    const { data: links } = await svc.from('crm_links').select('from_id, data').eq('to_id', lead.id).eq('kind', 'campaign_member');
    if ((links ?? []).length) {
      await svc.from('crm_links').upsert((links as any[]).map((l) => ({ from_id: l.from_id, to_id: contact!.id, kind: 'campaign_member', data: { ...(l.data ?? {}), status: 'Converted' } })), { onConflict: 'from_id,to_id,kind' });
    }
  }

  // ---- finally: mark + lock the lead
  await updateRecord(ctx, meta, 'leads', lead.id, {
    lead_status: 'Converted', converted_contact_id: contact?.id ?? null, converted_account_id: account?.id ?? null,
    converted_deal_id: deal?.id ?? null, converted_at: new Date().toISOString(),
  }, { source: 'convert', allowSystem: ['converted_contact_id', 'converted_account_id', 'converted_deal_id', 'converted_at'] });
  await svc.from('crm_records').update({ locked: { kind: 'converted', at: new Date().toISOString(), by: ctx.userId } }).eq('id', lead.id);
  await audit(svc, { actor_id: ctx.userId, action: 'convert', module: 'leads', record_id: lead.id, meta: { contact: contact?.id, account: account?.id, deal: deal?.id } });
  return { contactId: contact?.id ?? null, accountId: account?.id ?? null, dealId: deal?.id ?? null };
}

/** Keep the lead's owner when this user may assign to them; otherwise the converter. */
function ownerFor(ctx: CrmContext, preferred: string | null): string {
  if (preferred && (ctx.superAdmin || preferred === ctx.userId || ctx.subordinateUserIds.includes(preferred))) return preferred;
  return ctx.userId;
}

function stripEmpty(o: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => !isEmpty(v)));
}

const DOC_COPY = ['account_id', 'contact_id', 'deal_id', 'currency', 'line_items', 'adjustment', 'terms'];

/** Quote → Sales Order, Sales Order → Invoice. */
export async function convertDocument(ctx: CrmContext, meta: Meta, from: 'quotes' | 'sales_orders', id: string) {
  const to = from === 'quotes' ? 'sales_orders' : 'invoices';
  if (!can(ctx, from, 'view') || !can(ctx, to, 'create')) throw new CrmAccessError();
  if (!isUuid(id)) throw new CrmAccessError('Record not found.');
  const src = await getRecord(ctx, meta, from, id);
  const linkField = from === 'quotes' ? 'converted_so_id' : 'converted_invoice_id';
  if (src.data[linkField]) throw new CrmUserError('This document has already been converted.');
  const data: Record<string, unknown> = { subject: src.data.subject };
  for (const k of DOC_COPY) if (!isEmpty(src.data[k]) && meta.field(to, k)) data[k] = src.data[k];
  if (from === 'quotes') data.quote_id = src.id;
  else { data.sales_order_id = src.id; data.status = 'Draft'; data.invoice_date = new Date().toISOString().slice(0, 10); }
  const created = await createRecord(ctx, meta, to, data, { source: 'convert', sourceRef: src.id, ownerId: ownerFor(ctx, src.owner_id) });
  const patch: Record<string, unknown> = { [linkField]: created.id };
  if (from === 'quotes') patch.quote_stage = 'Accepted';
  await updateRecord(ctx, meta, from, src.id, patch, { source: 'convert', allowSystem: [linkField] });
  return { id: created.id, module: to };
}

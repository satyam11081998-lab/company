/**
 * Related lists and the 360° timeline for a record.
 *
 * Related lists are discovered from metadata. For every module with a
 * lookup field pointing at this record's module, list the children whose
 * lookup holds this id. Activities attach through their polymorphic
 * "Related to" field. Every child row passes the same access + field-security
 * checks as a list view.
 *
 * The timeline merges CRM history (audit, notes, activities, stage moves)
 * with MECE facts for synced contacts (sign-up, onboarding, cases solved,
 * payments, reports, logins). Money and score events appear only if the
 * viewer may see the matching contact fields.
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import { can, fieldAccess } from '@/lib/crm/permissions';
import type { CrmContext, CrmRecord } from '@/lib/crm/types';
import { RECORD_COLS, normalizeRecord } from './db';
import { accessTo, present } from './records';
import type { Meta } from './meta';

export interface RelatedList {
  module: string;
  label: string;
  via: string;
  rows: CrmRecord[];
  total: number;
}

const ACTIVITIES = ['tasks', 'calls', 'meetings'];

export async function relatedLists(ctx: CrmContext, meta: Meta, rec: CrmRecord): Promise<RelatedList[]> {
  const svc = createServiceClient();
  const jobs: Array<Promise<RelatedList | null>> = [];
  for (const m of meta.modules) {
    if (m.active === false || !can(ctx, m.api_name, 'view')) continue;
    for (const f of meta.fields(m.api_name)) {
      if (f.active === false) continue;
      const pointsHere = (f.type === 'lookup' && f.options?.module === rec.module) || (f.type === 'related' && f.options?.modules?.includes(rec.module));
      if (!pointsHere) continue;
      if (m.api_name === rec.module && f.api_name.startsWith('converted')) continue;
      if (fieldAccess(ctx, m.api_name, f.api_name) === 'hidden') continue;
      const path = f.type === 'related' ? `data->${f.api_name}->>id` : `data->>${f.api_name}`;
      jobs.push((async () => {
        const { data, count } = await svc.from('crm_records').select(RECORD_COLS, { count: 'exact' })
          .eq('module', m.api_name).is('deleted_at', null).eq(path, rec.id).order('updated_at', { ascending: false }).limit(50);
        const rows = ((data ?? []) as Record<string, unknown>[]).map(normalizeRecord).filter((r) => accessTo(ctx, meta, r));
        if (!rows.length) return null;
        const label = ACTIVITIES.includes(m.api_name) ? m.label : meta.fields(m.api_name).filter((x) => x.type === 'lookup' && x.options?.module === rec.module).length > 1 ? `${m.label} (${f.label})` : m.label;
        return { module: m.api_name, label, via: f.api_name, rows: rows.map((r) => present(ctx, r)), total: count ?? rows.length };
      })());
    }
  }
  // Campaign membership (links)
  if (can(ctx, 'campaigns', 'view') && (rec.module === 'leads' || rec.module === 'contacts')) {
    jobs.push((async () => {
      const { data: links } = await svc.from('crm_links').select('from_id, data').eq('to_id', rec.id).eq('kind', 'campaign_member').limit(50);
      const ids = ((links ?? []) as Array<{ from_id: string }>).map((l) => l.from_id);
      if (!ids.length) return null;
      const { data } = await svc.from('crm_records').select(RECORD_COLS).in('id', ids).is('deleted_at', null);
      const rows = ((data ?? []) as Record<string, unknown>[]).map(normalizeRecord).filter((r) => accessTo(ctx, meta, r));
      const status = new Map(((links ?? []) as Array<{ from_id: string; data: { status?: string } }>).map((l) => [l.from_id, l.data?.status ?? '']));
      return { module: 'campaigns', label: 'Campaigns', via: 'member', rows: rows.map((r) => ({ ...present(ctx, r), data: { ...present(ctx, r).data, _member_status: status.get(r.id) } })), total: rows.length };
    })());
  }
  const lists = (await Promise.all(jobs)).filter((x): x is RelatedList => !!x);
  // de-duplicate (a module may reach this record through two fields)
  const seen = new Set<string>();
  return lists.filter((l) => { const k = `${l.module}:${l.via}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

export interface TimelineItem {
  at: string;
  kind: 'created' | 'updated' | 'note' | 'activity' | 'stage' | 'email' | 'mece' | 'payment' | 'case_solved' | 'report' | 'login' | 'system';
  title: string;
  detail?: string;
  link?: string;
  actor?: string | null;
}

export async function timeline(ctx: CrmContext, meta: Meta, rec: CrmRecord): Promise<TimelineItem[]> {
  const svc = createServiceClient();
  const items: TimelineItem[] = [];
  const fieldLabel = (k: string) => meta.field(rec.module, k)?.label ?? k;

  const [aud, notes, stages] = await Promise.all([
    svc.from('crm_audit').select('at, actor_id, actor_kind, action, changes, meta').eq('record_id', rec.id).order('at', { ascending: false }).limit(100),
    svc.from('crm_notes').select('id, body, created_by, created_at').eq('record_id', rec.id).is('deleted_at', null).order('created_at', { ascending: false }).limit(100),
    svc.from('crm_stage_history').select('field, from_value, to_value, changed_at, changed_by').eq('record_id', rec.id).order('changed_at', { ascending: false }).limit(100),
  ]);
  for (const a of (aud.data ?? []) as any[]) {
    if (a.action === 'update') {
      const keys = Object.keys(a.changes ?? {}).filter((k) => k === 'owner_id' || k === 'tags' || fieldAccess(ctx, rec.module, k) !== 'hidden');
      if (!keys.length) continue;
      items.push({ at: a.at, kind: 'updated', title: `Updated ${keys.slice(0, 4).map((k) => (k === 'owner_id' ? 'owner' : fieldLabel(k))).join(', ')}${keys.length > 4 ? ` +${keys.length - 4}` : ''}`, actor: a.actor_id ?? a.actor_kind });
    } else if (a.action === 'create') {
      items.push({ at: a.at, kind: 'created', title: `${meta.module(rec.module)?.singular ?? 'Record'} created`, detail: a.meta?.source ? `via ${a.meta.source}` : undefined, actor: a.actor_id ?? a.actor_kind });
    } else if (!['sync'].includes(a.action)) {
      items.push({ at: a.at, kind: 'system', title: a.action.replace(/_/g, ' '), actor: a.actor_id ?? a.actor_kind });
    }
  }
  for (const n of (notes.data ?? []) as any[]) items.push({ at: n.created_at, kind: 'note', title: 'Note', detail: n.body, actor: n.created_by });
  for (const s of (stages.data ?? []) as any[]) {
    if (!s.from_value) continue;
    items.push({ at: s.changed_at, kind: 'stage', title: `${fieldLabel(s.field)}: ${s.from_value} → ${s.to_value}`, actor: s.changed_by });
  }

  // Activities related to this record
  for (const mod of ACTIVITIES) {
    if (!can(ctx, mod, 'view')) continue;
    const { data } = await svc.from('crm_records').select(RECORD_COLS).eq('module', mod).is('deleted_at', null).eq('data->related_to->>id', rec.id).order('created_at', { ascending: false }).limit(50);
    for (const r of ((data ?? []) as Record<string, unknown>[]).map(normalizeRecord)) {
      if (!accessTo(ctx, meta, r)) continue;
      const status = String(r.data.status ?? r.data.call_status ?? '');
      items.push({ at: r.created_at, kind: 'activity', title: `${meta.module(mod)?.singular}: ${r.name}`, detail: status, link: `/crm/m/${mod}/${r.id}`, actor: r.owner_id });
    }
  }

  // MECE facts for a synced customer
  if (rec.module === 'contacts' && rec.mece_user_id) {
    const uid = rec.mece_user_id;
    const seeMoney = fieldAccess(ctx, 'contacts', 'mece_revenue_inr') !== 'hidden';
    const seeScores = fieldAccess(ctx, 'contacts', 'mece_avg_score') !== 'hidden';
    const [u, subs, pays, reps, sess] = await Promise.all([
      svc.from('users').select('created_at, onboarding_completed_at').eq('id', uid).maybeSingle(),
      seeScores ? svc.from('submissions').select('created_at, score, cases(title, type)').eq('user_id', uid).order('created_at', { ascending: false }).limit(60) : Promise.resolve({ data: [] }),
      seeMoney ? svc.from('payments').select('created_at, paid_at, status, tier, amount_paise, currency').eq('user_id', uid).order('created_at', { ascending: false }).limit(30) : Promise.resolve({ data: [] }),
      svc.from('feedback_reports').select('created_at, category, message').eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
      svc.from('user_sessions').select('created_at, city, device_label').eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
    ]);
    const urow = u.data as { created_at?: string; onboarding_completed_at?: string } | null;
    if (urow?.created_at) items.push({ at: urow.created_at, kind: 'mece', title: 'Signed up on MECE' });
    if (urow?.onboarding_completed_at) items.push({ at: urow.onboarding_completed_at, kind: 'mece', title: 'Finished onboarding' });
    for (const s of (subs.data ?? []) as any[]) {
      const c = Array.isArray(s.cases) ? s.cases[0] : s.cases;
      items.push({ at: s.created_at, kind: 'case_solved', title: `Solved ${c?.type === 'guesstimate' ? 'guesstimate' : 'case'}: ${c?.title ?? 'untitled'}`, detail: typeof s.score === 'number' ? `Score ${s.score}` : 'Not scored' });
    }
    for (const p of (pays.data ?? []) as any[]) {
      const amt = `${p.currency === 'INR' || !p.currency ? '₹' : p.currency + ' '}${(Number(p.amount_paise ?? 0) / 100).toLocaleString('en-IN')}`;
      const verb = p.status === 'paid' ? 'Paid' : p.status === 'refunded' ? 'Refunded' : p.status === 'failed' ? 'Payment failed' : 'Started checkout';
      items.push({ at: p.paid_at ?? p.created_at, kind: 'payment', title: `${verb}: ${String(p.tier).toUpperCase()} ${amt}` });
    }
    for (const r of (reps.data ?? []) as any[]) items.push({ at: r.created_at, kind: 'report', title: `Reported: ${r.category}`, detail: String(r.message ?? '').slice(0, 280) });
    for (const s of (sess.data ?? []) as any[]) items.push({ at: s.created_at, kind: 'login', title: 'Signed in', detail: [s.device_label, s.city].filter(Boolean).join(' · ') });
  }

  return items.filter((i) => i.at).sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 300);
}

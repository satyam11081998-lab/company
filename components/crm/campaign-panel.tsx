'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { campaignAddMembers, campaignEmail, campaignRemoveMembers, campaignSetStatus } from '@/app/(app)/crm/mkt-actions';
import type { ClientField } from '@/lib/crm/client-types';
import type { Criteria } from '@/lib/crm/types';
import { CriteriaBuilder } from './criteria-builder';
import type { Member } from './field-input';
import { Bars, Button, Card, Field, Modal, Stat, inp, inr } from './ui';

const STATUSES = ['Planned', 'Sent', 'Opened', 'Clicked', 'Responded', 'Converted', 'Bounced', 'Opted out'];

interface Stats {
  members: number; byStatus: Record<string, number>; emails: { queued: number; sent: number; opened: number; clicked: number; suppressed: number };
  revenue: { direct: number; coupon: number; email: number; dealsDirect: number; dealsCoupon: number; buyersEmail: number }; cost: number; roi: number | null;
}
interface MemberRow { id: string; module: string; name: string; email: string; status: string }

export default function CampaignPanel({ campaignId, stats, members, total, templates, fields, people, canEdit }: {
  campaignId: string; stats: Stats; members: MemberRow[]; total: number; templates: Array<{ id: string; name: string }>;
  fields: Record<string, ClientField[]>; people: Member[]; canEdit: boolean;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<null | 'add' | 'email'>(null);
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 1000) / 10}%` : '—');
  const setStatus = async (rid: string, status: string) => {
    const r = await campaignSetStatus(campaignId, rid, status);
    if (!r.ok) return toast.error(r.error);
    router.refresh();
  };
  const remove = async (rid: string) => {
    const r = await campaignRemoveMembers(campaignId, [rid]);
    if (!r.ok) return toast.error(r.error);
    router.refresh();
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <Stat label="Members" value={stats.members} />
        <Stat label="Emails sent" value={stats.emails.sent} hint={stats.emails.queued ? `${stats.emails.queued} waiting for approval` : undefined} />
        <Stat label="Open rate" value={pct(stats.emails.opened, stats.emails.sent)} />
        <Stat label="Click rate" value={pct(stats.emails.clicked, stats.emails.sent)} />
        <Stat label="Attributed revenue" value={inr(stats.revenue.direct + stats.revenue.coupon + stats.revenue.email)} hint="direct + coupon + 30-day email, de-duplicated deals" />
        <Stat label="ROI" value={stats.roi === null ? '—' : `${stats.roi}%`} tone={stats.roi === null ? undefined : stats.roi >= 0 ? 'good' : 'bad'} hint={`cost ${inr(stats.cost)}`} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Member status"><Bars data={STATUSES.map((s) => ({ label: s, value: stats.byStatus[s] ?? 0 }))} /></Card>
        <Card title="Revenue by attribution" className="lg:col-span-2">
          <table className="w-full text-sm"><tbody>
            <tr className="border-b border-border/60"><td className="py-1.5">Direct (deal’s campaign source = this campaign)</td><td className="text-right tabular-nums">{inr(stats.revenue.direct)}</td><td className="pl-3 text-right text-xs text-muted-foreground">{stats.revenue.dealsDirect} deals</td></tr>
            <tr className="border-b border-border/60"><td className="py-1.5">Coupon code</td><td className="text-right tabular-nums">{inr(stats.revenue.coupon)}</td><td className="pl-3 text-right text-xs text-muted-foreground">{stats.revenue.dealsCoupon} deals</td></tr>
            <tr><td className="py-1.5">Paid within 30 days of a campaign email</td><td className="text-right tabular-nums">{inr(stats.revenue.email)}</td><td className="pl-3 text-right text-xs text-muted-foreground">{stats.revenue.buyersEmail} buyers</td></tr>
          </tbody></table>
          <p className="mt-2 text-[11px] text-muted-foreground">The three views are shown separately, never added up per deal twice. ROI uses the de-duplicated total in rupees; USD/EUR deals are left out rather than converted.</p>
        </Card>
      </div>
      <Card title={`Members (${total})`} actions={canEdit ? <><Button small onClick={() => setDialog('add')}>Add members</Button><Button small primary onClick={() => setDialog('email')} disabled={!total}>Email members</Button></> : null}>
        <table className="w-full text-sm"><tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b border-border/60">
              <td className="py-1.5 pr-2"><Link className="text-navy hover:underline" href={`/crm/m/${m.module}/${m.id}`}>{m.name}</Link> <span className="text-xs text-muted-foreground">{m.module === 'leads' ? 'Lead' : 'Contact'}</span></td>
              <td className="py-1.5 pr-2 text-xs text-muted-foreground">{m.email}</td>
              <td className="py-1.5 pr-2">{canEdit ? <select className="h-7 rounded border border-border bg-background px-1 text-xs" value={m.status} onChange={(e) => setStatus(m.id, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select> : <span className="text-xs">{m.status}</span>}</td>
              <td className="py-1.5 text-right">{canEdit && <button type="button" className="text-xs text-muted-foreground hover:text-destructive" onClick={() => remove(m.id)}>Remove</button>}</td>
            </tr>
          ))}
          {!members.length && <tr><td className="py-3 text-sm text-muted-foreground">No members yet. Add contacts or leads, or push a segment from Marketing → Segments.</td></tr>}
        </tbody></table>
        {total > members.length && <p className="mt-2 text-xs text-muted-foreground">Showing the latest {members.length} of {total}.</p>}
      </Card>
      {dialog === 'add' && <AddDialog campaignId={campaignId} fields={fields} people={people} onClose={() => { setDialog(null); router.refresh(); }} />}
      {dialog === 'email' && <EmailDialog campaignId={campaignId} templates={templates} onClose={() => { setDialog(null); router.refresh(); }} />}
    </div>
  );
}

function AddDialog({ campaignId, fields, people, onClose }: { campaignId: string; fields: Record<string, ClientField[]>; people: Member[]; onClose: () => void }) {
  const [module, setModule] = useState<'contacts' | 'leads'>('contacts');
  const [criteria, setCriteria] = useState<Criteria | null>(null);
  const [busy, setBusy] = useState(false);
  const go = async () => {
    if (!criteria && !confirm(`Add EVERY ${module === 'leads' ? 'lead' : 'contact'} you can see?`)) return;
    setBusy(true);
    const r = await campaignAddMembers(campaignId, module, { criteria });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success(`${r.data} new members added`);
    onClose();
  };
  return (
    <Modal title="Add members" onClose={onClose} wide>
      <div className="space-y-3">
        <Field label="From"><select className={inp} value={module} onChange={(e) => { setModule(e.target.value as 'contacts' | 'leads'); setCriteria(null); }}><option value="contacts">Contacts</option><option value="leads">Leads</option></select></Field>
        <CriteriaBuilder fields={fields[module] ?? []} value={criteria} onChange={setCriteria} members={people} />
        <div className="flex justify-end gap-2"><Button onClick={onClose}>Cancel</Button><Button primary onClick={go} disabled={busy}>Add matching people</Button></div>
      </div>
    </Modal>
  );
}

function EmailDialog({ campaignId, templates, onClose }: { campaignId: string; templates: Array<{ id: string; name: string }>; onClose: () => void }) {
  const [tid, setTid] = useState(templates[0]?.id ?? '');
  const [statuses, setStatuses] = useState<string[]>(['Planned']);
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    const r = await campaignEmail(campaignId, tid, statuses);
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success(`${r.data.queued} emails waiting for approval in the Outbox${r.data.suppressed ? ` · ${r.data.suppressed} skipped (opted out / no consent)` : ''}${r.data.noEmail ? ` · ${r.data.noEmail} have no email` : ''}${r.data.duplicate ? ` · ${r.data.duplicate} already had this email` : ''}`);
    onClose();
  };
  return (
    <Modal title="Email campaign members" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Template"><select className={inp} value={tid} onChange={(e) => setTid(e.target.value)}>{templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Members with status</p>
          <div className="mt-1 flex flex-wrap gap-3 text-sm">{STATUSES.slice(0, 6).map((s) => (
            <label key={s} className="flex items-center gap-1"><input type="checkbox" checked={statuses.includes(s)} onChange={(e) => setStatuses(e.target.checked ? [...statuses, s] : statuses.filter((x) => x !== s))} />{s}</label>
          ))}</div>
        </div>
        <p className="text-xs text-muted-foreground">Each member gets this template at most once. Emails wait in the Outbox until approved; opt-outs are skipped.</p>
        <div className="flex justify-end gap-2"><Button onClick={onClose}>Cancel</Button><Button primary onClick={go} disabled={busy || !tid || !statuses.length}>Queue emails</Button></div>
      </div>
    </Modal>
  );
}

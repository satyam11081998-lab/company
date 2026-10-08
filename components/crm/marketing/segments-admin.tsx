'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { mktDeleteConfig, mktRefreshSegment, mktSaveSegment, mktSegmentToCampaign } from '@/app/(app)/crm/mkt-actions';
import type { ClientField } from '@/lib/crm/client-types';
import type { Criteria } from '@/lib/crm/types';
import { CriteriaBuilder } from '../criteria-builder';
import type { Member } from '../field-input';
import { Bars, Button, Card, Field, Modal, fmtDate, inp } from '../ui';

const RFM_ORDER = ['Champions', 'Loyal', 'Potential loyalists', 'New', 'Promising', 'Need attention', 'About to sleep', "Can't lose them", 'At risk', 'Hibernating', 'Lost'];
const RFM_ADVICE: Record<string, string> = {
  Champions: 'Reward, ask for referrals and reviews', Loyal: 'Upsell higher plans; early access', 'Potential loyalists': 'Nudge to a second purchase / habit',
  New: 'Onboard well: first-case guidance', Promising: 'Build the habit; free value first', 'Need attention': 'Time-limited offer, personal check-in',
  'About to sleep': 'Re-engage with new content', "Can't lose them": 'Personal win-back by a human', 'At risk': 'Win-back campaign, ask what went wrong',
  Hibernating: 'Low-cost reactivation only', Lost: 'Exclude from spend; one last survey',
};

interface Seg { id: string; name: string; module: string | null; config: {
  type: 'criteria' | 'rfm'; module: string; criteria?: Criteria | null; description?: string;
  rfm?: { recencyField: string; frequencyField: string; monetaryField: string; manual?: { r?: number[]; f?: number[]; m?: number[] } | null; writeToRecords?: boolean };
  lastRefresh?: { at: string; members: number; byLabel?: Record<string, number>; avg?: { r: number; f: number; m: number } };
} }

export default function SegmentsAdmin({ segments, fields, modules, campaigns, members }: {
  segments: Seg[]; fields: Record<string, ClientField[]>; modules: Array<{ api: string; label: string }>; campaigns: Array<{ id: string; name: string }>; members: Member[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Seg | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [push, setPush] = useState<{ seg: Seg; label: string | null } | null>(null);
  const refresh = async (id: string) => {
    setBusy(id);
    const r = await mktRefreshSegment(id);
    setBusy(null);
    if (!r.ok) return toast.error(r.error);
    toast.success(`Refreshed: ${r.data.members} people`);
    router.refresh();
  };
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Segments</h1>
          <p className="text-sm text-muted-foreground">Criteria segments, and RFM segments that score everyone 1–5 on Recency, Frequency and Monetary value. Refreshed daily; push any segment (or one RFM group) into a campaign.</p>
        </div>
        <Button primary onClick={() => setEditing({ id: '', name: '', module: 'contacts', config: { type: 'criteria', module: 'contacts', criteria: null } })}>+ New segment</Button>
      </div>
      {segments.map((s) => {
        const lr = s.config.lastRefresh;
        return (
          <Card key={s.id} title={<span className="normal-case tracking-normal text-foreground">{s.name} <span className="text-muted-foreground">· {s.config.type === 'rfm' ? 'RFM' : 'Criteria'} · {s.config.module}</span></span>}
            actions={<>
              <Button small onClick={() => refresh(s.id)} disabled={busy === s.id}>{busy === s.id ? 'Refreshing…' : 'Refresh'}</Button>
              <Button small onClick={() => setPush({ seg: s, label: null })}>Add to campaign</Button>
              <Button small onClick={() => setEditing(s)}>Edit</Button>
            </>}>
            {s.config.description && <p className="mb-2 text-sm text-muted-foreground">{s.config.description}</p>}
            <p className="text-sm">{lr ? <><b>{lr.members.toLocaleString('en-IN')}</b> people · refreshed {fmtDate(lr.at)}{lr.avg && <> · average R {lr.avg.r} / F {lr.avg.f} / M {lr.avg.m}</>}</> : 'Not refreshed yet.'}</p>
            {lr?.byLabel && (
              <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Bars data={RFM_ORDER.map((l) => ({ label: l, value: lr.byLabel![l] ?? 0, tone: ['Champions', 'Loyal', 'Potential loyalists'].includes(l) ? 'bg-viz-good' : ["Can't lose them", 'At risk'].includes(l) ? 'bg-viz-critical' : 'bg-viz-1' }))} />
                <table className="text-xs">
                  <tbody>
                    {RFM_ORDER.filter((l) => (lr.byLabel![l] ?? 0) > 0).map((l) => (
                      <tr key={l} className="border-b border-border/60">
                        <td className="py-1 pr-2 font-medium">{l}</td><td className="py-1 pr-2 text-muted-foreground">{RFM_ADVICE[l]}</td>
                        <td className="py-1"><button type="button" className="text-navy hover:underline" onClick={() => setPush({ seg: s, label: l })}>→ campaign</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        );
      })}
      {editing && <Editor seg={editing} fields={fields} modules={modules} members={members} onClose={() => setEditing(null)} />}
      {push && <PushDialog seg={push.seg} label={push.label} campaigns={campaigns} onClose={() => setPush(null)} />}
    </div>
  );
}

function PushDialog({ seg, label, campaigns, onClose }: { seg: Seg; label: string | null; campaigns: Array<{ id: string; name: string }>; onClose: () => void }) {
  const [cid, setCid] = useState(campaigns[0]?.id ?? '');
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    const r = await mktSegmentToCampaign(seg.id, label, cid);
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success(`${r.data} new members added`);
    onClose();
  };
  return (
    <Modal title={`Add ${label ? `“${label}” in ` : ''}${seg.name} to a campaign`} onClose={onClose}>
      {!campaigns.length ? <p className="text-sm">Create a campaign first (Campaigns → New).</p> : (
        <div className="space-y-3">
          <Field label="Campaign"><select className={inp} value={cid} onChange={(e) => setCid(e.target.value)}>{campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <p className="text-xs text-muted-foreground">Only contacts and leads can be campaign members. People already in the campaign are skipped.</p>
          <div className="flex justify-end gap-2"><Button onClick={onClose}>Cancel</Button><Button primary onClick={go} disabled={busy || !cid}>Add members</Button></div>
        </div>
      )}
    </Modal>
  );
}

function Editor({ seg, fields, modules, members, onClose }: { seg: Seg; fields: Record<string, ClientField[]>; modules: Array<{ api: string; label: string }>; members: Member[]; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(seg.name);
  const [type, setType] = useState(seg.config.type);
  const [module, setModule] = useState(seg.config.module);
  const [criteria, setCriteria] = useState<Criteria | null>(seg.config.criteria ?? null);
  const [description, setDescription] = useState(seg.config.description ?? '');
  const [rfm, setRfm] = useState(seg.config.rfm ?? { recencyField: '', frequencyField: '', monetaryField: '', manual: null, writeToRecords: false });
  const [manual, setManual] = useState(!!seg.config.rfm?.manual && Object.values(seg.config.rfm.manual).some((x) => x?.length));
  const [cuts, setCuts] = useState({ r: (seg.config.rfm?.manual?.r ?? [7, 30, 90, 180]).join(', '), f: (seg.config.rfm?.manual?.f ?? [2, 5, 10, 20]).join(', '), m: (seg.config.rfm?.manual?.m ?? [1, 500, 1000, 3000]).join(', ') });
  const fl = fields[module] ?? [];
  const dateFields = fl.filter((f) => f.type === 'date' || f.type === 'datetime');
  const numFields = fl.filter((f) => ['integer', 'decimal', 'currency', 'rollup'].includes(f.type));
  const parse = (s: string) => s.split(',').map((x) => Number(x.trim())).filter((x) => Number.isFinite(x));
  const save = async () => {
    const config = { type, module, criteria, description, rfm: type === 'rfm' ? { ...rfm, manual: manual ? { r: parse(cuts.r), f: parse(cuts.f), m: parse(cuts.m) } : null } : undefined };
    const r = await mktSaveSegment({ id: seg.id || null, name, config });
    if (!r.ok) return toast.error(r.error);
    toast.success('Segment saved — press Refresh to compute it');
    onClose();
    router.refresh();
  };
  const del = async () => {
    if (!confirm('Delete this segment?')) return;
    const r = await mktDeleteConfig('segment', seg.id);
    if (!r.ok) return toast.error(r.error);
    onClose();
    router.refresh();
  };
  return (
    <Modal title={seg.id ? 'Edit segment' : 'New segment'} onClose={onClose} wide>
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Name"><input className={inp} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /></Field>
          <Field label="Type"><select className={inp} value={type} onChange={(e) => setType(e.target.value as 'criteria' | 'rfm')}><option value="criteria">Criteria</option><option value="rfm">RFM scoring</option></select></Field>
          <Field label="Module"><select className={inp} value={module} onChange={(e) => { setModule(e.target.value); setCriteria(null); }}>{modules.map((m) => <option key={m.api} value={m.api}>{m.label}</option>)}</select></Field>
        </div>
        <Field label="Description (optional)"><input className={inp} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} /></Field>
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">{type === 'rfm' ? 'Who is scored (optional filter)' : 'Who is in this segment'}</p>
          <CriteriaBuilder fields={fl} value={criteria} onChange={setCriteria} members={members} />
        </div>
        {type === 'rfm' && (
          <div className="space-y-3 rounded-md border border-border p-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="Recency: date of last…"><select className={inp} value={rfm.recencyField} onChange={(e) => setRfm({ ...rfm, recencyField: e.target.value })}><option value="">Choose…</option>{dateFields.map((f) => <option key={f.api} value={f.api}>{f.label}</option>)}</select></Field>
              <Field label="Frequency: number of…"><select className={inp} value={rfm.frequencyField} onChange={(e) => setRfm({ ...rfm, frequencyField: e.target.value })}><option value="">Choose…</option>{numFields.map((f) => <option key={f.api} value={f.api}>{f.label}</option>)}</select></Field>
              <Field label="Monetary: value of…"><select className={inp} value={rfm.monetaryField} onChange={(e) => setRfm({ ...rfm, monetaryField: e.target.value })}><option value="">Choose…</option>{numFields.map((f) => <option key={f.api} value={f.api}>{f.label}</option>)}</select></Field>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} /> Use my own thresholds (otherwise automatic quintiles)</label>
            {manual && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Field label="Recency cut-offs (days, 4 numbers)" hint="e.g. 7, 30, 90, 180 → 5 = within 7 days"><input className={inp} value={cuts.r} onChange={(e) => setCuts({ ...cuts, r: e.target.value })} /></Field>
                <Field label="Frequency cut-offs"><input className={inp} value={cuts.f} onChange={(e) => setCuts({ ...cuts, f: e.target.value })} /></Field>
                <Field label="Monetary cut-offs (₹)"><input className={inp} value={cuts.m} onChange={(e) => setCuts({ ...cuts, m: e.target.value })} /></Field>
              </div>
            )}
            {module === 'contacts' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!rfm.writeToRecords} onChange={(e) => setRfm({ ...rfm, writeToRecords: e.target.checked })} /> Write R/F/M scores and segment name onto each contact (usable in views, workflows, campaigns)</label>}
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-between gap-2">
        {seg.id ? <Button danger onClick={del}>Delete</Button> : <span />}
        <div className="flex gap-2"><Button onClick={onClose}>Cancel</Button><Button primary onClick={save}>Save</Button></div>
      </div>
    </Modal>
  );
}

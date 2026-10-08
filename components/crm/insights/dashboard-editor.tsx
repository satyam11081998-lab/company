'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { dashSave, repDelete } from '@/app/(app)/crm/insight-actions';
import type { DashboardComponent } from '@/lib/crm/reports';
import type { Criteria } from '@/lib/crm/types';
import { CriteriaBuilder } from '../criteria-builder';
import { Button, Card, Field, inp } from '../ui';
import type { BuilderModule } from './report-builder';

const NUMERIC = new Set(['integer', 'decimal', 'currency', 'percent', 'rollup', 'formula']);

export default function DashboardEditor({ id, name: name0 = '', shared: shared0 = false, config, modules, reports, canShare, onDone }: {
  id?: string; name?: string; shared?: boolean; config?: { components: DashboardComponent[]; description?: string };
  modules: BuilderModule[]; reports: Array<{ id: string; name: string }>; canShare: boolean; onDone?: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(name0);
  const [shared, setShared] = useState(shared0);
  const [description, setDescription] = useState(config?.description ?? '');
  const [comps, setComps] = useState<DashboardComponent[]>(config?.components ?? []);
  const [busy, setBusy] = useState(false);
  const upd = (i: number, patch: Partial<DashboardComponent>) => setComps(comps.map((c, k) => (k === i ? { ...c, ...patch } : c)));
  const add = (type: DashboardComponent['type']) => setComps([...comps, type === 'kpi' || type === 'target'
    ? { id: `c${Date.now().toString(36)}`, type, title: type === 'kpi' ? 'New KPI' : 'New target', module: modules[0]?.api, measure: { fn: 'count' }, criteria: null, target: type === 'target' ? 100 : undefined }
    : { id: `c${Date.now().toString(36)}`, type, title: 'New chart', reportId: reports[0]?.id, size: 2 }]);
  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= comps.length) return; const x = [...comps]; [x[i], x[j]] = [x[j], x[i]]; setComps(x); };
  const save = async () => {
    setBusy(true);
    const r = await dashSave({ id: id ?? null, name, shared, config: { components: comps, description } });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success('Dashboard saved');
    onDone?.();
    router.push(`/crm/dashboards/${r.data}`);
    router.refresh();
  };
  const remove = async () => {
    if (!id || !confirm('Delete this dashboard?')) return;
    const r = await repDelete('dashboard', id);
    if (!r.ok) return toast.error(r.error);
    router.push('/crm/dashboards?list=1');
    router.refresh();
  };
  return (
    <Card title={id ? 'Edit dashboard' : 'New dashboard'}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Name"><input className={inp} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /></Field>
        <Field label="Description"><input className={inp} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} /></Field>
      </div>
      <div className="mt-4 space-y-3">
        {comps.map((c, i) => {
          const mod = modules.find((m) => m.api === c.module) ?? modules[0];
          return (
            <div key={c.id} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-end gap-2">
                <span className="rounded bg-muted px-2 py-1 text-xs font-medium uppercase">{c.type}</span>
                <div className="min-w-[180px] flex-1"><Field label="Title"><input className={inp} value={c.title} onChange={(e) => upd(i, { title: e.target.value })} maxLength={80} /></Field></div>
                <Field label="Width"><select className={inp} value={c.size ?? 1} onChange={(e) => upd(i, { size: Number(e.target.value) as 1 })}><option value={1}>1/3</option><option value={2}>2/3</option><option value={3}>Full</option></select></Field>
                <Button small onClick={() => move(i, -1)}>↑</Button><Button small onClick={() => move(i, 1)}>↓</Button>
                <Button small danger onClick={() => setComps(comps.filter((_, k) => k !== i))}>Remove</Button>
              </div>
              {c.type === 'kpi' || c.type === 'target' ? (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                    <Field label="Module"><select className={inp} value={mod?.api} onChange={(e) => upd(i, { module: e.target.value, criteria: null, measure: { fn: 'count' } })}>{modules.map((m) => <option key={m.api} value={m.api}>{m.label}</option>)}</select></Field>
                    <Field label="Measure"><select className={inp} value={c.measure?.fn ?? 'count'} onChange={(e) => upd(i, { measure: { fn: e.target.value as 'count', field: e.target.value === 'count' ? undefined : mod?.fields.find((f) => NUMERIC.has(f.type))?.api } })}>{['count', 'sum', 'avg', 'min', 'max'].map((f) => <option key={f} value={f}>{f}</option>)}</select></Field>
                    {c.measure?.fn && c.measure.fn !== 'count' && <Field label="Of"><select className={inp} value={c.measure.field ?? ''} onChange={(e) => upd(i, { measure: { fn: c.measure!.fn, field: e.target.value } })}>{mod?.fields.filter((f) => NUMERIC.has(f.type)).map((f) => <option key={f.api} value={f.api}>{f.label}</option>)}</select></Field>}
                    {c.type === 'target' ? <Field label="Target"><input className={inp} type="number" min={0} value={c.target ?? 0} onChange={(e) => upd(i, { target: Number(e.target.value) })} /></Field>
                      : <Field label="Compare with previous"><select className={inp} value={c.compareDays ?? ''} onChange={(e) => upd(i, { compareDays: e.target.value ? Number(e.target.value) : undefined })}><option value="">No comparison</option><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select></Field>}
                  </div>
                  {mod && <CriteriaBuilder fields={mod.fields} value={(c.criteria as Criteria | null) ?? null} onChange={(v) => upd(i, { criteria: v })} />}
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <Field label="Saved report"><select className={inp} value={c.reportId ?? ''} onChange={(e) => upd(i, { reportId: e.target.value })}>{reports.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
                  <Field label="Show as"><select className={inp} value={c.type} onChange={(e) => upd(i, { type: e.target.value as 'chart' })}><option value="chart">Chart</option><option value="table">Table</option><option value="funnel">Funnel</option></select></Field>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button small onClick={() => add('kpi')}>+ KPI</Button>
        <Button small onClick={() => add('target')}>+ Target meter</Button>
        <Button small onClick={() => add('chart')} disabled={!reports.length}>+ Chart from report</Button>
        <Button small onClick={() => add('table')} disabled={!reports.length}>+ Table from report</Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={shared} disabled={!canShare} onChange={(e) => setShared(e.target.checked)} /> Shared</label>
        <div className="flex gap-2">
          {id && <Button danger onClick={remove}>Delete</Button>}
          {onDone && <Button onClick={onDone}>Cancel</Button>}
          <Button primary onClick={save} disabled={busy || !name.trim() || !comps.length}>Save</Button>
        </div>
      </div>
    </Card>
  );
}

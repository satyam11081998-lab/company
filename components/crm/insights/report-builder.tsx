'use client';

/** Report builder (Zoho: tabular / summary / matrix reports with charts). */
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { repDelete, repExport, repRun, repSave } from '@/app/(app)/crm/insight-actions';
import type { ClientField } from '@/lib/crm/client-types';
import type { Agg, Bucket, ReportConfig } from '@/lib/crm/reports';
import type { ReportResult } from '@/lib/crm/server/reports';
import type { Criteria } from '@/lib/crm/types';
import { CriteriaBuilder } from '../criteria-builder';
import { Button, Card, Field, inp } from '../ui';
import ReportView from './report-view';

export interface BuilderModule { api: string; label: string; fields: ClientField[] }

const PSEUDO = [
  { api: 'name', label: 'Name', type: 'text' }, { api: 'owner_id', label: 'Owner', type: 'user' }, { api: 'created_at', label: 'Created', type: 'datetime' },
  { api: 'updated_at', label: 'Modified', type: 'datetime' }, { api: 'last_activity_at', label: 'Last activity', type: 'datetime' }, { api: 'score', label: 'Score', type: 'integer' },
];
const NUMERIC = new Set(['integer', 'decimal', 'currency', 'percent', 'rollup', 'formula']);
const GROUPABLE = new Set(['picklist', 'boolean', 'user', 'lookup', 'text', 'date', 'datetime', 'integer', 'multiselect']);
const DATE = new Set(['date', 'datetime']);

export function download(name: string, text: string, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ReportBuilder({ modules, initial, canShare, onCancel }: {
  modules: BuilderModule[];
  initial?: { id: string | null; name: string; shared: boolean; config: Partial<ReportConfig> };
  canShare: boolean;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? '');
  const [shared, setShared] = useState(initial?.shared ?? false);
  const [c, setC] = useState<Partial<ReportConfig>>(initial?.config ?? { module: modules[0]?.api, type: 'summary', columns: [], measures: [{ fn: 'count' }], criteria: null, chart: 'bar' });
  const [result, setResult] = useState<ReportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const mod = modules.find((m) => m.api === c.module) ?? modules[0];
  const all = [...PSEUDO.filter((p) => !mod.fields.some((f) => f.api === p.api)), ...mod.fields.map((f) => ({ api: f.api, label: f.label, type: f.type as string }))];
  const numeric = all.filter((f) => NUMERIC.has(f.type));
  const groupable = all.filter((f) => GROUPABLE.has(f.type));
  const isDate = (api?: string) => DATE.has(all.find((f) => f.api === api)?.type ?? '');
  const set = (patch: Partial<ReportConfig>) => { setC({ ...c, ...patch }); setResult(null); };

  const run = async () => {
    setBusy(true);
    const r = await repRun(c);
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    setResult(r.data);
  };
  const save = async () => {
    setBusy(true);
    const r = await repSave({ id: initial?.id ?? null, name, shared, config: c });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success('Report saved');
    router.push(`/crm/reports/${r.data}`);
    router.refresh();
  };
  const exportCsv = async () => {
    const r = await repExport(c);
    if (!r.ok) return toast.error(r.error);
    download(`${(name || 'report').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`, r.data);
  };
  const remove = async () => {
    if (!initial?.id || !confirm('Delete this report?')) return;
    const r = await repDelete('report', initial.id);
    if (!r.ok) return toast.error(r.error);
    router.push('/crm/reports');
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <Card title={initial?.id ? 'Edit report' : 'New report'}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Name"><input className={inp} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="e.g. Won revenue by source" /></Field>
          <Field label="Module">
            <select className={inp} value={mod.api} onChange={(e) => set({ module: e.target.value, columns: [], groupBy: null, groupBy2: null, measures: [{ fn: 'count' }], criteria: null })}>
              {modules.map((m) => <option key={m.api} value={m.api}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Type">
            <select className={inp} value={c.type} onChange={(e) => set({ type: e.target.value as ReportConfig['type'], chart: e.target.value === 'tabular' ? 'none' : c.chart === 'none' ? 'bar' : c.chart })}>
              <option value="tabular">Tabular (list of records)</option><option value="summary">Summary (grouped totals)</option><option value="matrix">Matrix (two groupings)</option>
            </select>
          </Field>
        </div>
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Filter</p>
          <CriteriaBuilder fields={mod.fields} value={(c.criteria as Criteria | null) ?? null} onChange={(v) => set({ criteria: v })} />
        </div>
        {c.type === 'tabular' ? (
          <div className="mt-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Columns (up to 15)</p>
            <div className="flex max-h-40 flex-wrap gap-x-4 gap-y-1 overflow-y-auto rounded border border-border p-2 text-sm">
              {all.map((f) => (
                <label key={f.api} className="flex items-center gap-1.5">
                  <input type="checkbox" checked={(c.columns ?? []).includes(f.api)} disabled={!(c.columns ?? []).includes(f.api) && (c.columns ?? []).length >= 15}
                    onChange={(e) => set({ columns: e.target.checked ? [...(c.columns ?? []), f.api] : (c.columns ?? []).filter((x) => x !== f.api) })} />
                  {f.label}
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
            <Field label="Group by">
              <select className={inp} value={c.groupBy?.field ?? ''} onChange={(e) => set({ groupBy: e.target.value ? { field: e.target.value, bucket: isDate(e.target.value) ? 'month' : undefined } : null })}>
                <option value="">Pick a field…</option>{groupable.map((f) => <option key={f.api} value={f.api}>{f.label}</option>)}
              </select>
            </Field>
            {isDate(c.groupBy?.field) && (
              <Field label="By">
                <select className={inp} value={c.groupBy?.bucket ?? 'month'} onChange={(e) => set({ groupBy: { field: c.groupBy!.field, bucket: e.target.value as Bucket } })}>
                  {['day', 'week', 'month', 'quarter', 'year'].map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
            )}
            {c.type === 'matrix' && (
              <Field label="Then by (columns)">
                <select className={inp} value={c.groupBy2?.field ?? ''} onChange={(e) => set({ groupBy2: e.target.value ? { field: e.target.value, bucket: isDate(e.target.value) ? 'month' : undefined } : null })}>
                  <option value="">Pick a field…</option>{groupable.map((f) => <option key={f.api} value={f.api}>{f.label}</option>)}
                </select>
              </Field>
            )}
            <Field label="Chart">
              <select className={inp} value={c.chart ?? 'bar'} onChange={(e) => set({ chart: e.target.value as ReportConfig['chart'] })}>
                {['bar', 'line', 'pie', 'funnel', 'none'].map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
            <div className="md:col-span-4">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Measures (the first one is charted)</p>
              <div className="space-y-1.5">
                {(c.measures ?? []).map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <select className={`${inp} max-w-[120px]`} value={m.fn} onChange={(e) => { const ms = [...(c.measures ?? [])]; ms[i] = { fn: e.target.value as Agg, field: e.target.value === 'count' ? undefined : m.field ?? numeric[0]?.api }; set({ measures: ms }); }}>
                      {['count', 'sum', 'avg', 'min', 'max'].map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    {m.fn !== 'count' && (
                      <select className={inp} value={m.field ?? ''} onChange={(e) => { const ms = [...(c.measures ?? [])]; ms[i] = { ...m, field: e.target.value }; set({ measures: ms }); }}>
                        {numeric.map((f) => <option key={f.api} value={f.api}>{f.label}</option>)}
                      </select>
                    )}
                    {(c.measures ?? []).length > 1 && <Button small onClick={() => set({ measures: (c.measures ?? []).filter((_, k) => k !== i) })}>Remove</Button>}
                  </div>
                ))}
                {(c.measures ?? []).length < 4 && <Button small onClick={() => set({ measures: [...(c.measures ?? []), { fn: numeric.length ? 'sum' : 'count', field: numeric[0]?.api }] })}>+ Measure</Button>}
              </div>
            </div>
            <Field label="Sort">
              <select className={inp} value={`${c.sort?.by ?? 'group'}:${c.sort?.dir ?? 'asc'}`} onChange={(e) => { const [by, dir] = e.target.value.split(':'); set({ sort: { by: by as 'group', dir: dir as 'asc' } }); }}>
                <option value="group:asc">Group A→Z / oldest first</option><option value="group:desc">Group Z→A</option><option value="value:desc">Largest first</option><option value="value:asc">Smallest first</option>
              </select>
            </Field>
            <Field label="Show top (optional)"><input className={inp} type="number" min={0} max={500} value={c.limit ?? ''} onChange={(e) => set({ limit: e.target.value ? Number(e.target.value) : undefined })} /></Field>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={shared} disabled={!canShare} onChange={(e) => setShared(e.target.checked)} /> Share with everyone who can see reports
            {!canShare && <span className="text-xs text-muted-foreground">(needs the “manage reports” permission)</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {initial?.id && <Button danger onClick={remove}>Delete</Button>}
            {onCancel && <Button onClick={onCancel}>Cancel</Button>}
            <Button onClick={exportCsv} disabled={busy}>Export CSV</Button>
            <Button onClick={run} disabled={busy}>{busy ? 'Running…' : 'Run'}</Button>
            <Button primary onClick={save} disabled={busy || !name.trim()}>Save</Button>
          </div>
        </div>
      </Card>
      {result && <Card title={name || 'Preview'}><ReportView result={result} /></Card>}
    </div>
  );
}

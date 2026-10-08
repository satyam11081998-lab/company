'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { setupDeleteConfig, setupSavePipeline } from '@/app/(app)/crm/setup/actions';
import type { PipelineConfig, PipelineStage } from '@/lib/crm/types';

interface P { id: string; name: string; active: boolean; config: PipelineConfig }
const FORECASTS: PipelineStage['forecast'][] = ['Pipeline', 'Best Case', 'Commit', 'Closed Won', 'Omitted'];
const inp = 'h-8 w-full rounded-md border border-border bg-background px-2 text-sm';

export default function PipelinesAdmin({ pipelines }: { pipelines: P[] }) {
  const [editing, setEditing] = useState<P | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pipelines</h1>
        <button type="button" onClick={() => setEditing({ id: '', name: '', active: true, config: { stages: [
          { key: 'new', label: 'New', probability: 10, forecast: 'Pipeline', state: 'open' },
          { key: 'closed_won', label: 'Closed won', probability: 100, forecast: 'Closed Won', state: 'won' },
          { key: 'closed_lost', label: 'Closed lost', probability: 0, forecast: 'Omitted', state: 'lost' },
        ] } })} className="h-8 rounded-md bg-navy px-3 text-sm text-navy-foreground">+ New pipeline</button>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {pipelines.map((p) => (
          <section key={p.id} className="rounded-lg border border-border bg-card p-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{p.name}{p.config.isDefault && <span className="ml-2 rounded bg-navy/10 px-1.5 text-xs text-navy">default</span>}{!p.active && <span className="ml-2 text-xs text-muted-foreground">inactive</span>}</p>
              <button type="button" onClick={() => setEditing(p)} className="text-xs text-navy hover:underline">Edit</button>
            </div>
            {p.config.description && <p className="mt-1 text-xs text-muted-foreground">{p.config.description}</p>}
            <div className="mt-2 flex flex-wrap gap-1">
              {p.config.stages.map((s) => <span key={s.key} className={`rounded-full px-2 py-0.5 text-xs ${s.state === 'won' ? 'bg-success-soft' : s.state === 'lost' ? 'bg-destructive/10' : 'bg-muted'}`}>{s.label} · {s.probability}%</span>)}
            </div>
          </section>
        ))}
      </div>
      {editing && <Editor p={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function Editor({ p, onClose }: { p: P; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(p.name);
  const [active, setActive] = useState(p.active);
  const [isDefault, setDefault] = useState(!!p.config.isDefault);
  const [description, setDescription] = useState(p.config.description ?? '');
  const [stages, setStages] = useState<PipelineStage[]>(p.config.stages);
  const upd = (i: number, patch: Partial<PipelineStage>) => setStages((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) => setStages((s) => { const n = [...s]; const t = n[i + d]; if (!t) return s; n[i + d] = n[i]; n[i] = t; return n; });
  const save = async () => {
    const r = await setupSavePipeline({ id: p.id || null, name, active, config: { stages, isDefault, description } });
    if (!r.ok) return toast.error(r.error);
    toast.success('Pipeline saved');
    onClose();
    router.refresh();
  };
  const del = async () => {
    if (!p.id || !confirm('Delete this pipeline?')) return;
    const r = await setupDeleteConfig(p.id, 'pipeline');
    if (!r.ok) return toast.error(r.error);
    onClose();
    router.refresh();
  };
  return (
    <section className="space-y-3 rounded-lg border border-navy/30 bg-card p-4 text-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label><span className="mb-1 block text-xs text-muted-foreground">Name</span><input className={inp} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="md:col-span-2"><span className="mb-1 block text-xs text-muted-foreground">Description</span><input className={inp} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={isDefault} onChange={(e) => setDefault(e.target.checked)} /> Default for new deals</label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="text-xs text-muted-foreground"><tr><th className="py-1 text-left">Stage</th><th className="py-1 text-left">Probability %</th><th className="py-1 text-left">Forecast</th><th className="py-1 text-left">Type</th><th /></tr></thead>
          <tbody>
            {stages.map((s, i) => (
              <tr key={i} className="border-t border-border">
                <td className="py-1 pr-2"><input className={inp} value={s.label} onChange={(e) => upd(i, { label: e.target.value })} /></td>
                <td className="w-28 py-1 pr-2"><input className={inp} inputMode="numeric" value={String(s.probability)} disabled={s.state !== 'open'} onChange={(e) => upd(i, { probability: Number(e.target.value) || 0 })} /></td>
                <td className="w-36 py-1 pr-2"><select className={inp} value={s.forecast} onChange={(e) => upd(i, { forecast: e.target.value as PipelineStage['forecast'] })}>{FORECASTS.map((f) => <option key={f}>{f}</option>)}</select></td>
                <td className="w-28 py-1 pr-2"><select className={inp} value={s.state} onChange={(e) => upd(i, { state: e.target.value as PipelineStage['state'] })}><option value="open">Open</option><option value="won">Won</option><option value="lost">Lost</option></select></td>
                <td className="w-24 py-1 text-right">
                  <button type="button" aria-label="Move up" onClick={() => move(i, -1)} className="rounded p-1 hover:bg-muted"><ArrowUp className="h-3.5 w-3.5" /></button>
                  <button type="button" aria-label="Move down" onClick={() => move(i, 1)} className="rounded p-1 hover:bg-muted"><ArrowDown className="h-3.5 w-3.5" /></button>
                  <button type="button" aria-label="Remove stage" onClick={() => setStages((x) => x.filter((_, j) => j !== i))} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={() => setStages((s) => [...s.slice(0, -2), { key: '', label: 'New stage', probability: 50, forecast: 'Pipeline', state: 'open' }, ...s.slice(-2)])} className="rounded-md border border-dashed border-border px-2.5 py-1 text-xs hover:bg-muted">+ Add stage</button>
      <p className="text-xs text-muted-foreground">Stages still holding deals can’t be removed, and a pipeline that holds deals can’t be renamed — move the deals first.</p>
      <div className="flex gap-2">
        <button type="button" onClick={save} className="h-9 rounded-md bg-navy px-4 text-navy-foreground">Save</button>
        <button type="button" onClick={onClose} className="h-9 rounded-md border border-border px-4 hover:bg-muted">Cancel</button>
        {p.id && <button type="button" onClick={del} className="ml-auto h-9 rounded-md border border-destructive/40 px-4 text-destructive">Delete</button>}
      </div>
    </section>
  );
}

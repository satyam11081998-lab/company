'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { setupModuleSettings, setupSaveField } from '@/app/(app)/crm/setup/actions';
import type { FieldType, SharingLevel } from '@/lib/crm/types';
import { SHARING_LABEL } from './modules-admin';

interface Field {
  id: string; api: string; label: string; type: FieldType; required: boolean; unique: boolean; section: string; position: number; active: boolean;
  system: boolean; synced: boolean; custom: boolean; picklist: string[]; expr: string; help: string;
}

const NEW_TYPES: Array<{ type: FieldType; label: string }> = [
  { type: 'text', label: 'Single line' }, { type: 'textarea', label: 'Multi-line' }, { type: 'email', label: 'Email' }, { type: 'phone', label: 'Phone' },
  { type: 'url', label: 'Website' }, { type: 'integer', label: 'Number' }, { type: 'decimal', label: 'Decimal' }, { type: 'currency', label: 'Currency' },
  { type: 'percent', label: 'Percent' }, { type: 'date', label: 'Date' }, { type: 'datetime', label: 'Date and time' }, { type: 'boolean', label: 'Checkbox' },
  { type: 'picklist', label: 'Pick list' }, { type: 'multipicklist', label: 'Multi-select' }, { type: 'lookup', label: 'Lookup' }, { type: 'user', label: 'User' },
  { type: 'formula', label: 'Formula' }, { type: 'rollup', label: 'Roll-up summary' }, { type: 'autonumber', label: 'Auto-number' },
];

const inp = 'h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm';

export default function FieldsAdmin({ module: mod, fields, lookupTargets, rollupSources }: {
  module: { api: string; label: string; singular: string; kind: string; sharing: SharingLevel };
  fields: Field[];
  lookupTargets: Array<{ api: string; label: string }>;
  rollupSources: Array<{ module: string; moduleLabel: string; via: string; viaLabel: string; numbers: Array<{ api: string; label: string }> }>;
}) {
  const router = useRouter();
  const [edit, setEdit] = useState<Field | null>(null);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState(mod.label);
  const [singular, setSingular] = useState(mod.singular);
  const [sharing, setSharing] = useState<SharingLevel>(mod.sharing);

  const saveModule = async () => {
    const r = await setupModuleSettings(mod.api, { label, singular, sharing });
    if (!r.ok) return toast.error(r.error);
    toast.success('Module saved');
    router.refresh();
  };

  const sections = [...new Set(fields.map((f) => f.section))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{mod.label}: fields</h1>
        <Link href="/crm/setup/modules" className="text-sm text-muted-foreground hover:underline">All modules</Link>
      </div>
      <section className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-card p-4 text-sm md:grid-cols-4">
        <label><span className="mb-1 block text-xs text-muted-foreground">Plural name</span><input className={inp} value={label} onChange={(e) => setLabel(e.target.value)} /></label>
        <label><span className="mb-1 block text-xs text-muted-foreground">Singular name</span><input className={inp} value={singular} onChange={(e) => setSingular(e.target.value)} /></label>
        <label><span className="mb-1 block text-xs text-muted-foreground">Default sharing</span>
          <select className={inp} value={sharing} onChange={(e) => setSharing(e.target.value as SharingLevel)}>
            {(Object.keys(SHARING_LABEL) as SharingLevel[]).map((s) => <option key={s} value={s}>{SHARING_LABEL[s]}</option>)}
          </select></label>
        <div className="flex items-end"><button type="button" onClick={saveModule} className="h-9 rounded-md bg-navy px-4 text-navy-foreground">Save module</button></div>
      </section>

      {sections.map((s) => (
        <section key={s} className="overflow-x-auto rounded-lg border border-border bg-card">
          <h2 className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s}</h2>
          <table className="w-full min-w-[640px] text-sm">
            <tbody>
              {fields.filter((f) => f.section === s).map((f) => (
                <tr key={f.api} className={`border-t border-border first:border-0 ${f.active ? '' : 'opacity-50'}`}>
                  <td className="px-4 py-1.5 font-medium">{f.label}{f.required && <span className="text-destructive"> *</span>}</td>
                  <td className="px-4 py-1.5 text-xs text-muted-foreground">{f.api}</td>
                  <td className="px-4 py-1.5 text-xs">{f.type}{f.unique ? ' · unique' : ''}{f.synced ? ' · from MECE' : ''}{f.system ? ' · system' : ''}{f.custom ? ' · custom' : ''}</td>
                  <td className="px-4 py-1.5 text-right"><button type="button" onClick={() => { setEdit(f); setAdding(false); }} className="text-xs text-navy hover:underline">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <button type="button" onClick={() => { setAdding(true); setEdit(null); }} className="h-9 rounded-md border border-dashed border-border px-4 text-sm hover:bg-muted">+ Add custom field</button>
      {(adding || edit) && (
        <FieldEditor key={edit?.api ?? 'new'} module={mod.api} field={edit} sections={sections} lookupTargets={lookupTargets} rollupSources={rollupSources}
          onDone={() => { setAdding(false); setEdit(null); router.refresh(); }} onCancel={() => { setAdding(false); setEdit(null); }} />
      )}
    </div>
  );
}

function FieldEditor({ module, field, sections, lookupTargets, rollupSources, onDone, onCancel }: {
  module: string; field: Field | null; sections: string[]; lookupTargets: Array<{ api: string; label: string }>;
  rollupSources: Array<{ module: string; moduleLabel: string; via: string; viaLabel: string; numbers: Array<{ api: string; label: string }> }>;
  onDone: () => void; onCancel: () => void;
}) {
  const [label, setLabel] = useState(field?.label ?? '');
  const [type, setType] = useState<FieldType>(field?.type ?? 'text');
  const [required, setRequired] = useState(field?.required ?? false);
  const [unique, setUnique] = useState(field?.unique ?? false);
  const [section, setSection] = useState(field?.section ?? sections[0] ?? 'Details');
  const [position, setPosition] = useState(String(field?.position ?? 500));
  const [active, setActive] = useState(field?.active ?? true);
  const [pick, setPick] = useState((field?.picklist ?? []).join('\n'));
  const [lookup, setLookup] = useState(lookupTargets[0]?.api ?? '');
  const [expr, setExpr] = useState(field?.expr ?? '');
  const [returns, setReturns] = useState('number');
  const [child, setChild] = useState(rollupSources[0] ? `${rollupSources[0].module}|${rollupSources[0].via}` : '');
  const [fn, setFn] = useState('count');
  const [sumField, setSumField] = useState('');
  const [help, setHelp] = useState(field?.help ?? '');
  const editingStd = !!field && !field.custom;
  const save = async () => {
    const [cm, via] = child.split('|');
    const r = await setupSaveField(module, {
      id: field?.id ?? null, label, type, required, is_unique: unique, section, position: Number(position), active,
      picklist: pick.split('\n').map((x) => x.trim()).filter(Boolean), lookupModule: lookup, expr, returns,
      rollup: type === 'rollup' ? { module: cm, via, fn, field: sumField || undefined } : undefined, help,
    });
    if (!r.ok) return toast.error(r.error);
    toast.success(field ? 'Field saved' : `Field created (${r.data})`);
    onDone();
  };
  const childSel = rollupSources.find((c) => `${c.module}|${c.via}` === child);
  return (
    <section className="space-y-3 rounded-lg border border-navy/30 bg-card p-4 text-sm">
      <p className="font-medium">{field ? `Edit “${field.label}”` : 'New custom field'}</p>
      {editingStd && <p className="text-xs text-muted-foreground">Standard field: you can rename it, move it, make it required and{field?.type === 'picklist' || field?.type === 'multipicklist' ? ' change its values' : ''}{field?.synced ? ' (MECE values stay; you can only add)' : ''}. Its type is fixed.</p>}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label><span className="mb-1 block text-xs text-muted-foreground">Label</span><input className={inp} value={label} onChange={(e) => setLabel(e.target.value)} /></label>
        <label><span className="mb-1 block text-xs text-muted-foreground">Type</span>
          <select className={inp} value={type} disabled={!!field} onChange={(e) => setType(e.target.value as FieldType)}>
            {NEW_TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
            {field && !NEW_TYPES.some((t) => t.type === field.type) && <option value={field.type}>{field.type}</option>}
          </select></label>
        <label><span className="mb-1 block text-xs text-muted-foreground">Section</span>
          <input className={inp} list="sections" value={section} onChange={(e) => setSection(e.target.value)} />
          <datalist id="sections">{sections.map((s) => <option key={s} value={s} />)}</datalist></label>
        <label><span className="mb-1 block text-xs text-muted-foreground">Position</span><input className={inp} inputMode="numeric" value={position} onChange={(e) => setPosition(e.target.value)} /></label>
        <label className="flex items-center gap-2 pt-5"><input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} /> Required</label>
        {!field && ['text', 'email', 'phone', 'url'].includes(type) && <label className="flex items-center gap-2 pt-5"><input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} /> No duplicates</label>}
        {field && <label className="flex items-center gap-2 pt-5"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active</label>}
      </div>
      {(type === 'picklist' || type === 'multipicklist') && (
        <label className="block"><span className="mb-1 block text-xs text-muted-foreground">Values (one per line)</span>
          <textarea className={`${inp} h-28 py-2`} value={pick} onChange={(e) => setPick(e.target.value)} /></label>
      )}
      {type === 'lookup' && !field && (
        <label className="block max-w-xs"><span className="mb-1 block text-xs text-muted-foreground">Looks up</span>
          <select className={inp} value={lookup} onChange={(e) => setLookup(e.target.value)}>{lookupTargets.map((t) => <option key={t.api} value={t.api}>{t.label}</option>)}</select></label>
      )}
      {type === 'formula' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px]">
          <label><span className="mb-1 block text-xs text-muted-foreground">Formula — e.g. <code>amount * probability / 100</code>, <code>IF(rating == &quot;Hot&quot;, 1, 0)</code>, <code>DAYS_BETWEEN(created_at, TODAY())</code></span>
            <input className={`${inp} font-mono`} value={expr} onChange={(e) => setExpr(e.target.value)} disabled={editingStd} /></label>
          {!field && <label><span className="mb-1 block text-xs text-muted-foreground">Returns</span>
            <select className={inp} value={returns} onChange={(e) => setReturns(e.target.value)}>{['number', 'currency', 'percent', 'text', 'date', 'boolean'].map((r) => <option key={r}>{r}</option>)}</select></label>}
        </div>
      )}
      {type === 'autonumber' && !field && (
        <label className="block max-w-xs"><span className="mb-1 block text-xs text-muted-foreground">Prefix (e.g. WS-)</span><input className={inp} value={expr} onChange={(e) => setExpr(e.target.value)} /></label>
      )}
      {type === 'rollup' && !field && (
        rollupSources.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label><span className="mb-1 block text-xs text-muted-foreground">Child records</span>
              <select className={inp} value={child} onChange={(e) => setChild(e.target.value)}>{rollupSources.map((c) => <option key={`${c.module}|${c.via}`} value={`${c.module}|${c.via}`}>{c.moduleLabel} (by {c.viaLabel})</option>)}</select></label>
            <label><span className="mb-1 block text-xs text-muted-foreground">Function</span>
              <select className={inp} value={fn} onChange={(e) => setFn(e.target.value)}>{['count', 'sum', 'avg', 'min', 'max'].map((x) => <option key={x}>{x}</option>)}</select></label>
            {fn !== 'count' && <label><span className="mb-1 block text-xs text-muted-foreground">Of field</span>
              <select className={inp} value={sumField} onChange={(e) => setSumField(e.target.value)}><option value="">Pick…</option>{childSel?.numbers.map((n) => <option key={n.api} value={n.api}>{n.label}</option>)}</select></label>}
          </div>
        ) : <p className="text-xs text-muted-foreground">No module has a lookup to this one yet, so there’s nothing to roll up.</p>
      )}
      <label className="block"><span className="mb-1 block text-xs text-muted-foreground">Help text</span><input className={inp} value={help} onChange={(e) => setHelp(e.target.value)} /></label>
      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={!label.trim()} className="h-9 rounded-md bg-navy px-4 text-navy-foreground disabled:opacity-50">Save field</button>
        <button type="button" onClick={onCancel} className="h-9 rounded-md border border-border px-4 hover:bg-muted">Cancel</button>
      </div>
    </section>
  );
}

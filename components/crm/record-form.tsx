'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { ClientField, ClientModule, ClientPipeline } from '@/lib/crm/client-types';
import { crmCreate, crmUpdate } from '@/app/(app)/crm/actions';
import { FieldInput, type Member } from './field-input';
import type { Refs } from './field-value';
import { layoutEffect, type LayoutRuleConfig } from '@/lib/crm/automation';

/** Create / edit form, grouped by section. The server re-validates everything. */
export default function RecordForm({ module: mod, fields, initial, refs, members, pipelines, recordId, updatedAt, ownerId, onDone, onCancel, layoutRules = [] }: {
  module: ClientModule;
  fields: ClientField[];
  initial: Record<string, unknown>;
  refs: Refs;
  members: Member[];
  pipelines: ClientPipeline[];
  recordId?: string;
  updatedAt?: string;
  ownerId?: string | null;
  onDone?: (id: string) => void;
  onCancel?: () => void;
  /** layout rules: fields shown/required only when a condition holds (the server re-checks "required") */
  layoutRules?: LayoutRuleConfig[];
}) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown>>(initial);
  const [owner, setOwner] = useState<string>(ownerId ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dup, setDup] = useState<{ id: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const editable = fields.filter((f) => !(f.system && !recordId));

  const sections = useMemo(() => {
    const out = new Map<string, ClientField[]>();
    const empty = (v: unknown) => v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length);
    for (const f of editable) {
      if (!recordId && f.ro) continue; // hide computed/system fields on create
      if (recordId && f.ro && empty(initial[f.api])) continue; // nothing to show, nothing to edit
      out.set(f.section, [...(out.get(f.section) ?? []), f]);
    }
    return [...out.entries()];
  }, [editable, recordId, initial]);

  const layout = useMemo(() => layoutEffect(layoutRules, data), [layoutRules, data]);
  const pipeline = pipelines.find((p) => p.name === data.pipeline) ?? pipelines[0];
  const stageOptions = pipeline?.stages.map((s) => ({ key: s.key, label: s.label }));

  const submit = async (allowDuplicate = false) => {
    setBusy(true);
    setErrors({});
    setDup(null);
    // send only what changed (edit) or what was filled in (create)
    const patch: Record<string, unknown> = {};
    for (const f of fields) {
      if (f.ro) continue;
      const before = initial[f.api];
      const now = data[f.api];
      if (JSON.stringify(before ?? null) !== JSON.stringify(now ?? null)) patch[f.api] = now === '' ? null : now;
    }
    const ownerChanged = (ownerId ?? '') !== owner;
    const res = recordId
      ? await crmUpdate(mod.api, recordId, patch, updatedAt ?? null, { ownerId: ownerChanged ? owner || null : undefined, allowDuplicate })
      : await crmCreate(mod.api, patch, { ownerId: owner || undefined, allowDuplicate });
    setBusy(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      if (res.duplicateOf) setDup(res.duplicateOf);
      toast.error(res.error);
      return;
    }
    toast.success(recordId ? 'Saved' : `${mod.singular} created`);
    if (onDone) onDone(res.data.id);
    else router.push(`/crm/m/${mod.api}/${res.data.id}`);
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(false); }}>
      {sections.map(([section, list]) => (
        <fieldset key={section} className="rounded-lg border border-border bg-card p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section}</legend>
          <div className={`grid grid-cols-1 gap-x-6 gap-y-3 ${list.some((f) => f.type === 'line_items') ? '' : 'md:grid-cols-2'}`}>
            {list.filter((f) => !layout.hidden.includes(f.api)).map((f) => (
              <div key={f.api} className={f.type === 'textarea' || f.type === 'line_items' || f.type === 'multipicklist' ? 'md:col-span-2' : ''}>
                <label htmlFor={`f-${f.api}`} className="mb-1 block text-xs font-medium text-muted-foreground">
                  {f.label}{(f.required || layout.required.includes(f.api)) && !f.ro ? <span className="text-destructive"> *</span> : null}
                  {f.ro && f.synced && <span className="ml-1 rounded bg-muted px-1 text-[10px] uppercase">from MECE</span>}
                </label>
                {mod.api === 'deals' && f.api === 'pipeline' && !f.ro ? (
                  <select id={`f-${f.api}`} className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm"
                    value={(data.pipeline as string) ?? pipelines[0]?.name ?? ''} onChange={(e) => setData((d) => ({ ...d, pipeline: e.target.value, stage: null }))}>
                    {pipelines.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                ) : (
                  <FieldInput id={`f-${f.api}`} field={f} value={data[f.api]} onChange={(v) => setData((d) => ({ ...d, [f.api]: v }))}
                    refs={refs} members={members} stageOptions={f.api === 'stage' ? stageOptions : undefined} />
                )}
                {f.help && <p className="mt-1 text-[11px] text-muted-foreground">{f.help}</p>}
                {errors[f.api] && <p className="mt-1 text-xs text-destructive">{errors[f.api]}</p>}
              </div>
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset className="rounded-lg border border-border bg-card p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ownership</legend>
        <label htmlFor="f-owner" className="mb-1 block text-xs font-medium text-muted-foreground">Owner</label>
        <select id="f-owner" className="h-9 w-full max-w-sm rounded-md border border-border bg-background px-2.5 text-sm" value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="">{recordId ? 'Unassigned' : 'Me'}</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </fieldset>

      {dup && (
        <div className="rounded-lg border border-warning/50 bg-warning-soft p-3 text-sm">
          Possible duplicate of <a className="font-medium text-navy underline" href={`/crm/m/${mod.api}/${dup.id}`} target="_blank" rel="noreferrer">{dup.name}</a>.
          <button type="button" onClick={() => submit(true)} className="ml-3 rounded-md border border-border bg-card px-2 py-1 text-xs hover:bg-muted">Save anyway</button>
        </div>
      )}
      {errors[''] && <p className="text-sm text-destructive">{errors['']}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="h-9 rounded-md bg-navy px-4 text-sm font-medium text-navy-foreground disabled:opacity-60">{busy ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={() => (onCancel ? onCancel() : router.back())} className="h-9 rounded-md border border-border px-4 text-sm hover:bg-muted">Cancel</button>
      </div>
    </form>
  );
}

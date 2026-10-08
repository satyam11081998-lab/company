'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { Action, ActionType } from '@/lib/crm/automation';
import type { ClientField } from '@/lib/crm/client-types';
import { inp } from '../ui';

export interface Refs {
  modules: Array<{ api: string; label: string; emailField?: string }>;
  fields: Record<string, ClientField[]>;
  members: Array<{ id: string; name: string }>;
  roles: Array<{ id: string; name: string }>;
  templates: Array<{ id: string; name: string; category: string }>;
  campaigns: Array<{ id: string; name: string }>;
  cadences: Array<{ id: string; name: string; module: string }>;
  webhooks: Array<{ id: string; name: string; module: string }>;
  stageKeys: Array<{ key: string; label: string }>;
}

const LABEL: Record<ActionType, string> = {
  field_update: 'Update a field', assign: 'Assign owner (round robin)', tag: 'Add / remove tags', email: 'Email the record (via Outbox)',
  notify: 'Notify a CRM user', task: 'Create a task', call: 'Schedule a call', create_record: 'Create a record',
  add_to_campaign: 'Add to campaign', enroll_cadence: 'Enroll in cadence', unenroll_cadence: 'Remove from cadence', webhook: 'Call a webhook',
};

/** Fields automation may set (server re-checks). */
export const writable = (f: ClientField) => !f.system && !['autonumber', 'formula', 'rollup', 'json', 'line_items'].includes(f.type) && !(f.synced && !['stage', 'lost_reason', 'probability', 'status', 'type', 'contact_id'].includes(f.api));

function ValueInput({ field, value, onChange, refs }: { field?: ClientField; value: unknown; onChange: (v: unknown) => void; refs: Refs }) {
  const v = value === null || value === undefined ? '' : String(value);
  if (!field) return <input className={inp} disabled />;
  if (field.type === 'picklist') return <select className={inp} value={v} onChange={(e) => onChange(e.target.value)}><option value="">(empty)</option>{(field.api === 'stage' && refs.stageKeys.length ? refs.stageKeys.map((s) => ({ v: s.key, l: s.label })) : (field.picklist ?? []).map((p) => ({ v: p, l: p }))).map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>;
  if (field.type === 'boolean') return <select className={inp} value={v} onChange={(e) => onChange(e.target.value === 'true')}><option value="true">Yes</option><option value="false">No</option></select>;
  if (field.type === 'user') return <select className={inp} value={v} onChange={(e) => onChange(e.target.value)}><option value="">(nobody)</option><option value="{{owner}}">Record owner</option>{refs.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>;
  if (field.type === 'date' || field.type === 'datetime') return <input className={inp} value={v} placeholder="{{today}}, {{today+7}} or 2026-12-31" onChange={(e) => onChange(e.target.value)} />;
  return <input className={inp} value={v} onChange={(e) => onChange(e.target.value)} placeholder="value" />;
}

function Who({ value, onChange, refs }: { value?: string; onChange: (v: string) => void; refs: Refs }) {
  return (
    <select className={inp} value={value ?? 'owner'} onChange={(e) => onChange(e.target.value)}>
      <option value="owner">Record owner</option><option value="owner_managers">Owner’s managers</option>
      {refs.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
    </select>
  );
}

export function ActionsEditor({ module, value, onChange, refs, allow }: { module: string; value: Action[]; onChange: (a: Action[]) => void; refs: Refs; allow?: ActionType[] }) {
  const fields = (refs.fields[module] ?? []).filter(writable);
  const types = (Object.keys(LABEL) as ActionType[]).filter((t) => !allow || allow.includes(t));
  const set = (i: number, p: Partial<Action>) => onChange(value.map((a, j) => (j === i ? { ...a, ...p } : a)));
  const add = (type: ActionType) => {
    const base: Action = { type };
    if (type === 'task' || type === 'call') Object.assign(base, { subject: '', dueInDays: 1, to: 'owner', priority: 'Normal' });
    if (type === 'notify') Object.assign(base, { to: 'owner', title: '' });
    if (type === 'field_update') Object.assign(base, { field: fields[0]?.api, value: '' });
    if (type === 'tag') Object.assign(base, { add: [], remove: [] });
    if (type === 'assign') Object.assign(base, { userIds: [] });
    if (type === 'create_record') Object.assign(base, { module: 'tasks', values: {} });
    onChange([...value, base]);
  };
  return (
    <div className="space-y-2">
      {value.map((a, i) => (
        <div key={i} className="rounded-md border border-border bg-muted/20 p-2 text-sm">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium">{LABEL[a.type]}</span>
            <button type="button" aria-label="Remove action" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          {a.type === 'field_update' && (
            <div className="grid grid-cols-2 gap-2">
              <select className={inp} value={a.field ?? ''} onChange={(e) => set(i, { field: e.target.value, value: '' })}>{fields.map((f) => <option key={f.api} value={f.api}>{f.label}</option>)}</select>
              <ValueInput field={fields.find((f) => f.api === a.field)} value={a.value} onChange={(v) => set(i, { value: v })} refs={refs} />
            </div>
          )}
          {a.type === 'assign' && (
            <div className="flex flex-wrap gap-3">{refs.members.map((m) => (
              <label key={m.id} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={(a.userIds ?? []).includes(m.id)} onChange={(e) => set(i, { userIds: e.target.checked ? [...(a.userIds ?? []), m.id] : (a.userIds ?? []).filter((x) => x !== m.id) })} />{m.name}</label>
            ))}</div>
          )}
          {a.type === 'tag' && (
            <div className="grid grid-cols-2 gap-2">
              <input className={inp} placeholder="Add tags (comma separated)" value={(a.add ?? []).join(', ')} onChange={(e) => set(i, { add: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} />
              <input className={inp} placeholder="Remove tags" value={(a.remove ?? []).join(', ')} onChange={(e) => set(i, { remove: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} />
            </div>
          )}
          {a.type === 'email' && (
            <select className={inp} value={a.templateId ?? ''} onChange={(e) => set(i, { templateId: e.target.value })}><option value="">Choose template…</option>{refs.templates.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.category})</option>)}</select>
          )}
          {a.type === 'notify' && (
            <div className="grid grid-cols-2 gap-2"><Who value={a.to} onChange={(v) => set(i, { to: v })} refs={refs} /><input className={inp} placeholder="Notification title" value={a.title ?? ''} onChange={(e) => set(i, { title: e.target.value })} maxLength={200} /></div>
          )}
          {(a.type === 'task' || a.type === 'call') && (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <input className={`${inp} md:col-span-2`} placeholder="Subject" value={a.subject ?? ''} onChange={(e) => set(i, { subject: e.target.value })} maxLength={250} />
              <label className="flex items-center gap-1 text-xs">due in <input type="number" min={0} max={365} className={inp} value={a.dueInDays ?? 1} onChange={(e) => set(i, { dueInDays: Number(e.target.value) })} /> days</label>
              <Who value={a.to} onChange={(v) => set(i, { to: v })} refs={refs} />
              {a.type === 'task' && <select className={inp} value={a.priority ?? 'Normal'} onChange={(e) => set(i, { priority: e.target.value })}><option>High</option><option>Normal</option><option>Low</option></select>}
            </div>
          )}
          {a.type === 'create_record' && (
            <div className="space-y-1.5">
              <select className={inp} value={a.module ?? ''} onChange={(e) => set(i, { module: e.target.value, values: {} })}>{refs.modules.map((m) => <option key={m.api} value={m.api}>{m.label}</option>)}</select>
              <textarea className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs" rows={3}
                placeholder={'One per line: field_name = value. Use {{field}} to copy from this record, e.g.\nsubject = Onboard {{name}}'}
                value={Object.entries(a.values ?? {}).map(([k, v]) => `${k} = ${String(v)}`).join('\n')}
                onChange={(e) => set(i, { values: Object.fromEntries(e.target.value.split('\n').map((l) => l.split('=')).filter((p) => p.length >= 2 && p[0].trim()).map((p) => [p[0].trim(), p.slice(1).join('=').trim()])) })} />
            </div>
          )}
          {a.type === 'add_to_campaign' && <select className={inp} value={a.campaignId ?? ''} onChange={(e) => set(i, { campaignId: e.target.value })}><option value="">Choose campaign…</option>{refs.campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
          {(a.type === 'enroll_cadence' || a.type === 'unenroll_cadence') && <select className={inp} value={a.cadenceId ?? ''} onChange={(e) => set(i, { cadenceId: e.target.value })}><option value="">Choose cadence…</option>{refs.cadences.filter((c) => c.module === module).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
          {a.type === 'webhook' && <select className={inp} value={a.webhookId ?? ''} onChange={(e) => set(i, { webhookId: e.target.value })}><option value="">Choose webhook…</option>{refs.webhooks.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>}
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        <select className="h-7 rounded-md border border-dashed border-border bg-background px-2 text-xs" value="" onChange={(e) => e.target.value && add(e.target.value as ActionType)}>
          <option value="">Add an action…</option>
          {types.map((t) => <option key={t} value={t}>{LABEL[t]}</option>)}
        </select>
      </div>
    </div>
  );
}

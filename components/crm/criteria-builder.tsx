'use client';

import { Plus, X } from 'lucide-react';
import type { ClientField } from '@/lib/crm/client-types';
import { NO_VALUE_OPS, OPERATOR_LABELS } from '@/lib/crm/criteria';
import type { Condition, Criteria, Operator } from '@/lib/crm/types';
import type { Member } from './field-input';

const TEXT_OPS: Operator[] = ['eq', 'neq', 'contains', 'not_contains', 'starts_with', 'ends_with', 'in', 'not_in', 'empty', 'not_empty'];
const NUM_OPS: Operator[] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'empty', 'not_empty'];
const DATE_OPS: Operator[] = ['on', 'before', 'after', 'today', 'this_week', 'this_month', 'last_month', 'this_quarter', 'this_year', 'in_last_days', 'in_next_days', 'older_than_days', 'empty', 'not_empty'];
const PICK_OPS: Operator[] = ['eq', 'neq', 'in', 'not_in', 'empty', 'not_empty'];
const BOOL_OPS: Operator[] = ['eq'];

export const PSEUDO_FIELDS: ClientField[] = [
  { api: 'name', label: 'Record name', type: 'text', required: false, ro: true, system: true, synced: false, section: 'System' },
  { api: 'owner_id', label: 'Owner', type: 'user', required: false, ro: true, system: true, synced: false, section: 'System' },
  { api: 'created_at', label: 'Created', type: 'datetime', required: false, ro: true, system: true, synced: false, section: 'System' },
  { api: 'updated_at', label: 'Modified', type: 'datetime', required: false, ro: true, system: true, synced: false, section: 'System' },
  { api: 'last_activity_at', label: 'Last activity', type: 'datetime', required: false, ro: true, system: true, synced: false, section: 'System' },
  { api: 'tags', label: 'Tag', type: 'text', required: false, ro: true, system: true, synced: false, section: 'System' },
  { api: 'score', label: 'Score', type: 'integer', required: false, ro: true, system: true, synced: false, section: 'System' },
];

export function opsFor(f: ClientField | undefined): Operator[] {
  if (!f) return TEXT_OPS;
  if (f.api === 'tags') return ['has_tag', 'not_has_tag'];
  switch (f.type) {
    case 'integer': case 'decimal': case 'currency': case 'percent': case 'rollup': return NUM_OPS;
    case 'date': case 'datetime': return DATE_OPS;
    case 'picklist': case 'multipicklist': case 'user': case 'lookup': return PICK_OPS;
    case 'boolean': return BOOL_OPS;
    case 'formula': return f.returns === 'date' ? DATE_OPS : f.returns === 'text' ? TEXT_OPS : NUM_OPS;
    default: return TEXT_OPS;
  }
}

const inp = 'h-8 rounded-md border border-border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring';

export function CriteriaBuilder({ fields, value, onChange, members, allowChangeOps = false }: {
  fields: ClientField[];
  value: Criteria | null;
  onChange: (c: Criteria | null) => void;
  members?: Member[];
  /** workflow edit triggers may use changed / changed_to / changed_from */
  allowChangeOps?: boolean;
}) {
  const all = [...fields.filter((f) => f.type !== 'line_items' && f.type !== 'json' && f.type !== 'related'), ...PSEUDO_FIELDS.filter((p) => !fields.some((f) => f.api === p.api))];
  const crit: Criteria = value ?? { match: 'all', conditions: [] };
  const conds = crit.conditions.filter((c): c is Condition => !('match' in c));
  const set = (next: Condition[], match = crit.match) => onChange(next.length ? { match, conditions: next } : null);
  const byApi = new Map(all.map((f) => [f.api, f]));

  return (
    <div className="space-y-2">
      {conds.length > 1 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Match</span>
          {(['all', 'any'] as const).map((m) => (
            <button key={m} type="button" onClick={() => set(conds, m)}
              className={`rounded-full border px-2.5 py-0.5 ${crit.match === m ? 'border-navy bg-navy text-navy-foreground' : 'border-border hover:bg-muted'}`}>
              {m === 'all' ? 'all conditions' : 'any condition'}
            </button>
          ))}
        </div>
      )}
      {conds.map((c, i) => {
        const f = byApi.get(c.field);
        const ops = [...opsFor(f), ...(allowChangeOps ? (['changed', 'changed_to', 'changed_from'] as Operator[]) : [])];
        const upd = (patch: Partial<Condition>) => set(conds.map((x, j) => (j === i ? { ...x, ...patch } : x)));
        return (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <select className={`${inp} w-48`} value={c.field} aria-label="Field"
              onChange={(e) => { const nf = byApi.get(e.target.value); upd({ field: e.target.value, op: opsFor(nf)[0], value: undefined, value2: undefined }); }}>
              {all.map((x) => <option key={x.api} value={x.api}>{x.label}</option>)}
            </select>
            <select className={`${inp} w-44`} value={c.op} aria-label="Operator" onChange={(e) => upd({ op: e.target.value as Operator })}>
              {ops.map((o) => <option key={o} value={o}>{OPERATOR_LABELS[o]}</option>)}
            </select>
            {!NO_VALUE_OPS.includes(c.op) && <ValueInput field={f} op={c.op} value={c.value} onChange={(v) => upd({ value: v })} members={members} />}
            {c.op === 'between' && <ValueInput field={f} op={c.op} value={c.value2} onChange={(v) => upd({ value2: v })} members={members} />}
            <button type="button" aria-label="Remove condition" onClick={() => set(conds.filter((_, j) => j !== i))} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
      <button type="button" onClick={() => set([...conds, { field: all[0]?.api ?? 'name', op: opsFor(all[0])[0] }])}
        className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2.5 py-1 text-xs hover:bg-muted">
        <Plus className="h-3.5 w-3.5" /> Add condition
      </button>
    </div>
  );
}

function ValueInput({ field, op, value, onChange, members }: { field?: ClientField; op: Operator; value: unknown; onChange: (v: unknown) => void; members?: Member[] }) {
  if (['in_last_days', 'in_next_days', 'older_than_days'].includes(op)) {
    return <input className={`${inp} w-24`} type="number" min={0} value={value === undefined ? '' : String(value)} onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))} placeholder="days" aria-label="Days" />;
  }
  if (!field) return <input className={`${inp} w-48`} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />;
  if (field.type === 'boolean') {
    return (
      <select className={`${inp} w-24`} value={String(value ?? 'true')} onChange={(e) => onChange(e.target.value === 'true')} aria-label="Value">
        <option value="true">Yes</option><option value="false">No</option>
      </select>
    );
  }
  if (field.type === 'user' && members) {
    return (
      <select className={`${inp} w-48`} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} aria-label="Value">
        <option value="">—</option>
        {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
    );
  }
  if ((field.type === 'picklist' || field.type === 'multipicklist') && field.picklist?.length) {
    if (op === 'in' || op === 'not_in') {
      const cur = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="flex max-w-xl flex-wrap gap-1">
          {field.picklist.map((v) => {
            const on = cur.includes(v);
            return (
              <button key={v} type="button" onClick={() => onChange(on ? cur.filter((x) => x !== v) : [...cur, v])}
                className={`rounded-full border px-2 py-0.5 text-xs ${on ? 'border-navy bg-navy text-navy-foreground' : 'border-border hover:bg-muted'}`}>{v}</button>
            );
          })}
        </div>
      );
    }
    return (
      <select className={`${inp} w-48`} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} aria-label="Value">
        <option value="">—</option>
        {field.picklist.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
    );
  }
  if (field.type === 'date' || field.type === 'datetime') {
    return <input className={`${inp} w-40`} type="date" value={typeof value === 'string' ? value.slice(0, 10) : ''} onChange={(e) => onChange(e.target.value)} aria-label="Date" />;
  }
  const numeric = ['integer', 'decimal', 'currency', 'percent', 'rollup'].includes(field.type);
  return <input className={`${inp} w-48`} inputMode={numeric ? 'decimal' : undefined} value={String(value ?? '')}
    onChange={(e) => onChange(numeric && e.target.value !== '' && Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : e.target.value)} aria-label="Value"
    placeholder={op === 'in' || op === 'not_in' ? 'a, b, c' : ''} />;
}

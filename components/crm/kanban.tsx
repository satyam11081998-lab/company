'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ClientField, ClientModule, ClientRecord } from '@/lib/crm/client-types';
import { formatMoney } from '@/lib/crm/fields';
import { crmUpdate } from '@/app/(app)/crm/actions';
import type { Refs } from './field-value';

/** Board view grouped by a picklist (deal stage, lead status, case status …). Drag a card to move it. */
export default function Kanban({ module: mod, field, groups, rows, fields, refs, canEdit, stageLabels }: {
  module: ClientModule;
  field: string;
  groups: Array<{ key: string; label: string }>;
  rows: ClientRecord[];
  fields: ClientField[];
  refs: Refs;
  canEdit: boolean;
  stageLabels: Record<string, string>;
}) {
  const router = useRouter();
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [local, setLocal] = useState<Record<string, string>>({});
  const fdef = fields.find((f) => f.api === field);
  const movable = canEdit && fdef && !fdef.ro;
  const valueOf = (r: ClientRecord) => local[r.id] ?? String(r.data[field] ?? '');
  const known = new Set(groups.map((g) => g.key));
  const cols = [...groups, ...(rows.some((r) => !known.has(valueOf(r))) ? [{ key: '__none__', label: 'Other / empty' }] : [])];

  const drop = async (key: string) => {
    const id = dragId;
    setDragId(null);
    setOver(null);
    if (!id || key === '__none__') return;
    const rec = rows.find((r) => r.id === id);
    if (!rec || valueOf(rec) === key) return;
    if (rec.blueprint) return toast.error('This record follows a Blueprint — open it and use a transition.');
    setLocal((l) => ({ ...l, [id]: key }));
    const r = await crmUpdate(mod.api, id, { [field]: key }, rec.updated_at);
    if (!r.ok) {
      setLocal((l) => { const n = { ...l }; delete n[id]; return n; });
      toast.error(r.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {cols.map((g) => {
        const items = rows.filter((r) => (g.key === '__none__' ? !known.has(valueOf(r)) : valueOf(r) === g.key));
        // never add dollars to rupees: one total per currency
        const sums = new Map<string, number>();
        for (const r of items) if (typeof r.data.amount === 'number') sums.set(String(r.data.currency ?? 'INR'), (sums.get(String(r.data.currency ?? 'INR')) ?? 0) + (r.data.amount as number));
        const sumText = [...sums.entries()].sort(([a], [b]) => (a === 'INR' ? -1 : b === 'INR' ? 1 : a.localeCompare(b))).map(([c, v]) => formatMoney(v, c)).join(' + ');
        return (
          <div key={g.key}
            onDragOver={(e) => { if (movable) { e.preventDefault(); setOver(g.key); } }}
            onDragLeave={() => setOver((o) => (o === g.key ? null : o))}
            onDrop={() => drop(g.key)}
            className={`flex w-64 shrink-0 flex-col rounded-lg border bg-muted/40 ${over === g.key ? 'border-navy' : 'border-border'}`}>
            <div className="border-b border-border px-3 py-2">
              <p className="text-sm font-semibold">{g.label}</p>
              <p className="text-xs text-muted-foreground">{items.length}{mod.api === 'deals' && sumText ? ` · ${sumText}` : ''}</p>
            </div>
            <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto p-2">
              {items.slice(0, 200).map((r) => (
                <div key={r.id} draggable={!!movable} onDragStart={() => setDragId(r.id)}
                  className={`rounded-md border border-border bg-card p-2.5 text-sm shadow-sm ${movable ? 'cursor-grab active:cursor-grabbing' : ''}`}>
                  <Link href={`/crm/m/${mod.api}/${r.id}`} className="font-medium text-navy hover:underline">{r.name || '(no name)'}</Link>
                  <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {typeof r.data.amount === 'number' && <p className="tabular-nums">{formatMoney(r.data.amount as number, String(r.data.currency ?? 'INR'))}</p>}
                    {typeof r.data.closing_date === 'string' && <p>Closes {r.data.closing_date as string}</p>}
                    {typeof r.data.due_date === 'string' && <p>Due {r.data.due_date as string}</p>}
                    {typeof r.data.priority === 'string' && <p>{r.data.priority as string} priority</p>}
                    {typeof r.data.email === 'string' && <p className="truncate">{r.data.email as string}</p>}
                    {r.owner_id && <p>{refs[r.owner_id]?.name}</p>}
                  </div>
                </div>
              ))}
              {items.length > 200 && <p className="px-1 text-xs text-muted-foreground">+{items.length - 200} more — use the list view.</p>}
              {!items.length && <p className="px-1 py-4 text-center text-xs text-muted-foreground/70">Empty</p>}
            </div>
          </div>
        );
      })}
      {!movable && rows.length > 0 && <p className="sr-only">{stageLabels ? '' : ''}You can view this board but not move cards.</p>}
    </div>
  );
}

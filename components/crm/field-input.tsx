'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { ClientField } from '@/lib/crm/client-types';
import { computeTotals, formatMoney } from '@/lib/crm/fields';
import { crmLookupSearch } from '@/app/(app)/crm/actions';
import type { Refs } from './field-value';

export interface Member { id: string; name: string }

const base = 'h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:text-muted-foreground';

function toLocalInput(iso: unknown): string {
  if (typeof iso !== 'string' || !iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function FieldInput({ field, value, onChange, refs, members, stageOptions, disabled, id }: {
  field: ClientField;
  value: unknown;
  onChange: (v: unknown) => void;
  refs?: Refs;
  members?: Member[];
  stageOptions?: Array<{ key: string; label: string }>;
  disabled?: boolean;
  id?: string;
}) {
  const ro = disabled || field.ro;
  switch (field.type) {
    case 'textarea':
      return <textarea id={id} className={`${base} h-24 py-2`} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} disabled={ro} maxLength={32000} />;
    case 'integer': case 'decimal': case 'currency': case 'percent':
      return <input id={id} className={base} inputMode="decimal" value={value === null || value === undefined ? '' : String(value)} onChange={(e) => onChange(e.target.value)} disabled={ro} />;
    case 'date':
      return <input id={id} type="date" className={base} value={typeof value === 'string' ? value.slice(0, 10) : ''} onChange={(e) => onChange(e.target.value || null)} disabled={ro} />;
    case 'datetime':
      return <input id={id} type="datetime-local" className={base} value={toLocalInput(value)} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} disabled={ro} />;
    case 'boolean':
      return (
        <label className="inline-flex h-9 items-center gap-2 text-sm">
          <input id={id} type="checkbox" className="h-4 w-4 accent-[hsl(var(--navy))]" checked={value === true} onChange={(e) => onChange(e.target.checked)} disabled={ro} />
          {value === true ? 'Yes' : 'No'}
        </label>
      );
    case 'picklist': {
      const opts = field.api === 'stage' && stageOptions ? stageOptions : (field.picklist ?? []).map((v) => ({ key: v, label: v }));
      return (
        <select id={id} className={base} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || null)} disabled={ro}>
          <option value="">—</option>
          {opts.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      );
    }
    case 'multipicklist': {
      const cur = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="flex flex-wrap gap-1.5">
          {(field.picklist ?? []).map((v) => {
            const on = cur.includes(v);
            return (
              <button key={v} type="button" disabled={ro} onClick={() => onChange(on ? cur.filter((x) => x !== v) : [...cur, v])}
                className={`rounded-full border px-2.5 py-1 text-xs ${on ? 'border-navy bg-navy text-navy-foreground' : 'border-border bg-background hover:bg-muted'}`}>
                {v}
              </button>
            );
          })}
        </div>
      );
    }
    case 'user':
      return (
        <select id={id} className={base} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || null)} disabled={ro}>
          <option value="">—</option>
          {(members ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      );
    case 'lookup':
      return <LookupInput id={id} module={field.lookup!} value={(value as string) ?? null} refs={refs} onChange={onChange} disabled={ro} />;
    case 'related':
      return <RelatedInput id={id} field={field} value={value as { module?: string; id?: string } | null} refs={refs} onChange={onChange} disabled={ro} />;
    case 'line_items':
      return <LineItemsEditor value={value} onChange={onChange} refs={refs} disabled={ro} mode={field.mode ?? 'sale'} />;
    case 'autonumber': case 'formula': case 'rollup': case 'json':
      return <input className={base} value={value === null || value === undefined ? '' : String(value)} disabled />;
    default:
      return (
        <input id={id} className={base} type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : 'text'}
          value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} disabled={ro} maxLength={field.type === 'url' ? 2000 : 255} />
      );
  }
}

function RelatedInput({ field, value, refs, onChange, disabled, id }: {
  field: ClientField; value: { module?: string; id?: string } | null; refs?: Refs; onChange: (v: unknown) => void; disabled?: boolean; id?: string;
}) {
  const [mod, setMod] = useState(value?.module ?? field.related?.[0] ?? 'contacts');
  return (
    <div className="flex gap-2">
      <select className={`${base} w-36 shrink-0`} value={mod} disabled={disabled} aria-label="Related module"
        onChange={(e) => { setMod(e.target.value); onChange(null); }}>
        {(field.related ?? []).map((m) => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
      </select>
      <LookupInput id={id} module={mod} value={value?.module === mod ? value?.id ?? null : null} refs={refs} disabled={disabled}
        onChange={(nid) => onChange(nid ? { module: mod, id: nid } : null)} />
    </div>
  );
}

export function LookupInput({ module, value, refs, onChange, disabled, id }: {
  module: string; value: string | null; refs?: Refs; onChange: (v: string | null) => void; disabled?: boolean; id?: string;
}) {
  const [label, setLabel] = useState<string>(value ? refs?.[value]?.name ?? '' : '');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Array<{ id: string; name: string; sub: string }>>([]);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value && refs?.[value]) setLabel(refs[value].name);
    if (!value) setLabel('');
  }, [value, refs]);

  useEffect(() => {
    if (!open) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setBusy(true);
      const res = await crmLookupSearch(module, q);
      setRows(res.ok ? res.data : []);
      setBusy(false);
    }, 250);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [q, open, module]);

  if (value && !open) {
    return (
      <div className={`${base} flex items-center justify-between`}>
        <span className="truncate">{label || 'Selected record'}</span>
        {!disabled && (
          <button type="button" aria-label="Clear" onClick={() => { onChange(null); setLabel(''); }} className="rounded p-0.5 hover:bg-muted">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="relative w-full">
      <input id={id} className={base} placeholder={`Search ${module.replace(/_/g, ' ')}…`} value={q} disabled={disabled}
        onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} onChange={(e) => setQ(e.target.value)} />
      {open && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
          {busy && <p className="px-3 py-2 text-xs text-muted-foreground">Searching…</p>}
          {!busy && !rows.length && <p className="px-3 py-2 text-xs text-muted-foreground">No matches.</p>}
          {rows.map((r) => (
            <button key={r.id} type="button" className="block w-full px-3 py-1.5 text-left text-sm hover:bg-muted"
              onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(r.id); setLabel(r.name); setOpen(false); setQ(''); }}>
              <span className="font-medium">{r.name}</span>
              {r.sub && <span className="ml-2 text-xs text-muted-foreground">{r.sub}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface Line { product_id: string | null; product_name: string; quantity: number | string; list_price: number | string; discount: number | string; tax_pct: number | string; description?: string }

function LineItemsEditor({ value, onChange, refs, disabled, mode }: { value: unknown; onChange: (v: unknown) => void; refs?: Refs; disabled?: boolean; mode: 'sale' | 'pricebook' }) {
  const lines: Line[] = Array.isArray(value) ? (value as Line[]) : [];
  const set = (i: number, patch: Partial<Line>) => onChange(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const add = () => onChange([...lines, { product_id: null, product_name: '', quantity: 1, list_price: '', discount: 0, tax_pct: mode === 'sale' ? 18 : 0 }]);
  const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const totals = computeTotals(lines.map((l) => ({ ...l, quantity: num(l.quantity), list_price: num(l.list_price), discount: num(l.discount), tax_pct: num(l.tax_pct) })), 0);
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-2 py-1.5 text-left font-medium">Product</th>
              {mode === 'sale' && <th className="w-20 px-2 py-1.5 text-right font-medium">Qty</th>}
              <th className="w-28 px-2 py-1.5 text-right font-medium">{mode === 'sale' ? 'Price' : 'List price'}</th>
              {mode === 'sale' && <th className="w-24 px-2 py-1.5 text-right font-medium">Discount</th>}
              {mode === 'sale' && <th className="w-20 px-2 py-1.5 text-right font-medium">Tax %</th>}
              {mode === 'sale' && <th className="w-28 px-2 py-1.5 text-right font-medium">Total</th>}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => {
              const net = num(l.quantity) * num(l.list_price) - num(l.discount);
              return (
                <tr key={i} className="border-t border-border">
                  <td className="px-2 py-1">
                    <div className="space-y-1">
                      <LookupInput module="products" value={l.product_id} refs={refs} disabled={disabled}
                        onChange={(id) => set(i, { product_id: id })} />
                      <input className={base} placeholder="Line name" value={l.product_name} disabled={disabled} onChange={(e) => set(i, { product_name: e.target.value })} />
                    </div>
                  </td>
                  {mode === 'sale' && <td className="px-2 py-1"><input className={`${base} text-right`} value={String(l.quantity)} disabled={disabled} onChange={(e) => set(i, { quantity: e.target.value })} /></td>}
                  <td className="px-2 py-1"><input className={`${base} text-right`} value={String(l.list_price)} disabled={disabled} onChange={(e) => set(i, { list_price: e.target.value })} /></td>
                  {mode === 'sale' && <td className="px-2 py-1"><input className={`${base} text-right`} value={String(l.discount)} disabled={disabled} onChange={(e) => set(i, { discount: e.target.value })} /></td>}
                  {mode === 'sale' && <td className="px-2 py-1"><input className={`${base} text-right`} value={String(l.tax_pct)} disabled={disabled} onChange={(e) => set(i, { tax_pct: e.target.value })} /></td>}
                  {mode === 'sale' && <td className="px-2 py-1 text-right tabular-nums">{formatMoney(Math.round((net + (net * num(l.tax_pct)) / 100) * 100) / 100)}</td>}
                  <td className="px-1 py-1">
                    {!disabled && (
                      <button type="button" aria-label="Remove line" onClick={() => onChange(lines.filter((_, j) => j !== i))} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!lines.length && <tr><td colSpan={7} className="px-3 py-3 text-center text-xs text-muted-foreground">No items yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        {!disabled ? (
          <button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted">
            <Plus className="h-3.5 w-3.5" /> Add item
          </button>
        ) : <span />}
        {mode === 'sale' && (
          <p className="text-xs text-muted-foreground">
            Sub-total {formatMoney(totals.sub_total)} · Discount {formatMoney(totals.discount_total)} · Tax {formatMoney(totals.tax_total)} · <span className="font-semibold text-foreground">Total {formatMoney(totals.grand_total)}</span>
          </p>
        )}
      </div>
    </div>
  );
}

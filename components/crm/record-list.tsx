'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Columns3, Download, Filter, LayoutList, Plus, Save, Tag, Trash2, Upload, UserCog, X, Pencil } from 'lucide-react';
import type { ClientField, ClientModule, ClientPipeline, ClientRecord } from '@/lib/crm/client-types';
import type { Criteria } from '@/lib/crm/types';
import { crmDelete, crmExport, crmMassUpdate, crmSaveView, crmDeleteView, crmTags, crmTransfer } from '@/app/(app)/crm/actions';
import { crmApplyAssignment, crmEnrollCadence, crmRunMacro } from '@/app/(app)/crm/auto-actions';
import { CriteriaBuilder } from './criteria-builder';
import { FieldInput, type Member } from './field-input';
import { FieldValue, type Refs } from './field-value';
import Kanban from './kanban';

const COLUMN_LABEL: Record<string, string> = { name: 'Name', owner_id: 'Owner', created_at: 'Created', updated_at: 'Modified', last_activity_at: 'Last activity' };

export default function RecordList(props: {
  module: ClientModule;
  fields: ClientField[];
  rows: ClientRecord[];
  refs: Refs;
  total: number;
  truncated: boolean;
  page: number;
  pageSize: number;
  columns: string[];
  sort: { field: string; dir: 'asc' | 'desc' };
  views: Array<{ key: string; name: string; system: boolean; mine: boolean; shared?: boolean }>;
  viewKey: string;
  adhoc: Criteria | null;
  /** the view's criteria AND the ad-hoc filter AND "mine" — what Export exports */
  exportCriteria: Criteria | null;
  search: string;
  kanban: boolean;
  kanbanGroups: Array<{ key: string; label: string }>;
  pipelines: ClientPipeline[];
  pipelineName: string | null;
  members: Member[];
  perms: { create: boolean; edit: boolean; delete: boolean; import: boolean; export: boolean; shareViews: boolean };
  error: string | null;
  /** automation shortcuts for selected rows */
  macros?: Array<{ id: string; name: string }>;
  cadences?: Array<{ id: string; name: string }>;
  canAssign?: boolean;
}) {
  const { module: mod, fields, rows, refs } = props;
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(!!props.adhoc);
  const [crit, setCrit] = useState<Criteria | null>(props.adhoc);
  const [q, setQ] = useState(props.search);
  const [bulk, setBulk] = useState<null | 'update' | 'owner' | 'tag'>(null);
  const [bulkField, setBulkField] = useState('');
  const [bulkValue, setBulkValue] = useState<unknown>(null);
  const [owner, setOwner] = useState('');
  const [tagText, setTagText] = useState('');
  const [saving, setSaving] = useState(false);
  const byApi = useMemo(() => new Map(fields.map((f) => [f.api, f])), [fields]);
  const stageLabels = useMemo(() => Object.fromEntries(props.pipelines.flatMap((p) => p.stages.map((s) => [s.key, s.label]))), [props.pipelines]);

  const go = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params?.toString() ?? '');
    for (const [k, v] of Object.entries(patch)) (v === null || v === '' ? next.delete(k) : next.set(k, v));
    if (!('page' in patch)) next.delete('page');
    start(() => router.push(`${pathname}?${next.toString()}`));
  };

  const refresh = () => { setSelected([]); router.refresh(); };

  const runBulk = async () => {
    if (!selected.length) return;
    setSaving(true);
    try {
      if (bulk === 'update') {
        if (!bulkField) return toast.error('Pick a field.');
        const r = await crmMassUpdate(mod.api, selected, bulkField, bulkValue);
        if (!r.ok) toast.error(r.error);
        else toast[r.data.failed ? 'warning' : 'success'](`Updated ${r.data.done}${r.data.failed ? `, ${r.data.failed} failed: ${r.data.firstError}` : ''}`);
      } else if (bulk === 'owner') {
        const r = await crmTransfer(mod.api, selected, owner || null);
        if (!r.ok) toast.error(r.error); else toast.success(`Owner changed on ${r.data.done}${r.data.firstError ? ` (some failed: ${r.data.firstError})` : ''}`);
      } else if (bulk === 'tag') {
        const tags = tagText.split(',').map((t) => t.trim()).filter(Boolean);
        const r = await crmTags(mod.api, selected, tags, []);
        if (!r.ok) toast.error(r.error); else toast.success(`Tagged ${r.data} record(s)`);
      }
      setBulk(null);
      refresh();
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!selected.length || !confirm(`Move ${selected.length} record(s) to the recycle bin?`)) return;
    const r = await crmDelete(mod.api, selected);
    if (!r.ok) return toast.error(r.error);
    toast.success(`Deleted ${r.data.deleted}${r.data.skipped.length ? `; skipped ${r.data.skipped.length}: ${r.data.skipped.slice(0, 3).join(', ')}` : ''}`);
    refresh();
  };

  const exportCsv = async () => {
    const r = await crmExport(mod.api, props.exportCriteria);
    if (!r.ok) return toast.error(r.error);
    const blob = new Blob([r.data.csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${mod.api}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Exported ${r.data.rows} row(s)${r.data.truncated ? ' (first 20,000)' : ''}. The export was logged.`);
  };

  const saveView = async () => {
    const name = prompt('Name this view');
    if (!name) return;
    const shared = props.perms.shareViews ? confirm('Share this view with the whole team? (Cancel = only you)') : false;
    const r = await crmSaveView({ module: mod.api, name, shared, config: { criteria: crit, columns: props.columns, sort: props.sort } });
    if (!r.ok) return toast.error(r.error);
    toast.success('View saved');
    go({ view: r.data, crit: null });
  };

  const deleteView = async () => {
    if (!confirm('Delete this view?')) return;
    const r = await crmDeleteView(props.viewKey);
    if (!r.ok) return toast.error(r.error);
    go({ view: null });
  };

  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const pages = Math.max(1, Math.ceil(props.total / props.pageSize));
  const currentView = props.views.find((v) => v.key === props.viewKey);
  const editableFields = fields.filter((f) => !f.ro && f.type !== 'line_items' && f.type !== 'related');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">{mod.label}</h1>
          {mod.description && <p className="text-xs text-muted-foreground">{mod.description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {mod.kanbanField && (
            <button type="button" onClick={() => go({ kanban: props.kanban ? null : '1' })} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-sm hover:bg-muted">
              {props.kanban ? <LayoutList className="h-4 w-4" /> : <Columns3 className="h-4 w-4" />} {props.kanban ? 'List' : 'Kanban'}
            </button>
          )}
          {props.perms.import && (
            <Link href={`/crm/m/${mod.api}/import`} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-sm hover:bg-muted">
              <Upload className="h-4 w-4" /> Import
            </Link>
          )}
          {props.perms.export && (
            <button type="button" onClick={exportCsv} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-sm hover:bg-muted">
              <Download className="h-4 w-4" /> Export
            </button>
          )}
          {props.perms.create && (
            <Link href={`/crm/m/${mod.api}/new`} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-navy px-3 text-sm font-medium text-navy-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> New {mod.singular.toLowerCase()}
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2">
        <select aria-label="View" className="h-8 rounded-md border border-border bg-background px-2 text-sm" value={props.viewKey} onChange={(e) => go({ view: e.target.value, crit: null })}>
          {props.views.map((v) => <option key={v.key} value={v.key}>{v.system ? v.name : `★ ${v.name}${v.shared ? ' (shared)' : ''}`}</option>)}
        </select>
        {currentView && !currentView.system && currentView.mine && (
          <button type="button" onClick={deleteView} className="h-8 rounded-md px-2 text-xs text-muted-foreground hover:bg-muted">Delete view</button>
        )}
        <form className="flex-1 min-w-[180px]" onSubmit={(e) => { e.preventDefault(); go({ q }); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${mod.label.toLowerCase()}…`} aria-label="Search"
            className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </form>
        {props.kanban && mod.api === 'deals' && props.pipelines.length > 0 && (
          <select aria-label="Pipeline" className="h-8 rounded-md border border-border bg-background px-2 text-sm" value={props.pipelineName ?? ''} onChange={(e) => go({ pipeline: e.target.value })}>
            {props.pipelines.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        )}
        <button type="button" onClick={() => setShowFilter((s) => !s)} className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm ${props.adhoc ? 'border-navy text-navy' : 'border-border'} hover:bg-muted`}>
          <Filter className="h-4 w-4" /> Filter{props.adhoc ? ' (on)' : ''}
        </button>
      </div>

      {showFilter && (
        <div className="rounded-lg border border-border bg-card p-3">
          <CriteriaBuilder fields={fields} value={crit} onChange={setCrit} members={props.members} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => go({ crit: crit ? JSON.stringify(crit) : null })} className="h-8 rounded-md bg-navy px-3 text-sm text-navy-foreground">Apply</button>
            <button type="button" onClick={() => { setCrit(null); go({ crit: null }); }} className="h-8 rounded-md border border-border px-3 text-sm hover:bg-muted">Clear</button>
            <button type="button" onClick={saveView} className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 text-sm hover:bg-muted"><Save className="h-4 w-4" /> Save as view</button>
          </div>
        </div>
      )}

      {props.error && <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{props.error}</div>}

      {selected.length > 0 && !props.kanban && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-navy/30 bg-navy/5 p-2 text-sm">
          <span className="font-medium">{selected.length} selected</span>
          {props.perms.edit && <button type="button" onClick={() => setBulk('update')} className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-card px-2 hover:bg-muted"><Pencil className="h-3.5 w-3.5" /> Mass update</button>}
          {props.perms.edit && <button type="button" onClick={() => setBulk('owner')} className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-card px-2 hover:bg-muted"><UserCog className="h-3.5 w-3.5" /> Change owner</button>}
          {props.perms.edit && <button type="button" onClick={() => setBulk('tag')} className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-card px-2 hover:bg-muted"><Tag className="h-3.5 w-3.5" /> Add tags</button>}
          {props.perms.edit && (props.macros ?? []).length > 0 && (
            <select aria-label="Run a macro on the selected records" className="h-7 rounded-md border border-border bg-card px-1 text-sm" value="" onChange={async (e) => {
              const id = e.target.value; if (!id) return;
              const r = await crmRunMacro(id, selected);
              if (!r.ok) return toast.error(r.error);
              toast.success(`Macro ran on ${r.data.done}${r.data.failed ? `, ${r.data.failed} with errors` : ''}${r.data.skipped ? `, ${r.data.skipped} skipped` : ''}`);
              refresh();
            }}><option value="">Run macro…</option>{props.macros!.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
          )}
          {props.perms.edit && (props.cadences ?? []).length > 0 && (
            <select aria-label="Enroll the selected records in a cadence" className="h-7 rounded-md border border-border bg-card px-1 text-sm" value="" onChange={async (e) => {
              const id = e.target.value; if (!id) return;
              const r = await crmEnrollCadence(id, selected);
              if (!r.ok) return toast.error(r.error);
              toast.success(`${r.data} enrolled`);
              refresh();
            }}><option value="">Enroll in cadence…</option>{props.cadences!.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          )}
          {props.canAssign && <button type="button" onClick={async () => {
            const r = await crmApplyAssignment(mod.api, selected);
            if (!r.ok) return toast.error(r.error);
            toast.success(`${r.data} unassigned record(s) assigned`);
            refresh();
          }} className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-card px-2 hover:bg-muted"><UserCog className="h-3.5 w-3.5" /> Apply assignment rule</button>}
          {props.perms.delete && <button type="button" onClick={del} className="inline-flex h-7 items-center gap-1 rounded-md border border-destructive/40 bg-card px-2 text-destructive hover:bg-destructive/5"><Trash2 className="h-3.5 w-3.5" /> Delete</button>}
          <button type="button" onClick={() => setSelected([])} className="ml-auto inline-flex h-7 items-center gap-1 rounded-md px-2 text-muted-foreground hover:bg-muted"><X className="h-3.5 w-3.5" /> Clear</button>
        </div>
      )}

      {bulk && (
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          {bulk === 'update' && (
            <div className="flex flex-wrap items-start gap-2">
              <select aria-label="Field to update" className="h-9 rounded-md border border-border bg-background px-2" value={bulkField} onChange={(e) => { setBulkField(e.target.value); setBulkValue(null); }}>
                <option value="">Pick a field…</option>
                {editableFields.map((f) => <option key={f.api} value={f.api}>{f.label}</option>)}
              </select>
              {bulkField && byApi.get(bulkField) && (
                <div className="min-w-[220px] flex-1"><FieldInput field={byApi.get(bulkField)!} value={bulkValue} onChange={setBulkValue} refs={refs} members={props.members} /></div>
              )}
            </div>
          )}
          {bulk === 'owner' && (
            <select aria-label="New owner" className="h-9 rounded-md border border-border bg-background px-2" value={owner} onChange={(e) => setOwner(e.target.value)}>
              <option value="">Unassigned</option>
              {props.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          )}
          {bulk === 'tag' && (
            <input aria-label="Tags" value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="vip, campus-2027" className="h-9 w-72 rounded-md border border-border bg-background px-2" />
          )}
          <div className="mt-3 flex gap-2">
            <button type="button" disabled={saving} onClick={runBulk} className="h-8 rounded-md bg-navy px-3 text-navy-foreground disabled:opacity-60">{saving ? 'Working…' : `Apply to ${selected.length}`}</button>
            <button type="button" onClick={() => setBulk(null)} className="h-8 rounded-md border border-border px-3 hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {props.kanban ? (
        <Kanban module={mod} field={mod.kanbanField!} groups={props.kanbanGroups} rows={rows} fields={fields} refs={refs} canEdit={props.perms.edit} stageLabels={stageLabels} />
      ) : (
        <div className={`overflow-x-auto rounded-lg border border-border bg-card ${pending ? 'opacity-60' : ''}`}>
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <tr>
                <th className="w-9 px-3 py-2">
                  <input type="checkbox" aria-label="Select all" className="h-4 w-4" checked={allChecked} onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])} />
                </th>
                {props.columns.map((c) => {
                  const active = props.sort.field === c;
                  return (
                    <th key={c} className="whitespace-nowrap px-3 py-2 font-medium">
                      <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => go({ sort: c, dir: active && props.sort.dir === 'desc' ? 'asc' : 'desc' })}>
                        {COLUMN_LABEL[c] ?? byApi.get(c)?.label ?? c}
                        {active && (props.sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2"><input type="checkbox" aria-label={`Select ${r.name}`} className="h-4 w-4" checked={selected.includes(r.id)} onChange={(e) => setSelected((s) => (e.target.checked ? [...s, r.id] : s.filter((x) => x !== r.id)))} /></td>
                  {props.columns.map((c) => (
                    <td key={c} className="max-w-[260px] truncate px-3 py-2">
                      {c === 'name' ? (
                        <Link href={`/crm/m/${mod.api}/${r.id}`} className="font-medium text-navy hover:underline">
                          {r.name || '(no name)'}
                          {r.locked && <span className="ml-1.5 text-[10px] uppercase text-muted-foreground">locked</span>}
                        </Link>
                      ) : c === 'owner_id' ? (
                        <span>{r.owner_id ? refs[r.owner_id]?.name ?? '—' : <span className="text-muted-foreground/60">Unassigned</span>}</span>
                      ) : c === 'created_at' || c === 'updated_at' || c === 'last_activity_at' ? (
                        <span className="text-muted-foreground">{(r as unknown as Record<string, string | null>)[c] ? new Date((r as unknown as Record<string, string>)[c]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</span>
                      ) : (
                        <FieldValue field={byApi.get(c)} value={r.data[c]} refs={refs} currency={String(r.data.currency ?? 'INR')} stageLabels={stageLabels} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={props.columns.length + 1} className="px-3 py-10 text-center text-sm text-muted-foreground">No {mod.label.toLowerCase()} match this view.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!props.kanban && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{props.total.toLocaleString('en-IN')} record{props.total === 1 ? '' : 's'}{props.truncated ? ' (first 20,000 scanned)' : ''}</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={props.page <= 1} onClick={() => go({ page: String(props.page - 1) })} className="rounded-md border border-border px-2 py-1 disabled:opacity-40">Previous</button>
            <span>Page {props.page} of {pages}</span>
            <button type="button" disabled={props.page >= pages} onClick={() => go({ page: String(props.page + 1) })} className="rounded-md border border-border px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

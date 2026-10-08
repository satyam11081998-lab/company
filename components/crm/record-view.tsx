'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowRightLeft, Copy, FileDown, Lock, LockOpen, Mail, Paperclip, Pencil, Plus, Printer, RotateCcw, Share2, Trash2, X,
} from 'lucide-react';
import EmailCompose, { EmailHistory, type EmailInfo } from './email-compose';
import type { ClientField, ClientModule, ClientPipeline, ClientRecord } from '@/lib/crm/client-types';
import {
  crmAddNote, crmAttachmentUrl, crmConvertDoc, crmConvertLead, crmDelete, crmDeleteAttachment, crmDeleteNote, crmFindDuplicates,
  crmLock, crmMerge, crmRestore, crmShare, crmTags, crmUpdate, crmUpload,
} from '@/app/(app)/crm/actions';
import type { Member } from './field-input';
import { FieldValue, type Refs } from './field-value';
import RecordForm from './record-form';

interface TimelineItem { at: string; kind: string; title: string; detail?: string; link?: string; actor?: string | null }
interface Note { id: string; body: string; created_by: string | null; created_at: string }
interface FileRow { id: string; filename: string; size_bytes: number; created_by: string | null; created_at: string }
interface Related { module: string; label: string; via: string; total: number; rows: ClientRecord[] }

const KIND_DOT: Record<string, string> = {
  created: 'bg-navy', updated: 'bg-muted-foreground', note: 'bg-viz-2', activity: 'bg-viz-3', stage: 'bg-viz-1', payment: 'bg-viz-good',
  case_solved: 'bg-viz-4', report: 'bg-viz-critical', login: 'bg-muted-foreground/50', mece: 'bg-navy', system: 'bg-muted-foreground',
};

const when = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function RecordView(props: {
  module: ClientModule;
  fields: ClientField[];
  record: ClientRecord;
  refs: Refs;
  related: Related[];
  childFields: Record<string, ClientField[]>;
  childModules: Record<string, ClientModule>;
  timeline: TimelineItem[];
  notes: Note[];
  files: FileRow[];
  members: Member[];
  pipelines: ClientPipeline[];
  canCreate: Record<string, boolean>;
  perms: { edit: boolean; delete: boolean; full: boolean; convert: boolean; superAdmin: boolean };
  userId: string;
  /** present when this user may email this record */
  email?: EmailInfo | null;
  /** module-specific panel rendered at the top of Overview (campaign results, AI insights …) */
  extra?: React.ReactNode;
  /** extra header buttons (blueprint transitions, approvals …) */
  actions?: React.ReactNode;
  layoutRules?: import('@/lib/crm/automation').LayoutRuleConfig[];
}) {
  const { module: mod, fields, record: rec, refs } = props;
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<'overview' | 'timeline' | 'notes' | 'files'>('overview');
  const [dialog, setDialog] = useState<null | 'convert' | 'merge' | 'share' | 'email'>(null);
  const byApi = useMemo(() => new Map(fields.map((f) => [f.api, f])), [fields]);
  const stageLabels = useMemo(() => Object.fromEntries(props.pipelines.flatMap((p) => p.stages.map((s) => [s.key, s.label]))), [props.pipelines]);
  const locked = !!rec.locked || !!rec.deleted_at || rec.approval_status === 'pending';
  const canEdit = props.perms.edit && !locked;
  const currency = String(rec.data.currency ?? 'INR');
  const isDoc = ['quotes', 'sales_orders', 'invoices', 'purchase_orders'].includes(mod.api);

  const sections = useMemo(() => {
    const out = new Map<string, ClientField[]>();
    for (const f of fields) out.set(f.section, [...(out.get(f.section) ?? []), f]);
    const empty = (v: unknown) => v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length);
    return [...out.entries()]
      // a section of read-only fields with nothing in them is noise (e.g. MECE facts on a manual record)
      .filter(([, list]) => !list.every((f) => f.ro && empty(rec.data[f.api])))
      // MECE facts right after the main details
      .sort(([a], [b]) => (a === 'MECE activity' ? 0.5 : sectionsOrder(a)) - (b === 'MECE activity' ? 0.5 : sectionsOrder(b)));
    function sectionsOrder(name: string) { return [...out.keys()].indexOf(name); }
  }, [fields, rec.data]);

  const refresh = () => router.refresh();

  const del = async () => {
    if (!confirm('Move this record to the recycle bin?')) return;
    const r = await crmDelete(mod.api, [rec.id]);
    if (!r.ok) return toast.error(r.error);
    if (r.data.skipped.length) return toast.error(`Not deleted: ${r.data.skipped[0]}`);
    toast.success('Moved to the recycle bin');
    router.push(`/crm/m/${mod.api}`);
  };
  const restore = async () => {
    const r = await crmRestore([rec.id]);
    if (!r.ok || !r.data) return toast.error(r.ok ? 'Could not restore this record.' : r.error);
    toast.success('Restored');
    refresh();
  };
  const lock = async (on: boolean) => {
    const reason = on ? prompt('Why lock this record?') ?? '' : '';
    if (on && !reason) return;
    const r = await crmLock(mod.api, rec.id, on, reason);
    if (!r.ok) return toast.error(r.error);
    refresh();
  };
  const setStage = async (key: string) => {
    if (!canEdit || rec.data.stage === key) return;
    if (rec.blueprint) return toast.error('This deal follows a Blueprint — use a transition button.');
    const r = await crmUpdate(mod.api, rec.id, { stage: key }, rec.updated_at);
    if (!r.ok) return toast.error(r.error);
    toast.success(`Moved to ${stageLabels[key] ?? key}`);
    refresh();
  };
  const convertDoc = async () => {
    const r = await crmConvertDoc(mod.api as 'quotes' | 'sales_orders', rec.id);
    if (!r.ok) return toast.error(r.error);
    toast.success(mod.api === 'quotes' ? 'Sales order created' : 'Invoice created');
    router.push(`/crm/m/${r.data.module}/${r.data.id}`);
  };
  const editTags = async () => {
    const add = prompt('Add tags (comma separated)');
    if (!add) return;
    const r = await crmTags(mod.api, [rec.id], add.split(',').map((t) => t.trim()).filter(Boolean), []);
    if (!r.ok) return toast.error(r.error);
    refresh();
  };
  const removeTag = async (t: string) => {
    const r = await crmTags(mod.api, [rec.id], [], [t]);
    if (!r.ok) return toast.error(r.error);
    refresh();
  };

  const pipeline = mod.api === 'deals' ? props.pipelines.find((p) => p.name === rec.data.pipeline) : undefined;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground"><Link href={`/crm/m/${mod.api}`} className="hover:underline">{mod.label}</Link></p>
            <h1 className="truncate text-xl font-semibold tracking-tight">{rec.name || '(no name)'}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
              {rec.external_key && <span className="rounded-full bg-navy/10 px-2 py-0.5 text-navy">Synced from MECE</span>}
              {rec.deleted_at && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-destructive">In recycle bin</span>}
              {rec.locked && <span className="rounded-full bg-warning-soft px-2 py-0.5">Locked{rec.locked.reason ? `: ${rec.locked.reason}` : rec.locked.kind === 'converted' ? ' (converted)' : ''}</span>}
              {rec.approval_status === 'pending' && <span className="rounded-full bg-warning-soft px-2 py-0.5">Waiting for approval</span>}
              <span className="text-muted-foreground">Owner: {rec.owner_id ? refs[rec.owner_id]?.name ?? '—' : 'Unassigned'}</span>
              {rec.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
                  {t}
                  {canEdit && <button type="button" aria-label={`Remove tag ${t}`} onClick={() => removeTag(t)}><X className="h-3 w-3" /></button>}
                </span>
              ))}
              {canEdit && <button type="button" onClick={editTags} className="rounded-full border border-dashed border-border px-2 py-0.5 text-muted-foreground hover:bg-muted">+ tag</button>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {props.actions}
            {canEdit && !editing && <Btn onClick={() => setEditing(true)} icon={<Pencil className="h-4 w-4" />}>Edit</Btn>}
            {props.email && !rec.deleted_at && props.email.to && <Btn onClick={() => setDialog('email')} icon={<Mail className="h-4 w-4" />}>Send email</Btn>}
            {mod.api === 'leads' && props.perms.convert && !locked && <Btn onClick={() => setDialog('convert')} icon={<ArrowRightLeft className="h-4 w-4" />} primary>Convert</Btn>}
            {(mod.api === 'quotes' || mod.api === 'sales_orders') && props.perms.edit && !rec.data[mod.api === 'quotes' ? 'converted_so_id' : 'converted_invoice_id'] && (
              <Btn onClick={convertDoc} icon={<ArrowRightLeft className="h-4 w-4" />}>{mod.api === 'quotes' ? 'Convert to sales order' : 'Convert to invoice'}</Btn>
            )}
            {isDoc && <Link href={`/crm/m/${mod.api}/${rec.id}/print`} target="_blank" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-sm hover:bg-muted"><Printer className="h-4 w-4" /> Print / PDF</Link>}
            {props.perms.full && !rec.deleted_at && <Btn onClick={() => setDialog('merge')} icon={<Copy className="h-4 w-4" />}>Duplicates</Btn>}
            {props.perms.full && !rec.deleted_at && <Btn onClick={() => setDialog('share')} icon={<Share2 className="h-4 w-4" />}>Share</Btn>}
            {props.perms.full && !rec.deleted_at && (!rec.locked || rec.locked.kind === 'manual') && (
              <Btn onClick={() => lock(!rec.locked)} icon={rec.locked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}>{rec.locked ? 'Unlock' : 'Lock'}</Btn>
            )}
            {props.perms.delete && !rec.deleted_at && !rec.external_key && <Btn onClick={del} icon={<Trash2 className="h-4 w-4" />} danger>Delete</Btn>}
            {rec.deleted_at && props.perms.delete && <Btn onClick={restore} icon={<RotateCcw className="h-4 w-4" />}>Restore</Btn>}
          </div>
        </div>

        {pipeline && (
          <div className="mt-4 flex overflow-x-auto rounded-md border border-border text-xs">
            {pipeline.stages.map((s) => {
              const cur = rec.data.stage === s.key;
              const idx = pipeline.stages.findIndex((x) => x.key === rec.data.stage);
              const done = pipeline.stages.indexOf(s) < idx;
              return (
                <button key={s.key} type="button" disabled={!canEdit} onClick={() => setStage(s.key)} title={`${s.probability}% · ${s.forecast}`}
                  className={`flex-1 whitespace-nowrap border-r border-border px-3 py-2 last:border-r-0 ${cur ? (s.state === 'lost' ? 'bg-destructive text-destructive-foreground' : 'bg-navy text-navy-foreground') : done ? 'bg-navy/10' : 'bg-card hover:bg-muted'} disabled:cursor-default`}>
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {editing ? (
        <RecordForm module={mod} fields={fields} initial={rec.data} refs={refs} members={props.members} pipelines={props.pipelines}
          recordId={rec.id} updatedAt={rec.updated_at} ownerId={rec.owner_id} layoutRules={props.layoutRules}
          onDone={() => { setEditing(false); refresh(); }} onCancel={() => setEditing(false)} />
      ) : (
        <>
          <div className="flex gap-1 border-b border-border text-sm">
            {(['overview', 'timeline', 'notes', 'files'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`-mb-px border-b-2 px-3 py-2 capitalize ${tab === t ? 'border-navy font-medium text-navy' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {t === 'files' ? `Attachments (${props.files.length})` : t === 'notes' ? `Notes (${props.notes.length})` : t}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="space-y-4">
              {props.extra}
              {sections.map(([section, list]) => (
                <section key={section} className="rounded-lg border border-border bg-card p-4">
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section}</h2>
                  <dl className={`grid grid-cols-1 gap-x-8 gap-y-2.5 ${list.some((f) => f.type === 'line_items') ? '' : 'md:grid-cols-2'}`}>
                    {list.map((f) => (
                      <div key={f.api} className={f.type === 'textarea' || f.type === 'line_items' ? 'md:col-span-2' : 'grid grid-cols-[minmax(120px,40%)_1fr] gap-3'}>
                        <dt className="text-xs text-muted-foreground">{f.label}</dt>
                        <dd className="min-w-0 text-sm">
                          {f.type === 'line_items' ? <LineItemsTable value={rec.data[f.api]} refs={refs} currency={currency} /> : (
                            <FieldValue field={f} value={rec.data[f.api]} refs={refs} currency={currency} stageLabels={stageLabels} />
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
              {props.email && <EmailHistory info={props.email} />}
              <RelatedLists related={props.related} parent={rec} parentModule={mod.api} childFields={props.childFields} childModules={props.childModules} refs={refs} canCreate={props.canCreate} />
            </div>
          )}

          {tab === 'timeline' && (
            <section className="rounded-lg border border-border bg-card p-4">
              {props.timeline.length === 0 && <p className="text-sm text-muted-foreground">Nothing yet.</p>}
              <ol className="relative space-y-3 border-l border-border pl-5">
                {props.timeline.map((t, i) => (
                  <li key={i} className="relative">
                    <span className={`absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ${KIND_DOT[t.kind] ?? 'bg-muted-foreground'}`} />
                    <p className="text-sm">
                      {t.link ? <Link href={t.link} className="text-navy hover:underline">{t.title}</Link> : t.title}
                    </p>
                    {t.detail && <p className="whitespace-pre-wrap break-words text-xs text-muted-foreground">{t.detail}</p>}
                    <p className="text-[11px] text-muted-foreground/80">{when(t.at)}{t.actor && refs[t.actor] ? ` · ${refs[t.actor].name}` : t.actor && ['sync', 'automation', 'system', 'public', 'api'].includes(t.actor) ? ` · ${t.actor}` : ''}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {tab === 'notes' && <Notes recordId={rec.id} notes={props.notes} refs={refs} canAdd={props.perms.edit && !rec.deleted_at} userId={props.userId} superAdmin={props.perms.superAdmin} />}
          {tab === 'files' && <Files recordId={rec.id} files={props.files} refs={refs} canAdd={props.perms.edit && !rec.deleted_at} userId={props.userId} superAdmin={props.perms.superAdmin} />}
        </>
      )}

      {dialog === 'email' && props.email && <EmailCompose module={mod.api} recordId={rec.id} info={props.email} onClose={() => setDialog(null)} />}
      {dialog === 'convert' && <ConvertDialog lead={rec} pipelines={props.pipelines} onClose={() => setDialog(null)} />}
      {dialog === 'merge' && <MergeDialog module={mod} master={rec} fields={fields} onClose={() => setDialog(null)} />}
      {dialog === 'share' && <ShareDialog module={mod.api} recordId={rec.id} members={props.members} userId={props.userId} current={rec.shared_with} onClose={() => setDialog(null)} />}
    </div>
  );
}

function Btn({ children, onClick, icon, primary, danger }: { children: React.ReactNode; onClick: () => void; icon?: React.ReactNode; primary?: boolean; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm ${primary ? 'bg-navy text-navy-foreground hover:opacity-90' : danger ? 'border border-destructive/40 text-destructive hover:bg-destructive/5' : 'border border-border hover:bg-muted'}`}>
      {icon}{children}
    </button>
  );
}

function LineItemsTable({ value, refs, currency }: { value: unknown; refs: Refs; currency: string }) {
  const rows = Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
  if (!rows.length) return <span className="text-muted-foreground/60">No items</span>;
  const money = (n: unknown) => (typeof n === 'number' ? n.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 2 }) : '');
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr><th className="px-2 py-1.5 text-left">Item</th><th className="px-2 py-1.5 text-right">Qty</th><th className="px-2 py-1.5 text-right">Price</th><th className="px-2 py-1.5 text-right">Discount</th><th className="px-2 py-1.5 text-right">Tax</th><th className="px-2 py-1.5 text-right">Total</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              <td className="px-2 py-1.5">{String(r.product_name || (r.product_id ? refs[String(r.product_id)]?.name : '') || '')}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{String(r.quantity ?? '')}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{money(r.list_price)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{money(r.discount)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{r.tax_pct ? `${r.tax_pct}%` : ''}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{money(r.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RelatedLists({ related, parent, parentModule, childFields, childModules, refs, canCreate }: {
  related: Related[]; parent: ClientRecord; parentModule: string; childFields: Record<string, ClientField[]>; childModules: Record<string, ClientModule>; refs: Refs; canCreate: Record<string, boolean>;
}) {
  const quick = ['tasks', 'calls', 'meetings'].filter((m) => canCreate[m]);
  return (
    <div className="space-y-4">
      {quick.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quick.map((m) => (
            <Link key={m} href={`/crm/m/${m}/new?related_to=${parent.id}&related_module=${parentModule}`}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card px-2.5 text-sm hover:bg-muted">
              <Plus className="h-4 w-4" /> {m === 'tasks' ? 'Task' : m === 'calls' ? 'Log call' : 'Meeting'}
            </Link>
          ))}
        </div>
      )}
      {related.map((l) => {
        const cf = childFields[l.module] ?? [];
        const cm = childModules[l.module];
        const cols = (cm ? ['name'] : []).concat(cf.filter((f) => f.api !== l.via && ['picklist', 'currency', 'date', 'datetime', 'email'].includes(f.type)).slice(0, 3).map((f) => f.api));
        return (
          <section key={`${l.module}:${l.via}`} className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <h3 className="text-sm font-semibold">{l.label} <span className="font-normal text-muted-foreground">({l.total})</span></h3>
              {canCreate[l.module] && l.via !== 'member' && l.via !== 'related_to' && (
                <Link href={`/crm/m/${l.module}/new?${l.via}=${parent.id}`} className="text-xs text-navy hover:underline">+ New</Link>
              )}
            </div>
            <table className="w-full text-sm">
              <tbody>
                {l.rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    {cols.map((c) => (
                      <td key={c} className="max-w-[240px] truncate px-4 py-1.5">
                        {c === 'name' ? <Link href={`/crm/m/${l.module}/${r.id}`} className="text-navy hover:underline">{r.name || '(no name)'}</Link>
                          : <FieldValue field={cf.find((f) => f.api === c)} value={r.data[c]} refs={refs} currency={String(r.data.currency ?? 'INR')} />}
                      </td>
                    ))}
                    {l.via === 'member' && <td className="px-4 py-1.5 text-xs text-muted-foreground">{String(r.data._member_status ?? '')}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}

function Notes({ recordId, notes, refs, canAdd, userId, superAdmin }: { recordId: string; notes: Note[]; refs: Refs; canAdd: boolean; userId: string; superAdmin: boolean }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const add = async () => {
    setBusy(true);
    const r = await crmAddNote(recordId, text);
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    setText('');
    router.refresh();
  };
  const del = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    const r = await crmDeleteNote(id);
    if (!r.ok) return toast.error(r.error);
    router.refresh();
  };
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4">
      {canAdd && (
        <div className="space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={32000} placeholder="Add a note…" aria-label="New note"
            className="h-24 w-full rounded-md border border-border bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button type="button" disabled={busy || !text.trim()} onClick={add} className="h-8 rounded-md bg-navy px-3 text-sm text-navy-foreground disabled:opacity-50">Add note</button>
        </div>
      )}
      {notes.map((n) => (
        <article key={n.id} className="rounded-md border border-border p-3">
          <p className="whitespace-pre-wrap break-words text-sm">{n.body}</p>
          <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{n.created_by ? refs[n.created_by]?.name ?? 'Someone' : 'System'} · {when(n.created_at)}</span>
            {(superAdmin || n.created_by === userId) && <button type="button" onClick={() => del(n.id)} className="hover:text-destructive">Delete</button>}
          </div>
        </article>
      ))}
      {!notes.length && <p className="text-sm text-muted-foreground">No notes yet.</p>}
    </section>
  );
}

function Files({ recordId, files, refs, canAdd, userId, superAdmin }: { recordId: string; files: FileRow[]; refs: Refs; canAdd: boolean; userId: string; superAdmin: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error('Files can be at most 10 MB.');
    const fd = new FormData();
    fd.set('file', file);
    fd.set('recordId', recordId);
    setBusy(true);
    const r = await crmUpload(fd);
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success('Attached');
    router.refresh();
  };
  const open = async (id: string) => {
    const r = await crmAttachmentUrl(id);
    if (!r.ok) return toast.error(r.error);
    window.location.assign(r.data);
  };
  const del = async (id: string) => {
    if (!confirm('Remove this file?')) return;
    const r = await crmDeleteAttachment(id);
    if (!r.ok) return toast.error(r.error);
    router.refresh();
  };
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4">
      {canAdd && (
        <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-sm hover:bg-muted">
          <Paperclip className="h-4 w-4" /> {busy ? 'Uploading…' : 'Attach a file (max 10 MB)'}
          <input type="file" className="hidden" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
        </label>
      )}
      <ul className="divide-y divide-border">
        {files.map((f) => (
          <li key={f.id} className="flex items-center justify-between py-2 text-sm">
            <button type="button" onClick={() => open(f.id)} className="inline-flex items-center gap-1.5 text-navy hover:underline"><FileDown className="h-4 w-4" />{f.filename}</button>
            <span className="text-xs text-muted-foreground">
              {(f.size_bytes / 1024).toFixed(0)} KB · {f.created_by ? refs[f.created_by]?.name ?? '' : ''} · {when(f.created_at)}
              {(superAdmin || f.created_by === userId) && <button type="button" onClick={() => del(f.id)} className="ml-2 hover:text-destructive">Remove</button>}
            </span>
          </li>
        ))}
      </ul>
      {!files.length && <p className="text-sm text-muted-foreground">No attachments.</p>}
    </section>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function ConvertDialog({ lead, pipelines, onClose }: { lead: ClientRecord; pipelines: ClientPipeline[]; onClose: () => void }) {
  const router = useRouter();
  const b2b = typeof lead.data.segment === 'string' && lead.data.segment !== 'Student (B2C)';
  const [createDeal, setCreateDeal] = useState(true);
  const [pipelineName, setPipelineName] = useState(pipelines.find((p) => p.name.includes(b2b ? 'B2B' : 'B2C'))?.name ?? pipelines[0]?.name ?? '');
  const p = pipelines.find((x) => x.name === pipelineName);
  const [stage, setStage] = useState(p?.stages[0]?.key ?? '');
  const [name, setName] = useState(String(lead.data.company || lead.name || ''));
  const [amount, setAmount] = useState(lead.data.annual_budget ? String(lead.data.annual_budget) : '');
  const [closing, setClosing] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    const r = await crmConvertLead({
      leadId: lead.id, createDeal,
      deal: createDeal ? { name, amount: amount ? Number(amount) : null, closing_date: closing || null, pipeline: pipelineName, stage } : undefined,
    });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success('Lead converted');
    router.push(r.data.dealId ? `/crm/m/deals/${r.data.dealId}` : r.data.contactId ? `/crm/m/contacts/${r.data.contactId}` : '/crm/m/leads');
  };
  const inp = 'h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm';
  return (
    <Modal title={`Convert ${lead.name}`} onClose={onClose}>
      <div className="space-y-3 text-sm">
        <p className="text-muted-foreground">A contact is created (or matched by email){lead.data.company ? ` and an account for “${String(lead.data.company)}” (or the existing one)` : ''}. Notes, open activities, tags and campaigns move across. The lead becomes read-only.</p>
        <label className="flex items-center gap-2"><input type="checkbox" checked={createDeal} onChange={(e) => setCreateDeal(e.target.checked)} className="h-4 w-4" /> Create a deal</label>
        {createDeal && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="md:col-span-2"><label className="mb-1 block text-xs text-muted-foreground">Deal name</label><input className={inp} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Pipeline</label>
              <select className={inp} value={pipelineName} onChange={(e) => { setPipelineName(e.target.value); setStage(pipelines.find((x) => x.name === e.target.value)?.stages[0]?.key ?? ''); }}>
                {pipelines.map((x) => <option key={x.name}>{x.name}</option>)}
              </select></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Stage</label>
              <select className={inp} value={stage} onChange={(e) => setStage(e.target.value)}>{p?.stages.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Amount (₹)</label><input className={inp} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div><label className="mb-1 block text-xs text-muted-foreground">Closing date</label><input type="date" className={inp} value={closing} onChange={(e) => setClosing(e.target.value)} /></div>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button type="button" disabled={busy} onClick={go} className="h-9 rounded-md bg-navy px-4 text-navy-foreground disabled:opacity-60">{busy ? 'Converting…' : 'Convert'}</button>
          <button type="button" onClick={onClose} className="h-9 rounded-md border border-border px-4 hover:bg-muted">Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

function MergeDialog({ module: mod, master, fields, onClose }: { module: ClientModule; master: ClientRecord; fields: ClientField[]; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dups, setDups] = useState<Array<{ id: string; name: string; data: Record<string, unknown>; external_key: string | null }>>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    crmFindDuplicates(mod.api, master.id).then((r) => {
      if (!live) return;
      setLoading(false);
      if (r.ok) setDups(r.data); else toast.error(r.error);
    });
    return () => { live = false; };
  }, [mod.api, master.id]);
  const others = dups.filter((d) => chosen.includes(d.id));
  const pickable = fields.filter((f) => !f.ro && f.type !== 'line_items' && others.some((o) => JSON.stringify(o.data[f.api] ?? null) !== JSON.stringify(master.data[f.api] ?? null)));
  const merge = async () => {
    if (!confirm(`Merge ${others.length} record(s) into “${master.name}”? This can’t be undone.`)) return;
    setBusy(true);
    const r = await crmMerge(mod.api, master.id, chosen, picks);
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success('Merged');
    onClose();
    router.refresh();
  };
  return (
    <Modal title="Find and merge duplicates" onClose={onClose}>
      {loading ? <p className="text-sm text-muted-foreground">Looking for duplicates by name, email and phone…</p> : !dups.length ? (
        <p className="text-sm text-muted-foreground">No likely duplicates found.</p>
      ) : (
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">Pick up to two records to merge into this one. Their notes, files, activities and links move here.</p>
          <ul className="space-y-1">
            {dups.map((d) => (
              <li key={d.id}>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" disabled={!!d.external_key || (!chosen.includes(d.id) && chosen.length >= 2)} checked={chosen.includes(d.id)}
                    onChange={(e) => setChosen((c) => (e.target.checked ? [...c, d.id] : c.filter((x) => x !== d.id)))} />
                  <Link href={`/crm/m/${mod.api}/${d.id}`} target="_blank" className="text-navy hover:underline">{d.name}</Link>
                  {d.external_key && <span className="text-xs text-muted-foreground">(MECE customer — can’t be merged away)</span>}
                </label>
              </li>
            ))}
          </ul>
          {pickable.length > 0 && (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50"><tr><th className="px-2 py-1 text-left">Field</th><th className="px-2 py-1 text-left">Keep from</th></tr></thead>
                <tbody>
                  {pickable.map((f) => (
                    <tr key={f.api} className="border-t border-border">
                      <td className="px-2 py-1">{f.label}</td>
                      <td className="px-2 py-1">
                        {[master, ...others].map((r) => (
                          <label key={r.id} className="mr-3 inline-flex items-center gap-1">
                            <input type="radio" name={`pick-${f.api}`} checked={(picks[f.api] ?? master.id) === r.id} onChange={() => setPicks((p) => ({ ...p, [f.api]: r.id }))} />
                            {String(r.data[f.api] ?? '—').slice(0, 40)}
                          </label>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button type="button" disabled={!chosen.length || busy} onClick={merge} className="h-9 rounded-md bg-navy px-4 text-navy-foreground disabled:opacity-50">{busy ? 'Merging…' : 'Merge'}</button>
        </div>
      )}
    </Modal>
  );
}

function ShareDialog({ module, recordId, members, userId, current, onClose }: { module: string; recordId: string; members: Member[]; userId: string; current: ClientRecord['shared_with']; onClose: () => void }) {
  const router = useRouter();
  const [rows, setRows] = useState<Array<{ user_id: string; access: 'read' | 'rw' | 'rwd' }>>(current ?? []);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    const r = await crmShare(module, recordId, rows);
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success('Sharing updated');
    onClose();
    router.refresh();
  };
  return (
    <Modal title="Share this record" onClose={onClose}>
      <div className="space-y-3 text-sm">
        <p className="text-muted-foreground">Give specific CRM users access to this one record, beyond what their role and sharing rules allow. Saving replaces the current list.</p>
        {rows.map((r, i) => (
          <div key={i} className="flex gap-2">
            <select className="h-9 flex-1 rounded-md border border-border bg-background px-2" value={r.user_id} onChange={(e) => setRows((x) => x.map((y, j) => (j === i ? { ...y, user_id: e.target.value } : y)))}>
              <option value="">Pick a user…</option>
              {members.filter((m) => m.id !== userId).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select className="h-9 rounded-md border border-border bg-background px-2" value={r.access} onChange={(e) => setRows((x) => x.map((y, j) => (j === i ? { ...y, access: e.target.value as 'read' } : y)))}>
              <option value="read">Read</option><option value="rw">Read & edit</option><option value="rwd">Full</option>
            </select>
            <button type="button" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className="rounded p-1 hover:bg-muted" aria-label="Remove"><X className="h-4 w-4" /></button>
          </div>
        ))}
        <button type="button" onClick={() => setRows((x) => [...x, { user_id: '', access: 'read' }])} className="rounded-md border border-dashed border-border px-2.5 py-1 text-xs hover:bg-muted">+ Add person</button>
        <div className="flex gap-2 pt-2">
          <button type="button" disabled={busy} onClick={save} className="h-9 rounded-md bg-navy px-4 text-navy-foreground disabled:opacity-60">Save</button>
          <button type="button" onClick={onClose} className="h-9 rounded-md border border-border px-4 hover:bg-muted">Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

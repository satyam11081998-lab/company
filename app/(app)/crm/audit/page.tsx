import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { loadMembers } from '@/lib/crm/server/members';
import { createServiceClient } from '@/lib/crm/server/svc';
import { canSetup, fieldAccess } from '@/lib/crm/permissions';
import { isUuid } from '@/lib/crm/fields';

export const dynamic = 'force-dynamic';

const show = (v: unknown) => {
  if (v === null || v === undefined || v === '') return '∅';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  return s.length > 80 ? s.slice(0, 80) + '…' : s;
};

export default async function AuditPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'view_audit')) notFound();
  const meta = await loadMeta();
  const members = new Map((await loadMembers()).map((m) => [m.id, m.name]));
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  let q = createServiceClient().from('crm_audit').select('id, at, actor_id, actor_kind, action, module, record_id, changes, meta, redacted', { count: 'exact' });
  if (searchParams.module && meta.module(searchParams.module)) q = q.eq('module', searchParams.module);
  if (searchParams.action && /^[a-z_]{2,40}$/.test(searchParams.action)) q = q.eq('action', searchParams.action);
  if (searchParams.actor && isUuid(searchParams.actor)) q = q.eq('actor_id', searchParams.actor);
  if (searchParams.record && isUuid(searchParams.record)) q = q.eq('record_id', searchParams.record);
  const { data, count } = await q.order('at', { ascending: false }).range((page - 1) * 100, page * 100 - 1);
  const rows = (data ?? []) as Array<{ id: number; at: string; actor_id: string | null; actor_kind: string; action: string; module: string | null; record_id: string | null; changes: Record<string, { from: unknown; to: unknown }> | null; meta: Record<string, unknown> | null; redacted: boolean }>;
  const pages = Math.max(1, Math.ceil((count ?? 0) / 100));
  const link = (p: Record<string, string>) => `/crm/audit?${new URLSearchParams({ ...Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v) as Array<[string, string]>), ...p }).toString()}`;

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-semibold">Audit log</h1>
        <p className="text-sm text-muted-foreground">Every create, change, delete, import, export, conversion, merge, sync and setup change. Append-only: the database refuses edits and deletes.</p>
      </div>
      <form className="flex flex-wrap gap-2 text-sm" action="/crm/audit">
        <select name="module" defaultValue={searchParams.module ?? ''} className="h-8 rounded-md border border-border bg-background px-2" aria-label="Module">
          <option value="">All modules</option>
          {meta.modules.map((m) => <option key={m.api_name} value={m.api_name}>{m.label}</option>)}
        </select>
        <select name="action" defaultValue={searchParams.action ?? ''} className="h-8 rounded-md border border-border bg-background px-2" aria-label="Action">
          <option value="">All actions</option>
          {['create', 'update', 'delete', 'restore', 'purge', 'import', 'import_undo', 'export', 'convert', 'merge', 'sync', 'lock', 'unlock', 'share', 'note_add', 'attachment_add'].map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select name="actor" defaultValue={searchParams.actor ?? ''} className="h-8 rounded-md border border-border bg-background px-2" aria-label="Who">
          <option value="">Anyone</option>
          {[...members.entries()].map(([id, n]) => <option key={id} value={id}>{n}</option>)}
        </select>
        <button className="h-8 rounded-md bg-navy px-3 text-navy-foreground">Filter</button>
      </form>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr><th className="px-3 py-2">When</th><th className="px-3 py-2">Who</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Record</th><th className="px-3 py-2">Details</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">{new Date(r.at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                <td className="px-3 py-2">{r.actor_id ? members.get(r.actor_id) ?? 'Former user' : r.actor_kind}</td>
                <td className="px-3 py-2"><span className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.action}</span></td>
                <td className="px-3 py-2">{r.record_id && r.module ? <Link className="text-navy hover:underline" href={`/crm/m/${r.module}/${r.record_id}`}>{meta.module(r.module)?.singular ?? r.module}</Link> : r.module ?? '—'}</td>
                <td className="px-3 py-2 text-xs">
                  {r.redacted ? <span className="italic text-muted-foreground">Redacted (privacy request)</span> : r.changes ? (
                    <ul className="space-y-0.5">
                      {Object.entries(r.changes).slice(0, 8).map(([k, c]) => (
                        <li key={k}>
                          <span className="text-muted-foreground">{(r.module && meta.field(r.module, k)?.label) || k}:</span>{' '}
                          {r.module && fieldAccess(ctx, r.module, k) === 'hidden' ? <span className="italic">hidden</span> : <>{show(c?.from)} → {show(c?.to)}</>}
                        </li>
                      ))}
                    </ul>
                  ) : r.meta ? <span className="text-muted-foreground">{show(r.meta)}</span> : null}
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">Nothing logged yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{(count ?? 0).toLocaleString('en-IN')} entries</span>
        <div className="flex gap-2">
          {page > 1 && <Link href={link({ page: String(page - 1) })} className="rounded border border-border px-2 py-1">Previous</Link>}
          <span>Page {page} of {pages}</span>
          {page < pages && <Link href={link({ page: String(page + 1) })} className="rounded border border-border px-2 py-1">Next</Link>}
        </div>
      </div>
    </div>
  );
}

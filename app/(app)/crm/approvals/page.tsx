import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { myApprovals, loadRules } from '@/lib/crm/server/automation';
import { loadMembers } from '@/lib/crm/server/members';
import { createServiceClient } from '@/lib/crm/server/svc';
import { accessTo } from '@/lib/crm/server/records';
import { RECORD_COLS, normalizeRecord } from '@/lib/crm/server/db';

export const dynamic = 'force-dynamic';

export default async function ApprovalsPage() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx) notFound();
  const meta = await loadMeta();
  const rows = await myApprovals(ctx);
  const ids = rows.map((r) => r.record_id);
  const { data } = ids.length ? await createServiceClient().from('crm_records').select(RECORD_COLS).in('id', ids) : { data: [] };
  const recs = new Map(((data ?? []) as Record<string, unknown>[]).map(normalizeRecord).map((r) => [r.id, r]));
  const procs = new Map((await loadRules()).approvals.map((p) => [p.id, p.name]));
  const names = Object.fromEntries((await loadMembers()).map((m) => [m.id, m.name]));
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Approvals</h1>
        <p className="text-sm text-muted-foreground">Records waiting for your decision. Open one to approve or reject it; records stay locked until decided.</p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr><th className="px-3 py-2">Record</th><th className="px-3 py-2">Process</th><th className="px-3 py-2">Stage</th><th className="px-3 py-2">Requested</th><th className="px-3 py-2">By</th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const rec = recs.get(r.record_id);
              const visible = rec && (accessTo(ctx, meta, rec) || r.approvers.includes(ctx.userId));
              return (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-2">{visible ? <Link className="text-navy hover:underline" href={`/crm/m/${rec!.module}/${rec!.id}`}>{rec!.name}</Link> : 'Restricted'} <span className="text-xs text-muted-foreground">{rec ? meta.module(rec.module)?.singular : ''}</span></td>
                  <td className="px-3 py-2">{procs.get(r.process_id ?? '') ?? '—'}</td>
                  <td className="px-3 py-2">{r.stage + 1}</td>
                  <td className="px-3 py-2 text-xs">{new Date(r.requested_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                  <td className="px-3 py-2 text-xs">{r.requested_by ? names[r.requested_by] ?? '—' : 'Automation'}</td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">Nothing is waiting for you.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

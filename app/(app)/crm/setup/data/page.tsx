import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { canSetup } from '@/lib/crm/permissions';
import { createServiceClient } from '@/lib/crm/server/svc';
import SyncButton from '@/components/crm/sync-button';

export const dynamic = 'force-dynamic';

export default async function DataSetup() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'manage_data')) notFound();
  const svc = createServiceClient();
  const [{ data: runs }, { data: imports }] = await Promise.all([
    svc.from('crm_sync_runs').select('id, started_at, finished_at, trigger, stats, error').order('started_at', { ascending: false }).limit(20),
    svc.from('crm_imports').select('id, module, filename, total, created, updated, skipped, failed, created_at, undone_at').order('created_at', { ascending: false }).limit(20),
  ]);
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">MECE sync and imports</h1>
          <p className="text-sm text-muted-foreground">The sync runs every day at 06:30 IST (Vercel cron) and whenever you press the button. It never overwrites owner, tags, notes or custom fields.</p>
        </div>
        <SyncButton />
      </div>
      <section className="overflow-x-auto rounded-lg border border-border bg-card">
        <h2 className="border-b border-border px-4 py-2 text-sm font-semibold">Sync runs</h2>
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-xs text-muted-foreground"><tr><th className="px-4 py-2">Started</th><th className="px-4 py-2">Trigger</th><th className="px-4 py-2">Result</th></tr></thead>
          <tbody>
            {((runs ?? []) as any[]).map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-2">{new Date(r.started_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                <td className="px-4 py-2">{r.trigger}</td>
                <td className="px-4 py-2 text-xs">
                  {r.error ? <span className="text-destructive">Failed: {String(r.error).slice(0, 200)}</span>
                    : !r.finished_at ? <span className="text-muted-foreground">running or interrupted</span>
                    : `${r.stats?.contacts ?? 0} contacts · ${r.stats?.accounts ?? 0} accounts · ${r.stats?.deals ?? 0} deals · ${r.stats?.invoices ?? 0} invoices · ${r.stats?.renewals ?? 0} renewals · ${r.stats?.cases ?? 0} cases · ${r.stats?.changed ?? 0} changed · ${((r.stats?.ms ?? 0) / 1000).toFixed(1)}s`}
                </td>
              </tr>
            ))}
            {!(runs ?? []).length && <tr><td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">No sync yet.</td></tr>}
          </tbody>
        </table>
      </section>
      <section className="overflow-x-auto rounded-lg border border-border bg-card">
        <h2 className="border-b border-border px-4 py-2 text-sm font-semibold">Imports</h2>
        <table className="w-full min-w-[640px] text-sm">
          <tbody>
            {((imports ?? []) as any[]).map((r) => (
              <tr key={r.id} className="border-t border-border first:border-0">
                <td className="px-4 py-2">{new Date(r.created_at).toLocaleString('en-IN')}</td>
                <td className="px-4 py-2">{r.module}</td>
                <td className="px-4 py-2">{r.filename}</td>
                <td className="px-4 py-2 text-xs">{r.created} new · {r.updated} updated · {r.skipped} skipped · {r.failed} failed{r.undone_at ? ' · undone' : ''}</td>
              </tr>
            ))}
            {!(imports ?? []).length && <tr><td className="px-4 py-6 text-center text-muted-foreground">No imports yet.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}

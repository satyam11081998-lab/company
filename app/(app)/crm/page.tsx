import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { homeData } from '@/lib/crm/server/home';
import { canSetup } from '@/lib/crm/permissions';
import { formatMoney } from '@/lib/crm/fields';
import SyncButton from '@/components/crm/sync-button';
import AdminPulse from '@/components/crm/admin-pulse';
import { adminPulse } from '@/lib/crm/server/account';

export const dynamic = 'force-dynamic';

export default async function CrmHome() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx) notFound();
  const meta = await loadMeta();
  const [d, pulse] = await Promise.all([homeData(ctx, meta), ctx.superAdmin ? adminPulse(ctx).catch(() => null) : Promise.resolve(null)]);
  const neverSynced = !d.lastSync.at;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">CRM home</h1>
          <p className="text-sm text-muted-foreground">Customers, pipeline and service at a glance. Every number links to the list behind it.</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {d.lastSync.at ? <p>MECE data synced {new Date(d.lastSync.at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}{d.lastSync.error ? ' — last run failed' : ''}</p> : <p>MECE data hasn’t been synced yet.</p>}
          {canSetup(ctx, 'manage_data') && <SyncButton prominent={neverSynced} />}
        </div>
      </div>

      {neverSynced && canSetup(ctx, 'manage_data') && (
        <div className="rounded-lg border border-navy/30 bg-navy/5 p-4 text-sm">
          <p className="font-medium">First run</p>
          <p className="text-muted-foreground">Press <strong>Sync MECE data</strong> to bring in your users as Contacts, colleges as Accounts, every checkout as a Deal with its invoice, plan renewals, and in-app problem reports as Cases. After that it refreshes daily on its own.</p>
        </div>
      )}

      {pulse && <AdminPulse revenue={JSON.parse(JSON.stringify(pulse.revenue))} users={pulse.users} signups={pulse.signups} />}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {d.kpis.map((k) => (
          <Link key={k.label} href={k.href ?? '#'} className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-navy/40">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{k.value}</p>
            {k.hint && <p className="text-[11px] text-muted-foreground">{k.hint}</p>}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-border bg-card lg:col-span-2">
          <div className="border-b border-border px-4 py-2.5"><h2 className="text-sm font-semibold">Pipelines</h2></div>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr><th className="px-4 py-2 text-left font-medium">Pipeline</th><th className="px-4 py-2 text-right font-medium">Open</th><th className="px-4 py-2 text-right font-medium">Open value (₹)</th><th className="px-4 py-2 text-right font-medium">Won this month</th><th className="px-4 py-2 text-right font-medium">Won value (₹)</th></tr>
            </thead>
            <tbody>
              {d.pipelines.map((p) => (
                <tr key={p.name} className="border-t border-border">
                  <td className="px-4 py-2"><Link className="text-navy hover:underline" href={`/crm/m/deals?kanban=1&pipeline=${encodeURIComponent(p.name)}`}>{p.name}</Link></td>
                  <td className="px-4 py-2 text-right tabular-nums">{p.open}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatMoney(p.openValue)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{p.wonMonth}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatMoney(p.wonMonthValue)}</td>
                </tr>
              ))}
              {!d.pipelines.length && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No pipelines you can see.</td></tr>}
            </tbody>
          </table>
          <p className="px-4 pb-3 pt-1 text-[11px] text-muted-foreground">Rupee deals only; USD/EUR deals are counted but not added to rupee values. Internal/test payments are excluded.</p>
        </section>

        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h2 className="text-sm font-semibold">My open tasks</h2>
            <Link href="/crm/m/tasks/new" className="text-xs text-navy hover:underline">+ Task</Link>
          </div>
          <ul className="divide-y divide-border text-sm">
            {d.tasks.map((t) => {
              const due = typeof t.data.due_date === 'string' ? t.data.due_date : null;
              const overdue = due && due < new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
              return (
                <li key={t.id} className="flex items-center justify-between gap-2 px-4 py-2">
                  <Link href={`/crm/m/tasks/${t.id}`} className="truncate text-navy hover:underline">{t.name}</Link>
                  <span className={`shrink-0 text-xs ${overdue ? 'font-medium text-destructive' : 'text-muted-foreground'}`}>{due ?? 'no date'}</span>
                </li>
              );
            })}
            {!d.tasks.length && <li className="px-4 py-6 text-center text-muted-foreground">Nothing due. Nice.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

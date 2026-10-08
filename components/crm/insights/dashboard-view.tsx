'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { DashboardComponent } from '@/lib/crm/reports';
import type { ReportResult } from '@/lib/crm/server/reports';
import { Button } from '../ui';
import DashboardEditor from './dashboard-editor';
import ReportView from './report-view';
import { Chart } from './chart';
import type { BuilderModule } from './report-builder';

type Rendered = DashboardComponent & { value?: number | null; previous?: number | null; report?: ReportResult; error?: string };

const fmt = (v: number | null | undefined) => (v === null || v === undefined ? '—' : v.toLocaleString('en-IN', { maximumFractionDigits: 2 }));
const span = (s?: number) => (s === 3 ? 'md:col-span-3' : s === 2 ? 'md:col-span-2' : '');

export default function DashboardView({ dash, all, edit }: {
  dash: { id: string; name: string; description: string; components: Rendered[] };
  all: Array<{ id: string; name: string }>;
  edit: { modules: BuilderModule[]; reports: Array<{ id: string; name: string }>; config: { components: DashboardComponent[]; description?: string }; shared: boolean; canShare: boolean } | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  if (editing && edit) return <DashboardEditor id={dash.id} name={dash.name} shared={edit.shared} config={edit.config} modules={edit.modules} reports={edit.reports} canShare={edit.canShare} onDone={() => setEditing(false)} />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">{dash.name}</h1>
          {dash.description && <p className="text-sm text-muted-foreground">{dash.description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {all.length > 1 && (
            <select className="h-8 rounded-md border border-border bg-background px-2 text-sm" value={dash.id} onChange={(e) => router.push(`/crm/dashboards/${e.target.value}`)} aria-label="Switch dashboard">
              {all.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
          <Link href="/crm/dashboards?new=1" className="inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-sm hover:bg-muted">New</Link>
          {edit && <Button primary onClick={() => setEditing(true)}>Edit</Button>}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {dash.components.map((c) => (
          <section key={c.id} className={`rounded-lg border border-border bg-card p-4 ${span(c.size)}`}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.title}</h2>
            {c.error ? <p className="mt-2 text-sm text-destructive">{c.error}</p> : c.type === 'kpi' ? (
              <div className="mt-2">
                <p className="text-3xl font-semibold tabular-nums">{fmt(c.value)}</p>
                {c.compareDays && c.previous !== null && c.previous !== undefined && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.previous === 0 ? 'none' : `${(c.value ?? 0) >= c.previous ? '▲' : '▼'} ${Math.abs(Math.round((((c.value ?? 0) - c.previous) / Math.max(1, Math.abs(c.previous))) * 100))}%`} vs the previous {c.compareDays} days ({fmt(c.previous)})
                  </p>
                )}
              </div>
            ) : c.type === 'target' ? (
              <div className="mt-2">
                <p className="text-2xl font-semibold tabular-nums">{fmt(c.value)} <span className="text-sm font-normal text-muted-foreground">of {fmt(c.target)}</span></p>
                <div className="mt-2 h-3 rounded-full bg-muted" role="meter" aria-valuemin={0} aria-valuemax={c.target ?? 0} aria-valuenow={c.value ?? 0} aria-label={c.title}>
                  <div className={`h-3 rounded-full ${(c.value ?? 0) >= (c.target ?? 0) ? 'bg-success' : 'bg-viz-1'}`} style={{ width: `${Math.min(100, ((c.value ?? 0) / Math.max(1, c.target ?? 1)) * 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{Math.round(((c.value ?? 0) / Math.max(1, c.target ?? 1)) * 100)}% of target</p>
              </div>
            ) : c.report ? (
              <div className="mt-2">
                {c.type === 'table' ? <ReportView result={c.report} compact />
                  : c.report.summary ? <Chart kind={c.type === 'funnel' ? 'funnel' : c.report.config.chart === 'none' ? 'bar' : c.report.config.chart ?? 'bar'} data={c.report.summary.groups.filter((g) => g.values[0] !== null).map((g) => ({ label: g.key, value: Number(g.values[0]) }))} height={220} />
                  : <ReportView result={c.report} compact />}
                {c.reportId && <Link href={`/crm/reports/${c.reportId}`} className="mt-1 inline-block text-xs text-navy hover:underline">Open report</Link>}
              </div>
            ) : null}
          </section>
        ))}
        {!dash.components.length && <p className="text-sm text-muted-foreground">This dashboard is empty.</p>}
      </div>
    </div>
  );
}

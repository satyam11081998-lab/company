'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, fmtDate } from '../ui';
import ReportBuilder, { type BuilderModule } from './report-builder';

interface Row { id: string; name: string; module: string; type: string; shared: boolean; owner: string; updated: string; description: string }

export default function ReportsHome({ reports, modules, canShare }: { reports: Row[]; modules: BuilderModule[]; canShare: boolean }) {
  const [building, setBuilding] = useState(false);
  const [q, setQ] = useState('');
  const list = reports.filter((r) => !q || `${r.name} ${r.module}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground">Tabular, summary and matrix reports over any module. Every number respects your record and field access.</p>
        </div>
        {!building && <Button primary onClick={() => setBuilding(true)}>New report</Button>}
      </div>
      {building && <ReportBuilder modules={modules} canShare={canShare} onCancel={() => setBuilding(false)} />}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-3"><input className="h-8 w-full max-w-xs rounded-md border border-border bg-background px-2 text-sm" placeholder="Filter reports" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter reports" /></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th className="px-4 py-2 font-medium">Report</th><th className="px-4 py-2 font-medium">Module</th><th className="px-4 py-2 font-medium">Type</th><th className="px-4 py-2 font-medium">Owner</th><th className="px-4 py-2 font-medium">Modified</th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-2"><Link className="font-medium text-navy hover:underline" href={`/crm/reports/${r.id}`}>{r.name}</Link>{r.shared && <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">shared</span>}</td>
                  <td className="px-4 py-2">{r.module}</td>
                  <td className="px-4 py-2 capitalize">{r.type}</td>
                  <td className="px-4 py-2">{r.owner}</td>
                  <td className="px-4 py-2 text-muted-foreground">{fmtDate(r.updated)}</td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No reports yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

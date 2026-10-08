'use client';

/** Renders a report result: tabular rows, a summary table + chart, or a matrix. */
import Link from 'next/link';
import type { ReportResult } from '@/lib/crm/server/reports';
import { Chart } from './chart';

const n = (v: number | null | undefined) => (v === null || v === undefined ? '—' : v.toLocaleString('en-IN', { maximumFractionDigits: 2 }));

export default function ReportView({ result, compact = false }: { result: ReportResult; compact?: boolean }) {
  const c = result.config;
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {result.rowsTotal.toLocaleString('en-IN')} record(s){result.truncated ? ' — the module is larger than the report limit; totals cover the first 50,000' : ''}. Only records you can see are counted.
      </p>
      {result.rows && result.columns && (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr>{result.columns.map((col) => <th key={col.api} className="px-3 py-2 font-medium">{col.label}</th>)}</tr></thead>
            <tbody>
              {result.rows.slice(0, compact ? 10 : 500).map((r) => (
                <tr key={r.id} className="border-t border-border">
                  {r.cells.map((cell, i) => (
                    <td key={i} className="max-w-[260px] truncate px-3 py-1.5">{i === 0 ? <Link className="text-navy hover:underline" href={`/crm/m/${c.module}/${r.id}`}>{cell || '—'}</Link> : cell}</td>
                  ))}
                </tr>
              ))}
              {!result.rows.length && <tr><td className="px-3 py-6 text-center text-muted-foreground" colSpan={result.columns.length}>No records match.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {result.summary && (
        <>
          {c.chart && c.chart !== 'none' && !result.summary.matrix && (
            <Chart kind={c.chart} data={result.summary.groups.filter((g) => g.values[0] !== null).map((g) => ({ label: g.key, value: Number(g.values[0]) }))} height={compact ? 200 : 260} />
          )}
          {result.summary.matrix ? (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr><th className="px-3 py-2 text-left font-medium">{result.summary.groupLabel} \ {result.summary.group2Label}</th>{result.summary.matrix.cols.map((col) => <th key={col} className="px-3 py-2 text-right font-medium">{col}</th>)}<th className="px-3 py-2 text-right font-medium">Total</th></tr>
                </thead>
                <tbody>
                  {result.summary.groups.map((g) => (
                    <tr key={g.key} className="border-t border-border">
                      <td className="px-3 py-1.5">{g.key}</td>
                      {result.summary!.matrix!.cols.map((col) => <td key={col} className="px-3 py-1.5 text-right tabular-nums">{n(result.summary!.matrix!.cells[g.key]?.[col])}</td>)}
                      <td className="px-3 py-1.5 text-right font-medium tabular-nums">{n(g.values[0])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[360px] text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground"><tr><th className="px-3 py-2 text-left font-medium">{result.summary.groupLabel}</th>{result.summary.measureLabels.map((l) => <th key={l} className="px-3 py-2 text-right font-medium">{l}</th>)}</tr></thead>
                <tbody>
                  {result.summary.groups.slice(0, compact ? 12 : 500).map((g) => (
                    <tr key={g.key} className="border-t border-border"><td className="px-3 py-1.5">{g.key}</td>{g.values.map((v, i) => <td key={i} className="px-3 py-1.5 text-right tabular-nums">{n(v)}</td>)}</tr>
                  ))}
                  <tr className="border-t-2 border-border font-medium"><td className="px-3 py-1.5">Total</td>{result.summary.totals.map((v, i) => <td key={i} className="px-3 py-1.5 text-right tabular-nums">{n(v)}</td>)}</tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

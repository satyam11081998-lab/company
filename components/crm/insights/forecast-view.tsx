'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { fcSetTargets } from '@/app/(app)/crm/insight-actions';
import { Button, Card, Stat, inr } from '../ui';

interface Line { ownerId: string | null; owner: string; target: number; won: number; commit: number; bestCase: number; pipeline: number; weighted: number; deals: number; projected: number; gap: number | null; attainmentPct: number | null }
interface Data { period: string; range: { from: string; to: string; label: string }; lines: Line[]; total: { target: number; won: number; commit: number; bestCase: number; pipeline: number; weighted: number }; canSetTargets: boolean }

export default function ForecastView({ data, periods, members }: { data: Data; periods: string[]; members: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [targets, setTargets] = useState<Record<string, number>>(Object.fromEntries(data.lines.filter((l) => l.ownerId).map((l) => [l.ownerId!, l.target])));
  const save = async () => {
    const r = await fcSetTargets(data.period, targets);
    if (!r.ok) return toast.error(r.error);
    toast.success('Targets saved');
    setEditing(false);
    router.refresh();
  };
  const t = data.total;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Forecast — {data.range.label}</h1>
          <p className="text-sm text-muted-foreground">INR deals closing {data.range.from} to {data.range.to}, by owner and forecast category. Projected = closed won + commit.</p>
        </div>
        <div className="flex gap-2">
          <select className="h-8 rounded-md border border-border bg-background px-2 text-sm" value={data.period} onChange={(e) => router.push(`/crm/forecasts?period=${e.target.value}`)} aria-label="Period">
            {periods.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {data.canSetTargets && !editing && <Button onClick={() => setEditing(true)}>Set targets</Button>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Target" value={t.target ? inr(t.target) : '—'} />
        <Stat label="Closed won" value={inr(t.won)} tone={t.target && t.won >= t.target ? 'good' : undefined} hint={t.target ? `${Math.round((t.won / t.target) * 100)}% of target` : undefined} />
        <Stat label="Commit" value={inr(t.commit)} />
        <Stat label="Best case" value={inr(t.bestCase)} />
        <Stat label="Weighted pipeline" value={inr(t.weighted)} hint="amount × stage probability" />
      </div>
      <Card title="By owner">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="text-xs text-muted-foreground"><tr className="text-right"><th className="py-2 text-left font-medium">Owner</th><th className="font-medium">Target</th><th className="font-medium">Won</th><th className="font-medium">Commit</th><th className="font-medium">Best case</th><th className="font-medium">Pipeline</th><th className="font-medium">Projected</th><th className="font-medium">Gap</th><th className="font-medium">Attainment</th></tr></thead>
            <tbody>
              {(editing ? members.map((m) => data.lines.find((l) => l.ownerId === m.id) ?? { ownerId: m.id, owner: m.name, target: 0, won: 0, commit: 0, bestCase: 0, pipeline: 0, weighted: 0, deals: 0, projected: 0, gap: null, attainmentPct: null }) : data.lines).map((l) => (
                <tr key={l.ownerId ?? 'none'} className="border-t border-border text-right tabular-nums">
                  <td className="py-1.5 text-left">{l.owner}</td>
                  <td>{editing && l.ownerId ? <input type="number" min={0} className="h-7 w-28 rounded border border-border bg-background px-2 text-right" value={targets[l.ownerId] ?? 0} onChange={(e) => setTargets({ ...targets, [l.ownerId!]: Number(e.target.value) })} aria-label={`Target for ${l.owner}`} /> : l.target ? inr(l.target) : '—'}</td>
                  <td>{inr(l.won)}</td><td>{inr(l.commit)}</td><td>{inr(l.bestCase)}</td><td>{inr(l.pipeline)}</td><td>{inr(l.projected)}</td>
                  <td className={l.gap !== null && l.gap < 0 ? 'text-destructive' : ''}>{l.gap === null ? '—' : inr(l.gap)}</td>
                  <td>{l.attainmentPct === null ? '—' : `${l.attainmentPct}%`}</td>
                </tr>
              ))}
              {!data.lines.length && !editing && <tr><td colSpan={9} className="py-6 text-center text-muted-foreground">No deals close in this period.</td></tr>}
            </tbody>
          </table>
        </div>
        {editing && <div className="mt-3 flex justify-end gap-2"><Button onClick={() => setEditing(false)}>Cancel</Button><Button primary onClick={save}>Save targets</Button></div>}
      </Card>
    </div>
  );
}

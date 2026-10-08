'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { kbHelpful, kbSearch, serviceSaveConfig } from '@/app/(app)/crm/mkt-actions';
import type { SlaPolicy } from '@/lib/crm/sla';
import { Bars, Button, Card, Field, Stat, fmtDate, inp } from './ui';

interface Dash {
  total: number; open: number; overdueCount: number; dueSoon: number; resolved30: number;
  overdue: Array<{ id: string; name: string; number: string; priority: string; due: string; owner: string | null }>;
  byStatus: Record<string, number>; byPriority: Record<string, number>; byOrigin: Record<string, number>; byType: Record<string, number>;
  medianFirstResponseH: number | null; medianResolutionH: number | null; slaMetPct: number | null;
  csat: { responses: number; score: number | null }; trend: Array<{ day: string; opened: number; resolved: number }>;
}
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PRI = ['Urgent', 'High', 'Medium', 'Low'];
const h = (x: number | null) => (x === null ? '—' : x < 1 ? `${Math.round(x * 60)} min` : `${x} h`);
const toBars = (m: Record<string, number>) => Object.entries(m).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));

export default function ServiceConsole({ dash, sla, settings, surveys, names, canConfigure, canKb }: {
  dash: Dash; sla: SlaPolicy; settings: { csatOnResolve: boolean; csatSurveyId: string | null }; surveys: Array<{ id: string; name: string }>;
  names: Record<string, string>; canConfigure: boolean; canKb: boolean;
}) {
  const maxDay = Math.max(1, ...dash.trend.map((t) => Math.max(t.opened, t.resolved)));
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Service console</h1>
          <p className="text-sm text-muted-foreground">Cases from in-app reports, web-to-case forms and manual entry, measured against your SLA.</p>
        </div>
        <Link href="/crm/m/cases" className="text-sm text-navy hover:underline">All cases →</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Stat label="Open cases" value={dash.open} />
        <Stat label="Past SLA" value={dash.overdueCount} tone={dash.overdueCount ? 'bad' : 'good'} />
        <Stat label="Due in 4 h" value={dash.dueSoon} tone={dash.dueSoon ? 'warn' : undefined} />
        <Stat label="First response (median, 30 d)" value={h(dash.medianFirstResponseH)} />
        <Stat label="Resolution (median, 30 d)" value={h(dash.medianResolutionH)} />
        <Stat label="Resolved within SLA" value={dash.slaMetPct === null ? '—' : `${dash.slaMetPct}%`} hint={`${dash.resolved30} resolved in 30 days`} />
        <Stat label="CSAT" value={dash.csat.score === null ? '—' : `${dash.csat.score}%`} hint={`${dash.csat.responses} answers`} />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title="Opened vs resolved (14 days)" className="xl:col-span-2">
          <div className="flex h-36 items-end gap-1.5" role="img" aria-label="Cases opened and resolved per day">
            {dash.trend.map((t) => (
              <div key={t.day} className="flex flex-1 flex-col items-center gap-0.5" title={`${t.day}: ${t.opened} opened, ${t.resolved} resolved`}>
                <div className="flex h-28 w-full items-end justify-center gap-0.5">
                  <span className="w-1/2 rounded-t-sm bg-viz-1" style={{ height: `${(t.opened / maxDay) * 100}%` }} />
                  <span className="w-1/2 rounded-t-sm bg-viz-good" style={{ height: `${(t.resolved / maxDay) * 100}%` }} />
                </div>
                <span className="text-[9px] text-muted-foreground">{t.day.slice(8)}</span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground"><span className="mr-1 inline-block h-2 w-2 bg-viz-1" />opened <span className="ml-3 mr-1 inline-block h-2 w-2 bg-viz-good" />resolved</p>
        </Card>
        <Card title="Open by priority"><Bars data={PRI.map((p) => ({ label: p, value: dash.byPriority[p] ?? 0, tone: p === 'Urgent' ? 'bg-viz-critical' : 'bg-viz-1' }))} /></Card>
        <Card title="Open by status"><Bars data={toBars(dash.byStatus)} /></Card>
        <Card title="Where cases come from (30 d)"><Bars data={toBars(dash.byOrigin)} /></Card>
        <Card title="What they are about (30 d)"><Bars data={toBars(dash.byType)} /></Card>
      </div>
      <Card title={`Past SLA (${dash.overdueCount})`}>
        {dash.overdue.length ? (
          <table className="w-full text-sm"><tbody>{dash.overdue.map((c) => (
            <tr key={c.id} className="border-b border-border/60"><td className="py-1.5 pr-2 text-xs text-muted-foreground">{c.number}</td>
              <td className="py-1.5 pr-2"><Link className="text-navy hover:underline" href={`/crm/m/cases/${c.id}`}>{c.name}</Link></td>
              <td className="py-1.5 pr-2 text-xs">{c.priority}</td><td className="py-1.5 pr-2 text-xs text-destructive">due {fmtDate(c.due)}</td>
              <td className="py-1.5 text-xs text-muted-foreground">{c.owner ? names[c.owner] ?? '—' : 'Unassigned'}</td></tr>
          ))}</tbody></table>
        ) : <p className="text-sm text-muted-foreground">Nothing is past its SLA.</p>}
      </Card>
      {canKb && <Kb />}
      {canConfigure && <Settings sla={sla} settings={settings} surveys={surveys} />}
    </div>
  );
}

function Kb() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Array<{ id: string; title: string; category: string; question: string; answer: string; helpful: number }> | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const r = await kbSearch(q);
    if (!r.ok) return toast.error(r.error);
    setRows(r.data);
  };
  const helpful = async (id: string) => {
    const r = await kbHelpful(id);
    if (!r.ok) return toast.error(r.error);
    setRows((x) => x?.map((s) => (s.id === id ? { ...s, helpful: r.data } : s)) ?? null);
  };
  return (
    <Card title="Knowledge base" actions={<Link href="/crm/m/solutions/new" className="text-xs text-navy hover:underline">+ Write a solution</Link>}>
      <form onSubmit={search} className="flex gap-2"><input className={inp} placeholder="Search published solutions (e.g. refund, voice, login)" value={q} onChange={(e) => setQ(e.target.value)} /><Button type="submit">Search</Button></form>
      {rows && (
        <ul className="mt-3 divide-y divide-border">
          {rows.map((s) => (
            <li key={s.id} className="py-2 text-sm">
              <button type="button" className="text-left font-medium text-navy hover:underline" onClick={() => setOpen(open === s.id ? null : s.id)}>{s.title}</button>
              <span className="ml-2 text-xs text-muted-foreground">{s.category} · helpful ×{s.helpful}</span>
              {open === s.id && (
                <div className="mt-1.5 space-y-1.5 rounded-md bg-muted/40 p-2">
                  {s.question && <p className="text-xs text-muted-foreground">{s.question}</p>}
                  <p className="whitespace-pre-wrap">{s.answer}</p>
                  <div className="flex gap-2"><Button small onClick={() => { navigator.clipboard?.writeText(s.answer); toast.success('Answer copied — paste it into your reply'); }}>Copy answer</Button><Button small onClick={() => helpful(s.id)}>Helpful</Button><Link className="text-xs text-navy hover:underline" href={`/crm/m/solutions/${s.id}`}>Open</Link></div>
                </div>
              )}
            </li>
          ))}
          {!rows.length && <li className="py-2 text-sm text-muted-foreground">Nothing found. Only “Published” solutions appear here.</li>}
        </ul>
      )}
    </Card>
  );
}

function Settings({ sla, settings, surveys }: { sla: SlaPolicy; settings: { csatOnResolve: boolean; csatSurveyId: string | null }; surveys: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const [p, setP] = useState(sla);
  const [s, setS] = useState(settings);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    const r = await serviceSaveConfig({ sla: p, settings: s });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success('Service settings saved. New SLA times apply to new cases and priority changes.');
    router.refresh();
  };
  return (
    <Card title="SLA policy and settings" actions={<Button primary small onClick={save} disabled={busy}>Save</Button>}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground"><tr><th className="text-left">Priority</th><th className="text-left">First response (h)</th><th className="text-left">Resolve within (h)</th></tr></thead>
            <tbody>{PRI.map((k) => (
              <tr key={k}><td className="py-1">{k}</td>
                <td className="py-1 pr-2"><input type="number" min={1} max={2000} className={inp} value={p.firstResponseHours[k]} onChange={(e) => setP({ ...p, firstResponseHours: { ...p.firstResponseHours, [k]: Number(e.target.value) } })} /></td>
                <td className="py-1"><input type="number" min={1} max={2000} className={inp} value={p.resolveHours[k]} onChange={(e) => setP({ ...p, resolveHours: { ...p.resolveHours, [k]: Number(e.target.value) } })} /></td></tr>
            ))}</tbody>
          </table>
          <p className="mt-1 text-[11px] text-muted-foreground">Hours are working hours unless 24×7 is on. Times are IST.</p>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!p.hours.twentyFourSeven} onChange={(e) => setP({ ...p, hours: { ...p.hours, twentyFourSeven: e.target.checked } })} /> 24×7 support</label>
          {!p.hours.twentyFourSeven && <>
            <div className="flex flex-wrap gap-2 text-sm">{DAYS.map((d, i) => (
              <label key={d} className="flex items-center gap-1"><input type="checkbox" checked={p.hours.days.includes(i)} onChange={(e) => setP({ ...p, hours: { ...p.hours, days: e.target.checked ? [...p.hours.days, i].sort() : p.hours.days.filter((x) => x !== i) } })} />{d}</label>
            ))}</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Opens"><input type="time" className={inp} value={p.hours.start} onChange={(e) => setP({ ...p, hours: { ...p.hours, start: e.target.value } })} /></Field>
              <Field label="Closes"><input type="time" className={inp} value={p.hours.end} onChange={(e) => setP({ ...p, hours: { ...p.hours, end: e.target.value } })} /></Field>
            </div>
            <Field label="Holidays (YYYY-MM-DD, comma separated)"><input className={inp} value={(p.hours.holidays ?? []).join(', ')} onChange={(e) => setP({ ...p, hours: { ...p.hours, holidays: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) } })} /></Field>
          </>}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.csatOnResolve} onChange={(e) => setS({ ...s, csatOnResolve: e.target.checked })} /> Send a satisfaction survey when a case is resolved (waits in the Outbox)</label>
          {s.csatOnResolve && <select className={inp} value={s.csatSurveyId ?? ''} onChange={(e) => setS({ ...s, csatSurveyId: e.target.value || null })}><option value="">Choose survey…</option>{surveys.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>}
        </div>
      </div>
    </Card>
  );
}

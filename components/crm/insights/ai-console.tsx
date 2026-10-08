'use client';

/**
 * Iris, the CRM's AI assistant: Ask Iris, churn / conversion models with
 * holdout accuracy, custom prediction builder, anomaly alerts, and the log of
 * human overrides. Every model states how reliable it is; unreliable models
 * are never used for scores.
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { aiAsk, aiDeletePrediction, aiRefreshScores, aiSavePrediction, aiTrain } from '@/app/(app)/crm/insight-actions';
import { Bars, Button, Card, Field, Stat, fmtDate, inp, inr } from '../ui';
import { Chart } from './chart';
import type { BuilderModule } from './report-builder';

/* eslint-disable @typescript-eslint/no-explicit-any */
type A = any;
const TABS = [['ask', 'Ask Iris'], ['models', 'Models and scores'], ['predictions', 'Prediction builder'], ['anomalies', 'Anomalies'], ['feedback', 'Human feedback']] as const;

function ModelCard({ title, m, kind, canManage, onTrained }: { title: string; m: A; kind: 'churn' | 'conversion'; canManage: boolean; onTrained: () => void }) {
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<A>(null);
  const train = async () => {
    setBusy(true);
    const r = await aiTrain(kind);
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    setLast(r.data);
    if (r.data.ok) { toast.success(`Trained v${r.data.version}`); onTrained(); } else toast.message(r.data.reason ?? 'Not enough data to train a reliable model.');
  };
  const metrics = m?.metrics;
  return (
    <Card title={title} actions={canManage ? <Button small onClick={train} disabled={busy}>{busy ? 'Training…' : 'Train now'}</Button> : null}>
      {m ? (
        <div className="space-y-2 text-sm">
          <p>Version {m.version}, trained {fmtDate(m.trainedAt)} on {metrics.examples ?? '?'} examples.</p>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Holdout AUC" value={metrics.auc ?? '—'} tone={metrics.reliable ? 'good' : 'warn'} hint={metrics.reliable ? 'reliable (≥ 0.6)' : 'not reliable — rules used'} />
            <Stat label="Precision" value={metrics.precision === null || metrics.precision === undefined ? '—' : `${metrics.precision}%`} />
            <Stat label="Recall" value={metrics.recall === null || metrics.recall === undefined ? '—' : `${metrics.recall}%`} hint={metrics.baseRate !== null && metrics.baseRate !== undefined ? `base rate ${metrics.baseRate}%` : undefined} />
          </div>
          {Array.isArray(metrics.importance) && metrics.importance.length > 0 && (
            <div><p className="mb-1 text-xs text-muted-foreground">What drives it (weight on standardised inputs)</p>
              <Bars data={metrics.importance.slice(0, 8).map((x: A) => ({ label: `${x.label} (${x.weight > 0 ? 'raises' : 'lowers'})`, value: Math.abs(x.weight), tone: x.weight > 0 ? 'bg-viz-2' : 'bg-viz-5' }))} format={(n) => n.toFixed(2)} />
            </div>
          )}
        </div>
      ) : <p className="text-sm text-muted-foreground">No trained model yet. Until there is one with at least 30 examples of each outcome and a holdout AUC of 0.6, scores use transparent rules.</p>}
      {last && !last.ok && <p className="mt-2 rounded bg-warning-soft p-2 text-xs">{last.reason}</p>}
    </Card>
  );
}

export default function AiConsole({ overview, anomalies, modules, names, initialTab }: { overview: A; anomalies: A; modules: BuilderModule[]; names: Record<string, string>; initialTab: string }) {
  const router = useRouter();
  const [tab, setTab] = useState(initialTab);
  const o = overview;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Iris <span className="text-sm font-normal text-muted-foreground">· AI assistant</span></h1>
        <p className="text-sm text-muted-foreground">Predictions, scores and alerts with their reasons shown. People can agree, disagree or override any score on a record. Nothing AI-suggested reaches a customer without consent and approval.</p>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border" role="tablist">
        {TABS.map(([k, label]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-3 py-2 text-sm ${tab === k ? 'border-navy font-medium text-navy' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{label}</button>)}
      </div>
      {o?.error && <p className="rounded bg-warning-soft p-3 text-sm">{o.error}</p>}
      {tab === 'ask' && <Ask />}
      {tab === 'models' && !o?.error && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Customers scored" value={o.scored.toLocaleString('en-IN')} hint={`${o.profilingOff} opted out of AI profiling (not scored)`} />
            <Stat label="Health: excellent (76+)" value={o.healthDistribution.excellent} tone="good" />
            <Stat label="Health: good (51–75)" value={o.healthDistribution.good} />
            <Stat label="Health: needs attention" value={o.healthDistribution.attention} tone="warn" />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ModelCard title="Churn prediction (contacts)" m={o.churn} kind="churn" canManage={o.canManage} onTrained={() => router.refresh()} />
            <ModelCard title="Lead conversion prediction" m={o.conversion} kind="conversion" canManage={o.canManage} onTrained={() => router.refresh()} />
          </div>
          {o.canManage && <div className="flex justify-end"><Button onClick={async () => { const r = await aiRefreshScores(); if (!r.ok) return toast.error(r.error); toast.success(`Scores refreshed: ${r.data.contacts} contacts, ${r.data.leads} leads, ${r.data.deals} deals changed`); router.refresh(); }}>Refresh all scores now</Button></div>}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card title="Paying customers at high churn risk (70%+)">
              <ul className="divide-y divide-border text-sm">{(o.highRisk as A[]).map((c) => <li key={c.id} className="py-1.5"><Link className="text-navy hover:underline" href={`/crm/m/contacts/${c.id}`}>{c.name}</Link> <span className="text-xs text-muted-foreground">— risk {c.risk}% · {c.nba ?? 'no action'}</span></li>)}{!o.highRisk.length && <li className="py-3 text-muted-foreground">None.</li>}</ul>
            </Card>
            <Card title="Open deals at risk (health below 51)">
              <ul className="divide-y divide-border text-sm">{(o.atRiskDeals as A[]).map((d) => <li key={d.id} className="py-1.5"><Link className="text-navy hover:underline" href={`/crm/m/deals/${d.id}`}>{d.name}</Link> <span className="text-xs text-muted-foreground">— health {d.health} · {inr(d.amount)}</span></li>)}{!o.atRiskDeals.length && <li className="py-3 text-muted-foreground">None.</li>}</ul>
            </Card>
          </div>
          <p className="text-xs text-muted-foreground">Generative drafts: {o.llm ? 'an AI model is configured (drafts use only first name, plan and usage counts).' : 'no AI model configured — email drafts use templates.'}</p>
        </div>
      )}
      {tab === 'predictions' && !o?.error && <Predictions list={o.predictions} modules={modules} canManage={o.canManage} />}
      {tab === 'anomalies' && (
        <div className="space-y-4">
          <Card title="Detected in the last 7 days (robust z-score vs the same weekday over 4 weeks)">
            <ul className="divide-y divide-border text-sm">
              {(anomalies.anomalies as A[]).map((a, i) => <li key={i} className="flex flex-wrap justify-between gap-2 py-1.5"><span><span className={a.good === false ? 'text-destructive' : a.good ? 'text-success' : ''}>{a.metric} {a.direction === 'up' ? '▲' : '▼'}</span> on {a.day}</span><span className="text-xs text-muted-foreground">{a.value} vs ~{a.expected} expected · z = {a.z}</span></li>)}
              {!anomalies.anomalies.length && <li className="py-3 text-muted-foreground">Nothing unusual.</li>}
            </ul>
          </Card>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card title="Sign-ups per day (30 days)"><Chart kind="bar" data={(anomalies.series as A[]).map((r) => ({ label: String(r.day).slice(5), value: Number(r.signups) }))} height={200} /></Card>
            <Card title="Revenue per day, ₹ (30 days)"><Chart kind="bar" data={(anomalies.series as A[]).map((r) => ({ label: String(r.day).slice(5), value: Number(r.revenue_paise) / 100 }))} height={200} /></Card>
          </div>
        </div>
      )}
      {tab === 'feedback' && !o?.error && (
        <Card title="Agree / disagree / override log">
          <table className="w-full text-sm"><tbody>{(o.feedback as A[]).map((f, i) => (
            <tr key={i} className="border-t border-border"><td className="py-1.5 pr-2">{fmtDate(f.created_at)}</td><td className="pr-2">{names[f.user_id] ?? 'Former user'}</td><td className="pr-2 capitalize">{f.verdict}{f.value !== null && f.value !== undefined ? ` → ${f.value}` : ''}</td><td className="pr-2 text-xs text-muted-foreground">{f.kind}</td><td className="text-xs">{f.reason ?? ''}</td><td>{f.record_id && <Link className="text-xs text-navy hover:underline" href={`/crm/r/${f.record_id}`}>record</Link>}</td></tr>
          ))}{!o.feedback.length && <tr><td className="py-3 text-muted-foreground">No feedback yet.</td></tr>}</tbody></table>
        </Card>
      )}
    </div>
  );
}

function Ask() {
  const [q, setQ] = useState('');
  const [res, setRes] = useState<A>(null);
  const [busy, setBusy] = useState(false);
  const ask = async (question = q) => {
    if (!question.trim()) return;
    setQ(question);
    setBusy(true);
    const r = await aiAsk(question);
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    setRes(r.data);
  };
  const examples = ['How many leads were created this month?', 'Total revenue from deals won last month', 'Open cases by priority', 'Average deal amount by pipeline', 'Paying customers by plan', 'Top 5 owners by deals won this quarter', 'Contacts inactive by market'];
  return (
    <Card title="Ask Iris a question about your CRM">
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(); }}>
        <input className={inp} value={q} onChange={(e) => setQ(e.target.value)} maxLength={300} placeholder="e.g. Total revenue from deals won last month" aria-label="Question" />
        <Button primary type="submit" disabled={busy}>{busy ? '…' : 'Ask'}</Button>
      </form>
      <div className="mt-2 flex flex-wrap gap-1.5">{examples.map((x) => <button key={x} type="button" onClick={() => ask(x)} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-muted">{x}</button>)}</div>
      {res && (
        <div className="mt-4 space-y-2">
          {!res.ok ? (
            <div className="text-sm"><p>{res.message}</p>{res.suggestions?.length > 0 && <p className="mt-1 text-xs text-muted-foreground">Try: {res.suggestions.join(' · ')}</p>}</div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">{res.explanation} ({res.records.toLocaleString('en-IN')} {res.module.toLowerCase()} you can see)</p>
              {res.groups ? (
                <><Chart kind="bar" data={(res.groups as A[]).filter((g) => g.value !== null).map((g) => ({ label: g.key, value: g.value }))} height={220} />
                  <table className="w-full text-sm"><tbody>{(res.groups as A[]).map((g) => <tr key={g.key} className="border-t border-border"><td className="py-1">{g.key}</td><td className="text-right tabular-nums">{g.value === null ? '—' : g.value.toLocaleString('en-IN')}</td></tr>)}</tbody></table></>
              ) : <p className="text-3xl font-semibold tabular-nums">{res.value === null ? '—' : res.value.toLocaleString('en-IN')}</p>}
            </>
          )}
        </div>
      )}
    </Card>
  );
}

function Predictions({ list, modules, canManage }: { list: A[]; modules: BuilderModule[]; canManage: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<A>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const mod = modules.find((m) => m.api === editing?.config?.module) ?? modules[0];
  const targets = mod?.fields.filter((f) => f.type === 'picklist' || f.type === 'boolean') ?? [];
  const tf = targets.find((f) => f.api === editing?.config?.target?.field);
  const save = async () => {
    const r = await aiSavePrediction({ id: editing.id ?? null, name: editing.name, config: editing.config });
    if (!r.ok) return toast.error(r.error);
    toast.success('Saved — train it to start predicting');
    setEditing(null);
    router.refresh();
  };
  const train = async (id: string) => {
    setBusy(id);
    const r = await aiTrain('prediction', id);
    setBusy(null);
    if (!r.ok) return toast.error(r.error);
    if (r.data.ok) toast.success(`Trained: holdout AUC ${r.data.metrics.auc}${r.data.metrics.reliable ? '' : ' (not reliable — not shown on records)'}`); else toast.message(r.data.reason);
    router.refresh();
  };
  return (
    <div className="space-y-4">
      <Card title="Custom predictions" actions={canManage && !editing ? <Button small onClick={() => setEditing({ name: '', config: { module: modules[0]?.api, target: { field: '', positive: '' }, features: [] } })}>New prediction</Button> : null}>
        <p className="mb-2 text-xs text-muted-foreground">Pick a yes/no outcome you already record (e.g. “Lead status = Converted”) and the fields that might explain it. The model learns from records where the outcome is known, is checked on a 30% holdout, and appears on records only if it is reliable.</p>
        <table className="w-full text-sm"><tbody>{list.map((p) => (
          <tr key={p.id} className="border-t border-border">
            <td className="py-1.5"><span className="font-medium">{p.name}</span> <span className="text-xs text-muted-foreground">{p.module}: {p.config.target.field} = {p.config.target.positive}</span></td>
            <td className="text-xs">{p.model ? `v${p.model.version} · AUC ${p.model.metrics.auc ?? '—'} · ${p.model.metrics.reliable ? 'reliable' : 'not reliable'}` : 'not trained'}</td>
            <td className="text-right">{canManage && <span className="inline-flex gap-1"><Button small onClick={() => train(p.id)} disabled={busy === p.id}>{busy === p.id ? '…' : 'Train'}</Button><Button small onClick={() => setEditing(p)}>Edit</Button><Button small danger onClick={async () => { if (!confirm('Delete this prediction?')) return; const r = await aiDeletePrediction(p.id); if (!r.ok) return toast.error(r.error); router.refresh(); }}>Delete</Button></span>}</td>
          </tr>
        ))}{!list.length && <tr><td className="py-3 text-muted-foreground">None yet.</td></tr>}</tbody></table>
      </Card>
      {editing && mod && (
        <Card title={editing.id ? 'Edit prediction' : 'New prediction'}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Name"><input className={inp} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} maxLength={120} /></Field>
            <Field label="Module"><select className={inp} value={mod.api} onChange={(e) => setEditing({ ...editing, config: { module: e.target.value, target: { field: '', positive: '' }, features: [] } })}>{modules.map((m) => <option key={m.api} value={m.api}>{m.label}</option>)}</select></Field>
            <Field label="Outcome to predict"><select className={inp} value={editing.config.target.field} onChange={(e) => setEditing({ ...editing, config: { ...editing.config, target: { field: e.target.value, positive: '' } } })}><option value="">Pick a picklist or yes/no field…</option>{targets.map((f) => <option key={f.api} value={f.api}>{f.label}</option>)}</select></Field>
            {tf?.type === 'picklist' && <Field label="Counts as “yes” when it is"><select className={inp} value={editing.config.target.positive} onChange={(e) => setEditing({ ...editing, config: { ...editing.config, target: { ...editing.config.target, positive: e.target.value } } })}><option value="">Pick…</option>{(tf.picklist ?? []).map((v) => <option key={v} value={v}>{v}</option>)}</select></Field>}
          </div>
          <p className="mb-1 mt-3 text-xs font-medium text-muted-foreground">Learn from (2–20 fields)</p>
          <div className="flex max-h-48 flex-wrap gap-x-4 gap-y-1 overflow-y-auto rounded border border-border p-2 text-sm">
            {mod.fields.filter((f) => f.api !== editing.config.target.field && !['line_items', 'json', 'related'].includes(f.type)).map((f) => (
              <label key={f.api} className="flex items-center gap-1.5"><input type="checkbox" checked={editing.config.features.includes(f.api)} disabled={!editing.config.features.includes(f.api) && editing.config.features.length >= 20} onChange={(e) => setEditing({ ...editing, config: { ...editing.config, features: e.target.checked ? [...editing.config.features, f.api] : editing.config.features.filter((x: string) => x !== f.api) } })} />{f.label}</label>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2"><Button onClick={() => setEditing(null)}>Cancel</Button><Button primary onClick={save}>Save</Button></div>
        </Card>
      )}
    </div>
  );
}

'use client';

/**
 * Record side panels: Iris insights (with reasons, and agree / disagree /
 * override) and privacy (consent per purpose, ledger, rights requests).
 * Loaded on demand so the record page stays fast.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { aiGiveFeedback, aiInsights, pvConsentHistory, pvSetConsent } from '@/app/(app)/crm/insight-actions';
import { PURPOSES, PURPOSE_LABEL } from '@/lib/crm/privacy';
import { Button, Card, Field, Modal, area, fmtDate, inp } from './ui';

/* eslint-disable @typescript-eslint/no-explicit-any */
type A = any;

function Factors({ factors }: { factors: Array<{ label: string; points: number; max: number; note: string }> }) {
  return (
    <ul className="mt-1 space-y-0.5 text-xs">
      {factors.map((f) => <li key={f.label} className="flex justify-between gap-2"><span className="text-muted-foreground">{f.label}: {f.note}</span><span className="tabular-nums">{f.points}/{f.max}</span></li>)}
    </ul>
  );
}
function ModelFactors({ f }: { f: { positive: Array<{ label: string; effect: number }>; negative: Array<{ label: string; effect: number }> } | null }) {
  if (!f) return null;
  return (
    <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
      <div><p className="text-muted-foreground">Pushing it up</p>{f.positive.map((x) => <p key={x.label}>{x.label}</p>)}{!f.positive.length && <p className="text-muted-foreground">—</p>}</div>
      <div><p className="text-muted-foreground">Pulling it down</p>{f.negative.map((x) => <p key={x.label}>{x.label}</p>)}{!f.negative.length && <p className="text-muted-foreground">—</p>}</div>
    </div>
  );
}

function Feedback({ recordId, kind, score, onDone }: { recordId: string; kind: string; score?: number | null; onDone: () => void }) {
  const [mode, setMode] = useState<null | 'disagree' | 'override'>(null);
  const [reason, setReason] = useState('');
  const [value, setValue] = useState<string>(score === null || score === undefined ? '' : String(score));
  const send = async (verdict: string) => {
    const r = await aiGiveFeedback({ recordId, kind, verdict, reason, value: verdict === 'override' ? Number(value) : undefined });
    if (!r.ok) return toast.error(r.error);
    toast.success('Thanks — recorded with this record');
    setMode(null); setReason('');
    onDone();
  };
  return (
    <div className="mt-1.5">
      {!mode ? (
        <div className="flex gap-1.5">
          <button type="button" className="text-[11px] text-muted-foreground hover:text-foreground" onClick={() => send('agree')}>👍 Agree</button>
          <button type="button" className="text-[11px] text-muted-foreground hover:text-foreground" onClick={() => setMode('disagree')}>👎 Disagree</button>
          {score !== undefined && <button type="button" className="text-[11px] text-muted-foreground hover:text-foreground" onClick={() => setMode('override')}>✎ Override</button>}
        </div>
      ) : (
        <div className="space-y-1.5 rounded border border-border p-2">
          {mode === 'override' && <input className={inp} type="number" min={0} max={100} value={value} onChange={(e) => setValue(e.target.value)} aria-label="Your score (0–100)" />}
          <textarea className={area} rows={2} placeholder="Why? (kept with the record)" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} />
          <div className="flex justify-end gap-1.5"><Button small onClick={() => setMode(null)}>Cancel</Button><Button small primary onClick={() => send(mode)}>Save</Button></div>
        </div>
      )}
    </div>
  );
}

export function AiPanel({ recordId, module }: { recordId: string; module: string }) {
  const [d, setD] = useState<A>(null);
  const [err, setErr] = useState<string | null>(null);
  const load = () => { aiInsights(recordId).then((r) => (r.ok ? setD(r.data) : setErr(r.error))); };
  useEffect(load, [recordId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!['contacts', 'leads', 'deals'].includes(module)) return null;
  if (err) return null;
  if (!d) return <Card title="Iris insights"><p className="text-xs text-muted-foreground">Loading…</p></Card>;
  if (d.profilingOff || d.restricted) return <Card title="Iris insights"><p className="text-sm text-muted-foreground">{d.restricted ? 'Processing is restricted by a privacy request — no AI scoring.' : 'This person opted out of AI profiling, so they are not scored.'}</p></Card>;
  const last = (kind: string) => (d.feedback as A[] | undefined)?.find((f) => f.kind === kind && f.verdict === 'override');
  const hidden = (x: A) => x?.hidden;
  return (
    <Card title="Iris insights">
      <div className="space-y-3 text-sm">
        {d.health && (hidden(d.health) ? <p className="text-xs text-muted-foreground">Health: {d.health.note}</p> : (
          <div>
            <p className="font-medium">Health {d.health.score}/100 <span className="text-xs font-normal text-muted-foreground">· {d.health.band}</span></p>
            <Factors factors={d.health.factors} />
            {last('health') && <p className="mt-1 text-[11px] text-warning-foreground">Overridden to {last('health').value}: {last('health').reason}</p>}
            <Feedback recordId={recordId} kind="health" score={d.health.score} onDone={load} />
          </div>
        ))}
        {d.churn && (hidden(d.churn) ? <p className="text-xs text-muted-foreground">Churn: {d.churn.note}</p> : (
          <div>
            <p className="font-medium">Churn risk {d.churn.probability}%</p>
            <p className="text-[11px] text-muted-foreground">{d.churn.model}</p>
            <ModelFactors f={d.churn.factors} />
            {last('churn') && <p className="mt-1 text-[11px] text-warning-foreground">Overridden to {last('churn').value}%: {last('churn').reason}</p>}
            <Feedback recordId={recordId} kind="churn" score={d.churn.probability} onDone={load} />
          </div>
        ))}
        {d.conversion && (hidden(d.conversion) ? <p className="text-xs text-muted-foreground">Conversion: {d.conversion.note}</p> : (
          <div>
            <p className="font-medium">Chance of converting {d.conversion.probability ?? '—'}%</p>
            <p className="text-[11px] text-muted-foreground">{d.conversion.model}</p>
            <ModelFactors f={d.conversion.factors} />
            <Feedback recordId={recordId} kind="conversion" score={d.conversion.probability} onDone={load} />
          </div>
        ))}
        {d.dealHealth !== undefined && (d.dealHealth === null ? <p className="text-xs text-muted-foreground">Deal health applies to open deals only.</p> : hidden(d.dealHealth) ? <p className="text-xs text-muted-foreground">Deal health: {d.dealHealth.note}</p> : (
          <div>
            <p className="font-medium">Deal health {d.dealHealth.score}/100 <span className="text-xs font-normal text-muted-foreground">· {d.dealHealth.band}</span></p>
            <Factors factors={d.dealHealth.factors} />
            <Feedback recordId={recordId} kind="deal_health" score={d.dealHealth.score} onDone={load} />
          </div>
        ))}
        {Array.isArray(d.nba) && (
          <div>
            <p className="font-medium">Next best action</p>
            <ul className="mt-1 space-y-1">
              {(d.nba as A[]).slice(0, 3).map((a) => (
                <li key={a.key} className="text-xs">
                  <span className={a.allowed ? '' : 'text-muted-foreground line-through'}>{a.title}</span>
                  <span className="block text-muted-foreground">{a.why}{!a.allowed && a.blockedBy ? ` — blocked: ${a.blockedBy}` : ''}</span>
                </li>
              ))}
            </ul>
            <Feedback recordId={recordId} kind="nba" onDone={load} />
          </div>
        )}
        {d.bestTime && <p className="text-xs"><span className="font-medium">Best time to email:</span> {d.bestTime.window} <span className="text-muted-foreground">({d.bestTime.confidence} confidence, {d.bestTime.evidence} opens/clicks)</span></p>}
        {(d.predictions as A[] | undefined)?.map((p) => (
          <div key={p.name}><p className="font-medium">{p.name}: {p.probability}%</p><p className="text-[11px] text-muted-foreground">{p.target} · holdout AUC {p.auc}</p><ModelFactors f={p.factors} /></div>
        ))}
      </div>
    </Card>
  );
}

export function PrivacyPanel({ recordId, module, canEdit }: { recordId: string; module: string; canEdit: boolean }) {
  const [d, setD] = useState<A>(null);
  const [open, setOpen] = useState<null | { purpose: string; status: string }>(null);
  const [notice, setNotice] = useState('');
  const load = () => { pvConsentHistory(recordId).then((r) => r.ok && setD(r.data)); };
  useEffect(load, [recordId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!['contacts', 'leads'].includes(module) || !d) return null;
  const save = async () => {
    if (!open) return;
    const r = await pvSetConsent({ recordId, purpose: open.purpose, status: open.status, notice, channel: 'manual' });
    if (!r.ok) return toast.error(r.error);
    toast.success('Consent recorded');
    setOpen(null); setNotice('');
    load();
  };
  const tone = (s: string) => (s === 'given' ? 'text-success' : s === 'withdrawn' ? 'text-destructive' : 'text-muted-foreground');
  return (
    <Card title="Privacy and consent">
      {d.erased ? <p className="text-sm text-muted-foreground">This person’s data was erased under a privacy request.</p> : (
        <div className="space-y-2 text-sm">
          {d.restricted && <p className="rounded bg-warning-soft p-2 text-xs">Processing is restricted (privacy request in progress).</p>}
          <p className="text-xs text-muted-foreground">Basis: {d.basis ?? 'Not set'}</p>
          <ul className="space-y-1">
            {PURPOSES.map((p) => (
              <li key={p} className="flex items-center justify-between gap-2 text-xs">
                <span>{PURPOSE_LABEL[p]}</span>
                <span className="flex items-center gap-2">
                  <span className={tone(d.state[p])}>{({ given: 'Given', withdrawn: 'Withdrawn', pending: 'Pending', none: 'Not recorded' } as Record<string, string>)[d.state[p]] ?? d.state[p]}</span>
                  {canEdit && d.state[p] !== 'withdrawn' && <button type="button" className="text-[11px] text-navy hover:underline" onClick={() => setOpen({ purpose: p, status: 'withdrawn' })}>Withdraw</button>}
                  {canEdit && d.state[p] !== 'given' && <button type="button" className="text-[11px] text-navy hover:underline" onClick={() => setOpen({ purpose: p, status: 'given' })}>Record consent</button>}
                </span>
              </li>
            ))}
          </ul>
          {d.ledger.length > 0 && (
            <details className="text-xs"><summary className="cursor-pointer text-muted-foreground">Consent history ({d.ledger.length})</summary>
              <ul className="mt-1 space-y-1">{(d.ledger as A[]).map((l) => <li key={l.id}><span className="capitalize">{l.status}</span> · {PURPOSE_LABEL[l.purpose as keyof typeof PURPOSE_LABEL] ?? l.purpose} · {l.channel} · {fmtDate(l.created_at)}{l.by ? ` · ${l.by}` : ''}{l.notice ? <span className="block text-muted-foreground">“{String(l.notice).slice(0, 160)}”</span> : null}</li>)}</ul>
            </details>
          )}
          {d.canManage && (
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              {['access', 'erasure', 'correction', 'restrict'].map((k) => <Link key={k} className="text-navy hover:underline" href={`/crm/privacy?record=${recordId}&kind=${k}`}>{k === 'access' ? 'Access request' : k === 'erasure' ? 'Erasure request' : k === 'correction' ? 'Correction request' : 'Restrict processing'}</Link>)}
            </div>
          )}
          {(d.requests as A[]).length > 0 && <p className="text-xs text-muted-foreground">{d.requests.length} privacy request(s) on file — <Link className="text-navy hover:underline" href="/crm/privacy?tab=requests">open</Link></p>}
        </div>
      )}
      {open && (
        <Modal title={`${open.status === 'given' ? 'Record consent' : 'Record withdrawal'}: ${PURPOSE_LABEL[open.purpose as keyof typeof PURPOSE_LABEL]}`} onClose={() => setOpen(null)}>
          <Field label={open.status === 'given' ? 'How and when was consent given? (the notice they saw, or the conversation)' : 'Note (optional)'}>
            <textarea className={area} rows={4} value={notice} onChange={(e) => setNotice(e.target.value)} maxLength={2000} />
          </Field>
          {open.status === 'withdrawn' && open.purpose === 'marketing' && <p className="mt-2 text-xs text-muted-foreground">Queued marketing email to this person is cancelled and active cadences stop.</p>}
          {open.status === 'withdrawn' && open.purpose === 'ai_profiling' && <p className="mt-2 text-xs text-muted-foreground">Their AI scores are cleared and they will not be scored again.</p>}
          <div className="mt-3 flex justify-end gap-2"><Button onClick={() => setOpen(null)}>Cancel</Button><Button primary onClick={save}>Save</Button></div>
        </Modal>
      )}
    </Card>
  );
}

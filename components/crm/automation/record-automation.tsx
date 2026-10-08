'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { crmDecideApproval, crmEnrollCadence, crmRunMacro, crmScoreWhy, crmSubmitApproval, crmTransition, crmUnenrollCadence } from '@/app/(app)/crm/auto-actions';
import type { ClientField } from '@/lib/crm/client-types';
import { FieldInput, type Member } from '../field-input';
import { Button, Modal, fmtDate, area } from '../ui';

export interface BlueprintInfo {
  id: string; name: string; field: string; state: string; enteredAt: string; done: boolean;
  transitions: Array<{ id: string; name: string; to: string; requiredFields: string[]; noteRequired: boolean; message?: string }>;
}
export interface ApprovalInfo {
  id: string; status: string; stage: number; approvers: string[]; approved_by: string[]; requested_at: string; decided_at: string | null; comment: string | null;
  history: Array<{ at: string; event: string; by: string | null; comment?: string }>;
}

/** Header buttons: transitions, approval, macros, cadences. */
export function RecordAutomationActions({ recordId, module, blueprint, approval, canDecide, canSubmit, macros, cadences, fields, members, stateLabels }: {
  recordId: string; module: string; blueprint: BlueprintInfo | null; approval: ApprovalInfo | null; canDecide: boolean; canSubmit: boolean;
  macros: Array<{ id: string; name: string }>; cadences: Array<{ id: string; name: string }>; fields: ClientField[]; members: Member[]; stateLabels: Record<string, string>;
}) {
  const router = useRouter();
  const [tr, setTr] = useState<BlueprintInfo['transitions'][number] | null>(null);
  const [decide, setDecide] = useState<null | boolean>(null);
  const run = async (p: Promise<{ ok: boolean; error?: string }>, msg: string) => {
    const r = await p;
    if (!r.ok) return toast.error((r as { error: string }).error);
    toast.success(msg);
    router.refresh();
  };
  return (
    <>
      {blueprint && !blueprint.done && blueprint.transitions.map((t) => (
        <Button key={t.id} primary small onClick={() => (t.requiredFields.length || t.noteRequired || t.message ? setTr(t) : run(crmTransition(recordId, t.id, {}), `Moved to ${stateLabels[t.to] ?? t.to}`))}>{t.name}</Button>
      ))}
      {approval?.status === 'pending' && canDecide && <>
        <Button small primary onClick={() => setDecide(true)}>Approve</Button>
        <Button small danger onClick={() => setDecide(false)}>Reject</Button>
      </>}
      {canSubmit && approval?.status !== 'pending' && <Button small onClick={() => run(crmSubmitApproval(recordId), 'Submitted for approval')}>Submit for approval</Button>}
      {macros.length > 0 && (
        <select aria-label="Run a macro" className="h-8 rounded-md border border-border bg-card px-2 text-sm" value="" onChange={(e) => e.target.value && run(crmRunMacro(e.target.value, [recordId]), 'Macro ran')}>
          <option value="">Run macro…</option>{macros.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      )}
      {cadences.length > 0 && (
        <select aria-label="Enroll in a cadence" className="h-8 rounded-md border border-border bg-card px-2 text-sm" value="" onChange={(e) => e.target.value && run(crmEnrollCadence(e.target.value, [recordId]), 'Enrolled')}>
          <option value="">Enroll in cadence…</option>{cadences.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
      {tr && <TransitionDialog recordId={recordId} t={tr} fields={fields.filter((f) => tr.requiredFields.includes(f.api))} members={members} toLabel={stateLabels[tr.to] ?? tr.to} onClose={() => setTr(null)} />}
      {decide !== null && approval && <DecideDialog approvalId={approval.id} approve={decide} onClose={() => setDecide(null)} />}
      <span className="hidden">{module}</span>
    </>
  );
}

function TransitionDialog({ recordId, t, fields, members, toLabel, onClose }: { recordId: string; t: BlueprintInfo['transitions'][number]; fields: ClientField[]; members: Member[]; toLabel: string; onClose: () => void }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    const r = await crmTransition(recordId, t.id, { fields: values, note });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success(`Moved to ${toLabel}`);
    onClose();
    router.refresh();
  };
  return (
    <Modal title={t.name} onClose={onClose}>
      <div className="space-y-3">
        {t.message && <p className="rounded-md bg-muted/50 p-2 text-sm">{t.message}</p>}
        {fields.map((f) => (
          <label key={f.api} className="block text-sm"><span className="text-xs font-medium text-muted-foreground">{f.label} *</span>
            <div className="mt-1"><FieldInput field={f} value={values[f.api]} onChange={(v) => setValues((s) => ({ ...s, [f.api]: v }))} refs={{}} members={members} /></div>
          </label>
        ))}
        {<label className="block text-sm"><span className="text-xs font-medium text-muted-foreground">Note{t.noteRequired ? ' *' : ' (optional)'}</span><textarea className={`${area} mt-1`} rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={4000} /></label>}
        <div className="flex justify-end gap-2"><Button onClick={onClose}>Cancel</Button><Button primary onClick={go} disabled={busy}>Move to {toLabel}</Button></div>
      </div>
    </Modal>
  );
}

function DecideDialog({ approvalId, approve, onClose }: { approvalId: string; approve: boolean; onClose: () => void }) {
  const router = useRouter();
  const [comment, setComment] = useState('');
  const go = async () => {
    const r = await crmDecideApproval(approvalId, approve, comment);
    if (!r.ok) return toast.error(r.error);
    toast.success(r.data.status === 'approved' ? 'Approved' : r.data.status === 'rejected' ? 'Rejected' : 'Recorded — waiting for the other approvers');
    onClose();
    router.refresh();
  };
  return (
    <Modal title={approve ? 'Approve' : 'Reject'} onClose={onClose}>
      <textarea className={area} rows={3} placeholder={approve ? 'Comment (optional)' : 'Why? (required)'} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} />
      <div className="mt-3 flex justify-end gap-2"><Button onClick={onClose}>Cancel</Button><Button primary={approve} danger={!approve} onClick={go}>{approve ? 'Approve' : 'Reject'}</Button></div>
    </Modal>
  );
}

/** Overview panel: blueprint progress, approval status, cadences, score. */
export function RecordAutomationPanel({ recordId, blueprint, approval, names, enrollments, score, stateLabels, states }: {
  recordId: string; blueprint: BlueprintInfo | null; approval: ApprovalInfo | null; names: Record<string, string>;
  enrollments: Array<{ cadence_id: string; name: string; status: string; step: number; steps: number; next_at: string | null; exit_reason: string | null }>;
  score: number | null; stateLabels: Record<string, string>; states: string[];
}) {
  const router = useRouter();
  const [why, setWhy] = useState<null | { rule: string; total: number; matched: Array<{ label: string; points: number }> }>(null);
  if (!blueprint && !approval && !enrollments.length && score === null) return null;
  const loadWhy = async () => {
    const r = await crmScoreWhy(recordId);
    if (!r.ok) return toast.error(r.error);
    if (r.data) setWhy(r.data);
  };
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4 text-sm">
      {blueprint && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Blueprint · {blueprint.name}{blueprint.done ? ' · finished' : ''}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {states.map((s, i) => (
              <span key={s} className={`rounded-full px-2 py-0.5 text-xs ${s === blueprint.state ? 'bg-navy text-navy-foreground' : 'bg-muted text-muted-foreground'}`}>{i > 0 && <span className="mr-1 opacity-50">›</span>}{stateLabels[s] ?? s}</span>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">In “{stateLabels[blueprint.state] ?? blueprint.state}” since {fmtDate(blueprint.enteredAt)}.{!blueprint.done && !blueprint.transitions.length ? ' No transition is available to you from here.' : ''}</p>
        </div>
      )}
      {approval && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Approval · {approval.status}{approval.status === 'pending' ? ` · stage ${approval.stage + 1}` : ''}</p>
          {approval.status === 'pending' && <p className="mt-1 text-xs">Waiting for: {approval.approvers.filter((a) => !approval.approved_by.includes(a)).map((a) => names[a] ?? 'someone').join(', ') || '—'}</p>}
          <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">{approval.history.slice(-5).map((h, i) => <li key={i}>{fmtDate(h.at)} · {h.event}{h.by ? ` by ${names[h.by] ?? 'someone'}` : ''}{h.comment ? ` — “${h.comment}”` : ''}</li>)}</ul>
        </div>
      )}
      {enrollments.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cadences</p>
          {enrollments.map((e) => (
            <p key={e.cadence_id} className="mt-1 text-xs">{e.name}: {e.status === 'active' ? `step ${e.step + 1} of ${e.steps}, next ${fmtDate(e.next_at)}` : `${e.status}${e.exit_reason ? ` (${e.exit_reason})` : ''}`}
              {e.status === 'active' && <button type="button" className="ml-2 text-navy hover:underline" onClick={async () => { const r = await crmUnenrollCadence(e.cadence_id, recordId); if (!r.ok) toast.error(r.error); else router.refresh(); }}>remove</button>}</p>
          ))}
        </div>
      )}
      {score !== null && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</p>
          <p className="mt-1"><span className="text-lg font-semibold">{score}</span> <button type="button" className="ml-2 text-xs text-navy hover:underline" onClick={loadWhy}>Why?</button></p>
          {why && <ul className="mt-1 space-y-0.5 text-xs">{why.matched.map((m, i) => <li key={i} className={m.points < 0 ? 'text-destructive' : ''}>{m.points > 0 ? '+' : ''}{m.points} · {m.label}</li>)}{!why.matched.length && <li className="text-muted-foreground">No rule matches yet.</li>}</ul>}
        </div>
      )}
    </section>
  );
}

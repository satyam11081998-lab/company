'use client';

/**
 * Privacy console — Digital Personal Data Protection Act, 2023.
 * Rights requests with due dates and the action each needs, the breach
 * register with its 72-hour clock, and a compliance overview.
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { pvAccessExport, pvCorrection, pvCreateRequest, pvErase, pvRestrict, pvSaveBreach, pvUpdateRequest, pvWithdraw } from '@/app/(app)/crm/insight-actions';
import { PURPOSES, PURPOSE_LABEL, REQUEST_KINDS, REQUEST_LABEL } from '@/lib/crm/privacy';
import { Button, Card, Field, Modal, Stat, area, fmtDate, inp } from '../ui';
import { download } from './report-builder';

/* eslint-disable @typescript-eslint/no-explicit-any */
type A = any;
const TABS = [['overview', 'Overview'], ['requests', 'Rights requests'], ['breaches', 'Breach register'], ['guide', 'How this maps to the Act']] as const;
const STATUS_TONE: Record<string, string> = { open: 'bg-warning-soft', in_progress: 'bg-muted', completed: 'bg-success/10', rejected: 'bg-muted' };

export default function PrivacyConsole({ overview, requests, breaches, names, initialTab, prefill }: { overview: A; requests: A[]; breaches: A[]; names: Record<string, string>; initialTab: string; prefill: { recordId: string; kind: string } | null }) {
  const [tab, setTab] = useState(initialTab);
  const o = overview;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Privacy (DPDP Act 2023)</h1>
        <p className="text-sm text-muted-foreground">Consent, data principal rights, erasure and breaches — every action here is recorded in the audit log.</p>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border" role="tablist">
        {TABS.map(([k, label]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-3 py-2 text-sm ${tab === k ? 'border-navy font-medium text-navy' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{label}{k === 'requests' && o.openRequests ? ` (${o.openRequests})` : ''}{k === 'breaches' && o.openBreaches ? ` (${o.openBreaches})` : ''}</button>)}
      </div>
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="People (contacts + leads)" value={o.people.toLocaleString('en-IN')} />
            <Stat label="Processing basis recorded" value={o.people ? `${Math.round((o.basisSet / o.people) * 100)}%` : '—'} hint={`${o.basisSet} with consent or a legitimate use`} tone={o.people && o.basisSet / o.people < 0.5 ? 'warn' : undefined} />
            <Stat label="Marketing consent given" value={o.marketingGiven} hint={`${o.marketingWithdrawn} withdrawn`} />
            <Stat label="Opted out of AI profiling" value={o.profilingWithdrawn} hint="never scored" />
            <Stat label="Open rights requests" value={o.openRequests} tone={o.overdueRequests ? 'bad' : undefined} hint={o.overdueRequests ? `${o.overdueRequests} overdue` : 'none overdue'} />
            <Stat label="Processing restricted" value={o.restricted} />
            <Stat label="Erased" value={o.erased} hint={`${o.blocked} email(s) blocked from re-import`} />
            <Stat label="Open breaches" value={o.openBreaches} tone={o.breachesLate ? 'bad' : undefined} hint={o.breachesLate ? `${o.breachesLate} past the 72-hour report deadline` : undefined} />
          </div>
          <Card title="Safeguards that run automatically">
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Every customer email waits in the Outbox for approval; consent, opt-outs, restrictions and erasures are re-checked at the moment of sending.</li>
              <li>Withdrawing marketing consent cancels queued marketing email and stops cadences at once.</li>
              <li>People who opted out of AI profiling are never scored; their scores are cleared.</li>
              <li>AI-suggested next actions that contact a customer are blocked without marketing consent.</li>
              <li>Web forms record the exact consent text shown, per purpose; IP addresses are stored only as a keyed hash.</li>
              <li>The audit log is append-only; on erasure, its values are redacted but who did what, and when, is kept.</li>
            </ul>
          </Card>
        </div>
      )}
      {tab === 'requests' && <Requests requests={requests} names={names} prefill={prefill} />}
      {tab === 'breaches' && <Breaches breaches={breaches} />}
      {tab === 'guide' && (
        <Card title="Sections of the Act and where they live in this CRM">
          <table className="w-full text-sm"><tbody>
            {[
              ['s.4–6 Lawful processing and consent', 'Processing basis field on every person; consent ledger per purpose (marketing, service, analytics, AI profiling) with the notice text, channel and time; withdrawal as easy as giving (any editor can record it).'],
              ['s.7 Legitimate uses', '“Legitimate use (s.7)” basis — e.g. a customer who bought a plan and needs service emails.'],
              ['s.8 Duties of a Data Fiduciary', 'Field-level security, role hierarchy and sharing rules; append-only audit log; erasure when the purpose is served (s.8(7)) keeping only what tax law requires; breach register.'],
              ['s.8(6) Breach intimation', 'Breach register with a 72-hour clock to the detailed report to the Data Protection Board, and a record of when affected people were told.'],
              ['s.11 Right to access', 'One-click export of everything held about the person — records, notes, consents, emails, survey answers — as a JSON file.'],
              ['s.12 Correction and erasure', 'Correction creates a task for the record owner; erasure blanks personal fields, deletes notes, attachments and email contents, redacts the audit trail and blocks the email from re-import.'],
              ['s.13 Grievance redressal', 'Grievance requests with a due date and a written resolution.'],
              ['s.14 Nomination', 'Nomination requests recorded with the nominee in the resolution.'],
            ].map(([a, b]) => <tr key={a} className="border-t border-border align-top"><td className="w-56 py-2 pr-3 font-medium">{a}</td><td className="py-2 text-muted-foreground">{b}</td></tr>)}
          </tbody></table>
          <p className="mt-3 text-xs text-muted-foreground">Response windows default to 30 days (7 for withdrawal and restriction) and can be tightened case by case. This is a tool, not legal advice; confirm time limits against the notified DPDP Rules.</p>
        </Card>
      )}
    </div>
  );
}

function Requests({ requests, names, prefill }: { requests: A[]; names: Record<string, string>; prefill: { recordId: string; kind: string } | null }) {
  const router = useRouter();
  const [form, setForm] = useState<A>(prefill ? { kind: prefill.kind, recordId: prefill.recordId, requesterEmail: '', details: '' } : null);
  const [open, setOpen] = useState<A>(null);
  const [filter, setFilter] = useState('active');
  const list = requests.filter((r) => filter === 'all' || (filter === 'active' ? ['open', 'in_progress'].includes(r.status) : r.status === filter));
  const create = async () => {
    const r = await pvCreateRequest(form);
    if (!r.ok) return toast.error(r.error);
    toast.success('Request logged');
    setForm(null);
    router.replace('/crm/privacy?tab=requests');
    router.refresh();
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <select className="h-8 rounded-md border border-border bg-background px-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Status filter">
          <option value="active">Open and in progress</option><option value="completed">Completed</option><option value="rejected">Rejected</option><option value="all">All</option>
        </select>
        {!form && <Button primary onClick={() => setForm({ kind: 'access', requesterEmail: '', details: '' })}>Log a request</Button>}
      </div>
      {form && (
        <Card title="New rights request">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Type"><select className={inp} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>{REQUEST_KINDS.map((k) => <option key={k} value={k}>{REQUEST_LABEL[k]}</option>)}</select></Field>
            <Field label="Requester’s email" hint={form.recordId ? 'Linked to the record you came from.' : 'We link it to a matching contact or lead.'}><input className={inp} type="email" value={form.requesterEmail} onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })} maxLength={254} /></Field>
            <div className="md:col-span-2"><Field label="Details (what they asked, how identity was verified)"><textarea className={area} rows={3} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} maxLength={4000} /></Field></div>
          </div>
          <div className="mt-3 flex justify-end gap-2"><Button onClick={() => setForm(null)}>Cancel</Button><Button primary onClick={create}>Log request</Button></div>
        </Card>
      )}
      <Card>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-1 font-medium">Received</th><th className="font-medium">Type</th><th className="font-medium">Person</th><th className="font-medium">Due</th><th className="font-medium">Status</th><th /></tr></thead>
          <tbody>{list.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="py-1.5">{fmtDate(r.created_at)}</td>
              <td>{REQUEST_LABEL[r.kind as keyof typeof REQUEST_LABEL]?.split(' —')[0].split(' (')[0] ?? r.kind}</td>
              <td>{r.record ? <Link className="text-navy hover:underline" href={`/crm/m/${r.record.module}/${r.record.id}`}>{r.record.name}</Link> : r.requester_email ?? '—'}</td>
              <td className={r.overdue ? 'font-medium text-destructive' : ''}>{r.due_at ? fmtDate(r.due_at) : '—'}{r.overdue ? ' (overdue)' : ''}</td>
              <td><span className={`rounded px-1.5 py-0.5 text-xs ${STATUS_TONE[r.status] ?? ''}`}>{r.status.replace('_', ' ')}</span></td>
              <td className="text-right"><Button small onClick={() => setOpen(r)}>Open</Button></td>
            </tr>
          ))}{!list.length && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">No requests.</td></tr>}</tbody>
        </table></div>
      </Card>
      {open && <RequestModal r={open} names={names} onClose={() => { setOpen(null); router.refresh(); }} />}
    </div>
  );
}

function RequestModal({ r, names, onClose }: { r: A; names: Record<string, string>; onClose: () => void }) {
  const [resolution, setResolution] = useState(r.resolution ?? '');
  const [purposes, setPurposes] = useState<string[]>(['marketing']);
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const closed = r.status === 'completed' || r.status === 'rejected';
  const act = async (fn: () => Promise<A>, ok: (d: A) => string) => {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(ok(res.data));
    return res.data ?? true;
  };
  const exportJson = async () => {
    const d = await act(() => pvAccessExport(r.id), () => 'Export ready');
    if (d) download(d.filename, d.json, 'application/json');
  };
  const setStatus = async (status: string) => { if (await act(() => pvUpdateRequest(r.id, { status, resolution }), () => 'Updated')) onClose(); };
  return (
    <Modal title={REQUEST_LABEL[r.kind as keyof typeof REQUEST_LABEL] ?? r.kind} onClose={onClose} wide>
      <div className="space-y-3 text-sm">
        <p className="text-muted-foreground">Received {fmtDate(r.created_at)}{r.created_by ? ` by ${names[r.created_by] ?? 'former user'}` : ''} · due {r.due_at ? fmtDate(r.due_at) : '—'} · {r.status.replace('_', ' ')}</p>
        {r.details && <p className="whitespace-pre-wrap rounded bg-muted/50 p-2">{r.details}</p>}
        {!closed && (
          <Card title="Action">
            {r.kind === 'access' && <><p className="mb-2 text-muted-foreground">Download everything held about this person and send it to them through a verified channel.</p><Button primary onClick={exportJson} disabled={busy}>Download personal data (JSON)</Button></>}
            {r.kind === 'correction' && <><p className="mb-2 text-muted-foreground">Creates a high-priority task for the record owner with the details above.</p><Button primary onClick={() => act(() => pvCorrection(r.id), () => 'Task created')} disabled={busy}>Create correction task</Button></>}
            {r.kind === 'restrict' && <><p className="mb-2 text-muted-foreground">Locks the person’s records, cancels queued email, pauses cadences and stops AI scoring until this request is closed.</p><Button primary onClick={() => act(() => pvRestrict(r.id), (d) => `${d.restricted} record(s) restricted`)} disabled={busy}>Restrict processing</Button></>}
            {r.kind === 'withdraw_consent' && (
              <>
                <p className="mb-2 text-muted-foreground">Records a withdrawal for each purpose on every matching contact and lead.</p>
                <div className="mb-2 flex flex-wrap gap-3">{PURPOSES.map((p) => <label key={p} className="flex items-center gap-1.5"><input type="checkbox" checked={purposes.includes(p)} onChange={(e) => setPurposes(e.target.checked ? [...purposes, p] : purposes.filter((x) => x !== p))} />{PURPOSE_LABEL[p]}</label>)}</div>
                <Button primary onClick={() => act(() => pvWithdraw(r.id, purposes), (d) => `Withdrawn on ${d.records} record(s)`)} disabled={busy || !purposes.length}>Record withdrawal</Button>
              </>
            )}
            {r.kind === 'erasure' && (
              <div className="space-y-2">
                <p className="text-muted-foreground">Permanently blanks this person’s personal data on their contact/lead and every related deal, invoice, case and activity; deletes notes, attachments and email contents; redacts the audit trail; blocks the email from coming back through the sync or imports. Amounts, dates and invoice numbers stay for tax records. <strong className="text-foreground">This cannot be undone.</strong></p>
                <Field label="Type ERASE to confirm"><input className={inp} value={confirmText} onChange={(e) => setConfirmText(e.target.value)} /></Field>
                <Button danger onClick={async () => { const d = await act(() => pvErase(r.id, confirmText), (x) => `Erased ${x.people} person record(s) and ${x.related} related record(s)`); if (d) onClose(); }} disabled={busy || confirmText !== 'ERASE'}>Erase now</Button>
              </div>
            )}
            {(r.kind === 'grievance' || r.kind === 'nomination') && <p className="text-muted-foreground">Handle it with the person, then write the outcome below{r.kind === 'nomination' ? ' (include the nominee’s name and contact)' : ''} and close the request.</p>}
          </Card>
        )}
        <Field label="Resolution (what was done and told to the person)"><textarea className={area} rows={4} value={resolution} onChange={(e) => setResolution(e.target.value)} maxLength={4000} disabled={closed && r.kind === 'erasure'} /></Field>
        <div className="flex flex-wrap justify-end gap-2">
          {!closed && <Button onClick={() => setStatus('rejected')} disabled={busy}>Reject</Button>}
          {!closed && <Button onClick={() => setStatus('in_progress')} disabled={busy}>Save as in progress</Button>}
          {!closed && <Button primary onClick={() => setStatus('completed')} disabled={busy}>Complete</Button>}
          {closed && r.kind !== 'erasure' && <Button onClick={() => setStatus(r.status)} disabled={busy}>Save resolution</Button>}
        </div>
      </div>
    </Modal>
  );
}

function Breaches({ breaches }: { breaches: A[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<A>(null);
  const toLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + 330 * 60_000).toISOString().slice(0, 16) : '');
  const fromLocal = (v: string) => (v ? new Date(`${v}:00+05:30`).toISOString() : '');
  const save = async () => {
    const r = await pvSaveBreach({ ...edit, detectedAt: fromLocal(edit.detectedAtLocal), boardNotifiedAt: fromLocal(edit.boardLocal), principalsNotifiedAt: fromLocal(edit.principalsLocal), dataCategories: String(edit.categories ?? '').split(',').map((s: string) => s.trim()).filter(Boolean) });
    if (!r.ok) return toast.error(r.error);
    toast.success('Saved');
    setEdit(null);
    router.refresh();
  };
  const open = (b: A | null) => setEdit(b ? { id: b.id, title: b.title, description: b.description ?? '', severity: b.severity, status: b.status, peopleAffected: b.people_affected ?? '', categories: (b.data_categories ?? []).join(', '), actionsTaken: b.actions_taken ?? '', detectedAtLocal: toLocal(b.detected_at), boardLocal: toLocal(b.board_notified_at), principalsLocal: toLocal(b.principals_notified_at) }
    : { title: '', description: '', severity: 'medium', status: 'open', peopleAffected: '', categories: '', actionsTaken: '', detectedAtLocal: toLocal(new Date().toISOString()), boardLocal: '', principalsLocal: '' });
  return (
    <div className="space-y-4">
      <div className="flex justify-end">{!edit && <Button primary onClick={() => open(null)}>Log a breach</Button>}</div>
      {edit && (
        <Card title={edit.id ? 'Update breach' : 'New breach'}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="md:col-span-2"><Field label="Title"><input className={inp} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} maxLength={200} /></Field></div>
            <Field label="Detected at (IST)"><input className={inp} type="datetime-local" value={edit.detectedAtLocal} onChange={(e) => setEdit({ ...edit, detectedAtLocal: e.target.value })} /></Field>
            <Field label="Severity"><select className={inp} value={edit.severity} onChange={(e) => setEdit({ ...edit, severity: e.target.value })}>{['low', 'medium', 'high', 'critical'].map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
            <Field label="Status"><select className={inp} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{['open', 'contained', 'closed'].map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
            <Field label="People affected"><input className={inp} type="number" min={0} value={edit.peopleAffected} onChange={(e) => setEdit({ ...edit, peopleAffected: e.target.value })} /></Field>
            <div className="md:col-span-3"><Field label="Data involved (comma-separated)"><input className={inp} value={edit.categories} onChange={(e) => setEdit({ ...edit, categories: e.target.value })} placeholder="email, phone, payment status" /></Field></div>
            <div className="md:col-span-3"><Field label="What happened"><textarea className={area} rows={3} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} maxLength={8000} /></Field></div>
            <div className="md:col-span-3"><Field label="Actions taken"><textarea className={area} rows={3} value={edit.actionsTaken} onChange={(e) => setEdit({ ...edit, actionsTaken: e.target.value })} maxLength={8000} /></Field></div>
            <Field label="Board notified at (IST)"><input className={inp} type="datetime-local" value={edit.boardLocal} onChange={(e) => setEdit({ ...edit, boardLocal: e.target.value })} /></Field>
            <Field label="Affected people told at (IST)"><input className={inp} type="datetime-local" value={edit.principalsLocal} onChange={(e) => setEdit({ ...edit, principalsLocal: e.target.value })} /></Field>
          </div>
          <div className="mt-3 flex justify-end gap-2"><Button onClick={() => setEdit(null)}>Cancel</Button><Button primary onClick={save}>Save</Button></div>
        </Card>
      )}
      <Card>
        <table className="w-full text-sm"><tbody>{breaches.map((b) => (
          <tr key={b.id} className="border-t border-border first:border-0">
            <td className="py-2"><p className="font-medium">{b.title}</p><p className="text-xs text-muted-foreground">detected {fmtDate(b.detected_at)} · {b.severity} · {b.status}{b.people_affected !== null ? ` · ${b.people_affected} people` : ''}</p></td>
            <td className="text-xs">{b.board_notified_at ? <span className={b.clock.late ? 'text-destructive' : 'text-success'}>Board told {fmtDate(b.board_notified_at)}{b.clock.late ? ' (after 72 h)' : ''}</span> : b.clock.late ? <span className="font-medium text-destructive">Board report overdue (deadline {fmtDate(b.clock.deadline)})</span> : <span className="font-medium text-warning-foreground">{b.clock.hoursLeft} h left to report to the Board</span>}</td>
            <td className="text-right"><Button small onClick={() => open(b)}>Update</Button></td>
          </tr>
        ))}{!breaches.length && <tr><td className="py-6 text-center text-muted-foreground">No breaches recorded.</td></tr>}</tbody></table>
      </Card>
    </div>
  );
}

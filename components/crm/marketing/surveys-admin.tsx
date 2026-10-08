'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { mktSaveSurvey, mktSendSurvey } from '@/app/(app)/crm/mkt-actions';
import type { ClientField } from '@/lib/crm/client-types';
import type { SurveyConfig } from '@/lib/crm/surveys';
import type { Criteria } from '@/lib/crm/types';
import { CriteriaBuilder } from '../criteria-builder';
import type { Member } from '../field-input';
import { Bars, Button, Card, Field, Modal, Stat, area, fmtDate, inp } from '../ui';

interface S { id: string; name: string; active: boolean; config: SurveyConfig }
interface Summary { kind: string; responses: number; score: number | null; breakdown: Record<string, number>; easyPct?: number | null }
interface R { summary: Summary; invited: number; sent: number; answered: number; responseRate: number | null; trend: Array<Summary & { month: string }>; recent: Array<{ score: number; comment: string; sentiment: string | null; at: string; recordId: string | null }> }

const scoreLabel = (k: string, v: number | null) => (v === null ? '—' : k === 'nps' ? `${v > 0 ? '+' : ''}${v}` : k === 'csat' ? `${v}%` : `${v} / 7`);

export default function SurveysAdmin({ surveys, results, fields, members, canManage }: { surveys: S[]; results: Record<string, R>; fields: Record<string, ClientField[]>; members: Member[]; canManage: boolean }) {
  const [editing, setEditing] = useState<S | null>(null);
  const [sending, setSending] = useState<S | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Surveys — NPS, CSAT, CES</h1>
          <p className="text-sm text-muted-foreground">Invites go through the Outbox. Answers update the contact (and case), and every detractor opens a follow-up task for the owner.</p>
        </div>
        {canManage && <Button primary onClick={() => setEditing({ id: '', name: '', active: true, config: { kind: 'nps', question: '', followUp: '', thankYou: '', inviteSubject: '', inviteBody: '', category: 'marketing' } })}>+ New survey</Button>}
      </div>
      {surveys.map((s) => {
        const r = results[s.id];
        const k = s.config.kind;
        const bd = r?.summary.breakdown ?? {};
        return (
          <Card key={s.id} title={<span className="normal-case tracking-normal text-foreground">{s.name} <span className="text-muted-foreground">· {k.toUpperCase()}{!s.active ? ' · off' : ''}</span></span>}
            actions={canManage ? <><Button small onClick={() => setSending(s)} disabled={!s.active}>Send…</Button><Button small onClick={() => setEditing(s)}>Edit</Button></> : null}>
            <p className="mb-3 text-sm text-muted-foreground">“{s.config.question}”</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label={k === 'nps' ? 'NPS' : k === 'csat' ? 'CSAT (4–5 share)' : 'CES (mean)'} value={scoreLabel(k, r?.summary.score ?? null)} tone={k === 'nps' ? ((r?.summary.score ?? 0) >= 30 ? 'good' : (r?.summary.score ?? 0) < 0 ? 'bad' : undefined) : undefined} hint={k === 'ces' && r?.summary.easyPct != null ? `${r.summary.easyPct}% found it easy (5–7)` : undefined} />
              <Stat label="Answers" value={r?.answered ?? 0} />
              <Stat label="Invites sent" value={r?.sent ?? 0} hint={`${r?.invited ?? 0} created`} />
              <Stat label="Response rate" value={r?.responseRate === null || r?.responseRate === undefined ? '—' : `${r.responseRate}%`} />
            </div>
            {r && r.answered > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Breakdown</p>
                  {k === 'nps'
                    ? <Bars data={[{ label: 'Promoters (9–10)', value: bd.promoter ?? 0, tone: 'bg-viz-good' }, { label: 'Passives (7–8)', value: bd.passive ?? 0 }, { label: 'Detractors (0–6)', value: bd.detractor ?? 0, tone: 'bg-viz-critical' }]} />
                    : <Bars data={Object.entries(bd).map(([label, value]) => ({ label, value }))} />}
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">By month</p>
                  <table className="w-full text-xs"><tbody>{r.trend.slice(-8).map((t) => <tr key={t.month} className="border-b border-border/60"><td className="py-1">{t.month}</td><td className="py-1 text-right tabular-nums">{scoreLabel(k, t.score)}</td><td className="py-1 text-right text-muted-foreground">{t.responses} answers</td></tr>)}</tbody></table>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Latest comments</p>
                  <ul className="max-h-48 space-y-1.5 overflow-y-auto text-xs">
                    {r.recent.map((c, i) => (
                      <li key={i} className="rounded border border-border p-1.5">
                        <span className={`mr-1 rounded px-1 ${c.sentiment === 'negative' ? 'bg-destructive/10 text-destructive' : c.sentiment === 'positive' ? 'bg-success-soft' : 'bg-muted'}`}>{c.score}</span>
                        {c.comment}
                        <span className="block text-[10px] text-muted-foreground">{fmtDate(c.at)}{c.recordId && <> · <Link className="text-navy hover:underline" href={`/crm/m/contacts/${c.recordId}`}>open</Link></>}</span>
                      </li>
                    ))}
                    {!r.recent.length && <li className="text-muted-foreground">No comments yet.</li>}
                  </ul>
                </div>
              </div>
            )}
          </Card>
        );
      })}
      {editing && <Editor s={editing} onClose={() => setEditing(null)} />}
      {sending && <SendDialog s={sending} fields={fields} members={members} onClose={() => setSending(null)} />}
    </div>
  );
}

function Editor({ s, onClose }: { s: S; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(s.name);
  const [active, setActive] = useState(s.active);
  const [c, setC] = useState<SurveyConfig>(s.config);
  const upd = (p: Partial<SurveyConfig>) => setC((x) => ({ ...x, ...p }));
  const save = async () => {
    const r = await mktSaveSurvey({ id: s.id || null, name, active, config: c });
    if (!r.ok) return toast.error(r.error);
    toast.success('Survey saved');
    onClose();
    router.refresh();
  };
  return (
    <Modal title={s.id ? 'Edit survey' : 'New survey'} onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Name"><input className={inp} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /></Field>
          <Field label="Kind"><select className={inp} value={c.kind} disabled={!!s.id} onChange={(e) => upd({ kind: e.target.value as SurveyConfig['kind'] })}><option value="nps">NPS (0–10)</option><option value="csat">CSAT (1–5)</option><option value="ces">CES (1–7)</option></select></Field>
          <Field label="Active"><select className={inp} value={active ? '1' : '0'} onChange={(e) => setActive(e.target.value === '1')}><option value="1">On</option><option value="0">Off</option></select></Field>
        </div>
        <Field label="Question"><input className={inp} value={c.question} onChange={(e) => upd({ question: e.target.value })} maxLength={300} /></Field>
        <Field label="Follow-up (free text)"><input className={inp} value={c.followUp} onChange={(e) => upd({ followUp: e.target.value })} maxLength={300} /></Field>
        <Field label="Thank-you message"><input className={inp} value={c.thankYou} onChange={(e) => upd({ thankYou: e.target.value })} maxLength={500} /></Field>
        <Field label="Invite subject"><input className={inp} value={c.inviteSubject} onChange={(e) => upd({ inviteSubject: e.target.value })} maxLength={200} /></Field>
        <Field label="Invite text (the score buttons are added below it)"><textarea className={area} rows={5} value={c.inviteBody} onChange={(e) => upd({ inviteBody: e.target.value })} maxLength={4000} /></Field>
        <Field label="Type" hint="Service surveys follow a support case; marketing surveys skip anyone who opted out."><select className={inp} value={c.category} onChange={(e) => upd({ category: e.target.value as 'marketing' | 'service' })}><option value="marketing">Marketing / relationship</option><option value="service">Service (after a case)</option></select></Field>
        <div className="flex justify-end gap-2"><Button onClick={onClose}>Cancel</Button><Button primary onClick={save}>Save</Button></div>
      </div>
    </Modal>
  );
}

function SendDialog({ s, fields, members, onClose }: { s: S; fields: Record<string, ClientField[]>; members: Member[]; onClose: () => void }) {
  const [module, setModule] = useState<'contacts' | 'leads'>('contacts');
  const [criteria, setCriteria] = useState<Criteria | null>({ match: 'all', conditions: [{ field: 'mece_internal', op: 'neq', value: true }, { field: 'mece_last_active_at', op: 'in_last_days', value: 60 }] });
  const [period, setPeriod] = useState<'once' | 'month' | 'quarter'>('quarter');
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    const r = await mktSendSurvey({ surveyId: s.id, module, criteria, period });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success(`${r.data.queued} invites waiting in the Outbox${r.data.suppressed ? `, ${r.data.suppressed} skipped (opted out)` : ''}${r.data.duplicate ? `, ${r.data.duplicate} already invited this period` : ''}`);
    onClose();
  };
  return (
    <Modal title={`Send “${s.name}”`} onClose={onClose} wide>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Send to"><select className={inp} value={module} onChange={(e) => { setModule(e.target.value as 'contacts' | 'leads'); setCriteria(null); }}><option value="contacts">Contacts</option><option value="leads">Leads</option></select></Field>
          <Field label="At most one invite per person per"><select className={inp} value={period} onChange={(e) => setPeriod(e.target.value as 'once' | 'month' | 'quarter')}><option value="month">month</option><option value="quarter">quarter</option><option value="once">ever</option></select></Field>
        </div>
        <CriteriaBuilder fields={fields[module] ?? []} value={criteria} onChange={setCriteria} members={members} />
        <p className="text-xs text-muted-foreground">Invites are queued for approval in the Outbox; nothing is sent until someone approves.</p>
        <div className="flex justify-end gap-2"><Button onClick={onClose}>Cancel</Button><Button primary onClick={go} disabled={busy}>Queue invites</Button></div>
      </div>
    </Modal>
  );
}

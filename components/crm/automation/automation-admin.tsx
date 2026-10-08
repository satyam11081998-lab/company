'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { autoDeleteRule, autoRunNow, autoSaveRule, autoSetActive, autoTestWebhook } from '@/app/(app)/crm/auto-actions';
import type {
  Action, ApprovalConfig, AssignmentConfig, BlueprintConfig, CadenceConfig, LayoutRuleConfig, MacroConfig, ScoringConfig, Transition, ValidationConfig, WebhookConfig, WorkflowConfig,
} from '@/lib/crm/automation';
import type { Criteria } from '@/lib/crm/types';
import { CriteriaBuilder } from '../criteria-builder';
import { Button, Card, Field, Modal, fmtDate, inp } from '../ui';
import { ActionsEditor, writable, type Refs } from './actions-editor';

import { TABS } from './tabs';
export { TABS };

interface Rule { id: string; kind: string; module: string | null; name: string; active: boolean; config: Record<string, unknown>; updated_at: string }
interface Overview {
  runs: Array<{ id: number; at: string; action: string; module: string | null; record_id: string | null; meta: Record<string, unknown> }>;
  jobs: { pending: number; failed: Array<{ kind: string; error: string | null; at: string }>; next: string | null };
  webhooks: Array<{ webhook_id: string; host: string; status: number | null; ok: boolean; ms: number; error: string | null; at: string }>;
  enrollment: Record<string, Record<string, number>>;
}

const label = (refs: Refs, m: string | null | undefined) => refs.modules.find((x) => x.api === m)?.label ?? m ?? '';

export default function AutomationAdmin({ tab, rules, refs, overview }: { tab: string; rules: Rule[]; refs: Refs; overview: Overview | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState<{ kind: string; rule: Rule | null } | null>(null);
  const info = TABS.find((t) => t.key === tab)!;
  const toggle = async (r: Rule) => {
    const res = await autoSetActive(r.id, !r.active);
    if (!res.ok) return toast.error(res.error);
    router.refresh();
  };
  const runNow = async () => {
    const r = await autoRunNow();
    if (!r.ok) return toast.error(r.error);
    toast.success(`Ran ${r.data.jobs} scheduled action(s), ${r.data.cadenceSteps} cadence step(s), ${r.data.dateFired} date rule firing(s)`);
    router.refresh();
  };
  const kindsHere = tab === 'rules' ? ['validation_rule', 'layout_rule'] : [tab];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Automation</h1>
          <p className="text-sm text-muted-foreground">{info.text}</p>
        </div>
        <div className="flex gap-2">
          <Button small onClick={runNow}>Run due jobs now</Button>
          {tab !== 'activity' && kindsHere.map((k) => <Button key={k} primary small onClick={() => setEditing({ kind: k, rule: null })}>+ New {k === 'layout_rule' ? 'layout rule' : k === 'validation_rule' ? 'validation rule' : info.label.replace(/s$/, '').toLowerCase()}</Button>)}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border text-sm">
        {TABS.map((t) => (
          <Link key={t.key} href={`/crm/automation?tab=${t.key}`} className={`-mb-px border-b-2 px-3 py-2 ${tab === t.key ? 'border-navy font-medium text-navy' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t.label}</Link>
        ))}
      </div>
      {tab === 'activity' && overview && <Activity overview={overview} />}
      {tab !== 'activity' && (
        <div className="space-y-2">
          {rules.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium">{r.name} <span className="text-xs font-normal text-muted-foreground">· {label(refs, (r.config.module as string) ?? r.module)}{tab === 'rules' ? ` · ${r.kind === 'layout_rule' ? 'layout' : 'validation'}` : ''}</span></p>
                <p className="truncate text-xs text-muted-foreground">{summary(r, refs)}</p>
                {r.kind === 'cadence' && overview?.enrollment[r.id] && <p className="text-xs text-muted-foreground">Enrolled: {Object.entries(overview.enrollment[r.id]).map(([k, v]) => `${v} ${k}`).join(' · ')}</p>}
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={r.active} onChange={() => toggle(r)} />{r.active ? 'On' : 'Off'}</label>
                <Button small onClick={() => setEditing({ kind: r.kind, rule: r })}>Edit</Button>
              </div>
            </div>
          ))}
          {!rules.length && <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nothing yet.</p>}
          {tab === 'webhook' && overview && <WebhookLog overview={overview} />}
        </div>
      )}
      {editing && <Editor kind={editing.kind} rule={editing.rule} refs={refs} onClose={() => setEditing(null)} />}
    </div>
  );
}

function summary(r: Rule, refs: Refs): string {
  const c = r.config as Record<string, any>;
  switch (r.kind) {
    case 'workflow': {
      const t = c.trigger ?? {};
      const when = t.type === 'field_update' ? `when ${(t.fields ?? []).join(', ')} change` : t.type === 'date' ? `${Math.abs(t.date?.offsetDays ?? 0)} days ${t.date?.offsetDays < 0 ? 'before' : 'after'} ${t.date?.field}${t.date?.repeat === 'yearly' ? ' (yearly)' : ''}` : t.type === 'score' ? `when the score ${t.score === 'any' ? 'changes' : t.score + 's'}` : `on ${String(t.type).replace(/_/g, ' ')}`;
      return `${when} · ${(c.conditions ?? []).length} condition(s)`;
    }
    case 'blueprint': return `${c.field}: ${(c.states ?? []).length} states, ${(c.transitions ?? []).length} transitions${(c.sla ?? []).length ? `, ${c.sla.length} SLA` : ''}`;
    case 'approval_process': return `${c.trigger} · ${(c.stages ?? []).length} stage(s)`;
    case 'assignment_rule': return `${(c.entries ?? []).length} entr(ies) · applies to ${(c.applyTo ?? []).join(', ')}`;
    case 'scoring_rule': return `${(c.rules ?? []).length} rule(s) · touchpoints ${Object.entries(c.touchpoints ?? {}).filter(([, v]) => v).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}`;
    case 'validation_rule': return `“${c.message}”`;
    case 'layout_rule': return `show ${(c.show ?? []).join(', ') || '—'} · require ${(c.require ?? []).join(', ') || '—'}`;
    case 'macro': return `${(c.actions ?? []).length} action(s)`;
    case 'cadence': return `${(c.steps ?? []).length} step(s)${c.autoEnroll ? ' · auto-enrol' : ''}`;
    case 'webhook': return String(c.url ?? '');
  }
  void refs;
  return '';
}

function Activity({ overview }: { overview: Overview }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card title="Scheduled jobs"><p className="text-2xl font-semibold">{overview.jobs.pending}</p><p className="text-xs text-muted-foreground">waiting{overview.jobs.next ? ` · next ${fmtDate(overview.jobs.next)}` : ''}</p></Card>
        <Card title="Failed jobs"><p className="text-2xl font-semibold">{overview.jobs.failed.length}</p>{overview.jobs.failed.slice(0, 3).map((f, i) => <p key={i} className="truncate text-xs text-destructive">{f.kind}: {f.error}</p>)}</Card>
        <Card title="Webhook calls (latest 50)"><p className="text-2xl font-semibold">{overview.webhooks.filter((w) => w.ok).length}/{overview.webhooks.length}</p><p className="text-xs text-muted-foreground">succeeded</p></Card>
      </div>
      <Card title="Recent automation">
        <table className="w-full text-sm"><tbody>{overview.runs.map((r) => {
          const acts = (r.meta?.actions as Array<{ type: string; ok: boolean; error?: string }> | undefined) ?? [];
          return (
            <tr key={r.id} className="border-b border-border/60 align-top">
              <td className="whitespace-nowrap py-1.5 pr-2 text-xs text-muted-foreground">{fmtDate(r.at)}</td>
              <td className="py-1.5 pr-2 text-xs">{r.action.replace(/_/g, ' ')}</td>
              <td className="py-1.5 pr-2">{String(r.meta?.name ?? r.meta?.blueprint ?? r.meta?.process ?? r.meta?.macro ?? r.meta?.cadence ?? r.meta?.rule ?? '')}{r.meta?.transition ? ` → ${String(r.meta.transition)}` : ''}</td>
              <td className="py-1.5 pr-2">{r.record_id && r.module ? <Link className="text-xs text-navy hover:underline" href={`/crm/m/${r.module}/${r.record_id}`}>record</Link> : null}</td>
              <td className="py-1.5 text-xs">{acts.map((a, i) => <span key={i} className={`mr-1 rounded px-1 ${a.ok ? 'bg-success-soft' : 'bg-destructive/10 text-destructive'}`} title={a.error}>{a.type}</span>)}</td>
            </tr>
          );
        })}</tbody></table>
        {!overview.runs.length && <p className="text-sm text-muted-foreground">Nothing has run yet.</p>}
      </Card>
    </div>
  );
}

function WebhookLog({ overview }: { overview: Overview }) {
  if (!overview.webhooks.length) return null;
  return (
    <Card title="Latest webhook calls">
      <table className="w-full text-xs"><tbody>{overview.webhooks.map((w, i) => (
        <tr key={i} className="border-b border-border/60"><td className="py-1 pr-2 text-muted-foreground">{fmtDate(w.at)}</td><td className="py-1 pr-2">{w.host}</td>
          <td className={`py-1 pr-2 ${w.ok ? '' : 'text-destructive'}`}>{w.status ?? '—'} {w.ok ? 'ok' : w.error ?? 'failed'}</td><td className="py-1">{w.ms ?? ''} ms</td></tr>
      ))}</tbody></table>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Editors
// ---------------------------------------------------------------------------

function defaults(kind: string, refs: Refs): Record<string, unknown> {
  const m = 'leads';
  switch (kind) {
    case 'workflow': return { module: m, trigger: { type: 'create' }, conditions: [{ criteria: null, actions: [], scheduled: [] }] } satisfies Partial<WorkflowConfig>;
    case 'blueprint': return { module: 'deals', field: 'stage', criteria: null, states: [], transitions: [], sla: [] };
    case 'approval_process': return { module: 'deals', trigger: 'create_or_edit', criteria: null, stages: [{ approvers: { type: 'manager' }, mode: 'any' }], onApprove: [], onReject: [] };
    case 'assignment_rule': return { module: m, entries: [{ criteria: null, userIds: [] }], fallbackUserId: null, applyTo: ['webform', 'import', 'api'], followUp: null };
    case 'scoring_rule': return { module: m, rules: [], touchpoints: { email_open: 2, email_click: 5, form_submit: 10, survey_answer: 5 } };
    case 'validation_rule': return { module: m, criteria: null, field: '', message: '', on: 'both' };
    case 'layout_rule': return { module: m, when: null, show: [], require: [] };
    case 'macro': return { module: m, actions: [], roleIds: [] };
    case 'cadence': return { module: m, steps: [{ id: 's1', type: 'email', delayDays: 0 }], exitCriteria: null, autoEnroll: null, businessDays: true };
    case 'webhook': return { module: m, url: 'https://', fields: [] };
  }
  void refs;
  return {};
}

function Editor({ kind, rule, refs, onClose }: { kind: string; rule: Rule | null; refs: Refs; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(rule?.name ?? '');
  const [active, setActive] = useState(rule?.active ?? true);
  const [cfg, setCfg] = useState<Record<string, any>>(rule?.config ?? defaults(kind, refs));
  const [busy, setBusy] = useState(false);
  const upd = (p: Record<string, unknown>) => setCfg((c) => ({ ...c, ...p }));
  const save = async (rotateSecret = false) => {
    setBusy(true);
    const r = await autoSaveRule(kind, { id: rule?.id ?? null, name, active, config: cfg, rotateSecret });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success('Saved');
    onClose();
    router.refresh();
  };
  const del = async () => {
    if (!rule || !confirm('Delete this? Pending scheduled actions from it are cancelled.')) return;
    const r = await autoDeleteRule(kind, rule.id);
    if (!r.ok) return toast.error(r.error);
    onClose();
    router.refresh();
  };
  const module = String(cfg.module ?? '');
  const fields = refs.fields[module] ?? [];
  const moduleSelect = (only?: string[]) => (
    <Field label="Module"><select className={inp} value={module} disabled={!!rule && kind === 'blueprint'} onChange={(e) => upd({ ...defaults(kind, refs), module: e.target.value })}>
      {refs.modules.filter((m) => !only || only.includes(m.api)).map((m) => <option key={m.api} value={m.api}>{m.label}</option>)}
    </select></Field>
  );
  const title = TABS.find((t) => t.key === kind)?.label ?? (kind === 'validation_rule' ? 'Validation rule' : 'Layout rule');
  return (
    <Modal title={`${rule ? 'Edit' : 'New'} — ${title.replace(/s$/, '')}`} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Name"><input className={inp} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /></Field>
          {kind === 'cadence' ? moduleSelect(['leads', 'contacts', 'deals', 'accounts']) : kind === 'macro' ? moduleSelect() : moduleSelect()}
          <Field label="Status"><select className={inp} value={active ? '1' : '0'} onChange={(e) => setActive(e.target.value === '1')}><option value="1">On</option><option value="0">Off</option></select></Field>
        </div>
        {kind === 'workflow' && <WorkflowForm cfg={cfg as WorkflowConfig} upd={upd} refs={refs} />}
        {kind === 'blueprint' && <BlueprintForm cfg={cfg as BlueprintConfig} upd={upd} refs={refs} />}
        {kind === 'approval_process' && <ApprovalForm cfg={cfg as ApprovalConfig} upd={upd} refs={refs} />}
        {kind === 'assignment_rule' && <AssignmentForm cfg={cfg as AssignmentConfig} upd={upd} refs={refs} />}
        {kind === 'scoring_rule' && <ScoringForm cfg={cfg as ScoringConfig} upd={upd} refs={refs} />}
        {kind === 'validation_rule' && (
          <div className="space-y-3">
            <div><p className="mb-1 text-xs font-medium text-muted-foreground">Refuse the save when…</p><CriteriaBuilder fields={fields} value={(cfg as ValidationConfig).criteria} onChange={(c) => upd({ criteria: c })} members={refs.members} /></div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="Show the error on"><select className={inp} value={cfg.field ?? ''} onChange={(e) => upd({ field: e.target.value })}><option value="">(first field in the condition)</option>{fields.map((f) => <option key={f.api} value={f.api}>{f.label}</option>)}</select></Field>
              <Field label="Error message"><input className={inp} value={cfg.message ?? ''} onChange={(e) => upd({ message: e.target.value })} maxLength={200} /></Field>
              <Field label="Check on"><select className={inp} value={cfg.on ?? 'both'} onChange={(e) => upd({ on: e.target.value })}><option value="both">Create and edit</option><option value="create">Create only</option><option value="edit">Edit only</option></select></Field>
            </div>
          </div>
        )}
        {kind === 'layout_rule' && (
          <div className="space-y-3">
            <div><p className="mb-1 text-xs font-medium text-muted-foreground">When</p><CriteriaBuilder fields={fields} value={(cfg as LayoutRuleConfig).when} onChange={(c) => upd({ when: c })} members={refs.members} /></div>
            <FieldPicker label="Show these fields (hidden otherwise)" fields={fields.filter(writable)} value={cfg.show ?? []} onChange={(v) => upd({ show: v })} />
            <FieldPicker label="Make these fields required" fields={fields.filter(writable)} value={cfg.require ?? []} onChange={(v) => upd({ require: v })} />
          </div>
        )}
        {kind === 'macro' && (
          <div className="space-y-3">
            <Field label="Description"><input className={inp} value={cfg.description ?? ''} onChange={(e) => upd({ description: e.target.value })} maxLength={300} /></Field>
            <ActionsEditor module={module} value={(cfg as MacroConfig).actions ?? []} onChange={(a) => upd({ actions: a })} refs={refs} allow={['field_update', 'task', 'call', 'email', 'tag', 'notify', 'enroll_cadence', 'add_to_campaign']} />
            <RolePicker refs={refs} value={cfg.roleIds ?? []} onChange={(v) => upd({ roleIds: v })} label="Who can run it (no roles ticked = everyone who can edit)" />
          </div>
        )}
        {kind === 'cadence' && <CadenceForm cfg={cfg as CadenceConfig} upd={upd} refs={refs} />}
        {kind === 'webhook' && (
          <div className="space-y-3">
            <Field label="HTTPS URL"><input className={inp} value={cfg.url ?? ''} onChange={(e) => upd({ url: e.target.value })} maxLength={500} /></Field>
            <FieldPicker label="Fields sent with the record (id, name and owner are always sent)" fields={fields} value={cfg.fields ?? []} onChange={(v) => upd({ fields: v })} />
            {(cfg as WebhookConfig).secret && (
              <div className="rounded-md bg-muted/40 p-2 text-xs">
                <p>Signing secret (verify <code>X-MECE-Signature = sha256=HMAC(secret, timestamp + "." + body)</code>):</p>
                <code className="break-all">{(cfg as WebhookConfig).secret}</code>
                <div className="mt-2 flex gap-2">
                  <Button small onClick={() => save(true)}>Rotate secret</Button>
                  {rule && <Button small onClick={async () => { const r = await autoTestWebhook(rule.id); if (!r.ok) toast.error(r.error); else (r.data.ok ? toast.success : toast.error)(`Test: ${r.data.status ?? r.data.error} (${r.data.ms} ms)`); }}>Send test</Button>}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-between gap-2 border-t border-border pt-3">
          {rule ? <Button danger onClick={del}>Delete</Button> : <span />}
          <div className="flex gap-2"><Button onClick={onClose}>Cancel</Button><Button primary onClick={() => save(false)} disabled={busy}>Save</Button></div>
        </div>
      </div>
    </Modal>
  );
}

function FieldPicker({ label: l, fields, value, onChange }: { label: string; fields: Refs['fields'][string]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{l}</p>
      <div className="flex max-h-36 flex-wrap gap-x-4 gap-y-1 overflow-y-auto rounded-md border border-border p-2">
        {fields.map((f) => <label key={f.api} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={value.includes(f.api)} onChange={(e) => onChange(e.target.checked ? [...value, f.api] : value.filter((x) => x !== f.api))} />{f.label}</label>)}
      </div>
    </div>
  );
}

function RolePicker({ refs, value, onChange, label: l }: { refs: Refs; value: string[]; onChange: (v: string[]) => void; label: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{l}</p>
      <div className="flex flex-wrap gap-3">{refs.roles.map((r) => <label key={r.id} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={value.includes(r.id)} onChange={(e) => onChange(e.target.checked ? [...value, r.id] : value.filter((x) => x !== r.id))} />{r.name}</label>)}</div>
    </div>
  );
}

function UserPicker({ refs, value, onChange }: { refs: Refs; value: string[]; onChange: (v: string[]) => void }) {
  return <div className="flex flex-wrap gap-3">{refs.members.map((m) => <label key={m.id} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={value.includes(m.id)} onChange={(e) => onChange(e.target.checked ? [...value, m.id] : value.filter((x) => x !== m.id))} />{m.name}</label>)}</div>;
}

function WorkflowForm({ cfg, upd, refs }: { cfg: WorkflowConfig; upd: (p: Record<string, unknown>) => void; refs: Refs }) {
  const fields = refs.fields[cfg.module] ?? [];
  const t = cfg.trigger ?? { type: 'create' };
  const conds = cfg.conditions ?? [];
  const setCond = (i: number, p: Partial<WorkflowConfig['conditions'][number]>) => upd({ conditions: conds.map((c, j) => (j === i ? { ...c, ...p } : c)) });
  const dateFields = fields.filter((f) => f.type === 'date' || f.type === 'datetime');
  return (
    <div className="space-y-3">
      <Card title="When">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Trigger"><select className={inp} value={t.type} onChange={(e) => upd({ trigger: { type: e.target.value, ...(e.target.value === 'date' ? { date: { field: dateFields[0]?.api ?? '', offsetDays: 0, repeat: 'once' } } : {}), ...(e.target.value === 'score' ? { score: 'any' } : {}) } })}>
            <option value="create">A record is created</option><option value="edit">A record is edited</option><option value="create_or_edit">Created or edited</option>
            <option value="field_update">Specific fields change</option><option value="date">A date arrives</option><option value="score">The score changes</option><option value="delete">A record is deleted</option>
          </select></Field>
          {t.type === 'date' && <>
            <Field label="Date field"><select className={inp} value={t.date?.field ?? ''} onChange={(e) => upd({ trigger: { ...t, date: { ...(t.date ?? { offsetDays: 0, repeat: 'once' }), field: e.target.value } } })}>{dateFields.map((f) => <option key={f.api} value={f.api}>{f.label}</option>)}</select></Field>
            <Field label="Days (negative = before)" hint="Runs once per record on that day (IST). Yearly repeats each year."><div className="flex gap-2"><input type="number" className={inp} min={-365} max={365} value={t.date?.offsetDays ?? 0} onChange={(e) => upd({ trigger: { ...t, date: { ...t.date!, offsetDays: Number(e.target.value) } } })} />
              <select className={inp} value={t.date?.repeat ?? 'once'} onChange={(e) => upd({ trigger: { ...t, date: { ...t.date!, repeat: e.target.value as 'once' } } })}><option value="once">Once</option><option value="yearly">Yearly</option></select></div></Field>
          </>}
          {t.type === 'score' && <Field label="Direction"><select className={inp} value={t.score ?? 'any'} onChange={(e) => upd({ trigger: { ...t, score: e.target.value } })}><option value="any">Any change</option><option value="increase">Goes up</option><option value="decrease">Goes down</option></select></Field>}
        </div>
        {t.type === 'field_update' && <div className="mt-2"><FieldPicker label="Which fields (up to 5)" fields={fields} value={t.fields ?? []} onChange={(v) => upd({ trigger: { ...t, fields: v.slice(0, 5) } })} /></div>}
      </Card>
      {conds.map((c, i) => (
        <Card key={i} title={`Condition ${i + 1}${i > 0 ? ' (only if earlier conditions did not match)' : ''}`} actions={conds.length > 1 ? <button type="button" aria-label="Remove condition" onClick={() => upd({ conditions: conds.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4 text-muted-foreground" /></button> : null}>
          <p className="mb-1 text-xs text-muted-foreground">Records matching (empty = all records)</p>
          <CriteriaBuilder fields={fields} value={c.criteria} onChange={(v) => setCond(i, { criteria: v })} members={refs.members} allowChangeOps={t.type === 'edit' || t.type === 'create_or_edit' || t.type === 'field_update'} />
          <p className="mb-1 mt-3 text-xs font-medium">Instant actions</p>
          <ActionsEditor module={cfg.module} value={c.actions ?? []} onChange={(a) => setCond(i, { actions: a })} refs={refs} allow={t.type === 'delete' ? ['notify', 'webhook'] : undefined} />
          {t.type !== 'delete' && <>
            <p className="mb-1 mt-3 text-xs font-medium">Scheduled actions <span className="font-normal text-muted-foreground">(cancelled if the record stops matching)</span></p>
            {(c.scheduled ?? []).map((sc, k) => (
              <div key={k} className="mb-2 rounded-md border border-dashed border-border p-2">
                <div className="mb-2 flex items-center gap-2 text-xs">After
                  <input type="number" min={1} className="h-7 w-20 rounded border border-border bg-background px-1" value={sc.delayMinutes >= 1440 && sc.delayMinutes % 1440 === 0 ? sc.delayMinutes / 1440 : sc.delayMinutes >= 60 && sc.delayMinutes % 60 === 0 ? sc.delayMinutes / 60 : sc.delayMinutes}
                    onChange={(e) => { const unit = sc.delayMinutes >= 1440 && sc.delayMinutes % 1440 === 0 ? 1440 : sc.delayMinutes >= 60 && sc.delayMinutes % 60 === 0 ? 60 : 1; setCond(i, { scheduled: c.scheduled.map((x, j) => (j === k ? { ...x, delayMinutes: Math.max(1, Number(e.target.value) * unit) } : x)) }); }} />
                  <select className="h-7 rounded border border-border bg-background px-1" value={sc.delayMinutes >= 1440 && sc.delayMinutes % 1440 === 0 ? 1440 : sc.delayMinutes >= 60 && sc.delayMinutes % 60 === 0 ? 60 : 1}
                    onChange={(e) => { const cur = sc.delayMinutes >= 1440 && sc.delayMinutes % 1440 === 0 ? sc.delayMinutes / 1440 : sc.delayMinutes >= 60 && sc.delayMinutes % 60 === 0 ? sc.delayMinutes / 60 : sc.delayMinutes; setCond(i, { scheduled: c.scheduled.map((x, j) => (j === k ? { ...x, delayMinutes: cur * Number(e.target.value) } : x)) }); }}>
                    <option value={1}>minutes</option><option value={60}>hours</option><option value={1440}>days</option>
                  </select>
                  <button type="button" className="ml-auto text-muted-foreground hover:text-destructive" aria-label="Remove scheduled actions" onClick={() => setCond(i, { scheduled: c.scheduled.filter((_, j) => j !== k) })}><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <ActionsEditor module={cfg.module} value={sc.actions ?? []} onChange={(a) => setCond(i, { scheduled: c.scheduled.map((x, j) => (j === k ? { ...x, actions: a } : x)) })} refs={refs} />
              </div>
            ))}
            {(c.scheduled ?? []).length < 5 && <Button small onClick={() => setCond(i, { scheduled: [...(c.scheduled ?? []), { delayMinutes: 1440, actions: [] }] })}><Plus className="h-3.5 w-3.5" /> Add a delay</Button>}
          </>}
        </Card>
      ))}
      {conds.length < 10 && <Button small onClick={() => upd({ conditions: [...conds, { criteria: null, actions: [], scheduled: [] }] })}><Plus className="h-3.5 w-3.5" /> Add a condition</Button>}
      <Field label="Description (optional)"><input className={inp} value={cfg.description ?? ''} onChange={(e) => upd({ description: e.target.value })} maxLength={300} /></Field>
    </div>
  );
}

function BlueprintForm({ cfg, upd, refs }: { cfg: BlueprintConfig; upd: (p: Record<string, unknown>) => void; refs: Refs }) {
  const fields = refs.fields[cfg.module] ?? [];
  const picklists = fields.filter((f) => f.type === 'picklist');
  const fieldDef = picklists.find((f) => f.api === cfg.field);
  const options = cfg.module === 'deals' && cfg.field === 'stage' ? refs.stageKeys : (fieldDef?.picklist ?? []).map((p) => ({ key: p, label: p }));
  const stateLabel = (k: string) => options.find((o) => o.key === k)?.label ?? k;
  const trs = cfg.transitions ?? [];
  const setT = (i: number, p: Partial<Transition>) => upd({ transitions: trs.map((t, j) => (j === i ? { ...t, ...p } : t)) });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Picklist the process runs on"><select className={inp} value={cfg.field} onChange={(e) => upd({ field: e.target.value, states: [], transitions: [], sla: [] })}>{picklists.map((f) => <option key={f.api} value={f.api}>{f.label}</option>)}</select></Field>
        <Field label="Description"><input className={inp} value={cfg.description ?? ''} onChange={(e) => upd({ description: e.target.value })} maxLength={300} /></Field>
      </div>
      <div><p className="mb-1 text-xs font-medium text-muted-foreground">Which records enter (empty = all whose value is one of the states)</p><CriteriaBuilder fields={fields} value={cfg.criteria} onChange={(c) => upd({ criteria: c })} members={refs.members} /></div>
      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">States</p>
        <div className="flex max-h-32 flex-wrap gap-x-4 gap-y-1 overflow-y-auto rounded-md border border-border p-2">{options.map((o) => (
          <label key={o.key} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={(cfg.states ?? []).includes(o.key)} onChange={(e) => upd({ states: e.target.checked ? [...(cfg.states ?? []), o.key] : (cfg.states ?? []).filter((x) => x !== o.key) })} />{o.label}</label>
        ))}</div>
      </div>
      {trs.map((t, i) => (
        <Card key={i} title={`Transition ${i + 1}`} actions={<button type="button" aria-label="Remove transition" onClick={() => upd({ transitions: trs.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4 text-muted-foreground" /></button>}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="Button label"><input className={inp} value={t.name} onChange={(e) => setT(i, { name: e.target.value })} maxLength={60} /></Field>
            <Field label="Moves to"><select className={inp} value={t.to} onChange={(e) => setT(i, { to: e.target.value })}><option value="">Choose…</option>{(cfg.states ?? []).map((s) => <option key={s} value={s}>{stateLabel(s)}</option>)}</select></Field>
            <Field label="Who can press it"><select className={inp} value={t.owners?.type ?? 'owner'} onChange={(e) => setT(i, { owners: { type: e.target.value as 'owner', ids: [] } })}><option value="owner">Record owner</option><option value="users">Specific users</option><option value="roles">Roles</option><option value="any">Anyone who can edit</option></select></Field>
          </div>
          {t.owners?.type === 'users' && <div className="mt-2"><UserPicker refs={refs} value={t.owners.ids ?? []} onChange={(v) => setT(i, { owners: { type: 'users', ids: v } })} /></div>}
          {t.owners?.type === 'roles' && <div className="mt-2"><RolePicker refs={refs} label="Roles" value={t.owners.ids ?? []} onChange={(v) => setT(i, { owners: { type: 'roles', ids: v } })} /></div>}
          <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={!!t.common} onChange={(e) => setT(i, { common: e.target.checked, from: [] })} /> Common transition (available from every state, e.g. “Mark lost”)</label>
          {!t.common && <div className="mt-2 flex flex-wrap gap-3 text-xs"><span className="text-muted-foreground">From:</span>{(cfg.states ?? []).map((s) => <label key={s} className="flex items-center gap-1"><input type="checkbox" checked={(t.from ?? []).includes(s)} onChange={(e) => setT(i, { from: e.target.checked ? [...(t.from ?? []), s] : (t.from ?? []).filter((x) => x !== s) })} />{stateLabel(s)}</label>)}</div>}
          <div className="mt-2"><FieldPicker label="During: fields that must be filled" fields={fields.filter((f) => writable(f) && f.api !== cfg.field)} value={t.requiredFields ?? []} onChange={(v) => setT(i, { requiredFields: v })} /></div>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!t.noteRequired} onChange={(e) => setT(i, { noteRequired: e.target.checked })} /> A note is required</label>
            <input className={inp} placeholder="Message shown in the transition window (optional)" value={t.message ?? ''} onChange={(e) => setT(i, { message: e.target.value })} maxLength={500} />
          </div>
          <p className="mb-1 mt-3 text-xs font-medium">After: actions</p>
          <ActionsEditor module={cfg.module} value={t.after ?? []} onChange={(a) => setT(i, { after: a })} refs={refs} />
        </Card>
      ))}
      <Button small onClick={() => upd({ transitions: [...trs, { id: `t${Date.now().toString(36)}`, name: '', from: [], to: '', owners: { type: 'owner' }, requiredFields: [], noteRequired: false, after: [] }] })}><Plus className="h-3.5 w-3.5" /> Add a transition</Button>
      <Card title="SLA — escalate when a record sits in a state too long">
        {(cfg.sla ?? []).map((s, i) => (
          <div key={i} className="mb-2 rounded-md border border-dashed border-border p-2">
            <div className="mb-2 flex items-center gap-2 text-xs">In
              <select className="h-7 rounded border border-border bg-background px-1" value={s.state} onChange={(e) => upd({ sla: cfg.sla.map((x, j) => (j === i ? { ...x, state: e.target.value } : x)) })}>{(cfg.states ?? []).map((st) => <option key={st} value={st}>{stateLabel(st)}</option>)}</select>
              for more than <input type="number" min={1} className="h-7 w-20 rounded border border-border bg-background px-1" value={s.hours} onChange={(e) => upd({ sla: cfg.sla.map((x, j) => (j === i ? { ...x, hours: Number(e.target.value) } : x)) })} /> hours
              <button type="button" className="ml-auto" aria-label="Remove SLA" onClick={() => upd({ sla: cfg.sla.filter((_, j) => j !== i) })}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
            </div>
            <ActionsEditor module={cfg.module} value={s.actions ?? []} onChange={(a) => upd({ sla: cfg.sla.map((x, j) => (j === i ? { ...x, actions: a } : x)) })} refs={refs} />
          </div>
        ))}
        <Button small onClick={() => upd({ sla: [...(cfg.sla ?? []), { state: cfg.states?.[0] ?? '', hours: 48, actions: [] }] })}><Plus className="h-3.5 w-3.5" /> Add an SLA</Button>
      </Card>
    </div>
  );
}

function ApprovalForm({ cfg, upd, refs }: { cfg: ApprovalConfig; upd: (p: Record<string, unknown>) => void; refs: Refs }) {
  const fields = refs.fields[cfg.module] ?? [];
  const stages = cfg.stages ?? [];
  const setS = (i: number, p: Partial<ApprovalConfig['stages'][number]>) => upd({ stages: stages.map((s, j) => (j === i ? { ...s, ...p } : s)) });
  return (
    <div className="space-y-3">
      <Field label="Starts"><select className={inp} value={cfg.trigger} onChange={(e) => upd({ trigger: e.target.value })}><option value="create_or_edit">Automatically, on create or edit</option><option value="create">Automatically, on create</option><option value="edit">Automatically, on edit</option><option value="manual">When someone presses “Submit for approval”</option></select></Field>
      <div><p className="mb-1 text-xs font-medium text-muted-foreground">For records matching (empty = all)</p><CriteriaBuilder fields={fields} value={cfg.criteria} onChange={(c) => upd({ criteria: c })} members={refs.members} /></div>
      {stages.map((s, i) => (
        <Card key={i} title={`Stage ${i + 1}`} actions={stages.length > 1 ? <button type="button" aria-label="Remove stage" onClick={() => upd({ stages: stages.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4 text-muted-foreground" /></button> : null}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Approvers"><select className={inp} value={s.approvers.type} onChange={(e) => setS(i, { approvers: { type: e.target.value as 'manager', ids: [] } })}><option value="manager">The owner’s manager</option><option value="users">Specific users</option><option value="roles">Roles</option></select></Field>
            <Field label="Needs"><select className={inp} value={s.mode} onChange={(e) => setS(i, { mode: e.target.value as 'any' })}><option value="any">Any one approver</option><option value="all">All approvers</option></select></Field>
          </div>
          {s.approvers.type === 'users' && <div className="mt-2"><UserPicker refs={refs} value={s.approvers.ids ?? []} onChange={(v) => setS(i, { approvers: { type: 'users', ids: v } })} /></div>}
          {s.approvers.type === 'roles' && <div className="mt-2"><RolePicker refs={refs} label="Roles" value={s.approvers.ids ?? []} onChange={(v) => setS(i, { approvers: { type: 'roles', ids: v } })} /></div>}
        </Card>
      ))}
      {stages.length < 5 && <Button small onClick={() => upd({ stages: [...stages, { approvers: { type: 'manager' }, mode: 'any' }] })}><Plus className="h-3.5 w-3.5" /> Add a stage</Button>}
      <Card title="When approved"><ActionsEditor module={cfg.module} value={cfg.onApprove ?? []} onChange={(a) => upd({ onApprove: a })} refs={refs} /></Card>
      <Card title="When rejected"><ActionsEditor module={cfg.module} value={cfg.onReject ?? []} onChange={(a) => upd({ onReject: a })} refs={refs} /></Card>
    </div>
  );
}

function AssignmentForm({ cfg, upd, refs }: { cfg: AssignmentConfig; upd: (p: Record<string, unknown>) => void; refs: Refs }) {
  const fields = refs.fields[cfg.module] ?? [];
  const entries = cfg.entries ?? [];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-sm"><span className="text-xs text-muted-foreground">Applies to records created by</span>
        {(['webform', 'import', 'api'] as const).map((s) => <label key={s} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={(cfg.applyTo ?? []).includes(s)} onChange={(e) => upd({ applyTo: e.target.checked ? [...(cfg.applyTo ?? []), s] : (cfg.applyTo ?? []).filter((x) => x !== s) })} />{s === 'webform' ? 'web forms' : s === 'import' ? 'imports (when ticked in the import)' : 'the API'}</label>)}
      </div>
      {entries.map((en, i) => (
        <Card key={i} title={`Entry ${i + 1} — first match wins`} actions={entries.length > 1 ? <button type="button" aria-label="Remove entry" onClick={() => upd({ entries: entries.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4 text-muted-foreground" /></button> : null}>
          <CriteriaBuilder fields={fields} value={en.criteria} onChange={(c) => upd({ entries: entries.map((x, j) => (j === i ? { ...x, criteria: c } : x)) })} members={refs.members} />
          <p className="mb-1 mt-2 text-xs text-muted-foreground">Assign to (several = round robin)</p>
          <UserPicker refs={refs} value={en.userIds ?? []} onChange={(v) => upd({ entries: entries.map((x, j) => (j === i ? { ...x, userIds: v } : x)) })} />
        </Card>
      ))}
      <Button small onClick={() => upd({ entries: [...entries, { criteria: null, userIds: [] }] })}><Plus className="h-3.5 w-3.5" /> Add an entry</Button>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="If nothing matches"><select className={inp} value={cfg.fallbackUserId ?? ''} onChange={(e) => upd({ fallbackUserId: e.target.value || null })}><option value="">Leave unassigned</option>{refs.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field>
        <Field label="Follow-up task for the new owner (optional)"><input className={inp} placeholder="e.g. Call within 24 hours" value={cfg.followUp?.subject ?? ''} onChange={(e) => upd({ followUp: e.target.value ? { subject: e.target.value, dueInDays: cfg.followUp?.dueInDays ?? 1 } : null })} maxLength={250} /></Field>
      </div>
    </div>
  );
}

function ScoringForm({ cfg, upd, refs }: { cfg: ScoringConfig; upd: (p: Record<string, unknown>) => void; refs: Refs }) {
  const fields = refs.fields[cfg.module] ?? [];
  const rules = cfg.rules ?? [];
  const tp = cfg.touchpoints ?? { email_open: 0, email_click: 0, form_submit: 0, survey_answer: 0 };
  return (
    <div className="space-y-3">
      {rules.map((r, i) => (
        <Card key={i} title={`Rule ${i + 1}`} actions={<button type="button" aria-label="Remove rule" onClick={() => upd({ rules: rules.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4 text-muted-foreground" /></button>}>
          <CriteriaBuilder fields={fields} value={r.criteria as Criteria} onChange={(c) => upd({ rules: rules.map((x, j) => (j === i ? { ...x, criteria: c } : x)) })} members={refs.members} />
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Field label="Points (−100 to 100)"><input type="number" min={-100} max={100} className={inp} value={r.points} onChange={(e) => upd({ rules: rules.map((x, j) => (j === i ? { ...x, points: Number(e.target.value) } : x)) })} /></Field>
            <Field label="Label (shown in “why this score”)"><input className={inp} value={r.label ?? ''} onChange={(e) => upd({ rules: rules.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} maxLength={80} /></Field>
          </div>
        </Card>
      ))}
      <Button small onClick={() => upd({ rules: [...rules, { criteria: null, points: 10, label: '' }] })}><Plus className="h-3.5 w-3.5" /> Add a rule</Button>
      <Card title="Touchpoints (points per occurrence, each counted up to 10 times)">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(['email_open', 'email_click', 'form_submit', 'survey_answer'] as const).map((k) => (
            <Field key={k} label={k.replace('_', ' ')}><input type="number" min={-50} max={50} className={inp} value={tp[k]} onChange={(e) => upd({ touchpoints: { ...tp, [k]: Number(e.target.value) } })} /></Field>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CadenceForm({ cfg, upd, refs }: { cfg: CadenceConfig; upd: (p: Record<string, unknown>) => void; refs: Refs }) {
  const fields = refs.fields[cfg.module] ?? [];
  const steps = cfg.steps ?? [];
  const setS = (i: number, p: Partial<CadenceConfig['steps'][number]>) => upd({ steps: steps.map((s, j) => (j === i ? { ...s, ...p } : s)) });
  return (
    <div className="space-y-3">
      <Field label="Description"><input className={inp} value={cfg.description ?? ''} onChange={(e) => upd({ description: e.target.value })} maxLength={300} /></Field>
      {steps.map((s, i) => (
        <div key={i} className="grid grid-cols-1 items-end gap-2 rounded-md border border-border p-2 md:grid-cols-[110px_1fr_160px_auto]">
          <Field label={`Step ${i + 1}`}><select className={inp} value={s.type} onChange={(e) => setS(i, { type: e.target.value as 'email' })}><option value="email">Email</option><option value="task">Task</option><option value="call">Call</option></select></Field>
          {s.type === 'email'
            ? <Field label="Template"><select className={inp} value={s.templateId ?? ''} onChange={(e) => setS(i, { templateId: e.target.value })}><option value="">Choose…</option>{refs.templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
            : <Field label="Subject"><input className={inp} value={s.subject ?? ''} onChange={(e) => setS(i, { subject: e.target.value })} maxLength={250} /></Field>}
          <Field label={i === 0 ? 'Days after enrolment' : 'Days after previous step'}><input type="number" min={0} max={365} className={inp} value={s.delayDays} onChange={(e) => setS(i, { delayDays: Number(e.target.value) })} /></Field>
          <button type="button" aria-label="Remove step" className="mb-1.5" onClick={() => upd({ steps: steps.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4 text-muted-foreground" /></button>
        </div>
      ))}
      <Button small onClick={() => upd({ steps: [...steps, { id: `s${steps.length + 1}`, type: 'task', subject: '', delayDays: 2 }] })}><Plus className="h-3.5 w-3.5" /> Add a step</Button>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!cfg.businessDays} onChange={(e) => upd({ businessDays: e.target.checked })} /> Count working days only (Mon–Sat)</label>
      <div><p className="mb-1 text-xs font-medium text-muted-foreground">Stop when (exit condition — e.g. Lead status is Converted, or the person paid)</p><CriteriaBuilder fields={fields} value={cfg.exitCriteria} onChange={(c) => upd({ exitCriteria: c })} members={refs.members} /></div>
      <div><p className="mb-1 text-xs font-medium text-muted-foreground">Enrol automatically when (optional)</p><CriteriaBuilder fields={fields} value={cfg.autoEnroll} onChange={(c) => upd({ autoEnroll: c })} members={refs.members} /></div>
    </div>
  );
}

export type { Action };

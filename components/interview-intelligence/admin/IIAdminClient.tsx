'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { iiAdmin, IIError, isConfigured } from '@/lib/interview-intelligence/api';
import type { AccessGrantRow, AdminOverview } from '@/lib/interview-intelligence/types';
import { ErrorNote, Spinner } from '../primitives';

type Tab = 'access' | 'settings' | 'overview' | 'sessions' | 'ai' | 'evaluation' | 'audit';
const TABS: { id: Tab; label: string }[] = [
  { id: 'access', label: 'Test users' },
  { id: 'settings', label: 'Settings' },
  { id: 'overview', label: 'Health' },
  { id: 'sessions', label: 'Interviews' },
  { id: 'ai', label: 'AI runs' },
  { id: 'evaluation', label: 'Evaluation' },
  { id: 'audit', label: 'Audit log' },
];

export default function IIAdminClient() {
  const [tab, setTab] = useState<Tab>('access');
  if (!isConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-xl font-semibold">Interview Intelligence</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Not connected. Set NEXT_PUBLIC_II_API_URL (and the signing key on the server) — see the Interview Intelligence handoff.
        </p>
      </div>
    );
  }
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Interview Intelligence</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Independent service. Access, limits and flags here are stored in the Interview Intelligence database — no code changes needed.
      </p>
      <nav className="mt-5 flex flex-wrap gap-1 border-b border-border" aria-label="Interview Intelligence admin sections">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}
            className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
              tab === t.id ? 'border-navy font-semibold text-foreground dark:border-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </nav>
      <div className="mt-6">
        {tab === 'access' && <AccessTab />}
        {tab === 'settings' && <SettingsTab />}
        {tab === 'overview' && <OverviewTab />}
        {tab === 'sessions' && <SessionsTab />}
        {tab === 'ai' && <RunsTab />}
        {tab === 'evaluation' && <EvaluationTab />}
        {tab === 'audit' && <AuditTab />}
      </div>
    </div>
  );
}

function useLoad<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setError(null);
    try { setData(await fn()); } catch (e) { setError((e as IIError).message); }
  }, [fn]);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, reload, setError };
}

/* ------------------------------------------------------------------ test users */
function AccessTab() {
  const { data, error, reload, setError } = useLoad(iiAdmin.grants);
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try { await iiAdmin.addGrant(email.trim(), note.trim()); setEmail(''); setNote(''); await reload(); }
    catch (err) { setError((err as IIError).message); }
    finally { setBusy(false); }
  }
  async function act(g: AccessGrantRow, action: 'enable' | 'disable' | 'delete') {
    if (action === 'delete' && !window.confirm(`Delete access for ${g.email}?`)) return;
    try {
      if (action === 'delete') await iiAdmin.deleteGrant(g.id);
      else await iiAdmin.setGrant(g.id, action === 'enable' ? 'enabled' : 'disabled');
      await reload();
    } catch (err) { setError((err as IIError).message); }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">Add a test user</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Grants Interview Intelligence access to this email (matched to a confirmed MECE account email), whatever their plan.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-[2fr_2fr_auto]">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com"
            aria-label="Email" className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" aria-label="Note"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          <Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Add test user</Button>
        </div>
      </form>

      <ErrorNote error={error} onRetry={reload} />

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="font-semibold">Authorised users</h2>
          <button onClick={reload} className="text-muted-foreground hover:text-foreground" aria-label="Refresh"><RefreshCw className="h-4 w-4" /></button>
        </div>
        {!data ? <div className="px-5 pb-5"><Spinner /></div> : data.grants.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-muted-foreground">No test users yet.</p>
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {data.grants.map((g) => (
              <li key={g.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium">{g.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {g.note ? `${g.note} · ` : ''}added by {g.granted_by || 'bootstrap'} · {new Date(g.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${g.active ? 'bg-viz-good/10 text-viz-good' : 'bg-muted text-muted-foreground'}`}>
                    {g.active ? 'Enabled' : 'Disabled'}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => act(g, g.status === 'enabled' ? 'disable' : 'enable')}>
                    {g.status === 'enabled' ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => act(g, 'delete')}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ settings */
const FLAG_HELP: Record<string, string> = {
  'ii.enabled': 'Kill switch. Off = nobody but II admins can use it.',
  'ii.enabled_for_pro': 'Launch flag. Off = private preview (admins + test users only). On = every Pro user.',
  'admin.test_access': 'Whether the test-user list grants access.',
  'voice.enabled': 'Turn-based voice answers and spoken interviewer lines.',
  'company_intel.enabled': 'Use JD-stated and user-provided company context.',
  'company_intel.web_research': 'Public web research for company context (not built — keep off).',
  'technical.advanced_mode': 'Offer the technical deep-dive mode.',
  'technical.coding_exercises': 'Executable coding exercises (sandbox not built — keep off).',
  'ocr.enabled': 'OCR for image-only CVs (not built — keep off).',
  'drive.export_reports': 'Copy finished reports to Google Drive.',
  'limits.max_active_sessions': 'Active interviews per user (1–10). Spec default: 2.',
  'limits.max_sessions_per_day': 'New interviews per user per 24 h (Pro).',
  'limits.max_sessions_per_day_test': 'New interviews per 24 h for test users and admins.',
  'limits.allowed_durations': 'Minutes offered at setup, e.g. 15, 30, 45, 60.',
  'limits.session_cost_cap_usd': 'Per-interview AI cost cap; above it the interviewer closes gracefully.',
  'limits.daily_budget_usd': 'Global AI budget per day; new interviews pause when reached. 0 = no cap.',
  'limits.max_upload_mb': 'Maximum CV/JD file size.',
};

function SettingsTab() {
  const { data, error, reload, setError } = useLoad(iiAdmin.config);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function save(key: string, value: unknown) {
    setSaving(key);
    try { await iiAdmin.setConfig({ [key]: value }); setDrafts((d) => { const n = { ...d }; delete n[key]; return n; }); await reload(); }
    catch (e) { setError((e as IIError).message); }
    finally { setSaving(null); }
  }

  if (!data) return error ? <ErrorNote error={error} onRetry={reload} /> : <Spinner />;
  return (
    <div className="space-y-4">
      <ErrorNote error={error} />
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {Object.entries(data.flags).map(([key, value]) => (
          <li key={key} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_16rem] sm:items-center">
            <div>
              <p className="font-mono text-sm">{key}</p>
              <p className="text-sm text-muted-foreground">{FLAG_HELP[key] || ''}</p>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              {typeof value === 'boolean' ? (
                <button role="switch" aria-checked={value} aria-label={key} disabled={saving === key}
                  onClick={() => save(key, !value)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-navy dark:bg-viz-good' : 'bg-muted-foreground/30'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              ) : (
                <>
                  <input
                    value={drafts[key] ?? (Array.isArray(value) ? value.join(', ') : String(value))}
                    onChange={(e) => setDrafts({ ...drafts, [key]: e.target.value })} aria-label={key}
                    className="h-8 w-36 rounded-md border border-input bg-background px-2 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  <Button size="sm" variant="outline" disabled={drafts[key] === undefined || saving === key}
                    onClick={() => save(key, Array.isArray(value)
                      ? drafts[key].split(',').map((x) => Number(x.trim())).filter((x) => !Number.isNaN(x))
                      : Number(drafts[key]))}>
                    Save
                  </Button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ health */
function OverviewTab() {
  const { data, error, reload } = useLoad(iiAdmin.overview);
  const [retrying, setRetrying] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  if (!data) return error ? <ErrorNote error={error} onRetry={reload} /> : <Spinner />;
  const o = data as AdminOverview;
  async function retryDrive() {
    setRetrying(true);
    try { const r = await iiAdmin.driveRetry(); setMsg(`${r.requeued} document(s) re-queued for Drive sync.`); await reload(); }
    catch (e) { setMsg((e as IIError).message); }
    finally { setRetrying(false); }
  }
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        {[['Users', o.users_total], ['Active 7d', o.users_active_7d], ['Interviews live', o.active_interviews],
          ['Completed 7d', o.completed_7d], ['Failure rate 7d', `${Math.round(o.failure_rate_7d * 100)}%`],
          ['AI cost today', `$${o.cost_today_usd.toFixed(2)}`], ['Holding a slot', o.slot_sessions],
          ['Anomalies 7d', o.evaluation_anomalies_7d.length]].map(([k, v]) => (
          <div key={String(k)} className="bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <AdminTable title="AI stages (last 24 h)"
        head={['Stage', 'Runs', 'Errors', 'p50', 'p95', 'Cost', 'Models']}
        rows={Object.entries(o.ai_stages_24h).map(([k, v]) => [k, v.runs, v.errors, v.p50_ms ?? '—', v.p95_ms ?? '—', `$${v.cost_usd.toFixed(3)}`, v.models.join(', ')])} />

      <div className="grid gap-6 sm:grid-cols-2">
        <AdminTable title="Mode usage (7 d)" head={['Mode', 'Interviews']} rows={Object.entries(o.mode_usage_7d)} />
        <div>
          <AdminTable title="Google Drive sync" head={['Status', 'Files']} rows={Object.entries(o.drive_sync.files)} />
          <Button size="sm" variant="outline" className="mt-3" onClick={retryDrive} disabled={retrying}>Retry failed uploads</Button>
          {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
        </div>
      </div>

      <AdminTable title="Most-used questions (7 d)" head={['Question', 'Times']} rows={o.top_questions_7d.map((q) => [q.text, q.count])} />
      <AdminTable title="Evaluation anomalies (7 d)" head={['Session', 'Competency', 'Flags']}
        rows={o.evaluation_anomalies_7d.map((a) => [a.session_id.slice(0, 8), a.competency_id, a.flags.join(', ')])} />
      <AdminTable title="Versions" head={['Component', 'Version']}
        rows={[...Object.entries(o.versions), ...Object.entries(o.prompt_versions).map(([k, v]) => [`prompt:${k}`, v])]} />
    </div>
  );
}

function SessionsTab() {
  const [status, setStatus] = useState('');
  const fn = useCallback(() => iiAdmin.sessions(status || undefined), [status]);
  const { data, error, reload } = useLoad(fn);
  const [detail, setDetail] = useState<Record<string, any> | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status"
          className="h-9 rounded-md border border-input bg-background px-2 text-sm">
          <option value="">All statuses</option>
          {['ready', 'active', 'paused', 'completed', 'abandoned', 'expired', 'failed'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <p className="text-sm text-muted-foreground">Opening an interview is written to the audit log.</p>
      </div>
      <ErrorNote error={error} onRetry={reload} />
      {!data ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs text-muted-foreground"><tr className="border-b border-border">
              {['Created', 'User', 'Role', 'Mode', 'Status', 'Report', 'Cost', ''].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {data.sessions.map((s) => (
                <tr key={s.id}>
                  <td className="px-3 py-2 tabular-nums">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{s.email}</td>
                  <td className="px-3 py-2">{s.role_title || '—'}</td>
                  <td className="px-3 py-2">{s.mode} / {s.difficulty}</td>
                  <td className="px-3 py-2">{s.status}</td>
                  <td className="px-3 py-2">{s.assessment_status}</td>
                  <td className="px-3 py-2 tabular-nums">${Number(s.cost_usd).toFixed(3)}</td>
                  <td className="px-3 py-2">
                    <button className="underline underline-offset-2" onClick={async () => setDetail(await iiAdmin.session(s.id))}>Inspect</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {detail && (
        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Interview {String(detail.session.id).slice(0, 8)} — {detail.session.status}</h3>
            <button className="text-muted-foreground" onClick={() => setDetail(null)}>Close</button>
          </div>
          <p className="mt-1 text-muted-foreground">Versions: {JSON.stringify(detail.session.versions)}</p>
          <ol className="mt-4 max-h-96 space-y-2 overflow-y-auto">
            {detail.messages.map((m: any) => (
              <li key={m.seq}>
                <span className="text-xs text-muted-foreground">{m.role}{m.action ? ` · ${m.action}` : ''}</span>
                <p>{m.content}</p>
              </li>
            ))}
          </ol>
          <AdminTable title="Model runs" head={['Stage', 'Model', 'Prompt', 'Status', 'ms', 'Cost']}
            rows={detail.model_runs.map((r: any) => [r.stage, r.model, r.prompt, r.status, r.latency_ms, `$${Number(r.cost_usd).toFixed(4)}`])} />
        </div>
      )}
    </div>
  );
}

const latestRuns = () => iiAdmin.modelRuns();

function RunsTab() {
  const { data, error, reload } = useLoad(latestRuns);
  if (!data) return error ? <ErrorNote error={error} onRetry={reload} /> : <Spinner />;
  return (
    <AdminTable title="Latest model runs" head={['When', 'Stage', 'Model', 'Prompt', 'Status', 'ms', 'Cost', 'Error']}
      rows={data.runs.map((r) => [new Date(r.at).toLocaleTimeString(), r.stage, `${r.provider}:${r.model}`, r.prompt, r.status,
        r.latency_ms, `$${Number(r.cost_usd).toFixed(4)}`, r.error || ''])} />
  );
}

function EvaluationTab() {
  const { data, error, reload } = useLoad(iiAdmin.evaluationRuns);
  if (!data) return error ? <ErrorNote error={error} onRetry={reload} /> : <Spinner />;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Golden-dataset runs recorded with <span className="font-mono">python -m qa.run_golden --record</span>. Labels are author drafts until reviewed by human interviewers.
      </p>
      <AdminTable title="Evaluation runs" head={['When', 'Evaluator', 'Dataset', 'Agreement', 'Fairness gap', 'Injection resisted', 'Notes']}
        rows={data.runs.map((r) => [new Date(r.at).toLocaleString(), r.evaluator_version, r.dataset_version,
          r.metrics?.label_agreement ?? '—', r.metrics?.fairness_gap_non_native_strong ?? '—', r.metrics?.injection_resisted ?? '—', r.notes])} />
    </div>
  );
}

function AuditTab() {
  const { data, error, reload } = useLoad(iiAdmin.audit);
  if (!data) return error ? <ErrorNote error={error} onRetry={reload} /> : <Spinner />;
  return (
    <AdminTable title="Audit log" head={['When', 'Actor', 'Action', 'Target']}
      rows={data.entries.map((e) => [new Date(e.at).toLocaleString(), e.actor, e.action, e.target])} />
  );
}

function AdminTable({ title, head, rows }: { title: string; head: string[]; rows: (string | number | null)[][] }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {rows.length === 0 ? <p className="text-sm text-muted-foreground">Nothing yet.</p> : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground"><tr className="border-b border-border">
              {head.map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j} className="max-w-[28rem] truncate px-3 py-2" title={String(c ?? '')}>{c ?? '—'}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

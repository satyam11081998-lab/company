'use client';

/**
 * Certificate issuance console.
 *
 * Left: the form. Right: a live preview of the ACTUAL PDF, rendered from the
 * same Document that the Download button hands over, so the preview cannot
 * drift from what the recipient receives.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Download, Sparkles, Copy, Check, Ban, RotateCcw, Search } from 'lucide-react';
import {
  CERT_TITLE_PRESETS, DEFAULT_CERT_TITLE, MAX_ROLE_TITLE_CHARS, MAX_SCOPE_LINE_CHARS,
  certificateFilename, durationLabelFor, formatCertDate, stripDashes, validateCertificate,
  verifyUrlFor,
  type AiDraft, type CertificateInput, type CertificatePrintable, type CertificateRow,
} from '@/lib/certificates';

const BLANK: CertificateInput = {
  recipient_name: '',
  recipient_program: '',
  recipient_email: '',
  cert_title: DEFAULT_CERT_TITLE,
  role_title: '',
  project_title: 'the AI-led case & interview prep platform at mece.in',
  start_date: '',
  end_date: '',
  duration_label: '',
  engagement_mode: 'Remote',
  reporting_to: 'Mohit Kumar Raj, Co-Founder',
  scope_line: '',
  work_notes: '',
  engagement_type: 'Live project: 0 to 1 product build shipped to production users.',
  sig1_name: 'Kishan Jayaswal',
  sig1_title: 'Founder, MECE',
  sig2_name: 'Mohit Kumar Raj',
  sig2_title: 'Co-Founder, MECE',
};

const SIG1_URL = '/certificates/signature-founder.png';
const SIG2_URL = '/certificates/signature-cofounder.png';

const TARGET_ROLES = [
  'product management', 'AI product management', 'marketing',
  'digital marketing', 'growth', 'consulting', 'analytics',
];

function toPrintable(form: CertificateInput, certId: string, issuedAt: string): CertificatePrintable {
  return {
    cert_id: certId,
    recipient_name: form.recipient_name || 'Recipient Name',
    recipient_program: form.recipient_program || null,
    cert_title: form.cert_title || DEFAULT_CERT_TITLE,
    role_title: form.role_title || 'Role Title',
    project_title: form.project_title,
    start_date: form.start_date || new Date().toISOString().slice(0, 10),
    end_date: form.end_date || new Date().toISOString().slice(0, 10),
    duration_label: form.duration_label || null,
    engagement_mode: form.engagement_mode || null,
    reporting_to: form.reporting_to || null,
    scope_line: form.scope_line || 'Scope of work: to be completed.',
    sig1_name: form.sig1_name,
    sig1_title: form.sig1_title,
    sig2_name: form.sig2_name,
    sig2_title: form.sig2_title,
    issued_at: issuedAt,
    is_revoked: false,
  };
}

export default function CertificatesAdminClient({
  initial, loadError,
}: { initial: CertificateRow[]; loadError: string | null }) {
  const [rows, setRows] = useState<CertificateRow[]>(initial);
  const [form, setForm] = useState<CertificateInput>(BLANK);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [issuedCertId, setIssuedCertId] = useState<string | null>(null);
  const [targets, setTargets] = useState<string[]>(['product management', 'marketing']);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [draftAlts, setDraftAlts] = useState<AiDraft['alternatives'] | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sigOk, setSigOk] = useState<{ one: boolean; two: boolean }>({ one: true, two: true });

  const issues = useMemo(() => validateCertificate(form), [form]);
  const issueFor = useCallback(
    (field: string) => issues.find((i) => i.field === field)?.message ?? null,
    [issues],
  );

  const set = useCallback(<K extends keyof CertificateInput>(k: K, v: CertificateInput[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  }, []);

  // Signature files are replaceable drop-ins. If the owner has not uploaded
  // them yet, print the line and the name rather than failing the render.
  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch(SIG1_URL, { method: 'HEAD' }).then((r) => r.ok).catch(() => false),
      fetch(SIG2_URL, { method: 'HEAD' }).then((r) => r.ok).catch(() => false),
    ]).then(([one, two]) => { if (alive) setSigOk({ one, two }); });
    return () => { alive = false; };
  }, []);

  // Fill the duration automatically, but stop once a human has typed one.
  const durationTouched = useRef(false);
  useEffect(() => {
    if (durationTouched.current) return;
    const auto = durationLabelFor(form.start_date, form.end_date);
    if (auto && auto !== form.duration_label) setForm((f) => ({ ...f, duration_label: auto }));
  }, [form.start_date, form.end_date, form.duration_label]);

  // ── live preview, debounced ───────────────────────────────────────────
  const previewSeq = useRef(0);
  useEffect(() => {
    const seq = ++previewSeq.current;
    const timer = setTimeout(async () => {
      setPreviewing(true);
      try {
        const { buildCertificatePdf } = await import('@/components/certificates/certificate-pdf');
        const blob = await buildCertificatePdf(
          toPrintable(form, issuedCertId ?? 'MECE-LP-0000-PREVIEW', new Date().toISOString()),
          { sig1Url: sigOk.one ? SIG1_URL : null, sig2Url: sigOk.two ? SIG2_URL : null },
        );
        if (seq !== previewSeq.current) return;      // a newer keystroke won
        const url = URL.createObjectURL(blob);
        setPreviewUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
      } catch (err) {
        if (seq === previewSeq.current) {
          setMessage({ kind: 'err', text: (err as Error).message });
        }
      } finally {
        if (seq === previewSeq.current) setPreviewing(false);
      }
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, issuedCertId, sigOk.one, sigOk.two]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  // ── actions ───────────────────────────────────────────────────────────
  async function draftCopy() {
    setDrafting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/certificates/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_notes: form.work_notes,
          recipient_program: form.recipient_program,
          target_roles: targets,
          duration_label: form.duration_label,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Draft failed.');
      setForm((f) => ({ ...f, role_title: json.role_title, scope_line: json.scope_line }));
      setDraftAlts(json.alternatives ?? null);
      setMessage({ kind: 'ok', text: 'Drafted. Read it before you issue it.' });
    } catch (err) {
      setMessage({ kind: 'err', text: (err as Error).message });
    } finally {
      setDrafting(false);
    }
  }

  async function issue() {
    if (issues.length) {
      setMessage({ kind: 'err', text: 'Fix the highlighted fields first.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const editing = !!editingId;
      const res = await fetch(
        editing ? `/api/admin/certificates/${editingId}` : '/api/admin/certificates',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        const detail = json.issues?.map((i: { message: string }) => i.message).join(' ');
        throw new Error(detail || json.error || 'Save failed.');
      }
      const saved = json.certificate as CertificateRow;
      setRows((r) => (editing ? r.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...r]));
      setEditingId(saved.id);
      setIssuedCertId(saved.cert_id);
      setMessage({ kind: 'ok', text: `Saved as ${saved.cert_id}.` });
    } catch (err) {
      setMessage({ kind: 'err', text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function download() {
    try {
      const { downloadCertificatePdf } = await import('@/components/certificates/certificate-pdf');
      const certId = issuedCertId ?? 'MECE-LP-0000-PREVIEW';
      await downloadCertificatePdf(
        toPrintable(form, certId, new Date().toISOString()),
        certificateFilename(certId, form.recipient_name || 'recipient'),
        { sig1Url: sigOk.one ? SIG1_URL : null, sig2Url: sigOk.two ? SIG2_URL : null },
      );
    } catch (err) {
      setMessage({ kind: 'err', text: (err as Error).message });
    }
  }

  async function toggleRevoke(row: CertificateRow) {
    const revoking = !row.revoked_at;
    const reason = revoking
      ? window.prompt('Why is this being revoked? (internal note, never shown publicly)') ?? ''
      : '';
    if (revoking && !reason.trim()) return;
    const res = await fetch(`/api/admin/certificates/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revoked: revoking, revoked_reason: reason }),
    });
    const json = await res.json();
    if (!res.ok) { setMessage({ kind: 'err', text: json.error || 'Failed.' }); return; }
    setRows((r) => r.map((x) => (x.id === row.id ? (json.certificate as CertificateRow) : x)));
  }

  function loadRow(row: CertificateRow) {
    setForm({
      recipient_name: row.recipient_name,
      recipient_program: row.recipient_program ?? '',
      recipient_email: row.recipient_email ?? '',
      cert_title: row.cert_title,
      role_title: row.role_title,
      project_title: row.project_title,
      start_date: row.start_date?.slice(0, 10) ?? '',
      end_date: row.end_date?.slice(0, 10) ?? '',
      duration_label: row.duration_label ?? '',
      engagement_mode: row.engagement_mode ?? '',
      reporting_to: row.reporting_to ?? '',
      scope_line: row.scope_line,
      work_notes: row.work_notes ?? '',
      engagement_type: row.engagement_type ?? '',
      sig1_name: row.sig1_name, sig1_title: row.sig1_title,
      sig2_name: row.sig2_name, sig2_title: row.sig2_title,
    });
    durationTouched.current = true;
    setEditingId(row.id);
    setIssuedCertId(row.cert_id);
    setDraftAlts(null);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    setForm(BLANK);
    setEditingId(null);
    setIssuedCertId(null);
    setDraftAlts(null);
    durationTouched.current = false;
    setMessage(null);
  }

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
  }

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return r.recipient_name.toLowerCase().includes(q) || r.cert_id.toLowerCase().includes(q);
  });

  // A second certificate for the same person and start date is usually a
  // double-click, occasionally a legitimate re-issue. Warn, do not block.
  const duplicate = rows.find(
    (r) => r.id !== editingId
      && r.recipient_name.trim().toLowerCase() === form.recipient_name.trim().toLowerCase()
      && r.start_date?.slice(0, 10) === form.start_date
      && !!form.recipient_name.trim(),
  );

  const field = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm';
  const label = 'block text-xs font-semibold uppercase tracking-wider text-muted-foreground';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-navy">Certificates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Issue a live-project certificate, download the PDF, and give the holder a public
          verification link. The preview below is the actual file.
        </p>
      </header>

      {loadError && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not load existing certificates: {loadError}. Has migration 0046 been run?
        </p>
      )}

      {message && (
        <p className={`rounded-md px-4 py-3 text-sm ${
          message.kind === 'ok'
            ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-700'
            : 'border border-destructive/40 bg-destructive/10 text-destructive'}`}>
          {message.text}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* ── form ─────────────────────────────────────────────────── */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="recipient_name">Recipient</label>
              <input id="recipient_name" className={field} value={form.recipient_name}
                onChange={(e) => set('recipient_name', e.target.value)} placeholder="Full name" />
              {issueFor('recipient_name') && <p className="mt-1 text-xs text-destructive">{issueFor('recipient_name')}</p>}
            </div>
            <div>
              <label className={label} htmlFor="recipient_program">Programme</label>
              <input id="recipient_program" className={field} value={form.recipient_program ?? ''}
                onChange={(e) => set('recipient_program', e.target.value)}
                placeholder="PGDM (Marketing) 2025-27 · Institute, City" />
              {issueFor('recipient_program') && <p className="mt-1 text-xs text-destructive">{issueFor('recipient_program')}</p>}
            </div>
          </div>

          <div>
            <label className={label} htmlFor="recipient_email">Email (internal only, never printed)</label>
            <input id="recipient_email" className={field} value={form.recipient_email ?? ''}
              onChange={(e) => set('recipient_email', e.target.value)} placeholder="optional" />
            {issueFor('recipient_email') && <p className="mt-1 text-xs text-destructive">{issueFor('recipient_email')}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={label} htmlFor="start_date">Start</label>
              <input id="start_date" type="date" className={field} value={form.start_date}
                onChange={(e) => set('start_date', e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="end_date">End</label>
              <input id="end_date" type="date" className={field} value={form.end_date}
                onChange={(e) => set('end_date', e.target.value)} />
              {issueFor('end_date') && <p className="mt-1 text-xs text-destructive">{issueFor('end_date')}</p>}
            </div>
            <div>
              <label className={label} htmlFor="duration_label">Duration</label>
              <input id="duration_label" className={field} value={form.duration_label ?? ''}
                onChange={(e) => { durationTouched.current = true; set('duration_label', e.target.value); }}
                placeholder="5 months" />
            </div>
          </div>

          {/* AI drafting */}
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <label className={label} htmlFor="work_notes">What did they actually do?</label>
            <p className="mt-1 text-xs text-muted-foreground">
              Plain prose. The drafter will not invent a number that is not in here, so include
              real figures if you want them cited.
            </p>
            <textarea id="work_notes" className={`${field} mt-2 min-h-[110px]`}
              value={form.work_notes ?? ''} onChange={(e) => set('work_notes', e.target.value)}
              placeholder="Wrote the PRD for the CV Pointer Lab, ran weekly build cycles with the eng pod, owned the SEO primer programme..." />

            <div className="mt-3 flex flex-wrap gap-1.5">
              {TARGET_ROLES.map((r) => {
                const on = targets.includes(r);
                return (
                  <button key={r} type="button"
                    onClick={() => setTargets((t) => (on ? t.filter((x) => x !== r) : [...t, r]))}
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      on ? 'border-navy bg-navy text-white' : 'border-border bg-background text-muted-foreground'}`}>
                    {r}
                  </button>
                );
              })}
            </div>

            <button type="button" onClick={draftCopy}
              disabled={drafting || (form.work_notes ?? '').trim().length < 20}
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-navy px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {drafting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Draft role and scope
            </button>
          </div>

          <div>
            <label className={label} htmlFor="role_title">
              Role title <span className="normal-case tracking-normal text-muted-foreground">
                ({form.role_title.length}/{MAX_ROLE_TITLE_CHARS})</span>
            </label>
            <input id="role_title" className={field} value={form.role_title}
              onChange={(e) => set('role_title', stripDashes(e.target.value))} />
            {issueFor('role_title') && <p className="mt-1 text-xs text-destructive">{issueFor('role_title')}</p>}
            {!!draftAlts?.role_title?.length && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {draftAlts.role_title.map((alt) => (
                  <button key={alt} type="button" onClick={() => set('role_title', alt)}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted">
                    {alt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className={label} htmlFor="scope_line">
              Scope line <span className="normal-case tracking-normal text-muted-foreground">
                ({form.scope_line.length}/{MAX_SCOPE_LINE_CHARS})</span>
            </label>
            <textarea id="scope_line" className={`${field} min-h-[70px]`} value={form.scope_line}
              onChange={(e) => set('scope_line', stripDashes(e.target.value))} />
            {issueFor('scope_line') && <p className="mt-1 text-xs text-destructive">{issueFor('scope_line')}</p>}
            {!!draftAlts?.scope_line?.length && (
              <div className="mt-2 space-y-1.5">
                {draftAlts.scope_line.map((alt) => (
                  <button key={alt} type="button" onClick={() => set('scope_line', alt)}
                    className="block w-full rounded-md border border-border px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted">
                    {alt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <details className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer text-sm font-semibold text-navy">
              Title, project, mode and signatories
            </summary>
            <div className="mt-4 space-y-4">
              <div>
                <label className={label} htmlFor="cert_title">Certificate title</label>
                <input id="cert_title" className={field} list="cert-titles" value={form.cert_title}
                  onChange={(e) => set('cert_title', stripDashes(e.target.value))} />
                <datalist id="cert-titles">
                  {CERT_TITLE_PRESETS.map((t) => <option key={t} value={t} />)}
                </datalist>
                {issueFor('cert_title') && <p className="mt-1 text-xs text-destructive">{issueFor('cert_title')}</p>}
              </div>
              <div>
                <label className={label} htmlFor="project_title">Project</label>
                <input id="project_title" className={field} value={form.project_title}
                  onChange={(e) => set('project_title', stripDashes(e.target.value))} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor="engagement_mode">Mode</label>
                  <input id="engagement_mode" className={field} value={form.engagement_mode ?? ''}
                    onChange={(e) => set('engagement_mode', e.target.value)} />
                </div>
                <div>
                  <label className={label} htmlFor="reporting_to">Reported to</label>
                  <input id="reporting_to" className={field} value={form.reporting_to ?? ''}
                    onChange={(e) => set('reporting_to', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor="sig1_name">Signatory 1</label>
                  <input id="sig1_name" className={field} value={form.sig1_name}
                    onChange={(e) => set('sig1_name', e.target.value)} />
                  <input className={`${field} mt-2`} value={form.sig1_title}
                    aria-label="Signatory 1 title"
                    onChange={(e) => set('sig1_title', e.target.value)} />
                </div>
                <div>
                  <label className={label} htmlFor="sig2_name">Signatory 2</label>
                  <input id="sig2_name" className={field} value={form.sig2_name}
                    onChange={(e) => set('sig2_name', e.target.value)} />
                  <input className={`${field} mt-2`} value={form.sig2_title}
                    aria-label="Signatory 2 title"
                    onChange={(e) => set('sig2_title', e.target.value)} />
                </div>
              </div>
              {(!sigOk.one || !sigOk.two) && (
                <p className="text-xs text-muted-foreground">
                  Signature image missing. Drop PNGs with transparent backgrounds at
                  <code className="mx-1">public/certificates/signature-founder.png</code> and
                  <code className="mx-1">signature-cofounder.png</code>. Until then the line prints
                  without ink above it.
                </p>
              )}
            </div>
          </details>

          {duplicate && (
            <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
              {duplicate.recipient_name} already has {duplicate.cert_id} starting on the same date.
              Issue anyway if this is a deliberate re-issue.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <button type="button" onClick={issue} disabled={saving || issues.length > 0}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? 'Save changes' : 'Issue certificate'}
            </button>
            <button type="button" onClick={download}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold">
              <Download className="h-4 w-4" /> Download PDF
            </button>
            {issuedCertId && (
              <button type="button" onClick={() => copy(verifyUrlFor(issuedCertId), 'verify')}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm">
                {copied === 'verify' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy verify link
              </button>
            )}
            <button type="button" onClick={reset}
              className="ml-auto inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-4 w-4" /> New
            </button>
          </div>
          {!editingId && (
            <p className="text-xs text-muted-foreground">
              The certificate ID is generated on save. Download before issuing and it will carry a
              placeholder ID whose QR does not resolve.
            </p>
          )}
        </div>

        {/* ── preview ──────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live preview
            </p>
            {previewing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          {previewUrl ? (
            <iframe title="Certificate preview" src={`${previewUrl}#toolbar=0&navpanes=0`}
              className="h-[520px] w-full rounded-lg border border-border bg-white" />
          ) : (
            <div className="flex h-[520px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              Rendering…
            </div>
          )}
        </div>
      </div>

      {/* ── issued list ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-navy">Issued ({rows.length})</h2>
          <div className="relative ml-auto">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input className={`${field} w-64 pl-8`} value={query}
              onChange={(e) => setQuery(e.target.value)} placeholder="Name or certificate ID" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            {rows.length ? 'Nothing matches that search.' : 'No certificates issued yet.'}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {row.recipient_name}
                    {row.revoked_at && (
                      <span className="ml-2 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-destructive">
                        revoked
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.role_title} · {formatCertDate(row.start_date)} to {formatCertDate(row.end_date)}
                  </p>
                </div>
                <code className="shrink-0 text-xs text-muted-foreground">{row.cert_id}</code>
                <button type="button" onClick={() => copy(verifyUrlFor(row.cert_id), row.id)}
                  className="shrink-0 rounded-md border border-border px-2.5 py-1.5 text-xs">
                  {copied === row.id ? 'Copied' : 'Link'}
                </button>
                <button type="button" onClick={() => loadRow(row)}
                  className="shrink-0 rounded-md border border-border px-2.5 py-1.5 text-xs">
                  Edit
                </button>
                <button type="button" onClick={() => toggleRevoke(row)}
                  className={`shrink-0 inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs ${
                    row.revoked_at ? 'border-border' : 'border-destructive/40 text-destructive'}`}>
                  <Ban className="h-3 w-3" /> {row.revoked_at ? 'Reinstate' : 'Revoke'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

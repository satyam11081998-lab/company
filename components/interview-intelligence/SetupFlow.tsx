'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, FileUp, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ii, IIError } from '@/lib/interview-intelligence/api';
import { DEPTHS, DIFFICULTIES, MODES, titleCase } from '@/lib/interview-intelligence/format';
import type { IIDocument, IIMe, IISession, InterviewConfigInput } from '@/lib/interview-intelligence/types';
import { AccessGate, ErrorNote, Spinner } from './primitives';

const ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const STEPS = ['Resume', 'Job description', 'Role understanding', 'Interview type', 'Difficulty', 'Duration', 'Start'];

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function waitForAnalysis(id: string, onUpdate: (d: IIDocument) => void): Promise<IIDocument> {
  for (let i = 0; i < 90; i++) {
    const d = await ii.document(id);
    onUpdate(d);
    if (['ready', 'failed', 'unreadable'].includes(d.analysis_status)) return d;
    await sleep(i < 10 ? 1500 : 3000);
  }
  throw new IIError(504, 'timeout', 'Analysis is taking longer than expected. You can come back to it from Interview Intelligence.');
}

export default function SetupFlow() {
  return <AccessGate>{(me) => <Setup me={me} />}</AccessGate>;
}

function Setup({ me }: { me: IIMe }) {
  const router = useRouter();
  const params = useSearchParams();
  const resumeId = params.get('session');

  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState<IIDocument[]>([]);
  const [cv, setCv] = useState<IIDocument | null>(null);
  const [jd, setJd] = useState<IIDocument | null>(null);
  const [pasted, setPasted] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeConflict, setActiveConflict] = useState<{ id: string; role_title: string; status: string }[] | null>(null);

  const [cfg, setCfg] = useState<InterviewConfigInput>({
    mode: 'mixed', depth: 'standard', difficulty: 'medium',
    duration_minutes: me.limits.allowed_durations.includes(45) ? 45 : me.limits.allowed_durations[0] || 30,
  });
  const [company, setCompany] = useState({ name: '', notes: '' });
  const [session, setSession] = useState<IISession | null>(null);
  const building = useRef(false);

  useEffect(() => {
    ii.documents().then((r) => setSaved(r.documents.filter((d) => d.parse_status === 'parsed'))).catch(() => undefined);
  }, []);

  const pollSession = useCallback(async (id: string) => {
    if (building.current) return;
    building.current = true;
    try {
      for (let i = 0; i < 120; i++) {
        const s = await ii.session(id);
        setSession(s);
        if (!['created', 'uploading', 'analyzing'].includes(s.status)) break;
        await sleep(2000);
      }
    } catch (e) {
      setError((e as IIError).message);
    } finally {
      building.current = false;
    }
  }, []);

  useEffect(() => {
    if (resumeId) { setStep(6); pollSession(resumeId); }
  }, [resumeId, pollSession]);

  async function pickDoc(kind: 'cv' | 'jd', doc: IIDocument) {
    setError(null);
    const set = kind === 'cv' ? setCv : setJd;
    set(doc);
    if (doc.analysis_status !== 'ready') {
      setBusy(kind);
      try { set(await waitForAnalysis(doc.id, set)); } catch (e) { setError((e as IIError).message); } finally { setBusy(null); }
    } else {
      try { set(await ii.document(doc.id)); } catch { /* keep the summary row */ }
    }
  }

  async function uploadFile(kind: 'cv' | 'jd', file: File | undefined) {
    if (!file) return;
    setError(null);
    const max = me.limits.max_upload_mb * 1024 * 1024;
    if (file.size > max) { setError(`That file is larger than ${me.limits.max_upload_mb} MB.`); return; }
    if (!/\.(pdf|docx?|DOCX?|PDF)$/.test(file.name)) { setError('Upload a PDF, DOC or DOCX file.'); return; }
    setBusy(kind);
    try {
      const d = await ii.upload(kind, file);
      if (d.parse_status !== 'parsed') {
        setError(d.parse_error || `We couldn't reliably read that file. Please re-upload it.`);
        return;
      }
      await pickDoc(kind, d);
    } catch (e) {
      setError((e as IIError).message);
    } finally {
      setBusy(null);
    }
  }

  async function submitPaste() {
    if (pasted.trim().length < 200) { setError('Paste the full job description (at least a few paragraphs).'); return; }
    setBusy('jd'); setError(null);
    try { await pickDoc('jd', await ii.pasteJD(pasted)); } catch (e) { setError((e as IIError).message); } finally { setBusy(null); }
  }

  async function build() {
    if (!cv || !jd) return;
    setError(null); setActiveConflict(null); setBusy('build');
    try {
      const s = await ii.createSession(cv.id, jd.id, {
        ...cfg,
        company_name: company.name.trim() || undefined,
        company_notes: company.notes.trim() || undefined,
      });
      setSession(s);
      router.replace(`/interview-intelligence/new?session=${s.id}`);
      await pollSession(s.id);
    } catch (e) {
      const err = e as IIError;
      if (err.code === 'active_limit') {
        setActiveConflict((err.extra.active_sessions as { id: string; role_title: string; status: string }[]) || []);
      }
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  const cvReady = cv?.analysis_status === 'ready';
  const jdReady = jd?.analysis_status === 'ready';
  const canNext = [cvReady, jdReady, true, true, true, true, false][step];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/interview-intelligence" className="text-sm text-muted-foreground hover:text-foreground">Interview Intelligence</Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Set up your interview</h1>

      <ol className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Setup steps">
        {STEPS.map((label, i) => (
          <li key={label} className={`flex items-center gap-1.5 ${i === step ? 'font-semibold text-foreground' : i < step ? 'text-foreground' : 'text-muted-foreground'}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[11px] ${i < step ? 'border-navy bg-navy text-navy-foreground' : i === step ? 'border-navy text-navy dark:text-foreground' : 'border-border'}`}>
              {i < step ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        {step === 0 && (
          <DocStep
            kind="cv" title="Your CV" hint={`PDF, DOC or DOCX, up to ${me.limits.max_upload_mb} MB.`}
            saved={saved.filter((d) => d.kind === 'cv')} current={cv} busy={busy === 'cv'}
            onPick={(d) => pickDoc('cv', d)} onFile={(f) => uploadFile('cv', f)}
          />
        )}
        {step === 1 && (
          <DocStep
            kind="jd" title="The job description" hint="Upload the file or paste the full text."
            saved={saved.filter((d) => d.kind === 'jd')} current={jd} busy={busy === 'jd'}
            onPick={(d) => pickDoc('jd', d)} onFile={(f) => uploadFile('jd', f)}
          >
            <label className="mt-6 block text-sm font-medium" htmlFor="jd-paste">Or paste it</label>
            <textarea
              id="jd-paste" value={pasted} onChange={(e) => setPasted(e.target.value)} rows={7}
              className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Role title, responsibilities, requirements…"
            />
            <Button variant="outline" className="mt-2" onClick={submitPaste} disabled={busy === 'jd' || !pasted.trim()}>
              Use this text
            </Button>
          </DocStep>
        )}
        {step === 2 && cv && jd && (
          <RoleUnderstanding cv={cv} jd={jd} company={company} setCompany={setCompany} companyIntel={me.flags.company_intel} />
        )}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold">What kind of interview?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Each type changes the interview plan, not just the wording.</p>
            {(['core', 'focus', 'pressure'] as const).map((g) => (
              <fieldset key={g} className="mt-5">
                <legend className="text-sm font-medium text-muted-foreground">
                  {g === 'core' ? 'Full interviews' : g === 'focus' ? 'Focused' : 'High scrutiny'}
                </legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {MODES.filter((m) => m.group === g && (m.id !== 'technical_deep_dive' || me.flags.advanced_technical)).map((m) => (
                    <Choice key={m.id} selected={cfg.mode === m.id} onSelect={() => setCfg({ ...cfg, mode: m.id })}
                      title={m.label} body={m.blurb} />
                  ))}
                </div>
              </fieldset>
            ))}
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-muted-foreground">Depth</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {DEPTHS.map((d) => (
                  <Pill key={d.id} selected={cfg.depth === d.id} onSelect={() => setCfg({ ...cfg, depth: d.id })}>{d.label}</Pill>
                ))}
              </div>
            </fieldset>
          </div>
        )}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold">How hard should it be?</h2>
            <div className="mt-4 grid gap-2">
              {DIFFICULTIES.map((d) => (
                <Choice key={d.id} selected={cfg.difficulty === d.id} onSelect={() => setCfg({ ...cfg, difficulty: d.id })}
                  title={d.label} body={d.blurb} />
              ))}
            </div>
          </div>
        )}
        {step === 5 && (
          <div>
            <h2 className="text-lg font-semibold">How long?</h2>
            <p className="mt-1 text-sm text-muted-foreground">A full interview is about 40–45 minutes. You can end early at any point.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {me.limits.allowed_durations.map((m) => (
                <Pill key={m} selected={cfg.duration_minutes === m} onSelect={() => setCfg({ ...cfg, duration_minutes: m })}>
                  {m === 45 ? '40–45 min' : `${m} min`}
                </Pill>
              ))}
            </div>
          </div>
        )}
        {step === 6 && (
          <BuildStep
            session={session} busy={busy === 'build'} canBuild={Boolean(cvReady && jdReady)} onBuild={build}
            cfg={cfg} activeConflict={activeConflict}
          />
        )}

        <div className="mt-6"><ErrorNote error={error} /></div>

        {step < 6 && (
          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={() => { setError(null); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0}>
              Back
            </Button>
            <Button onClick={() => { setError(null); setStep((s) => s + 1); }} disabled={!canNext || Boolean(busy)}>
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Choice({ selected, onSelect, title, body }: { selected: boolean; onSelect: () => void; title: string; body: string }) {
  return (
    <button
      type="button" onClick={onSelect} aria-pressed={selected}
      className={`rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
        selected ? 'border-navy bg-navy/5 dark:border-navy-foreground/60' : 'border-border hover:border-border-strong'}`}
    >
      <span className="block font-medium">{title}</span>
      <span className="mt-0.5 block text-sm text-muted-foreground">{body}</span>
    </button>
  );
}

function Pill({ selected, onSelect, children }: { selected: boolean; onSelect: () => void; children: ReactNode }) {
  return (
    <button
      type="button" onClick={onSelect} aria-pressed={selected}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
        selected ? 'border-navy bg-navy text-navy-foreground' : 'border-border hover:border-border-strong'}`}
    >
      {children}
    </button>
  );
}

function DocStep({ kind, title, hint, saved, current, busy, onPick, onFile, children }: {
  kind: 'cv' | 'jd'; title: string; hint: string; saved: IIDocument[]; current: IIDocument | null; busy: boolean;
  onPick: (d: IIDocument) => void; onFile: (f: File | undefined) => void; children?: ReactNode;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input ref={input} type="file" accept={ACCEPT} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        <Button variant="outline" onClick={() => input.current?.click()} disabled={busy}>
          <FileUp /> Upload {kind === 'cv' ? 'CV' : 'file'}
        </Button>
        {busy && <Spinner label={current ? 'Analysing…' : 'Uploading…'} />}
      </div>

      {current && (
        <div className="mt-5 rounded-lg border border-border px-4 py-3 text-sm">
          <p className="font-medium">
            {kind === 'cv' ? 'CV' : 'Job description'} v{current.version}
            {current.file_name ? ` · ${current.file_name}` : ''}
          </p>
          <p className="mt-0.5 text-muted-foreground">
            {current.analysis_status === 'ready' ? 'Analysed and ready.' :
              current.analysis_status === 'failed' ? 'We could not analyse this document. Try uploading it again.' :
                current.analysis_status === 'unreadable' ? "We couldn't reliably read this file. Please re-upload it." :
                  'Reading and analysing…'}
          </p>
          {current.warnings?.length > 0 && (
            <ul className="mt-2 space-y-1 text-viz-warning">
              {current.warnings.map((w) => <li key={w} className="flex gap-1.5"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{w}</li>)}
            </ul>
          )}
        </div>
      )}

      {saved.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium">Or use one you’ve uploaded before</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {saved.slice(0, 6).map((d) => (
              <li key={d.id}>
                <button
                  type="button" onClick={() => onPick(d)} disabled={busy}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                    current?.id === d.id ? 'border-navy bg-navy/5' : 'border-border hover:border-border-strong'}`}
                >
                  <span className="font-medium">v{d.version}</span>{' '}
                  <span className="text-muted-foreground">{d.file_name || (d.source === 'paste' ? 'pasted text' : '')}</span>
                  <span className="block text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </div>
  );
}

function RoleUnderstanding({ cv, jd, company, setCompany, companyIntel }: {
  cv: IIDocument; jd: IIDocument; company: { name: string; notes: string };
  setCompany: (c: { name: string; notes: string }) => void; companyIntel: boolean;
}) {
  const role = jd.analysis || {};
  const prof = cv.analysis || {};
  const identity = role.identity || {};
  const must = (role.requirements || []).filter((r: any) => r.importance === 'must');
  const should = (role.requirements || []).filter((r: any) => r.importance !== 'must');
  const claims = prof.claims || [];
  const flagged = Object.keys(prof.claim_flags || {}).length;
  const timeline = prof.timeline_issues || [];
  const seniority = role.seniority || {};
  const contradictions = role.quality?.contradictions || [];

  return (
    <div>
      <h2 className="text-lg font-semibold">What we understood</h2>
      <p className="mt-1 text-sm text-muted-foreground">Check this before the interview is built. If something is wrong, go back and upload a clearer document.</p>

      <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <Fact label="Role">{identity.title || identity.role_name || 'Not stated in the JD'}</Fact>
        <Fact label="Company">{identity.company || 'Not stated in the JD'}</Fact>
        <Fact label="Seniority">
          {seniority.level && seniority.level !== 'unknown' ? titleCase(seniority.level) : 'Unclear from the JD'}
          {seniority.confidence === 'low' && seniority.level !== 'unknown' ? ' (low confidence)' : ''}
        </Fact>
        <Fact label="Function">{identity.function || '—'}</Fact>
      </dl>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium">Requirements to test</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {must.slice(0, 5).map((r: any) => <li key={r.id} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy dark:bg-foreground" />{r.text}</li>)}
            {should.slice(0, Math.max(0, 6 - must.length)).map((r: any) => <li key={r.id} className="flex gap-2 text-muted-foreground"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-muted-foreground" />{r.text}</li>)}
          </ul>
          {contradictions.length > 0 && <p className="mt-2 text-sm text-viz-warning">The JD contradicts itself: {contradictions[0]}</p>}
        </div>
        <div>
          <p className="text-sm font-medium">From your CV</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {claims.length} claim{claims.length === 1 ? '' : 's'} found{flagged ? `, ${flagged} the interviewer will want to probe closely` : ''}.
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {claims.slice(0, 4).map((c: any) => <li key={c.id} className="line-clamp-2">“{c.text}”</li>)}
          </ul>
          {timeline.length > 0 && <p className="mt-2 text-sm text-muted-foreground">Timeline note: {timeline[0].detail}</p>}
        </div>
      </div>

      {companyIntel && (
        <div className="mt-8">
          <p className="text-sm font-medium">Company context (optional)</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Used to enrich questions, never to override the job description. Nothing is presented as fact unless it came from you or the JD.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_2fr]">
            <input
              value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} maxLength={120}
              placeholder="Company name" aria-label="Company name"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <input
              value={company.notes} onChange={(e) => setCompany({ ...company, notes: e.target.value })} maxLength={3000}
              placeholder="Anything you know about the team or business (optional)" aria-label="Company notes"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  );
}

function BuildStep({ session, busy, canBuild, onBuild, cfg, activeConflict }: {
  session: IISession | null; busy: boolean; canBuild: boolean; onBuild: () => void; cfg: InterviewConfigInput;
  activeConflict: { id: string; role_title: string; status: string }[] | null;
}) {
  const mode = MODES.find((m) => m.id === cfg.mode);
  if (!session) {
    return (
      <div>
        <h2 className="text-lg font-semibold">Build the interview</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode?.label} · {titleCase(cfg.difficulty)} · {cfg.duration_minutes === 45 ? '40–45' : cfg.duration_minutes} minutes.
          We’ll map the role’s competencies, decide what to test and which CV claims to investigate, then check the plan
          before you start.
        </p>
        {activeConflict && activeConflict.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm">
            {activeConflict.map((a) => (
              <li key={a.id}>
                <Link className="underline underline-offset-2" href={`/interview-intelligence/session/${a.id}`}>{a.role_title || 'Interview'}</Link>
                <span className="text-muted-foreground"> — {a.status}</span>
              </li>
            ))}
          </ul>
        )}
        <Button className="mt-6" onClick={onBuild} disabled={!canBuild || busy}>
          {busy && <Loader2 className="animate-spin" />} Build my interview
        </Button>
      </div>
    );
  }
  if (session.status === 'failed') {
    return (
      <div>
        <h2 className="text-lg font-semibold">We couldn’t prepare this interview</h2>
        <p className="mt-2 text-sm text-muted-foreground">{session.status_reason || 'Please try again.'}</p>
        <Button asChild className="mt-6" variant="outline"><Link href="/interview-intelligence/new">Start over</Link></Button>
      </div>
    );
  }
  if (!['ready', 'active', 'paused'].includes(session.status)) {
    return (
      <div className="py-6">
        <Spinner label="Building your interview: mapping competencies, choosing questions and checking the plan…" />
        <p className="mt-3 text-sm text-muted-foreground">This usually takes under a minute. You can leave this page; it keeps going.</p>
      </div>
    );
  }
  const p = session.pre_interview_summary;
  return (
    <div>
      <h2 className="text-lg font-semibold">Your interview is ready</h2>
      {p && (
        <>
          <p className="mt-3 text-base">
            We identified <strong>{p.competencies_identified}</strong> competencies for this role.{' '}
            <strong>{p.strong_in_cv}</strong> are strongly represented in your CV;{' '}
            <strong>{p.need_validation}</strong> need deeper validation in the interview.
          </p>
          <ul className="mt-5 divide-y divide-border rounded-lg border border-border text-sm">
            {p.sections.filter((s) => s.kind !== 'intro' && s.kind !== 'closing').map((s) => (
              <li key={s.kind} className="flex justify-between px-4 py-2">
                <span>{s.title}</span>
                <span className="text-muted-foreground">~{Math.round(s.minutes)} min · {s.questions} planned</span>
              </li>
            ))}
          </ul>
          {p.claims_to_investigate > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">{p.claims_to_investigate} CV claims are lined up for verification.</p>
          )}
          {p.not_planned && p.not_planned.length > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              In {session.duration_minutes} minutes there isn’t room to plan a question for: {p.not_planned.join(', ')}.
              They’ll be reported as not tested, not as weaknesses.
            </p>
          )}
          {(p.jd_warnings.length > 0 || p.cv_warnings.length > 0) && (
            <ul className="mt-3 space-y-1 text-sm text-viz-warning">
              {[...p.jd_warnings, ...p.cv_warnings].slice(0, 3).map((w) => <li key={w}>{w}</li>)}
            </ul>
          )}
        </>
      )}
      <p className="mt-6 text-sm text-muted-foreground">
        During the interview you won’t see scores or hints. Answer as you would in the real room; you can pause or end at any time.
      </p>
      <Button asChild className="mt-4" size="lg">
        <Link href={`/interview-intelligence/session/${session.id}`}>{session.status === 'ready' ? 'Start interview' : 'Return to interview'}</Link>
      </Button>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { refineBullet, fitBullet, generateBullets, rebuildResume, type ResumeBulletOption } from '@/lib/api';
import {
  EMPTY_RESUME, BULLET, fillState, type ResumeData, type ExperienceItem, type EducationRow,
  type PorItem, type CertItem, type ExtraGroup,
} from '@/lib/resume/schema';
import {
  Sparkles, Scissors, Plus, Trash2, Save, Download, Loader2, Wand2, ChevronDown,
} from 'lucide-react';

const inp = 'w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

async function token(): Promise<string | undefined> {
  const { data } = await createClient().auth.getSession();
  return data.session?.access_token;
}

export function ResumeEditor({ initialId, initialTitle, initialData }: {
  initialId: string | null;
  initialTitle: string;
  initialData: ResumeData;
}) {
  const [data, setData] = useState<ResumeData>(initialData);
  const [title, setTitle] = useState(initialTitle);
  const [resumeId, setResumeId] = useState<string | null>(initialId);
  const [saving, setSaving] = useState(false);
  const [rebuildOpen, setRebuildOpen] = useState(false);
  const [rebuildText, setRebuildText] = useState('');
  const [rebuilding, setRebuilding] = useState(false);
  const [downloading, setDownloading] = useState(false);

  function patch(p: Partial<ResumeData>) { setData((d) => ({ ...d, ...p })); }

  async function save() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Please sign in again.'); return; }
      const row = { user_id: user.id, title: title.trim() || 'My Resume', template: 'mece-bschool-v1', data: data as any, updated_at: new Date().toISOString() };
      if (resumeId) {
        const { error } = await supabase.from('resumes').update(row).eq('id', resumeId);
        if (error) throw error;
      } else {
        const { data: ins, error } = await supabase.from('resumes').insert(row).select('id').single();
        if (error) throw error;
        setResumeId((ins as { id: string }).id);
      }
      toast.success('Saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const { downloadResumePdf } = await import('./resume-pdf');
      await downloadResumePdf(data, title);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'PDF export failed');
    } finally { setDownloading(false); }
  }

  async function runRebuild() {
    if (rebuildText.trim().length < 40) { toast.error('Paste your full résumé text.'); return; }
    setRebuilding(true);
    try {
      const t = await token();
      const built = await rebuildResume(rebuildText, t);
      setData({ ...EMPTY_RESUME, ...built });
      setRebuildOpen(false);
      setRebuildText('');
      toast.success('Resume rebuilt — review and save.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Rebuild failed');
    } finally { setRebuilding(false); }
  }

  return (
    <div className="min-h-screen bg-muted">
      <PrintStyles />
      {rebuildOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !rebuilding && setRebuildOpen(false)}>
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground">Build from your existing résumé</h3>
            <p className="mt-1 text-sm text-muted-foreground">Paste your current résumé text. AI restructures it into the MECE one-page format and tightens every bullet. This replaces the current content — you can still edit before saving.</p>
            <textarea value={rebuildText} onChange={(e) => setRebuildText(e.target.value)} rows={12} className="mt-3 w-full rounded-md border border-input bg-background p-3 text-sm focus:border-primary focus:outline-none" placeholder="Paste your résumé here…" />
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setRebuildOpen(false)} disabled={rebuilding} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
              <button onClick={runRebuild} disabled={rebuilding} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {rebuilding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} {rebuilding ? 'Building…' : 'Build my resume'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="no-print sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="container max-w-7xl flex items-center gap-3 py-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="max-w-xs rounded-md border border-input bg-background px-3 py-1.5 text-sm font-semibold" />
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setRebuildOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary hover:bg-primary/10">
              <Wand2 className="h-4 w-4" /> Build from résumé
            </button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </button>
            <button onClick={handleDownload} disabled={downloading} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {downloading ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl grid gap-6 py-6 lg:grid-cols-2">
        {/* EDITOR */}
        <div className="no-print space-y-5">
          <Header data={data} patch={patch} />
          <EducationEditor rows={data.education} onChange={(education) => patch({ education })} />
          <ExperienceEditor title="Work Experience" items={data.workExperience} onChange={(workExperience) => patch({ workExperience })} />
          <ExperienceEditor title="Internships" items={data.internships} onChange={(internships) => patch({ internships })} />
          <ExperienceEditor title="Projects" items={data.projects} onChange={(projects) => patch({ projects })} />
          <PorEditor items={data.positionsOfResponsibility} onChange={(positionsOfResponsibility) => patch({ positionsOfResponsibility })} />
          <SimpleBullets title="Academic Achievements" items={data.academicAchievements} onChange={(academicAchievements) => patch({ academicAchievements })} />
          <SimpleBullets title="Awards & Recognition" items={data.awards} onChange={(awards) => patch({ awards })} />
          <CertEditor rows={data.certifications} onChange={(certifications) => patch({ certifications })} />
          <ExtraEditor groups={data.extracurricular} onChange={(extracurricular) => patch({ extracurricular })} />
          <AdditionalEditor data={data} patch={patch} />
        </div>

        {/* PREVIEW */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="resume-print-area mx-auto bg-white text-black shadow-sm" style={{ width: '100%', maxWidth: 780, padding: '28px 32px', fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 11.5, lineHeight: 1.32 }}>
            <Preview data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── editor sections ───────────────────────── */

function Section({ title, children, onAdd, addLabel }: { title: string; children: React.ReactNode; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">{title}</h2>
        {onAdd && (
          <button onClick={onAdd} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted">
            <Plus className="h-3.5 w-3.5" /> {addLabel || 'Add'}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Header({ data, patch }: { data: ResumeData; patch: (p: Partial<ResumeData>) => void }) {
  const h = data.header;
  const set = (k: keyof typeof h, v: string) => patch({ header: { ...h, [k]: v } });
  return (
    <Section title="Header">
      <div className="grid gap-2 sm:grid-cols-2">
        <input className={inp} value={h.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" />
        <input className={inp} value={h.program} onChange={(e) => set('program', e.target.value)} placeholder="Program (e.g. PGDM 2025-27, IMI Delhi)" />
        <input className={inp} value={h.email} onChange={(e) => set('email', e.target.value)} placeholder="Email" />
        <input className={inp} value={h.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Phone" />
        <input className={inp} value={h.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="LinkedIn URL" />
        <input className={inp} value={h.extra} onChange={(e) => set('extra', e.target.value)} placeholder="Optional (e.g. Male, 26 years)" />
      </div>
    </Section>
  );
}

function EducationEditor({ rows, onChange }: { rows: EducationRow[]; onChange: (r: EducationRow[]) => void }) {
  const upd = (i: number, k: keyof EducationRow, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <Section title="Academic Qualifications" addLabel="Row" onAdd={() => onChange([...rows, { degree: '', institute: '', board: '', score: '', year: '' }])}>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input className={inp} value={r.degree} onChange={(e) => upd(i, 'degree', e.target.value)} placeholder="Degree / Exam" />
            <input className={inp} value={r.institute} onChange={(e) => upd(i, 'institute', e.target.value)} placeholder="Institute" />
            <button onClick={() => onChange(rows.filter((_, j) => j !== i))} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            <input className={inp} value={r.board} onChange={(e) => upd(i, 'board', e.target.value)} placeholder="Board / University (optional)" />
            <input className={inp} value={r.score} onChange={(e) => upd(i, 'score', e.target.value)} placeholder="% / CGPA / Pursuing" />
            <input className={inp} value={r.year} onChange={(e) => upd(i, 'year', e.target.value)} placeholder="Year" />
          </div>
        ))}
      </div>
    </Section>
  );
}

function ExperienceEditor({ title, items, onChange }: { title: string; items: ExperienceItem[]; onChange: (it: ExperienceItem[]) => void }) {
  const upd = (i: number, p: Partial<ExperienceItem>) => onChange(items.map((it, j) => (j === i ? { ...it, ...p } : it)));
  return (
    <Section title={title} addLabel="Entry" onAdd={() => onChange([...items, { org: '', role: '', dates: '', meta: '', bullets: [] }])}>
      <div className="space-y-4">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input className={inp} value={it.org} onChange={(e) => upd(i, { org: e.target.value })} placeholder="Organization" />
              <input className={inp} value={it.role} onChange={(e) => upd(i, { role: e.target.value })} placeholder="Role" />
              <input className={inp} value={it.dates} onChange={(e) => upd(i, { dates: e.target.value })} placeholder="Dates (e.g. Sep'21 - Sep'22)" />
              <input className={inp} value={it.meta} onChange={(e) => upd(i, { meta: e.target.value })} placeholder="Duration (e.g. 13 months)" />
            </div>
            <BulletList bullets={it.bullets} onChange={(bullets) => upd(i, { bullets })} context={`${it.role} at ${it.org}`} />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="mt-2 inline-flex items-center gap-1 text-xs text-destructive hover:underline"><Trash2 className="h-3.5 w-3.5" /> Remove entry</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function PorEditor({ items, onChange }: { items: PorItem[]; onChange: (it: PorItem[]) => void }) {
  const upd = (i: number, p: Partial<PorItem>) => onChange(items.map((it, j) => (j === i ? { ...it, ...p } : it)));
  return (
    <Section title="Positions of Responsibility" addLabel="Entry" onAdd={() => onChange([...items, { org: '', role: '', year: '', bullets: [] }])}>
      <div className="space-y-4">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <input className={inp} value={it.org} onChange={(e) => upd(i, { org: e.target.value })} placeholder="Organization" />
              <input className={inp} value={it.role} onChange={(e) => upd(i, { role: e.target.value })} placeholder="Role" />
              <input className={inp} value={it.year} onChange={(e) => upd(i, { year: e.target.value })} placeholder="Year" />
            </div>
            <BulletList bullets={it.bullets} onChange={(bullets) => upd(i, { bullets })} context={`${it.role}, ${it.org}`} />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="mt-2 inline-flex items-center gap-1 text-xs text-destructive hover:underline"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SimpleBullets({ title, items, onChange }: { title: string; items: string[]; onChange: (s: string[]) => void }) {
  return (
    <Section title={title}>
      <BulletList bullets={items} onChange={onChange} context={title} />
    </Section>
  );
}

function CertEditor({ rows, onChange }: { rows: CertItem[]; onChange: (r: CertItem[]) => void }) {
  const upd = (i: number, k: keyof CertItem, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <Section title="Certifications" addLabel="Row" onAdd={() => onChange([...rows, { provider: '', title: '', year: '' }])}>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_1.4fr_5rem_auto] gap-2">
            <input className={inp} value={r.provider} onChange={(e) => upd(i, 'provider', e.target.value)} placeholder="Provider" />
            <input className={inp} value={r.title} onChange={(e) => upd(i, 'title', e.target.value)} placeholder="Course / certificate" />
            <input className={inp} value={r.year} onChange={(e) => upd(i, 'year', e.target.value)} placeholder="Year" />
            <button onClick={() => onChange(rows.filter((_, j) => j !== i))} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ExtraEditor({ groups, onChange }: { groups: ExtraGroup[]; onChange: (g: ExtraGroup[]) => void }) {
  const upd = (i: number, p: Partial<ExtraGroup>) => onChange(groups.map((g, j) => (j === i ? { ...g, ...p } : g)));
  return (
    <Section title="Extracurricular" addLabel="Group" onAdd={() => onChange([...groups, { category: '', bullets: [] }])}>
      <div className="space-y-4">
        {groups.map((g, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <input className={inp} value={g.category} onChange={(e) => upd(i, { category: e.target.value })} placeholder="Category (e.g. Sports, Social Service)" />
              <button onClick={() => onChange(groups.filter((_, j) => j !== i))} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </div>
            <BulletList bullets={g.bullets} onChange={(bullets) => upd(i, { bullets })} context={g.category} />
          </div>
        ))}
      </div>
    </Section>
  );
}

function AdditionalEditor({ data, patch }: { data: ResumeData; patch: (p: Partial<ResumeData>) => void }) {
  const a = data.additionalInfo;
  return (
    <Section title="Additional Information">
      <p className="mb-1 text-xs font-medium text-muted-foreground">Competitive exam scores</p>
      <BulletList bullets={a.examScores} onChange={(examScores) => patch({ additionalInfo: { ...a, examScores } })} context="competitive exam score" />
      <p className="mt-3 mb-1 text-xs font-medium text-muted-foreground">Skills (comma separated)</p>
      <input className={inp} value={a.skills.join(', ')} onChange={(e) => patch({ additionalInfo: { ...a, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } })} placeholder="Excel, PowerPoint, SQL, Python" />
      <p className="mt-3 mb-1 text-xs font-medium text-muted-foreground">Hobbies (comma separated)</p>
      <input className={inp} value={a.hobbies.join(', ')} onChange={(e) => patch({ additionalInfo: { ...a, hobbies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } })} placeholder="Travel, Football, Chess" />
    </Section>
  );
}

/* ───────────────────────── bullet editing + AI ───────────────────────── */

function BulletList({ bullets, onChange, context }: { bullets: string[]; onChange: (b: string[]) => void; context: string }) {
  const [gen, setGen] = useState(false);
  return (
    <div className="mt-2 space-y-2">
      {bullets.map((b, i) => (
        <BulletRow
          key={i}
          value={b}
          onChange={(v) => onChange(bullets.map((x, j) => (j === i ? v : x)))}
          onRemove={() => onChange(bullets.filter((_, j) => j !== i))}
        />
      ))}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onChange([...bullets, ''])} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"><Plus className="h-3.5 w-3.5" /> Bullet</button>
        <button onClick={() => setGen((v) => !v)} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-primary hover:bg-primary/5"><Wand2 className="h-3.5 w-3.5" /> Generate with AI</button>
      </div>
      {gen && <GenerateBox context={context} onAppend={(t) => onChange([...bullets, t])} />}
    </div>
  );
}

function meterColor(len: number) {
  const s = fillState(len);
  return s === 'over' ? 'text-red-600' : s === 'ideal' ? 'text-emerald-600' : 'text-amber-600';
}

function BulletRow({ value, onChange, onRemove }: { value: string; onChange: (v: string) => void; onRemove: () => void }) {
  const [busy, setBusy] = useState<null | 'refine' | 'fit'>(null);
  const [opts, setOpts] = useState<ResumeBulletOption[] | null>(null);
  const len = value.length;

  async function run(kind: 'refine' | 'fit') {
    if (!value.trim()) { toast.error('Write something first.'); return; }
    setBusy(kind); setOpts(null);
    try {
      const t = await token();
      const res = kind === 'refine' ? await refineBullet(value, '', BULLET.hardMax, t) : await fitBullet(value, BULLET.hardMax, t);
      setOpts(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'AI failed');
    } finally { setBusy(null); }
  }

  return (
    <div className="rounded-md border border-border bg-background p-2">
      <div className="flex items-start gap-2">
        <textarea
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\n/g, ' '))}
          className="min-h-[34px] flex-1 resize-none rounded border border-input bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
          placeholder="One-line, quantified bullet (starts with a strong verb or a number)"
        />
        <button onClick={onRemove} className="mt-1 rounded p-1 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
      </div>
      <div className="mt-1 flex items-center gap-3 text-xs">
        <span className={`font-mono ${meterColor(len)}`}>{len}/{BULLET.hardMax}</span>
        <button onClick={() => run('refine')} disabled={busy !== null} className="inline-flex items-center gap-1 text-primary hover:underline disabled:opacity-50">
          {busy === 'refine' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Refine
        </button>
        <button onClick={() => run('fit')} disabled={busy !== null} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-50">
          {busy === 'fit' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Scissors className="h-3 w-3" />} Fit to line
        </button>
      </div>
      {opts && opts.length > 0 && (
        <div className="mt-2 space-y-1 rounded border border-border bg-muted/40 p-2">
          {opts.map((o, i) => (
            <button key={i} onClick={() => { onChange(o.text); setOpts(null); }} className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-background">
              <span className="text-foreground">{o.text}</span>
              <span className={`ml-2 font-mono ${meterColor(o.chars)}`}>({o.chars})</span>
              {o.rationale && <span className="block text-[11px] text-muted-foreground">{o.rationale}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GenerateBox({ context, onAppend }: { context: string; onAppend: (t: string) => void }) {
  const [role, setRole] = useState(context);
  const [task, setTask] = useState('');
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);
  const [opts, setOpts] = useState<ResumeBulletOption[] | null>(null);

  async function go() {
    setBusy(true); setOpts(null);
    try {
      const t = await token();
      const res = await generateBullets({ role, task, result, domain: '', count: 3, maxChars: BULLET.hardMax }, t);
      setOpts(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'AI failed');
    } finally { setBusy(false); }
  }

  return (
    <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5">
      <div className="grid gap-2 sm:grid-cols-3">
        <input className={inp} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role / context" />
        <input className={inp} value={task} onChange={(e) => setTask(e.target.value)} placeholder="What you did" />
        <input className={inp} value={result} onChange={(e) => setResult(e.target.value)} placeholder="Result / impact" />
      </div>
      <button onClick={go} disabled={busy} className="mt-2 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />} Generate
      </button>
      {opts && (
        <div className="mt-2 space-y-1">
          {opts.map((o, i) => (
            <button key={i} onClick={() => onAppend(o.text)} className="flex w-full items-center justify-between rounded border border-border bg-background px-2 py-1 text-left text-xs hover:border-primary/40">
              <span>{o.text}</span>
              <span className="ml-2 inline-flex items-center gap-1 text-primary"><Plus className="h-3 w-3" /> add</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── preview (printable) ───────────────────────── */

function PvSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, borderBottom: '1.2px solid #000', paddingBottom: 2, marginBottom: 4 }}>{title}</div>
      {children}
    </div>
  );
}

function Bul({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 16 }}>
      {items.filter(Boolean).map((b, i) => <li key={i} style={{ marginBottom: 1.5 }}>{b}</li>)}
    </ul>
  );
}

function Preview({ data }: { data: ResumeData }) {
  const h = data.header;
  const exp = (items: ExperienceItem[]) => items.filter((it) => it.org || it.role || it.bullets.some(Boolean));
  return (
    <div>
      {/* header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 6 }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.3 }}>{h.name || 'Your Name'}</div>
        {h.program && <div style={{ fontSize: 11 }}>{h.program}</div>}
        <div style={{ fontSize: 10, marginTop: 2 }}>
          {[h.email, h.phone, h.linkedin, h.extra].filter(Boolean).join('  |  ')}
        </div>
      </div>

      {data.education.some((e) => e.degree || e.institute) && (
        <PvSection title="Academic Qualifications">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
            <tbody>
              {data.education.filter((e) => e.degree || e.institute).map((e, i) => (
                <tr key={i}>
                  <td style={{ padding: '1px 4px 1px 0', fontWeight: 600 }}>{e.degree}</td>
                  <td style={{ padding: '1px 4px' }}>{e.institute}{e.board ? `, ${e.board}` : ''}</td>
                  <td style={{ padding: '1px 4px', textAlign: 'right', whiteSpace: 'nowrap' }}>{e.score}</td>
                  <td style={{ padding: '1px 0 1px 4px', textAlign: 'right', whiteSpace: 'nowrap' }}>{e.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.academicAchievements.some(Boolean) && <div style={{ marginTop: 3 }}><Bul items={data.academicAchievements} /></div>}
        </PvSection>
      )}

      {exp(data.workExperience).length > 0 && (
        <PvSection title="Work Experience">
          {exp(data.workExperience).map((it, i) => <ExpBlock key={i} it={it} />)}
        </PvSection>
      )}
      {exp(data.internships).length > 0 && (
        <PvSection title="Internships">
          {exp(data.internships).map((it, i) => <ExpBlock key={i} it={it} />)}
        </PvSection>
      )}
      {exp(data.projects).length > 0 && (
        <PvSection title="Projects">
          {exp(data.projects).map((it, i) => <ExpBlock key={i} it={it} />)}
        </PvSection>
      )}

      {data.positionsOfResponsibility.some((p) => p.org || p.role) && (
        <PvSection title="Positions of Responsibility">
          {data.positionsOfResponsibility.filter((p) => p.org || p.role).map((p, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><b>{p.role}</b>{p.org ? `, ${p.org}` : ''}</span><span>{p.year}</span>
              </div>
              {p.bullets.some(Boolean) && <Bul items={p.bullets} />}
            </div>
          ))}
        </PvSection>
      )}

      {data.awards.some(Boolean) && <PvSection title="Awards & Recognition"><Bul items={data.awards} /></PvSection>}

      {data.certifications.some((c) => c.title) && (
        <PvSection title="Certifications">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
            <tbody>
              {data.certifications.filter((c) => c.title).map((c, i) => (
                <tr key={i}>
                  <td style={{ padding: '1px 4px 1px 0', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.provider}</td>
                  <td style={{ padding: '1px 4px' }}>{c.title}</td>
                  <td style={{ padding: '1px 0', textAlign: 'right' }}>{c.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PvSection>
      )}

      {data.extracurricular.some((g) => g.bullets.some(Boolean)) && (
        <PvSection title="Extracurricular Activities">
          {data.extracurricular.filter((g) => g.bullets.some(Boolean)).map((g, i) => (
            <div key={i} style={{ marginBottom: 2 }}>
              {g.category && <span style={{ fontWeight: 600 }}>{g.category}: </span>}
              <span>{g.bullets.filter(Boolean).join('; ')}</span>
            </div>
          ))}
        </PvSection>
      )}

      {(data.additionalInfo.examScores.some(Boolean) || data.additionalInfo.skills.length > 0 || data.additionalInfo.hobbies.length > 0) && (
        <PvSection title="Additional Information">
          {data.additionalInfo.examScores.some(Boolean) && <Bul items={data.additionalInfo.examScores} />}
          {data.additionalInfo.skills.length > 0 && <div><b>Skills:</b> {data.additionalInfo.skills.join(', ')}</div>}
          {data.additionalInfo.hobbies.length > 0 && <div><b>Hobbies:</b> {data.additionalInfo.hobbies.join(', ')}</div>}
        </PvSection>
      )}
    </div>
  );
}

function ExpBlock({ it }: { it: ExperienceItem }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span><b>{it.org}</b>{it.role ? ` — ${it.role}` : ''}</span>
        <span style={{ whiteSpace: 'nowrap' }}>{[it.dates, it.meta].filter(Boolean).join(' · ')}</span>
      </div>
      {it.bullets.some(Boolean) && <Bul items={it.bullets} />}
    </div>
  );
}

function PrintStyles() {
  return (
    <style>{`
      @media print {
        body * { visibility: hidden !important; }
        .resume-print-area, .resume-print-area * { visibility: visible !important; }
        .resume-print-area { position: absolute; left: 0; top: 0; width: 100%; max-width: 100% !important; box-shadow: none !important; padding: 0 !important; }
        .no-print { display: none !important; }
        @page { size: A4; margin: 12mm; }
      }
    `}</style>
  );
}

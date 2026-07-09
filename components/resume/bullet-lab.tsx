'use client';

/**
 * CV Pointer Lab — MECE's strict-fit CV bullet generator.
 *
 * The user describes an achievement (typed or dictated), can add free-form instructions the
 * engine follows strictly, and sets the EXACT character limit their college's placement portal
 * allows per bullet. The engine returns recruiter-ready one-line bullets, each within 95–100% of
 * that limit (never over, never mid-word cut) — or, when the achievement is too vague, ONE
 * clarifying question instead of inventing details. Enforced server-side (FastAPI + OpenAI).
 */

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, Copy, Check, Loader2, Ruler, Wand2, HelpCircle, LockKeyhole } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { generatePoints, type ResumeBulletOption } from '@/lib/api';
import DictationButton, { type DictationHandle } from '@/components/dictation-button';

const DOMAINS = [
  'General Management', 'Consulting', 'Finance', 'Marketing', 'Product',
  'Operations', 'Strategy', 'Technology', 'Analytics', 'Sustainability', 'HR',
];

async function getToken(): Promise<string | undefined> {
  const { data } = await createClient().auth.getSession();
  return data.session?.access_token;
}

function OptionCard({ opt, limit }: { opt: ResumeBulletOption; limit: number }) {
  const [copied, setCopied] = useState(false);
  const lo = Math.ceil(0.95 * limit);
  const fits = opt.chars >= lo && opt.chars <= limit;
  const pct = Math.min(100, Math.round((opt.chars / limit) * 100));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(opt.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30">
      <p className="text-body text-foreground">{opt.text}</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <span
            className={`block h-full rounded-full ${fits ? 'bg-success' : 'bg-warning'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`shrink-0 text-micro font-semibold tabular-nums ${fits ? 'text-success' : 'text-warning'}`}>
          {opt.chars}/{limit}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2.5 py-1 text-micro font-semibold text-foreground hover:bg-muted"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {opt.rationale && <p className="mt-2 text-micro text-muted-foreground">{opt.rationale}</p>}
    </div>
  );
}

export default function BulletLab({
  trial = null,
}: {
  /** Non-Pro preview: lifetime free generations left. null = unlimited (Pro). */
  trial?: { remaining: number; limit: number } | null;
} = {}) {
  const exhausted = trial !== null && trial.remaining <= 0;
  const [achievement, setAchievement] = useState('');
  const [instructions, setInstructions] = useState('');
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [limit, setLimit] = useState(120);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clarify, setClarify] = useState('');
  const [options, setOptions] = useState<ResumeBulletOption[]>([]);
  const [recording, setRecording] = useState(false);
  const dictRef = useRef<DictationHandle>(null);

  const clampedLimit = Math.max(40, Math.min(limit || 120, 160));
  const lo = Math.ceil(0.95 * clampedLimit);

  const run = async () => {
    if (exhausted) {
      setError('You have used your free tries — upgrade to Pro for unlimited bullets.');
      return;
    }
    // If the mic is still recording, finalize it and fold the transcript in first.
    let ach = achievement;
    if (dictRef.current?.isRecording()) {
      const t = await dictRef.current.finalize();
      if (t) { ach = achievement.trim() ? `${achievement.trim()} ${t}` : t; setAchievement(ach); }
    }
    if (ach.trim().length < 3) {
      setError('Describe your achievement in a few words first.');
      return;
    }
    setLoading(true);
    setError('');
    setClarify('');
    setOptions([]);
    try {
      const token = await getToken();
      const res = await generatePoints(ach.trim(), domain, clampedLimit, instructions.trim(), 3, token);
      if (res.clarify) {
        setClarify(res.clarify);
      } else {
        setOptions(res.options);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="text-center">
          <span className="badge-pill badge-pill-red">
            <Sparkles className="h-3.5 w-3.5" /> CV Pointer Lab
          </span>
          {trial && trial.remaining > 0 && (
            <span className="badge-pill ml-2" title="CV Pointer Lab is a Pro feature — this is your free preview">
              Free preview · {trial.remaining} of {trial.limit} {trial.remaining === 1 ? 'try' : 'tries'} left
            </span>
          )}
          <h1 className="mt-4 text-h1 text-foreground">Resume bullets that fit the line, exactly.</h1>
          <p className="mx-auto mt-3 max-w-xl text-body text-muted-foreground">
            Tell us what you did and the character limit your placement portal allows. The engine writes a
            crisp, quantified one-liner that fills 95–100% of that limit — never over, never cut mid-word.
          </p>
        </div>

        <div className="ui-card relative mt-10 rounded-2xl border border-border p-6">
          {exhausted && (
            // Visible but locked: the full UI stays readable underneath so free
            // users see exactly what they'd get. Backend enforces the cap too.
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/70 backdrop-blur-[2px]">
              <div className="mx-4 max-w-sm rounded-xl border border-primary/20 bg-card p-6 text-center shadow-2xl">
                <LockKeyhole className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <h2 className="text-h3 mb-2 text-foreground">Your free tries are used</h2>
                <p className="mb-5 text-body text-muted-foreground">
                  CV Pointer Lab is a Pro feature — you&apos;ve used your {trial?.limit ?? 2} free
                  generations. Upgrade for unlimited, portal-perfect bullets.
                </p>
                <Link
                  href="/upgrade"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-body font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
                >
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="text-micro font-semibold uppercase tracking-wide text-muted-foreground">Domain</span>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="flex items-center gap-1 text-micro font-semibold uppercase tracking-wide text-muted-foreground">
                <Ruler className="h-3.5 w-3.5" /> Character limit
              </span>
              <input
                type="number"
                min={40}
                max={160}
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value, 10) || 0)}
                className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-32"
              />
            </label>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-micro font-semibold uppercase tracking-wide text-muted-foreground">Your achievement</span>
              <span className="flex items-center gap-2 text-micro text-muted-foreground">
                Speak it
                <DictationButton
                  ref={dictRef}
                  onRecordingChange={setRecording}
                  onTranscriptionCompleted={(t) => setAchievement((p) => (p.trim() ? p.trim() + ' ' : '') + t)}
                  disabled={loading}
                />
              </span>
            </div>
            <textarea
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              rows={3}
              placeholder="e.g. Led a 4-person team to automate the monthly MIS report, which used to take two days."
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <label className="mt-4 block">
            <span className="text-micro font-semibold uppercase tracking-wide text-muted-foreground">
              Notes / instructions for the AI <span className="font-normal normal-case text-muted-foreground/70">(optional — it follows these strictly)</span>
            </span>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              placeholder="e.g. use the number 35% · don't use the word 'led' · keep it finance-flavoured · mention the 4-person team"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-micro text-muted-foreground">
              Each bullet will land between <span className="font-semibold text-foreground">{lo}</span> and{' '}
              <span className="font-semibold text-foreground">{clampedLimit}</span> characters.
            </p>
            <button
              type="button"
              onClick={run}
              disabled={loading || exhausted}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {loading ? 'Crafting…' : recording ? 'Stop & generate' : 'Generate bullets'}
            </button>
          </div>

          {error && <p className="mt-4 rounded-md bg-accent px-3 py-2 text-small text-primary">{error}</p>}
        </div>

        {clarify && (
          <div className="mt-6 flex gap-3 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3">
            <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <p className="text-small font-semibold text-foreground">One quick question before I write it</p>
              <p className="mt-1 text-body text-foreground">{clarify}</p>
              <p className="mt-2 text-micro text-muted-foreground">
                Add the answer to your achievement or the notes box above, then generate again.
              </p>
            </div>
          </div>
        )}

        {options.length > 0 && (
          <div className="mt-8 space-y-3">
            <h2 className="text-h3 text-foreground">Pick the one that fits best</h2>
            {options.map((o, i) => <OptionCard key={i} opt={o} limit={clampedLimit} />)}
            <p className="pt-2 text-micro text-muted-foreground">
              Tip: paste your strongest one straight into your placement portal — it is already within the limit.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

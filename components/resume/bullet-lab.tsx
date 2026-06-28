'use client';

/**
 * Bullet Lab — MECE's strict-fit CV bullet generator.
 *
 * The user describes an achievement and sets the EXACT character limit their college's
 * placement portal allows per bullet. The engine returns recruiter-ready one-line bullets,
 * each guaranteed to land within 95–100% of that limit — never over, never mid-word cut.
 * Generation + the strict character band are enforced server-side (FastAPI + OpenAI).
 */

import { useState } from 'react';
import { Sparkles, Copy, Check, Loader2, Ruler, Wand2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { generatePoints, type ResumeBulletOption } from '@/lib/api';

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

export default function BulletLab() {
  const [achievement, setAchievement] = useState('');
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [limit, setLimit] = useState(120);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [options, setOptions] = useState<ResumeBulletOption[]>([]);

  const clampedLimit = Math.max(40, Math.min(limit || 120, 160));
  const lo = Math.ceil(0.95 * clampedLimit);

  const run = async () => {
    if (achievement.trim().length < 3) {
      setError('Describe your achievement in a few words first.');
      return;
    }
    setLoading(true);
    setError('');
    setOptions([]);
    try {
      const token = await getToken();
      const opts = await generatePoints(achievement.trim(), domain, clampedLimit, 3, token);
      setOptions(opts);
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
            <Sparkles className="h-3.5 w-3.5" /> Bullet Lab
          </span>
          <h1 className="mt-4 text-h1 text-foreground">Resume bullets that fit the line, exactly.</h1>
          <p className="mx-auto mt-3 max-w-xl text-body text-muted-foreground">
            Tell us what you did and the character limit your placement portal allows. The engine writes a
            crisp, quantified one-liner that fills 95–100% of that limit — never over, never cut mid-word.
          </p>
        </div>

        <div className="ui-card mt-10 rounded-2xl border border-border p-6">
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

          <label className="mt-4 block">
            <span className="text-micro font-semibold uppercase tracking-wide text-muted-foreground">Your achievement</span>
            <textarea
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              rows={3}
              placeholder="e.g. Led a 4-person team to automate the monthly MIS report, which used to take two days."
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
              disabled={loading}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {loading ? 'Crafting…' : 'Generate bullets'}
            </button>
          </div>

          {error && <p className="mt-4 rounded-md bg-accent px-3 py-2 text-small text-primary">{error}</p>}
        </div>

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

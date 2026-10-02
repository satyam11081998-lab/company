'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronDown, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ii, IIError, isConfigured } from '@/lib/interview-intelligence/api';
import { CONFIDENCE_LABEL, STATE } from '@/lib/interview-intelligence/format';
import type { EvidenceState, IIMe } from '@/lib/interview-intelligence/types';

export function StateChip({ state, compact = false }: { state: EvidenceState; compact?: boolean }) {
  const s = STATE[state] || STATE.not_sufficiently_tested;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${s.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {compact ? s.label.replace(' evidence', '') : s.label}
    </span>
  );
}

export function ConfidenceChip({ level }: { level: string }) {
  const tone = level === 'high' ? 'text-foreground' : level === 'moderate' ? 'text-muted-foreground' : 'text-viz-warning';
  return <span className={`whitespace-nowrap text-xs font-medium ${tone}`}>{CONFIDENCE_LABEL[level] || level}</span>;
}

export function ErrorNote({ error, onRetry }: { error: string | null; onRetry?: () => void }) {
  if (!error) return null;
  return (
    <div role="alert" className="flex items-start justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <span>{error}</span>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 font-semibold underline underline-offset-2">Try again</button>
      )}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

/** A report section that opens on demand (progressive disclosure, spec §80). */
export function Disclosure({ title, summary, defaultOpen = false, children, id }: {
  title: string; summary?: ReactNode; defaultOpen?: boolean; children: ReactNode; id?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section id={id} className="scroll-mt-24 border-t border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {summary && <div className="mt-1 text-sm text-muted-foreground">{summary}</div>}
        </div>
        <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-8">{children}</div>}
    </section>
  );
}

/**
 * Loads /v1/me and renders children only for users the II service lets in. The UI never
 * decides access: it shows what the server decided.
 */
export function AccessGate({ children }: { children: (me: IIMe) => ReactNode }) {
  const [me, setMe] = useState<IIMe | null>(null);
  const [err, setErr] = useState<IIError | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let off = false;
    setErr(null);
    if (!isConfigured()) {
      setErr(new IIError(503, 'not_configured', 'Interview Intelligence is not available yet.'));
      return;
    }
    ii.me().then((m) => { if (!off) setMe(m); }).catch((e) => { if (!off) setErr(e as IIError); });
    return () => { off = true; };
  }, [tick]);

  if (err) {
    if (err.code === 'guest' || err.status === 401) {
      return <GateCard title="Sign in to continue" body={err.message} cta={{ href: '/signup', label: 'Create a free account' }} />;
    }
    return <GateCard title="Interview Intelligence is unavailable" body={err.message} onRetry={() => setTick((t) => t + 1)} />;
  }
  if (!me) return <div className="py-24"><Spinner label="Checking your access…" /></div>;
  if (!me.access.allowed) {
    return (
      <GateCard
        title="Interview Intelligence is part of Pro"
        body={me.access.reason || 'Interview Intelligence is a Pro feature.'}
        cta={{ href: '/upgrade', label: 'See Pro' }}
        locked
      />
    );
  }
  return <>{children(me)}</>;
}

function GateCard({ title, body, cta, onRetry, locked }: {
  title: string; body: string; cta?: { href: string; label: string }; onRetry?: () => void; locked?: boolean;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      {locked && <Lock className="mx-auto mb-4 h-6 w-6 text-muted-foreground" aria-hidden />}
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-muted-foreground">{body}</p>
      <div className="mt-6 flex justify-center gap-3">
        {cta && <Button asChild><Link href={cta.href}>{cta.label}</Link></Button>}
        {onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}
      </div>
    </div>
  );
}

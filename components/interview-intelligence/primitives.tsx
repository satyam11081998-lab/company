'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Loader2, Lock } from 'lucide-react';
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

/**
 * Loads /v1/me and renders children only for users the II service lets in. The UI never
 * decides access: it shows what the server decided. `history`: also render for someone who may
 * no longer start interviews but has their own (e.g. a used free interview) — they keep their
 * reports; the page itself must not offer to start one (me.access.allowed is false).
 */
export function AccessGate({ children, history = false }: { children: (me: IIMe) => ReactNode; history?: boolean }) {
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
  if (!me.access.allowed && history && me.has_history) return <>{children(me)}</>;
  if (!me.access.allowed && me.plan?.trial?.used) {
    return (
      <GateCard
        title="You've used your free interview"
        body={me.access.reason || 'Your report stays in Interview Intelligence whenever you want it.'}
        cta={me.plan.visible ? { href: '/interview-intelligence/plans', label: 'See plans' } : undefined}
        locked
      />
    );
  }
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

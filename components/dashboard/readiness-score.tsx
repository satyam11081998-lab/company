'use client';
// DELIVERABLE v3 (alive) — readiness hero with entry choreography:
// ring sweeps to value, score counts up in sync, verdict fades, the 4 component bars fill
// left-to-right in sequence. All reduced-motion aware (jumps to final state instantly).
import { cn } from '@/lib/utils';
import { VERDICT_LABEL, type ReadinessResult } from '@/lib/readiness';
import { useCountUp, useMounted } from '@/hooks/use-dashboard-motion';

const COMPONENT_LABEL = { mastery: 'Skill', coverage: 'Coverage', consistency: 'Consistency', robustness: 'Robustness' } as const;

function Ring({ score }: { score: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const mounted = useMounted(260);
  const off = mounted ? c * (1 - score / 100) : c;
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90" role="img" aria-label={`Readiness ${score} of 100`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
      <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off}
        style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)' }} />
    </svg>
  );
}

export function ReadinessScore({ result }: { result: ReadinessResult }) {
  if (result.status === 'calibrating') {
    const pct = Math.round((result.subsDone / result.subsNeeded) * 100);
    const mounted = useMounted(120);
    return (
      <div className="rounded-xl border border-border bg-card p-6 animate-slide-up">
        <p className="text-label text-muted-foreground">READINESS SCORE</p>
        <p className="text-h2 mt-1">Calibrating…</p>
        <p className="text-body text-muted-foreground mt-1">
          Solve {result.subsNeeded} cases across {result.typesNeeded} types and we'll lock in your first honest readiness number.
        </p>
        <div className="mt-4 h-2 rounded-full bg-muted">
          <div className="h-2 rounded-full bg-primary" style={{ width: `${mounted ? pct : 0}%`, transition: 'width .8s cubic-bezier(.22,1,.36,1)' }} />
        </div>
        <p className="text-micro text-muted-foreground mt-2">
          {result.subsDone} of {result.subsNeeded} cases · {result.typesDone} of {result.typesNeeded} types
        </p>
      </div>
    );
  }

  const score = useCountUp(result.score, 1100, 260);
  const comps = [
    { key: 'mastery', v: result.components.mastery },
    { key: 'coverage', v: result.components.coverage },
    { key: 'consistency', v: result.components.consistency },
    { key: 'robustness', v: result.components.robustness },
  ] as const;

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-slide-up">
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <Ring score={result.score} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[34px] font-mono-data font-bold leading-none tabular-nums">{score}</span>
            <span className="text-micro text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-label text-muted-foreground">READINESS SCORE</p>
          <p className="text-h3 mt-0.5 animate-fade-in">{VERDICT_LABEL[result.verdict]}</p>
          <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2">
            {comps.map((c, i) => <CompBar key={c.key} label={COMPONENT_LABEL[c.key]} v={c.v} delay={560 + i * 120} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompBar({ label, v, delay }: { label: string; v: number; delay: number }) {
  const mounted = useMounted(delay);
  const val = useCountUp(Math.round(v), 700, delay);
  return (
    <div>
      <div className="flex justify-between text-micro text-muted-foreground">
        <span>{label}</span><span className="font-mono-data tabular-nums">{val}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-muted">
        <div className={cn('h-1.5 rounded-full', v >= 50 ? 'bg-primary' : 'bg-warning')}
          style={{ width: `${mounted ? Math.min(100, v) : 0}%`, transition: 'width .7s cubic-bezier(.22,1,.36,1)' }} />
      </div>
    </div>
  );
}

export default ReadinessScore;

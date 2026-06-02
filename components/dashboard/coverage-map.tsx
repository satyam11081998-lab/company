// DELIVERABLE — the coverage map (the research's "coverage treemap", grounded as a
// 4 case-types x 3 difficulties grid). Cell color = mastery state; empty/attempted cells
// deep-link straight into practice. This is the progressive-disclosure "deep dive" zone.
'use client';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-dashboard-motion';
import { CASE_TYPE_LABELS, DIFFICULTIES, type CaseType, type Difficulty } from '@/lib/constants';
import type { CoverageCell } from '@/lib/readiness';

const TYPE_ORDER: CaseType[] = ['guesstimate', 'profitability', 'market_sizing', 'growth'];

function cellClasses(state: CoverageCell['state']): string {
  switch (state) {
    case 'covered':
      return 'bg-primary/85 text-primary-foreground border-transparent';
    case 'attempted':
      return 'bg-primary/25 text-foreground border-primary/30';
    default:
      return 'bg-muted text-muted-foreground border-border hover:border-primary/40';
  }
}

export function CoverageMap({ cells }: { cells: CoverageCell[] }) {
  const get = (t: CaseType, d: Difficulty) =>
    cells.find((c) => c.caseType === t && c.difficulty === d)!;
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-baseline justify-between">
        <p className="text-label text-muted-foreground">COVERAGE MAP</p>
        <p className="text-micro text-muted-foreground">tap a gap to practise it</p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <div className="grid grid-cols-[96px_repeat(3,1fr)] gap-1.5 min-w-[320px]">
          <div />
          {DIFFICULTIES.map((d) => (
            <div key={d} className="text-micro text-muted-foreground text-center capitalize">
              {d}
            </div>
          ))}
          {TYPE_ORDER.map((t, ri) => (
            <FragmentRow key={t} type={t} get={get} rowIndex={ri} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FragmentRow({
  type,
  get,
  rowIndex,
}: {
  type: CaseType;
  get: (t: CaseType, d: Difficulty) => CoverageCell;
  rowIndex: number;
}) {
  return (
    <>
      <div className="text-small text-foreground self-center truncate">{CASE_TYPE_LABELS[type]}</div>
      {DIFFICULTIES.map((d, ci) => {
        const cell = get(type, d);
        const delay = 150 + (rowIndex * 3 + ci) * 45;
        const label =
          cell.state === 'covered' && cell.bestScore != null ? String(cell.bestScore) : cell.state === 'empty' ? '+' : '·';
        const href = `/practice?type=${type}&difficulty=${d}`;
        return (
          <CellLink key={d} href={href} label={label} state={cell.state}
            aria={`${CASE_TYPE_LABELS[type]} ${d}: ${cell.state}`} delay={delay} />
        );
      })}
    </>
  );
}

function CellLink({ href, label, state, aria, delay }: {
  href: string; label: string; state: CoverageCell['state']; aria: string; delay: number;
}) {
  const mounted = useMounted(delay);
  return (
    <a
      href={href}
      aria-label={aria}
      className={cn(
        'flex h-10 items-center justify-center rounded-lg border text-strong font-mono-data tabular-nums transition-colors',
        cellClasses(state)
      )}
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'scale(1)' : 'scale(.92)',
        transition: 'opacity .4s ease, transform .4s cubic-bezier(.22,1,.36,1)',
      }}
    >
      {label}
    </a>
  );
}

export default CoverageMap;

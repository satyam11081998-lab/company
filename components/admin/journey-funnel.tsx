'use client';

/**
 * JourneyFunnel — conversion funnel visualization.
 *
 * Shows a predefined multi-step funnel with drop-off percentages at each
 * stage. Built with plain Tailwind (no external charting lib needed for
 * a horizontal bar funnel).
 */

interface FunnelStage {
  label: string;
  count: number;
}

const STAGE_COLORS = [
  'bg-blue-500',
  'bg-blue-400',
  'bg-indigo-500',
  'bg-indigo-400',
  'bg-violet-500',
  'bg-violet-400',
  'bg-purple-500',
  'bg-amber-500',
];

export default function JourneyFunnel({ stages }: { stages: FunnelStage[] }) {
  if (!stages.length) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Not enough data to render the funnel yet.
      </div>
    );
  }

  const maxCount = stages[0]?.count || 1;

  return (
    <div className="space-y-2">
      {stages.map((stage, i) => {
        const prev = i === 0 ? stage.count : stages[i - 1].count;
        const dropOff = prev > 0 ? Math.round(((prev - stage.count) / prev) * 100) : 0;
        const widthPct = Math.max(4, (stage.count / maxCount) * 100);
        const color = STAGE_COLORS[i % STAGE_COLORS.length];

        return (
          <div key={stage.label} className="group">
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-medium text-foreground">{stage.label}</span>
              <div className="flex items-center gap-2">
                <span className="tabular-nums text-foreground font-semibold">
                  {stage.count.toLocaleString('en-IN')}
                </span>
                {i > 0 && dropOff > 0 && (
                  <span className="tabular-nums text-red-500">
                    −{dropOff}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-7 w-full overflow-hidden rounded bg-muted">
              <div
                className={`h-full rounded ${color} transition-all duration-500 flex items-center px-2`}
                style={{ width: `${widthPct}%` }}
              >
                {widthPct > 15 && (
                  <span className="text-[10px] font-medium text-white tabular-nums">
                    {Math.round((stage.count / maxCount) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

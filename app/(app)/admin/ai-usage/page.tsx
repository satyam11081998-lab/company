import Link from 'next/link';
import { getAiUsageReport } from '@/lib/ai-usage-report';
import { getCreditMonitorStatus } from '@/lib/ai-credit';
import { AiCreditMonitor } from '@/components/admin/ai-credit-monitor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const WINDOWS = [7, 14, 30];

function usd(n: number): string {
  if (n === 0) return '$0';
  return `$${n < 1 ? n.toFixed(4) : n.toFixed(2)}`;
}
function int(n: number): string {
  return Math.round(n).toLocaleString('en-IN');
}

export default async function AiUsagePage({
  searchParams,
}: {
  searchParams: { days?: string };
}) {
  const days = WINDOWS.includes(Number(searchParams.days)) ? Number(searchParams.days) : 14;
  const [r, credit] = await Promise.all([getAiUsageReport(days), getCreditMonitorStatus()]);

  const maxDayCost = Math.max(0.0001, ...r.byDay.map((d) => d.cost));
  const errorRate = r.overall.calls > 0 ? (r.overall.errors / r.overall.calls) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header + window selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI usage &amp; cost</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Estimated OpenAI spend by feature and overall, from the <code className="text-xs">ai_usage_log</code> ledger.
            Costs are guardrail estimates (OpenAI list prices), not your invoice.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5 text-sm">
          {WINDOWS.map((w) => (
            <Link
              key={w}
              href={`/admin/ai-usage?days=${w}`}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                w === days ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {w}d
            </Link>
          ))}
        </div>
      </div>

      {/* Credit monitor + Telegram alerts */}
      <AiCreditMonitor status={credit} />

      {/* Overall cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Today's spend (IST)" value={usd(r.todayCost)} sub={`${int(r.todayCalls)} calls`} accent />
        <Stat label={`Spend · last ${days}d`} value={usd(r.overall.cost)} sub={`${int(r.overall.calls)} calls`} />
        <Stat
          label={`Tokens · last ${days}d`}
          value={int(r.overall.promptTokens + r.overall.completionTokens)}
          sub={`${int(r.overall.promptTokens)} in · ${int(r.overall.completionTokens)} out`}
        />
        <Stat label="Error rate" value={`${errorRate.toFixed(1)}%`} sub={`${int(r.overall.errors)} failed`} />
      </div>

      {/* By feature — the per-functionality breakdown */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Cost by feature · last {days}d
        </h2>
        {r.byFeature.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Feature</th>
                  <th className="py-2 px-3 text-right font-medium">Calls</th>
                  <th className="py-2 px-3 text-right font-medium">Cost</th>
                  <th className="py-2 px-3 text-right font-medium">$/call</th>
                  <th className="py-2 px-3 text-right font-medium">Tokens</th>
                  <th className="py-2 pl-3 text-right font-medium">Voice min</th>
                </tr>
              </thead>
              <tbody>
                {r.byFeature.map((f) => (
                  <tr key={f.key} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-3 font-medium text-foreground">
                      {f.key}
                      {f.errors > 0 && (
                        <span className="ml-2 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                          {f.errors} err
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">{int(f.calls)}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold text-foreground">{usd(f.cost)}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">
                      {usd(f.calls > 0 ? f.cost / f.calls : 0)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">
                      {int(f.promptTokens + f.completionTokens)}
                    </td>
                    <td className="py-2 pl-3 text-right tabular-nums text-muted-foreground">
                      {f.audioMinutes > 0 ? f.audioMinutes.toFixed(1) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border font-semibold text-foreground">
                  <td className="py-2 pr-3">Total</td>
                  <td className="py-2 px-3 text-right tabular-nums">{int(r.overall.calls)}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{usd(r.overall.cost)}</td>
                  <td className="py-2 px-3" />
                  <td className="py-2 px-3 text-right tabular-nums">
                    {int(r.overall.promptTokens + r.overall.completionTokens)}
                  </td>
                  <td className="py-2 pl-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* By model */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Cost by model</h2>
          {r.byModel.length === 0 ? (
            <Empty />
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {r.byModel.map((m) => (
                  <tr key={m.key} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-3 font-mono text-xs text-foreground">{m.key}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">{int(m.calls)} calls</td>
                    <td className="py-2 pl-3 text-right tabular-nums font-semibold text-foreground">{usd(m.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* By day */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Spend by day (IST)</h2>
          {r.byDay.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-1.5">
              {r.byDay.map((d) => (
                <div key={d.day} className="flex items-center gap-2 text-xs">
                  <span className="w-20 shrink-0 tabular-nums text-muted-foreground">{d.day.slice(5)}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded bg-muted">
                    <span
                      className="block h-full rounded bg-primary/70"
                      style={{ width: `${Math.max(2, (d.cost / maxDayCost) * 100)}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right tabular-nums font-medium text-foreground">{usd(d.cost)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Top users */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Top spenders · last {days}d
        </h2>
        {r.topUsers.length === 0 ? (
          <Empty />
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {r.topUsers.map((u, i) => (
                <tr key={u.userId} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-3 text-muted-foreground">{i + 1}</td>
                  <td className="py-2 px-3 text-foreground">
                    {u.name || <span className="font-mono text-xs text-muted-foreground">{u.userId.slice(0, 8)}…</span>}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">{int(u.calls)} calls</td>
                  <td className="py-2 pl-3 text-right tabular-nums font-semibold text-foreground">{usd(u.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        The global daily kill switch pauses AI once the day&apos;s estimated spend crosses{' '}
        <code className="text-xs">AI_DAILY_BUDGET_USD</code> (default $10). Per-user voice/image caps and the
        friendly limits are set by the <code className="text-xs">AI_VOICE_MIN_*</code> / <code className="text-xs">AI_OCR_IMG_*</code> env vars.
      </p>
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Empty() {
  return <p className="py-6 text-center text-sm text-muted-foreground">No AI usage recorded in this window yet.</p>;
}

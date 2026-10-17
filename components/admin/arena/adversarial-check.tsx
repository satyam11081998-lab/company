'use client';

/**
 * Admin · Interviewer arena · ADVERSARIAL CHECK.
 *
 * Runs the 50 hard scenarios of the behavioural eval (tools/eval_interviewer_behavior.py)
 * through BOTH builds -- each scenario's prior conversation plus its candidate turn,
 * with the eval's own case text -- and lists the two replies side by side with what
 * each build decided and every guardrail it broke. Optionally the eval's LLM judge
 * grades both replies against the scenario's rule; ONE judge (on the live backend)
 * grades both, so the two builds are not marked by judges that disagree.
 *
 * A regression is a scenario Current passes and New fails. That list is what to fix
 * before saying "push".
 */

import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, ClipboardCopy, Loader2, Play, ShieldAlert, Square } from 'lucide-react';
import { type Arm, type Scenario, VIOLATION_LABEL, arenaFetch, Chip } from './parts';
import type { Build, Side } from './builds-arena';

type Judge = { pass: boolean; judge_pass: boolean | null; why: string | null; violations: string[] };
type Cell = { arm?: Arm; error?: string; judge?: Judge };
type Row = { s: Scenario; current?: Cell; new?: Cell };
type Filter = 'all' | 'regressions' | 'failures' | 'differences';
const SIDES: Side[] = ['current', 'new'];
const CONCURRENCY = 3;

function passed(c: Cell | undefined, withJudge: boolean): boolean | null {
  if (!c) return null;
  if (c.error || c.arm?.error) return false;
  if (withJudge) return c.judge ? c.judge.pass : null;
  return (c.arm?.violations.length ?? 0) === 0;
}

export default function AdversarialCheck({ currentUrl, newUrl, seeds, modelModes, defaultModelMode, builds, ready }: {
  currentUrl: string; newUrl: string; seeds: Scenario[];
  modelModes: { id: string; label: string }[]; defaultModelMode: string;
  builds: Record<Side, Build | undefined>; ready: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [withJudge, setWithJudge] = useState(true);
  const [channel, setChannel] = useState<'text' | 'voice'>('text');
  const [modelMode, setModelMode] = useState(defaultModelMode);
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [filter, setFilter] = useState<Filter>('all');
  const [ranWith, setRanWith] = useState<{ judge: boolean; channel: string; builds: Record<Side, Build | undefined> } | null>(null);
  const stop = useRef(false);
  const urls: Record<Side, string> = { current: currentUrl, new: newUrl };

  const update = (id: string, side: Side, cell: Cell) =>
    setRows((rs) => rs.map((r) => (r.s.id === id ? { ...r, [side]: { ...(r[side] || {}), ...cell } } : r)));

  const runOne = async (s: Scenario) => {
    await Promise.all(SIDES.map(async (side) => {
      try {
        const r = await arenaFetch(urls[side], '/arm-turn', {
          method: 'POST',
          body: JSON.stringify({
            scenario_id: s.id, transcript: s.transcript, message: s.new_message,
            model_mode: modelMode, teaching_policy: 'coached', channel, tier: 'pro', clar_used: 0,
          }),
        }, 150000) as { arm: Arm };
        update(s.id, side, { arm: r.arm });
        if (withJudge && !r.arm.error) {
          // ONE judge for both builds: always the live backend's.
          const j = await arenaFetch(currentUrl, '/judge', {
            method: 'POST', body: JSON.stringify({ scenario_id: s.id, reply: r.arm.silent ? '' : r.arm.reply }),
          }, 90000) as Judge;
          update(s.id, side, { judge: j });
        }
      } catch (e) {
        update(s.id, side, { error: (e as Error).message });
      }
    }));
    setDone((d) => d + 1);
  };

  const run = async () => {
    stop.current = false;
    setRows(seeds.map((s) => ({ s })));
    setDone(0); setRunning(true); setFilter('all');
    setRanWith({ judge: withJudge, channel, builds });
    const queue = [...seeds];
    const worker = async () => {
      while (queue.length && !stop.current) {
        const s = queue.shift();
        if (s) await runOne(s);
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    setRunning(false);
  };

  const judged = ranWith?.judge ?? withJudge;
  const summary = useMemo(() => {
    let cPass = 0, nPass = 0, regress = 0, improve = 0, differ = 0, complete = 0;
    for (const r of rows) {
      const c = passed(r.current, judged), n = passed(r.new, judged);
      if (c === null || n === null) continue;
      complete++;
      if (c) cPass++;
      if (n) nPass++;
      if (c && !n) regress++;
      if (!c && n) improve++;
      if ((r.current?.arm?.reply ?? '') !== (r.new?.arm?.reply ?? '')) differ++;
    }
    return { cPass, nPass, regress, improve, differ, complete };
  }, [rows, judged]);

  const shown = rows.filter((r) => {
    const c = passed(r.current, judged), n = passed(r.new, judged);
    if (filter === 'regressions') return c === true && n === false;
    if (filter === 'failures') return c === false || n === false;
    if (filter === 'differences') return (r.current?.arm?.reply ?? '') !== (r.new?.arm?.reply ?? '');
    return true;
  });

  const copy = async () => {
    const lines = [
      `ADVERSARIAL CHECK — ${summary.complete}/${rows.length} scenarios · channel ${ranWith?.channel} · judge ${judged ? 'on' : 'off'}`,
      `Current: ${ranWith?.builds.current ? `${ranWith.builds.current.branch} @ ${ranWith.builds.current.commit}` : currentUrl}`,
      `New: ${ranWith?.builds.new ? `${ranWith.builds.new.branch} @ ${ranWith.builds.new.commit}` : newUrl}`,
      `Pass: Current ${summary.cPass} · New ${summary.nPass} · regressions ${summary.regress} · improvements ${summary.improve}`, '',
    ];
    for (const r of rows) {
      const c = passed(r.current, judged), n = passed(r.new, judged);
      if (c !== false && n !== false) continue;
      lines.push(`## ${r.s.id} (${r.s.case_type})${c && !n ? ' — REGRESSION' : !c && n ? ' — improved' : ''}`);
      lines.push(`Candidate: ${r.s.new_message}`, `Required: ${r.s.required || ''}`);
      for (const side of SIDES) {
        const x = r[side];
        const said = x?.error || x?.arm?.error || (x?.arm?.silent ? '[silent]' : x?.arm?.reply) || '';
        const flags = (x?.arm?.violations || []).map((v) => VIOLATION_LABEL[v] || v).join(', ');
        lines.push(`${side.toUpperCase()} [${passed(x, judged) ? 'pass' : 'FAIL'}] ${said}`);
        lines.push(`   ${x?.arm?.control.function || ''}${flags ? ` · flags: ${flags}` : ''}${x?.judge?.why ? ` · judge: ${x.judge.why}` : ''}`);
      }
      lines.push('');
    }
    try { await navigator.clipboard.writeText(lines.join('\n')); } catch { /* clipboard blocked */ }
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium">
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <ShieldAlert className="h-4 w-4" /> Adversarial check — the {seeds.length} hard scenarios on both builds
        {rows.length > 0 && <Chip>{summary.regress} regression{summary.regress === 1 ? '' : 's'}</Chip>}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border px-4 py-4">
          <p className="max-w-3xl text-xs text-muted-foreground">
            Each scenario is a hard moment from the behavioural eval (frustration, a wrong unit, a request for the answer,
            wanting to stop…). Both builds answer it; the table shows both replies, what each decided and the guardrails
            each broke. With the judge on, one judge grades both replies against the scenario&rsquo;s rule. A
            <strong> regression</strong> is a scenario Current passes and New fails.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={withJudge} onChange={(e) => setWithJudge(e.target.checked)} disabled={running} />
              Judge the replies (gpt-4o)
            </label>
            <select value={channel} onChange={(e) => setChannel(e.target.value as 'text' | 'voice')} disabled={running}
              className="rounded-lg border border-border bg-background px-2 py-1 text-sm" aria-label="Channel">
              <option value="text">Chat</option><option value="voice">Voice path</option>
            </select>
            <select value={modelMode} onChange={(e) => setModelMode(e.target.value)} disabled={running}
              className="rounded-lg border border-border bg-background px-2 py-1 text-sm" aria-label="Model">
              {modelModes.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
            {running ? (
              <button onClick={() => { stop.current = true; }} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
                <Square className="h-3.5 w-3.5" /> Stop after the current ones
              </button>
            ) : (
              <button onClick={run} disabled={!ready || seeds.length === 0}
                className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-50">
                <Play className="h-3.5 w-3.5" /> Run on both
              </button>
            )}
            <span className="text-xs text-muted-foreground">
              about {seeds.length * 2} interviewer calls{withJudge ? ` + ${seeds.length * 2} judge calls` : ''} · counts toward the daily AI budget
            </span>
          </div>
          {!ready && (
            <p className="flex items-center gap-1.5 text-xs text-amber-800"><AlertTriangle className="h-3.5 w-3.5" /> Both builds must be reachable (see the cards above).</p>
          )}

          {rows.length > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {running && <span className="flex items-center gap-1 text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {done}/{rows.length}</span>}
                <Chip>Current passes {summary.cPass}/{summary.complete}</Chip>
                <Chip>New passes {summary.nPass}/{summary.complete}</Chip>
                <Chip tone={summary.regress ? 'bad' : 'default'}>{summary.regress} regression{summary.regress === 1 ? '' : 's'}</Chip>
                <Chip tone={summary.improve ? 'reveal' : 'default'}>{summary.improve} improved</Chip>
                <Chip>{summary.differ} replies differ</Chip>
                <div className="ml-auto flex flex-wrap gap-1">
                  {(['all', 'regressions', 'failures', 'differences'] as Filter[]).map((f) => (
                    <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}
                      className={`rounded-md px-2 py-1 text-xs font-medium ${filter === f ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`}>
                      {f}
                    </button>
                  ))}
                  <button onClick={copy} title="Copy failures and regressions to paste to Claude"
                    className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted">
                    <ClipboardCopy className="h-3 w-3" /> Copy for Claude
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {shown.map((r) => <ScenarioRow key={r.s.id} r={r} judged={judged} />)}
                {shown.length === 0 && <p className="text-xs text-muted-foreground">Nothing in this filter.</p>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ScenarioRow({ r, judged }: { r: Row; judged: boolean }) {
  const c = passed(r.current, judged), n = passed(r.new, judged);
  const tag = c === true && n === false ? { t: 'regression', tone: 'bad' as const }
    : c === false && n === true ? { t: 'improved', tone: 'reveal' as const }
      : (r.current?.arm?.reply ?? '') !== (r.new?.arm?.reply ?? '') && r.current?.arm && r.new?.arm ? { t: 'differs', tone: 'warn' as const } : null;
  return (
    <div className={`rounded-lg border p-3 ${tag?.t === 'regression' ? 'border-red-300' : 'border-border'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <code className="font-mono text-xs font-semibold">{r.s.id}</code>
        <Chip>{r.s.case_type}</Chip>
        {tag && <Chip tone={tag.tone}>{tag.t}</Chip>}
      </div>
      <p className="mt-1 text-xs italic text-muted-foreground">Candidate: &ldquo;{r.s.new_message}&rdquo;</p>
      {r.s.required && <p className="mt-0.5 text-[11px] text-muted-foreground">Must: {r.s.required}</p>}
      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
        {SIDES.map((side) => <ResultCell key={side} side={side} cell={r[side]} judged={judged} />)}
      </div>
    </div>
  );
}

function ResultCell({ side, cell, judged }: { side: Side; cell?: Cell; judged: boolean }) {
  const p = passed(cell, judged);
  const label = side === 'current' ? 'Current' : 'New';
  if (!cell) {
    return <div className="rounded-md bg-muted/40 px-2 py-1.5 text-xs text-muted-foreground"><Loader2 className="mr-1 inline h-3 w-3 animate-spin" />{label}…</div>;
  }
  const a = cell.arm;
  const text = cell.error || a?.error || (a?.silent ? '(silent — the candidate sees no reply)' : a?.reply) || '';
  return (
    <div className={`space-y-1 rounded-md px-2 py-1.5 text-xs ${p === false ? 'bg-red-50' : p === true ? 'bg-emerald-50' : 'bg-muted/40'}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-semibold">{label}</span>
        {p !== null && <span className={p ? 'text-emerald-700' : 'text-red-700'}>{p ? 'pass' : 'fail'}</span>}
        {a?.control.function && <Chip>{a.control.function}</Chip>}
        {a?.voice && <Chip>voice · {a.voice.lane}</Chip>}
        {(a?.violations || []).map((v) => <Chip key={v} tone="bad">{VIOLATION_LABEL[v] || v}</Chip>)}
      </div>
      <p className="whitespace-pre-wrap">{text}</p>
      {cell.judge?.why && <p className="text-[11px] text-muted-foreground">judge: {cell.judge.why}</p>}
    </div>
  );
}

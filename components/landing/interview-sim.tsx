'use client';

/**
 * InterviewSim — the landing-hero interactive case/guesstimate interview.
 *
 * A stranger sits a real 4-step case (or guesstimate, via the toggle) — clarify,
 * structure, analyze, recommend — and gets scored on the 6-dimension rubric plus
 * an "interview craft" read on the questions they asked. Everything here is a
 * FRONT-END SIMULATION: it never calls the scorer, mints no session, and fetches
 * nothing, so `/` stays statically renderable. The real scoring lives behind the
 * authed solve flow; this only has to look and feel like it so a cold visitor has
 * something to do in the first screen.
 *
 * Static-safety: no useSearchParams, no cookies, no network. Auth links use
 * pathname-preserving hrefs passed in as props (default '/signup' / '/login').
 *
 * NOTE for wiring: pass today's case as `today` from the already-fetched static
 * `daily` object if you want the demo to mirror the live daily case; otherwise it
 * falls back to the baked-in sample. Do NOT wire the real /score endpoint here.
 */

import { useMemo, useReducer, useState, useTransition, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { ensureGuestSession, isGuestModeEnabled } from '@/lib/guest';
import { toast } from 'sonner';

/* ─────────────────────────── content model ─────────────────────────── */

type DimName =
  | 'Structure'
  | 'Quantitative'
  | 'Synthesis'
  | 'Business Judgment'
  | 'Creativity'
  | 'Professional Tone';

const DIMS: { name: DimName; max: number }[] = [
  { name: 'Structure', max: 25 },
  { name: 'Quantitative', max: 20 },
  { name: 'Synthesis', max: 20 },
  { name: 'Business Judgment', max: 15 },
  { name: 'Creativity', max: 10 },
  { name: 'Professional Tone', max: 10 },
];

interface SimOption {
  t: string;
  /** clarify/assumption weight for the interview-craft read */
  v?: number;
  /** contribution to each rubric dimension, keyed by DIMS index */
  dims?: Partial<Record<number, number>>;
}
interface SimStep {
  no: string;
  kind: 'multi' | 'single';
  prompt: string;
  qhint: string;
  craft?: boolean;
  opts: SimOption[];
  reply?: string;
}
export interface SimCase {
  meta: string;
  steps: SimStep[];
}

const CASE_SAMPLE: SimCase = {
  meta: 'Case · Profitability · Medium',
  steps: [
    {
      no: 'Step 1 of 4 · Clarify',
      kind: 'multi',
      prompt:
        'A quick-service restaurant chain’s profit fell 18% over two quarters — while revenue grew. Before you solve, what do you ask? (pick up to 2)',
      qhint: 'Your clarifying questions',
      craft: true,
      reply:
        'Interviewer: Good — revenue grew because delivery orders jumped, but delivery carries ~30% lower margin than dine-in, and dine-in traffic slipped. Cost per order rose slightly too.',
      opts: [
        { t: 'Which segment or channel drove the revenue growth?', v: 2 },
        { t: 'Did our cost structure change — fixed vs variable?', v: 2 },
        { t: 'Is this across all outlets, or specific regions?', v: 1 },
        { t: 'Have we changed pricing or discounts recently?', v: 2 },
        { t: 'What’s the time frame — could this be seasonal?', v: 1 },
      ],
    },
    {
      no: 'Step 2 of 4 · Structure',
      kind: 'single',
      prompt: 'How do you frame the problem out loud?',
      qhint: 'Your opening structure',
      opts: [
        { t: 'Profit = revenue − cost. Break each into drivers, then find what moved.', dims: { 0: 9, 3: 2 } },
        { t: 'Jump to costs — profit fell, so costs must have risen.', dims: { 0: 4, 3: 1 } },
        { t: 'Segment by channel (dine-in vs delivery) and compare margins.', dims: { 0: 8, 2: 3, 3: 2 } },
        { t: 'Benchmark each cost line vs last year, flag the biggest gap.', dims: { 0: 6, 1: 3 } },
        { t: 'Start from customer experience and work back to money.', dims: { 0: 3, 4: 2 } },
      ],
    },
    {
      no: 'Step 3 of 4 · Analyze',
      kind: 'single',
      prompt: 'Given the interviewer’s data, where’s the profit leaking?',
      qhint: 'Your read',
      opts: [
        { t: 'Mix shift: delivery grew, its lower margin dilutes total profit even as revenue rises.', dims: { 1: 12, 2: 8, 3: 6 } },
        { t: 'Pure cost inflation across the board.', dims: { 1: 5, 3: 2 } },
        { t: 'Falling dine-in traffic alone.', dims: { 1: 6, 2: 3 } },
        { t: 'Marketing overspend to chase delivery.', dims: { 1: 6, 4: 2 } },
        { t: 'It’s seasonal, no real problem.', dims: { 1: 2 } },
      ],
    },
    {
      no: 'Step 4 of 4 · Recommend',
      kind: 'single',
      prompt: 'Your one recommendation to the CEO?',
      qhint: 'Your recommendation',
      opts: [
        { t: 'Protect delivery margin (menu engineering, packaging, min-order) while winning dine-in back with occasions — re-check mix in a quarter.', dims: { 2: 14, 3: 9, 5: 8, 4: 5 } },
        { t: 'Cut all costs 10%.', dims: { 2: 5, 3: 2, 5: 4 } },
        { t: 'Kill delivery entirely.', dims: { 2: 6, 3: 3, 4: 3 } },
        { t: 'Raise prices across the menu.', dims: { 2: 6, 3: 4, 5: 5 } },
        { t: 'Spend more on delivery marketing to grow out of it.', dims: { 2: 5, 4: 3 } },
      ],
    },
  ],
};

const GUESS_SAMPLE: SimCase = {
  meta: 'Guesstimate · Market sizing · Medium',
  steps: [
    {
      no: 'Step 1 of 4 · Assumptions',
      kind: 'multi',
      prompt:
        'Estimate cups of tea sold on a typical weekday in a city of 10 million. Which assumptions do you state up front? (pick up to 2)',
      qhint: 'Assumptions you make explicit',
      craft: true,
      reply:
        'Interviewer: Reasonable. Hold ~55% tea-drinkers, ~2 cups/day, and assume ~40% of cups are bought outside the home. Walk me to a number.',
      opts: [
        { t: 'Share of people who drink tea daily (~55%).', v: 2 },
        { t: 'Average cups per tea-drinker per day (~2).', v: 2 },
        { t: 'Split of home-made vs bought-outside cups.', v: 2 },
        { t: 'Rounding population to 10M for clean math.', v: 1 },
        { t: 'Excluding tourists and commuters for now.', v: 1 },
      ],
    },
    {
      no: 'Step 2 of 4 · Approach',
      kind: 'single',
      prompt: 'Which path do you take?',
      qhint: 'Your approach',
      opts: [
        { t: 'Bottom-up: population → drinkers → cups/day → total, then split bought vs home.', dims: { 0: 9, 3: 2 } },
        { t: 'Top-down from a national tea figure I half-remember.', dims: { 0: 3, 1: 2 } },
        { t: 'Number of tea stalls × cups each.', dims: { 0: 6, 4: 3 } },
        { t: 'Guess a round number, sanity-check after.', dims: { 0: 2, 4: 2 } },
        { t: 'Both bottom-up and stall-count, then triangulate.', dims: { 0: 8, 4: 4, 2: 3 } },
      ],
    },
    {
      no: 'Step 3 of 4 · Compute',
      kind: 'single',
      prompt: '10M × 55% × 2 cups ≈ 11M cups/day. Cleanest next move?',
      qhint: 'Your math',
      opts: [
        { t: 'Total ≈ 11M cups; ~40% bought outside → ~4.4M bought cups/day.', dims: { 1: 13, 0: 4, 2: 5 } },
        { t: 'Say “about 10 million” and stop.', dims: { 1: 5 } },
        { t: 'Multiply by 7 for a weekly figure.', dims: { 1: 4, 2: 2 } },
        { t: 'Assume everyone buys → 11M bought.', dims: { 1: 6, 3: 1 } },
        { t: 'Add a vague 20% buffer.', dims: { 1: 5, 4: 2 } },
      ],
    },
    {
      no: 'Step 4 of 4 · Sanity check',
      kind: 'single',
      prompt: 'How do you pressure-test ~4.4M bought cups/day?',
      qhint: 'Your sanity check',
      opts: [
        { t: '≈ one bought cup per 2.3 people/day — plausible; cross-check vs stalls it implies.', dims: { 2: 13, 3: 9, 5: 8 } },
        { t: 'No check needed, math is math.', dims: { 2: 3 } },
        { t: 'Restate the number louder.', dims: { 2: 3, 5: 2 } },
        { t: 'Flag the two assumptions that move it most (drinker % and bought %).', dims: { 2: 11, 3: 8, 5: 6, 4: 4 } },
        { t: 'Round to 5M for a clean headline.', dims: { 2: 6, 5: 4 } },
      ],
    },
  ],
};

const WORK_MSG: Record<number, string> = {
  0: 'Name the framework out loud before you answer — “profit = revenue − cost, I’ll test each side.”',
  1: 'Show the arithmetic and where the number comes from; prove the leak, don’t assert it.',
  2: 'End on a crisp “so-what” — one recommendation, not a list.',
  3: 'Tie the answer to what the CEO can actually do next quarter.',
  4: 'Add one non-obvious driver to stand out from every structured answer.',
  5: 'Tighten delivery — lead with the headline, then the support.',
};

/* ─────────────────────────── state machine ─────────────────────────── */

type Mode = 'case' | 'guess';
type Phase = 'play' | 'result' | 'round2';

interface State {
  mode: Mode;
  phase: Phase;
  stepIdx: number;
  acc: number[]; // length 6
  craft: number;
  picks: number[]; // selected option indices for current step
  ownOpen: boolean;
  ownText: string;
  replyAt: number | null; // step index at which to show the interviewer reply
  replyText: string;
  guided: number; // guided total, carried into round 2
  r2Text: string;
  r2Score: number | null;
}

type Action =
  | { type: 'setMode'; mode: Mode }
  | { type: 'togglePick'; i: number; multi: boolean }
  | { type: 'setOwnOpen'; open: boolean }
  | { type: 'setOwn'; text: string }
  | { type: 'advance'; steps: SimStep[] }
  | { type: 'reset' }
  | { type: 'round2' }
  | { type: 'setR2'; text: string }
  | { type: 'scoreR2' };

const zero6 = () => [0, 0, 0, 0, 0, 0];

function freshPlay(mode: Mode): State {
  return {
    mode, phase: 'play', stepIdx: 0, acc: zero6(), craft: 0, picks: [],
    ownOpen: false, ownText: '', replyAt: null, replyText: '',
    guided: 0, r2Text: '', r2Score: null,
  };
}

function clamp(v: number, max: number) { return Math.max(0, Math.min(max, v)); }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setMode':
      return freshPlay(action.mode);
    case 'reset':
      return freshPlay(state.mode);
    case 'setOwnOpen':
      return { ...state, ownOpen: action.open };
    case 'setOwn':
      return { ...state, ownText: action.text, picks: action.text.trim() ? [] : state.picks };
    case 'togglePick': {
      if (action.multi) {
        const has = state.picks.includes(action.i);
        if (has) return { ...state, picks: state.picks.filter((x) => x !== action.i) };
        if (state.picks.length >= 2) return state;
        return { ...state, picks: [...state.picks, action.i], ownText: '' };
      }
      return { ...state, picks: [action.i], ownText: '', ownOpen: false };
    }
    case 'advance': {
      const steps = action.steps;
      const st = steps[state.stepIdx];
      const wrote = state.ownText.trim().length > 0;
      const acc = [...state.acc];
      let craft = state.craft;
      let replyAt = state.replyAt;
      let replyText = state.replyText;

      if (st.craft) {
        state.picks.forEach((i) => { craft += st.opts[i].v ?? 0; });
        if (wrote) craft += 2;
        acc[0] += Math.min(4, craft);
        acc[5] += 2;
        if (st.reply && steps[state.stepIdx + 1]) { replyAt = state.stepIdx + 1; replyText = st.reply; }
      } else if (state.picks.length && st.opts[state.picks[0]]?.dims) {
        const d = st.opts[state.picks[0]].dims as Partial<Record<number, number>>;
        Object.keys(d).forEach((k) => { acc[Number(k)] += d[Number(k)] ?? 0; });
      } else if (wrote) {
        const len = state.ownText.trim().length;
        const base = len > 140 ? 0.85 : len > 60 ? 0.62 : 0.4;
        acc[0] += Math.round(9 * base); acc[1] += Math.round(6 * base); acc[2] += Math.round(7 * base);
        acc[3] += Math.round(4 * base); acc[4] += Math.round(3 * base); acc[5] += Math.round(5 * base);
      }

      const nextIdx = state.stepIdx + 1;
      if (nextIdx >= steps.length) {
        const total = DIMS.reduce((s, d, i) => s + clamp(acc[i], d.max), 0);
        return { ...state, acc, craft, phase: 'result', guided: total };
      }
      return { ...state, acc, craft, stepIdx: nextIdx, picks: [], ownText: '', ownOpen: false, replyAt, replyText };
    }
    case 'round2':
      return { ...state, phase: 'round2', r2Text: '', r2Score: null };
    case 'setR2':
      return { ...state, r2Text: action.text };
    case 'scoreR2': {
      const len = state.r2Text.trim().length;
      const factor = len > 320 ? 0.98 : len > 180 ? 0.86 : len > 90 ? 0.72 : 0.55;
      return { ...state, r2Score: Math.max(20, Math.round(state.guided * factor)) };
    }
    default:
      return state;
  }
}

/* ─────────────────────────── view ─────────────────────────── */

function barColor(v: number, max: number) {
  const r = v / max;
  return r >= 0.8 ? 'bg-emerald-600' : r >= 0.55 ? 'bg-primary' : 'bg-amber-500';
}

interface Props {
  /** optional override of today's case, e.g. built from the static `daily` object */
  today?: SimCase;
  /** today's real daily case / guesstimate ids — the sim funnels into these for a real, scored, ranked attempt */
  caseId?: string | null;
  guesstimateId?: string | null;
  signupHref?: string;
  loginHref?: string;
}

export default function InterviewSim({ today, caseId = null, guesstimateId = null, signupHref = '/signup', loginHref = '/login' }: Props) {
  const [s, dispatch] = useReducer(reducer, freshPlay('case'));
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [starting, setStarting] = useState(false);
  const caseData = today ?? CASE_SAMPLE;
  const data = s.mode === 'case' ? caseData : GUESS_SAMPLE;
  const steps = data.steps;
  const step = steps[s.stepIdx];

  // The sim is a warm-up on a sample; the real, scored, RANKED attempt is the
  // live daily case. "Take it for real" mints the same anonymous guest session
  // the rest of the landing uses, then opens the real case — so the attempt is
  // recorded and nothing is lost on sign-up. Click-only (never on mount) keeps
  // "/" statically renderable and does not create a user row for crawlers.
  async function startReal() {
    const rid = s.mode === 'case' ? (caseId ?? guesstimateId) : (guesstimateId ?? caseId);
    if (!isGuestModeEnabled() || !rid) { router.push(signupHref); return; }
    if (starting) return;
    setStarting(true);
    try {
      const user = await ensureGuestSession();
      if (!user) { toast.error('Could not start a session — try signing up.'); router.push(signupHref); return; }
      startTransition(() => router.push(`/cases/${rid}`));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start. Please try again.');
    } finally {
      setStarting(false);
    }
  }

  const vals = useMemo(
    () => DIMS.map((d, i) => clamp(s.acc[i], d.max)),
    [s.acc],
  );
  const total = useMemo(() => vals.reduce((a, b) => a + b, 0), [vals]);

  const canAdvance = s.ownText.trim().length > 0 || s.picks.length > 0;
  const isLast = s.stepIdx === steps.length - 1;

  return (
    <div className="ui-card overflow-hidden">
      {/* top bar: toggle + meta */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/50 px-3.5 py-3">
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
          {(['case', 'guess'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => dispatch({ type: 'setMode', mode: m })}
              aria-pressed={s.mode === m}
              className={`min-h-9 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                s.mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'case' ? 'Case' : 'Guesstimate'}
            </button>
          ))}
        </div>
        <span className="text-right font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
          {data.meta}
        </span>
      </div>

      {/* progress */}
      <div className="flex gap-1.5 px-4 pt-3">
        {steps.map((_, i) => (
          <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: s.phase !== 'play' || i < s.stepIdx ? '100%' : i === s.stepIdx ? '50%' : '0%' }}
            />
          </span>
        ))}
      </div>

      <div className="p-4">
        {s.phase === 'play' && (
          <>
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">{step.no}</div>
            <p className="mt-2 text-[15px] font-semibold leading-snug">{step.prompt}</p>

            {s.replyAt === s.stepIdx && s.replyText && (
              <p className="mt-2.5 rounded-lg border border-border bg-muted/60 px-3 py-2.5 text-[13px] leading-relaxed text-muted-foreground">
                <strong className="text-foreground">{s.replyText.split(':')[0]}:</strong>
                {s.replyText.slice(s.replyText.indexOf(':') + 1)}
              </p>
            )}

            <div className="mt-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted-foreground/80">
              {step.qhint}
            </div>

            <div className="mt-2 grid gap-2">
              {step.opts.map((o, i) => {
                const sel = s.picks.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => dispatch({ type: 'togglePick', i, multi: step.kind === 'multi' })}
                    className={`flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[13.5px] leading-snug transition-colors ${
                      sel ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    <span
                      className={`grid h-[21px] w-[21px] flex-none place-items-center rounded-md border text-[11px] font-extrabold ${
                        sel ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground'
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{o.t}</span>
                  </button>
                );
              })}
            </div>

            {/* write-your-own / ask-your-own */}
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => dispatch({ type: 'setOwnOpen', open: !s.ownOpen })}
                className="py-1 text-[12.5px] font-semibold text-primary hover:underline"
              >
                ✎ {step.kind === 'multi' ? 'Ask your own question' : 'Write my own answer'}
              </button>
              {s.ownOpen && (
                <textarea
                  value={s.ownText}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => dispatch({ type: 'setOwn', text: e.target.value })}
                  placeholder={step.kind === 'multi' ? 'Type a clarifying question…' : 'Structure your answer in your own words…'}
                  className="mt-2 min-h-[66px] w-full resize-y rounded-xl border border-border bg-card px-3 py-2.5 text-[13.5px] leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
                />
              )}
            </div>

            <div className="mt-3.5 flex items-center justify-between gap-3">
              <span className="text-[11.5px] text-muted-foreground">
                {step.kind === 'multi' ? 'Good candidates ask before they solve.' : 'Pick one, or write your own.'}
              </span>
              <button
                type="button"
                disabled={!canAdvance}
                onClick={() => dispatch({ type: 'advance', steps })}
                className="btn-primary min-w-[130px] disabled:opacity-45"
              >
                {isLast ? 'Score me' : step.kind === 'multi' ? 'Ask' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {s.phase === 'result' && (
          <Result
            vals={vals}
            total={total}
            craft={s.craft}
            mode={s.mode}
            signupHref={signupHref}
            starting={starting}
            onStartReal={startReal}
            onRetry={() => dispatch({ type: 'reset' })}
            onRound2={() => dispatch({ type: 'round2' })}
          />
        )}

        {s.phase === 'round2' && (
          <Round2
            guided={s.guided}
            text={s.r2Text}
            score={s.r2Score}
            starting={starting}
            onStartReal={startReal}
            onText={(t) => dispatch({ type: 'setR2', text: t })}
            onScore={() => dispatch({ type: 'scoreR2' })}
          />
        )}
      </div>

      {/* footer auth affordance — always one tap to log in / sign up */}
      <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/40 px-4 py-2.5 text-[12.5px]">
        <span className="text-muted-foreground">Already a member?</span>
        <span className="flex items-center gap-3">
          <Link href={loginHref} className="font-semibold text-foreground hover:text-primary">Log in</Link>
          <Link href={signupHref} className="font-semibold text-primary hover:underline">Sign up free</Link>
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────── result view ─────────────────────────── */

function Result({
  vals, total, craft, mode, signupHref, starting, onStartReal, onRetry, onRound2,
}: {
  vals: number[]; total: number; craft: number; mode: Mode;
  signupHref: string; starting: boolean; onStartReal: () => void; onRetry: () => void; onRound2: () => void;
}) {
  const craftLabel = craft >= 4 ? 'Strong' : craft >= 2 ? 'Solid' : 'Thin';
  const craftGood = craft >= 2;
  const verdict =
    total >= 80 ? 'This is offer-standard — structure first, answer second.'
    : total >= 65 ? 'A solid attempt with one or two gaps an interviewer would probe.'
    : 'The instinct is there; the structure and the “so-what” need work.';

  let lowIdx = 0, lowR = 2, hiIdx = 0, hiR = -1;
  vals.forEach((v, i) => {
    const r = v / DIMS[i].max;
    if (r < lowR) { lowR = r; lowIdx = i; }
    if (r > hiR) { hiR = r; hiIdx = i; }
  });
  const craftLine =
    mode === 'case'
      ? craft >= 4
        ? 'You asked the two highest-value clarifiers before solving — exactly what a strong candidate does.'
        : 'You solved before you clarified enough. The best candidates ask about channel mix and cost structure first.'
      : craft >= 4
        ? 'You stated the assumptions that actually move the answer up front — clean.'
        : 'State the assumptions that swing the number (drinker % and bought %) before you compute.';

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="font-mono text-[50px] font-bold leading-none tracking-tight tabular-nums">
          {total}
          <span className="text-[19px] text-muted-foreground">/100</span>
        </div>
        <p className="text-[13px] text-muted-foreground"><strong className="text-foreground">{verdict}</strong></p>
      </div>

      <div className="mt-3.5 flex items-center gap-2.5 rounded-xl border border-border bg-muted/50 px-3 py-2.5">
        <span className="text-[12px] font-bold">Interview craft — the questions you asked</span>
        <span className={`tag ${craftGood ? 'tag-green' : 'tag-amber'} ml-auto`}>{craftLabel}</span>
      </div>

      <div className="mt-3.5 grid gap-2.5">
        {DIMS.map((d, i) => (
          <div key={d.name} className="grid grid-cols-[120px_1fr_40px] items-center gap-2.5">
            <span className="text-[12px] font-semibold">{d.name}</span>
            <span className="h-[7px] overflow-hidden rounded-full bg-muted">
              <span
                className={`block h-full rounded-full ${barColor(vals[i], d.max)} transition-[width] duration-700`}
                style={{ width: `${(vals[i] / d.max) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono text-[12px] font-semibold text-muted-foreground tabular-nums">
              {vals[i]}/{d.max}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3.5 grid gap-2">
        <div className="flex gap-2 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-[12.5px] leading-snug">
          <span className="font-mono font-extrabold text-emerald-600">+</span>
          <span><strong>Strongest: {DIMS[hiIdx].name}.</strong> {craftLine}</span>
        </div>
        <div className="flex gap-2 rounded-lg bg-amber-500/10 px-3 py-2.5 text-[12.5px] leading-snug">
          <span className="font-mono font-extrabold text-amber-600">→</span>
          <span><strong>Fix next — {DIMS[lowIdx].name}:</strong> {WORK_MSG[lowIdx]}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <button type="button" onClick={onStartReal} disabled={starting} className="btn-primary justify-center disabled:opacity-60">
          {starting ? 'Starting…' : 'Take today’s case for real'}
          {!starting && <ArrowRight className="h-4 w-4" />}
        </button>
        <button type="button" onClick={onRound2} className="btn-ghost justify-center">
          Round 2 · solve it free-form first
        </button>
        <button type="button" onClick={onRetry} className="inline-flex items-center justify-center gap-1.5 py-1 text-[13px] font-medium text-muted-foreground hover:text-foreground">
          <RotateCcw className="h-3.5 w-3.5" /> Try again
        </button>
        <span className="text-center text-[11.5px] text-muted-foreground">
          This tapped round is a warm-up — it isn’t scored for real. Do today’s live case to earn a saved score and your rank, or{' '}
          <Link href={signupHref} className="font-semibold text-primary hover:underline">sign up first</Link>.
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────── round 2 view ─────────────────────────── */

function Round2({
  guided, text, score, starting, onStartReal, onText, onScore,
}: {
  guided: number; text: string; score: number | null;
  starting: boolean; onStartReal: () => void; onText: (t: string) => void; onScore: () => void;
}) {
  const delta = score === null ? 0 : score - guided;
  return (
    <div>
      <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">Round 2 · Free-form</div>
      <p className="mt-2 text-[15px] font-semibold leading-snug">
        Same case. No options — structure it, do the math, write your recommendation as one answer.
      </p>
      <textarea
        value={text}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onText(e.target.value)}
        placeholder="Frame it, walk the numbers, land one recommendation…"
        className="mt-3 min-h-[120px] w-full resize-y rounded-xl border border-border bg-card px-3 py-2.5 text-[13.5px] leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
      />
      <div className="mt-3.5 flex items-center justify-between gap-3">
        <span className="text-[11.5px] text-muted-foreground">This is what the real room feels like.</span>
        <button type="button" disabled={text.trim().length < 20 || score !== null} onClick={onScore} className="btn-primary min-w-[130px] disabled:opacity-45">
          Score round 2
        </button>
      </div>

      {score !== null && (
        <div className="mt-4 grid gap-2.5">
          <CompareBar label="Guided" value={guided} tone="neutral" />
          <CompareBar label="Free-form" value={score} tone={delta >= 0 ? 'good' : 'warn'} />
          <div className={`flex gap-2 rounded-lg px-3 py-2.5 text-[12.5px] leading-snug ${delta >= 0 ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
            <span className={`font-mono font-extrabold ${delta >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>{delta >= 0 ? '+' : '→'}</span>
            <span>
              {delta >= 0
                ? `You beat your guided run by ${delta} — you can build the structure yourself.`
                : `You dropped ${-delta} without the options. That gap is your prep list — exactly what members train away.`}
            </span>
          </div>
          <button type="button" onClick={onStartReal} disabled={starting} className="btn-primary mt-1 justify-center disabled:opacity-60">
            {starting ? 'Starting…' : 'Take today’s case for real'}
            {!starting && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}

function CompareBar({ label, value, tone }: { label: string; value: number; tone: 'neutral' | 'good' | 'warn' }) {
  const color = tone === 'good' ? 'bg-emerald-600' : tone === 'warn' ? 'bg-amber-500' : 'bg-primary';
  return (
    <div className="grid grid-cols-[120px_1fr_40px] items-center gap-2.5">
      <span className="text-[12px] font-semibold">{label}</span>
      <span className="h-[7px] overflow-hidden rounded-full bg-muted">
        <span className={`block h-full rounded-full ${color} transition-[width] duration-700`} style={{ width: `${value}%` }} />
      </span>
      <span className="text-right font-mono text-[12px] font-semibold text-muted-foreground tabular-nums">{value}</span>
    </div>
  );
}

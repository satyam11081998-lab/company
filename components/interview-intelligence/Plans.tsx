'use client';

/**
 * Interview Intelligence plans — a PREVIEW only people with Interview Intelligence can open
 * (the server answers 404 to everyone else). Prices come from the II admin settings (Ultra) and
 * from MECE's own price list (Pro). Nothing here charges money: Ultra's button records interest
 * until payments are wired.
 *
 * Layout: three short cards to choose from (price, who it is for, one button), then ONE table that
 * lists every feature once, sorted as a staircase: what every plan has (Free ticks, some with a
 * limit), then what Pro adds (Free crosses), then what only Ultra has — so Free reads tick…cross,
 * Pro ticks for longer, Ultra ticks all the way down. Interview limits, the interview types per plan
 * and the voice per plan come from the II server (the same values it enforces); the case-practice
 * rows read MECE's own limits (lib/tier TIER_LIMITS), so the page cannot drift from either.
 */

import { Fragment, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ii, IIError } from '@/lib/interview-intelligence/api';
import { MODES } from '@/lib/interview-intelligence/format';
import type { IIMe, IIPlanLevel, IIPlans } from '@/lib/interview-intelligence/types';
import { priceFor, TIER_LIMITS } from '@/lib/tier';
import { AccessGate, ErrorNote, Spinner } from './primitives';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const count = (n: number) => (n === Infinity ? 'Unlimited' : String(n));

/** true = included, false = not included, text = included, with this limit. */
type Cell = boolean | string;
interface Row { label: string; note?: string; free: Cell; pro: Cell; ultra: Cell }
interface Group { title: string; caption: string; rows: Row[] }

const VOICE_LABEL = { realtime: 'Premium live voice', gemini: 'Live voice', standard: 'Turn-by-turn voice' } as const;

/** Every feature once. Ultra is everything in Pro plus more, so a case-practice row's Ultra cell is Pro's. */
function featureRows(p: IIPlans): Row[] {
  const free = TIER_LIMITS.free;
  const pro = TIER_LIMITS.pro;
  const proIv = p.pro ?? { minutes: 20, monthly_interviews: 2 };
  const lengths = p.ultra.durations?.length ? p.ultra.durations : [15, 30, 45, 60];
  // the setup screen's names for each type, so the two pages agree
  const types = (plan: IIPlanLevel) => (p.modes ?? [])
    .filter((m) => m.plan === plan && m.id !== 'weakness_targeting')
    .map((m) => MODES.find((x) => x.id === m.id)?.label ?? m.label).join(', ');
  const v = p.voice;
  const voiceDiffers = v ? new Set(Object.values(v)).size > 1 : false;
  const voice = (plan: IIPlanLevel): Cell => (v && voiceDiffers ? VOICE_LABEL[v[plan]] : true);
  const all = { free: true, pro: true, ultra: true } as const;
  const cases = (r: Omit<Row, 'ultra'>): Row => ({ ...r, ultra: r.pro });

  return [
    // ---- the AI interviewer
    { label: 'AI interviews built from your CV and the job description', free: 'One, ever',
      pro: `${proIv.monthly_interviews} a month`, ultra: `${p.ultra.monthly_interviews} a month` },
    { label: 'Interview length', free: `${p.trial.minutes} min`, pro: `${proIv.minutes} min`,
      ultra: `${Math.min(...lengths)}–${Math.max(...lengths)} min, you choose` },
    { label: 'Live voice interviewer, or type your answers', free: voice('free'), pro: voice('pro'), ultra: voice('ultra') },
    { label: 'Follow-up questions on what you actually said', ...all },
    { label: 'Full interview report', note: 'Evidence for every skill, each answer reviewed, what to say instead', ...all },
    { label: 'Everyday interview types', note: types('free'), ...all },
    { label: 'Role-specific interview types', note: types('pro'), free: false, pro: true, ultra: true },
    { label: 'Progress across your interviews', note: 'Needs two or more interviews', free: false, pro: true, ultra: true },
    { label: 'Questions on your hobbies, responsibilities and business news',
      note: `They need time: a ${proIv.minutes}-minute HR or case interview usually has room, 30 minutes and longer always do`,
      free: false, pro: 'Some types', ultra: true },
    { label: 'The hardest interview types', note: types('ultra'), free: false, pro: false, ultra: true },
    { label: 'A re-attempt interview on your weak areas', note: 'Built from your report’s development areas',
      free: false, pro: false, ultra: true },
    // ---- case practice (MECE's own limits)
    cases({ label: 'Learn library and Casebook', free: true, pro: true }),
    cases({ label: 'Today’s case and guesstimate', free: true, pro: true }),
    cases({ label: 'Scored feedback on every case you solve', note: 'Scorecard, where your marks went, three approaches',
      free: true, pro: true }),
    cases({ label: 'Leaderboard and badges', free: true, pro: true }),
    cases({ label: 'Extra cases and guesstimates from the bank',
      free: `${free.lifetimeExtraCases} + ${free.lifetimeExtraGuesstimates}, once`, pro: 'Unlimited' }),
    cases({ label: 'Interviewer hints per case', free: count(free.maxHintQuestions), pro: count(pro.maxHintQuestions) }),
    cases({ label: 'GD briefs', free: `${free.gdBriefsLifetime} brief`, pro: 'Unlimited' }),
    cases({ label: 'Bookmarks and personal cheat sheet', free: 'From your free brief', pro: true }),
    cases({ label: 'CV Pointer Lab', free: `${free.cvLabTrialUses} tries`, pro: count(pro.cvLabTrialUses) }),
    cases({ label: 'Case re-attempts', free: free.maxReattempts > 0 ? count(free.maxReattempts) : false,
      pro: count(pro.maxReattempts) }),
    cases({ label: 'Worked figures for every case', note: 'Profit bridge, 2×2, driver tree', free: free.caseFigures,
      pro: pro.caseFigures }),
    cases({ label: 'Prep Copilot', note: 'Finds your weak spots, makes cases for you, plans your week', free: false, pro: true }),
    cases({ label: 'Interviewer simulator', free: false, pro: true }),
    cases({ label: 'Deck Vault', free: false, pro: 'Lifetime' }),
  ];
}

/** The staircase: rows grouped by the first plan that has them, in their original order. */
function staircase(rows: Row[]): Group[] {
  const first = (r: Row): IIPlanLevel => (r.free !== false ? 'free' : r.pro !== false ? 'pro' : 'ultra');
  const groups: Group[] = [
    { title: 'In every plan', caption: 'Free has all of these, some with a limit', rows: [] },
    { title: 'Added in Pro', caption: 'Pro and Ultra', rows: [] },
    { title: 'Added in Ultra', caption: 'Only in Ultra', rows: [] },
  ];
  const at: Record<IIPlanLevel, number> = { free: 0, pro: 1, ultra: 2 };
  rows.forEach((r) => groups[at[first(r)]].rows.push(r));
  return groups.filter((g) => g.rows.length > 0);
}

export default function Plans() {
  return <AccessGate history>{(me) => <PlansInner me={me} />}</AccessGate>;
}

function PlansInner({ me }: { me: IIMe }) {
  const [plans, setPlans] = useState<IIPlans | null>(null);
  const [error, setError] = useState<IIError | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ii.plans().then(setPlans).catch((e) => setError(e as IIError));
  }, []);

  async function interested() {
    setBusy(true);
    try {
      await ii.planInterest('ultra');
      setPlans((p) => (p ? { ...p, ultra: { ...p.ultra, interested: true } } : p));
    } catch (e) {
      setError(e as IIError);
    } finally {
      setBusy(false);
    }
  }

  if (error?.status === 404) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">This page isn’t available</h1>
        <p className="mt-3 text-muted-foreground">Plans for Interview Intelligence aren’t open yet.</p>
        <Button asChild className="mt-6" variant="outline"><Link href="/interview-intelligence">Back</Link></Button>
      </div>
    );
  }
  if (!plans) {
    return <div className="py-24">{error ? <ErrorNote error={error.message} /> : <Spinner label="Loading plans…" />}</div>;
  }

  const trial = plans.you.trial;
  const pro = priceFor('pro', 'monthly');
  const proIv = plans.pro ?? { minutes: 20, monthly_interviews: 2, open: false };
  const isUltra = plans.you.via === 'ultra';
  const prices = { free: '₹0', pro: inr(pro), ultra: inr(plans.ultra.price_inr) };

  const ultraCta = isUltra ? (
    <Button className="w-full" disabled>Your plan</Button>
  ) : plans.ultra.interested ? (
    <Button className="w-full" disabled><Check /> We’ll tell you when it opens</Button>
  ) : (
    <Button className="w-full" onClick={interested} disabled={busy}>
      {busy && <Loader2 className="animate-spin" />} Tell me when it opens
    </Button>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/interview-intelligence" className="text-sm text-muted-foreground hover:text-foreground">Interview Intelligence</Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Practise the interview, not just the case</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        A live interviewer built from your CV and the exact job description, that follows up on what you actually
        say, then shows you, with evidence, what landed and what to say instead.
      </p>

      {plans.preview && (
        <p className="mt-5 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          Preview: only people with Interview Intelligence access can see this page. Prices aren’t final and
          nothing is charged.
        </p>
      )}

      {/* Choose: one line each, no feature lists (the table below has them all). On a phone the
          recommended plan comes first; on wider screens it sits on the right. */}
      <div className="mt-8 grid gap-6 md:grid-cols-3 md:items-stretch md:gap-4">
        <PlanCard
          name="Free" price={prices.free} period="" lead={`Daily case practice and one ${plans.trial.minutes}-minute AI interview, to see what it’s like.`}
          cta={
            trial?.available && me.access.via === 'trial' ? (
              <Button asChild variant="outline" className="w-full"><Link href="/interview-intelligence/new">Start your free interview</Link></Button>
            ) : trial?.in_progress ? (
              <Button asChild variant="outline" className="w-full"><Link href="/interview-intelligence">Finish your free interview</Link></Button>
            ) : trial?.used ? (
              <Button variant="outline" className="w-full" disabled>Free interview used</Button>
            ) : (
              <p className="py-2 text-center text-sm text-muted-foreground">
                {plans.trial.open_to_everyone ? 'Every account gets one free interview' : 'Every account will get one free interview at launch'}
              </p>
            )
          }
        />
        <PlanCard
          name="Pro" price={prices.pro} period="/month"
          lead={`Unlimited case practice, the worked figures and Prep Copilot, plus ${proIv.monthly_interviews} AI interviews a month of ${proIv.minutes} minutes.`}
          cta={me.access.via === 'pro'
            ? <Button variant="outline" className="w-full" disabled>Your plan</Button>
            : <Button asChild variant="outline" className="w-full"><Link href="/upgrade">See Pro</Link></Button>}
        />
        <PlanCard
          highlight className="order-first md:order-none" name="Ultra" price={prices.ultra} period="/month"
          lead={`Everything in Pro, plus ${plans.ultra.monthly_interviews} full-length interviews a month, every interview type and a re-attempt on your weak areas.`}
          cta={ultraCta}
        />
      </div>

      <Comparison groups={staircase(featureRows(plans))} prices={prices} />

      <dl className="mt-12 grid gap-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium">Why a monthly number of interviews?</dt>
          <dd className="mt-1 text-muted-foreground">
            Every live voice interview runs real speech models for its whole length. Pro’s {proIv.monthly_interviews} and
            Ultra’s {plans.ultra.monthly_interviews} a month renew as interviews pass 30 days.
          </dd>
        </div>
        <div>
          <dt className="font-medium">What counts as an interview?</dt>
          <dd className="mt-1 text-muted-foreground">
            It counts once you press Start. Preparing one doesn’t, and every report stays in your account.
          </dd>
        </div>
        {!proIv.open && (
          <div>
            <dt className="font-medium">When do Pro’s interviews start?</dt>
            <dd className="mt-1 text-muted-foreground">
              When Interview Intelligence opens to Pro. Until then Pro has everything else in its column.
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function PlanCard({ name, price, period, lead, cta, highlight = false, className = '' }: {
  name: string; price: string; period: string; lead: string; cta: ReactNode; highlight?: boolean; className?: string;
}) {
  return (
    <section
      aria-label={name}
      className={`relative flex flex-col rounded-xl border bg-card px-6 pb-6 pt-6 ${className} ${highlight
        ? 'border-navy shadow-sm ring-1 ring-navy/20 dark:border-foreground/60 dark:ring-foreground/20' : 'border-border'}`}
    >
      {highlight && (
        <span className="absolute -top-3 left-6 rounded-full bg-navy px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-foreground dark:bg-foreground dark:text-background">
          Recommended
        </span>
      )}
      <h2 className="text-lg font-semibold tracking-tight">{name}</h2>
      <p className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tabular-nums tracking-tight">{price}</span>
        {period && <span className="text-sm text-muted-foreground">{period}</span>}
      </p>
      <p className="mt-3 flex-1 text-sm text-muted-foreground">{lead}</p>
      <div className="mt-5">{cta}</div>
    </section>
  );
}

const PLAN_COLUMNS = [
  { key: 'free', label: 'Free' },
  { key: 'pro', label: 'Pro' },
  { key: 'ultra', label: 'Ultra' },
] as const;

/** Every feature, one row each, a tick or a cross (or the amount) per plan. */
function Comparison({ groups, prices }: { groups: Group[]; prices: Record<'free' | 'pro' | 'ultra', string> }) {
  return (
    <section className="mt-14" aria-labelledby="compare-title">
      <h2 id="compare-title" className="text-xl font-semibold tracking-tight">Compare every feature</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A tick with a note means it’s included up to that limit. A cross means it isn’t in that plan.
      </p>
      <div className="mt-4 rounded-xl border border-border bg-card">
        <table className="w-full table-fixed text-sm">
          <caption className="sr-only">What each plan includes</caption>
          <colgroup>
            <col />
            <col className="w-[19%] sm:w-[15%]" />
            <col className="w-[19%] sm:w-[15%]" />
            <col className="w-[19%] sm:w-[15%]" />
          </colgroup>
          {/* stays in view while scrolling, just under the app's own sticky header */}
          <thead className="sticky top-14 z-10 bg-card md:top-16">
            <tr className="border-b border-border">
              <th scope="col" className="px-3 py-3 text-left font-medium text-muted-foreground sm:px-5">
                <span className="sr-only">Feature</span>
              </th>
              {PLAN_COLUMNS.map((c) => (
                <th key={c.key} scope="col"
                  className={`px-1 py-3 text-center sm:px-3 ${c.key === 'ultra' ? 'rounded-tr-xl bg-navy/[0.04] dark:bg-foreground/[0.04]' : ''}`}>
                  <span className="block font-semibold">{c.label}</span>
                  <span className="block text-xs font-normal text-muted-foreground tabular-nums">
                    {prices[c.key]}{c.key === 'free' ? '' : '/mo'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g, gi) => (
              <Fragment key={g.title}>
                <tr className="border-b border-border bg-muted/40">
                  <th scope="colgroup" colSpan={4} className="px-3 py-2 text-left sm:px-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground/80">{g.title}</span>
                    <span className="ml-2 text-xs font-normal text-muted-foreground">{g.caption}</span>
                  </th>
                </tr>
                {g.rows.map((r, ri) => {
                  const lastRow = gi === groups.length - 1 && ri === g.rows.length - 1;
                  return (
                  <tr key={r.label} className="border-b border-border last:border-b-0">
                    <th scope="row" className="px-3 py-3 text-left font-normal sm:px-5">
                      <span className="block">{r.label}</span>
                      {r.note && <span className="mt-0.5 block text-xs text-muted-foreground">{r.note}</span>}
                    </th>
                    {PLAN_COLUMNS.map((c) => (
                      <td key={c.key}
                        className={`px-1 py-3 text-center align-middle sm:px-3 ${c.key === 'ultra'
                          ? `bg-navy/[0.04] dark:bg-foreground/[0.04] ${lastRow ? 'rounded-br-xl' : ''}` : ''}`}>
                        <CellMark value={r[c.key]} />
                      </td>
                    ))}
                  </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** A tick (included), a tick with its limit underneath, or a cross (not in this plan). */
function CellMark({ value }: { value: Cell }) {
  if (value === false) {
    return <><X className="mx-auto h-4 w-4 text-muted-foreground/60" strokeWidth={2.25} aria-hidden /><span className="sr-only">Not included</span></>;
  }
  return (
    <>
      <Check className="mx-auto h-4 w-4 text-viz-good" strokeWidth={2.5} aria-hidden />
      {value === true
        ? <span className="sr-only">Included</span>
        : <span className="mt-1 block text-[11px] leading-tight text-muted-foreground sm:text-xs">{value}</span>}
    </>
  );
}

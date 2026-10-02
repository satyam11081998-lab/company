'use client';

/**
 * Interview Intelligence plans — a PREVIEW only people with Interview Intelligence can open
 * (the server answers 404 to everyone else). Prices come from the II admin settings (Ultra) and
 * from MECE's own price list (Pro). Nothing here charges money: Ultra's button records interest
 * until payments are wired.
 *
 * Layout: three short cards to choose from (price, who it is for, one button), then ONE table that
 * lists every feature with a tick or a cross per plan — so nothing is said twice. The case-practice
 * rows read MECE's own limits (lib/tier TIER_LIMITS), so this page cannot drift from what Free and
 * Pro actually get.
 */

import { Fragment, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ii, IIError } from '@/lib/interview-intelligence/api';
import type { IIMe, IIPlans } from '@/lib/interview-intelligence/types';
import { priceFor, TIER_LIMITS } from '@/lib/tier';
import { AccessGate, ErrorNote, Spinner } from './primitives';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const count = (n: number) => (n === Infinity ? 'Unlimited' : String(n));

/** true = included, false = not included, text = included with this amount. */
type Cell = boolean | string;
interface Row { label: string; note?: string; free: Cell; pro: Cell; ultra: Cell }
interface Group { title: string; rows: Row[] }

function featureGroups(p: IIPlans): Group[] {
  const free = TIER_LIMITS.free;
  const pro = TIER_LIMITS.pro;
  const once = `1 free · ${p.trial.minutes} min`;
  // Ultra is everything in Pro plus the AI interviewer: its case-practice cells are Pro's.
  const casePractice: Omit<Row, 'ultra'>[] = [
    { label: 'Learn library and Casebook', free: true, pro: true },
    { label: 'Today’s case and guesstimate', free: true, pro: true },
    { label: 'Leaderboard and badges', free: true, pro: true },
    { label: 'Extra cases and guesstimates from the bank',
      free: `${free.lifetimeExtraCases} + ${free.lifetimeExtraGuesstimates}, once`, pro: 'Unlimited' },
    { label: 'Re-attempts of a case', free: free.maxReattempts > 0, pro: count(pro.maxReattempts) },
    { label: 'Interviewer hints per case', free: count(free.maxHintQuestions), pro: count(pro.maxHintQuestions) },
    { label: 'Worked figures for every case', note: 'Profit bridge, 2×2, driver tree', free: free.caseFigures, pro: pro.caseFigures },
    { label: 'Prep Copilot', note: 'Weak-spot diagnosis and a weekly plan', free: false, pro: true },
    { label: 'Interviewer simulator', free: false, pro: true },
    { label: 'GD briefs and cheat sheet', free: `${free.gdBriefsLifetime} brief`, pro: 'Unlimited' },
    { label: 'CV Pointer Lab', free: `${free.cvLabTrialUses} tries`, pro: count(pro.cvLabTrialUses) },
    { label: 'Deck Vault', free: false, pro: 'Lifetime' },
  ];
  return [
    {
      title: 'AI interviewer',
      rows: [
        { label: 'Interviews built from your CV and the job description', free: once, pro: once,
          ultra: `${p.ultra.monthly_interviews} a month` },
        { label: 'Live voice interviewer, or type your answers', free: true, pro: true, ultra: true },
        { label: 'Interview length', free: `${p.trial.minutes} min`, pro: `${p.trial.minutes} min`, ultra: 'Up to 60 min' },
        { label: 'Every interview type', note: 'Mixed, Grill, Stress, CV attack, Case, Final round, Hiring manager',
          free: true, pro: true, ultra: true },
        { label: 'Follow-ups on your own answers and your CV', free: true, pro: true, ultra: true },
        { label: 'Questions on your hobbies, activities and this month’s business news',
          note: 'Full-length interviews have room for them', free: false, pro: false, ultra: true },
        { label: 'Full report', note: 'Evidence for every skill, every question, what to say instead',
          free: true, pro: true, ultra: true },
        { label: 'Progress across interviews', free: false, pro: false, ultra: true },
        { label: 'Re-attempts aimed at your weak spots', free: false, pro: false, ultra: true },
      ],
    },
    { title: 'Case practice', rows: casePractice.map((r) => ({ ...r, ultra: r.pro })) },
  ];
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
          name="Free" price={prices.free} period="" lead={`Try the AI interviewer once (${plans.trial.minutes} minutes) and practise the daily case.`}
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
          name="Pro" price={prices.pro} period="/month" lead="Unlimited case practice, Prep Copilot and the worked figures behind every case."
          cta={<Button asChild variant="outline" className="w-full"><Link href="/upgrade">See Pro</Link></Button>}
        />
        <PlanCard
          highlight className="order-first md:order-none" name="Ultra" price={prices.ultra} period="/month"
          lead={`Everything in Pro, plus ${plans.ultra.monthly_interviews} full AI interviews a month with a live voice interviewer.`}
          cta={ultraCta}
        />
      </div>

      <Comparison groups={featureGroups(plans)} prices={prices} />

      <dl className="mt-12 grid gap-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium">Why a monthly limit on Ultra?</dt>
          <dd className="mt-1 text-muted-foreground">
            Every live voice interview runs real speech models for its whole length. {plans.ultra.monthly_interviews} a
            month is about two a week, which covers serious preparation; the allowance renews as interviews pass 30 days.
          </dd>
        </div>
        <div>
          <dt className="font-medium">What counts as the free interview?</dt>
          <dd className="mt-1 text-muted-foreground">
            It counts once you press Start. Preparing it doesn’t, and your report stays in your account afterwards.
          </dd>
        </div>
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
                  <th scope="colgroup" colSpan={4}
                    className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-5">
                    {g.title}
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

function CellMark({ value }: { value: Cell }) {
  if (value === true) {
    return <><Check className="mx-auto h-4 w-4 text-viz-good" strokeWidth={2.5} aria-hidden /><span className="sr-only">Included</span></>;
  }
  if (value === false) {
    return <><X className="mx-auto h-4 w-4 text-muted-foreground/60" strokeWidth={2.25} aria-hidden /><span className="sr-only">Not included</span></>;
  }
  return <span className="text-xs leading-tight sm:text-sm">{value}</span>;
}

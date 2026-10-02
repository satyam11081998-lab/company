'use client';

/**
 * Interview Intelligence plans — a PREVIEW only people with Interview Intelligence can open
 * (the server answers 404 to everyone else). Prices come from the II admin settings (Ultra) and
 * from MECE's own price list (Pro). Nothing here charges money: Ultra's button records interest
 * until payments are wired.
 */

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Check, Loader2, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ii, IIError } from '@/lib/interview-intelligence/api';
import type { IIMe, IIPlans } from '@/lib/interview-intelligence/types';
import { priceFor } from '@/lib/tier';
import { AccessGate, ErrorNote, Spinner } from './primitives';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

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

      {/* On a phone the recommended plan comes first; on wider screens it sits on the right. */}
      <div className="mt-8 grid gap-6 md:grid-cols-3 md:items-stretch md:gap-4">
        <PlanCard
          name="Free interview" tagline="See what it’s like." price="₹0" period="once"
          features={[
            `One ${plans.trial.minutes}-minute interview from your CV and the JD`,
            'Voice or text, any interview type',
            'The full report: evidence for every skill, every question, what to say instead',
          ]}
          missing={['One per account']}
          cta={
            trial?.available && me.access.via === 'trial' ? (
              <Button asChild variant="outline" className="w-full"><Link href="/interview-intelligence/new">Start your free interview</Link></Button>
            ) : trial?.in_progress ? (
              <Button asChild variant="outline" className="w-full"><Link href="/interview-intelligence">Finish your free interview</Link></Button>
            ) : trial?.used ? (
              <Button variant="outline" className="w-full" disabled>Used</Button>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                {plans.trial.open_to_everyone ? 'Every account gets one' : 'Every account will get one at launch'}
              </p>
            )
          }
        />
        <PlanCard
          name="Pro" tagline="Everything for case practice." price={inr(pro)} period="/month"
          features={[
            'Prep Copilot: weak-spot diagnosis and a weekly plan',
            'Unlimited practice bank and the interviewer simulator',
            'CV Pointer Lab and Deck Vault',
          ]}
          missing={['AI interviews: the free one only']}
          cta={<Button asChild variant="outline" className="w-full"><Link href="/upgrade">See Pro</Link></Button>}
        />
        <PlanCard
          highlight className="order-first md:order-none" name="Ultra" tagline="Interview like it’s the real thing." price={inr(plans.ultra.price_inr)} period="/month"
          features={[
            'Everything in Pro',
            `Up to ${plans.ultra.monthly_interviews} full AI interviews a month, live voice, up to 60 minutes`,
            'Every mode: Grill, Stress, CV attack, Case, Final round, Hiring manager',
            'Follow-ups on your own answers, your CV and this month’s business news',
            'Progress across interviews, and re-attempts aimed at your weak spots',
          ]}
          cta={
            isUltra ? (
              <Button className="w-full" disabled>Your plan</Button>
            ) : plans.ultra.interested ? (
              <Button className="w-full" disabled><Check /> We’ll tell you when it opens</Button>
            ) : (
              <Button className="w-full" onClick={interested} disabled={busy}>
                {busy && <Loader2 className="animate-spin" />} Tell me when it opens
              </Button>
            )
          }
        />
      </div>

      <dl className="mt-10 grid gap-6 text-sm sm:grid-cols-2">
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

function PlanCard({ name, tagline, price, period, features, missing = [], cta, highlight = false, className = '' }: {
  name: string; tagline: string; price: string; period: string; features: string[]; missing?: string[];
  cta: ReactNode; highlight?: boolean; className?: string;
}) {
  return (
    <section
      aria-label={name}
      className={`relative flex flex-col rounded-xl border bg-card ${className} ${highlight
        ? 'border-navy shadow-sm ring-1 ring-navy/20 dark:border-foreground/60 dark:ring-foreground/20' : 'border-border'}`}
    >
      {highlight && (
        <span className="absolute -top-3 left-6 rounded-full bg-navy px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-foreground dark:bg-foreground dark:text-background">
          Recommended
        </span>
      )}
      <div className={`border-b border-border px-6 pb-5 pt-6 ${highlight ? 'bg-navy/[0.03] dark:bg-foreground/[0.03]' : ''}`}>
        <h2 className="text-lg font-semibold tracking-tight">{name}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{tagline}</p>
        <p className="mt-5 flex items-baseline gap-1">
          <span className="text-3xl font-semibold tabular-nums tracking-tight">{price}</span>
          <span className="text-sm text-muted-foreground">{period}</span>
        </p>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-6 px-6 py-5">
        <ul className="space-y-2.5 text-sm">
          {features.map((f) => (
            <li key={f} className="flex gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-viz-good" aria-hidden />
              <span>{f}</span>
            </li>
          ))}
          {missing.map((f) => (
            <li key={f} className="flex gap-2.5 text-muted-foreground">
              <Minus className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        {cta}
      </div>
    </section>
  );
}

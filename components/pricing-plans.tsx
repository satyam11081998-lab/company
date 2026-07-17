"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Star, Zap, Sparkles, ShieldCheck, Trophy, ArrowRight } from "lucide-react";
import {
  BILLING_PERIODS,
  BILLING_PERIOD_LABELS,
  BILLING_PERIOD_SUFFIX,
  priceFor,
  perMonthEquivalent,
  type BillingPeriod,
} from "@/lib/tier";

/**
 * Public pricing cards with a billing-period toggle (Monthly / 3 months / Annual).
 * Display-only: every CTA routes to /signup, so this island carries no payment
 * logic — the actual period selection that charges happens on /upgrade.
 * Monthly is the established baseline; longer periods are prepay options, not new features.
 */
export default function PricingPlans() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <>
      {/* Billing period toggle.
          Mobile: full-width segmented control, each option stacks its "save %"
          beneath the label and meets the 44px touch target. Everything reverts
          at `sm:` so the desktop layout is byte-for-byte unchanged. */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 w-full max-w-md sm:w-auto sm:max-w-none">
          {BILLING_PERIODS.map((p) => {
            const savePct = Math.round(
              (1 - perMonthEquivalent("pro", p) / priceFor("pro", "monthly")) * 100,
            );
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                aria-pressed={period === p}
                className={`flex-1 sm:flex-none flex flex-col sm:block items-center justify-center leading-tight min-h-[44px] sm:min-h-0 sm:h-9 px-2 sm:px-4 py-1.5 sm:py-0 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {BILLING_PERIOD_LABELS[p]}
                {p !== "monthly" && savePct > 0 && (
                  <span className="sm:ml-1.5 text-[11px] font-semibold text-success">save {savePct}%</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 items-stretch">
        {/* Free */}
        <div className="ui-card flex flex-col h-full">
          <div className="p-6 border-b border-border flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-bold text-foreground tracking-tight">Free</h2>
            </div>
            <p className="text-xs text-muted-foreground">Build the daily habit at no cost.</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-mono text-3xl font-bold tabular-nums text-foreground tracking-tight">₹0</span>
              <span className="text-xs text-muted-foreground">/mo</span>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between gap-8">
            <ul className="space-y-3">
              <PlanFeature text="Full Learn & Casebook library" />
              <PlanFeature text="Today's daily case & guesstimate" />
              <PlanFeature text="+1 bank case & +1 guesstimate (one-time)" />
              <PlanFeature text="1 GD brief with cheat-sheet & PDF" />
              <PlanFeature text="CV Pointer Lab — 2 free tries" />
              <PlanFeature text="Leaderboard & badges" />
              <PlanFeature muted text="No re-attempts, hints or source links" cross />
            </ul>
            <Link href="/signup" className="mt-auto">
              <button className="w-full h-10 text-sm font-semibold rounded-md border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors">
                Get started free
              </button>
            </Link>
          </div>
        </div>

        {/* Lite */}
        <div className="ui-card flex flex-col h-full">
          <div className="p-6 border-b border-border flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <h2 className="text-lg font-bold text-foreground tracking-tight">Lite</h2>
            </div>
            <p className="text-xs text-muted-foreground">Practise beyond the daily pair.</p>
            <PriceBlock tier="lite" period={period} />
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between gap-8">
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-foreground/70 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-semibold text-foreground leading-tight">Everything in Free</span>
              </li>
              <PlanFeature text="2 extra cases & guesstimates / day" />
              <PlanFeature text="Unlimited re-attempts" />
              <PlanFeature text="Unlimited GD briefs + source links" />
              <PlanFeature text="Full cheat sheet (save & download)" />
              <PlanFeature text="5 interviewer hints per case" />
            </ul>
            <Link href="/signup" className="mt-auto">
              <button className="w-full h-10 text-sm font-semibold rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors">
                Get Lite
              </button>
            </Link>
          </div>
        </div>

        {/* Pro */}
        <div className="ui-card flex flex-col h-full relative border-primary shadow-[0_0_15px_rgba(200,16,46,0.1)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-primary-hover shadow-sm">
              Recommended
            </span>
          </div>
          <div className="p-6 border-b border-border flex flex-col bg-primary/[0.02]">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold text-foreground tracking-tight">Pro</h2>
            </div>
            <p className="text-xs text-muted-foreground">Unlimited practice and scored prep.</p>
            <PriceBlock tier="pro" period={period} />
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between gap-8 bg-primary/[0.01]">
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm font-semibold text-foreground leading-tight">Everything in Lite</span>
              </li>
              <PlanFeature text="Unlimited practice bank" />
              <PlanFeature text="Live interviewer hints & model Q&A" />
              <PlanFeature text="CV Pointer Lab — unlimited" />
              <PlanFeature text="Interviewer simulator" />
              <PlanFeature text="Deck Vault lifetime access" />
            </ul>
            <Link href="/signup" className="mt-auto">
              <button className="w-full bg-primary text-white hover:bg-primary-hover h-10 text-sm font-semibold rounded-md flex items-center justify-center transition-colors shadow-sm">
                Upgrade to Pro
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Deck Vault Rewards — competition winners get a personal discount */}
      <Link
        href="/deck-vault"
        className="group mt-6 flex items-center justify-center gap-2.5 rounded-xl border border-primary/25 bg-primary/[0.04] px-4 py-3 transition-colors hover:bg-primary/[0.08]"
      >
        <Trophy className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Won a case competition?</span>{" "}
          Upload your winning deck &amp; certificate — get up to{" "}
          <span className="font-semibold text-primary">60% off Pro</span>.
        </span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
      </Link>
    </>
  );
}

function PriceBlock({ tier, period }: { tier: "lite" | "pro"; period: BillingPeriod }) {
  return (
    <div className="mt-6">
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-3xl font-bold tabular-nums text-foreground tracking-tight">
          ₹{priceFor(tier, period).toLocaleString("en-IN")}
        </span>
        <span className="text-xs text-muted-foreground">{BILLING_PERIOD_SUFFIX[period]}</span>
      </div>
      {period !== "monthly" && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          ≈ ₹{perMonthEquivalent(tier, period).toLocaleString("en-IN")}/mo · billed{" "}
          quarterly
        </p>
      )}
    </div>
  );
}

function PlanFeature({ text, muted, cross }: { text: string; muted?: boolean; cross?: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      {cross ? (
        <Minus className="h-4 w-4 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
      ) : (
        <Check className="h-4 w-4 text-success/70 mt-0.5 flex-shrink-0" />
      )}
      <span className={`text-sm leading-tight ${muted ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
        {text}
      </span>
    </li>
  );
}

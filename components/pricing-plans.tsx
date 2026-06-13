"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Star, Zap, Sparkles, ShieldCheck } from "lucide-react";
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
      {/* Billing period toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {BILLING_PERIODS.map((p) => {
            const savePct = Math.round(
              (1 - perMonthEquivalent("pro", p) / priceFor("pro", "monthly")) * 100,
            );
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                aria-pressed={period === p}
                className={`px-4 h-9 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {BILLING_PERIOD_LABELS[p]}
                {p !== "monthly" && savePct > 0 && (
                  <span className="ml-1.5 text-[11px] font-semibold text-success">save {savePct}%</span>
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
              <PlanFeature text="Leaderboard & badges" />
              <PlanFeature muted text="No extra bank practice" cross />
              <PlanFeature muted text="No re-attempts or GD briefs" cross />
              <PlanFeature muted text="No hints or AI features" cross />
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
              <PlanFeature text="GD Briefs unlocked" />
              <PlanFeature text="5 AI hints per case" />
              <PlanFeature muted text="No bookmarks or cheat-sheet" cross />
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
            <p className="text-xs text-muted-foreground">Unlimited practice and AI prep.</p>
            <PriceBlock tier="pro" period={period} />
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between gap-8 bg-primary/[0.01]">
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm font-semibold text-foreground leading-tight">Everything in Lite</span>
              </li>
              <PlanFeature text="Unlimited practice bank" />
              <PlanFeature text="Live AI hints & model Q&A" />
              <PlanFeature text="Bookmarks & personal cheat-sheet" />
              <PlanFeature text="AI interviewer chatbot" />
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
          {period === "annual" ? "yearly" : "quarterly"}
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

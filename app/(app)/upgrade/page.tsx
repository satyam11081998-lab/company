"use client";

import React, { useState } from "react";
import Script from "next/script";
import { Check, Star, Zap, ShieldCheck, Sparkles, Minus } from "lucide-react";
import { useUser } from "@/components/user-context";
import TeamsContactBanner from "@/components/teams-contact-banner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  BILLING_PERIODS,
  BILLING_PERIOD_LABELS,
  BILLING_PERIOD_SUFFIX,
  priceFor,
  perMonthEquivalent,
  type BillingPeriod,
} from "@/lib/tier";

// Required for TS to know about Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function UpgradePage() {
  const { user, tier, refresh } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  const handleUpgrade = async (target: "lite" | "pro") => {
    if (!user) {
      toast.error("Please log in to upgrade.");
      router.push("/login");
      return;
    }

    try {
      setLoading(target);
      // 1. Create order on the backend
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: target, period }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // 2. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "MECE Placement Prep",
        description: `${target.toUpperCase()} • ${BILLING_PERIOD_LABELS[period]}`,
        order_id: data.id,
        handler: async function (response: any) {
          // 3. Verify signature on backend
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                tier: target,
                period,
                amount: data.amount,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              toast.success(`Successfully upgraded to ${target.toUpperCase()}!`);
              await refresh(); // refresh user context to get updated subscription_tier
              router.push("/dashboard");
            } else {
              toast.error(verifyData.error || "Payment verification failed");
            }
          } catch (err: any) {
            console.error(err);
            toast.error("Error verifying payment.");
          } finally {
            setLoading(null);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#0F172A", // match the navy color
        },
        modal: {
          ondismiss: function () {
            setLoading(null);
            toast.info("Payment cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(null);
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong.");
      setLoading(null);
    }
  };

  const current = tier; // effective tier: 'free' | 'lite' | 'pro'

  // The billing period isn't persisted, so infer it from the subscription window
  // (monthly ≈ 30d, quarter ≈ 91d, annual ≈ 365d). Used to mark "Current Plan" on
  // the EXACT tier + period the user holds — not on every period of that tier.
  const purchasedPeriod: BillingPeriod | null = (() => {
    if (current === "free") return null;
    const started = user?.subscription_started_at ? new Date(user.subscription_started_at).getTime() : null;
    const expires = user?.subscription_expires_at ? new Date(user.subscription_expires_at).getTime() : null;
    if (started === null || expires === null) return null; // permanent / comp grant
    const days = (expires - started) / 86_400_000;
    if (days < 60) return "monthly";
    return "quarter";
  })();

  // True only when the card's tier AND the selected period match what the user holds.
  const isCurrentPlan = (cardTier: "free" | "lite" | "pro") => {
    if (cardTier !== current) return false;
    if (cardTier === "free" || purchasedPeriod === null) return true;
    return period === purchasedPeriod;
  };

  return (
    <div className="min-h-screen bg-muted py-10 px-4">
      {/* Load Razorpay SDK */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <main className="container max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center animate-fade-in">
          <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-2">
            Pricing Plans
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Choose your plan.
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mt-3 leading-relaxed">
            Start free with today's daily case and guesstimate. Upgrade when you want the full
            practice bank, GD briefs, and unlimited re-attempts.
          </p>
        </div>

        {/* Billing period toggle */}
        <div className="flex justify-center -mt-4">
          <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
            {BILLING_PERIODS.map((p) => {
              const savePct = Math.round(
                (1 - perMonthEquivalent("pro", p) / priceFor("pro", "monthly")) * 100,
              );
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
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

        {/* Pricing Cards — Free / Lite / Pro */}
        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {/* Free */}
          <div className="ui-card flex flex-col h-full animate-slide-up" style={{ animationDelay: "60ms" }}>
            <div className="p-6 border-b border-border flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-bold text-foreground tracking-tight">Free</h2>
                {isCurrentPlan("free") && <CurrentTag />}
              </div>
              <p className="text-xs text-muted-foreground">Build the daily habit at no cost.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-mono text-3xl font-bold tabular-nums text-foreground tracking-tight">₹0</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between gap-8">
              <ul className="space-y-3">
                <FeatureItem text="Full Learn & Casebook library" />
                <FeatureItem text="Today's daily case & guesstimate" />
                <FeatureItem text="Leaderboard & badges" />
                <FeatureItem muted text="No extra bank practice" cross />
                <FeatureItem muted text="No re-attempts or GD briefs" cross />
                <FeatureItem muted text="No hints or premium tools" cross />
              </ul>
              <button
                disabled
                className="w-full h-10 text-sm font-semibold rounded-md border border-border flex items-center justify-center text-muted-foreground bg-muted/40 cursor-default mt-auto"
              >
                {current === "free" ? "Your current plan" : "Included in your plan"}
              </button>
            </div>
          </div>

          {/* Lite */}
          <div className="ui-card flex flex-col h-full animate-slide-up" style={{ animationDelay: "120ms" }}>
            <div className="p-6 border-b border-border flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <h2 className="text-lg font-bold text-foreground tracking-tight">Lite</h2>
                {isCurrentPlan("lite") && <CurrentTag />}
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
                <FeatureItem text="2 extra cases & guesstimates / day" />
                <FeatureItem text="Unlimited re-attempts" />
                <FeatureItem text="GD Briefs unlocked" />
                <FeatureItem text="5 interviewer hints per case" />
                <FeatureItem muted text="No bookmarks or cheat-sheet" cross />
              </ul>
              <button
                onClick={() => handleUpgrade("lite")}
                disabled={loading !== null || current === "pro" || isCurrentPlan("lite")}
                className="w-full h-10 text-sm font-semibold rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 mt-auto"
              >
                {current === "pro"
                  ? "Included in Pro"
                  : isCurrentPlan("lite")
                  ? "Current Plan"
                  : loading === "lite"
                  ? "Processing..."
                  : current === "lite"
                  ? `Switch to ${BILLING_PERIOD_LABELS[period]}`
                  : "Get Lite"}
              </button>
            </div>
          </div>

          {/* Pro */}
          <div className="ui-card flex flex-col h-full animate-slide-up relative border-primary shadow-[0_0_15px_rgba(200,16,46,0.1)]" style={{ animationDelay: "180ms" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-primary-hover shadow-sm">
                Recommended
              </span>
            </div>
            <div className="p-6 border-b border-border flex flex-col bg-primary/[0.02]">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-bold text-foreground tracking-tight">Pro</h2>
                {isCurrentPlan("pro") && <CurrentTag />}
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
                <FeatureItem text="CV Pointer Lab — strict-fit resume bullet writer (free)" />
                <FeatureItem text="Unlimited practice bank" />
                <FeatureItem text="Live interviewer hints & model Q&A" />
                <FeatureItem text="Bookmarks & personal cheat-sheet" />
                <FeatureItem text="Interviewer simulator" />
                <FeatureItem muted text="Deck Vault — coming soon" />
              </ul>
              <button
                onClick={() => handleUpgrade("pro")}
                disabled={loading !== null || isCurrentPlan("pro")}
                className="w-full bg-primary text-white hover:bg-primary-hover h-10 text-sm font-semibold rounded-md flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 mt-auto"
              >
                {isCurrentPlan("pro")
                  ? "Current Plan"
                  : loading === "pro"
                  ? "Processing..."
                  : current === "pro"
                  ? `Switch to ${BILLING_PERIOD_LABELS[period]}`
                  : "Upgrade to Pro"}
              </button>
            </div>
          </div>
        </div>

        {/* Colleges & clubs — quiet B2B contact line, not a focus */}
        <TeamsContactBanner />
      </main>
    </div>
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

function CurrentTag() {
  return (
    <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-success bg-success/10 px-2 py-0.5 rounded-full">
      Current
    </span>
  );
}

function FeatureItem({ text, muted, cross }: { text: string; muted?: boolean; cross?: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      {cross ? (
        <Minus className="h-4 w-4 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
      ) : (
        <Check className="h-4 w-4 text-success/70 mt-0.5 flex-shrink-0" />
      )}
      <span className={`text-sm leading-tight ${muted ? "text-muted-foreground/70" : "text-muted-foreground"}`}>{text}</span>
    </li>
  );
}

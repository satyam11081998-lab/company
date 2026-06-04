"use client";

import React, { useState } from "react";
import Script from "next/script";
import { Check, X, Star, Zap, ShieldCheck, Sparkles, Minus } from "lucide-react";
import { useUser } from "@/components/user-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Required for TS to know about Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

type Cell = boolean | string;

// Single source of the Free/Lite/Pro comparison shown in the table below the cards.
const COMPARISON: { label: string; free: Cell; lite: Cell; pro: Cell }[] = [
  { label: "Full Learn & Casebook library", free: true, lite: true, pro: true },
  { label: "Today's daily case (AI-scored)", free: true, lite: true, pro: true },
  { label: "Today's daily guesstimate (AI-scored)", free: true, lite: true, pro: true },
  { label: "Cross-India leaderboard & badges", free: true, lite: true, pro: true },
  { label: "Extra practice cases from the bank", free: false, lite: "2 / day", pro: "Unlimited" },
  { label: "Extra practice guesstimates", free: false, lite: "2 / day", pro: "Unlimited" },
  { label: "Unlimited re-attempts", free: false, lite: true, pro: true },
  { label: "GD Briefs (daily debate prep)", free: false, lite: true, pro: true },
  { label: "Hints & model Q&A on cases", free: false, lite: "5 / case", pro: "Live AI" },
  { label: "Bookmarks & personal cheat-sheet", free: false, lite: false, pro: true },
  { label: "AI interviewer chatbot", free: false, lite: false, pro: true },
];

export default function UpgradePage() {
  const { user, tier, refresh } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

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
        body: JSON.stringify({ tier: target }),
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
        description: `${target.toUpperCase()} Subscription`,
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

        {/* Pricing Cards — Free / Lite / Pro */}
        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {/* Free */}
          <div className="ui-card flex flex-col h-full animate-slide-up" style={{ animationDelay: "60ms" }}>
            <div className="p-6 border-b border-border flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-bold text-foreground tracking-tight">Free</h2>
                {current === "free" && <CurrentTag />}
              </div>
              <p className="text-xs text-muted-foreground">Build the daily habit at no cost.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-mono text-3xl font-bold tabular-nums text-foreground tracking-tight">₹0</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between gap-8">
              <ul className="space-y-3">
                <FeatureItem text="Today's daily case & guesstimate" />
                <FeatureItem text="Full Learn & Casebook library" />
                <FeatureItem text="Leaderboard & badges" />
                <FeatureItem muted text="No bank practice, re-attempts or GD briefs" cross />
              </ul>
              <button
                disabled
                className="w-full h-10 text-sm font-semibold rounded-md border border-border flex items-center justify-center text-muted-foreground bg-muted/40 cursor-default"
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
                {current === "lite" && <CurrentTag />}
              </div>
              <p className="text-xs text-muted-foreground">Practise beyond the daily pair.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-mono text-3xl font-bold tabular-nums text-foreground tracking-tight">₹199</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between gap-8">
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-foreground/70 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold text-foreground leading-tight">Everything in Free</span>
                </li>
                <FeatureItem text="+2 cases & +2 guesstimates every day" />
                <FeatureItem text="Unlimited re-attempts" />
                <FeatureItem text="GD Briefs unlocked" />
              </ul>
              <button
                onClick={() => handleUpgrade("lite")}
                disabled={loading !== null || current === "lite" || current === "pro"}
                className="w-full h-10 text-sm font-semibold rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
              >
                {current === "lite"
                  ? "Current Plan"
                  : current === "pro"
                  ? "Included in Pro"
                  : loading === "lite"
                  ? "Processing..."
                  : "Get Lite"}
              </button>
            </div>
          </div>

          {/* Pro */}
          <div className="ui-card flex flex-col h-full animate-slide-up relative border-primary" style={{ animationDelay: "180ms" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-primary-hover shadow-sm">
                Recommended
              </span>
            </div>
            <div className="p-6 border-b border-border flex flex-col bg-primary/[0.02]">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-bold text-foreground tracking-tight">Pro</h2>
                {current === "pro" && <CurrentTag />}
              </div>
              <p className="text-xs text-muted-foreground">Unlimited practice and AI prep.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-mono text-3xl font-bold tabular-nums text-foreground tracking-tight">₹499</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between gap-8">
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold text-foreground leading-tight">Everything in Lite</span>
                </li>
                <FeatureItem text="Unlimited cases & guesstimates" />
                <FeatureItem text="Bookmarks & personal cheat-sheet" />
                <FeatureItem text="AI interviewer chatbot" />
              </ul>
              <button
                onClick={() => handleUpgrade("pro")}
                disabled={loading !== null || current === "pro"}
                className="w-full bg-primary text-white hover:bg-primary-hover h-10 text-sm font-semibold rounded-md flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
              >
                {current === "pro" ? "Current Plan" : loading === "pro" ? "Processing..." : "Upgrade to Pro"}
              </button>
            </div>
          </div>
        </div>

        {/* Full comparison */}
        <div className="ui-card overflow-hidden animate-slide-up" style={{ animationDelay: "220ms" }}>
          <div className="p-5 border-b border-border">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Compare plans</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-5 text-xs font-semibold text-muted-foreground">Feature</th>
                  <ColHead label="Free" active={current === "free"} />
                  <ColHead label="Lite" active={current === "lite"} />
                  <ColHead label="Pro" active={current === "pro"} />
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    <td className="py-3 px-5 text-sm text-foreground/90">{row.label}</td>
                    <CellTd v={row.free} active={current === "free"} />
                    <CellTd v={row.lite} active={current === "lite"} />
                    <CellTd v={row.pro} active={current === "pro"} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
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

function ColHead({ label, active }: { label: string; active?: boolean }) {
  return (
    <th className={`py-3 px-4 text-center text-sm font-bold ${active ? "text-primary" : "text-foreground"}`}>
      {label}
      {active && <span className="block text-[9px] font-semibold uppercase tracking-widest text-success">You</span>}
    </th>
  );
}

function CellTd({ v, active }: { v: Cell; active?: boolean }) {
  return (
    <td className={`py-3 px-4 text-center ${active ? "bg-primary/[0.03]" : ""}`}>
      {v === true ? (
        <Check className="h-4 w-4 text-success mx-auto" />
      ) : v === false ? (
        <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
      ) : (
        <span className="text-xs font-semibold text-foreground">{v}</span>
      )}
    </td>
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

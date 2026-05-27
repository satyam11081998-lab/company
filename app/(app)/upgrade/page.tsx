"use client";

import React, { useState } from "react";
import Script from "next/script";
import { Check, Star, Zap, ShieldCheck } from "lucide-react";
import { useUser } from "@/components/user-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Required for TS to know about Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function UpgradePage() {
  const { user, refresh } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (tier: "lite" | "pro", amount: number) => {
    if (!user) {
      toast.error("Please log in to upgrade.");
      router.push("/login");
      return;
    }

    try {
      setLoading(tier);
      // 1. Create order on the backend
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
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
        description: `${tier.toUpperCase()} Subscription`,
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
                tier: tier,
                amount: data.amount,
              }),
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok) {
              toast.success(`Successfully upgraded to ${tier.toUpperCase()}!`);
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
          ondismiss: function() {
            setLoading(null);
            toast.info("Payment cancelled.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
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

  return (
    <div className="min-h-screen bg-muted py-10 px-4">
      {/* Load Razorpay SDK */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <main className="container max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center animate-fade-in mb-8">
          <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-2">
            Pricing Plans
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Level up your preparation.
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mt-3 leading-relaxed">
            Choose the plan that fits your goals. Unlock advanced features, personalized feedback, and AI-driven insights to ace your interviews.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 items-start max-w-4xl mx-auto relative">
          
          {/* Lite Plan */}
          <div className="ui-card flex flex-col h-full animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="p-6 border-b border-border flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <h2 className="text-lg font-bold text-foreground tracking-tight">Lite</h2>
              </div>
              <p className="text-xs text-muted-foreground">Essential tools to kickstart your case prep journey.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-mono text-3xl font-bold tabular-nums text-foreground tracking-tight">
                  ₹199
                </span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between gap-8">
              <ul className="space-y-3">
                <FeatureItem text="Solved examples" />
                <FeatureItem text="Feedback in solved examples or submit your solution to compare" />
                <FeatureItem text="Show hints in practice cases with 5 most probable questions and answers" />
                <FeatureItem text="News brief" />
                <FeatureItem text="Structured learning paths" />
              </ul>
              
              <button 
                onClick={() => handleUpgrade("lite", 199)}
                disabled={loading !== null || user?.subscription_tier === "lite" || user?.subscription_tier === "pro"}
                className="w-full btn-secondary h-10 text-sm font-semibold rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
              >
                {user?.subscription_tier === "lite" 
                  ? "Current Plan" 
                  : user?.subscription_tier === "pro" 
                    ? "Included in Pro" 
                    : loading === "lite" 
                      ? "Processing..." 
                      : "Get Lite"}
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="ui-card flex flex-col h-full animate-slide-up relative border-primary" style={{ animationDelay: "200ms" }}>
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
              <p className="text-xs text-muted-foreground">Advanced AI and features to guarantee your success.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-mono text-3xl font-bold tabular-nums text-foreground tracking-tight">
                  ₹499
                </span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between gap-8">
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold text-foreground leading-tight">All features in Lite</span>
                </li>
                <FeatureItem text="Bookmark data points and create your own cheat sheet" />
                <FeatureItem text="AI Interviewer Chatbot: Unlimited questions with instant solutions" />
                <FeatureItem text="LinkedIn post highlighting daily top scorers" />
              </ul>
              
              <button 
                onClick={() => handleUpgrade("pro", 499)}
                disabled={loading !== null || user?.subscription_tier === "pro"}
                className="w-full bg-primary text-white hover:bg-primary-hover h-10 text-sm font-semibold rounded-md flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
              >
                {user?.subscription_tier === "pro"
                  ? "Current Plan"
                  : loading === "pro" 
                    ? "Processing..." 
                    : "Upgrade to Pro"}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check className="h-4 w-4 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
      <span className="text-sm text-muted-foreground leading-tight">{text}</span>
    </li>
  );
}

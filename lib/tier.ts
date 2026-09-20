import type { SubscriptionTier, UserRow } from '@/lib/types';

/**
 * Tier hierarchy. Higher number = more access.
 * Used for permission checks like `hasTier(user, 'lite')` which is true for lite OR pro.
 */
const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  lite: 1,
  pro: 2,
};

/**
 * Returns true if the user's current effective tier is AT LEAST the required tier.
 * Handles expired subscriptions — if expires_at is past, user falls back to 'free'.
 */
export function hasTier(user: UserRow | null, required: SubscriptionTier): boolean {
  if (!user) return required === 'free';
  const effective = effectiveTier(user);
  return TIER_LEVELS[effective] >= TIER_LEVELS[required];
}

/**
 * Computes the user's actual tier right now (taking expiry into account).
 * Use this anywhere you display tier or check permissions.
 */
export function effectiveTier(user: UserRow | null): SubscriptionTier {
  if (!user) return 'free';
  if (!user.subscription_tier || user.subscription_tier === 'free') return 'free';
  if (!user.subscription_expires_at) return user.subscription_tier;
  const expiresAt = new Date(user.subscription_expires_at);
  if (expiresAt.getTime() < Date.now()) return 'free';
  return user.subscription_tier;
}

/**
 * Per-tier limits. Centralized so we can tune later without touching feature code.
 */
export const TIER_LIMITS = {
  free: {
    maxReattempts: 0,         // free users can attempt each case once
    // Clarification questions asked of the live interviewer, PER ATTEMPT.
    // Mirrors backend routes/attempts.py CLARIFICATION_QUOTA — keep in sync.
    // Was 0 until 2026-08-01: free tier is gated on case ACCESS (daily pair +
    // 1 lifetime extra), not on conversation quality. A 0 here made a free
    // user's first question dead-end with no interviewer reply at all.
    maxHintQuestions: 7,
    maxBookmarks: 0,           // legacy key (cheat-sheet access now via `cheatSheet`)
    learnExamplesPerDomain: 2, // first 2 examples visible
    newsScope: 'all' as const,
    practiceQuestionsPerDay: 3,
    dailyExtraCases: 0,
    dailyExtraGuesstimates: 0,
    // ONE-TIME taste of the bank: 1 extra case + 1 extra guesstimate EVER,
    // on top of the dailies. Mirrors backend services/access_guard.py.
    lifetimeExtraCases: 1,
    lifetimeExtraGuesstimates: 1,
    gdBriefs: false,           // no unlimited generation…
    gdBriefsLifetime: 1,       // …but ONE lifetime brief (view + cheat-sheet + PDF)
    cheatSheet: 'unlocked-brief' as const, // saves only from their 1 free brief
    cvLabTrialUses: 2,         // CV Pointer Lab: 2 lifetime free generations
    // Talk mode. UI gate only — backend routes/speak.py enforces Pro server-side.
    voiceInterview: false,
    // The CASE's own worked figures on the results page and the dashboard —
    // the profit bridge, the 2x2, the driver tree the case actually decomposes
    // into. Pro only.
    //
    // The line is drawn deliberately: YOUR OWN ATTEMPT stays free in full —
    // score, radar, the marks-lost bridge, per-dimension evidence, the three
    // approaches, your transcript. None of that was ever paid and none of it
    // becomes paid.
    //
    // PRECISELY WHAT PRO BUYS: the worked FIGURES. Not "the worked answer to
    // the case" — an earlier version of this comment said that, and it was
    // wrong in a way that matters, because `cases.solution` (the author's
    // prose worked solution) and `feedback_json.model_answer` (how a strong
    // candidate would run it) both render free on the results page for every
    // tier, and always have. Paywalling those would be taking something away;
    // the figures are new, and they are the part that costs extra model
    // tokens to produce. If the product ever does want the prose behind the
    // wall, that is a separate, louder decision than this flag.
    caseFigures: false,
  },
  lite: {
    maxReattempts: Infinity,
    maxHintQuestions: 12,      // interviewer clarifications per attempt
    maxBookmarks: Infinity,    // cheat-sheet is Lite+ since the free-tier rework
    learnExamplesPerDomain: 2,
    newsScope: 'mba-relevant' as const,
    practiceQuestionsPerDay: Infinity,
    dailyExtraCases: 2,
    dailyExtraGuesstimates: 2,
    lifetimeExtraCases: Infinity,
    lifetimeExtraGuesstimates: Infinity,
    gdBriefs: true,
    // Display/descriptive only — the REAL cap is enforced server-side in
    // routes/news.py: Lite gets 2 NEW GD briefs per IST day (re-viewing an
    // already-unlocked brief is free). Pro stays unlimited.
    gdBriefsLifetime: Infinity,
    cheatSheet: 'full' as const,
    cvLabTrialUses: 2,         // CV Pointer Lab is Pro; Lite gets the same 2-try preview
    voiceInterview: false,
    // Lite buys VOLUME (unlimited bank, re-attempts, GD briefs). The worked
    // case figures are a depth feature, and depth is what Pro sells — same
    // split as Prep Copilot and the full CV Lab.
    caseFigures: false,
  },
  pro: {
    maxReattempts: Infinity,
    // Was `Infinity`, which silently contradicted the backend's hard cap of 15
    // — Pro users hit a wall the frontend claimed did not exist. Now a real,
    // honest number matching CLARIFICATION_QUOTA.
    maxHintQuestions: 20,
    maxBookmarks: Infinity,
    learnExamplesPerDomain: 2,
    newsScope: 'mba-relevant' as const,
    practiceQuestionsPerDay: Infinity,
    dailyExtraCases: Infinity,
    dailyExtraGuesstimates: Infinity,
    lifetimeExtraCases: Infinity,
    lifetimeExtraGuesstimates: Infinity,
    gdBriefs: true,
    gdBriefsLifetime: Infinity,
    cheatSheet: 'full' as const,
    cvLabTrialUses: Infinity,
    // Voice interview is OFF product-wide (not ROI positive — see
    // VOICE_INTERVIEW_ENABLED in lib/constants.ts for the numbers). This stays
    // `true` because Pro IS the tier that would own it if it returns; the
    // feature is gated by the constant, not by this flag. Flipping this to
    // false would be misleading: it would say Pro lacks the entitlement, when
    // what is actually true is that nobody has the feature right now.
    voiceInterview: true,
    caseFigures: true,
  },
} as const;

/**
 * May this user see the CASE's worked figures?
 *
 * One helper, used by every call site (results page, dashboard), so the rule
 * lives in exactly one place. Callers MUST apply it on the SERVER and withhold
 * the data itself — not render it and hide it. A client component's props are
 * serialised into the page payload, so anything passed down is readable in
 * devtools whether or not it is painted.
 */
export function canSeeCaseFigures(user: UserRow | null): boolean {
  return TIER_LIMITS[effectiveTier(user)].caseFigures;
}

/**
 * Friendly labels for tier display.
 */
export const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  lite: 'Lite',
  pro: 'Pro',
};

/**
 * Billing periods. Monthly is the established baseline; quarter and annual are
 * prepay options that simply grant a longer access window (see BILLING_PERIOD_DAYS).
 */
export type BillingPeriod = 'monthly' | 'quarter';

// Only monthly and a 3-month prepay are offered (annual was removed).
export const BILLING_PERIODS: BillingPeriod[] = ['monthly', 'quarter'];

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  monthly: 'Monthly',
  quarter: '3 months',
};

/** Short suffix shown next to a price, e.g. "₹999 /yr". */
export const BILLING_PERIOD_SUFFIX: Record<BillingPeriod, string> = {
  monthly: '/mo',
  quarter: '/3 mo',
};

/** Access window granted per period — drives `subscription_expires_at`. */
export const BILLING_PERIOD_DAYS: Record<BillingPeriod, number> = {
  monthly: 30,
  quarter: 91,
};

/**
 * Full price matrix in INR. Two options only: monthly and a 3-month prepay
 * (cheaper per month; maps to a longer expiry window, not a new feature).
 */
export const TIER_PRICING: Record<Exclude<SubscriptionTier, 'free'>, Record<BillingPeriod, number>> = {
  lite: { monthly: 299, quarter: 749 },
  pro: { monthly: 599, quarter: 1499 },
};

/**
 * Monthly tier prices in INR. Kept as the single-source default that existing
 * call sites import; derived from the matrix so there is one source of truth.
 */
export const TIER_PRICES: Record<Exclude<SubscriptionTier, 'free'>, number> = {
  lite: TIER_PRICING.lite.monthly,
  pro: TIER_PRICING.pro.monthly,
};

export function isBillingPeriod(v: unknown): v is BillingPeriod {
  return v === 'monthly' || v === 'quarter';
}

/** Price in INR for a tier + period. Unknown periods fall back to monthly. */
export function priceFor(
  tier: Exclude<SubscriptionTier, 'free'>,
  period: BillingPeriod = 'monthly',
): number {
  return TIER_PRICING[tier][isBillingPeriod(period) ? period : 'monthly'];
}

/** Access window (days) for a billing period. Unknown periods fall back to monthly. */
export function periodDays(period: BillingPeriod = 'monthly'): number {
  return BILLING_PERIOD_DAYS[isBillingPeriod(period) ? period : 'monthly'];
}

/**
 * Discounted price in PAISE for a tier + period + coupon percentage.
 * Single source of truth shared by order creation, verify and the webhook —
 * all three MUST agree to the paisa or legitimate discounted payments fail.
 * Clamped to Razorpay's ₹1 minimum order amount.
 */
export function discountedPaise(
  tier: Exclude<SubscriptionTier, 'free'>,
  period: BillingPeriod,
  discountPct: number,
): number {
  const base = priceFor(tier, period) * 100;
  const pct = Math.min(90, Math.max(0, Math.round(discountPct)));
  return Math.max(100, Math.round((base * (100 - pct)) / 100));
}

/**
 * Commission in PAISE owed to a coupon owner (influencer) for one sale.
 *
 * Computed on the LIST price, NOT on what the buyer actually paid — owner
 * decision 2026-08-06. So a Pro monthly sale on a 10%-off code with a 5%
 * commission pays out 5% of 59900 = 2995 paise, while the buyer paid 53910.
 * Keeping the base at list price means the payout does not shrink when the
 * discount grows, which is what was promised to the creator.
 *
 * Single source of truth: order creation records nothing, but /verify and the
 * webhook both write the ledger and MUST agree to the paisa or a retry would
 * credit a different amount.
 */
export function commissionPaise(
  tier: Exclude<SubscriptionTier, 'free'>,
  period: BillingPeriod,
  commissionPct: number,
): number {
  const base = priceFor(tier, period) * 100;
  const pct = Math.min(50, Math.max(0, Number(commissionPct) || 0));
  return Math.round((base * pct) / 100);
}

/** Whether a coupon's tier_scope covers the tier being purchased. */
export function couponCoversTier(scope: string, tier: 'lite' | 'pro'): boolean {
  return scope === 'any' || scope === tier;
}

/** Effective per-month price (for "≈ ₹X/mo" subtext on prepay options). */
export function perMonthEquivalent(
  tier: Exclude<SubscriptionTier, 'free'>,
  period: BillingPeriod = 'monthly',
): number {
  const months = period === 'quarter' ? 3 : 1;
  return Math.round(priceFor(tier, period) / months);
}
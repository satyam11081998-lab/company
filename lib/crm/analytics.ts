/**
 * Customer analytics — the quantitative core of the CRM course (MK615,
 * Modules II–III). Pure functions only; the server feeds them MECE's real
 * customer facts and the page lets the user change every assumption.
 *
 *   CLV (simple)        m × L, L = 1 / (1 − r)            (undiscounted)
 *   CLV (Gupta–Lehmann) m × r / (1 + d − r)               (infinite horizon,
 *                       margin at period end, constant retention r, rate d)
 *   CLV (finite)        Σ_{t=1..T} m · r^(t−1) / (1 + d)^t (Berger & Nasr)
 *   Customer equity     Σ CLV of current customers + discounted value of
 *                       future cohorts (n_new × (CLV − CAC)) — Rust,
 *                       Zeithaml & Lemon
 *   CAC                 acquisition spend ÷ new paying customers (by channel)
 *   Concentration       top-k% revenue share, Gini, HHI, Lorenz/whale curve
 *   Profitability (ABC) revenue − cost to serve − allocated fixed cost;
 *                       Reinartz & Kumar loyalty × profitability quadrants
 *
 * Every rate here is per MONTH unless the name says otherwise.
 */

export interface ClvInputs {
  /** gross margin per customer per month, ₹ */
  monthlyMargin: number;
  /** monthly retention probability, 0–1 */
  retention: number;
  /** annual discount rate, e.g. 0.12 */
  annualDiscount: number;
  /** horizon for the finite version, months */
  horizonMonths: number;
}

export const monthlyRate = (annual: number) => Math.pow(1 + Math.max(0, annual), 1 / 12) - 1;
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const round = (x: number, p = 2) => { const k = 10 ** p; return Math.round(x * k) / k; };

export function clvSimple(i: Pick<ClvInputs, 'monthlyMargin' | 'retention'>): number {
  const r = clamp(i.retention, 0, 0.999);
  return round(i.monthlyMargin / (1 - r));
}

export function clvGuptaLehmann(i: Omit<ClvInputs, 'horizonMonths'>): number {
  const r = clamp(i.retention, 0, 0.999);
  const d = monthlyRate(i.annualDiscount);
  return round((i.monthlyMargin * r) / (1 + d - r));
}

export function clvFinite(i: ClvInputs): number {
  const r = clamp(i.retention, 0, 0.999);
  const d = monthlyRate(i.annualDiscount);
  let sum = 0;
  for (let t = 1; t <= Math.max(1, Math.min(600, Math.round(i.horizonMonths))); t++) sum += (i.monthlyMargin * Math.pow(r, t - 1)) / Math.pow(1 + d, t);
  return round(sum);
}

/** Expected customer lifetime in months under constant retention. */
export const expectedLifetime = (r: number) => round(1 / (1 - clamp(r, 0, 0.999)), 1);

export interface EquityInputs extends ClvInputs {
  currentCustomers: number;
  /** new paying customers per month */
  newPerMonth: number;
  cac: number;
  /** months of future acquisition to include */
  acquisitionMonths: number;
}

export function customerEquity(i: EquityInputs) {
  const clv = clvFinite(i);
  const d = monthlyRate(i.annualDiscount);
  const current = i.currentCustomers * clv;
  let future = 0;
  for (let t = 1; t <= Math.max(0, Math.round(i.acquisitionMonths)); t++) future += (i.newPerMonth * (clv - i.cac)) / Math.pow(1 + d, t);
  return { clv, current: round(current), future: round(future), total: round(current + future), clvToCac: i.cac > 0 ? round(clv / i.cac, 2) : null, paybackMonths: i.monthlyMargin > 0 ? round(i.cac / i.monthlyMargin, 1) : null };
}

// ---------------------------------------------------------------------------
// Estimating r and m from customer facts
// ---------------------------------------------------------------------------

export interface CustomerFact {
  id: string;
  revenue: number;               // verified lifetime revenue, ₹
  payments: number;              // paid orders
  firstPaid: string | null;
  lastPaid: string | null;
  costToServe: number;           // variable cost, ₹ (AI usage etc.)
  signedUp: string | null;
  lastActive: string | null;
  casesSolved: number;
  channel: string;
  plan: string;
  market: string;
  segment?: string;              // e.g. RFM label
  supportCases?: number;
}

const DAY = 86_400_000;
const ts = (s: string | null) => (s ? new Date(s).getTime() : NaN);

/**
 * Retention from renewal behaviour. Among customers whose first payment is at
 * least `minAgeDays` old, R = share who paid again; L = mean days between
 * their payments. Monthly retention r = R^(30/L). Small samples fall back to
 * `fallback` and say so.
 */
export function estimateRetention(rows: CustomerFact[], now = Date.now(), minAgeDays = 45, fallback = 0.6) {
  const eligible = rows.filter((c) => c.payments > 0 && Number.isFinite(ts(c.firstPaid)) && now - ts(c.firstPaid) >= minAgeDays * DAY);
  const repeaters = eligible.filter((c) => c.payments >= 2);
  const gaps = repeaters.map((c) => (ts(c.lastPaid) - ts(c.firstPaid)) / DAY / (c.payments - 1)).filter((g) => Number.isFinite(g) && g > 0);
  const cycle = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 30;
  if (eligible.length < 10) return { monthly: fallback, repeatRate: null as number | null, cycleDays: round(cycle, 1), sample: eligible.length, estimated: false };
  const R = repeaters.length / eligible.length;
  const monthly = clamp(Math.pow(Math.max(R, 0.01), 30 / Math.max(cycle, 7)), 0.05, 0.98);
  return { monthly: round(monthly, 3), repeatRate: round(R, 3), cycleDays: round(cycle, 1), sample: eligible.length, estimated: true };
}

/** Average monthly revenue and margin per paying customer over their paying life. */
export function estimateMargin(rows: CustomerFact[], cycleDays: number, now = Date.now(), feePct = 0.02) {
  const payers = rows.filter((c) => c.payments > 0 && c.revenue > 0 && Number.isFinite(ts(c.firstPaid)));
  if (!payers.length) return { arpu: 0, marginPerMonth: 0, grossMarginPct: null as number | null, customerMonths: 0 };
  let months = 0;
  let revenue = 0;
  let cost = 0;
  for (const c of payers) {
    const end = Math.min(now, (Number.isFinite(ts(c.lastPaid)) ? ts(c.lastPaid) : ts(c.firstPaid)) + Math.max(cycleDays, 30) * DAY);
    months += Math.max(1, (end - ts(c.firstPaid)) / (30 * DAY));
    revenue += c.revenue;
    cost += c.costToServe;
  }
  const arpu = revenue / months;
  const fees = Math.max(0, feePct) * revenue; // payment gateway
  const gm = revenue > 0 ? (revenue - cost - fees) / revenue : null;
  return { arpu: round(arpu), marginPerMonth: round(arpu * (gm ?? 1)), grossMarginPct: gm === null ? null : round(gm * 100, 1), customerMonths: round(months, 1) };
}

// ---------------------------------------------------------------------------
// Concentration and profitability
// ---------------------------------------------------------------------------

export function concentration(values: number[]) {
  const v = values.filter((x) => Number.isFinite(x) && x > 0).sort((a, b) => b - a);
  const total = v.reduce((a, b) => a + b, 0);
  const n = v.length;
  if (!n || !total) return { customers: n, total: 0, top1: null, top10: null, top20: null, gini: null, hhi: null, lorenz: [] as Array<{ x: number; y: number }> };
  const share = (p: number) => { const k = Math.max(1, Math.ceil(n * p)); return round((v.slice(0, k).reduce((a, b) => a + b, 0) / total) * 100, 1); };
  // Gini on ascending order
  const asc = [...v].reverse();
  let cum = 0;
  let weighted = 0;
  asc.forEach((x, i) => { cum += x; weighted += (i + 1) * x; });
  const gini = (2 * weighted) / (n * cum) - (n + 1) / n;
  const hhi = v.reduce((a, x) => a + Math.pow((x / total) * 100, 2), 0);
  // Lorenz curve: customers from smallest to largest → cumulative share of revenue (on or below the diagonal)
  const lorenz: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
  let run = 0;
  const step = Math.max(1, Math.floor(n / 20));
  asc.forEach((x, i) => { run += x; if ((i + 1) % step === 0 || i === n - 1) lorenz.push({ x: round(((i + 1) / n) * 100, 1), y: round((run / total) * 100, 1) }); });
  return { customers: n, total: round(total), top1: share(0.01), top10: share(0.1), top20: share(0.2), gini: round(gini, 3), hhi: Math.round(hhi), lorenz };
}

export interface ProfitInputs {
  /** fixed platform cost to allocate across active customers, ₹ (period total) */
  fixedCost: number;
  /** cost of handling one support case, ₹ */
  costPerCase: number;
  /** payment fee share of revenue */
  feePct: number;
}

export function customerProfit(c: CustomerFact, allocatedFixed: number, p: ProfitInputs) {
  const variable = c.costToServe + c.revenue * p.feePct + (c.supportCases ?? 0) * p.costPerCase;
  return round(c.revenue - variable - allocatedFixed);
}

/**
 * Whale curve: customers sorted by profit (best first) → cumulative profit as
 * a share of total profit. Peaks above 100% when some customers lose money.
 */
export function whaleCurve(profits: number[]) {
  const v = [...profits].sort((a, b) => b - a);
  const total = v.reduce((a, b) => a + b, 0);
  const n = v.length;
  const pts: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
  if (!n || total === 0) return { points: pts, peak: null as number | null, peakAtPct: null as number | null, unprofitablePct: null as number | null, totalProfit: round(total) };
  let run = 0;
  let peak = -Infinity;
  let peakAt = 0;
  const step = Math.max(1, Math.floor(n / 25));
  v.forEach((x, i) => {
    run += x;
    const y = (run / Math.abs(total)) * 100;
    if (y > peak) { peak = y; peakAt = ((i + 1) / n) * 100; }
    if ((i + 1) % step === 0 || i === n - 1) pts.push({ x: round(((i + 1) / n) * 100, 1), y: round(y, 1) });
  });
  return { points: pts, peak: round(peak, 1), peakAtPct: round(peakAt, 1), unprofitablePct: round((v.filter((x) => x < 0).length / n) * 100, 1), totalProfit: round(total) };
}

export function deciles(values: number[]) {
  const v = [...values].sort((a, b) => b - a);
  const n = v.length;
  const total = v.reduce((a, b) => a + b, 0);
  const out: Array<{ decile: number; customers: number; sum: number; sharePct: number | null }> = [];
  for (let d = 0; d < 10; d++) {
    const part = v.slice(Math.floor((d * n) / 10), Math.floor(((d + 1) * n) / 10));
    const sum = part.reduce((a, b) => a + b, 0);
    out.push({ decile: d + 1, customers: part.length, sum: round(sum), sharePct: total ? round((sum / total) * 100, 1) : null });
  }
  return out;
}

export type Quadrant = 'True friends' | 'Butterflies' | 'Barnacles' | 'Strangers';
export const QUADRANT_ADVICE: Record<Quadrant, string> = {
  'True friends': 'High profit, long-term: reward and protect; ask for referrals.',
  Butterflies: 'High profit, short-term: harvest while they are here; do not over-invest in loyalty.',
  Barnacles: 'Low profit, long-term: right-size the cost to serve; upsell to lift margin.',
  Strangers: 'Low profit, short-term: no relationship investment; serve efficiently.',
};

/** Reinartz & Kumar (2002): loyalty (tenure) × profitability, split at the medians. */
export function quadrants(rows: Array<{ id: string; profit: number; tenureDays: number }>) {
  const med = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : 0; };
  const pMed = med(rows.map((r) => r.profit));
  const tMed = med(rows.map((r) => r.tenureDays));
  const counts: Record<Quadrant, { customers: number; profit: number }> = { 'True friends': { customers: 0, profit: 0 }, Butterflies: { customers: 0, profit: 0 }, Barnacles: { customers: 0, profit: 0 }, Strangers: { customers: 0, profit: 0 } };
  const of = (r: { profit: number; tenureDays: number }): Quadrant => (r.profit > pMed ? (r.tenureDays > tMed ? 'True friends' : 'Butterflies') : (r.tenureDays > tMed ? 'Barnacles' : 'Strangers'));
  for (const r of rows) { const q = of(r); counts[q].customers++; counts[q].profit = round(counts[q].profit + r.profit); }
  return { profitMedian: round(pMed), tenureMedianDays: round(tMed, 1), counts, of };
}

// ---------------------------------------------------------------------------
// Acquisition: CAC by channel
// ---------------------------------------------------------------------------

/** Normalise free-text "how did you hear about us" into a channel. */
export function channelOf(raw: string | null | undefined): string {
  const s = String(raw ?? '').toLowerCase();
  if (!s.trim()) return 'Unknown';
  if (/insta|reel/.test(s)) return 'Instagram';
  if (/linked/.test(s)) return 'LinkedIn';
  if (/you ?tube/.test(s)) return 'YouTube';
  if (/whats ?app|telegram|group/.test(s)) return 'WhatsApp / groups';
  if (/chat ?gpt|perplexity|gemini|claude|\bai\b/.test(s)) return 'AI search (ChatGPT etc.)';
  if (/google|search|seo/.test(s)) return 'Google search';
  if (/friend|referr|senior|batch|word of mouth|classmate/.test(s)) return 'Referral';
  if (/college|campus|placement|club|committee|professor|faculty/.test(s)) return 'Campus / college';
  if (/coupon|influenc|creator/.test(s)) return 'Influencer coupon';
  if (/email|newsletter/.test(s)) return 'Email campaign';
  if (/ad\b|ads|sponsor/.test(s)) return 'Paid ads';
  return 'Other';
}

export interface SpendItem { channel: string; amount: number; at: string | null; source: string }

export function cacByChannel(customers: Array<{ channel: string; firstPaid: string | null }>, spend: SpendItem[], from: number, to: number) {
  const inRange = (s: string | null) => { const t = ts(s); return Number.isFinite(t) && t >= from && t < to; };
  const channels = new Set<string>([...customers.map((c) => c.channel), ...spend.map((s) => s.channel)]);
  const rows = [...channels].map((ch) => {
    const n = customers.filter((c) => c.channel === ch && inRange(c.firstPaid)).length;
    const amt = spend.filter((s) => s.channel === ch && (s.at === null || inRange(s.at))).reduce((a, s) => a + s.amount, 0);
    return { channel: ch, newCustomers: n, spend: round(amt), cac: n ? round(amt / n) : null };
  }).filter((r) => r.newCustomers || r.spend).sort((a, b) => b.newCustomers - a.newCustomers || b.spend - a.spend);
  const totalSpend = rows.reduce((a, r) => a + r.spend, 0);
  const totalNew = rows.reduce((a, r) => a + r.newCustomers, 0);
  return { rows, totalSpend: round(totalSpend), totalNew, blendedCac: totalNew ? round(totalSpend / totalNew) : null };
}

// ---------------------------------------------------------------------------
// Lifecycle funnel and cohorts
// ---------------------------------------------------------------------------

export function lifecycleFunnel(rows: Array<{ onboarded: boolean; activated: boolean; paying: boolean; repeat: boolean; activeNow: boolean }>) {
  const n = rows.length;
  const steps = [
    { stage: 'Signed up', count: n },
    { stage: 'Onboarded', count: rows.filter((r) => r.onboarded).length },
    { stage: 'Activated (solved a case)', count: rows.filter((r) => r.activated).length },
    { stage: 'Paying', count: rows.filter((r) => r.paying).length },
    { stage: 'Repeat purchase', count: rows.filter((r) => r.repeat).length },
  ];
  return {
    steps: steps.map((s, i) => ({ ...s, ofTop: n ? round((s.count / n) * 100, 1) : null, ofPrev: i && steps[i - 1].count ? round((s.count / steps[i - 1].count) * 100, 1) : null })),
    activeNow: rows.filter((r) => r.activeNow).length,
  };
}

export interface CohortCell { cohort: string; monthIndex: number; size: number; active: number; paying: number }
export function cohortTable(cells: CohortCell[]) {
  const cohorts = [...new Set(cells.map((c) => c.cohort))].sort();
  const maxK = Math.max(0, ...cells.map((c) => c.monthIndex));
  return cohorts.map((co) => {
    const mine = cells.filter((c) => c.cohort === co);
    const size = mine[0]?.size ?? 0;
    return {
      cohort: co, size,
      active: Array.from({ length: maxK + 1 }, (_, k) => { const c = mine.find((x) => x.monthIndex === k); return c && size ? round((c.active / size) * 100, 1) : null; }),
      paying: Array.from({ length: maxK + 1 }, (_, k) => { const c = mine.find((x) => x.monthIndex === k); return c && size ? round((c.paying / size) * 100, 1) : null; }),
    };
  });
}

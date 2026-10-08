/**
 * Iris — the CRM's AI assistant — built to be explainable and overridable (MK615 S18:
 * "AI competence = knowing when AI is wrong"). Pure functions only.
 *
 *  - Prediction builder: L2-regularised logistic regression trained here, on
 *    MECE's own records, with a deterministic train/holdout split. Every
 *    prediction carries its top positive and negative factors. A model whose
 *    holdout AUC is below 0.6, or with too few examples of either class, is
 *    reported as not reliable and is not used.
 *  - Health score, deal health: transparent weighted rules (no training), each
 *    component shown.
 *  - Anomalies: same-weekday seasonal baseline with a robust (MAD) z-score.
 *  - Best time to contact: hour-of-day histogram of the person's own opens and
 *    clicks (IST), with a confidence that says how much evidence there is.
 *  - Next best action: rule-based, and every customer-facing suggestion passes
 *    a consent gate (opt-out, withdrawn consent, privacy restriction).
 */

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------

export type FeatureSpec =
  | { kind: 'number'; field: string; log?: boolean }
  | { kind: 'boolean'; field: string }
  | { kind: 'category'; field: string; values: string[] }
  | { kind: 'days_since'; field: string }
  | { kind: 'present'; field: string };

export interface FeatureInfo { name: string; label: string; spec: FeatureSpec; value?: string }

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

export function expandFeatures(specs: FeatureSpec[], labels: Record<string, string> = {}): FeatureInfo[] {
  const out: FeatureInfo[] = [];
  for (const s of specs) {
    const l = labels[s.field] ?? s.field;
    if (s.kind === 'category') for (const v of s.values.slice(0, 12)) out.push({ name: `${s.field}=${v}`, label: `${l} is ${v}`, spec: s, value: v });
    else out.push({ name: s.kind === 'days_since' ? `${s.field}:days` : s.kind === 'present' ? `${s.field}:set` : s.field, label: s.kind === 'days_since' ? `days since ${l}` : s.kind === 'present' ? `${l} filled in` : l, spec: s });
  }
  return out;
}

export function featureVector(feats: FeatureInfo[], data: Record<string, unknown>, now = Date.now()): number[] {
  return feats.map((f) => {
    const v = data[f.spec.field];
    switch (f.spec.kind) {
      case 'number': { const n = num(v) ?? 0; return f.spec.log ? Math.log1p(Math.max(0, n)) : n; }
      case 'boolean': return v === true ? 1 : 0;
      case 'category': return String(v ?? '') === f.value ? 1 : 0;
      case 'present': return v === null || v === undefined || v === '' ? 0 : 1;
      case 'days_since': { const t = typeof v === 'string' ? new Date(v).getTime() : NaN; return Number.isFinite(t) ? Math.min(3650, Math.max(0, (now - t) / 86_400_000)) : 3650; }
    }
    return 0;
  });
}

// ---------------------------------------------------------------------------
// Logistic regression
// ---------------------------------------------------------------------------

export interface LogitModel {
  features: FeatureInfo[];
  mean: number[];
  std: number[];
  weights: number[];
  bias: number;
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-Math.max(-35, Math.min(35, z))));

export function trainLogistic(X: number[][], y: number[], features: FeatureInfo[], opts: { l2?: number; epochs?: number; lr?: number } = {}): LogitModel {
  const n = X.length;
  const k = features.length;
  const mean = Array(k).fill(0);
  const std = Array(k).fill(0);
  for (const row of X) row.forEach((v, j) => (mean[j] += v / n));
  for (const row of X) row.forEach((v, j) => (std[j] += (v - mean[j]) ** 2 / n));
  for (let j = 0; j < k; j++) std[j] = Math.sqrt(std[j]) || 1;
  const Z = X.map((row) => row.map((v, j) => (v - mean[j]) / std[j]));
  const w = Array(k).fill(0);
  let b = 0;
  const l2 = opts.l2 ?? 0.05;
  const lr = opts.lr ?? 0.2;
  // class weights keep a rare class from being ignored
  const pos = y.filter((t) => t === 1).length;
  const wPos = pos ? n / (2 * pos) : 1;
  const wNeg = n - pos ? n / (2 * (n - pos)) : 1;
  for (let e = 0; e < (opts.epochs ?? 400); e++) {
    const gw = Array(k).fill(0);
    let gb = 0;
    for (let i = 0; i < n; i++) {
      const p = sigmoid(Z[i].reduce((a, v, j) => a + v * w[j], b));
      const err = (p - y[i]) * (y[i] === 1 ? wPos : wNeg);
      for (let j = 0; j < k; j++) gw[j] += (err * Z[i][j]) / n;
      gb += err / n;
    }
    for (let j = 0; j < k; j++) w[j] -= lr * (gw[j] + l2 * w[j]);
    b -= lr * gb;
  }
  return { features, mean, std, weights: w.map((x) => Math.round(x * 1e4) / 1e4), bias: Math.round(b * 1e4) / 1e4 };
}

export function predictProba(m: LogitModel, x: number[]): number {
  return sigmoid(x.reduce((a, v, j) => a + ((v - m.mean[j]) / m.std[j]) * m.weights[j], m.bias));
}

/** Contribution of each feature to this prediction (log-odds), best first. */
export function explain(m: LogitModel, x: number[], top = 4) {
  const contrib = x.map((v, j) => ({ label: m.features[j].label, effect: ((v - m.mean[j]) / m.std[j]) * m.weights[j] }));
  const meaningful = contrib.filter((c) => Math.abs(c.effect) >= 0.05);
  const pos = meaningful.filter((c) => c.effect > 0).sort((a, b) => b.effect - a.effect).slice(0, top);
  const neg = meaningful.filter((c) => c.effect < 0).sort((a, b) => a.effect - b.effect).slice(0, top);
  const r = (c: { label: string; effect: number }) => ({ label: c.label, effect: Math.round(c.effect * 100) / 100 });
  return { positive: pos.map(r), negative: neg.map(r) };
}

/** Area under the ROC curve (Mann–Whitney), ties counted half. */
export function auc(scores: number[], y: number[]): number | null {
  const pos = scores.filter((_, i) => y[i] === 1);
  const neg = scores.filter((_, i) => y[i] === 0);
  if (!pos.length || !neg.length) return null;
  let wins = 0;
  for (const p of pos) for (const q of neg) wins += p > q ? 1 : p === q ? 0.5 : 0;
  return Math.round((wins / (pos.length * neg.length)) * 1000) / 1000;
}

export function classification(scores: number[], y: number[], threshold = 0.5) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  scores.forEach((s, i) => { const p = s >= threshold ? 1 : 0; if (p && y[i]) tp++; else if (p) fp++; else if (y[i]) fn++; else tn++; });
  const n = scores.length || 1;
  return { accuracy: Math.round(((tp + tn) / n) * 1000) / 10, precision: tp + fp ? Math.round((tp / (tp + fp)) * 1000) / 10 : null, recall: tp + fn ? Math.round((tp / (tp + fn)) * 1000) / 10 : null, tp, fp, tn, fn };
}

/** Deterministic split by id (stable across retrains). */
export function isHoldout(id: string, pct = 0.3): boolean {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 1000) / 1000 < pct;
}

export const MIN_PER_CLASS = 30;

export interface TrainReport {
  ok: boolean;
  reason?: string;
  model?: LogitModel;
  metrics: { examples: number; positives: number; negatives: number; trainSize: number; testSize: number; auc: number | null; accuracy: number | null; precision: number | null; recall: number | null; baseRate: number | null; reliable: boolean };
  importance?: Array<{ label: string; weight: number }>;
}

export function trainAndEvaluate(rows: Array<{ id: string; data: Record<string, unknown> }>, label: (d: Record<string, unknown>) => 0 | 1 | null, features: FeatureInfo[], now = Date.now()): TrainReport {
  const labelled = rows.map((r) => ({ id: r.id, y: label(r.data), x: featureVector(features, r.data, now) })).filter((r) => r.y !== null) as Array<{ id: string; y: 0 | 1; x: number[] }>;
  const positives = labelled.filter((r) => r.y === 1).length;
  const negatives = labelled.length - positives;
  const base = { examples: labelled.length, positives, negatives, trainSize: 0, testSize: 0, auc: null, accuracy: null, precision: null, recall: null, baseRate: labelled.length ? Math.round((positives / labelled.length) * 1000) / 10 : null, reliable: false };
  if (positives < MIN_PER_CLASS || negatives < MIN_PER_CLASS) {
    return { ok: false, reason: `Not enough history: needs at least ${MIN_PER_CLASS} examples of each outcome (have ${positives} yes / ${negatives} no).`, metrics: base };
  }
  const train = labelled.filter((r) => !isHoldout(r.id));
  const test = labelled.filter((r) => isHoldout(r.id));
  const model = trainLogistic(train.map((r) => r.x), train.map((r) => r.y), features);
  const scores = test.map((r) => predictProba(model, r.x));
  const a = auc(scores, test.map((r) => r.y));
  const c = classification(scores, test.map((r) => r.y));
  const reliable = a !== null && a >= 0.6 && test.length >= 20;
  const importance = model.features.map((f, j) => ({ label: f.label, weight: model.weights[j] })).sort((p, q) => Math.abs(q.weight) - Math.abs(p.weight)).slice(0, 12);
  return {
    ok: true, model, importance,
    reason: reliable ? undefined : `Holdout AUC ${a ?? '—'} on ${test.length} records — not reliable enough to act on.`,
    metrics: { ...base, trainSize: train.length, testSize: test.length, auc: a, accuracy: c.accuracy, precision: c.precision, recall: c.recall, reliable },
  };
}

// ---------------------------------------------------------------------------
// Rule-based scores (no training), every component visible
// ---------------------------------------------------------------------------

export interface Factor { label: string; points: number; max: number; note: string }
const daysSince = (s: unknown, now: number) => { const t = typeof s === 'string' ? new Date(s).getTime() : NaN; return Number.isFinite(t) ? (now - t) / 86_400_000 : null; };

export function healthScore(d: Record<string, unknown>, now = Date.now()) {
  const f: Factor[] = [];
  const active = num(d.mece_active_days_30) ?? 0;
  f.push({ label: 'Engagement', max: 30, points: Math.round(Math.min(1, active / 12) * 30), note: `${active} active day(s) in the last 30` });
  const since = daysSince(d.mece_last_active_at, now);
  const rec = since === null ? 0 : since <= 3 ? 1 : since >= 60 ? 0 : 1 - (since - 3) / 57;
  f.push({ label: 'Recency', max: 25, points: Math.round(rec * 25), note: since === null ? 'never active' : `last active ${Math.round(since)} day(s) ago` });
  const tier = String(d.mece_tier ?? 'free');
  const paid = (num(d.mece_payments_count) ?? 0) > 0;
  f.push({ label: 'Value', max: 20, points: tier !== 'free' ? 20 : paid ? 10 : 0, note: tier !== 'free' ? `on the ${tier} plan` : paid ? 'paid before, not on a plan now' : 'never paid' });
  const avg = num(d.mece_avg_score);
  f.push({ label: 'Progress', max: 15, points: avg === null ? 0 : Math.round(Math.min(1, avg / 80) * 15), note: avg === null ? 'no scored case yet' : `average score ${avg}` });
  const nps = num(d.nps_last);
  const csat = num(d.csat_last);
  const sent = nps !== null ? (nps >= 9 ? 1 : nps >= 7 ? 0.6 : 0.1) : csat !== null ? (csat >= 4 ? 1 : csat === 3 ? 0.5 : 0.1) : 0.6;
  f.push({ label: 'Sentiment', max: 10, points: Math.round(sent * 10), note: nps !== null ? `last NPS ${nps}` : csat !== null ? `last CSAT ${csat}` : 'no survey answer (neutral)' });
  const score = f.reduce((a, x) => a + x.points, 0);
  return { score, band: score >= 76 ? 'Excellent' : score >= 51 ? 'Good' : 'Needs attention', factors: f };
}

export function dealHealth(d: Record<string, unknown>, ctx: { daysInStage: number | null; medianDaysInStage: number | null; lastActivityAt: string | null; medianAmount: number | null; open: boolean }, now = Date.now()) {
  if (!ctx.open) return null;
  const f: Factor[] = [];
  const p = num(d.probability) ?? 0;
  f.push({ label: 'Stage probability', max: 30, points: Math.round(Math.min(1, p / 100) * 30), note: `${p}% at this stage` });
  if (ctx.daysInStage !== null && ctx.medianDaysInStage) {
    const ratio = ctx.daysInStage / Math.max(1, ctx.medianDaysInStage);
    f.push({ label: 'Stage velocity', max: 25, points: Math.round((ratio <= 1 ? 1 : ratio >= 3 ? 0 : 1 - (ratio - 1) / 2) * 25), note: `${Math.round(ctx.daysInStage)} day(s) in stage vs ${Math.round(ctx.medianDaysInStage)} typical` });
  } else f.push({ label: 'Stage velocity', max: 25, points: 15, note: 'not enough stage history (neutral)' });
  const since = daysSince(ctx.lastActivityAt, now);
  f.push({ label: 'Activity', max: 25, points: since === null ? 0 : Math.round((since <= 7 ? 1 : since >= 45 ? 0 : 1 - (since - 7) / 38) * 25), note: since === null ? 'no activity logged' : `last activity ${Math.round(since)} day(s) ago` });
  const close = typeof d.closing_date === 'string' ? new Date(`${d.closing_date}T23:59:59+05:30`).getTime() : NaN;
  const overdue = Number.isFinite(close) && close < now;
  f.push({ label: 'Closing date', max: 20, points: !Number.isFinite(close) ? 8 : overdue ? 0 : 20, note: !Number.isFinite(close) ? 'no closing date' : overdue ? 'closing date has passed' : 'closing date ahead' });
  const score = f.reduce((a, x) => a + x.points, 0);
  return { score, band: score >= 76 ? 'Healthy' : score >= 51 ? 'Watch' : 'At risk', factors: f };
}

// ---------------------------------------------------------------------------
// Anomaly detection
// ---------------------------------------------------------------------------

export interface Anomaly { metric: string; day: string; value: number; expected: number; z: number; direction: 'up' | 'down'; good: boolean | null }

export function detectAnomalies(metric: string, series: Array<{ day: string; value: number }>, opts: { increaseIsGood?: boolean | null; minAbs?: number; z?: number; lookbackDays?: number } = {}): Anomaly[] {
  const out: Anomaly[] = [];
  const zMin = opts.z ?? 3;
  const look = opts.lookbackDays ?? 7;
  for (let i = Math.max(28, series.length - look); i < series.length; i++) {
    const hist = [7, 14, 21, 28].map((k) => series[i - k]?.value).filter((v): v is number => typeof v === 'number');
    if (hist.length < 4) continue;
    const s = [...hist].sort((a, b) => a - b);
    const median = (s[1] + s[2]) / 2;
    const mad = [...hist.map((v) => Math.abs(v - median))].sort((a, b) => a - b);
    const madv = (mad[1] + mad[2]) / 2;
    const scale = 1.4826 * madv + Math.max(1, median * 0.1);
    const x = series[i].value;
    const z = (x - median) / scale;
    if (Math.abs(z) >= zMin && Math.abs(x - median) >= (opts.minAbs ?? 3)) {
      const dir = z > 0 ? 'up' : 'down';
      out.push({ metric, day: series[i].day, value: x, expected: Math.round(median * 10) / 10, z: Math.round(z * 10) / 10, direction: dir, good: opts.increaseIsGood === null || opts.increaseIsGood === undefined ? null : (dir === 'up') === opts.increaseIsGood });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Best time to contact
// ---------------------------------------------------------------------------

export function bestTime(eventTimes: string[]) {
  const hours = Array(24).fill(0);
  for (const t of eventTimes) {
    const d = new Date(t);
    if (!Number.isFinite(d.getTime())) continue;
    hours[new Date(d.getTime() + 330 * 60_000).getUTCHours()]++;
  }
  const n = hours.reduce((a, b) => a + b, 0);
  if (!n) return null;
  let best = 0;
  const w = (h: number) => hours[h] + hours[(h + 1) % 24];
  // the busiest 2-hour window; on a tie, the one that starts in the busier hour
  for (let h = 0; h < 24; h++) if (w(h) > w(best) || (w(h) === w(best) && hours[h] > hours[best])) best = h;
  const fmt = (h: number) => `${((h + 11) % 12) + 1} ${h < 12 ? 'am' : 'pm'}`;
  return { window: `${fmt(best)}–${fmt((best + 2) % 24)} IST`, startHour: best, evidence: n, confidence: n >= 8 ? 'high' : n >= 3 ? 'medium' : 'low', hours };
}

// ---------------------------------------------------------------------------
// Next best action (consent-gated)
// ---------------------------------------------------------------------------

export interface Nba { key: string; title: string; why: string; priority: number; channel: 'email' | 'call' | 'task' | 'internal'; customerFacing: boolean; allowed: boolean; blockedBy?: string; template?: string }

export function nextBestActions(d: Record<string, unknown>, ctx: { health: number | null; churnRisk: number | null; openCases: number; consent: { marketing: boolean; profiling: boolean; restricted: boolean } }, now = Date.now()): Nba[] {
  const out: Omit<Nba, 'allowed' | 'blockedBy'>[] = [];
  const tier = String(d.mece_tier ?? 'free');
  const solved = num(d.mece_cases_solved) ?? 0;
  const paidCount = num(d.mece_payments_count) ?? 0;
  const signed = daysSince(d.mece_signed_up_at, now);
  const lastActive = daysSince(d.mece_last_active_at, now);
  const expires = typeof d.mece_tier_expires_at === 'string' ? (new Date(d.mece_tier_expires_at).getTime() - now) / 86_400_000 : null;
  const nps = num(d.nps_last);
  if (ctx.openCases > 0) out.push({ key: 'resolve_case', title: 'Resolve the open support case first', why: `${ctx.openCases} open case(s): selling before fixing hurts trust.`, priority: 100, channel: 'internal', customerFacing: false });
  if (nps !== null && nps <= 6) out.push({ key: 'detractor_call', title: 'Personal call to understand the low score', why: `Last NPS was ${nps} (detractor).`, priority: 95, channel: 'call', customerFacing: true });
  if (expires !== null && expires >= 0 && expires <= 14 && tier !== 'free') out.push({ key: 'renewal', title: 'Renewal reminder', why: `The ${tier} plan ends in ${Math.ceil(expires)} day(s).`, priority: 90, channel: 'email', customerFacing: true, template: 'Renewal reminder' });
  if (ctx.churnRisk !== null && ctx.churnRisk >= 60 && (paidCount > 0 || solved >= 3)) out.push({ key: 'win_back', title: 'Win-back: ask what stopped them', why: `Churn risk ${ctx.churnRisk}%${lastActive !== null ? `, inactive ${Math.round(lastActive)} days` : ''}.`, priority: 80, channel: 'email', customerFacing: true, template: 'Win-back — inactive 45 days' });
  if (signed !== null && signed <= 7 && solved === 0) out.push({ key: 'onboard', title: 'Onboarding nudge: first case', why: `Signed up ${Math.round(signed)} day(s) ago and has not solved a case.`, priority: 70, channel: 'email', customerFacing: true, template: 'Welcome nudge — first case' });
  if (tier === 'free' && solved >= 5 && (ctx.health ?? 0) >= 51) out.push({ key: 'upgrade', title: 'Offer the Pro plan', why: `${solved} cases solved on the free plan with good engagement — the habit is there.`, priority: 60, channel: 'email', customerFacing: true });
  if (nps !== null && nps >= 9) out.push({ key: 'referral', title: 'Ask for a referral or review', why: `Promoter (NPS ${nps}).`, priority: 50, channel: 'email', customerFacing: true });
  if (!out.length) out.push({ key: 'none', title: 'No action needed now', why: 'Nothing in the data calls for outreach.', priority: 0, channel: 'internal', customerFacing: false });
  return out.sort((a, b) => b.priority - a.priority).map((a) => {
    // consent gate: AI-suggested customer contact needs marketing consent and an unrestricted record;
    // service-type contact (case follow-up, detractor call) is allowed without marketing consent
    if (!a.customerFacing) return { ...a, allowed: true };
    if (ctx.consent.restricted) return { ...a, allowed: false, blockedBy: 'processing restricted (privacy request)' };
    if (a.key === 'detractor_call') return { ...a, allowed: true };
    if (!ctx.consent.marketing) return { ...a, allowed: false, blockedBy: 'no marketing consent / opted out' };
    return { ...a, allowed: true };
  });
}

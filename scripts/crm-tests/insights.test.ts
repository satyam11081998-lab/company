import { test, eq, ok, throws, near } from './harness';
import { STANDARD_FIELDS } from '../../lib/crm/modules';
import {
  cacByChannel, channelOf, clvFinite, clvGuptaLehmann, clvSimple, cohortTable, concentration, customerEquity, customerProfit, deciles,
  estimateMargin, estimateRetention, expectedLifetime, lifecycleFunnel, monthlyRate, quadrants, whaleCurve, type CustomerFact,
} from '../../lib/crm/analytics';
import {
  MIN_PER_CLASS, auc, bestTime, dealHealth, detectAnomalies, expandFeatures, explain, featureVector, healthScore, isHoldout, nextBestActions,
  predictProba, trainAndEvaluate,
} from '../../lib/crm/ml';
import { cleanDashboard, cleanReport, groupKey, reportFields, runSummary } from '../../lib/crm/reports';
import { parseQuestion } from '../../lib/crm/nlq';
import { breachClock, consentState, dueAt, erasurePatch } from '../../lib/crm/privacy';

const F = (m: string) => STANDARD_FIELDS.filter((f) => f.module === m) as never;
const DAY = 86_400_000;
const NOW = Date.UTC(2026, 9, 8, 6, 0, 0);
const iso = (daysAgo: number) => new Date(NOW - daysAgo * DAY).toISOString();

// ---------------------------------------------------------------------------
// CLV and customer equity (hand-checked numbers)
// ---------------------------------------------------------------------------
test('CLV: simple, Gupta–Lehmann and finite agree with the formulas', () => {
  eq(clvSimple({ monthlyMargin: 100, retention: 0.8 }), 500); // 100 / 0.2
  eq(expectedLifetime(0.8), 5);
  // d = 0 → Gupta–Lehmann = m r / (1 − r) = 100 × 0.8 / 0.2 = 400 (= simple minus the first period)
  eq(clvGuptaLehmann({ monthlyMargin: 100, retention: 0.8, annualDiscount: 0 }), 400);
  const d = monthlyRate(0.12);
  near(d, Math.pow(1.12, 1 / 12) - 1, 1e-12);
  near(clvGuptaLehmann({ monthlyMargin: 100, retention: 0.8, annualDiscount: 0.12 }), (100 * 0.8) / (1 + d - 0.8), 0.01);
  // finite, r = 1 would be an annuity; at horizon 1 it is m / (1 + d)
  near(clvFinite({ monthlyMargin: 100, retention: 0.8, annualDiscount: 0.12, horizonMonths: 1 }), 100 / (1 + d), 0.01);
  // the finite sum approaches m/(1+d) × 1/(1 − r/(1+d)) as T grows
  near(clvFinite({ monthlyMargin: 100, retention: 0.8, annualDiscount: 0.12, horizonMonths: 600 }), (100 / (1 + d)) / (1 - 0.8 / (1 + d)), 0.05);
  // discounting can only reduce value
  ok(clvFinite({ monthlyMargin: 100, retention: 0.8, annualDiscount: 0.12, horizonMonths: 24 }) < clvSimple({ monthlyMargin: 100, retention: 0.8 }));
  // retention is clamped: r = 1 never divides by zero
  ok(Number.isFinite(clvSimple({ monthlyMargin: 100, retention: 1 })));
  ok(Number.isFinite(clvGuptaLehmann({ monthlyMargin: 100, retention: 5, annualDiscount: 0 })));
});

test('customer equity: current + discounted future cohorts, CLV:CAC and payback', () => {
  const e = customerEquity({ monthlyMargin: 100, retention: 0.8, annualDiscount: 0, horizonMonths: 12, currentCustomers: 10, newPerMonth: 2, cac: 150, acquisitionMonths: 3 });
  const clv = clvFinite({ monthlyMargin: 100, retention: 0.8, annualDiscount: 0, horizonMonths: 12 });
  eq(e.clv, clv);
  near(e.current, 10 * clv, 0.01);
  near(e.future, 3 * 2 * (clv - 150), 0.05);
  eq(e.paybackMonths, 1.5);
  near(e.clvToCac!, clv / 150, 0.01);
  eq(customerEquity({ monthlyMargin: 0, retention: 0.5, annualDiscount: 0.1, horizonMonths: 12, currentCustomers: 1, newPerMonth: 0, cac: 0, acquisitionMonths: 0 }).clvToCac, null);
});

const fact = (id: string, o: Partial<CustomerFact>): CustomerFact => ({ id, revenue: 0, payments: 0, firstPaid: null, lastPaid: null, costToServe: 0, signedUp: iso(400), lastActive: null, casesSolved: 0, channel: 'Other', plan: 'free', market: 'IN', ...o });

test('retention estimate: small samples fall back and say so; repeat rate → monthly', () => {
  const few = [fact('a', { payments: 1, firstPaid: iso(100), lastPaid: iso(100), revenue: 99 })];
  const r1 = estimateRetention(few, NOW);
  eq(r1.estimated, false);
  eq(r1.monthly, 0.6);
  // 20 eligible payers, 10 repeat every 30 days → R = 0.5, cycle 30 → r = 0.5
  const rows = Array.from({ length: 20 }, (_, i) => i < 10
    ? fact(`p${i}`, { payments: 3, firstPaid: iso(90), lastPaid: iso(30), revenue: 297 })
    : fact(`p${i}`, { payments: 1, firstPaid: iso(90), lastPaid: iso(90), revenue: 99 }));
  const r2 = estimateRetention(rows, NOW);
  eq(r2.estimated, true);
  eq(r2.repeatRate, 0.5);
  eq(r2.cycleDays, 30);
  eq(r2.monthly, 0.5);
  // too-new payers are not counted (no chance to renew yet)
  eq(estimateRetention([...rows, fact('new', { payments: 1, firstPaid: iso(3), lastPaid: iso(3), revenue: 99 })], NOW).sample, 20);
});

test('margin estimate uses the configured payment fee', () => {
  const rows = [fact('a', { payments: 1, firstPaid: iso(60), lastPaid: iso(60), revenue: 1000, costToServe: 100 })];
  const m2 = estimateMargin(rows, 30, NOW, 0.02);
  const m5 = estimateMargin(rows, 30, NOW, 0.05);
  eq(m2.grossMarginPct, 88); // (1000 − 100 − 20) / 1000
  eq(m5.grossMarginPct, 85);
  eq(estimateMargin([], 30, NOW).marginPerMonth, 0);
});

test('concentration: top shares, Gini, HHI and a Lorenz curve below the diagonal', () => {
  const eqd = concentration([100, 100, 100, 100]);
  eq(eqd.gini, 0);
  eq(eqd.hhi, 2500);
  eq(eqd.top20, 25);
  const skew = concentration([1000, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  ok(skew.gini! > 0.8, `gini ${skew.gini}`);
  ok(skew.top10! > 99);
  for (const p of skew.lorenz) ok(p.y <= p.x + 1e-9, `Lorenz point above diagonal ${JSON.stringify(p)}`);
  eq(skew.lorenz[skew.lorenz.length - 1], { x: 100, y: 100 });
  eq(concentration([]).gini, null);
  eq(concentration([0, -5]).customers, 0); // non-positive revenue ignored
});

test('profitability: activity-based profit, whale curve, deciles, quadrants', () => {
  const c = fact('a', { revenue: 1000, costToServe: 100, supportCases: 2 });
  eq(customerProfit(c, 50, { fixedCost: 0, costPerCase: 150, feePct: 0.02 }), 1000 - (100 + 20 + 300) - 50);
  const w = whaleCurve([500, 300, 200, -100, -100]);
  eq(w.totalProfit, 800);
  eq(w.peak, 125); // 1000 / 800
  eq(w.peakAtPct, 60);
  eq(w.unprofitablePct, 40);
  const dec = deciles(Array.from({ length: 20 }, (_, i) => i + 1));
  eq(dec.length, 10);
  eq(dec[0].customers, 2);
  eq(dec[0].sum, 39); // 20 + 19
  const q = quadrants([{ id: 'a', profit: 100, tenureDays: 400 }, { id: 'b', profit: 100, tenureDays: 10 }, { id: 'c', profit: -5, tenureDays: 400 }, { id: 'd', profit: -5, tenureDays: 10 }]);
  eq(q.counts['True friends'].customers, 1); eq(q.counts.Butterflies.customers, 1); eq(q.counts.Barnacles.customers, 1); eq(q.counts.Strangers.customers, 1);
  eq(q.counts['True friends'].profit, 100);
});

test('CAC by channel and channel mapping', () => {
  eq(channelOf('Saw a reel on Instagram'), 'Instagram');
  eq(channelOf('my senior told me'), 'Referral');
  eq(channelOf('ChatGPT'), 'AI search (ChatGPT etc.)');
  eq(channelOf(''), 'Unknown');
  const from = NOW - 90 * DAY;
  const res = cacByChannel(
    [{ channel: 'Instagram', firstPaid: iso(10) }, { channel: 'Instagram', firstPaid: iso(20) }, { channel: 'Referral', firstPaid: iso(5) }, { channel: 'Instagram', firstPaid: iso(200) }],
    [{ channel: 'Instagram', amount: 1000, at: iso(30), source: 'x' }, { channel: 'Paid ads', amount: 500, at: iso(30), source: 'y' }, { channel: 'Instagram', amount: 9999, at: iso(300), source: 'old' }],
    from, NOW + 1,
  );
  const ig = res.rows.find((r) => r.channel === 'Instagram')!;
  eq(ig.newCustomers, 2);
  eq(ig.cac, 500);
  eq(res.rows.find((r) => r.channel === 'Paid ads')!.cac, null); // spend, no payers
  eq(res.rows.find((r) => r.channel === 'Referral')!.cac, 0);
  eq(res.totalSpend, 1500);
  eq(res.blendedCac, 500);
});

test('lifecycle funnel and cohort table', () => {
  const f = lifecycleFunnel([
    { onboarded: true, activated: true, paying: true, repeat: false, activeNow: true },
    { onboarded: true, activated: false, paying: false, repeat: false, activeNow: false },
    { onboarded: false, activated: false, paying: false, repeat: false, activeNow: false },
    { onboarded: true, activated: true, paying: false, repeat: false, activeNow: true },
  ]);
  eq(f.steps.map((s) => s.count), [4, 3, 2, 1, 0]);
  eq(f.steps[2].ofPrev, 66.7);
  eq(f.activeNow, 2);
  const c = cohortTable([{ cohort: '2026-08', monthIndex: 0, size: 10, active: 8, paying: 1 }, { cohort: '2026-08', monthIndex: 1, size: 10, active: 4, paying: 2 }, { cohort: '2026-09', monthIndex: 0, size: 5, active: 5, paying: 0 }]);
  eq(c[0].active, [80, 40]);
  eq(c[0].paying, [10, 20]);
  eq(c[1].active, [100, null]);
});

// ---------------------------------------------------------------------------
// Iris (ML)
// ---------------------------------------------------------------------------
test('ML: features, logistic training, holdout AUC, explanations', () => {
  const feats = expandFeatures([{ kind: 'number', field: 'x' }, { kind: 'category', field: 'c', values: ['a', 'b'] }, { kind: 'present', field: 'p' }, { kind: 'days_since', field: 'd' }], { x: 'X' });
  eq(feats.map((f) => f.name), ['x', 'c=a', 'c=b', 'p:set', 'd:days']);
  eq(featureVector(feats, { x: '3', c: 'b', p: '', d: iso(10) }, NOW), [3, 0, 1, 0, 10]);
  // separable data: y = 1 when x > 5
  const rows = Array.from({ length: 400 }, (_, i) => ({ id: `r-${i}`, data: { x: (i * 7) % 11, c: i % 2 ? 'a' : 'b' } }));
  const label = (d: Record<string, unknown>) => (Number(d.x) > 5 ? 1 : 0) as 0 | 1;
  const rep = trainAndEvaluate(rows, label, expandFeatures([{ kind: 'number', field: 'x' }, { kind: 'category', field: 'c', values: ['a', 'b'] }]), NOW);
  ok(rep.ok && rep.model, 'trained');
  ok(rep.metrics.reliable && (rep.metrics.auc ?? 0) > 0.95, `auc ${rep.metrics.auc}`);
  ok(rep.metrics.testSize > 60 && rep.metrics.trainSize > 200);
  ok(predictProba(rep.model!, [10, 1, 0]) > 0.9);
  ok(predictProba(rep.model!, [0, 1, 0]) < 0.1);
  const ex = explain(rep.model!, [10, 1, 0]);
  eq(ex.positive[0].label, 'x');
  eq(rep.importance![0].label, 'x');
  // noise: not reliable
  const noise = trainAndEvaluate(rows, (d) => (String(d.c) === 'a' ? (Number(d.x) % 2) as 0 | 1 : ((Number(d.x) + 1) % 2) as 0 | 1), expandFeatures([{ kind: 'present', field: 'zzz' }]), NOW);
  ok(!noise.metrics.reliable, 'noise must not be reliable');
  // too few examples of one class: refuses to train
  const few = trainAndEvaluate(rows.slice(0, 50), () => 1, feats, NOW);
  eq(few.ok, false);
  ok(/at least 30/.test(few.reason ?? ''));
  eq(MIN_PER_CLASS, 30);
  // the split is deterministic and roughly 30%
  eq(isHoldout('abc'), isHoldout('abc'));
  const share = Array.from({ length: 2000 }, (_, i) => isHoldout(`id-${i}`)).filter(Boolean).length / 2000;
  ok(share > 0.25 && share < 0.35, `holdout share ${share}`);
  eq(auc([0.9, 0.8, 0.1, 0.2], [1, 1, 0, 0]), 1);
  eq(auc([0.1, 0.2, 0.9, 0.8], [1, 1, 0, 0]), 0);
  eq(auc([0.5, 0.5], [1, 0]), 0.5);
  eq(auc([0.5], [1]), null);
});

test('health score and deal health are bounded and explain themselves', () => {
  const top = healthScore({ mece_active_days_30: 30, mece_last_active_at: iso(0), mece_tier: 'pro', mece_avg_score: 90, nps_last: 10 }, NOW);
  eq(top.score, 100);
  eq(top.band, 'Excellent');
  const bottom = healthScore({}, NOW);
  ok(bottom.score >= 0 && bottom.score <= 10, `bottom ${bottom.score}`); // only neutral sentiment
  eq(bottom.factors.length, 5);
  eq(dealHealth({}, { daysInStage: 1, medianDaysInStage: 5, lastActivityAt: null, medianAmount: null, open: false }, NOW), null);
  const dh = dealHealth({ probability: 100, closing_date: '2027-01-01' }, { daysInStage: 1, medianDaysInStage: 5, lastActivityAt: iso(1), medianAmount: null, open: true }, NOW)!;
  eq(dh.score, 100);
  const late = dealHealth({ probability: 20, closing_date: '2026-01-01' }, { daysInStage: 30, medianDaysInStage: 5, lastActivityAt: null, medianAmount: null, open: true }, NOW)!;
  eq(late.band, 'At risk');
});

test('anomalies: a spike against the same weekday is found; noise is not', () => {
  const series = Array.from({ length: 35 }, (_, i) => ({ day: `d${i}`, value: 10 + (i % 3) }));
  eq(detectAnomalies('Sign-ups', series, { increaseIsGood: true }).length, 0);
  series[34] = { day: 'd34', value: 60 };
  const a = detectAnomalies('Sign-ups', series, { increaseIsGood: true });
  eq(a.length, 1);
  eq(a[0].direction, 'up');
  eq(a[0].good, true);
  series[34] = { day: 'd34', value: 0 };
  const b = detectAnomalies('Problem reports', series, { increaseIsGood: false, minAbs: 3 });
  eq(b[0]?.direction, 'down');
  eq(b[0]?.good, true); // fewer problem reports is good
});

test('best time to contact uses IST and needs evidence', () => {
  eq(bestTime([]), null);
  const t = bestTime(['2026-10-01T13:30:00Z', '2026-10-02T13:45:00Z', '2026-10-03T14:10:00Z']); // 19:00–19:40 IST
  eq(t!.startHour, 19);
  eq(t!.confidence, 'medium');
});

test('next best action: consent gate, restriction, ordering', () => {
  const d = { mece_tier: 'pro', mece_tier_expires_at: new Date(Date.now() + 5 * DAY).toISOString(), nps_last: 4, mece_payments_count: 2 };
  const all = nextBestActions(d, { health: 40, churnRisk: 80, openCases: 1, consent: { marketing: false, profiling: true, restricted: false } });
  eq(all[0].key, 'resolve_case');
  eq(all[0].allowed, true);
  const renewal = all.find((a) => a.key === 'renewal')!;
  eq(renewal.allowed, false);
  ok(/marketing consent/.test(renewal.blockedBy ?? ''));
  eq(all.find((a) => a.key === 'detractor_call')!.allowed, true); // service contact, not marketing
  const restricted = nextBestActions(d, { health: 40, churnRisk: 80, openCases: 0, consent: { marketing: true, profiling: true, restricted: true } });
  ok(restricted.filter((a) => a.customerFacing).every((a) => !a.allowed));
  const ok2 = nextBestActions(d, { health: 40, churnRisk: 80, openCases: 0, consent: { marketing: true, profiling: true, restricted: false } });
  ok(ok2.every((a) => a.allowed));
  eq(nextBestActions({}, { health: null, churnRisk: null, openCases: 0, consent: { marketing: true, profiling: true, restricted: false } })[0].key, 'none');
});

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------
test('reports: validation, grouping, matrix and totals', () => {
  throws(() => cleanReport({ module: 'deals', type: 'summary', measures: [{ fn: 'count' }] }, F('deals')), /group/);
  throws(() => cleanReport({ module: 'deals', type: 'summary', groupBy: { field: 'stage' }, measures: [{ fn: 'sum', field: 'deal_name' }] }, F('deals')), /not a number/);
  throws(() => cleanReport({ module: 'deals', type: 'matrix', groupBy: { field: 'stage' } }, F('deals')), /second grouping/);
  const unknown = cleanReport({ module: 'deals', type: 'tabular', columns: ['deal_name', 'nope', 'amount'] }, F('deals'));
  eq(unknown.columns, ['deal_name', 'amount']);
  const c = cleanReport({ module: 'deals', type: 'matrix', groupBy: { field: 'stage' }, groupBy2: { field: 'closing_date' }, measures: [{ fn: 'sum', field: 'amount' }, { fn: 'count' }] }, F('deals'));
  eq(c.groupBy2!.bucket, 'month'); // date grouping gets a bucket
  eq(reportFields(c).sort(), ['amount', 'closing_date', 'stage']);
  const rows = [
    { data: { stage: 'closed_won', amount: 100, closing_date: '2026-09-30' } },
    { data: { stage: 'closed_won', amount: 50, closing_date: '2026-10-01' } },
    { data: { stage: 'checkout_started', amount: 'x', closing_date: '2026-10-02' } },
  ];
  const s = runSummary(rows, c);
  const won = s.groups.find((g) => g.key === 'closed_won')!;
  eq(won.values, [150, 2]);
  eq(s.groups.find((g) => g.key === 'checkout_started')!.values, [null, 1]); // non-numbers ignored, not zero
  eq(s.totals, [150, 3]);
  eq(s.matrix!.cols, ['2026-09', '2026-10']);
  eq(s.matrix!.cells.closed_won['2026-09'], 100);
  // IST bucketing: 2026-09-30T20:00Z is already 1 Oct in India
  eq(groupKey({ data: { t: '2026-09-30T20:00:00Z' } }, { field: 't', bucket: 'month' }), '2026-10');
  eq(groupKey({ data: {} }, { field: 't' }), '(none)');
});

test('dashboards: components validated', () => {
  const fieldsOf = (m: string) => F(m);
  const has = (m: string) => ['deals', 'leads'].includes(m);
  throws(() => cleanDashboard({ components: [{ type: 'kpi', title: 'x', module: 'nope' }] }, fieldsOf, has, new Set()), /module/);
  throws(() => cleanDashboard({ components: [{ type: 'kpi', title: 'x', module: 'deals', measure: { fn: 'sum', field: 'deal_name' } }] }, fieldsOf, has, new Set()), /number field/);
  throws(() => cleanDashboard({ components: [{ type: 'chart', title: 'c', reportId: 'r2' }] }, fieldsOf, has, new Set(['r1'])), /report/);
  const d = cleanDashboard({ components: [{ id: '<script>', type: 'target', title: 'T', module: 'deals', measure: { fn: 'sum', field: 'amount' }, target: -5, compareDays: 13 }] }, fieldsOf, has, new Set());
  eq(d.components[0].id, 'c1'); // unsafe id replaced
  eq(d.components[0].target, 0);
  eq(d.components[0].compareDays, undefined);
});

// ---------------------------------------------------------------------------
// Ask Iris (natural-language questions)
// ---------------------------------------------------------------------------
test('Ask Iris: questions become constrained queries', () => {
  const q1 = parseQuestion('How many leads were created this month?');
  ok(!('error' in q1));
  if ('error' in q1) return;
  eq([q1.module, q1.fn], ['leads', 'count']);
  eq(q1.criteria!.conditions, [{ field: 'created_at', op: 'this_month' }]);
  eq(q1.explanation, 'I read this as: number of leads (created this month).');
  const q2 = parseQuestion('Total revenue from deals won last month');
  if ('error' in q2) throw new Error(q2.error);
  eq([q2.module, q2.fn, q2.field], ['deals', 'sum', 'amount']);
  ok(q2.criteria!.conditions.some((c) => 'field' in c && c.field === 'stage' && c.value === 'closed_won'));
  ok(q2.criteria!.conditions.some((c) => 'field' in c && c.field === 'closing_date' && c.op === 'last_month'));
  const q3 = parseQuestion('Open cases by priority');
  if ('error' in q3) throw new Error(q3.error);
  eq([q3.module, q3.groupBy], ['cases', 'priority']);
  const q4 = parseQuestion('top 5 owners by deals won this quarter');
  if ('error' in q4) throw new Error(q4.error);
  eq([q4.groupBy, q4.limit], ['owner_id', 5]);
  const q5 = parseQuestion('average score of students on pro');
  if ('error' in q5) throw new Error(q5.error);
  eq([q5.module, q5.fn, q5.field], ['contacts', 'avg', 'mece_avg_score']);
  ok(q5.criteria!.conditions.some((c) => 'field' in c && c.field === 'mece_internal')); // internal accounts excluded
  const q6 = parseQuestion('total cases solved by students');
  if ('error' in q6) throw new Error(q6.error);
  eq([q6.module, q6.field], ['contacts', 'mece_cases_solved']);
  ok('error' in parseQuestion('what is the weather'));
  ok('error' in parseQuestion(''));
  const q7 = parseQuestion('leads in the last 999 weeks');
  if ('error' in q7) throw new Error(q7.error);
  eq((q7.criteria!.conditions[0] as { value: number }).value, 3650); // capped
  // nothing in a question becomes raw SQL or an arbitrary field
  const evil = parseQuestion("leads where 1=1; drop table crm_records; by owner");
  if ('error' in evil) return;
  for (const c of evil.criteria?.conditions ?? []) ok(!JSON.stringify(c).includes('drop'));
});

// ---------------------------------------------------------------------------
// Privacy (DPDP)
// ---------------------------------------------------------------------------
test('privacy: erasure keeps financial facts, blanks personal data', () => {
  const deal = { deal_name: 'Pro — Rahul Sharma', amount: 999, currency: 'INR', stage: 'closed_won', pipeline: 'B2C subscriptions', payment_ref: 'pay_123', description: 'call him at 98xxxx', closing_date: '2026-09-01', extra_note: 'free text' };
  const p = erasurePatch(F('deals'), deal, ['deal_name']);
  eq(p.deal_name, '[erased]');
  eq(p.description, null);
  eq(p.extra_note, null); // unknown free-text keys go too
  ok(!('amount' in p) && !('currency' in p) && !('stage' in p) && !('payment_ref' in p) && !('closing_date' in p) && !('pipeline' in p));
  const contact = { full_name: 'Rahul Sharma', email: 'r@x.com', phone: '+91 98', mece_revenue_inr: 999, lifecycle_stage: 'Paying', linkedin_url: 'https://linkedin.com/in/r' };
  const c = erasurePatch(F('contacts'), contact, ['full_name']);
  eq([c.full_name, c.email, c.phone, c.linkedin_url], ['[erased]', null, null, null]);
  ok(!('mece_revenue_inr' in c) && !('lifecycle_stage' in c));
});

test('privacy: consent state, due dates, breach clock', () => {
  const s = consentState([
    { purpose: 'marketing', status: 'given', created_at: '2026-01-01T00:00:00Z' },
    { purpose: 'marketing', status: 'withdrawn', created_at: '2026-02-01T00:00:00Z' },
    { purpose: 'ai_profiling', status: 'given', created_at: '2026-01-05T00:00:00Z' },
    { purpose: 'bogus', status: 'given', created_at: '2026-01-05T00:00:00Z' },
  ]);
  eq(s, { marketing: 'withdrawn', service: 'none', analytics: 'none', ai_profiling: 'given' });
  // order of rows doesn't matter: newest wins
  eq(consentState([{ purpose: 'marketing', status: 'withdrawn', created_at: '2026-02-01T00:00:00Z' }, { purpose: 'marketing', status: 'given', created_at: '2026-01-01T00:00:00Z' }]).marketing, 'withdrawn');
  eq(dueAt('access', new Date('2026-01-01T00:00:00Z')), '2026-01-31T00:00:00.000Z');
  eq(dueAt('withdraw_consent', new Date('2026-01-01T00:00:00Z')), '2026-01-08T00:00:00.000Z');
  const det = '2026-10-01T00:00:00Z';
  const open = breachClock(det, null, Date.parse('2026-10-02T00:00:00Z'));
  eq([open.hoursLeft, open.late], [48, false]);
  eq(breachClock(det, null, Date.parse('2026-10-05T00:00:00Z')).late, true);
  eq(breachClock(det, '2026-10-03T23:00:00Z').late, false);
  eq(breachClock(det, '2026-10-04T01:00:00Z').late, true);
});

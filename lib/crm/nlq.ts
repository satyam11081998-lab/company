/**
 * "Ask Iris" — natural-language questions → a constrained query ("one
 * module, one aggregate per question"). Pure and deterministic.
 * The output is only ever a module + aggregate + criteria + optional grouping,
 * run through the normal permission-checked query path. Nothing in a
 * question can become SQL, a field the user can't see, or a write.
 */
import type { Condition, Criteria } from './types';

export interface ParsedQuery {
  module: string;
  fn: 'count' | 'sum' | 'avg' | 'min' | 'max';
  field?: string;
  criteria: Criteria | null;
  groupBy?: string;
  bucket?: 'month' | 'week' | 'day';
  limit?: number;
  explanation: string;
}

const MODULES: Array<{ api: string; words: RegExp; label: string; dateField: string; money?: string }> = [
  { api: 'leads', words: /\bleads?\b|prospects?|enquir(y|ies)|inquir(y|ies)/, label: 'leads', dateField: 'created_at' },
  { api: 'deals', words: /\bdeals?\b|orders?|sales?\b|opportunit(y|ies)|checkouts?|purchases?/, label: 'deals', dateField: 'closing_date', money: 'amount' },
  { api: 'cases', words: /\bcases?\b|tickets?|complaints?|support requests?|issues?/, label: 'cases', dateField: 'created_at' },
  { api: 'campaigns', words: /campaigns?/, label: 'campaigns', dateField: 'start_date', money: 'actual_cost' },
  { api: 'tasks', words: /\btasks?\b|to-?dos?/, label: 'tasks', dateField: 'due_date' },
  { api: 'calls', words: /\bcalls?\b/, label: 'calls', dateField: 'call_start_time' },
  { api: 'meetings', words: /meetings?/, label: 'meetings', dateField: 'start_at' },
  { api: 'invoices', words: /invoices?|bills?/, label: 'invoices', dateField: 'invoice_date', money: 'grand_total' },
  { api: 'quotes', words: /quotes?|quotations?/, label: 'quotes', dateField: 'created_at', money: 'grand_total' },
  { api: 'accounts', words: /accounts?|colleges?|b-?schools?|companies|institutes?/, label: 'accounts', dateField: 'created_at' },
  { api: 'contacts', words: /contacts?|customers?|users?|students?|people|members?|signups?|sign-ups?/, label: 'contacts', dateField: 'mece_signed_up_at', money: 'mece_revenue_inr' },
];

const GROUPS: Array<{ words: RegExp; field: string | ((m: string) => string); label: string; bucket?: 'month' | 'week' | 'day' }> = [
  { words: /by (owner|rep|salesperson|person)/, field: 'owner_id', label: 'owner' },
  { words: /by stage/, field: (m) => (m === 'leads' ? 'lead_status' : m === 'quotes' ? 'quote_stage' : 'stage'), label: 'stage' },
  { words: /by status/, field: (m) => (m === 'leads' ? 'lead_status' : m === 'calls' ? 'call_status' : 'status'), label: 'status' },
  { words: /by (lead )?source|by channel/, field: (m) => (m === 'contacts' ? 'mece_referral_source' : 'lead_source'), label: 'source' },
  { words: /by priority/, field: 'priority', label: 'priority' },
  { words: /by (plan|tier)/, field: 'mece_tier', label: 'plan' },
  { words: /by market|by country/, field: 'market', label: 'market' },
  { words: /by city/, field: 'city', label: 'city' },
  { words: /by pipeline/, field: 'pipeline', label: 'pipeline' },
  { words: /by rating/, field: 'rating', label: 'rating' },
  { words: /by (rfm|segment)/, field: 'rfm_segment', label: 'RFM segment' },
  { words: /by origin/, field: 'case_origin', label: 'origin' },
  { words: /by type/, field: 'type', label: 'type' },
  { words: /(per|by|each) month|monthly/, field: '__date', label: 'month', bucket: 'month' },
  { words: /(per|by|each) week|weekly/, field: '__date', label: 'week', bucket: 'week' },
  { words: /(per|by|each) day|daily/, field: '__date', label: 'day', bucket: 'day' },
];

function timeWindow(q: string, dateField: string): { cond: Condition; label: string } | null {
  const c = (op: Condition['op'], value?: unknown, label = ''): { cond: Condition; label: string } => ({ cond: { field: dateField, op, value }, label });
  if (/\btoday\b/.test(q)) return c('today', undefined, 'today');
  if (/this week/.test(q)) return c('this_week', undefined, 'this week');
  if (/last month|previous month/.test(q)) return c('last_month', undefined, 'last month');
  if (/this month|current month|mtd/.test(q)) return c('this_month', undefined, 'this month');
  if (/this quarter|current quarter|qtd/.test(q)) return c('this_quarter', undefined, 'this quarter');
  if (/this year|ytd|current year/.test(q)) return c('this_year', undefined, 'this year');
  const m = q.match(/(?:last|past|previous)\s+(\d{1,3})\s+(day|week|month)s?/);
  if (m) { const n = Number(m[1]) * (m[2] === 'week' ? 7 : m[2] === 'month' ? 30 : 1); return c('in_last_days', Math.min(n, 3650), `in the last ${m[1]} ${m[2]}${m[1] === '1' ? '' : 's'}`); }
  if (/last week|past week/.test(q)) return c('in_last_days', 7, 'in the last 7 days');
  if (/yesterday/.test(q)) return c('in_last_days', 1, 'since yesterday');
  return null;
}

export function parseQuestion(raw: string): ParsedQuery | { error: string; suggestions: string[] } {
  const q = String(raw ?? '').toLowerCase().replace(/[?!.,]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
  const suggestions = ['How many leads were created this month?', 'Total revenue from deals won last month', 'Open cases by priority', 'Average deal amount by pipeline', 'Top 5 owners by deals won this quarter', 'Contacts by plan'];
  if (!q) return { error: 'Ask a question.', suggestions };
  // "cases solved" is a fact about people, not support cases
  const mod = /cases solved|solved cases/.test(q) ? MODULES.find((m) => m.api === 'contacts') : MODULES.find((m) => m.words.test(q));
  if (!mod) return { error: 'I couldn’t tell which records you mean (leads, deals, contacts, cases …).', suggestions };
  const conds: Condition[] = [];
  const said: string[] = [];
  let module = mod.api;
  // filters
  if (module === 'deals' && /\bwon\b|closed won|revenue|sales made|converted/.test(q)) { conds.push({ field: 'stage', op: 'eq', value: 'closed_won' }); said.push('won'); }
  else if (module === 'deals' && /\blost\b/.test(q)) { conds.push({ field: 'stage', op: 'eq', value: 'closed_lost' }); said.push('lost'); }
  if (module === 'cases' && /\bopen\b|unresolved|pending/.test(q)) { conds.push({ field: 'status', op: 'not_in', value: ['Resolved', 'Closed'] }); said.push('open'); }
  if (module === 'cases' && /escalated|breach/.test(q)) { conds.push({ field: 'escalated', op: 'eq', value: true }); said.push('escalated'); }
  if (module === 'leads' && /\bhot\b/.test(q)) { conds.push({ field: 'rating', op: 'eq', value: 'Hot' }); said.push('hot'); }
  if (module === 'leads' && /converted/.test(q)) { conds.push({ field: 'lead_status', op: 'eq', value: 'Converted' }); said.push('converted'); }
  if (module === 'tasks' && /overdue/.test(q)) { conds.push({ field: 'due_date', op: 'before', value: new Date().toISOString().slice(0, 10) }, { field: 'status', op: 'neq', value: 'Completed' }); said.push('overdue'); }
  if (module === 'contacts' && /paying|paid|customers?/.test(q) && !/users?|students?|signups?/.test(q)) { conds.push({ field: 'mece_payments_count', op: 'gt', value: 0 }); said.push('paying'); }
  if (module === 'contacts' && /\bpro\b/.test(q)) { conds.push({ field: 'mece_tier', op: 'eq', value: 'pro' }); said.push('on Pro'); }
  if (module === 'contacts' && /\blite\b/.test(q)) { conds.push({ field: 'mece_tier', op: 'eq', value: 'lite' }); said.push('on Lite'); }
  if (module === 'contacts' && /inactive|churn|lapsed|dormant/.test(q)) { conds.push({ field: 'mece_last_active_at', op: 'older_than_days', value: 30 }); said.push('inactive 30+ days'); }
  if (module === 'contacts' && !/internal/.test(q)) conds.push({ field: 'mece_internal', op: 'neq', value: true });
  const src = q.match(/from (instagram|linkedin|youtube|whatsapp|google|referral|campus event|web form|email campaign|partner college)/);
  if (src) { conds.push({ field: module === 'contacts' ? 'mece_referral_source' : 'lead_source', op: 'contains', value: src[1] }); said.push(`from ${src[1]}`); }
  // aggregate
  let fn: ParsedQuery['fn'] = 'count';
  let field: string | undefined;
  if (/average|avg|mean/.test(q)) fn = 'avg';
  else if (/total|sum of|revenue|how much|value of/.test(q)) fn = 'sum';
  else if (/highest|max(imum)?|largest|biggest/.test(q)) fn = 'max';
  else if (/lowest|min(imum)?|smallest/.test(q)) fn = 'min';
  if (fn !== 'count') {
    if (/score/.test(q) && module === 'contacts') field = 'mece_avg_score';
    else if (/cases solved/.test(q) && module === 'contacts') field = 'mece_cases_solved';
    else if (/students|batch size/.test(q) && module === 'leads') field = 'no_of_students';
    else field = mod.money;
    if (!field) { fn = 'count'; }
  }
  const dateField = module === 'deals' && !said.includes('won') && !said.includes('lost') ? 'created_at' : mod.dateField;
  const tw = timeWindow(q, dateField);
  if (tw) conds.push(tw.cond);
  // grouping
  let groupBy: string | undefined;
  let bucket: ParsedQuery['bucket'];
  let groupLabel = '';
  for (const g of GROUPS) {
    if (!g.words.test(q)) continue;
    groupBy = g.field === '__date' ? dateField : typeof g.field === 'function' ? g.field(module) : g.field;
    bucket = g.bucket;
    groupLabel = g.label;
    break;
  }
  const top = q.match(/top (\d{1,2})/);
  if (top && !groupBy) { groupBy = 'owner_id'; groupLabel = 'owner'; }
  const limit = top ? Math.min(20, Number(top[1])) : undefined;
  const which = `${said.length ? said.join(', ') + ' ' : ''}${mod.label}${tw ? ` (${dateField.replace(/^mece_/, '').replace(/_at$|_date$/, '').replace(/_/g, ' ')} ${tw.label})` : ''}`;
  const what = fn === 'count' ? `number of ${which}` : `${fn === 'avg' ? 'average' : fn === 'sum' ? 'total' : fn === 'max' ? 'highest' : 'lowest'} ${field?.replace(/^mece_/, '').replace(/_/g, ' ')} of ${which}`;
  return {
    module, fn, field, criteria: conds.length ? { match: 'all', conditions: conds } : null, groupBy, bucket, limit,
    explanation: `I read this as: ${what}${groupBy ? `, grouped by ${groupLabel}` : ''}${limit ? ` (top ${limit})` : ''}.`,
  };
}

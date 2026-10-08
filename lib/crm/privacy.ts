/**
 * DPDP Act 2023 helpers — pure.
 *  - Purposes and consent states (s.6: consent must be free, specific,
 *    informed, unambiguous; withdrawal as easy as giving it).
 *  - Erasure plan: which fields of a record are personal data and get
 *    blanked; what is kept (amounts, dates, picklists) for accounts and tax
 *    records (s.8(7): erase unless retention is required by law).
 *  - Deadlines for rights requests and breach notices.
 */
import type { FieldDef } from './types';

export const PURPOSES = ['marketing', 'service', 'analytics', 'ai_profiling'] as const;
export type Purpose = (typeof PURPOSES)[number];
export const PURPOSE_LABEL: Record<Purpose, string> = {
  marketing: 'Marketing emails and offers',
  service: 'Service and support messages',
  analytics: 'Usage analytics',
  ai_profiling: 'AI scoring and recommendations',
};

export const REQUEST_KINDS = ['access', 'correction', 'erasure', 'grievance', 'nomination', 'withdraw_consent', 'restrict'] as const;
export type RequestKind = (typeof REQUEST_KINDS)[number];
export const REQUEST_LABEL: Record<RequestKind, string> = {
  access: 'Access — summary of personal data held (s.11)',
  correction: 'Correction / completion / updating (s.12)',
  erasure: 'Erasure (s.12)',
  grievance: 'Grievance redressal (s.13)',
  nomination: 'Nominate someone to act on their behalf (s.14)',
  withdraw_consent: 'Withdraw consent (s.6(4))',
  restrict: 'Stop processing while a request is handled',
};

/** Days to respond; configurable in settings, defaults follow common practice under the Act's draft rules. */
export const DEFAULT_DUE_DAYS: Record<RequestKind, number> = { access: 30, correction: 30, erasure: 30, grievance: 30, nomination: 30, withdraw_consent: 7, restrict: 7 };

/** Breach notice to the Data Protection Board: detailed report within 72 hours (draft rules). */
export const BREACH_REPORT_HOURS = 72;

const PERSONAL_TYPES = new Set(['text', 'textarea', 'email', 'phone', 'url']);
/** Text fields that are not personal data (kept on erasure). */
const KEEP_TEXT = new Set(['pipeline', 'stage', 'forecast_category', 'payment_ref', 'invoice_number', 'quote_number', 'so_number', 'po_number', 'case_number', 'solution_number', 'rfm_segment', 'mece_revenue_intl']);

/** Data patch that erases personal data from a record of this module. */
export function erasurePatch(fields: FieldDef[], data: Record<string, unknown>, nameFields: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (!(f.api_name in data)) continue;
    if (KEEP_TEXT.has(f.api_name)) continue;
    if (PERSONAL_TYPES.has(f.type)) out[f.api_name] = nameFields.includes(f.api_name) ? '[erased]' : null;
    if (f.type === 'json') out[f.api_name] = null;
  }
  // free-form keys not in metadata (e.g. sync extras) are dropped too
  for (const k of Object.keys(data)) if (!fields.some((f) => f.api_name === k) && typeof data[k] === 'string') out[k] = null;
  return out;
}

export function dueAt(kind: RequestKind, from = new Date(), days?: number): string {
  return new Date(from.getTime() + (days ?? DEFAULT_DUE_DAYS[kind]) * 86_400_000).toISOString();
}

export function breachClock(detectedAt: string, boardNotifiedAt: string | null, now = Date.now()) {
  const deadline = new Date(detectedAt).getTime() + BREACH_REPORT_HOURS * 3_600_000;
  const done = boardNotifiedAt ? new Date(boardNotifiedAt).getTime() : null;
  return { deadline: new Date(deadline).toISOString(), hoursLeft: done ? null : Math.round((deadline - now) / 3_600_000), late: done ? done > deadline : now > deadline };
}

/** Latest status per purpose from a consent ledger (newest wins). */
export function consentState(rows: Array<{ purpose: string; status: string; created_at: string }>): Record<Purpose, 'given' | 'withdrawn' | 'pending' | 'none'> {
  const out = Object.fromEntries(PURPOSES.map((p) => [p, 'none'])) as Record<Purpose, 'given' | 'withdrawn' | 'pending' | 'none'>;
  const sorted = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
  for (const r of sorted) if ((PURPOSES as readonly string[]).includes(r.purpose) && ['given', 'withdrawn', 'pending'].includes(r.status)) out[r.purpose as Purpose] = r.status as 'given';
  return out;
}

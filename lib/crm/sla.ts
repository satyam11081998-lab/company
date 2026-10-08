/**
 * Service levels: due time for a case given its priority and business hours.
 * Pure. Times are computed in a fixed offset (IST by default; India has no DST).
 */

export interface BusinessHours {
  /** 0 = Sunday … 6 = Saturday */
  days: number[];
  start: string; // 'HH:MM' local
  end: string; // 'HH:MM' local
  tzOffsetMin: number;
  holidays?: string[]; // 'YYYY-MM-DD' local
  twentyFourSeven?: boolean;
}

export interface SlaPolicy {
  /** hours to resolve, per priority (working hours unless 24x7) */
  resolveHours: Record<string, number>;
  firstResponseHours: Record<string, number>;
  hours: BusinessHours;
}

export const DEFAULT_SLA: SlaPolicy = {
  resolveHours: { Urgent: 8, High: 24, Medium: 48, Low: 96 },
  firstResponseHours: { Urgent: 1, High: 4, Medium: 8, Low: 24 },
  hours: { days: [1, 2, 3, 4, 5, 6], start: '10:00', end: '19:00', tzOffsetMin: 330 },
};

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map((x) => Number(x));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
};

/** Add `hours` of working time to `from`. */
export function addBusinessHours(from: Date, hours: number, bh: BusinessHours): Date {
  if (!(hours > 0)) return new Date(from);
  if (bh.twentyFourSeven) return new Date(from.getTime() + hours * 3_600_000);
  const startMin = toMin(bh.start);
  const endMin = toMin(bh.end);
  if (endMin <= startMin || !bh.days.length) return new Date(from.getTime() + hours * 3_600_000);
  let remaining = Math.round(hours * 60);
  // walk in local time (shifted epoch), minute-precise, day by day
  let t = from.getTime() + bh.tzOffsetMin * 60_000;
  for (let guard = 0; guard < 3660 && remaining > 0; guard++) {
    const d = new Date(t);
    const dayStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const ymd = new Date(dayStart).toISOString().slice(0, 10);
    const working = bh.days.includes(d.getUTCDay()) && !(bh.holidays ?? []).includes(ymd);
    const open = dayStart + startMin * 60_000;
    const close = dayStart + endMin * 60_000;
    if (working && t < close) {
      const begin = Math.max(t, open);
      const avail = Math.floor((close - begin) / 60_000);
      if (remaining <= avail) {
        t = begin + remaining * 60_000;
        remaining = 0;
        break;
      }
      remaining -= avail;
    }
    t = dayStart + 86_400_000; // next local midnight
  }
  return new Date(t - bh.tzOffsetMin * 60_000);
}

export function slaDue(createdAt: Date, priority: string | null | undefined, policy: SlaPolicy = DEFAULT_SLA): Date {
  const h = policy.resolveHours[priority ?? 'Medium'] ?? policy.resolveHours.Medium ?? 48;
  return addBusinessHours(createdAt, h, policy.hours);
}

export const CLOSED_CASE_STATUSES = ['Resolved', 'Closed'];
export const isClosedCase = (status: unknown) => typeof status === 'string' && CLOSED_CASE_STATUSES.includes(status);

/**
 * System stamps for a case save (pure). Returns only the keys to change.
 *  - create, or priority changed while open → sla_due_at from created time
 *  - status leaves "New" → first_response_at (if not yet set)
 *  - status → Resolved/Closed → resolved_at; reopening clears it
 */
export function caseStamps(
  before: Record<string, unknown> | null,
  after: Record<string, unknown>,
  createdAt: Date,
  policy: SlaPolicy,
  now: Date = new Date(),
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const open = !isClosedCase(after.status);
  const priorityChanged = !!before && before.priority !== after.priority;
  if (open && (!before || priorityChanged || !after.sla_due_at)) {
    out.sla_due_at = slaDue(createdAt, (after.priority as string) ?? 'Medium', policy).toISOString();
  }
  if (before && before.status === 'New' && after.status !== 'New' && !after.first_response_at) {
    out.first_response_at = now.toISOString();
  }
  if (!open && (!before || !isClosedCase(before.status)) && !after.resolved_at) {
    out.resolved_at = now.toISOString();
    if (!after.first_response_at) out.first_response_at = now.toISOString();
  }
  if (open && before && isClosedCase(before.status)) {
    out.resolved_at = null;
  }
  return out;
}

export function cleanSla(raw: unknown): SlaPolicy {
  const r = (raw ?? {}) as Partial<SlaPolicy>;
  const num = (o: unknown, k: string, d: number) => {
    const v = Number((o as Record<string, unknown> | undefined)?.[k]);
    return Number.isFinite(v) && v > 0 && v <= 2000 ? v : d;
  };
  const pr = ['Urgent', 'High', 'Medium', 'Low'];
  const hhmm = (s: unknown, d: string) => (typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s) ? s : d);
  const h = (r.hours ?? {}) as Partial<BusinessHours>;
  return {
    resolveHours: Object.fromEntries(pr.map((p) => [p, num(r.resolveHours, p, DEFAULT_SLA.resolveHours[p])])),
    firstResponseHours: Object.fromEntries(pr.map((p) => [p, num(r.firstResponseHours, p, DEFAULT_SLA.firstResponseHours[p])])),
    hours: {
      days: Array.isArray(h.days) ? [...new Set(h.days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))] : DEFAULT_SLA.hours.days,
      start: hhmm(h.start, DEFAULT_SLA.hours.start),
      end: hhmm(h.end, DEFAULT_SLA.hours.end),
      tzOffsetMin: 330,
      holidays: Array.isArray(h.holidays) ? h.holidays.filter((x) => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)).slice(0, 60) : [],
      twentyFourSeven: !!h.twentyFourSeven,
    },
  };
}

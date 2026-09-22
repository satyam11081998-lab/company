/**
 * Revenue — money actually received, computed from Razorpay-verified rows only.
 *
 * WHY A SHARED MODULE
 * -------------------
 * Revenue lives in FOUR tables, not one. Counting only `payments` under-reports
 * by every deck, vault and minutes purchase ever made:
 *
 *   payments            subscriptions (lite / pro)      status + paid_at
 *   deck_purchases      one deck                        created_at
 *   skeleton_access     deck-vault access               granted_at
 *   realtime_purchases  voice-minutes pack              created_at
 *
 * WHAT COUNTS
 * -----------
 * A row counts only when it carries a non-empty `razorpay_payment_id`. That id
 * is written in exactly two places — `/api/razorpay/verify` after an HMAC
 * signature check plus a server-side `payments.fetch()` confirming the payment
 * is `captured` and the amount matches, and `/api/razorpay/webhook` after its
 * own signature check. So the id is the proof, and a row without one is an
 * order that was created but never paid.
 *
 * `payments` additionally requires `status = 'paid'`: the webhook flips a row to
 * `refunded` on refund.created / refund.processed, which drops it out here
 * automatically — which is what you want, a refund is not revenue.
 *
 * WHAT DOES NOT COUNT
 * -------------------
 * A verified Razorpay id proves a payment happened. It does NOT prove the
 * payment came from a customer. Two kinds do not:
 *
 *   1. Anything paid from an INTERNAL account — admin, the demo account, or a
 *      seed/leaderboard placeholder. Your own card in test or live mode leaves
 *      a row that is indistinguishable from a sale at the row level, and a
 *      test-mode id (`pay_…`) looks exactly like a live one, so the id can
 *      never be the discriminator. The buyer has to be.
 *   2. Anything listed in EXCLUDED_PAYMENT_IDS below — the escape hatch for a
 *      payment made from a non-internal account that still was not a sale
 *      (a friend testing checkout, a row inserted by hand during a backend
 *      upgrade).
 *
 * Excluded money is not deleted, it is reported separately. A revenue figure
 * you cannot reconcile against your Razorpay dashboard is worse than no figure,
 * so the card shows what was set aside and why.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Revenue booked BEFORE this ledger existed, in rupees.
 *
 * Owner-supplied opening balance (2026-09-23). Everything after it is computed
 * live from the tables above, so this number only ever needs touching if you
 * discover more pre-ledger income. Do NOT use it to "correct" the live figure —
 * if the live figure looks wrong, the bug is in the data, and hiding it here
 * makes it permanent.
 */
export const REVENUE_BASELINE_INR = 3494;

/**
 * Payments to discount by hand, by `razorpay_payment_id`.
 *
 * Only for a payment from a NON-internal account that still was not a sale —
 * internal accounts are already filtered automatically. Add the id and a note
 * saying why, so the next person reading this can tell a deliberate exclusion
 * from a mistake.
 *
 * e.g. 'pay_ABC123', // 2026-09-14 friend testing the Pro checkout flow
 */
export const EXCLUDED_PAYMENT_IDS: ReadonlySet<string> = new Set<string>([
]);

/** Emails that are placeholders, not customers. Mirrors the analytics dashboard. */
const PLACEHOLDER_EMAIL_RE = /@(seed\.mece\.in|mece-seed\.local|leaderboard\.mece\.in)$/i;

/** Fetch cap per table. Sums are exact below this; `truncated` flags a breach. */
const ROW_CAP = 50_000;

export interface RevenueStream {
  key: 'subscriptions' | 'decks' | 'vault' | 'minutes';
  label: string;
  inr: number;
  count: number;
}

export interface RevenueSummary {
  /** baseline + every verified rupee since */
  totalInr: number;
  /** verified rupees only, excluding the opening balance */
  ledgerInr: number;
  baselineInr: number;
  /** verified rupees in the last 30 days */
  last30Inr: number;
  /** verified payments from real customers, all time */
  paymentCount: number;
  /** verified money set aside as internal or test — shown, never silently dropped */
  excluded: { inr: number; count: number; reasons: string[] };
  streams: RevenueStream[];
  /** a table hit ROW_CAP — the total is a floor, not a truth */
  truncated: boolean;
  /** table read failed; the total is missing that stream */
  errors: string[];
}

interface Row { amount_paise: number | null; when: string | null; userId: string | null; payId: string }

const paise = (rows: Row[]) => rows.reduce((n, r) => n + (Number(r.amount_paise) || 0), 0);

function hasId(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

export async function getRevenueSummary(svc: SupabaseClient): Promise<RevenueSummary> {
  const errors: string[] = [];
  let truncated = false;

  // Internal accounts, resolved once. A payment from one of these is your own
  // money going in a circle, not revenue.
  const internal = new Set<string>();
  {
    const { data, error } = await svc.from('users').select('id, is_admin, is_demo, email').limit(50_000);
    if (error) errors.push(`users: ${error.message}`);
    for (const u of (data as { id: string; is_admin: boolean | null; is_demo: boolean | null; email: string | null }[] | null) ?? []) {
      if (u.is_admin || u.is_demo) internal.add(u.id);
      else if (typeof u.email === 'string' && PLACEHOLDER_EMAIL_RE.test(u.email)) internal.add(u.id);
    }
  }

  async function read(
    table: string,
    dateCol: string,
    extra?: (q: any) => any,
  ): Promise<Row[]> {
    let q = svc.from(table).select(`amount_paise, razorpay_payment_id, user_id, ${dateCol}`).limit(ROW_CAP);
    if (extra) q = extra(q);
    const { data, error } = await q;
    if (error) {
      // A missing table (feature not deployed yet) is not an outage — record it
      // so the UI can say the total is partial, and carry on with the rest.
      errors.push(`${table}: ${error.message}`);
      return [];
    }
    const rows = (data as Record<string, any>[] | null) ?? [];
    if (rows.length >= ROW_CAP) truncated = true;
    return rows
      .filter((r) => hasId(r.razorpay_payment_id))
      .map((r) => ({
        amount_paise: r.amount_paise,
        when: r[dateCol] ?? null,
        userId: (r.user_id as string | null) ?? null,
        payId: String(r.razorpay_payment_id),
      }));
  }

  const [subs, decks, vault, minutes] = await Promise.all([
    // paid only — a refunded row has been flipped to 'refunded' by the webhook
    read('payments', 'paid_at', (q) => q.eq('status', 'paid')),
    read('deck_purchases', 'created_at'),
    read('skeleton_access', 'granted_at'),
    read('realtime_purchases', 'created_at'),
  ]);

  // ── Separate real sales from our own money ────────────────────────
  // `reasonToDrop` returns null for a genuine customer payment, or a short
  // human reason otherwise. Reasons are counted so the card can say WHY money
  // was set aside rather than just that it was.
  const reasonToDrop = (r: Row): string | null => {
    if (EXCLUDED_PAYMENT_IDS.has(r.payId)) return 'manually excluded';
    if (!r.userId) return 'no buyer recorded';
    if (internal.has(r.userId)) return 'internal account';
    return null;
  };

  const keep = <T extends Row>(rows: T[]) => rows.filter((r) => reasonToDrop(r) === null);

  const kept = {
    subs: keep(subs), decks: keep(decks), vault: keep(vault), minutes: keep(minutes),
  };

  const droppedRows = [...subs, ...decks, ...vault, ...minutes].filter((r) => reasonToDrop(r) !== null);
  const reasonCounts = new Map<string, number>();
  for (const r of droppedRows) {
    const why = reasonToDrop(r) as string;
    reasonCounts.set(why, (reasonCounts.get(why) ?? 0) + 1);
  }

  const streams: RevenueStream[] = [
    { key: 'subscriptions', label: 'Lite & Pro',    inr: paise(kept.subs) / 100,    count: kept.subs.length },
    { key: 'decks',         label: 'Deck sales',    inr: paise(kept.decks) / 100,   count: kept.decks.length },
    { key: 'vault',         label: 'Vault access',  inr: paise(kept.vault) / 100,   count: kept.vault.length },
    { key: 'minutes',       label: 'Voice minutes', inr: paise(kept.minutes) / 100, count: kept.minutes.length },
  ];

  const all = [...kept.subs, ...kept.decks, ...kept.vault, ...kept.minutes];
  const ledgerInr = Math.round(paise(all) / 100);

  const cutoff = Date.now() - 30 * 86_400_000;
  const last30Inr = Math.round(
    paise(all.filter((r) => r.when && new Date(r.when).getTime() >= cutoff)) / 100,
  );

  return {
    totalInr: REVENUE_BASELINE_INR + ledgerInr,
    ledgerInr,
    baselineInr: REVENUE_BASELINE_INR,
    last30Inr,
    paymentCount: all.length,
    excluded: {
      inr: Math.round(paise(droppedRows) / 100),
      count: droppedRows.length,
      reasons: [...reasonCounts.entries()].map(([why, n]) => `${n} ${why}`),
    },
    streams,
    truncated,
    errors,
  };
}

/** ₹1,23,456 — Indian digit grouping, no decimals. */
export function formatInr(n: number): string {
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n));
}

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
  /** verified payments, all time */
  paymentCount: number;
  streams: RevenueStream[];
  /** a table hit ROW_CAP — the total is a floor, not a truth */
  truncated: boolean;
  /** table read failed; the total is missing that stream */
  errors: string[];
}

interface Row { amount_paise: number | null; when: string | null }

const paise = (rows: Row[]) => rows.reduce((n, r) => n + (Number(r.amount_paise) || 0), 0);

function hasId(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

export async function getRevenueSummary(svc: SupabaseClient): Promise<RevenueSummary> {
  const errors: string[] = [];
  let truncated = false;

  async function read(
    table: string,
    dateCol: string,
    extra?: (q: any) => any,
  ): Promise<Row[]> {
    let q = svc.from(table).select(`amount_paise, razorpay_payment_id, ${dateCol}`).limit(ROW_CAP);
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
      .map((r) => ({ amount_paise: r.amount_paise, when: r[dateCol] ?? null }));
  }

  const [subs, decks, vault, minutes] = await Promise.all([
    // paid only — a refunded row has been flipped to 'refunded' by the webhook
    read('payments', 'paid_at', (q) => q.eq('status', 'paid')),
    read('deck_purchases', 'created_at'),
    read('skeleton_access', 'granted_at'),
    read('realtime_purchases', 'created_at'),
  ]);

  const streams: RevenueStream[] = [
    { key: 'subscriptions', label: 'Lite & Pro',   inr: paise(subs) / 100,    count: subs.length },
    { key: 'decks',         label: 'Deck sales',   inr: paise(decks) / 100,   count: decks.length },
    { key: 'vault',         label: 'Vault access', inr: paise(vault) / 100,   count: vault.length },
    { key: 'minutes',       label: 'Voice minutes',inr: paise(minutes) / 100, count: minutes.length },
  ];

  const all = [...subs, ...decks, ...vault, ...minutes];
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
    streams,
    truncated,
    errors,
  };
}

/** ₹1,23,456 — Indian digit grouping, no decimals. */
export function formatInr(n: number): string {
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n));
}

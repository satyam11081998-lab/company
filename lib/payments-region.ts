import { notifyAdmin } from '@/lib/telegram';
import type { Currency } from '@/lib/market';

/**
 * THE REGION WALL — why a VPN cannot buy India pricing.
 *
 * Region detection (lib/market.ts) decides what a visitor SEES. It can be
 * fooled by someone who changes both their VPN and their OS clock. This file
 * decides what a payment can BUY, and it cannot be fooled from the browser:
 *
 *   An INR order is honoured only when Razorpay reports the payment as
 *   DOMESTIC (`payment.international === false`) — an Indian card, UPI,
 *   Indian netbanking or an Indian wallet. A foreign card on an INR order is
 *   refused: nothing is granted, the payment is refunded in full, and the
 *   owner is told on Telegram.
 *
 * `international` is set by Razorpay from the card's issuing BIN, not from
 * anything the buyer controls. UPI / netbanking / wallets are India-only rails
 * and always report `international: false`.
 *
 * USD / EUR orders have no wall: paying the international price from anywhere
 * is fine — it is the higher price.
 */

export function orderCurrency(order: { currency?: unknown } | null | undefined): Currency | null {
  const c = typeof order?.currency === 'string' ? order.currency.toUpperCase() : '';
  return c === 'INR' || c === 'USD' || c === 'EUR' ? (c as Currency) : null;
}

/** True when this payment must NOT be honoured: INR order, foreign instrument. */
export function violatesDomesticWall(
  currency: Currency | null,
  payment: { international?: unknown } | null | undefined,
): boolean {
  return currency === 'INR' && payment?.international === true;
}

export const DOMESTIC_WALL_MESSAGE =
  'India pricing can only be paid with an Indian card, UPI or Indian netbanking. ' +
  'Your payment has been refunded in full. Please buy from mece.in/us/pricing for your region.';

/* eslint-disable @typescript-eslint/no-explicit-any */
type RazorpayLike = {
  payments: {
    fetch: (id: string) => Promise<any>;
    // Loose on purpose: the SDK's overloaded refund() signature is not
    // assignable to a narrower shape, and the params we pass ({speed, notes})
    // are part of its RazorpayRefundCreateRequestBody.
    refund: (id: string, opts: any) => Promise<any>;
  };
};

/**
 * Refund a wall-violating payment in full, at most once, and alert the owner.
 *
 * Idempotent: re-reads the payment from Razorpay and skips the refund when it
 * is already fully refunded, so /verify and the webhook racing on the same
 * payment cannot double-refund. Never throws — a failed refund is escalated
 * on Telegram for manual action rather than surfacing as a 500 to the buyer.
 *
 * NOTE: deliberately does NOT write to `payments`. The `refund.created`
 * webhook downgrades whoever owns a `payments` row for the refunded payment
 * id; recording this blocked payment there would downgrade a legitimate
 * existing subscriber who merely tried to pay an upgrade with a foreign card.
 */
export async function refundDomesticWallViolation(
  instance: RazorpayLike,
  args: { paymentId: string; orderId: string; userId: string; email?: string | null; source: 'verify' | 'webhook'; amountMinor: number },
): Promise<{ refunded: boolean; alreadyRefunded: boolean; error?: string }> {
  const { paymentId, orderId, userId, email, source, amountMinor } = args;
  let already = false;
  try {
    const fresh = await instance.payments.fetch(paymentId);
    already = fresh?.refund_status === 'full' || Number(fresh?.amount_refunded || 0) >= Number(fresh?.amount || 1);
  } catch {
    // If we cannot read it, attempt the refund anyway; Razorpay rejects a
    // second full refund on its own, and that rejection is caught below.
  }
  if (already) return { refunded: false, alreadyRefunded: true };

  try {
    await instance.payments.refund(paymentId, {
      speed: 'normal',
      notes: { reason: 'domestic_pricing_foreign_instrument', user_id: userId, order_id: orderId },
    });
    await notifyAdmin(
      `🛡️ MECE region wall (${source}): foreign card on an INR order was REFUNDED.\n` +
      `user=${email || userId} payment=${paymentId} order=${orderId} amount=${amountMinor} paise\n` +
      `Nothing was granted. If this is a genuine India customer, ask them to pay via UPI / an Indian card.`,
    );
    return { refunded: true, alreadyRefunded: false };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String((e as { error?: { description?: string } })?.error?.description || e);
    await notifyAdmin(
      `🚨 MECE region wall (${source}): foreign card on an INR order — REFUND FAILED, refund manually.\n` +
      `user=${email || userId} payment=${paymentId} order=${orderId} amount=${amountMinor} paise\nerror=${msg}`,
    );
    return { refunded: false, alreadyRefunded: false, error: msg };
  }
}

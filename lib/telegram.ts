/**
 * Server-side Telegram admin alert (frontend twin of backend
 * `services/telegram_notify.py`, same env var names).
 *
 * Used for events that must never be swallowed but must also never break the
 * request that produced them — e.g. a Razorpay webhook arriving for an
 * anonymous buyer, where money has been captured but Pro was withheld.
 *
 * ALWAYS fail-safe: a missing token, a Telegram outage or a malformed chat id
 * resolves to `false`. An alerting path that can throw is worse than no
 * alerting path, because it takes the caller down with it — and this one is
 * called from inside a payment webhook.
 */

const API_BASE = 'https://api.telegram.org/bot';

export async function notifyAdmin(message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  // Backend accepts either name (see 6a7f496); mirror that here so one env var
  // set works for both services.
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) {
    console.warn('[telegram] not configured — alert dropped:', message.slice(0, 200));
    return false;
  }

  try {
    const res = await fetch(`${API_BASE}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true,
      }),
      // Never let a slow Telegram hold a payment webhook open.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error('[telegram] sendMessage failed:', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[telegram] sendMessage threw:', err);
    return false;
  }
}

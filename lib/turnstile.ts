'use client';

/**
 * Cloudflare Turnstile token helper — shared by EVERY Supabase auth call.
 *
 * ── Why this is shared and not private to guest mode ──────────────────
 *
 * Supabase's CAPTCHA protection is a project-level switch, and it gates
 * sign-in, sign-up AND password reset — not just anonymous sign-in. The moment
 * it is enabled, every `auth` call that does not carry a `captchaToken` starts
 * failing with `captcha-verification-process-failed`.
 *
 * That means enabling it while only `signInAnonymously()` passes a token would
 * take down signup, login and password reset for every existing user — a full
 * outage, triggered by a dashboard toggle with no deploy. This helper exists so
 * all four call sites share one implementation and none can be forgotten.
 *
 * The SECRET is never referenced here. Supabase holds it (Authentication →
 * Attack Protection → CAPTCHA) and redeems the token server-side. The browser
 * only ever handles the public site key.
 *
 * Tokens are SINGLE-USE. Each auth call must fetch its own — never cache one
 * across two calls, or the second gets `timeout-or-duplicate`.
 */

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function isTurnstileEnabled(): boolean {
  return !!TURNSTILE_SITE_KEY;
}

interface TurnstileApi {
  render: (el: HTMLElement, o: Record<string, unknown>) => string;
  remove: (id: string) => void;
}

/** Wait for the async-loaded Turnstile script. */
function waitForTurnstile(timeoutMs = 4000): Promise<TurnstileApi | null> {
  return new Promise((resolve) => {
    const w = window as unknown as { turnstile?: TurnstileApi };
    if (w.turnstile) return resolve(w.turnstile);
    const started = Date.now();
    const poll = setInterval(() => {
      if (w.turnstile) {
        clearInterval(poll);
        resolve(w.turnstile);
      } else if (Date.now() - started > timeoutMs) {
        clearInterval(poll);
        resolve(null);
      }
    }, 100);
  });
}

/**
 * Solve an invisible Turnstile challenge and return the token.
 *
 * Returns `undefined` when Turnstile is not configured, the script is blocked,
 * or the challenge stalls — callers then make the auth call without a token.
 * That FAILS OPEN on the client but the server still decides: if Supabase has
 * CAPTCHA enforcement on, it rejects the tokenless call anyway. Failing open
 * here only avoids turning a blocked third-party script into a dead button
 * before Supabase has had its say.
 *
 * `render()` rather than `execute()`: execute() only works against a widget
 * already rendered in execute mode, and getting that wrong fails silently at
 * the exact moment a real user is trying to sign in.
 */
export async function getCaptchaToken(): Promise<string | undefined> {
  if (!TURNSTILE_SITE_KEY) return undefined;
  if (typeof window === 'undefined') return undefined;

  const turnstile = await waitForTurnstile();
  if (!turnstile) {
    console.warn('[turnstile] script unavailable; continuing without a token.');
    return undefined;
  }

  return new Promise((resolve) => {
    const holder = document.createElement('div');
    // The telemetry marker Cloudflare uses to attribute the integration.
    holder.className = 'cf-turnstile';
    holder.setAttribute('data-action', 'turnstile-spin-v2');
    holder.style.display = 'none';
    document.body.appendChild(holder);

    let widgetId: string | undefined;
    let settled = false;
    const done = (token?: string) => {
      if (settled) return;
      settled = true;
      try {
        if (widgetId) turnstile.remove(widgetId);
      } catch {
        /* already removed */
      }
      holder.remove();
      resolve(token);
    };

    const timer = setTimeout(() => done(undefined), 8000);
    try {
      widgetId = turnstile.render(holder, {
        sitekey: TURNSTILE_SITE_KEY,
        action: 'turnstile-spin-v2',
        appearance: 'interaction-only',
        callback: (token: string) => {
          clearTimeout(timer);
          done(token);
        },
        'error-callback': () => {
          clearTimeout(timer);
          done(undefined);
        },
        'timeout-callback': () => {
          clearTimeout(timer);
          done(undefined);
        },
      });
    } catch {
      clearTimeout(timer);
      done(undefined);
    }
  });
}

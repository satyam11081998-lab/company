import { cookies } from 'next/headers';
import type { UserRow } from '@/lib/types';

/**
 * ADMIN "VIEW AS US" PREVIEW (2026-09-26).
 *
 * Lets an India admin walk the international product — US nav, US case bank,
 * US daily, USD plan cards — without changing their account. Switched on from
 * /admin/us-market, which sets an httpOnly cookie; it is honoured ONLY when
 * the signed-in account is an admin (`users.is_admin`, a guarded column), so
 * setting the cookie by hand does nothing for anyone else.
 *
 * DISPLAY ONLY. It rewrites the `market` on the user row that pages render
 * from. It never touches:
 *   - the database (`users.market` stays what it is),
 *   - checkout (/api/razorpay/* re-read the real market server-side, and the
 *     intl checkout button is disabled while previewing),
 *   - the middleware's region routing.
 * The backend lets admins open a case from either bank (services/markets.py),
 * so a previewing admin can actually start a US case.
 */

export const ADMIN_PREVIEW_COOKIE = 'mece_admin_mkt';
export const ADMIN_PREVIEW_MAX_AGE = 60 * 60 * 12; // 12h, then it lapses on its own

/** 'US' when an admin has switched the US preview on; otherwise null. */
export function adminPreviewMarket(row: Pick<UserRow, 'is_admin'> | null | undefined): 'US' | null {
  if (!row?.is_admin) return null;
  try {
    return cookies().get(ADMIN_PREVIEW_COOKIE)?.value === 'US' ? 'US' : null;
  } catch {
    // cookies() outside a request scope (build/static): no preview.
    return null;
  }
}

/** The row pages should render from: unchanged unless an admin is previewing. */
export function withAdminPreview<T extends Pick<UserRow, 'is_admin' | 'market'>>(row: T | null): T | null {
  if (!row) return row;
  const preview = adminPreviewMarket(row);
  if (!preview) return row;
  return { ...row, market: preview, admin_preview: true };
}

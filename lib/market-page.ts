import { headers } from 'next/headers';
import { contentMarketOf, normalizeMarket, REGION_HEADER, type ContentMarket, type Market } from '@/lib/market';
import type { UserRow } from '@/lib/types';

/**
 * Server Component helpers: which market is THIS request in?
 *
 *   - Signed-in (incl. guest) → the account's locked `users.market`.
 *   - Logged out             → the region the middleware detected and wrote to
 *                               the `x-mece-region` request header (always
 *                               overwritten there, never client-trusted).
 *
 * Reading headers() makes a route dynamic, so call these only from routes that
 * already are (every (app) page is `force-dynamic`). Never from "/" or other
 * static marketing pages — those are routed by the middleware instead.
 */
export function requestRegion(): Market {
  try {
    return normalizeMarket(headers().get(REGION_HEADER));
  } catch {
    return 'IN';
  }
}

export function viewerMarket(userRow: Pick<UserRow, 'market'> | null | undefined, signedIn: boolean): Market {
  if (signedIn && userRow) return normalizeMarket(userRow.market);
  return requestRegion();
}

export function viewerContentMarket(userRow: Pick<UserRow, 'market'> | null | undefined, signedIn: boolean): ContentMarket {
  return contentMarketOf(viewerMarket(userRow, signedIn));
}

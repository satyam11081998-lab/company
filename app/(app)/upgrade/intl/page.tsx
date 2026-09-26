import { redirect } from 'next/navigation';
import { getCachedAuthUser, getCachedUserRow } from '@/lib/supabase/auth-cached';
import { isIntlMarket } from '@/lib/market';
import IntlUpgrade from '@/components/intl/intl-upgrade';

/**
 * The international (USD / EUR) checkout. Users never type this URL: the
 * middleware REWRITES /upgrade here for international accounts, so the
 * address bar still reads /upgrade.
 *
 * A separate route rather than a branch inside /upgrade on purpose: each route
 * gets its own JavaScript chunk, so an international account never downloads
 * the India checkout (and its rupee price table), and the India /upgrade page
 * stays byte-for-byte what it was.
 *
 * Presentation only — /api/razorpay/order decides the currency again,
 * server-side, from the same locked market.
 */
export const dynamic = 'force-dynamic';

export default async function IntlUpgradePage() {
  const authUser = await getCachedAuthUser();
  const row = authUser ? await getCachedUserRow(authUser.id) : null;
  // Only a POSITIVE India answer sends the visitor back. A failed row read
  // renders this page: the middleware only rewrites here after a fresh
  // database read said the account is international.
  if (row && !isIntlMarket(row.market)) redirect('/upgrade');
  return <IntlUpgrade />;
}

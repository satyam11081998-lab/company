'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import type { UserRow, SubscriptionTier } from '@/lib/types';
// tier-core, not tier: the app shell must not ship the rupee price table to
// international accounts (see lib/tier-core.ts).
import { effectiveTier, hasTier } from '@/lib/tier-core';
import { normalizeMarket, isIntlMarket, currencyOf, type Market, type Currency } from '@/lib/market';

interface UserContextValue {
  user: UserRow | null;
  setUser: (u: UserRow | null) => void;
  refresh: () => Promise<void>;
  tier: SubscriptionTier;          // current effective tier
  isFree: boolean;
  isLite: boolean;
  isPro: boolean;
  hasTierAccess: (required: SubscriptionTier) => boolean;
  /** Account market (0070). NULL/unknown → 'IN'. */
  market: Market;
  /** True for US + Europe accounts — the international product. */
  isIntl: boolean;
  currency: Currency;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  initialUser,
  children,
}: {
  initialUser: UserRow | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserRow | null>(initialUser);

  const tier = effectiveTier(user);
  const isFree = tier === 'free';
  const isLite = tier === 'lite' || tier === 'pro';
  const isPro = tier === 'pro';
  const market = normalizeMarket(user?.market);
  const isIntl = isIntlMarket(market);
  const currency = currencyOf(market);
  const hasTierAccess = useCallback(
    (required: SubscriptionTier) => hasTier(user, required),
    [user]
  );

  const refresh = useCallback(async () => {
    const res = await fetch('/api/me', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setUser(data as UserRow);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refresh, tier, isFree, isLite, isPro, hasTierAccess, market, isIntl, currency }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
  return ctx;
}

/** Like useUser(), but null outside <UserProvider> instead of throwing —
 *  for leaf components that are also rendered in guest / public shells. */
export function useOptionalUser(): UserContextValue | null {
  return useContext(UserContext);
}

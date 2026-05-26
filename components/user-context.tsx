'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import type { UserRow, SubscriptionTier } from '@/lib/types';
import { effectiveTier, hasTier } from '@/lib/tier';

interface UserContextValue {
  user: UserRow | null;
  setUser: (u: UserRow | null) => void;
  refresh: () => Promise<void>;
  tier: SubscriptionTier;          // current effective tier
  isFree: boolean;
  isLite: boolean;
  isPro: boolean;
  hasTierAccess: (required: SubscriptionTier) => boolean;
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
    <UserContext.Provider value={{ user, setUser, refresh, tier, isFree, isLite, isPro, hasTierAccess }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
  return ctx;
}

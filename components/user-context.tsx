'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import type { UserRow } from '@/lib/types';

interface UserContextValue {
  user: UserRow | null;
  setUser: (u: UserRow | null) => void;
  refresh: () => Promise<void>;
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

  const refresh = useCallback(async () => {
    const res = await fetch('/api/me', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setUser(data as UserRow);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
  return ctx;
}

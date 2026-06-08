import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import AppNav from '@/components/app-nav';
import { UserProvider } from '@/components/user-context';
import MobileBottomNav from '@/components/mobile-bottom-nav';
import Footer from '@/components/footer';
import { getCachedAuthUser, getCachedUserRow } from '@/lib/supabase/auth-cached';
import type { UserRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Both calls are React.cache()-memoised → if a child page calls them again
  // during the same request, no extra Supabase round-trips fire. Cuts the
  // typical per-navigation auth cost from ~400ms to ~200ms.
  const authUser = await getCachedAuthUser();
  if (!authUser) redirect('/login');

  const userRow = await getCachedUserRow(authUser.id);

  // Onboarding gate (owner directive 2026-06-08): users who haven't completed
  // onboarding can only see /onboarding. Everything else inside (app) bounces
  // them back to finish set-up. The header is set by next.js middleware as a
  // by-product of routing; the safer read is via headers() which gives us
  // the request pathname during SSR.
  const hdrs = headers();
  const pathname =
    hdrs.get('x-invoke-path') ??
    hdrs.get('x-pathname') ??
    hdrs.get('next-url') ??
    '';
  const onboarding = userRow?.onboarding_completed_at;
  if (!onboarding && !pathname.startsWith('/onboarding')) {
    redirect('/onboarding');
  }
  if (onboarding && pathname.startsWith('/onboarding')) {
    redirect('/dashboard');
  }

  const fallbackUser: UserRow = {
    id: authUser.id,
    name: authUser.user_metadata?.full_name || null,
    email: authUser.email || '',
    avatar_url: authUser.user_metadata?.avatar_url || null,
    points: 0,
    created_at: new Date().toISOString(),
    subscription_tier: 'free',
    subscription_started_at: null,
    subscription_expires_at: null,
    streak_count: 0,
    streak_last_date: null,
    is_admin: false,
  };

  const user: UserRow = userRow ?? fallbackUser;

  return (
    <UserProvider initialUser={user}>
      <AppNav />
      <main className="min-h-[calc(100vh-64px)] flex flex-col relative w-full overflow-x-clip max-w-[100vw]">
        <div className="flex-1 pb-10">
          {children}
        </div>
        <Footer className="pb-24 md:pb-12" />
      </main>
      <MobileBottomNav />
    </UserProvider>
  );
}

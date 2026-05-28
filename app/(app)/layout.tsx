import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import { UserProvider } from '@/components/user-context';
import MobileBottomNav from '@/components/mobile-bottom-nav';
import Footer from '@/components/footer';
import type { UserRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect('/login');

  const { data: userRow } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  const fallbackUser: UserRow = {
    id: session.user.id,
    name: session.user.user_metadata?.full_name || null,
    email: session.user.email || '',
    avatar_url: session.user.user_metadata?.avatar_url || null,
    points: 0,
    created_at: new Date().toISOString(),
    subscription_tier: 'free',
    subscription_started_at: null,
    subscription_expires_at: null,
    streak_count: 0,
    streak_last_date: null,
  };

  const user = (userRow as UserRow | null) || fallbackUser;

  return (
    <UserProvider initialUser={user}>
      <AppNav />
      <main className="min-h-[calc(100vh-64px)] flex flex-col">
        <div className="flex-1 pb-10">
          {children}
        </div>
        <Footer className="pb-24 md:pb-12" />
      </main>
      <MobileBottomNav />
    </UserProvider>
  );
}

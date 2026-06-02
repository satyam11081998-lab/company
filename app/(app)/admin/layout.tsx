import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { UserRow } from '@/lib/types';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch user role
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  const is_admin = (userData as Partial<UserRow>)?.is_admin;

  if (!is_admin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-6xl py-8">
        {children}
      </div>
    </div>
  );
}

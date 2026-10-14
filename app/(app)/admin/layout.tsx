import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import AdminNav from '@/components/admin/admin-nav';
import AdminAccount from '@/components/admin/admin-account';
import { ADMIN_LOGIN_PATH } from '@/lib/staff-paths';
import type { UserRow } from '@/lib/types';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // The admin console has its own sign-in (2026-10-09), separate from /login.
  if (!user) redirect(ADMIN_LOGIN_PATH);

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!(userData as Partial<UserRow>)?.is_admin) {
    // Signed in, but not as an admin: offer the admin sign-in (which says
    // whose account this is, and sends CRM team members on to the CRM).
    const here = headers().get('x-pathname') || '/admin';
    redirect(`${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(here)}`);
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Desktop left rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-2">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</p>
            <AdminNav />
            <AdminAccount email={user.email ?? ''} />
          </div>
        </aside>

        <div className="min-w-0">
          {/* Mobile: open the rail in a drawer */}
          <div className="mb-4 lg:hidden">
            <Sheet>
              <SheetTrigger className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium">
                <Menu className="h-4 w-4" /> Sections
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-3">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</p>
                <AdminNav />
                <AdminAccount email={user.email ?? ''} />
              </SheetContent>
            </Sheet>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

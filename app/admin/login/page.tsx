import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import Wordmark from '@/components/home/wordmark';
import { createClient } from '@/lib/supabase/server';
import { staffKind } from '@/lib/staff-access';
import { staffDestination } from '@/lib/staff-paths';
import AdminLoginForm from './admin-login-form';
import SwitchAccount from './switch-account';

/**
 * Staff sign-in (2026-10-09): the admin console and the CRM have their own
 * sign-in, separate from the learner /login. Lives OUTSIDE the (app) group, so
 * it has no learner chrome and no admin-layout gate (which would loop).
 *
 * Already signed in as staff → straight through. Signed in as a learner or a
 * guest → "sign out first" (signing in over a live session would orphan it),
 * then the form.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin sign-in',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: { searchParams: { next?: string | string[] } }) {
  const next = typeof searchParams.next === 'string' ? searchParams.next : null;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user && !user.is_anonymous) {
    const kind = await staffKind(user.id);
    if (kind) redirect(staffDestination(next, kind));
  }
  const current = !user ? null
    : user.is_anonymous ? ({ kind: 'guest' } as const)
    : ({ kind: 'learner', email: user.email ?? '' } as const);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F4EF] px-4 py-12 dark:bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38vh] min-h-[200px] bg-navy" aria-hidden />
      <div className="relative z-10 w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
        <div className="mb-6 flex items-center justify-center gap-3">
          <Wordmark tone="light" taglineFrom="never" />
          <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
            Admin
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card px-7 py-8 shadow-lg">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy dark:bg-white/10 dark:text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-semibold text-foreground">Sign in to Admin</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">For the MECE team.</p>
          </div>

          {current ? <SwitchAccount current={current} /> : <AdminLoginForm next={next} />}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Preparing for interviews?{' '}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Learner sign-in
          </Link>
        </p>
      </div>
    </main>
  );
}

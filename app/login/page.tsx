import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import AuthForm from '@/components/auth-form';
import Logo from '@/components/logo';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Log in to MECE to continue your placement interview prep — cases, guesstimates, frameworks, and GD briefs.',
  alternates: { canonical: '/login' },
};

/** Login page. */
export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 overflow-hidden">
      {/* Decorative geometric background shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full border border-border/40 opacity-60" />
        <div className="absolute -top-12 -left-12 h-72 w-72 rounded-full border border-border/30 opacity-50" />
        <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full border border-border/40 opacity-60" />
        <div className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full border border-border/30 opacity-50" />
        <div className="absolute top-1/4 right-8 h-40 w-40 rotate-12 border border-border/25 opacity-40" />
        <div className="absolute bottom-1/4 left-8 h-32 w-32 -rotate-6 border border-border/25 opacity-40" />
        <div className="absolute top-1/2 left-1/4 h-20 w-20 rotate-45 border border-border/20 opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="inline-block">
            <Logo variant="dark" className="scale-[0.8] origin-center -ml-[30px]" />
          </Link>
        </div>

        {/* Card */}
        <div className="ui-card rounded-xl border border-border px-8 py-10 shadow-md">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Login to continue your case prep.</p>
          </div>
          <Suspense fallback={<div className="h-40 flex items-center justify-center text-sm text-muted-foreground">Loading...</div>}>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

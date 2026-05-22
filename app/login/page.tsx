import Link from 'next/link';
import AuthForm from '@/components/auth-form';

export const dynamic = 'force-dynamic';

/** Login page. */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900">MECE</Link>
          <h1 className="mt-6 text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Login to continue your case prep.</p>
        </div>
        <div className="mt-8 rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8">
          <AuthForm mode="login" />
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

/** Forgot password page — sends a Supabase reset link via email. */
export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const origin = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setIsSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900">Consilio</Link>
          <h1 className="mt-6 text-2xl font-semibold text-slate-900">Reset your password</h1>
          <p className="mt-2 text-sm text-slate-600">Enter the email tied to your account and we&apos;ll send you a reset link.</p>
        </div>
        <div className="mt-8 rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8">
          {isSent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</div>
              <p className="text-sm text-slate-700">Check your email for a reset link.</p>
              <Link href="/login" className="inline-block text-sm font-medium text-primary hover:underline">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@iim.example" />
              </div>
              <Button type="submit" disabled={isLoading} className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary-hover">
                {isLoading ? 'Sending…' : 'Send reset link'}
              </Button>
              <Link href="/login" className="block text-center text-sm font-medium text-slate-600 hover:underline">Back to login</Link>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

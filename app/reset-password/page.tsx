'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

/** Reset password page — user lands here from the email link. */
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    // Verify the user landed here with a valid recovery session.
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        setLinkError('This reset link is invalid or has expired. Please request a new one.');
      }
      setIsReady(true);
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Password updated.');
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900">MECE</Link>
          <h1 className="mt-6 text-2xl font-semibold text-slate-900">Set a new password</h1>
          <p className="mt-2 text-sm text-slate-600">Pick something strong. Minimum 8 characters.</p>
        </div>
        <div className="mt-8 rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8">
          {!isReady ? (
            <p className="text-center text-sm text-slate-500">Loading…</p>
          ) : linkError ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-rose-700">{linkError}</p>
              <Link href="/forgot-password" className="inline-block text-sm font-medium text-primary hover:underline">Request a new link</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input id="confirm-password" type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={isLoading} className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary-hover">
                {isLoading ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MonitorSmartphone, ShieldAlert } from 'lucide-react';
import { takeOverSession, signOutHere } from './actions';

export default function SessionConflictClient({
  deviceLabel,
  location,
  lastSeenAt,
}: {
  deviceLabel: string;
  location: string;
  lastSeenAt: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const seen = new Date(lastSeenAt).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  });

  function handleTakeOver() {
    setError(null);
    startTransition(async () => {
      const res = await takeOverSession();
      if (res.success) {
        router.replace('/dashboard');
        router.refresh();
      } else {
        setError(res.error || 'Could not switch devices.');
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <ShieldAlert className="h-5 w-5 text-primary" />
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          You&apos;re signed in somewhere else
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A MECE account can be open on one device at a time. Sign out on the other device, or
          take over here and that session will end.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
          <MonitorSmartphone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 text-sm">
            <p className="font-medium text-foreground">{deviceLabel}</p>
            <p className="text-xs text-muted-foreground">
              {location ? `${location} · ` : ''}last active {seen}
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          onClick={handleTakeOver}
          disabled={pending}
          className="btn-primary mt-6 w-full py-2.5 text-sm disabled:opacity-60"
        >
          {pending ? 'Switching…' : 'Use MECE here instead'}
        </button>

        <form action={signOutHere}>
          <button
            type="submit"
            disabled={pending}
            className="mt-3 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
          >
            Sign out of this browser
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Sharing an account is against our terms. If this wasn&apos;t you, take over here and
          change your password from Profile.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Full-screen navigation loading overlay + a hook to drive it.
 *
 * Why: server-rendered preview routes (dashboard/practice/leaderboard) do an
 * auth round-trip in the (app) layout before ANY UI — even loading.tsx — can
 * paint, so a plain <Link> click feels laggy with no feedback. Driving the
 * navigation through useTransition lets us show an instant overlay for the whole
 * time the next route is rendering on the server, then it disappears when the
 * page commits. Pure client, portalled to <body>, above every other layer.
 */
function Overlay({ label }: { label: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-background/85 backdrop-blur-sm animate-in fade-in-0">
      <div className="text-2xl font-bold tracking-tight">
        <span className="text-primary">M</span>
        <span className="text-foreground">ECE</span>
      </div>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-[13px] text-muted-foreground">{label}</p>
    </div>,
    document.body,
  );
}

export function useNavLoading(label = 'Loading…') {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const navigate = (href: string) => startTransition(() => router.push(href));
  const overlay = pending ? <Overlay label={label} /> : null;
  return { navigate, overlay, pending, router };
}

'use client';

import { useEffect, useState, useCallback } from 'react';

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

const DISMISS_KEY = 'mece-pwa-install-dismissed';
const DISMISS_DAYS = 14;

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function recentlyDismissed(): boolean {
  try {
    const v = localStorage.getItem(DISMISS_KEY);
    const ts = v ? Number(v) : 0;
    return !!ts && Date.now() - ts < DISMISS_DAYS * 864e5;
  } catch {
    return false;
  }
}

/**
 * Registers the PWA service worker and shows a subtle, dismissible install
 * prompt. Renders nothing until the browser signals installability (Android)
 * or we detect iOS Safari. Never shows once installed (standalone) or if
 * dismissed within the last 14 days.
 */
export default function PwaProvider() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [visible, setVisible] = useState(false);

  // Register the service worker (production builds, incl. Vercel previews).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    };
    if (document.readyState === 'complete') onLoad();
    else {
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  // Android / desktop Chrome install prompt.
  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // iOS Safari has no beforeinstallprompt — show an "Add to Home Screen" hint.
  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua);
    const webkit = /WebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (iOS && webkit) {
      const t = setTimeout(() => {
        setShowIos(true);
        setVisible(true);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {}
    setDeferred(null);
    dismiss();
  }, [deferred, dismiss]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" width={40} height={40} className="rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight text-foreground">Install the MECE app</p>
          {showIos ? (
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Tap the Share icon, then &ldquo;Add to Home Screen&rdquo;.
            </p>
          ) : (
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Practice faster, works offline, one tap from your home screen.
            </p>
          )}
        </div>
        {!showIos && deferred && (
          <button
            onClick={install}
            className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            Install
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

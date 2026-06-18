'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquarePlus } from 'lucide-react';
import { FeedbackPanel } from './feedback-panel';

/**
 * Global feedback launcher. Mounted once in the app shell and the guest chrome
 * so it is present on every page (logged-in and public /learn). Sits above the
 * mobile bottom nav (bottom-24) to avoid collision, like the casebook menu FAB.
 */
export function FeedbackLauncher() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Hidden during the full-screen case session so it doesn't float over the chat.
  if (pathname?.startsWith('/cases/')) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed bottom-24 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-lg shadow-black/10 transition-transform hover:scale-105 active:scale-95 xl:bottom-6"
      >
        <MessageSquarePlus className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      <FeedbackPanel open={open} onClose={() => setOpen(false)} defaultCategory="general" />
    </>
  );
}

export default FeedbackLauncher;

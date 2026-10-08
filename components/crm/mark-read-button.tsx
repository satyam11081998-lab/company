'use client';

import { useRouter } from 'next/navigation';
import { crmMarkNotificationsRead } from '@/app/(app)/crm/actions';

export default function MarkReadButton() {
  const router = useRouter();
  return (
    <button type="button" onClick={async () => { await crmMarkNotificationsRead(); router.refresh(); }}
      className="h-8 rounded-md border border-border px-3 text-sm hover:bg-muted">
      Mark all read
    </button>
  );
}

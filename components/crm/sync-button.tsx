'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { crmSyncNow } from '@/app/(app)/crm/actions';

export default function SyncButton({ prominent = false }: { prominent?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    const r = await crmSyncNow();
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    const s = r.data;
    toast.success(`Synced ${s.contacts} contacts, ${s.accounts} accounts, ${s.deals} deals, ${s.invoices} invoices, ${s.renewals} renewals, ${s.cases} cases (${(s.ms / 1000).toFixed(1)}s).`);
    router.refresh();
  };
  return (
    <button type="button" onClick={run} disabled={busy}
      className={`mt-1 inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm disabled:opacity-60 ${prominent ? 'bg-navy text-navy-foreground' : 'border border-border bg-card hover:bg-muted'}`}>
      <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} /> {busy ? 'Syncing…' : 'Sync MECE data'}
    </button>
  );
}

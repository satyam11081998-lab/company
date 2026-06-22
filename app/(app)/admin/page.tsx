'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, UserCog, Trash2 } from 'lucide-react';
import { triggerNewsFetch, triggerCaseGeneration, grantMembership, deleteUserByIdentifier } from './actions';

export default function AdminPage() {
  const [newsLoading, setNewsLoading] = useState(false);
  const [caseLoading, setCaseLoading] = useState(false);

  const [grantEmail, setGrantEmail] = useState('');
  const [grantTier, setGrantTier] = useState<'free' | 'lite' | 'pro'>('pro');
  const [grantDuration, setGrantDuration] = useState('30');
  const [grantLoading, setGrantLoading] = useState(false);

  const [deleteId, setDeleteId] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [log, setLog] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const handleNewsFetch = async () => {
    setNewsLoading(true);
    setLog(null);
    const result = await triggerNewsFetch();
    if (result.success) {
      const saved = result.data?.details?.saved;
      const status = result.data?.status;
      if (status === 'warning' || saved === 0) {
        setLog({ type: 'warning', message: `News run completed but saved 0 headlines. ${result.data?.message || ''}`.trim() });
      } else {
        setLog({ type: 'success', message: `News fetched! ${result.data.message || 'Success'}` });
      }
    } else {
      setLog({ type: 'error', message: result.error || 'Failed to fetch news' });
    }
    setNewsLoading(false);
  };

  const handleCaseGen = async () => {
    setCaseLoading(true);
    setLog(null);
    const result = await triggerCaseGeneration();
    if (result.success) {
      setLog({ type: 'success', message: `Content generated! ${result.data.message || 'Success'}` });
    } else {
      setLog({ type: 'error', message: result.error || 'Failed to generate content' });
    }
    setCaseLoading(false);
  };

  const handleGrant = async () => {
    setGrantLoading(true);
    setLog(null);
    const days = grantTier === 'free' || grantDuration === 'permanent' ? null : parseInt(grantDuration, 10);
    const result = await grantMembership({ email: grantEmail.trim(), tier: grantTier, days });
    if (result.success && result.data) {
      const exp = result.data.expires_at ? new Date(result.data.expires_at).toLocaleDateString() : 'no expiry';
      setLog({ type: 'success', message: `${result.data.email} is now ${String(result.data.tier).toUpperCase()} · ${exp}.` });
    } else {
      setLog({ type: 'error', message: result.error || 'Failed to update membership.' });
    }
    setGrantLoading(false);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setLog(null);
    const result = await deleteUserByIdentifier({ identifier: deleteId.trim() });
    if (result.success && result.data) {
      setLog({
        type: 'success',
        message: `Deleted ${result.data.email}${result.data.name ? ` (${result.data.name})` : ''} and all their data.`,
      });
      setDeleteId('');
      setDeleteConfirm('');
    } else {
      setLog({ type: 'error', message: result.error || 'Failed to delete user.' });
    }
    setDeleteLoading(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-display-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          Operations
        </h1>
        <p className="text-body text-muted-foreground mt-2">
          God-mode controls for the platform. Pick a section on the left.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Fetch News */}
        <Card className="p-6 border-border bg-card shadow-sm hover:border-primary/20 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Fetch Daily News
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Triggers the backend pipeline to scrape 50+ articles, score them out of 100 via AI, and save the top 10 to Supabase.
              </p>
            </div>
          </div>
          <Button onClick={handleNewsFetch} disabled={newsLoading || caseLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {newsLoading ? 'Fetching...' : 'Run News Fetcher Now'}
          </Button>
        </Card>

        {/* Generate Cases */}
        <Card className="p-6 border-border bg-card shadow-sm hover:border-primary/20 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Generate Case & Guesstimate
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Triggers the gpt-4o generative pipeline to create one highly challenging Case and Guesstimate for today.
              </p>
            </div>
          </div>
          <Button onClick={handleCaseGen} disabled={newsLoading || caseLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {caseLoading ? 'Generating...' : 'Run AI Generator Now'}
          </Button>
        </Card>
      </div>

      {/* Grant / Revoke Membership */}
      <Card className="p-6 border-border bg-card shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            Grant / Revoke Membership
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manually set a user&apos;s tier without payment — for testers, team, or comps. Applies instantly, exactly like a paid upgrade. Choose <span className="font-medium">Free</span> to revoke.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_8rem_9rem_auto]">
          <input
            type="email"
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value)}
            placeholder="user@email.com"
            className="h-10 rounded-md border border-input bg-background px-3 text-body shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <select
            value={grantTier}
            onChange={(e) => setGrantTier(e.target.value as 'free' | 'lite' | 'pro')}
            className="h-10 rounded-md border border-input bg-background px-3 text-body shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="pro">Pro</option>
            <option value="lite">Lite</option>
            <option value="free">Free (revoke)</option>
          </select>
          <select
            value={grantDuration}
            onChange={(e) => setGrantDuration(e.target.value)}
            disabled={grantTier === 'free'}
            className="h-10 rounded-md border border-input bg-background px-3 text-body shadow-sm disabled:opacity-50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">365 days</option>
            <option value="permanent">Permanent</option>
          </select>
          <Button onClick={handleGrant} disabled={grantLoading || !grantEmail.trim()} className="h-10 bg-primary text-primary-foreground hover:bg-primary/90">
            {grantLoading ? 'Applying…' : 'Apply'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Free clears the expiry and ignores duration. Requires <code>SUPABASE_SERVICE_ROLE_KEY</code> in the server env.
        </p>
      </Card>

      {/* Danger zone - delete user */}
      <Card className="p-6 border-destructive/30 bg-destructive/5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete User (Danger Zone)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Permanently removes a user by <span className="font-medium">email</span> or{' '}
            <span className="font-medium">LinkedIn URL</span> &mdash; their login and all data (attempts,
            payments, badges) are erased. <span className="font-medium text-destructive">This cannot be undone.</span>{' '}
            Admin accounts are protected.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_10rem_auto]">
          <input
            type="text"
            value={deleteId}
            onChange={(e) => setDeleteId(e.target.value)}
            placeholder="user@email.com or linkedin.com/in/handle"
            className="h-10 rounded-md border border-input bg-background px-3 text-body shadow-sm focus:border-destructive focus:outline-none focus:ring-1 focus:ring-destructive"
          />
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Type DELETE"
            className="h-10 rounded-md border border-input bg-background px-3 text-body shadow-sm focus:border-destructive focus:outline-none focus:ring-1 focus:ring-destructive"
          />
          <Button
            onClick={handleDelete}
            disabled={deleteLoading || !deleteId.trim() || deleteConfirm !== 'DELETE'}
            className="h-10 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteLoading ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Type <code>DELETE</code> in the second box to enable. Requires <code>SUPABASE_SERVICE_ROLE_KEY</code>.
        </p>
      </Card>

      {log && (
        <div className={`p-4 rounded-lg border flex items-start gap-3 animate-slide-up ${
          log.type === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400'
            : log.type === 'warning'
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
            : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          {log.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            : log.type === 'warning' ? <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            : <XCircle className="h-5 w-5 shrink-0 mt-0.5" />}
          <div className="text-sm font-medium">{log.message}</div>
        </div>
      )}
    </div>
  );
}

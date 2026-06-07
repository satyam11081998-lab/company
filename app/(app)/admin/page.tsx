'use client';

import { useState } from 'react';
import SectionHeader from '@/components/section-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { triggerNewsFetch, triggerCaseGeneration } from './actions';
import { CaseEditor } from './case-editor';

export default function AdminPage() {
  const [newsLoading, setNewsLoading] = useState(false);
  const [caseLoading, setCaseLoading] = useState(false);
  
  const [log, setLog] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);

  const handleNewsFetch = async () => {
    setNewsLoading(true);
    setLog(null);
    const result = await triggerNewsFetch();
    
    if (result.success) {
      // The backend reports status + details.saved; saved=0 means nothing landed in
      // the DB even though the call "succeeded" — surface that as a warning, not success.
      const saved = result.data?.details?.saved;
      const status = result.data?.status;
      if (status === 'warning' || saved === 0) {
        setLog({
          type: 'warning',
          message: `News run completed but saved 0 headlines. ${result.data?.message || ''}`.trim(),
        });
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-display-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-body text-muted-foreground mt-2">
          God-mode controls for the platform. Only visible to admins.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Fetch News Tile */}
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
          <Button 
            onClick={handleNewsFetch} 
            disabled={newsLoading || caseLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {newsLoading ? 'Fetching...' : 'Run News Fetcher Now'}
          </Button>
        </Card>

        {/* Generate Cases Tile */}
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
          <Button 
            onClick={handleCaseGen} 
            disabled={newsLoading || caseLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {caseLoading ? 'Generating...' : 'Run AI Generator Now'}
          </Button>
        </Card>
      </div>

      {/* Log Output */}
      {log && (
        <div className={`p-4 rounded-lg border flex items-start gap-3 animate-slide-up ${
          log.type === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400'
            : log.type === 'warning'
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
            : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          {log.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          ) : log.type === 'warning' ? (
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <div className="text-sm font-medium">
            {log.message}
          </div>
        </div>
      )}

      {/* Case Editor (Phase 4) */}
      <div className="mt-8">
        <CaseEditor />
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Zap,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

type State = 'idle' | 'checking' | 'live' | 'cold' | 'down';

interface Health {
  status?: string;
  openai_key_loaded?: boolean;
  supabase_url_loaded?: boolean;
  supabase_key_loaded?: boolean;
  gnews_key_loaded?: boolean;
  newsapi_key_loaded?: boolean;
  cron_secret_loaded?: boolean;
}

interface DailyToday {
  date?: string;
  case?: { id: string; title: string } | null;
  guesstimate?: { id: string; title: string } | null;
  brief?: { id: string; title: string } | null;
}

async function timedFetch(url: string, timeoutMs: number): Promise<{ res: Response; ms: number }> {
  const start = performance.now();
  const res = await fetch(url, { method: 'GET', cache: 'no-store', signal: AbortSignal.timeout(timeoutMs) });
  return { res, ms: Math.round(performance.now() - start) };
}

export default function AdminStatusPage() {
  const [backend, setBackend] = useState<State>('idle');
  const [backendMs, setBackendMs] = useState<number | null>(null);
  const [backendDetail, setBackendDetail] = useState<string>('');
  const [health, setHealth] = useState<Health | null>(null);

  const [content, setContent] = useState<State>('idle');
  const [daily, setDaily] = useState<DailyToday | null>(null);

  const [headlines, setHeadlines] = useState<State>('idle');
  const [headlineCount, setHeadlineCount] = useState<number | null>(null);

  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [waking, setWaking] = useState(false);

  const checkBackend = useCallback(async (timeoutMs = 12000) => {
    setBackend('checking');
    setBackendDetail('');
    try {
      const { res, ms } = await timedFetch(`${API_URL}/health`, timeoutMs);
      setBackendMs(ms);
      if (!res.ok) {
        setBackend('down');
        setBackendDetail(`HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as Health;
      setHealth(data);
      // A slow-but-OK response means it just cold-started.
      setBackend(ms > 8000 ? 'cold' : 'live');
    } catch (e: any) {
      setBackendMs(null);
      if (e?.name === 'TimeoutError') {
        setBackend('cold');
        setBackendDetail('No response in time — likely asleep. Try “Wake backend”.');
      } else {
        setBackend('down');
        setBackendDetail(e?.message || 'Unreachable');
      }
    }
  }, []);

  const checkContent = useCallback(async () => {
    setContent('checking');
    try {
      const { res } = await timedFetch(`${API_URL}/daily/today`, 15000);
      if (!res.ok) {
        setContent('down');
        return;
      }
      setDaily((await res.json()) as DailyToday);
      setContent('live');
    } catch {
      setContent('down');
    }
  }, []);

  const checkHeadlines = useCallback(async () => {
    setHeadlines('checking');
    try {
      const { res } = await timedFetch(`${API_URL}/news/headlines`, 15000);
      if (!res.ok) {
        setHeadlines('down');
        return;
      }
      const j = (await res.json()) as { headlines?: unknown[]; count?: number };
      setHeadlineCount(j.count ?? j.headlines?.length ?? 0);
      setHeadlines('live');
    } catch {
      setHeadlines('down');
    }
  }, []);

  const runAll = useCallback(async () => {
    await checkBackend();
    await Promise.all([checkContent(), checkHeadlines()]);
    setLastChecked(new Date());
  }, [checkBackend, checkContent, checkHeadlines]);

  const wake = useCallback(async () => {
    setWaking(true);
    await checkBackend(75000); // allow a full Render cold start
    await Promise.all([checkContent(), checkHeadlines()]);
    setLastChecked(new Date());
    setWaking(false);
  }, [checkBackend, checkContent, checkHeadlines]);

  useEffect(() => {
    runAll();
  }, [runAll]);

  const overall: State =
    backend === 'checking' || content === 'checking' || headlines === 'checking'
      ? 'checking'
      : backend === 'down'
      ? 'down'
      : backend === 'cold'
      ? 'cold'
      : 'live';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Service Status
          </h1>
          <p className="text-body text-muted-foreground mt-2">
            Live health of the backend, daily content, and news pipeline.
            {lastChecked && (
              <span className="ml-1">Last checked {lastChecked.toLocaleTimeString()}.</span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button onClick={runAll} variant="outline" className="h-10">
            <RefreshCw className="h-4 w-4 mr-1.5" /> Re-check
          </Button>
          <Button onClick={wake} disabled={waking} className="h-10 bg-primary text-primary-foreground hover:bg-primary/90">
            <Zap className="h-4 w-4 mr-1.5" /> {waking ? 'Waking…' : 'Wake backend'}
          </Button>
        </div>
      </div>

      {/* Overall banner */}
      <div className={`rounded-xl border p-5 flex items-center gap-3 ${bannerClass(overall)}`}>
        <StatePill state={overall} large />
        <div className="text-sm font-medium">{overallMessage(overall)}</div>
      </div>

      {/* Backend */}
      <Card className="p-6 border-border bg-card shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Backend API</h2>
          <StatePill state={backend} />
        </div>
        <p className="text-sm text-muted-foreground break-all">
          {API_URL || '(NEXT_PUBLIC_API_URL not set)'}
          {backendMs != null && <span className="ml-2 text-foreground">· {backendMs} ms</span>}
        </p>
        {backendDetail && <p className="text-sm text-muted-foreground mt-1">{backendDetail}</p>}
        {health && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <KeyFlag label="OpenAI key" ok={health.openai_key_loaded} />
            <KeyFlag label="Supabase URL" ok={health.supabase_url_loaded} />
            <KeyFlag label="Supabase service key" ok={health.supabase_key_loaded} />
            <KeyFlag label="GNews key" ok={health.gnews_key_loaded} />
            <KeyFlag label="NewsAPI key" ok={health.newsapi_key_loaded} />
            <KeyFlag label="Cron secret" ok={health.cron_secret_loaded} />
          </div>
        )}
      </Card>

      {/* Daily content */}
      <Card className="p-6 border-border bg-card shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Today&apos;s Content</h2>
          <StatePill state={content} />
        </div>
        {daily ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">For {daily.date || 'today'}</p>
            <KeyFlag label={`Case${daily.case ? `: ${daily.case.title}` : ''}`} ok={!!daily.case} />
            <KeyFlag label={`Guesstimate${daily.guesstimate ? `: ${daily.guesstimate.title}` : ''}`} ok={!!daily.guesstimate} />
            <KeyFlag label={`GD Brief${daily.brief ? `: ${daily.brief.title}` : ''}`} ok={!!daily.brief} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data — backend may be asleep or the daily cron has not run.</p>
        )}
      </Card>

      {/* Headlines */}
      <Card className="p-6 border-border bg-card shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">News Pipeline</h2>
          <StatePill state={headlines} />
        </div>
        <p className="text-sm text-muted-foreground">
          {headlineCount != null
            ? `${headlineCount} headline${headlineCount === 1 ? '' : 's'} available right now.`
            : 'Could not read headlines.'}
        </p>
      </Card>
    </div>
  );
}

function KeyFlag({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-destructive" />
      )}
      <span className="text-foreground">{label}</span>
    </div>
  );
}

function StatePill({ state, large = false }: { state: State; large?: boolean }) {
  const size = large ? 'h-5 w-5' : 'h-4 w-4';
  const map: Record<State, { label: string; cls: string; icon: React.ReactNode }> = {
    idle: { label: 'Idle', cls: 'text-muted-foreground', icon: <Activity className={size} /> },
    checking: { label: 'Checking…', cls: 'text-muted-foreground', icon: <Loader2 className={`${size} animate-spin`} /> },
    live: { label: 'Live', cls: 'text-green-700 dark:text-green-400', icon: <CheckCircle2 className={size} /> },
    cold: { label: 'Waking', cls: 'text-amber-700 dark:text-amber-400', icon: <AlertTriangle className={size} /> },
    down: { label: 'Down', cls: 'text-destructive', icon: <XCircle className={size} /> },
  };
  const m = map[state];
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold ${m.cls} ${large ? 'text-base' : 'text-sm'}`}>
      {m.icon}
      {m.label}
    </span>
  );
}

function bannerClass(state: State): string {
  switch (state) {
    case 'live':
      return 'bg-green-500/10 border-green-500/20';
    case 'cold':
      return 'bg-amber-500/10 border-amber-500/20';
    case 'down':
      return 'bg-destructive/10 border-destructive/20';
    default:
      return 'bg-muted border-border';
  }
}

function overallMessage(state: State): string {
  switch (state) {
    case 'live':
      return 'All systems live.';
    case 'cold':
      return 'Backend is waking from sleep (free-tier cold start). Give it ~1 minute, or click “Wake backend”.';
    case 'down':
      return 'Backend is not responding. Check the Render deploy logs.';
    case 'checking':
      return 'Running checks…';
    default:
      return 'Idle.';
  }
}

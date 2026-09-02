'use client';

/**
 * Admin · AI providers.
 *
 * Runtime toggle for which provider serves each AI feature (OpenAI / Groq, plus
 * Google for TTS). Reads and writes the FastAPI backend's /admin/ai-providers
 * endpoint, which is the source of truth (table `ai_provider_settings`); the
 * backend resolver picks a change up within ~30s (its cache TTL). No redeploy.
 *
 * The admin gate is the parent layout (server-side is_admin check) PLUS the
 * backend route's own _require_admin — this page is just the surface.
 */

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Cpu, Loader2, Lock, Zap, CircleDot } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Feature = {
  feature: string;
  label: string;
  providers: string[];
  default: string;
  current: string;
  model: string | null;
  groq_available: boolean;
};

const PROVIDER_LABEL: Record<string, string> = {
  openai: 'OpenAI',
  groq: 'Groq',
  google: 'Google',
  realtime: 'Realtime',
  pipeline: 'Pipeline',
};

// Rough $/unit note per provider, shown as a hint so the toggle carries context.
const PROVIDER_NOTE: Record<string, string> = {
  openai: 'Quality baseline',
  groq: '~9× cheaper',
  google: '~3.75× cheaper',
  realtime: 'ChatGPT-style speech-to-speech · pricier',
  pipeline: '~5× cheaper · turn-based',
};

export default function AiProvidersPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null); // feature currently updating

  const authHeader = useCallback(async (): Promise<Record<string, string>> => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await authHeader();
      const res = await fetch(`${API_URL}/admin/ai-providers`, { headers, cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const json = await res.json();
      setFeatures(json.features || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    load();
  }, [load]);

  const setProvider = useCallback(
    async (feature: string, provider: string) => {
      setSaving(feature);
      setError(null);
      // optimistic
      setFeatures((prev) =>
        prev.map((f) => (f.feature === feature ? { ...f, current: provider } : f)),
      );
      try {
        const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };
        const res = await fetch(`${API_URL}/admin/ai-providers`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ feature, provider }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Update failed (${res.status}): ${text || res.statusText}`);
        }
        const json = await res.json();
        setFeatures(json.features || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Update failed');
        await load(); // reconcile with server truth
      } finally {
        setSaving(null);
      }
    },
    [authHeader, load],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">AI providers</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Switch which provider serves each feature — live, no redeploy. Changes take effect within
          about 30 seconds. Groq and Google are the cheaper paths; every one falls back to OpenAI
          automatically on any error, so a toggle can never take a feature down. Scoring is locked to
          OpenAI to protect marking quality.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading providers…
        </div>
      ) : (
        <div className="space-y-3">
          {features.map((f) => {
            const locked = f.providers.length <= 1;
            return (
              <div
                key={f.feature}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <h2 className="text-sm font-semibold text-foreground">{f.label}</h2>
                      {locked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          <Lock className="h-3 w-3" /> Locked
                        </span>
                      )}
                    </div>
                    <p className="mt-1 pl-6 text-xs text-muted-foreground">
                      Live model: <code className="text-[11px]">{f.model || '—'}</code>
                      {f.current !== f.default && (
                        <span className="ml-2 text-amber-600">· overridden (default {PROVIDER_LABEL[f.default]})</span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {saving === f.feature && (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {f.providers.map((p) => {
                      const active = f.current === p;
                      const disabled =
                        locked ||
                        saving === f.feature ||
                        (p === 'groq' && !f.groq_available);
                      return (
                        <button
                          key={p}
                          type="button"
                          disabled={disabled}
                          onClick={() => !active && setProvider(f.feature, p)}
                          title={
                            p === 'groq' && !f.groq_available
                              ? 'GROQ_API_KEY not configured on the backend'
                              : PROVIDER_NOTE[p]
                          }
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                            active
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground'
                          }`}
                        >
                          {active ? <CircleDot className="h-3.5 w-3.5" /> : p === 'openai' ? null : <Zap className="h-3.5 w-3.5" />}
                          {PROVIDER_LABEL[p] || p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {f.providers.includes('groq') && !f.groq_available && !locked && (
                  <p className="mt-2 pl-6 text-[11px] text-amber-600">
                    Groq is unavailable — set <code className="text-[11px]">GROQ_API_KEY</code> on the
                    backend to enable it.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

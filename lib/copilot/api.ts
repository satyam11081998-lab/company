'use client';

// Prep Copilot v2 — isolated frontend API client. Talks ONLY to the isolated
// /copilot/* backend (routes/copilot.py). Shares nothing with the case-solve /
// scorer client; the only common infra is the Supabase auth client and the API
// base URL, which are app-wide.

import { createClient } from '@/lib/supabase/client';
import type { CopilotPack, CopilotScenario, CopilotFeedback, CopilotStatus } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function authHeader(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const headers: Record<string, string> = { ...(await authHeader()) };
  let body: BodyInit | undefined;
  if (init?.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(init.json);
  }
  const res = await fetch(`${API_URL}${path}`, {
    method: init?.method || (init?.json !== undefined ? 'POST' : 'GET'),
    headers,
    body,
    cache: 'no-store',
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }
  if (!res.ok) {
    const detail = (data && (data.detail || data.error)) || `Request failed (${res.status})`;
    throw new Error(typeof detail === 'string' ? detail : `Request failed (${res.status})`);
  }
  return data as T;
}

export function getCopilotStatus(): Promise<CopilotStatus> {
  return req<CopilotStatus>('/copilot/status');
}

export function buildPack(role: string, company: string, forceRefresh = false): Promise<{ pack: CopilotPack }> {
  return req<{ pack: CopilotPack }>('/copilot/pack', { json: { role, company, force_refresh: forceRefresh } });
}

export function startPractice(
  role: string, company: string, focus = '', difficulty = '',
): Promise<{ run_id: string; scenario: CopilotScenario; pack: CopilotPack }> {
  return req('/copilot/practice/start', { json: { role, company, focus, difficulty } });
}

export function sendPracticeMessage(runId: string, content: string): Promise<{ reply: string }> {
  return req<{ reply: string }>('/copilot/practice/message', { json: { run_id: runId, content } });
}

export function submitPractice(runId: string): Promise<{ feedback: CopilotFeedback; solution_outline: string }> {
  return req('/copilot/practice/submit', { json: { run_id: runId } });
}

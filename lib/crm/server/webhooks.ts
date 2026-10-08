/**
 * Outbound webhooks (workflow / blueprint / approval actions).
 *
 * SSRF protection, all enforced here at request time (not just when the URL
 * was saved):
 *  - https only, port 443, no credentials in the URL;
 *  - the hostname is resolved by a custom `lookup` that refuses loopback,
 *    private, link-local (incl. 169.254.169.254 metadata), CGNAT, multicast
 *    and reserved addresses. Because the check runs inside the socket
 *    connect, a DNS answer that changes between "check" and "connect"
 *    (rebinding) can't slip through;
 *  - redirects are never followed; 5 s timeout; response body discarded
 *    (first 1 KB read, then the socket is destroyed);
 *  - at most 60 calls per webhook per minute.
 * Each request is signed: X-MECE-Signature: sha256=<hex HMAC of the body>.
 * Only the host, status and timing are logged — never the payload.
 */
import { createHmac, randomBytes } from 'crypto';
import { lookup as dnsLookup, type LookupAddress } from 'dns';
import https from 'https';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isIpLiteral, isPrivateIp, type WebhookConfig } from '@/lib/crm/automation';
import type { CrmRecord } from '@/lib/crm/types';

export const newWebhookSecret = () => randomBytes(24).toString('base64url');

type LookupCb = (err: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void;

/** dns.lookup that refuses private addresses (used inside the TLS socket connect). */
function guardedLookup(hostname: string, options: { all?: boolean } | number | LookupCb, cb?: LookupCb) {
  const callback = (typeof options === 'function' ? options : cb) as LookupCb;
  const opts = typeof options === 'object' && options ? options : {};
  dnsLookup(hostname, { all: true }, (err, addresses) => {
    if (err) return callback(err, opts.all ? [] : '', 4);
    const list = addresses as LookupAddress[];
    if (!list.length || list.some((a) => isPrivateIp(a.address))) {
      const e = new Error(`refused: ${hostname} resolves to a private or reserved address`) as NodeJS.ErrnoException;
      e.code = 'EPRIVATE';
      return callback(e, opts.all ? [] : '', 4);
    }
    if (opts.all) return callback(null, list);
    return callback(null, list[0].address, list[0].family);
  });
}

export interface PostResult { ok: boolean; status: number | null; ms: number; error?: string; host: string }

/** POST JSON to an https URL with the SSRF guard. Never throws. */
export function safePost(rawUrl: string, body: string, headers: Record<string, string>, timeoutMs = 5000): Promise<PostResult> {
  const started = Date.now();
  let u: URL;
  try { u = new URL(rawUrl); } catch { return Promise.resolve({ ok: false, status: null, ms: 0, error: 'bad url', host: '' }); }
  const host = u.hostname.toLowerCase();
  const fail = (error: string): PostResult => ({ ok: false, status: null, ms: Date.now() - started, error, host });
  if (u.protocol !== 'https:' || (u.port && u.port !== '443') || u.username || u.password) return Promise.resolve(fail('only https on port 443 is allowed'));
  if (isIpLiteral(host) && isPrivateIp(host)) return Promise.resolve(fail('private address refused'));
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return Promise.resolve(fail('internal host refused'));
  return new Promise((resolve) => {
    let done = false;
    const finish = (r: PostResult) => { if (!done) { done = true; resolve(r); } };
    const req = https.request(
      {
        protocol: 'https:', hostname: u.hostname, port: 443, path: `${u.pathname}${u.search}`, method: 'POST',
        headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body).toString(), 'user-agent': 'MECE-CRM-Webhook/1.0', ...headers },
        lookup: guardedLookup as unknown as typeof dnsLookup,
        timeout: timeoutMs,
        agent: false,
      },
      (res) => {
        let seen = 0;
        res.on('data', (chunk: Buffer) => { seen += chunk.length; if (seen > 1024) res.destroy(); });
        res.on('end', () => finish({ ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300, status: res.statusCode ?? null, ms: Date.now() - started, host }));
        res.on('close', () => finish({ ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300, status: res.statusCode ?? null, ms: Date.now() - started, host }));
        // 3xx is reported as not ok and never followed
      },
    );
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    req.on('error', (e: NodeJS.ErrnoException) => finish(fail(e.code === 'EPRIVATE' ? 'private address refused' : (e.message || 'request failed').slice(0, 200))));
    req.end(body);
  });
}

export function signBody(secret: string, body: string, ts: string): string {
  return 'sha256=' + createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex');
}

/** Fire a configured webhook for a record. Logs the outcome; never throws. */
export async function callWebhook(svc: SupabaseClient, webhookId: string, rec: CrmRecord | null, event: string): Promise<PostResult | null> {
  try {
    const { data } = await svc.from('crm_config').select('id, name, active, config').eq('id', webhookId).eq('kind', 'webhook').maybeSingle();
    const hook = data as { id: string; name: string; active: boolean; config: WebhookConfig } | null;
    if (!hook || !hook.active || !hook.config?.url || !hook.config.secret) return null;
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await svc.from('crm_webhook_log').select('id', { count: 'exact', head: true }).eq('webhook_id', hook.id).gte('at', since);
    if ((count ?? 0) >= 60) {
      await svc.from('crm_webhook_log').insert({ webhook_id: hook.id, record_id: rec?.id ?? null, host: new URL(hook.config.url).hostname, ok: false, error: 'rate limited (60/min)' });
      return null;
    }
    const fields: Record<string, unknown> = {};
    for (const f of hook.config.fields ?? []) if (rec && f in rec.data) fields[f] = rec.data[f];
    const ts = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({
      event, webhook: hook.name, sent_at: new Date().toISOString(),
      record: rec ? { id: rec.id, module: rec.module, name: rec.name, owner_id: rec.owner_id, fields } : null,
    });
    const r = await safePost(hook.config.url, body, { 'x-mece-signature': signBody(hook.config.secret, body, ts), 'x-mece-timestamp': ts, 'x-mece-event': event });
    await svc.from('crm_webhook_log').insert({ webhook_id: hook.id, record_id: rec?.id ?? null, host: r.host, status: r.status, ok: r.ok, ms: r.ms, error: r.error ?? null });
    return r;
  } catch (e) {
    console.error('[crm] webhook failed:', e);
    return null;
  }
}

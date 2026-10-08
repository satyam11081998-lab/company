/**
 * Email templates: a deliberately small markup language, so a template can
 * never inject raw HTML or script into an email, and merge values are always
 * escaped.
 *
 *   Hi {{first_name}},                      → merge field (escaped)
 *   **bold**  _italic_  [label](https://…)  → only http(s) links
 *   blank line                               → new paragraph
 *   - item                                   → bullet
 *
 * Pure.
 */

export interface TemplateConfig {
  subject: string;
  heading?: string;
  body: string;
  cta?: { label: string; url: string } | null;
  category?: 'marketing' | 'service';
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const MERGE_RE = /\{\{\s*([a-z][a-z0-9_.]{0,60})\s*\}\}/gi;

/** Replace {{field}} with values. `escape` decides HTML-escaping (true for bodies). */
export function merge(text: string, values: Record<string, unknown>, escape: boolean): string {
  return text.replace(MERGE_RE, (_, key: string) => {
    const k = key.toLowerCase();
    const v = Object.prototype.hasOwnProperty.call(values, k) ? values[k] : undefined;
    const s = v === null || v === undefined ? '' : Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? '' : String(v);
    return escape ? escapeHtml(s) : s.replace(/[\r\n]+/g, ' ');
  });
}

export function mergeFieldsIn(text: string): string[] {
  return [...new Set([...text.matchAll(MERGE_RE)].map((m) => m[1].toLowerCase()))];
}

const SAFE_URL = /^https?:\/\/[^\s<>"']+$/i;

/** Inline markup on already-escaped text. */
function inline(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,!?]|$)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]{1,200})\]\(([^)\s]{1,2000})\)/g, (m, label: string, url: string) => {
      const u = url.replace(/&amp;/g, '&');
      if (!SAFE_URL.test(u)) return label;
      return `<a href="${escapeHtml(u)}" style="color:#C8102E;text-decoration:underline">${label}</a>`;
    });
}

/** Template body → safe HTML (paragraphs, bullets, inline markup). */
export function bodyToHtml(body: string): string {
  const blocks = body.replace(/\r\n/g, '\n').split(/\n{2,}/);
  return blocks
    .map((b) => {
      const lines = b.split('\n').filter((l) => l.trim() !== '');
      if (!lines.length) return '';
      if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
        return `<ul style="margin:0 0 16px;padding-left:20px">${lines.map((l) => `<li style="margin:0 0 6px">${inline(escapeHtml(l.replace(/^\s*[-*]\s+/, '')))}</li>`).join('')}</ul>`;
      }
      return `<p style="margin:0 0 16px">${lines.map((l) => inline(escapeHtml(l))).join('<br>')}</p>`;
    })
    .join('');
}

/** Body text → plain text (links shown as "label (url)"). */
export function bodyToText(body: string): string {
  return body
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, l, u) => (SAFE_URL.test(u) ? `${l} (${u})` : l))
    .trim();
}

/**
 * Render a template body against merge values. Merge happens on the raw text
 * BEFORE markup is applied, and each value is markup-neutralised, so a
 * customer whose name is "**[click](http://evil)**" can't add a link.
 */
export function renderBody(body: string, values: Record<string, unknown>): { html: string; text: string } {
  const neutral: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(values)) {
    neutral[k] = typeof v === 'string' ? v.replace(/[*_[\]()]/g, (c) => `​${c}`) : v;
  }
  const merged = merge(body, neutral, false);
  return { html: bodyToHtml(merged), text: bodyToText(merge(body, values, false)) };
}

/** Rewrite every <a href> to a tracked URL. Returns the HTML and the original links. */
export function trackLinks(html: string, trackUrl: (index: number) => string): { html: string; links: string[] } {
  const links: string[] = [];
  const out = html.replace(/<a href="([^"]+)"/g, (_, href: string) => {
    const real = href.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    links.push(real);
    return `<a href="${escapeHtml(trackUrl(links.length - 1))}"`;
  });
  return { html: out, links };
}

export function validateTemplate(raw: unknown): TemplateConfig {
  const r = (raw ?? {}) as Partial<TemplateConfig>;
  const subject = String(r.subject ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 200);
  const body = String(r.body ?? '').slice(0, 20_000);
  if (!subject) throw new Error('A subject is required.');
  if (!body.trim()) throw new Error('A body is required.');
  let cta: TemplateConfig['cta'] = null;
  if (r.cta && r.cta.label && r.cta.url) {
    const url = String(r.cta.url).trim();
    if (!SAFE_URL.test(url) && !/\{\{\s*survey_link\s*\}\}/.test(url)) throw new Error('The button link must start with http:// or https://');
    cta = { label: String(r.cta.label).slice(0, 60), url: url.slice(0, 2000) };
  }
  return { subject, heading: r.heading ? String(r.heading).slice(0, 200) : undefined, body, cta, category: r.category === 'service' ? 'service' : 'marketing' };
}

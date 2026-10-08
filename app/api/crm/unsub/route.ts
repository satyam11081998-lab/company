import { crmUnsubscribe, verify } from '@/lib/crm/server/outbox';

export const dynamic = 'force-dynamic';

const page = (title: string, body: string, form = '') => new Response(
  `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="robots" content="noindex"/><title>${title}</title></head>
<body style="font-family:Inter,Helvetica,Arial,sans-serif;background:#F7F8FA;margin:0;padding:48px 16px;color:#0F172A">
<div style="max-width:440px;margin:0 auto;background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:28px">
<p style="margin:0 0 12px;font-weight:700;color:#0B1F3A">MECE</p><h1 style="font-size:20px;margin:0 0 8px">${title}</h1><p style="margin:0;color:#475569;line-height:1.5">${body}</p>${form}</div></body></html>`,
  { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } },
);

const valid = (t: string) => {
  const [id, sig] = t.split('.');
  return /^[0-9a-f-]{36}$/i.test(id ?? '') && verify('u.' + id, sig ?? '');
};

/**
 * CRM unsubscribe for people who are not MECE users (leads, B2B contacts).
 * GET only shows a confirm button: mail scanners pre-fetch links, and a GET
 * that unsubscribed would opt people out without them asking. POST does it,
 * which also serves RFC 8058 one-click (List-Unsubscribe-Post).
 */
export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get('t') ?? '';
  if (!valid(t)) return page('Link not valid', 'This unsubscribe link is not valid or has expired.');
  const esc = t.replace(/[^A-Za-z0-9._-]/g, '');
  return page('Unsubscribe from MECE emails?', 'You will stop getting marketing emails from MECE. Replies to your support requests still reach you.',
    `<form method="post" action="/api/crm/unsub?t=${esc}" style="margin-top:20px"><button type="submit" style="background:#C8102E;color:#fff;border:0;border-radius:8px;padding:10px 18px;font-weight:600;font-size:15px;cursor:pointer">Unsubscribe</button></form>`);
}

export async function POST(req: Request) {
  const t = new URL(req.url).searchParams.get('t') ?? '';
  if (!valid(t)) return page('Link not valid', 'This unsubscribe link is not valid or has expired.');
  const ok = await crmUnsubscribe(t).catch(() => false);
  return ok
    ? page('You are unsubscribed', 'You won’t get marketing emails from MECE any more. If this was a mistake, reply to any of our emails.')
    : page('Something went wrong', 'We could not unsubscribe you. Please reply to our email and we will do it by hand.');
}

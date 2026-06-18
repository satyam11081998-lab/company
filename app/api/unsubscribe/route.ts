import { NextResponse } from 'next/server';
import { verifyUnsubToken } from '@/lib/email/send';
import { createServiceClient } from '@/lib/supabase/service';

// Public route (also listed in PUBLIC_ROUTES so middleware doesn't redirect it).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function page(title: string, message: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title} — MECE</title></head>
<body style="margin:0;background:#FAF9F6;font-family:Inter,Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:64px auto;background:#fff;border:1px solid #E7E3DC;border-radius:14px;padding:36px 32px;text-align:center;">
    <div style="font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#0F1C33;"><span style="color:#C8102E;">M</span>ECE</div>
    <h1 style="font-size:18px;color:#0F1C33;margin:22px 0 8px;">${title}</h1>
    <p style="font-size:14px;color:#5B6472;line-height:1.6;margin:0;">${message}</p>
    <a href="https://mece.in" style="display:inline-block;margin-top:24px;color:#C8102E;font-size:14px;text-decoration:none;font-weight:600;">Back to MECE &rarr;</a>
  </div>
</body></html>`;
}

function html(body: string, status: number) {
  return new NextResponse(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');
  const userId = verifyUnsubToken(token);
  if (!userId) {
    return html(
      page('Link invalid or expired', 'This unsubscribe link could not be verified. You can manage email preferences from your profile, or email team@mece.in.'),
      400,
    );
  }
  try {
    const db = createServiceClient();
    await db.from('users').update({ marketing_opt_out: true }).eq('id', userId);
  } catch (e) {
    console.error('[unsubscribe] update failed:', e);
    return html(
      page('Something went wrong', 'We could not update your preferences right now. Please try again shortly, or email team@mece.in.'),
      500,
    );
  }
  return html(
    page("You're unsubscribed", 'You will no longer receive product updates or promotional emails from MECE. You will still receive important account and payment emails.'),
    200,
  );
}

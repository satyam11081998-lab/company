import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { UserRow } from '@/lib/types';
import {
  validateCertificate, stripDashes, PRINTED_FIELDS,
  type CertificateInput,
} from '@/lib/certificates';

export const dynamic = 'force-dynamic';

/**
 * Admin certificate issuance.
 *
 *   GET  /api/admin/certificates?q=&limit=   list, newest first
 *   POST /api/admin/certificates             issue one
 *
 * Both are admin-gated here as well as by the /admin layout, because the layout
 * only guards the PAGE. These routes are reachable directly with a plain
 * cookie, so the check has to live in the handler too.
 */

/** Shared guard. Returns a response to bail with, or the caller's user id. */
async function requireAdmin(): Promise<{ error: NextResponse } | { userId: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  }
  const { data: profile } = await supabase
    .from('users').select('is_admin').eq('id', user.id).single();
  if (!(profile as Partial<UserRow>)?.is_admin) {
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
  }
  return { userId: user.id };
}

const SELECT_COLUMNS =
  'id, cert_id, recipient_name, recipient_program, recipient_email, cert_title, ' +
  'role_title, project_title, start_date, end_date, duration_label, engagement_mode, ' +
  'reporting_to, scope_line, work_notes, engagement_type, sig1_name, sig1_title, ' +
  'sig2_name, sig2_title, issued_at, revoked_at, revoked_reason, created_at, updated_at';

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim().slice(0, 120);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 100, 1), 300);

  const svc = createServiceClient();
  let query = svc.from('certificates').select(SELECT_COLUMNS)
    .order('created_at', { ascending: false }).limit(limit);

  if (q) {
    // Escape PostgREST's or() metacharacters so a search string cannot be used
    // to inject extra filter terms.
    const safe = q.replace(/[(),*]/g, ' ').trim();
    if (safe) query = query.or(`recipient_name.ilike.%${safe}%,cert_id.ilike.%${safe}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ certificates: data ?? [] });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  const body = (await req.json().catch(() => null)) as Partial<CertificateInput> | null;
  if (!body) return NextResponse.json({ error: 'bad_json' }, { status: 400 });

  // Normalise before validating so a pasted en dash is repaired rather than
  // bounced back at the admin.
  const clean: Record<string, unknown> = { ...body };
  for (const field of PRINTED_FIELDS) {
    const v = clean[field];
    if (typeof v === 'string') clean[field] = stripDashes(v);
  }

  const issues = validateCertificate(clean as Partial<CertificateInput>);
  if (issues.length) return NextResponse.json({ error: 'invalid', issues }, { status: 422 });

  const svc = createServiceClient();

  // Server-generated. A client-supplied cert_id would let an admin overwrite an
  // existing certificate's identity, so the field is never read from the body.
  const { data: idData, error: idError } = await svc.rpc('generate_certificate_id', {});
  if (idError || !idData) {
    return NextResponse.json(
      { error: idError?.message || 'cert_id_generation_failed' }, { status: 500 },
    );
  }

  const row = {
    cert_id: idData as string,
    recipient_name: String(clean.recipient_name).trim(),
    recipient_program: (clean.recipient_program as string | null) || null,
    recipient_email: (clean.recipient_email as string | null) || null,
    cert_title: String(clean.cert_title).trim(),
    role_title: String(clean.role_title).trim(),
    project_title: String(clean.project_title).trim(),
    start_date: clean.start_date as string,
    end_date: clean.end_date as string,
    duration_label: (clean.duration_label as string | null) || null,
    engagement_mode: (clean.engagement_mode as string | null) || null,
    reporting_to: (clean.reporting_to as string | null) || null,
    scope_line: String(clean.scope_line).trim(),
    work_notes: (clean.work_notes as string | null) || null,
    engagement_type: (clean.engagement_type as string | null) || null,
    sig1_name: String(clean.sig1_name).trim(),
    sig1_title: String(clean.sig1_title).trim(),
    sig2_name: String(clean.sig2_name).trim(),
    sig2_title: String(clean.sig2_title).trim(),
    created_by: guard.userId,
  };

  const { data, error } = await svc
    .from('certificates').insert(row).select(SELECT_COLUMNS).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ certificate: data }, { status: 201 });
}

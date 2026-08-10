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
 * PATCH /api/admin/certificates/:id   edit, revoke or reinstate.
 *
 * Certificates are never deleted. A revoked row keeps its cert_id so the
 * verification page can say "this was issued and then revoked" rather than
 * "no such certificate", which is the answer a recruiter actually needs.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SELECT_COLUMNS =
  'id, cert_id, recipient_name, recipient_program, recipient_email, cert_title, ' +
  'role_title, project_title, start_date, end_date, duration_label, engagement_mode, ' +
  'reporting_to, scope_line, work_notes, engagement_type, sig1_name, sig1_title, ' +
  'sig2_name, sig2_title, issued_at, revoked_at, revoked_reason, created_at, updated_at';

/** Columns an admin may change. cert_id and created_by are deliberately absent. */
const EDITABLE = [
  'recipient_name', 'recipient_program', 'recipient_email', 'cert_title',
  'role_title', 'project_title', 'start_date', 'end_date', 'duration_label',
  'engagement_mode', 'reporting_to', 'scope_line', 'work_notes',
  'engagement_type', 'sig1_name', 'sig1_title', 'sig2_name', 'sig2_title',
] as const;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('users').select('is_admin').eq('id', user.id).single();
  if (!(profile as Partial<UserRow>)?.is_admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: 'bad_id' }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as
    | (Partial<CertificateInput> & { revoked?: boolean; revoked_reason?: string | null })
    | null;
  if (!body) return NextResponse.json({ error: 'bad_json' }, { status: 400 });

  const svc = createServiceClient();
  const patch: Record<string, unknown> = {};

  // ── revoke / reinstate ────────────────────────────────────────────────
  if (typeof body.revoked === 'boolean') {
    patch.revoked_at = body.revoked ? new Date().toISOString() : null;
    patch.revoked_reason = body.revoked ? (body.revoked_reason || null) : null;
  }

  // ── field edits ───────────────────────────────────────────────────────
  const touched = EDITABLE.filter((k) => k in body);
  if (touched.length) {
    const { data: existing, error: readErr } = await svc
      .from('certificates').select(SELECT_COLUMNS).eq('id', params.id).single();
    if (readErr || !existing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    // Validate the MERGED row. Validating the patch alone would let a partial
    // update (say, only end_date) slip past the date-ordering rule.
    const merged: Record<string, unknown> = {
      ...(existing as unknown as Record<string, unknown>),
    };
    for (const key of touched) {
      const raw = (body as Record<string, unknown>)[key];
      const value = typeof raw === 'string'
        && (PRINTED_FIELDS as readonly string[]).includes(key)
        ? stripDashes(raw)
        : raw;
      merged[key] = value;
      patch[key] = typeof value === 'string' && value.trim() === '' ? null : value;
    }

    const issues = validateCertificate(merged as Partial<CertificateInput>);
    if (issues.length) return NextResponse.json({ error: 'invalid', issues }, { status: 422 });
  }

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }

  const { data, error } = await svc
    .from('certificates').update(patch).eq('id', params.id).select(SELECT_COLUMNS).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return NextResponse.json({ certificate: data });
}

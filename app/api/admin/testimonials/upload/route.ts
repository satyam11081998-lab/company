import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { UserRow } from '@/lib/types';

export const dynamic = 'force-dynamic';

// POST /api/admin/testimonials/upload  (multipart form-data: file)
// Admin-gated. Uploads to the public `testimonials` bucket via service role,
// returns a public URL to store on a testimonial/team row.
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!(profile as Partial<UserRow>)?.is_admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'no_file' }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'too_large' }, { status: 413 });

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `people/${crypto.randomUUID()}.${ext}`;

  const svc = createServiceClient();
  const { error } = await svc.storage
    .from('testimonials')
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = svc.storage.from('testimonials').getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl }, { status: 201 });
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPublishedTestimonials, getTeamMembers } from '@/lib/testimonials';

export const dynamic = 'force-dynamic';

// GET /api/testimonials?type=testimonial | team
export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') ?? 'testimonial';
  const supabase = createClient();

  if (type === 'team') {
    const items = await getTeamMembers(supabase);
    return NextResponse.json({ items });
  }
  const items = await getPublishedTestimonials(supabase);
  return NextResponse.json({ items });
}

// POST /api/testimonials  → user submission (status: pending)
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  // Honeypot — pretend success, store nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const name = (body.name ?? '').toString().trim();
  const quote = (body.quote ?? '').toString().trim();
  if (!name || !quote) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

  const supabase = createClient();
  const { error } = await supabase.from('testimonials').insert({
    name: name.slice(0, 120),
    school: (body.school ?? '').toString().slice(0, 160),
    placement: (body.placement ?? '').toString().slice(0, 200),
    quote: quote.slice(0, 600),
    linkedin_url: (body.linkedin_url ?? '').toString().slice(0, 300) || null,
    submitted_email: (body.submitted_email ?? '').toString().slice(0, 200) || null,
    status: 'pending', // RLS requires pending + user for anon/authed inserts
    source: 'user',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

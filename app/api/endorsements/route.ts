import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPublishedEndorsements } from '@/lib/endorsements';

export const dynamic = 'force-dynamic';

// GET /api/endorsements → published endorsements, curated order.
export async function GET() {
  const supabase = createClient();
  const items = await getPublishedEndorsements(supabase);
  return NextResponse.json({ items });
}

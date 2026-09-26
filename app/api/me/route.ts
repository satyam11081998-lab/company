import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAdminPreview } from '@/lib/admin-preview';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { data: userRow, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (error || !userRow) {
    return NextResponse.json({ error: 'user not found' }, { status: 404 });
  }
  // Keeps an admin's US preview (display only) across client refreshes.
  return NextResponse.json(withAdminPreview(userRow as { is_admin: boolean; market?: 'IN' | 'US' | 'EU' | null }));
}

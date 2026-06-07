import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { writeForUser } from '@/lib/dashboard/snapshot-writer';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Iterate all users who have active submissions in the last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data: activeUsers } = await supabase
    .from('submissions')
    .select('user_id')
    .gte('created_at', fourteenDaysAgo.toISOString());

  if (!activeUsers) {
    return NextResponse.json({ success: true, processed: 0 });
  }

  const uniqueUsers = Array.from(new Set(activeUsers.map(u => u.user_id)));

  let processed = 0;
  for (const userId of uniqueUsers) {
    try {
      await writeForUser(supabase, userId as string);
      processed++;
    } catch (e) {
      console.error(`Failed to write snapshot for ${userId}`, e);
    }
  }

  return NextResponse.json({ success: true, processed });
}

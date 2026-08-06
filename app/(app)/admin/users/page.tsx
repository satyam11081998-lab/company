import { createServiceClient } from '@/lib/supabase/service';
import UsersAdminClient, { type AdminUserRow, type SignupBucket } from './users-admin-client';

// Admin gating happens in the parent admin layout (users.is_admin).
export const dynamic = 'force-dynamic';

const LIST_LIMIT = 1000;
const CHART_DAYS = 30;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * `YYYY-MM-DD` for the IST calendar day containing `t`.
 *
 * Shift into IST first, THEN read the UTC date parts — that gives the IST day
 * regardless of what timezone the server happens to run in (UTC on Vercel,
 * IST on a local dev machine). Never mix this with a raw `toISOString()` date.
 */
function istDayKey(t: string | number | Date): string {
  return new Date(new Date(t).getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export default async function AdminUsersPage() {
  const svc = createServiceClient();

  const { data, error } = await svc
    .from('users')
    .select(
      'id, name, full_name, email, avatar_url, created_at, points, streak_count, ' +
      'subscription_tier, subscription_expires_at, is_admin, is_demo, ' +
      'college_id, college_other, batch_year, linkedin_url, onboarding_completed_at',
    )
    .order('created_at', { ascending: false })
    .limit(LIST_LIMIT);

  const raw = (data as Record<string, any>[] | null) || [];

  // College labels, resolved in one round-trip rather than per row.
  const collegeIds = Array.from(
    new Set(raw.map((u) => u.college_id).filter((v): v is string => !!v)),
  );
  const collegeNames = new Map<string, string>();
  if (collegeIds.length > 0) {
    const { data: cs } = await svc
      .from('colleges').select('id, short_name, name').in('id', collegeIds);
    for (const c of (cs as { id: string; short_name: string | null; name: string | null }[] | null) || []) {
      collegeNames.set(c.id, c.short_name || c.name || '');
    }
  }

  const users: AdminUserRow[] = raw.map((u) => ({
    id: u.id,
    name: u.name || u.full_name || null,
    email: u.email,
    avatarUrl: u.avatar_url ?? null,
    createdAt: u.created_at,
    points: u.points ?? 0,
    streak: u.streak_count ?? 0,
    tier: u.subscription_tier ?? 'free',
    expiresAt: u.subscription_expires_at ?? null,
    isAdmin: !!u.is_admin,
    isDemo: !!u.is_demo,
    college: u.college_id ? (collegeNames.get(u.college_id) || null) : (u.college_other || null),
    batchYear: u.batch_year ?? null,
    linkedinUrl: u.linkedin_url ?? null,
    onboarded: !!u.onboarding_completed_at,
  }));

  // Signups per day for the last 30 days, computed from the rows we already
  // hold — no second query, and it stays correct if LIST_LIMIT truncates older
  // history (the window is 30 days, the list is the newest 1000 accounts).
  //
  // Bucketed by IST DAY on BOTH sides. The previous version mixed two clocks:
  // bucket keys came from `setHours(0,0,0,0)` (server-local midnight) then
  // `toISOString()` (UTC), while user keys were raw UTC. On an IST server the
  // two are a day apart, so every bucket was shifted and TODAY's signups fell
  // outside the map entirely — the chart rendered blank on the exact day you
  // most want to look at it. IST is also the right unit: the rest of the app
  // (daily_schedule, streaks) already runs on an IST day boundary.
  const buckets: SignupBucket[] = [];
  for (let i = CHART_DAYS - 1; i >= 0; i--) {
    buckets.push({ date: istDayKey(Date.now() - i * 86_400_000), count: 0 });
  }
  const byDate = new Map(buckets.map((b) => [b.date, b]));
  for (const u of users) {
    const bucket = byDate.get(istDayKey(u.createdAt));
    if (bucket) bucket.count += 1;
  }

  return (
    <UsersAdminClient
      users={users}
      signups={buckets}
      truncated={raw.length >= LIST_LIMIT}
      loadError={error?.message ?? null}
    />
  );
}

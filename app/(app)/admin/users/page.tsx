import { createServiceClient } from '@/lib/supabase/service';
import UsersAdminClient, { type AdminUserRow, type SignupBucket } from './users-admin-client';

// Admin gating happens in the parent admin layout (users.is_admin).
export const dynamic = 'force-dynamic';

const LIST_LIMIT = 1000;
const CHART_DAYS = 30;

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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets: SignupBucket[] = [];
  for (let i = CHART_DAYS - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    buckets.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  const byDate = new Map(buckets.map((b) => [b.date, b]));
  for (const u of users) {
    const key = new Date(u.createdAt).toISOString().slice(0, 10);
    const bucket = byDate.get(key);
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

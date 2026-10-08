'use client';

/**
 * The skeleton for whatever page is loading, picked from the URL the user is
 * going to (Next.js has already switched the URL when this shows): a list for
 * /crm/m/<module>, a record for /crm/m/<module>/<id> or /new, a page otherwise.
 */
import { usePathname } from 'next/navigation';
import { ListSkeleton, PageSkeleton, RecordSkeleton } from './skeletons';

export default function RouteSkeleton() {
  const path = usePathname() ?? '';
  const m = path.match(/^\/crm\/m\/[^/]+(\/[^/]+)?/);
  if (m && !m[1]) return <ListSkeleton />;
  if (m && m[1] && m[1] !== '/import') return <RecordSkeleton />;
  return <PageSkeleton />;
}

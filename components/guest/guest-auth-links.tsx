'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toPublicPathname } from '@/lib/public-pathname';
import { isReturnDestination } from '@/lib/after-onboarding';

/**
 * "Log in" / "Get started" in the logged-out header (GuestChrome).
 *
 * On a case page they carry ?next=/cases/<id> (2026-10-07): someone who opens a
 * case and signs up from the header came to solve THAT case, so login/sign-up,
 * the email-confirmation link and onboarding all bring them back to it instead
 * of the dashboard. Everywhere else the links are exactly what they were — the
 * prerendered Casebook copy included (toPublicPathname maps its build-time
 * path, so the HTML is unchanged).
 */
export default function GuestAuthLinks() {
  const path = toPublicPathname(usePathname());
  const q =
    path && isReturnDestination(path) && path.startsWith('/cases/') ? `?next=${encodeURIComponent(path)}` : '';
  return (
    <>
      <Link href={`/login${q}`} className="hidden sm:block">
        <button className="text-[15px] font-medium text-muted-foreground hover:text-foreground px-4 py-2 transition-colors">
          Log in
        </button>
      </Link>
      <Link href={`/signup${q}`}>
        <button className="btn-primary text-sm md:text-[15px] py-1.5 px-4 md:py-2 md:px-6 whitespace-nowrap shadow-sm">
          Get started
        </button>
      </Link>
    </>
  );
}

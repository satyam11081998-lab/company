import Link from 'next/link';
import { Globe } from 'lucide-react';

/**
 * Thin bar shown across the app while an admin previews the US version
 * (lib/admin-preview.ts). Server component: plain links + a native form POST,
 * so "Exit" does a full reload back to the admin's real (India) view.
 */
export default function UsPreviewBar() {
  return (
    <div className="w-full border-b border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-1.5 text-xs">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <Globe className="h-3.5 w-3.5" /> Admin preview: US version
        </span>
        <span className="hidden text-amber-800/80 dark:text-amber-200/80 sm:inline">
          US case bank, US daily, USD plans. Your account is unchanged; checkout is off.
        </span>
        <nav className="flex flex-wrap items-center gap-3">
          <Link href="/practice" className="underline-offset-2 hover:underline">Practice</Link>
          <Link href="/upgrade/intl" className="underline-offset-2 hover:underline">US plans</Link>
          <a href="/us" target="_blank" rel="noopener" className="underline-offset-2 hover:underline">US landing ↗</a>
          <Link href="/admin/us-market" className="underline-offset-2 hover:underline">Admin</Link>
        </nav>
        <form method="post" action="/api/admin/us-preview" className="ml-auto">
          <input type="hidden" name="mode" value="off" />
          <input type="hidden" name="to" value="/admin/us-market" />
          <button type="submit" className="rounded border border-amber-400 px-2 py-0.5 font-semibold hover:bg-amber-100 dark:border-amber-600 dark:hover:bg-amber-900">
            Exit preview
          </button>
        </form>
      </div>
    </div>
  );
}

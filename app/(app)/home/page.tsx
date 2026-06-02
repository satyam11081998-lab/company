// DELIVERABLE — /home is now a permanent redirect into the merged dashboard.
// Keeps old links, bookmarks, and any missed references alive (no 404s).
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  redirect('/dashboard');
}

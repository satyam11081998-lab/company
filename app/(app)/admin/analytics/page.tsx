import { redirect } from 'next/navigation';

/** Analytics now lives at /admin/journeys — single unified dashboard. */
export default function AdminAnalyticsPage() {
  redirect('/admin/journeys');
}

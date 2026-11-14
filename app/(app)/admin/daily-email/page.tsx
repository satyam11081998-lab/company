import type { Metadata } from 'next';
import DailyEmailClient from './client';

export const metadata: Metadata = { title: 'Daily email · MECE admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default function DailyEmailPage() {
  return <DailyEmailClient />;
}

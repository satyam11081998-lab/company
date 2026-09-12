import type { Metadata } from 'next';
import FeedbackPublicForm from './feedback-public-form';

export const metadata: Metadata = {
  title: 'Share your feedback — MECE',
  description:
    'Tell the MECE team what is working and what would make your case-interview prep better. Takes a minute.',
  robots: { index: false, follow: false }, // utility page — keep out of search
};

export const dynamic = 'force-dynamic';

export default function PublicFeedbackPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4 py-10">
      <FeedbackPublicForm />
    </main>
  );
}

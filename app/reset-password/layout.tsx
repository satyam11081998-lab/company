import type { Metadata } from 'next';

// Utility page reached from an email link — keep it out of search indexes.
export const metadata: Metadata = {
  title: 'Reset password',
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}

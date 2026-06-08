'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-24 text-center">
      <h1 className="text-6xl font-serif font-bold text-navy mb-6">Something went wrong</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        We encountered an unexpected error. Our team has been notified.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="outline">Try again</Button>
        <Link href="/">
          <Button className="bg-primary text-white hover:bg-primary-hover">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}

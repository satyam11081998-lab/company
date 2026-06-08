'use client';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-24 text-center bg-background">
          <h1 className="text-6xl font-serif font-bold text-navy mb-6">System Error</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            A critical error occurred. Please try reloading the page.
          </p>
          <Button onClick={() => reset()} className="bg-primary text-white hover:bg-primary-hover">Reload Page</Button>
        </div>
      </body>
    </html>
  );
}

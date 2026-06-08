import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found — MECE',
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-24 text-center">
      <h1 className="text-6xl font-serif font-bold text-navy mb-6">404</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button className="bg-primary text-white hover:bg-primary-hover">Return Home</Button>
      </Link>
    </div>
  );
}

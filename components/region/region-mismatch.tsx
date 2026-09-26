import Link from 'next/link';
import { Globe2, ArrowRight } from 'lucide-react';

/**
 * Shown when someone opens a case from another market's bank — e.g. a US
 * account following a shared link to an India case. The backend refuses the
 * attempt anyway (services/markets.py assert_market_access); this is the
 * honest, friendly version of that refusal instead of a bare 404.
 */
export default function RegionMismatch({ viewerIsIntl }: { viewerIsIntl: boolean }) {
  return (
    <div className="container flex min-h-[60vh] max-w-lg flex-col items-center justify-center py-12 text-center">
      <Globe2 className="h-10 w-10 text-muted-foreground" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
        This case isn&apos;t in your case bank
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        {viewerIsIntl
          ? 'It belongs to our India case bank. Your account practices the US case bank: cases and market sizing built around US companies, US dollars and US interview formats.'
          : 'It belongs to our international (US) case bank. Your account practices the India case bank.'}
      </p>
      <Link
        href="/practice"
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Open your case bank
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

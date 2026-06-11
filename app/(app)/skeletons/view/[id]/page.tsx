import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import PDFViewer from '@/components/pdf-viewer';

export const dynamic = 'force-dynamic';

export default async function DeckViewerPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verify entitlement
  const { data: userRow } = await supabase.from('users').select('is_pro, is_admin').eq('id', user.id).single();
  
  if (!userRow?.is_pro && !userRow?.is_admin) {
    redirect('/skeletons'); // Boot them back to the paywall
  }

  const { data: deck } = await supabase
    .from('deck_skeletons')
    .select('title, file_type, source_kind, competition')
    .eq('id', params.id)
    .maybeSingle();

  if (!deck) {
    redirect('/skeletons');
  }

  const ext = (deck.file_type || '').toLowerCase();
  const isPdf = ext === 'pdf';

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container max-w-6xl h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/skeletons">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-sm font-semibold text-foreground line-clamp-1">{deck.title}</h1>
              <p className="text-micro text-muted-foreground line-clamp-1">{deck.competition} · {deck.source_kind === 'corporate' ? 'Corporate' : 'B-School'}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-6xl py-6">
        {isPdf ? (
          <PDFViewer url={`/api/skeletons/file/${params.id}`} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="bg-muted-foreground/10 p-6 rounded-2xl mb-6">
              <ExternalLink className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-h3 text-foreground mb-2">Non-PDF format detected</h2>
            <p className="text-body text-muted-foreground max-w-md">
              This deck was uploaded as a <strong>.{ext.toUpperCase()}</strong> file. 
              Our inline viewer currently only supports PDFs to guarantee anti-piracy protections.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

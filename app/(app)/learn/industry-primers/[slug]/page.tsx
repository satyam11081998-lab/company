import { notFound } from 'next/navigation';
import { PRIMERS } from '@/lib/primers';
import { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const primer = PRIMERS.find((p) => p.slug === params.slug);
  if (!primer) return {};
  return {
    title: `${primer.title} — MECE Primer`,
  };
}

export default function PrimerViewerPage({ params }: Props) {
  const primer = PRIMERS.find((p) => p.slug === params.slug);

  if (!primer) {
    notFound();
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] flex overflow-hidden">
      <iframe
        src={`/primers/${primer.slug}/index.html`}
        title={primer.title}
        className="flex-1 w-full h-full border-none bg-background"
      />
    </div>
  );
}

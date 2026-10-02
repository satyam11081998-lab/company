import Plans from '@/components/interview-intelligence/Plans';

// Not public yet: the II service answers 404 to anyone without Interview Intelligence, and the
// page asks search engines to stay away.
export const metadata = { title: 'Plans · Interview Intelligence · MECE', robots: { index: false, follow: false } };

export default function InterviewIntelligencePlansPage() {
  return <Plans />;
}

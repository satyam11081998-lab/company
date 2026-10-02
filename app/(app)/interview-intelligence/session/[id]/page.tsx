import InterviewRoom from '@/components/interview-intelligence/InterviewRoom';

export const metadata = { title: 'Interview · Interview Intelligence · MECE' };

export default function InterviewSessionPage({ params }: { params: { id: string } }) {
  return <InterviewRoom sessionId={params.id} />;
}

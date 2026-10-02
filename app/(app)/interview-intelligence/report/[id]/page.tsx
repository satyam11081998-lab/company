import ReportView from '@/components/interview-intelligence/ReportView';

export const metadata = { title: 'Interview report · Interview Intelligence · MECE' };

export default function InterviewReportPage({ params }: { params: { id: string } }) {
  return <ReportView sessionId={params.id} />;
}

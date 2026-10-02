// Interview Intelligence — hub. The feature lives entirely in components/interview-intelligence
// + lib/interview-intelligence and talks only to the independent II service; access is decided
// by that service (this page renders whatever it says).
import Hub from '@/components/interview-intelligence/Hub';

export const metadata = { title: 'Interview Intelligence · MECE' };

export default function InterviewIntelligencePage() {
  return <Hub />;
}

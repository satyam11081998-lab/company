import { Suspense } from 'react';
import SetupFlow from '@/components/interview-intelligence/SetupFlow';

export const metadata = { title: 'New interview · Interview Intelligence · MECE' };

export default function NewInterviewPage() {
  // SetupFlow reads ?session= (resume a build in progress), so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <SetupFlow />
    </Suspense>
  );
}

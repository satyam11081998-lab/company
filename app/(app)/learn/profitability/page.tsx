import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfitabilityCustomPage from '@/components/curriculum/profitability-custom-page';

export default async function ProfitabilityPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect('/login');

  return (
    <div className="min-h-screen">
      <main className="container max-w-6xl py-10">
        <ProfitabilityCustomPage />
      </main>
    </div>
  );
}

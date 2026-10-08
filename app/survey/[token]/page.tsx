import type { Metadata } from 'next';
import { publicSurvey } from '@/lib/crm/server/surveys';
import SurveyClient from '@/components/crm/public/survey-client';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'MECE', robots: { index: false, follow: false } };

/**
 * Public survey answer page: mece.in/survey/<token>?s=<score>. The tapped
 * score is only PRE-SELECTED; nothing is recorded until Submit (mail
 * scanners open links; they must not answer surveys).
 */
export default async function SurveyPage({ params, searchParams }: { params: { token: string }; searchParams: { s?: string } }) {
  const s = await publicSurvey(params.token).catch(() => ({ status: 'invalid' as const }));
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="mb-4 inline-block rounded bg-navy px-1.5 py-0.5 text-xs font-bold tracking-wide text-navy-foreground">MECE</p>
        {s.status === 'invalid' && <p className="text-sm">This survey link is not valid.</p>}
        {s.status === 'answered' && <p className="text-sm">You have already answered — thank you!</p>}
        {s.status === 'open' && 'question' in s && (
          <SurveyClient token={params.token} question={s.question!} followUp={s.followUp!} thankYou={s.thankYou!}
            min={s.min!} max={s.max!} low={s.low!} high={s.high!} preselect={/^\d{1,2}$/.test(searchParams.s ?? '') ? Number(searchParams.s) : null} />
        )}
      </div>
    </main>
  );
}

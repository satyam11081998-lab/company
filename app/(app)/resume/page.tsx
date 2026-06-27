import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Rocket, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { effectiveTier } from '@/lib/tier';
import { ResumeEditor } from '@/components/resume/resume-editor';
import { EMPTY_RESUME, STARTER_RESUME, type ResumeData } from '@/lib/resume/schema';

export const dynamic = 'force-dynamic';

export default async function ResumeLabPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userRow } = await supabase
    .from('users')
    .select('subscription_tier, subscription_expires_at, is_admin')
    .eq('id', user.id)
    .maybeSingle();
  const isPro = effectiveTier(userRow as any) === 'pro' || !!userRow?.is_admin;

  if (!isPro) {
    return (
      <div className="min-h-screen bg-muted">
        <main className="container max-w-2xl py-16">
          <div className="ui-card rounded-2xl border border-border p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="text-h2 text-foreground">Resume Lab</h1>
            <p className="mx-auto mt-3 max-w-lg text-body text-muted-foreground">
              Build a recruiter-ready, one-page B-school resume in the format placement cells expect.
              AI sharpens every bullet into a strong, quantified one-liner; you export an ATS-friendly PDF.
            </p>
            <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-body text-muted-foreground">
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" /> One-page IIM/IMI-style format, ATS-safe</li>
              <li className="flex gap-2"><Sparkles className="mt-1 h-4 w-4 shrink-0 text-primary" /> AI refine, generate, and fit-to-line for every bullet</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" /> Live preview, character-fill meters, one-click PDF</li>
            </ul>
            <Link href="/upgrade" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Rocket className="h-4 w-4" /> Unlock with Pro
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Load the user's most recent resume, or seed a starter.
  const { data: existing } = await supabase
    .from('resumes')
    .select('id, title, data')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const initialId = (existing?.id as string) ?? null;
  const initialData: ResumeData = existing?.data && Object.keys(existing.data).length
    ? { ...EMPTY_RESUME, ...(existing.data as ResumeData) }
    : STARTER_RESUME;
  const initialTitle = (existing?.title as string) ?? 'My Resume';

  return <ResumeEditor initialId={initialId} initialTitle={initialTitle} initialData={initialData} />;
}

import Link from 'next/link';
import { ArrowLeft, Lightbulb, Lock } from 'lucide-react';
import SignInWall from '@/components/guest/sign-in-wall';
import GuestStartButton from '@/components/guest/guest-start-button';
import type { CaseRow } from '@/lib/types';

/** Strip the noisiest markdown so a prompt reads cleanly without a renderer. */
function toReadable(md?: string | null): string {
  if (!md) return '';
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Read-only case/guesstimate view for logged-out visitors. They can read the
 * full prompt (this is the "see the case" experience), but the actual solve
 * workspace is replaced by a sign-in wall — "if they click Start, it leads to
 * sign in / sign up".
 */
export default function GuestCasePreview({ caseRow, caseId }: { caseRow: CaseRow; caseId: string }) {
  const isGuesstimate = caseRow.type === 'guesstimate';
  const next = `/cases/${caseId}`;
  const prompt = toReadable(caseRow.content);
  // NEXT_PUBLIC_* is inlined at build time, so this is readable in a server
  // component too — no client boundary needed just to branch on the flag.
  const guestMode = process.env.NEXT_PUBLIC_GUEST_MODE === 'true';

  return (
    <div className="min-h-screen bg-muted">
      <main className="container max-w-3xl py-6 sm:py-10">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to practice
        </Link>

        {/* Prompt card — fully readable */}
        <div className="mt-4 rounded-xl border border-border bg-card p-5 sm:p-7 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tag tag-navy text-[11px] uppercase tracking-wide">
              {isGuesstimate ? 'Guesstimate' : caseRow.type}
            </span>
            {caseRow.difficulty && (
              <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {caseRow.difficulty}
              </span>
            )}
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Lock className="h-3 w-3" /> Preview
            </span>
          </div>

          <h1 className="mt-3 text-xl sm:text-2xl font-bold leading-snug text-foreground">{caseRow.title}</h1>

          {prompt && (
            <div className="mt-4 whitespace-pre-line text-[14px] leading-relaxed text-foreground/80">{prompt}</div>
          )}

          {/* Hint is a paid/locked affordance even for members — keep it teased. */}
          {caseRow.hint && (
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-[13px] text-muted-foreground">
              <Lightbulb className="h-4 w-4 shrink-0 text-warning" />
              <span>A structured hint is available once you sign in.</span>
            </div>
          )}
        </div>

        {/* Locked solve workspace */}
        <div className="relative mt-4">
          {/* Blurred faux workspace behind the wall — signals "this is where you solve" */}
          <div aria-hidden className="pointer-events-none select-none rounded-xl border border-border bg-card p-5 blur-[3px]">
            <div className="mb-3 h-3 w-40 rounded bg-muted" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-11/12 rounded bg-muted" />
              <div className="h-3 w-4/5 rounded bg-muted" />
            </div>
            <div className="mt-4 h-24 rounded-lg border border-border bg-muted/50" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-3">
            {/* GUEST MODE (0045): this is the COLD-START path — a visitor who
                landed on this URL directly (shared link, new tab, search) and
                whose first server request therefore carried no cookie, because
                the anonymous session is only ever minted on a click.
                GuestStartButton mints it and refreshes in place; the server
                components then re-run WITH the session and render the real
                workspace. It renders null when NEXT_PUBLIC_GUEST_MODE is off,
                so the sign-in wall below stays the only path on rollback. */}
            {guestMode ? (
              <div className="w-full max-w-sm rounded-xl border border-primary/20 bg-card p-5 text-center shadow-xl">
                <h2 className="text-base font-bold text-foreground sm:text-lg">
                  {isGuesstimate ? 'Solve this guesstimate' : 'Start the case'}
                </h2>
                <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                  {isGuesstimate
                    ? 'Work it live, get scored on the 5-point rubric, and see where you stand.'
                    : 'Solve it live with the interviewer and get scored on 6 dimensions.'}
                </p>
                <div className="mt-4">
                  <GuestStartButton label={isGuesstimate ? 'Start solving' : 'Start the case'} />
                </div>
                <Link
                  href={`/login?next=${encodeURIComponent(next)}`}
                  className="mt-3 inline-block text-[12px] font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Already have an account? Log in
                </Link>
              </div>
            ) : (
              /* Flag off → the original sign-in wall, unchanged. Rolling back
                 must restore the previous experience exactly, including the
                 primary Sign-up CTA — not leave a half-migrated card whose only
                 action is "log in". */
              <SignInWall
                title={isGuesstimate ? 'Sign in to solve' : 'Sign in to start the case'}
                message={
                  isGuesstimate
                    ? 'Work the guesstimate live, get scored on the 5-point rubric, and track your progress.'
                    : 'Solve it live with the interviewer, get scored on 6 dimensions, and climb the leaderboard.'
                }
                next={next}
                compact
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

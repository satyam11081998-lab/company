import Link from 'next/link';
import { Eyebrow, usButton } from '@/components/us/ui';

/**
 * Leaderboard for a logged-out US / Europe visitor.
 *
 * The India teaser (components/guest/guest-leaderboard-preview.tsx) blurs a set
 * of illustrative standings behind a sign-in wall. The US experience shows no
 * invented rankings at all, so this is simply what the page is and how to see it.
 */
export default function UsGuestLeaderboard() {
  return (
    <div className="mx-auto flex min-h-[62vh] max-w-xl flex-col items-center justify-center px-4 py-14 text-center">
      <Eyebrow>Leaderboard</Eyebrow>
      <h1 className="mt-3 font-display text-[32px] leading-tight text-foreground sm:text-[38px]">See where you rank.</h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        Every scored case and market sizing question earns points, and you are ranked against other candidates
        practicing the US case bank. Sign in to see the live standings and your place on them.
      </p>
      <div className="mt-7 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Link href="/signup?next=%2Fleaderboard" className={usButton('primary', 'md')}>
          Create a free account
        </Link>
        <Link href="/login?next=%2Fleaderboard" className={usButton('secondary', 'md')}>
          Log in
        </Link>
      </div>
    </div>
  );
}

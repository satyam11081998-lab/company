import type { Metadata } from 'next';
import Link from 'next/link';
import { Users, ShieldCheck, Clock, Mic, FileText, Lock } from 'lucide-react';

/**
 * /gd-arena — live, moderated group discussions with students from comparable colleges.
 *
 * In development. This page exists so the nav entry leads somewhere that explains the
 * product rather than a 404, and so interest can be gauged before the build lands.
 *
 * TWO RULES THIS PAGE IS WRITTEN AROUND, both from the owner (2026-10-29):
 *
 *  1. No cohort language is ever shown to a candidate. Slots are filtered server-side by
 *     the band their verified college domain belongs to, and a candidate simply sees the
 *     slots they can join. They are never told which band they are in, never shown a slot
 *     they cannot book, and the word "tier" appears nowhere in the UI. Labelling someone's
 *     college in public is the kind of thing that gets screenshotted.
 *  2. A college email address is mandatory. Personal domains (gmail, outlook, yahoo and the
 *     rest) can never qualify, and the domain itself is admin-approved before anyone from it
 *     can book.
 *
 * Static on purpose: no database read, nothing to await, nothing to hydrate. It is a page
 * people will land on from the nav and read once.
 */

export const metadata: Metadata = {
  title: 'Group Discussions',
  description:
    'Live, moderated group discussions with students from comparable colleges. Verified college email required.',
};

const STEPS = [
  {
    icon: ShieldCheck,
    title: 'Verify your college email',
    body:
      'Not Gmail, not Outlook — your actual college address. We verify the domain and approve it before anyone from it can book. This is what keeps the room serious.',
  },
  {
    icon: Clock,
    title: 'Book a slot',
    body:
      'Scheduled sessions through the week. You see the slots open to you and book a seat. Five to eight people per discussion, never more.',
  },
  {
    icon: Mic,
    title: 'Twenty minutes, one moderator',
    body:
      'A trained moderator gives the topic, runs the clock and keeps order — the same way a real placement GD runs. Video, in your browser, on this site.',
  },
  {
    icon: FileText,
    title: 'Get the transcript and your feedback',
    body:
      'The session is recorded with your consent. You get the transcript, the moderator’s read, and a written assessment of how you entered, held and closed — saved to your profile.',
  },
];

export default function GdArenaPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          In development
        </span>
      </div>

      <h1 className="mt-5 text-h1 font-semibold tracking-tight text-foreground">Group Discussions</h1>

      <p className="mt-4 max-w-2xl text-body text-muted-foreground">
        A GD is the one round you cannot practise alone. You need a room, people who argue back, a clock,
        and someone keeping order. We are building exactly that — live, moderated discussions with students
        from colleges like yours, on this site.
      </p>

      <div className="mt-10 space-y-6">
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <div key={title} className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30">
              <Icon className="h-4 w-4 text-primary" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-body font-semibold text-foreground">
                <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                {title}
              </h2>
              <p className="mt-1 text-small leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-border bg-muted/20 p-5">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <h2 className="text-body font-semibold text-foreground">Who you will be in the room with</h2>
            <p className="mt-1 text-small leading-relaxed text-muted-foreground">
              Students from colleges comparable to yours. A discussion only teaches you something if the
              people in it push you, so we group by college rather than filling rooms at random. You will
              see the sessions open to you and book one — nothing else to decide.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-muted/20 p-5">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <h2 className="text-body font-semibold text-foreground">Recording and your consent</h2>
            <p className="mt-1 text-small leading-relaxed text-muted-foreground">
              Sessions are recorded so you can get a transcript and a written assessment. You will be asked
              to agree before you join, every time, and you can ask us to delete a recording afterwards.
              Nothing is recorded without that.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <h2 className="text-body font-semibold text-foreground">Not open yet</h2>
        <p className="mt-2 max-w-2xl text-small leading-relaxed text-muted-foreground">
          We are building this now and opening it to a small set of colleges first. In the meantime, the GD
          preparation already on the site is free to use.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/gd-briefs"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-small font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Today&rsquo;s news briefs
          </Link>
          <Link
            href="/gd-briefs/abstract"
            className="inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-small font-semibold text-foreground transition-colors hover:bg-muted/40"
          >
            Abstract GD practice
          </Link>
        </div>
      </div>
    </div>
  );
}

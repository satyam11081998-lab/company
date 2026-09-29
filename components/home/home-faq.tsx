/**
 * Visible FAQ — the same questions app/page.tsx emits as FAQPage JSON-LD
 * (structured data must match what is on the page).
 */
export default function HomeFaq({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24 border-y border-border/70 bg-[#F4F2EC] dark:bg-white/[0.02]">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-4">
          <p className="home-eyebrow">Questions</p>
          <h2
            id="faq-title"
            className="mt-5 font-editorial text-[36px] font-semibold leading-[1.08] tracking-[-0.02em] text-navy [text-wrap:balance] dark:text-white sm:text-[40px]"
          >
            What aspirants ask us
          </h2>
          <p className="mt-4 font-editorial text-[17px] leading-relaxed text-[#55534C] dark:text-white/70">
            MECE (mece.in) is a placement-interview prep platform for MBA &amp; PGDM students — not to be confused with
            the problem-solving principle it is named after.
          </p>
          <p className="mt-4 text-[14.5px] text-muted-foreground">
            Something else?{' '}
            <a href="mailto:team@mece.in" className="font-semibold text-primary underline-offset-4 hover:underline">
              team@mece.in
            </a>
          </p>
        </div>
        <div className="divide-y divide-border/80 rounded-[12px] border border-border/90 bg-card px-6 shadow-[0_1px_2px_rgba(15,28,51,0.04)] lg:col-span-8">
          {faqs.map((f) => (
            <details key={f.question} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-[6px] font-editorial text-[19px] font-semibold text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-white">
                {f.question}
                <span
                  aria-hidden
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                >
                  <svg viewBox="0 0 12 12" className="h-3 w-3">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-muted-foreground">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

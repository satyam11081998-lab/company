import AuthCTA from '@/components/auth-cta';
import HomeImage from '@/components/home/photo';
import { HOME_PHOTOS } from '@/lib/home/photos';

/**
 * Closing band: brand navy, Kangchenjunga at alpenglow rising out of it, and
 * the brand's mountain mark traced in hairline over the valley.
 */
export default function FinalCta() {
  return (
    <section aria-labelledby="final-cta-title" className="relative isolate overflow-hidden bg-navy text-white">
      {/* Photograph — right two-thirds, melting into navy on the left. */}
      <div aria-hidden className="absolute inset-y-0 right-0 -z-10 w-full md:w-[70%] lg:w-[62%]">
        <div className="absolute inset-0 overflow-hidden">
          <HomeImage
            photo={HOME_PHOTOS.summit}
            decorative
            sizes="(min-width: 1024px) 62vw, 100vw"
            widths={[640, 960, 1280, 1680]}
            className="home-pan h-full w-full object-cover"
            style={{ objectPosition: '62% 44%' }}
          />
        </div>
        {/* Cool the teal sky into brand navy; keep the lit peaks. */}
        <div className="absolute inset-0 bg-[#0F1C33]/35 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/85 to-navy/25 md:bg-gradient-to-r md:from-navy md:via-navy/40 md:to-navy/10" />
        <div className="absolute inset-x-0 bottom-0 hidden h-1/3 bg-gradient-to-t from-navy/80 to-transparent md:block" />
      </div>

      {/* The mark, traced: two hairline peaks on the valley floor. */}
      <svg
        aria-hidden
        viewBox="0 0 200 110"
        className="pointer-events-none absolute bottom-0 left-[40%] -z-10 hidden h-[74%] w-auto text-white/25 lg:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
      >
        <path d="M4 110 L62 26 L120 110" />
        <path d="M46 110 L90 42 L134 110" />
      </svg>

      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:py-16">
        <div className="lg:col-span-8 xl:col-span-7">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/85">
            Your placement season <span className="text-white/60">starts now</span>
          </p>
          <h2
            id="final-cta-title"
            className="mt-4 font-editorial text-[34px] font-semibold leading-[1.08] tracking-[-0.015em] text-white [text-wrap:balance] sm:text-[42px]"
          >
            Start practising real cases today.
          </h2>
          <p className="mt-4 max-w-[34rem] font-editorial text-[18.5px] leading-relaxed text-white/75">
            Practise real cases and guesstimates, get scored in 60 seconds, and improve with targeted feedback.
          </p>
        </div>
        <div className="lg:col-span-4 lg:flex lg:justify-end xl:col-span-5">
          <AuthCTA variant="cta" look="editorial" />
        </div>
      </div>
    </section>
  );
}

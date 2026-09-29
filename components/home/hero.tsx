import AuthCTA from '@/components/auth-cta';
import { CountUp } from '@/components/landing-vignettes';
import HandNote from '@/components/home/hand-note';
import HeroTile from '@/components/home/hero-tile';
import HomeImage from '@/components/home/photo';
import { HOME_PHOTOS } from '@/lib/home/photos';

/**
 * HERO — headline left; on the right, first light over a ridge with one hiker
 * on it, melting into the cream page, and the live practice tile lifted in
 * front of it.
 *
 * Photo geometry (desktop). Measured on the original: the hiker stands at
 * 34.4% across; his head is at 48.6% and his feet at 51.3% down. The photo
 * layer starts at 36% of the viewport and runs to the right edge; inside it
 * the image is drawn wider than the layer and shifted by a percentage of ITS
 * OWN size, so every position scales with the viewport:
 *
 *   lg–xl  (1024–1535): 135% wide, translate(-15%, -30%)
 *          hiker x ≈ 52.8vw, feet y ≈ 12.3vw → tile top at 12.7vw (+ the
 *          grid's 40px top padding, which the photo layer does not have)
 *   2xl    (≥1536):     120% wide, translate(-12%, -34%)
 *          hiker x ≈ 53.2vw, feet y ≈ 8.9vw  → tile top at 8.9vw
 *
 * That keeps him on the ridge just above the tile, 15–50px in from its left
 * corner, with the margin note to his right, at every desktop width. Change
 * one number and re-check the others (the handoff has the arithmetic).
 */
export default function Hero({ caseId, guesstimateId }: { caseId: string | null; guesstimateId: string | null }) {
  const hero = HOME_PHOTOS.hero;
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      {/* Draughtsman's grid behind the headline — barely there. */}
      <div aria-hidden className="home-grid pointer-events-none absolute inset-y-0 left-0 -z-10 w-full lg:w-[60%]" />

      {/* ── Desktop photograph ─────────────────────────────────────────── */}
      {/* Fades are CSS masks on the photo itself (not cream overlays), so the
          page colour shows through in light and dark mode alike and there is
          no seam where an overlay and a scaled image disagree by a pixel. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-[36%] right-0 -z-10 hidden overflow-hidden lg:block"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 24%), linear-gradient(to bottom, rgba(0,0,0,.35) 0%, #000 12%)',
          WebkitMaskComposite: 'source-in',
          maskImage: 'linear-gradient(to right, transparent 0%, #000 24%), linear-gradient(to bottom, rgba(0,0,0,.35) 0%, #000 12%)',
          maskComposite: 'intersect',
        }}
      >
        <div
          className="absolute left-0 top-0 w-[135%] -translate-x-[15%] -translate-y-[30%] overflow-hidden 2xl:w-[120%] 2xl:-translate-x-[12%] 2xl:-translate-y-[34%]"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, #000 56%, transparent 94%)',
            maskImage: 'linear-gradient(to bottom, #000 56%, transparent 94%)',
          }}
        >
          <HomeImage
            photo={hero}
            decorative
            priority
            media="(min-width: 1024px)"
            sizes="88vw"
            widths={[960, 1280, 1600, 2000, 2600]}
            quality={78}
            className="home-drift block h-auto w-full"
          />
          <div className="home-glow absolute inset-0" />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-12 lg:gap-6 lg:pb-12 lg:pt-10">
        {/* ── Copy ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col justify-center lg:col-span-6 lg:pr-4 xl:col-span-6">
          <p className="home-eyebrow">Real cases. Real feedback. Real progress.</p>
          <h1
            id="hero-title"
            className="mt-6 font-editorial text-[44px] font-semibold leading-[1.02] tracking-[-0.022em] text-navy dark:text-white sm:text-[56px] lg:text-[47px] xl:text-[58px] min-[1400px]:text-[64px]"
          >
            Sit one real case.
            <br />
            See if you&rsquo;d
            <br />
            <span className="text-primary">actually get the offer.</span>
          </h1>
          <p className="mt-6 max-w-[35rem] font-editorial text-[18px] leading-[1.55] text-[#55534C] dark:text-white/70 sm:text-[19px] lg:text-[17.5px] xl:text-[19px]">
            Practise real business cases and guesstimates, scored in ~60s. Clarify, structure, solve and get evaluated
            on the six things interviewers actually weigh. Built for MBA &amp; PGDM placement season.
          </p>
          <div className="mt-8">
            <AuthCTA variant="hero" look="editorial" howHref="#the-mece-way" />
          </div>
          <dl className="mt-9 grid max-w-[36rem] grid-cols-3 sm:flex sm:max-w-none">
            {[
              { v: <CountUp to={6} duration={900} />, k: 'Scoring dimensions' },
              { v: <CountUp to={60} suffix="s" duration={1200} />, k: 'Feedback time' },
              { v: 'Instant', k: 'Structured feedback' },
            ].map(({ v, k }, i) => (
              <div key={k} className={`flex min-w-0 flex-col ${i === 0 ? 'pr-3 sm:pr-8' : 'border-l border-border px-3 sm:px-8'}`}>
                <dt className="sr-only">{k}</dt>
                <dd className="font-editorial text-[26px] font-semibold leading-none tracking-[-0.01em] text-navy tabular-nums dark:text-white sm:text-[34px]">
                  {v}
                </dd>
                <dd className="mt-2 font-editorial text-[14px] leading-snug text-[#6B6960] dark:text-white/60 sm:whitespace-nowrap sm:text-[16px]">{k}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Photo + tile ─────────────────────────────────────────────── */}
        <div className="relative lg:col-span-6">
          {/* Phone / tablet: the photograph as a full-bleed band behind the tile. */}
          <div
            aria-hidden
            className="relative -mx-4 h-[58vw] max-h-[420px] overflow-hidden sm:-mx-6 lg:hidden"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 22%, #000 62%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, #000 22%, #000 62%, transparent 100%)',
            }}
          >
            <HomeImage
              photo={hero}
              decorative
              priority
              media="(max-width: 1023.98px)"
              sizes="100vw"
              widths={[480, 768, 1080, 1440]}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: '34% 62%' }}
            />
          </div>

          <div className="relative -mt-[22vw] sm:-mt-[18vw] lg:mt-[12.7vw] lg:flex lg:justify-end 2xl:mt-[8.9vw]">
            <div className="relative w-full min-[1400px]:-mr-8 min-[1400px]:w-[calc(100%+32px)] min-[1400px]:max-w-[640px]">
              <HandNote
                lines={['Practise', 'like the', 'top 1%']}
                arrow="down-right"
                rotate={-8}
                className="absolute bottom-[calc(100%-26px)] left-[52%] z-10 w-[170px] sm:left-[46%] lg:left-[84px] xl:left-[100px]"
                textClassName="text-[22px] sm:text-[24px] xl:text-[26px] dark:!text-[#2b2a27]"
                arrowClassName="-mt-0.5 ml-[64px] text-[#2b2a27]"
                delay={700}
              />
              <HeroTile caseId={caseId} guesstimateId={guesstimateId} className="w-full lg:h-[508px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

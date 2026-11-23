'use client'

import { hero, site } from '@/data/content'
import { useBrokenImage } from '@/lib/useBrokenImage'

const portraitSize = 'drift h-24 w-24 md:h-[150px] md:w-[150px] rounded-2xl border border-primary/30'

export function Hero() {
  const { ref: portraitRef, broken: portraitBroken, onError: onPortraitError } = useBrokenImage()

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-6 px-6 pb-8 pt-8 md:grid-cols-[1fr_auto] md:gap-10 md:pt-12">
      <div className="hero-text order-2 md:order-1">
        <p className="mb-4 inline-block rounded-full border border-tech/40 px-3 py-0.5 text-xs font-medium text-tech md:text-sm">
          {hero.pill}
        </p>
        <h1 className="font-heading text-[40px] font-bold leading-[1.05] md:text-[56px] lg:text-[64px]">
          {site.name}
        </h1>
        <p className="mt-2 font-heading text-lg font-semibold text-link md:text-xl">{site.title}</p>
        <p className="mt-3 max-w-xl text-base text-muted md:text-lg">{hero.intro}</p>
      </div>

      <div className="hero-portrait order-1 md:order-2">
        {portraitBroken ? (
          <div
            role="img"
            aria-label="Portrait placeholder"
            className={`${portraitSize} flex items-center justify-center bg-gradient-to-br from-primary/30 to-tech/30 text-muted`}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" />
            </svg>
          </div>
        ) : (
          // A plain img: the file may not exist yet, and onError swaps in the placeholder.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={portraitRef}
            src="/portrait.jpg"
            alt={`Portrait of ${site.name}`}
            onError={onPortraitError}
            className={`${portraitSize} object-cover`}
          />
        )}
      </div>
    </section>
  )
}

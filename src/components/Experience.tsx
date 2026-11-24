'use client'

import { useEffect, useRef } from 'react'
import { experience } from '@/data/content'
import { sectionLabel } from '@/lib/ui'

export function Experience() {
  const timelineRef = useRef<HTMLDivElement>(null)

  // Lights each past-job dot once the growing line (or, without it, the viewport middle) reaches it.
  useEffect(() => {
    const timeline = timelineRef.current
    if (!timeline) return
    const line = timeline.querySelector<HTMLElement>('.timeline-line')
    const dots = timeline.querySelectorAll<HTMLElement>('.dot-light')
    let frame = 0

    const update = () => {
      frame = 0
      const lineBottom = line?.offsetParent ? line.getBoundingClientRect().bottom : null
      dots.forEach((dot) => {
        const rect = dot.getBoundingClientRect()
        const center = rect.top + rect.height / 2
        const reached = lineBottom !== null ? lineBottom >= center : center < window.innerHeight * 0.6
        dot.toggleAttribute('data-lit', reached)
      })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section id="experience" aria-labelledby="experience-heading" className="scroll-mt-16 bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2 id="experience-heading" className={sectionLabel}>
          Experience
        </h2>

        <div ref={timelineRef} className="relative ml-2">
          <div aria-hidden="true" className="timeline-line absolute left-0 top-0 h-full w-px origin-top bg-primary" />
          <ol className="reveal-stagger border-l border-white/15">
            {experience.map((entry) => (
              <li key={`${entry.company}-${entry.role}`} className="relative pb-8 pl-8 last:pb-0">
                <span
                  aria-hidden="true"
                  className="pop dot-light absolute -left-[8px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-muted bg-surface"
                />
                <h3 className="font-heading text-lg font-semibold">
                  {entry.role} <span className="font-normal text-muted">· {entry.company}</span>
                </h3>
                <p className={`mt-0.5 text-sm ${entry.current ? 'text-link' : 'text-muted'}`}>
                  {entry.dates}
                  {entry.note ? ` · ${entry.note}` : ''}
                </p>
                <p className="mt-2 max-w-3xl text-base text-muted">{entry.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

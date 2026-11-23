import { experience } from '@/data/content'
import { sectionLabel } from '@/lib/ui'

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-heading" className="scroll-mt-16 bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2 id="experience-heading" className={sectionLabel}>
          Experience
        </h2>

        <ol className="ml-2 border-l border-white/15">
          {experience.map((entry) => (
            <li key={`${entry.company}-${entry.role}`} className="relative pb-8 pl-8 last:pb-0">
              <span
                aria-hidden="true"
                className={`absolute -left-[8px] top-1.5 h-3.5 w-3.5 rounded-full border-2 ${
                  entry.current ? 'border-primary bg-primary' : 'border-muted bg-surface'
                }`}
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
    </section>
  )
}

import { about, site, skills } from '@/data/content'
import { chip, primaryButton, sectionLabel, subLabel } from '@/lib/ui'

export function AboutSkills() {
  return (
    <section id="about" aria-labelledby="about-heading" className="scroll-mt-16">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2 id="about-heading" className={sectionLabel}>
          About
        </h2>

        <div className="reveal-stagger grid gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <h3 className="font-heading text-2xl font-semibold md:text-3xl">{about.headline}</h3>
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-base text-muted">
                {paragraph}
              </p>
            ))}

            <dl className="mt-6 rounded-xl bg-card px-5 py-2">
              {about.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex justify-between gap-4 border-b border-white/10 py-3 text-sm last:border-b-0"
                >
                  <dt className="text-muted">{fact.label}</dt>
                  <dd className="text-right font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>

            {site.resumeAvailable && (
              <a href="/resume.pdf" download className={`${primaryButton} mt-6`}>
                Resume (PDF)
              </a>
            )}
          </div>

          <div>
            <h3 className="font-heading text-2xl font-semibold md:text-3xl">Skills</h3>
            <div className="reveal-stagger mt-4 flex flex-col gap-5">
              {skills.groups.map((group) => (
                <div key={group.group}>
                  <h4 className={subLabel}>{group.group}</h4>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <li key={item} className={chip}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-muted">
              <span className="font-semibold">How I work:</span> {skills.workStyle.join(' · ')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

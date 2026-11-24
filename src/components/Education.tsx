import { Award, BookOpen, GraduationCap } from 'lucide-react'
import { certificates, education, visibleEntries } from '@/data/content'
import { cardIcon, infoCard, sectionLabel, subLabel } from '@/lib/ui'

function LevelIcon({ level }: { level: string }) {
  const Icon = /high/i.test(level) ? BookOpen : GraduationCap
  return <Icon aria-hidden="true" className={cardIcon} />
}

export function Education() {
  const schools = visibleEntries(education)
  const certs = visibleEntries(certificates)

  return (
    <section id="education" aria-labelledby="education-heading" className="scroll-mt-16">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2 id="education-heading" className={sectionLabel}>
          Education
        </h2>

        {schools.length > 0 && (
          <ul className={`reveal-stagger grid gap-4 ${schools.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {schools.map((entry) => (
              <li key={`${entry.school}-${entry.title}`} className={infoCard}>
                <LevelIcon level={entry.level} />
                <p className={subLabel}>{entry.level}</p>
                <h3 className="mt-2 font-heading text-lg font-semibold">{entry.title}</h3>
                <p className="mt-1 text-base text-muted">{entry.school}</p>
                <p className="mt-1 text-sm text-muted">{entry.dates}</p>
              </li>
            ))}
          </ul>
        )}

        {certs.length > 0 && (
          <>
            <h3 className={`${subLabel} mb-4 mt-8`}>Certificates</h3>
            <ul className="reveal-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certs.map((entry) => (
                <li key={`${entry.issuer}-${entry.title}`} className={infoCard}>
                  <Award aria-hidden="true" className={cardIcon} />
                  <p className={subLabel}>{entry.issuer}</p>
                  <h4 className="mt-2 font-heading text-lg font-semibold">{entry.title}</h4>
                  <p className="mt-1 text-base text-muted">{entry.center}</p>
                  <p className="mt-1 text-sm text-muted">{entry.year}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}

import { ProjectCard } from '@/components/ProjectCard'
import type { Project } from '@/lib/types'

type ProjectsSectionProps = {
  projects: Project[]
  onOpen: (slug: string) => void
  /** Shown instead of cards while there is nothing to list. */
  emptyMessage?: string
}

export function ProjectsSection({
  projects,
  onOpen,
  emptyMessage = 'Projects are coming soon.',
}: ProjectsSectionProps) {
  // The API lists featured projects first, so the first project takes the large card.
  const [featured, ...others] = projects
  const side = others.slice(0, 2)
  const more = others.slice(2)

  return (
    <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-16 bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2 id="projects-heading" className="reveal mb-4 text-sm font-semibold uppercase tracking-widest text-link">
          Selected projects
        </h2>

        {!featured ? (
          <p className="text-muted">{emptyMessage}</p>
        ) : (
          <>
            <div className={`reveal-stagger grid gap-4 ${side.length > 0 ? 'md:grid-cols-[3fr_2fr]' : ''}`}>
              <ProjectCard project={featured} size="large" onOpen={onOpen} />
              {side.length > 0 && (
                <div className="flex flex-col gap-4 [&>*]:flex-1">
                  {side.map((project) => (
                    <ProjectCard key={project.slug} project={project} size="small" onOpen={onOpen} />
                  ))}
                </div>
              )}
            </div>

            {more.length > 0 && (
              <div className="reveal-stagger mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {more.map((project) => (
                  <ProjectCard key={project.slug} project={project} size="small" onOpen={onOpen} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

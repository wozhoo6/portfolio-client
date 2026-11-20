'use client'

import { useBrokenImage } from '@/lib/useBrokenImage'
import type { Project } from '@/lib/types'

type ProjectCardProps = {
  project: Project
  size: 'large' | 'small'
  onOpen: (slug: string) => void
}

function count(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

export function ProjectCard({ project, size, onOpen }: ProjectCardProps) {
  const { ref: imageRef, broken: imageBroken, onError: onImageError } = useBrokenImage()
  const large = size === 'large'
  const showImage = Boolean(project.thumbnail_url) && !imageBroken

  // Totals stay hidden while they are 0, so a new project does not show a row of zeros.
  const stats = [
    project.reactions_count > 0 ? count(project.reactions_count, 'reaction') : null,
    project.view_count > 0 ? count(project.view_count, 'view') : null,
  ].filter((text): text is string => text !== null)

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-transparent bg-card p-4 transition-colors hover:border-primary/60">
      <div className={`mb-4 overflow-hidden rounded-lg ${large ? 'aspect-video' : 'h-28'}`}>
        {showImage ? (
          // A plain img: thumbnails are pasted links from any host, so next/image would need
          // every host allow-listed. onError swaps in the placeholder if a link is dead.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imageRef}
            src={project.thumbnail_url ?? undefined}
            alt=""
            loading="lazy"
            onError={onImageError}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 to-tech/30" aria-hidden="true" />
        )}
      </div>

      <h3 className={`font-heading font-semibold ${large ? 'text-2xl' : 'text-xl'}`}>
        {/* The button stretches over the whole card, so the whole card is clickable and keyboard-focusable. */}
        <button
          type="button"
          onClick={() => onOpen(project.slug)}
          className="text-left after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
        >
          {project.title}
        </button>
      </h3>

      {project.type && (
        <p className="mt-1">
          <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-link">{project.type}</span>
        </p>
      )}

      <p className={`mt-2 text-muted ${large ? 'text-base' : 'text-sm'}`}>{project.summary}</p>

      {large && project.tech_stack.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {project.tech_stack.map((tech) => (
            <li key={tech} className="rounded border border-tech/30 px-2 py-0.5 font-mono text-xs text-tech">
              {tech}
            </li>
          ))}
        </ul>
      )}

      {stats.length > 0 && <p className="mt-auto pt-3 text-xs text-muted">{stats.join(' · ')}</p>}
    </article>
  )
}

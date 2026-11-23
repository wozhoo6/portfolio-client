'use client'

import { useEffect, useRef, useState } from 'react'
import { recordView } from '@/lib/api'
import { Impressions } from '@/components/Impressions'
import { ReactionBar } from '@/components/ReactionBar'
import { useBrokenImage } from '@/lib/useBrokenImage'
import type { Project } from '@/lib/types'

type ProjectModalProps = {
  /** The project to show, or null while the popup is closed. */
  project: Project | null
  /** Called when the visitor closes the popup (Escape, outside click, close button). */
  onClose: () => void
}

const primaryButton =
  'inline-flex items-center rounded-lg border-b-[3px] border-[#6D3FD1] bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110'
const ghostButton =
  'inline-flex items-center rounded-lg border border-link/50 px-4 py-2 text-sm font-semibold text-link transition hover:bg-link/10'

/**
 * The project popup, built on the native <dialog> element: the browser provides the
 * focus containment, Escape key, backdrop, top layer and returning focus to the card.
 */
export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  // True while WE close the dialog because the `project` prop became null (for example
  // the browser Back button), so the resulting close event is not reported as a visitor action.
  const closedByProp = useRef(false)
  const isOpen = project !== null

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      closedByProp.current = true
      dialog.close()
    }
  }, [isOpen])

  // Clicking outside closes the dialog through `closedby="any"` in Chrome, Edge and Firefox.
  // Safari does not support it yet, so there we close it ourselves.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return

    // Compare the pointer position with the dialog box: the dialog element is also the event
    // target for its own padding, so checking event.target alone would close on those clicks.
    const outside = (e: PointerEvent) => {
      const box = dialog.getBoundingClientRect()
      return e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom
    }
    let pressedOutside = false
    const down = (e: PointerEvent) => {
      pressedOutside = outside(e)
    }
    const up = (e: PointerEvent) => {
      // Press and release must both be outside, so a text-selection drag does not dismiss it.
      if (pressedOutside && outside(e)) dialog.close()
    }
    dialog.addEventListener('pointerdown', down)
    dialog.addEventListener('pointerup', up)
    return () => {
      dialog.removeEventListener('pointerdown', down)
      dialog.removeEventListener('pointerup', up)
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="project-modal-title"
      onClose={() => {
        if (closedByProp.current) {
          closedByProp.current = false
          return
        }
        onClose()
      }}
      {...({ closedby: 'any' } as object)}
      className="m-0 h-full max-h-none w-full max-w-none overflow-hidden border-0 bg-surface p-0 text-text md:m-auto md:h-auto md:max-h-[90vh] md:w-[960px] md:max-w-[calc(100vw-2rem)] md:rounded-2xl md:border md:border-primary/30"
    >
      {project && (
        <>
          <button
            type="button"
            aria-label="Close"
            onClick={() => dialogRef.current?.close()}
            className="absolute right-3 top-3 z-10 rounded-full bg-card p-2 text-muted transition-colors hover:text-text"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {/* key resets the thumbnail state and view tracking when another project is shown */}
          <ProjectContent key={project.slug} project={project} />
        </>
      )}
    </dialog>
  )
}

function ProjectContent({ project }: { project: Project }) {
  const { ref: imageRef, broken: imageBroken, onError: onImageError } = useBrokenImage()
  const showImage = Boolean(project.thumbnail_url) && !imageBroken
  const [impressionTotal, setImpressionTotal] = useState<number | null>(null)

  // Count one view each time the popup opens (the server ignores repeats within 30 minutes).
  useEffect(() => {
    void recordView(project.slug)
  }, [project.slug])

  const links = [
    project.live_url ? { label: 'Live demo', url: project.live_url, primary: true } : null,
    project.repo_url ? { label: 'GitHub', url: project.repo_url, primary: false } : null,
    ...project.links.map((link) => ({ label: link.label, url: link.url, primary: false })),
  ].filter((link): link is { label: string; url: string; primary: boolean } => link !== null)

  return (
    <div className="popup-scroll h-full overflow-y-auto overscroll-contain p-5 pt-14 md:h-auto md:max-h-[90vh] md:p-8 md:pt-8">
      <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:gap-8">
        {/* Left column on desktop: picture, stack, links, reactions.
            On a phone the two column wrappers use `display: contents`, so their children join one
            grid and `order` sets the approved phone order: picture, title, stack and links,
            reactions, then the story. */}
        <div className="contents md:sticky md:top-8 md:block md:self-start">
          <div className="order-1 aspect-video overflow-hidden rounded-lg md:order-none">
            {showImage ? (
              // A plain img: pasted links from any host, with a placeholder if a link is dead.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imageRef}
                src={project.thumbnail_url ?? undefined}
                alt={`Screenshot of ${project.title}`}
                onError={onImageError}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary/30 to-tech/30" aria-hidden="true" />
            )}
          </div>

          {project.tech_stack.length > 0 && (
            <ul className="order-3 flex flex-wrap gap-1.5 md:order-none md:mt-4" aria-label="Tech stack">
              {project.tech_stack.map((tech) => (
                <li key={tech} className="rounded border border-tech/30 px-2 py-0.5 font-mono text-xs text-tech">
                  {tech}
                </li>
              ))}
            </ul>
          )}

          {links.length > 0 && (
            <div className="order-3 flex flex-wrap gap-2 md:order-none md:mt-4">
              {links.map((link) => (
                <a
                  key={`${link.label}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={link.primary ? primaryButton : ghostButton}
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}

          <div className="order-4 md:order-none md:mt-4">
            <ReactionBar slug={project.slug} initialTotal={project.reactions_count} views={project.view_count} />
            <button
              type="button"
              onClick={() => document.getElementById('project-impressions')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-2 text-sm font-semibold text-link hover:underline"
            >
              {impressionTotal === null ? 'Impressions' : `Impressions · ${impressionTotal}`} ↓
            </button>
          </div>
        </div>

        {/* Right column: the story. Every block is skipped when its data is empty. */}
        <div className="contents md:block">
          <div className="order-2 md:order-none">
            <h2 id="project-modal-title" className="pr-10 font-heading text-2xl font-semibold md:pr-8">
              {project.title}
            </h2>

            {(project.type || project.role) && (
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                {project.type && (
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-link">{project.type}</span>
                )}
                {project.role && <span>{project.role}</span>}
              </p>
            )}

            {project.description && <p className="mt-4 text-base text-muted">{project.description}</p>}
          </div>

          {project.problem && (
            <section className="order-5 md:order-none md:mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-link">Problem</h3>
              <p className="mt-1.5 text-base text-muted">{project.problem}</p>
            </section>
          )}

          {project.solution && (
            <section className="order-5 md:order-none md:mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-link">Solution</h3>
              <p className="mt-1.5 text-base text-muted">{project.solution}</p>
            </section>
          )}

          {project.key_features.length > 0 && (
            <section className="order-5 md:order-none md:mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-link">Key features</h3>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-base text-muted">
                {project.key_features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <div id="project-impressions" className="mt-8 scroll-mt-4 border-t border-white/10 pt-8">
        <Impressions projectSlug={project.slug} heading="Impressions for this project" onTotal={setImpressionTotal} />
      </div>
    </div>
  )
}

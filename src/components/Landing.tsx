'use client'

import { useEffect, useRef, useState } from 'react'
import { AboutSkills } from '@/components/AboutSkills'
import { Education } from '@/components/Education'
import { Experience } from '@/components/Experience'
import { Hero } from '@/components/Hero'
import { Impressions } from '@/components/Impressions'
import { Nav } from '@/components/Nav'
import { ProjectModal } from '@/components/ProjectModal'
import { ProjectsSection } from '@/components/ProjectsSection'
import { getProjects } from '@/lib/api'
import type { Project } from '@/lib/types'

export type LandingProps = {
  projects?: Project[]
  loadFailed?: boolean
  /** Slug of the project whose popup starts open (the /projects/{slug} address). */
  openSlug?: string | null
}

// Section shells that Batch B of Task 9 fills in.
const shellsAfterImpressions = ['contact']

export function Landing({ projects: initialProjects = [], loadFailed = false, openSlug: initialSlug = null }: LandingProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [status, setStatus] = useState<'ready' | 'loading' | 'error'>(loadFailed ? 'loading' : 'ready')
  const [openSlug, setOpenSlug] = useState<string | null>(initialSlug)
  // True when the popup was opened by clicking a card, so closing can step back in history.
  const openedByClick = useRef(false)

  // The server could not reach the API (it may be asleep): ask again from the browser.
  useEffect(() => {
    if (!loadFailed) return
    let cancelled = false
    getProjects()
      .then((list) => {
        if (cancelled) return
        setProjects(list)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [loadFailed])

  // The browser Back and Forward buttons open and close the popup through the address.
  useEffect(() => {
    const onPopState = () => {
      const match = window.location.pathname.match(/^\/projects\/([^/]+)\/?$/)
      setOpenSlug(match ? decodeURIComponent(match[1]) : null)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const handleOpen = (slug: string) => {
    window.history.pushState(null, '', `/projects/${encodeURIComponent(slug)}`)
    openedByClick.current = true
    setOpenSlug(slug)
  }

  // Called when the visitor closes the popup.
  const handleClose = () => {
    if (openedByClick.current) {
      // Step back to the page we came from; the popstate listener clears openSlug.
      openedByClick.current = false
      window.history.back()
    } else {
      // The visitor arrived straight on /projects/{slug}: go to the home address without leaving the site.
      window.history.pushState(null, '', '/')
      setOpenSlug(null)
    }
  }

  const emptyMessage =
    status === 'loading'
      ? 'Loading projects…'
      : status === 'error'
        ? "Couldn't load projects right now. Please refresh in a moment."
        : 'Projects are coming soon.'

  const openProject = projects.find((project) => project.slug === openSlug) ?? null

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProjectsSection projects={projects} onOpen={handleOpen} emptyMessage={emptyMessage} />
        <AboutSkills />
        <Experience />
        <Education />
        <section id="impressions" className="scroll-mt-16 bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <Impressions label="Impressions" heading="Leave a note" />
          </div>
        </section>
        {shellsAfterImpressions.map((id) => (
          <section key={id} id={id} className="scroll-mt-16" />
        ))}
      </main>
      <ProjectModal project={openProject} onClose={handleClose} />
    </>
  )
}

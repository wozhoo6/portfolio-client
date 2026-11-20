'use client'

import { useEffect, useState } from 'react'
import { Hero } from '@/components/Hero'
import { Nav } from '@/components/Nav'
import { ProjectsSection } from '@/components/ProjectsSection'
import { getProjects } from '@/lib/api'
import type { Project } from '@/lib/types'

export type LandingProps = {
  projects?: Project[]
  loadFailed?: boolean
  openSlug?: string | null
}

// Section shells in page order after Projects. Tasks 8 and 9 fill them in.
const placeholderIds = ['about', 'experience', 'education', 'impressions', 'contact']

export function Landing({ projects: initialProjects = [], loadFailed = false }: LandingProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [status, setStatus] = useState<'ready' | 'loading' | 'error'>(loadFailed ? 'loading' : 'ready')

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

  const emptyMessage =
    status === 'loading'
      ? 'Loading projects…'
      : status === 'error'
        ? "Couldn't load projects right now. Please refresh in a moment."
        : 'Projects are coming soon.'

  // The project popup arrives in Task 6; until then a click does nothing.
  const handleOpen = () => {}

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProjectsSection projects={projects} onOpen={handleOpen} emptyMessage={emptyMessage} />
        {placeholderIds.map((id) => (
          <section key={id} id={id} className="scroll-mt-16" />
        ))}
      </main>
    </>
  )
}

'use client'

import { Hero } from '@/components/Hero'
import { Nav } from '@/components/Nav'
import type { Project } from '@/lib/types'

export type LandingProps = {
  projects?: Project[]
  loadFailed?: boolean
  openSlug?: string | null
}

// Section shells in page order. Tasks 5 to 9 fill them in.
const sectionIds = ['projects', 'about', 'experience', 'education', 'impressions', 'contact']

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- props are used from Task 5 on
export function Landing(props: LandingProps) {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        {sectionIds.map((id) => (
          <section key={id} id={id} className="scroll-mt-16" />
        ))}
      </main>
    </>
  )
}

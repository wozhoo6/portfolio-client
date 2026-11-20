import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Landing } from '@/components/Landing'
import { site } from '@/data/content'
import { loadProjects } from '@/lib/server-projects'

type Props = PageProps<'/projects/[slug]'>

// No generateStaticParams on purpose: with Cache Components it must return at least one
// slug, and the slugs come from the API, which may be asleep at build time. Without it the
// slug is read per request (inside Suspense below) and the project list comes from the
// same one-minute cache the home page uses.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { projects } = await loadProjects()
  const project = projects.find((p) => p.slug === slug)
  if (!project) return {}

  const title = `${project.title} | ${site.name}`
  return {
    title,
    description: project.summary,
    openGraph: {
      title,
      description: project.summary,
      type: 'website',
      images: project.thumbnail_url ? [project.thumbnail_url] : undefined,
    },
  }
}

export default function ProjectPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProjectView params={params} />
    </Suspense>
  )
}

async function ProjectView({ params }: { params: Props['params'] }) {
  const { slug } = await params
  const { projects, failed } = await loadProjects()

  // When the API could not be reached we cannot tell whether the slug exists, so open the
  // page anyway and let the browser look the project up. Otherwise an unknown slug is a 404.
  if (!failed && !projects.some((project) => project.slug === slug)) notFound()

  return <Landing projects={projects} loadFailed={failed} openSlug={slug} />
}

import { cacheLife } from 'next/cache'
import { getProjects } from '@/lib/api'
import type { Project } from '@/lib/types'

// Render's free plan sleeps and can take about a minute to wake. Never make the page
// (or the build) wait that long: give up and let the browser load the projects instead.
const API_TIMEOUT_MS = 10_000

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('API timed out')), ms)
  })
  return Promise.race([work, timeout]).finally(() => clearTimeout(timer))
}

async function getCachedProjects(): Promise<Project[]> {
  'use cache'
  // Refresh in the background about once a minute. `expire` and `stale` are at least
  // 5 minutes so Next keeps this in the prerendered page instead of making it a
  // request-time hole (see node_modules/next/dist/docs: cacheLife, "Prerendering behavior").
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 })
  return withTimeout(getProjects(), API_TIMEOUT_MS)
}

/** Server-side project list for the home page. Never throws. */
export async function loadProjects(): Promise<{ projects: Project[]; failed: boolean }> {
  try {
    return { projects: await getCachedProjects(), failed: false }
  } catch {
    return { projects: [], failed: true }
  }
}

import type { Impression, Page, Project } from '@/lib/types'

export type ReactionType = 'like' | 'love' | 'fire' | 'clap'

export class ApiError extends Error {
  status: number
  errors: Record<string, string[]> | null

  constructor(status: number, message: string, errors: Record<string, string[]> | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

/** API root ending in `/api`. The server may override it with API_URL. */
export function apiBase(): string {
  const raw = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ''
  return raw.replace(/\/+$/, '')
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  })

  if (!res.ok) {
    let body: { message?: string; errors?: Record<string, string[]> } = {}
    try {
      body = await res.json()
    } catch {
      // the error body was not JSON; fall back to the status text
    }
    throw new ApiError(res.status, body.message ?? res.statusText, body.errors ?? null)
  }

  return (await res.json()) as T
}

export async function getProjects(): Promise<Project[]> {
  const body = await request<{ data: Project[] }>('/v1/projects')
  return body.data
}

export async function getProject(slug: string): Promise<Project | null> {
  try {
    const body = await request<{ data: Project }>(`/v1/projects/${encodeURIComponent(slug)}`)
    return body.data
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

/** Never throws: callers get an empty list and a flag instead. */
export async function safeGetProjects(): Promise<{ projects: Project[]; failed: boolean }> {
  try {
    return { projects: await getProjects(), failed: false }
  } catch {
    return { projects: [], failed: true }
  }
}

/** Fire and forget. The server counts one view per visitor every 30 minutes. */
export async function recordView(slug: string): Promise<void> {
  try {
    await request(`/v1/projects/${encodeURIComponent(slug)}/view`, { method: 'POST' })
  } catch {
    // a missed view count must never affect the page
  }
}

export async function toggleReaction(
  slug: string,
  type: ReactionType,
): Promise<{ active: boolean; total: number }> {
  const body = await request<{ active: boolean; total: number }>(
    `/v1/projects/${encodeURIComponent(slug)}/reactions`,
    { method: 'POST', body: JSON.stringify({ type }) },
  )
  return { active: body.active, total: body.total }
}

export async function getImpressions(q: {
  scope?: 'portfolio'
  project?: string
  page?: number
}): Promise<Page<Impression>> {
  const params = new URLSearchParams()
  if (q.scope) params.set('scope', q.scope)
  if (q.project) params.set('project', q.project)
  params.set('page', String(q.page ?? 1))

  const body = await request<{
    data: Impression[]
    meta: { current_page: number; last_page: number; total: number }
  }>(`/v1/impressions?${params.toString()}`)

  return {
    items: body.data,
    page: body.meta.current_page,
    lastPage: body.meta.last_page,
    total: body.meta.total,
  }
}

export async function postImpression(b: {
  name: string
  message: string
  isEmployer: boolean
  projectSlug?: string
}): Promise<Impression> {
  const body = await request<{ data: Impression }>('/v1/impressions', {
    method: 'POST',
    body: JSON.stringify({
      name: b.name,
      message: b.message,
      is_employer: b.isEmployer,
      project_slug: b.projectSlug ?? null,
      website: '',
    }),
  })
  return body.data
}

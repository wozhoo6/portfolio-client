import { ApiError, request } from '@/lib/api'
import type { AdminImpression, AdminProject, Page, ProjectPayload, Stats } from '@/lib/types'

type Paginated<T> = {
  data: T[]
  meta: { current_page: number; last_page: number; total: number }
}

export type AdminApi = {
  stats(): Promise<Stats>
  runRollup(): Promise<{ ok: boolean; output: string }>
  listProjects(q: {
    status?: 'active' | 'inactive'
    featured?: boolean
    search?: string
    page?: number
  }): Promise<Page<AdminProject>>
  createProject(body: ProjectPayload): Promise<AdminProject>
  updateProject(id: number, body: Partial<ProjectPayload>): Promise<AdminProject>
  activateProject(id: number): Promise<AdminProject>
  deactivateProject(id: number): Promise<AdminProject>
  listImpressions(page: number): Promise<Page<AdminImpression>>
  hideImpression(id: number): Promise<AdminImpression>
  showImpression(id: number): Promise<AdminImpression>
  deleteImpression(id: number): Promise<void>
}

function toPage<T>(body: Paginated<T>): Page<T> {
  return {
    items: body.data,
    page: body.meta.current_page,
    lastPage: body.meta.last_page,
    total: body.meta.total,
  }
}

/** Every call sends the token; a 401 calls onUnauthorized and still throws. */
export function createAdminApi(token: string, onUnauthorized: () => void): AdminApi {
  async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
    try {
      return await request<T>(`/admin${path}`, { ...init, headers: { 'X-Admin-Token': token } })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) onUnauthorized()
      throw error
    }
  }

  const send = (method: string, body?: unknown): RequestInit => ({
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })

  return {
    async stats() {
      const stats = await call<Stats>('/stats')
      return {
        ...stats,
        daily: stats.daily.map((row) => ({
          ...row,
          views: Number(row.views),
          unique_visitors: Number(row.unique_visitors),
        })),
      }
    },

    runRollup: () => call('/rollup', send('POST')),

    async listProjects(q) {
      const params = new URLSearchParams()
      if (q.status) params.set('status', q.status)
      if (q.featured !== undefined) params.set('featured', q.featured ? '1' : '0')
      if (q.search) params.set('search', q.search)
      params.set('page', String(q.page ?? 1))
      return toPage(await call<Paginated<AdminProject>>(`/projects?${params.toString()}`))
    },

    async createProject(body) {
      return (await call<{ data: AdminProject }>('/projects', send('POST', body))).data
    },

    async updateProject(id, body) {
      return (await call<{ data: AdminProject }>(`/projects/${id}`, send('PATCH', body))).data
    },

    async activateProject(id) {
      return (await call<{ data: AdminProject }>(`/projects/${id}/activate`, send('PATCH'))).data
    },

    async deactivateProject(id) {
      return (await call<{ data: AdminProject }>(`/projects/${id}/deactivate`, send('PATCH'))).data
    },

    async listImpressions(page) {
      return toPage(await call<Paginated<AdminImpression>>(`/impressions?page=${page}`))
    },

    async hideImpression(id) {
      return (await call<{ data: AdminImpression }>(`/impressions/${id}/hide`, send('PATCH'))).data
    },

    async showImpression(id) {
      return (await call<{ data: AdminImpression }>(`/impressions/${id}/show`, send('PATCH'))).data
    },

    async deleteImpression(id) {
      await call<void>(`/impressions/${id}`, send('DELETE'))
    },
  }
}

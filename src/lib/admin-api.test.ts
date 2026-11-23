import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { ApiError } from '@/lib/api'
import { createAdminApi } from '@/lib/admin-api'

const BASE = 'http://api.test/api'
const TOKEN = 'secret-token'

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const meta = { current_page: 2, last_page: 5, total: 90 }

let fetchMock: ReturnType<typeof vi.fn>
let onUnauthorized: Mock<() => void>

beforeEach(() => {
  delete process.env.API_URL
  process.env.NEXT_PUBLIC_API_URL = BASE
  fetchMock = vi.fn()
  onUnauthorized = vi.fn<() => void>()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function lastCall() {
  const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1]
  return { url: new URL(url), init }
}

describe('createAdminApi', () => {
  it('sends X-Admin-Token to {base}/admin/...', async () => {
    fetchMock.mockResolvedValue(json({ totals: {}, top_projects: [], daily: [] }))
    await createAdminApi(TOKEN, onUnauthorized).stats()

    const { url, init } = lastCall()
    expect(url.href).toBe(`${BASE}/admin/stats`)
    expect(init.headers['X-Admin-Token']).toBe(TOKEN)
  })

  it('turns text numbers in stats.daily into numbers', async () => {
    fetchMock.mockResolvedValue(
      json({ totals: {}, top_projects: [], daily: [{ stat_date: '2026-11-20', views: '5', unique_visitors: '3' }] }),
    )
    const stats = await createAdminApi(TOKEN, onUnauthorized).stats()
    expect(stats.daily[0]).toEqual({ stat_date: '2026-11-20', views: 5, unique_visitors: 3 })
  })

  it('calls onUnauthorized and throws ApiError 401 on a 401', async () => {
    fetchMock.mockResolvedValue(json({ message: 'Unauthorized' }, 401))
    const attempt = createAdminApi(TOKEN, onUnauthorized).stats()

    await expect(attempt).rejects.toBeInstanceOf(ApiError)
    await expect(attempt).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).toHaveBeenCalled()
  })

  it('does not call onUnauthorized for other errors', async () => {
    fetchMock.mockResolvedValue(json({ message: 'Server error' }, 500))
    await expect(createAdminApi(TOKEN, onUnauthorized).stats()).rejects.toMatchObject({ status: 500 })
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('runRollup is a POST to /admin/rollup', async () => {
    fetchMock.mockResolvedValue(json({ ok: true, output: 'done' }))
    const result = await createAdminApi(TOKEN, onUnauthorized).runRollup()

    expect(result).toEqual({ ok: true, output: 'done' })
    expect(lastCall().init.method).toBe('POST')
    expect(lastCall().url.pathname).toBe('/api/admin/rollup')
  })

  it('listProjects sends the filters and page and maps the pagination', async () => {
    fetchMock.mockResolvedValue(json({ data: [{ id: 1 }], meta }))
    const page = await createAdminApi(TOKEN, onUnauthorized).listProjects({
      status: 'inactive',
      featured: true,
      search: 'cisco',
      page: 2,
    })

    const { url } = lastCall()
    expect(url.pathname).toBe('/api/admin/projects')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      status: 'inactive',
      featured: '1',
      search: 'cisco',
      page: '2',
    })
    expect(page).toEqual({ items: [{ id: 1 }], page: 2, lastPage: 5, total: 90 })
  })

  it('createProject is a JSON POST and returns the unwrapped project', async () => {
    fetchMock.mockResolvedValue(json({ data: { id: 7, title: 'New' } }, 201))
    const body = { title: 'New' } as never
    const created = await createAdminApi(TOKEN, onUnauthorized).createProject(body)

    const { init, url } = lastCall()
    expect(created).toEqual({ id: 7, title: 'New' })
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(init.body)).toEqual({ title: 'New' })
    expect(url.pathname).toBe('/api/admin/projects')
  })

  it('updateProject, activate and deactivate are PATCH requests to their paths', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(json({ data: { id: 3 } })))
    const api = createAdminApi(TOKEN, onUnauthorized)

    await api.updateProject(3, { summary: 'Changed' })
    expect(lastCall().init.method).toBe('PATCH')
    expect(lastCall().url.pathname).toBe('/api/admin/projects/3')
    expect(JSON.parse(lastCall().init.body)).toEqual({ summary: 'Changed' })

    await api.activateProject(3)
    expect(lastCall().init.method).toBe('PATCH')
    expect(lastCall().url.pathname).toBe('/api/admin/projects/3/activate')

    await api.deactivateProject(3)
    expect(lastCall().url.pathname).toBe('/api/admin/projects/3/deactivate')
  })

  it('listImpressions requests the page and maps the pagination', async () => {
    fetchMock.mockResolvedValue(json({ data: [{ id: 9, is_visible: false }], meta }))
    const page = await createAdminApi(TOKEN, onUnauthorized).listImpressions(2)

    expect(lastCall().url.pathname).toBe('/api/admin/impressions')
    expect(lastCall().url.searchParams.get('page')).toBe('2')
    expect(page.items).toEqual([{ id: 9, is_visible: false }])
    expect(page.lastPage).toBe(5)
  })

  it('hide and show are PATCH requests that return the unwrapped note', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(json({ data: { id: 4, is_visible: false } })))
    const api = createAdminApi(TOKEN, onUnauthorized)

    const hidden = await api.hideImpression(4)
    expect(hidden).toEqual({ id: 4, is_visible: false })
    expect(lastCall().init.method).toBe('PATCH')
    expect(lastCall().url.pathname).toBe('/api/admin/impressions/4/hide')

    await api.showImpression(4)
    expect(lastCall().url.pathname).toBe('/api/admin/impressions/4/show')
  })

  it('deleteImpression is a DELETE that accepts an empty 204 response', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))
    await expect(createAdminApi(TOKEN, onUnauthorized).deleteImpression(4)).resolves.toBeUndefined()

    expect(lastCall().init.method).toBe('DELETE')
    expect(lastCall().url.pathname).toBe('/api/admin/impressions/4')
  })
})

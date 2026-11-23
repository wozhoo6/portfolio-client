import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  apiBase,
  getImpressions,
  getProject,
  getProjects,
  postImpression,
  recordView,
  request,
  safeGetProjects,
  toggleReaction,
} from '@/lib/api'
import type { Impression, Project } from '@/lib/types'

const BASE = 'http://api.test/api'

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function project(over: Partial<Project> = {}): Project {
  return {
    slug: 'kape-cisco',
    title: 'Kape Cisco',
    summary: 'QR ordering',
    description: null,
    role: null,
    type: null,
    problem: null,
    solution: null,
    key_features: [],
    tech_stack: [],
    repo_url: null,
    live_url: null,
    thumbnail_url: null,
    is_featured: false,
    view_count: 0,
    reactions_count: 0,
    links: [],
    created_at: '2026-11-20T00:00:00+00:00',
    ...over,
  }
}

function note(over: Partial<Impression> = {}): Impression {
  return {
    id: 1,
    name: 'Maria',
    is_employer: false,
    message: 'Nice work',
    project_slug: null,
    created_at: '2026-11-20T00:00:00+00:00',
    ...over,
  }
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  delete process.env.API_URL
  process.env.NEXT_PUBLIC_API_URL = BASE
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('apiBase', () => {
  it('prefers API_URL and drops a trailing slash', () => {
    process.env.API_URL = 'http://server.test/api/'
    expect(apiBase()).toBe('http://server.test/api')
  })

  it('falls back to NEXT_PUBLIC_API_URL', () => {
    expect(apiBase()).toBe(BASE)
  })
})

describe('request', () => {
  it('returns undefined for a 204 response with no body', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))
    await expect(request('/admin/impressions/1', { method: 'DELETE' })).resolves.toBeUndefined()
  })
})

describe('getProjects', () => {
  it('returns the data array from GET {base}/v1/projects with an Accept header', async () => {
    fetchMock.mockResolvedValue(json({ data: [project()] }))

    const result = await getProjects()

    expect(result).toEqual([project()])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/v1/projects`)
    expect(init.headers.Accept).toBe('application/json')
  })
})

describe('getProject', () => {
  it('returns the project from {base}/v1/projects/{slug}', async () => {
    fetchMock.mockResolvedValue(json({ data: project() }))
    expect(await getProject('kape-cisco')).toEqual(project())
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/v1/projects/kape-cisco`)
  })

  it('returns null on a 404', async () => {
    fetchMock.mockResolvedValue(json({ message: 'Not Found' }, 404))
    expect(await getProject('nope')).toBeNull()
  })
})

describe('safeGetProjects', () => {
  it('returns the projects with failed false on success', async () => {
    fetchMock.mockResolvedValue(json({ data: [project()] }))
    expect(await safeGetProjects()).toEqual({ projects: [project()], failed: false })
  })

  it('returns an empty list with failed true when fetch rejects', async () => {
    fetchMock.mockRejectedValue(new TypeError('network down'))
    expect(await safeGetProjects()).toEqual({ projects: [], failed: true })
  })

  it('returns an empty list with failed true on a 500', async () => {
    fetchMock.mockResolvedValue(json({ message: 'Server Error' }, 500))
    expect(await safeGetProjects()).toEqual({ projects: [], failed: true })
  })
})

describe('recordView', () => {
  it('POSTs to {base}/v1/projects/{slug}/view', async () => {
    fetchMock.mockResolvedValue(json({ counted: true }, 202))
    await recordView('kape-cisco')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/v1/projects/kape-cisco/view`)
    expect(init.method).toBe('POST')
  })

  it('resolves without throwing when fetch rejects', async () => {
    fetchMock.mockRejectedValue(new TypeError('network down'))
    await expect(recordView('kape-cisco')).resolves.toBeUndefined()
  })
})

describe('toggleReaction', () => {
  it('POSTs {type} and returns only {active, total}', async () => {
    fetchMock.mockResolvedValue(json({ active: true, total: 3, by_type: { fire: 3 } }))

    const result = await toggleReaction('kape-cisco', 'fire')

    expect(result).toEqual({ active: true, total: 3 })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/v1/projects/kape-cisco/reactions`)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ type: 'fire' })
    expect(init.headers['Content-Type']).toBe('application/json')
  })
})

describe('getImpressions', () => {
  const page = (over = {}) => ({
    data: [note()],
    meta: { current_page: 2, last_page: 5, total: 42 },
    ...over,
  })

  it('sends scope=portfolio and the page, and maps meta to {page, lastPage, total}', async () => {
    fetchMock.mockResolvedValue(json(page()))

    const result = await getImpressions({ scope: 'portfolio', page: 2 })

    expect(result).toEqual({ items: [note()], page: 2, lastPage: 5, total: 42 })
    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.pathname).toBe('/api/v1/impressions')
    expect(url.searchParams.get('scope')).toBe('portfolio')
    expect(url.searchParams.get('page')).toBe('2')
  })

  it('sends project=slug and defaults the page to 1', async () => {
    fetchMock.mockResolvedValue(json(page()))

    await getImpressions({ project: 'kape-cisco' })

    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.searchParams.get('project')).toBe('kape-cisco')
    expect(url.searchParams.has('scope')).toBe(false)
    expect(url.searchParams.get('page')).toBe('1')
  })
})

describe('postImpression', () => {
  it('sends name, message, is_employer, project_slug and an empty website field', async () => {
    fetchMock.mockResolvedValue(json({ data: note({ project_slug: 'kape-cisco' }) }, 201))

    const result = await postImpression({
      name: 'Maria',
      message: 'Nice work',
      isEmployer: true,
      projectSlug: 'kape-cisco',
    })

    expect(result).toEqual(note({ project_slug: 'kape-cisco' }))
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/v1/impressions`)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({
      name: 'Maria',
      message: 'Nice work',
      is_employer: true,
      project_slug: 'kape-cisco',
      website: '',
    })
  })

  it('sends project_slug as null for a page-level note', async () => {
    fetchMock.mockResolvedValue(json({ data: note() }, 201))
    await postImpression({ name: 'Maria', message: 'Nice work', isEmployer: false })
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).project_slug).toBeNull()
  })

  it('sends the website value it is given as the honeypot field', async () => {
    fetchMock.mockResolvedValue(json({ data: note() }, 201))
    await postImpression({ name: 'Bot', message: 'Buy now', isEmployer: false, website: 'http://spam.test' })
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).website).toBe('http://spam.test')
  })

  it('returns null when the API accepts the note without data (honeypot)', async () => {
    fetchMock.mockResolvedValue(json({ message: 'Thanks!' }, 202))
    const result = await postImpression({ name: 'Bot', message: 'Buy now', isEmployer: false, website: 'x' })
    expect(result).toBeNull()
  })

  it('throws ApiError 422 carrying the field errors', async () => {
    fetchMock.mockResolvedValue(
      json(
        { message: 'The message field is required.', errors: { message: ['The message field is required.'] } },
        422,
      ),
    )

    const attempt = postImpression({ name: 'Maria', message: '', isEmployer: false })

    await expect(attempt).rejects.toBeInstanceOf(ApiError)
    await expect(attempt).rejects.toMatchObject({
      status: 422,
      errors: { message: ['The message field is required.'] },
    })
  })

  it('throws ApiError 429 when rate limited', async () => {
    fetchMock.mockResolvedValue(json({ message: 'Too Many Attempts.' }, 429))

    const attempt = postImpression({ name: 'Maria', message: 'Hello', isEmployer: false })

    await expect(attempt).rejects.toBeInstanceOf(ApiError)
    await expect(attempt).rejects.toMatchObject({ status: 429, errors: null })
  })
})

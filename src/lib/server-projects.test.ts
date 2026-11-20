import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cacheLife } from 'next/cache'
import { getProjects } from '@/lib/api'
import { loadProjects } from '@/lib/server-projects'
import type { Project } from '@/lib/types'

vi.mock('next/cache', () => ({ cacheLife: vi.fn() }))
vi.mock('@/lib/api', () => ({ getProjects: vi.fn() }))

const sample = [{ slug: 'kape-cisco', title: 'Kape Cisco' }] as Project[]

beforeEach(() => {
  vi.mocked(getProjects).mockReset()
  vi.mocked(cacheLife).mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('loadProjects', () => {
  it('returns the projects with failed false', async () => {
    vi.mocked(getProjects).mockResolvedValue(sample)
    expect(await loadProjects()).toEqual({ projects: sample, failed: false })
  })

  it('returns an empty list with failed true when the API errors', async () => {
    vi.mocked(getProjects).mockRejectedValue(new Error('500'))
    expect(await loadProjects()).toEqual({ projects: [], failed: true })
  })

  it('gives up after 10 seconds when the API is asleep and never answers', async () => {
    vi.useFakeTimers()
    vi.mocked(getProjects).mockReturnValue(new Promise(() => {}))

    const pending = loadProjects()
    await vi.advanceTimersByTimeAsync(10_000)

    expect(await pending).toEqual({ projects: [], failed: true })
  })

  it('refreshes every minute but keeps the entry at least 5 minutes so it stays in the prerendered page', async () => {
    vi.mocked(getProjects).mockResolvedValue(sample)
    await loadProjects()

    const profile = vi.mocked(cacheLife).mock.calls[0][0] as unknown as {
      revalidate: number
      expire: number
      stale: number
    }
    expect(profile.revalidate).toBe(60)
    expect(profile.expire).toBeGreaterThanOrEqual(300)
    expect(profile.stale).toBeGreaterThanOrEqual(300)
  })
})

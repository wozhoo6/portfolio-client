import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useActiveSection } from '@/lib/useActiveSection'

class FakeObserver {
  static instances: FakeObserver[] = []
  observed: Element[] = []
  disconnected = false
  callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    FakeObserver.instances.push(this)
  }
  observe(el: Element) {
    this.observed.push(el)
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true
  }
  takeRecords() {
    return []
  }

  /** Simulates the browser reporting that a section entered or left view. */
  report(id: string, isIntersecting: boolean) {
    const target = document.getElementById(id) as Element
    const entry = { isIntersecting, target } as IntersectionObserverEntry
    act(() => this.callback([entry], this as unknown as IntersectionObserver))
  }
}

beforeEach(() => {
  FakeObserver.instances = []
  vi.stubGlobal('IntersectionObserver', FakeObserver)
  document.body.innerHTML = '<section id="projects"></section><section id="about"></section>'
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('useActiveSection', () => {
  it('returns null before any section is visible', () => {
    const { result } = renderHook(() => useActiveSection(['projects', 'about']))
    expect(result.current).toBeNull()
  })

  it('observes the sections that exist and ignores ids that are missing', () => {
    renderHook(() => useActiveSection(['projects', 'about', 'nope']))
    expect(FakeObserver.instances[0].observed.map((el) => el.id)).toEqual(['projects', 'about'])
  })

  it('returns the section that becomes visible and switches when another does', () => {
    const { result } = renderHook(() => useActiveSection(['projects', 'about']))
    const observer = FakeObserver.instances[0]

    observer.report('projects', true)
    expect(result.current).toBe('projects')

    observer.report('about', true)
    expect(result.current).toBe('about')
  })

  it('keeps the last active section when nothing is visible', () => {
    const { result } = renderHook(() => useActiveSection(['projects', 'about']))
    const observer = FakeObserver.instances[0]

    observer.report('about', true)
    observer.report('about', false)

    expect(result.current).toBe('about')
  })

  it('stops observing on unmount', () => {
    const { unmount } = renderHook(() => useActiveSection(['projects', 'about']))
    unmount()
    expect(FakeObserver.instances[0].disconnected).toBe(true)
  })

  it('returns null without throwing when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const { result } = renderHook(() => useActiveSection(['projects', 'about']))
    expect(result.current).toBeNull()
  })
})

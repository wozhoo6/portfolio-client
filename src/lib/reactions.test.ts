import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { REACTION_TYPES, getReacted, setReacted } from '@/lib/reactions'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('REACTION_TYPES', () => {
  it('lists the four types the API accepts', () => {
    expect(REACTION_TYPES).toEqual(['like', 'love', 'fire', 'clap'])
  })
})

describe('getReacted', () => {
  it('returns [] when nothing is stored', () => {
    expect(getReacted('kape-cisco')).toEqual([])
  })

  it('returns [] when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })
    expect(getReacted('kape-cisco')).toEqual([])
  })

  it('returns [] when the stored JSON is corrupt', () => {
    localStorage.setItem('reactions:kape-cisco', '{not json')
    expect(getReacted('kape-cisco')).toEqual([])
  })

  it('returns [] when the stored JSON is not a list', () => {
    localStorage.setItem('reactions:kape-cisco', '"fire"')
    expect(getReacted('kape-cisco')).toEqual([])
  })

  it('ignores stored values that are not reaction types', () => {
    localStorage.setItem('reactions:kape-cisco', JSON.stringify(['fire', 'bogus', 7]))
    expect(getReacted('kape-cisco')).toEqual(['fire'])
  })
})

describe('setReacted', () => {
  it('adds then removes a type for one project', () => {
    setReacted('kape-cisco', 'fire', true)
    expect(getReacted('kape-cisco')).toEqual(['fire'])

    setReacted('kape-cisco', 'love', true)
    expect([...getReacted('kape-cisco')].sort()).toEqual(['fire', 'love'])

    setReacted('kape-cisco', 'fire', false)
    expect(getReacted('kape-cisco')).toEqual(['love'])
  })

  it('keeps each project separate', () => {
    setReacted('kape-cisco', 'fire', true)
    expect(getReacted('review-hub')).toEqual([])
  })

  it('does not store the same type twice', () => {
    setReacted('kape-cisco', 'fire', true)
    setReacted('kape-cisco', 'fire', true)
    expect(getReacted('kape-cisco')).toEqual(['fire'])
  })

  it('does not throw when localStorage refuses to write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    expect(() => setReacted('kape-cisco', 'fire', true)).not.toThrow()
  })
})

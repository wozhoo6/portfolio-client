import { describe, expect, it } from 'vitest'
import { timeAgo } from '@/lib/format'

const now = new Date('2026-11-20T12:00:00Z')

function ago(seconds: number): string {
  return new Date(now.getTime() - seconds * 1000).toISOString()
}

const MIN = 60
const HOUR = 60 * MIN
const DAY = 24 * HOUR

describe('timeAgo', () => {
  it('says "just now" under a minute', () => {
    expect(timeAgo(ago(0), now)).toBe('just now')
    expect(timeAgo(ago(59), now)).toBe('just now')
  })

  it('says "just now" for a time slightly in the future (clock skew)', () => {
    expect(timeAgo(ago(-30), now)).toBe('just now')
  })

  it('counts minutes', () => {
    expect(timeAgo(ago(MIN), now)).toBe('1 minute ago')
    expect(timeAgo(ago(5 * MIN), now)).toBe('5 minutes ago')
    expect(timeAgo(ago(59 * MIN + 59), now)).toBe('59 minutes ago')
  })

  it('counts hours', () => {
    expect(timeAgo(ago(HOUR), now)).toBe('1 hour ago')
    expect(timeAgo(ago(3 * HOUR), now)).toBe('3 hours ago')
    expect(timeAgo(ago(23 * HOUR + 59 * MIN), now)).toBe('23 hours ago')
  })

  it('counts days', () => {
    expect(timeAgo(ago(DAY), now)).toBe('1 day ago')
    expect(timeAgo(ago(2 * DAY), now)).toBe('2 days ago')
    expect(timeAgo(ago(6 * DAY), now)).toBe('6 days ago')
  })

  it('counts weeks', () => {
    expect(timeAgo(ago(7 * DAY), now)).toBe('1 week ago')
    expect(timeAgo(ago(21 * DAY), now)).toBe('3 weeks ago')
  })
})

import { describe, expect, it } from 'vitest'
import {
  certificates,
  education,
  experience,
  isComplete,
  navLinks,
  site,
  visibleEntries,
} from '@/data/content'

describe('isComplete', () => {
  it('is true when every field has text', () => {
    expect(isComplete({ title: 'BS Computer Science', school: 'Tomas Claudio Colleges' })).toBe(true)
  })

  it('is false when any field is empty', () => {
    expect(isComplete({ title: 'BS Computer Science', school: '' })).toBe(false)
  })

  it('is false when a field is only spaces', () => {
    expect(isComplete({ title: 'BS Computer Science', school: '   ' })).toBe(false)
  })
})

describe('visibleEntries', () => {
  it('keeps complete entries and drops the unfilled High school entry', () => {
    const shown = visibleEntries(education)
    expect(shown.map((e) => e.school)).toEqual([
      'Tomas Claudio Colleges',
      'De La Salle University – Dasmariñas',
    ])
  })

  it('drops the unfilled TESDA certificate', () => {
    expect(visibleEntries(certificates)).toEqual([])
  })
})

describe('navLinks', () => {
  it('has the five sections in order, with contact last', () => {
    expect(navLinks.map((l) => l.id)).toEqual([
      'projects',
      'about',
      'experience',
      'education',
      'contact',
    ])
  })
})

describe('site', () => {
  it('uses the approved title and keeps the resume button off until a file exists', () => {
    expect(site.title).toBe('Full Stack Developer / Systems Solutions Analyst')
    expect(site.resumeAvailable).toBe(false)
  })
})

describe('experience', () => {
  it('lists NetGlobal, Streamsoft and ExaWeb newest first, the first two current', () => {
    expect(experience.map((e) => e.company)).toEqual([
      'NetGlobal Solutions Inc.',
      'Streamsoft Inc.',
      'ExaWeb Corporation',
    ])
    expect(experience.map((e) => e.current)).toEqual([true, true, false])
  })
})

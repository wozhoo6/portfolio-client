import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Landing } from '@/components/Landing'

describe('Landing', () => {
  it('renders the nav and the hero', () => {
    render(<Landing />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Warren Tabora' })).toBeInTheDocument()
  })

  it('has a section for each nav target, in page order', () => {
    const { container } = render(<Landing />)
    const ids = [...container.querySelectorAll('main > section[id]')].map((s) => s.id)
    expect(ids).toEqual(['projects', 'about', 'experience', 'education', 'impressions', 'contact'])
  })
})

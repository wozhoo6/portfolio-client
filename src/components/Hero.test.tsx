import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Hero } from '@/components/Hero'
import { hero, site } from '@/data/content'

describe('Hero', () => {
  it('shows the name as the only h1', () => {
    render(<Hero />)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent('Warren Tabora')
  })

  it('shows the title, the availability pill and the intro', () => {
    render(<Hero />)
    expect(screen.getByText(site.title)).toBeInTheDocument()
    expect(screen.getByText(hero.pill)).toBeInTheDocument()
    expect(screen.getByText(hero.intro)).toBeInTheDocument()
  })

  it('shows the portrait with descriptive alt text', () => {
    render(<Hero />)
    const portrait = screen.getByRole('img', { name: 'Portrait of Warren Tabora' })
    expect(portrait).toHaveAttribute('src', '/portrait.jpg')
  })

  it('swaps in a placeholder when the portrait file is missing', () => {
    render(<Hero />)
    fireEvent.error(screen.getByRole('img', { name: 'Portrait of Warren Tabora' }))

    expect(screen.queryByRole('img', { name: 'Portrait of Warren Tabora' })).toBeNull()
    expect(screen.getByRole('img', { name: 'Portrait placeholder' })).toBeInTheDocument()
  })
})

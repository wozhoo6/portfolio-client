import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Nav } from '@/components/Nav'
import { useActiveSection } from '@/lib/useActiveSection'

vi.mock('@/lib/useActiveSection', () => ({ useActiveSection: vi.fn() }))

beforeEach(() => {
  vi.mocked(useActiveSection).mockReturnValue(null)
})

describe('Nav', () => {
  it('lists Projects, About, Experience, Education and Contact in order, linking to their sections', () => {
    render(<Nav />)
    const links = within(screen.getByRole('navigation')).getAllByRole('link')

    expect(links.map((a) => a.textContent)).toEqual([
      'Projects',
      'About',
      'Experience',
      'Education',
      'Contact',
    ])
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '#projects',
      '#about',
      '#experience',
      '#education',
      '#contact',
    ])
  })

  it('has no logo or "WT" mark', () => {
    const { container } = render(<Nav />)
    expect(container.textContent).not.toMatch(/\bWT\b/)
  })

  it('has a phone menu button that opens and closes the list', async () => {
    const user = userEvent.setup()
    render(<Nav />)
    const button = screen.getByRole('button', { name: 'Menu' })

    expect(button).toHaveAttribute('aria-expanded', 'false')
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the open menu when a link is clicked', async () => {
    const user = userEvent.setup()
    render(<Nav />)
    const button = screen.getByRole('button', { name: 'Menu' })

    await user.click(button)
    await user.click(screen.getByRole('link', { name: 'About' }))

    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('marks only the link of the active section with aria-current="true"', () => {
    vi.mocked(useActiveSection).mockReturnValue('about')
    render(<Nav />)

    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: 'Projects' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Contact' })).not.toHaveAttribute('aria-current')
  })
})

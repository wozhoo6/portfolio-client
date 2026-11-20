import { useEffect, useState } from 'react'

/**
 * Scroll-spy: returns the id of the section currently near the top of the screen,
 * or null until one is. Sections whose ids are missing from the page are ignored.
 */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join(',')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const elements = (key ? key.split(',') : [])
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    // A thin band just above the middle of the screen decides which section is "current".
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length > 0) setActive(visible[visible.length - 1].target.id)
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [key])

  return active
}

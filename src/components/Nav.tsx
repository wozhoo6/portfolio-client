'use client'

import { useState } from 'react'
import { navLinks } from '@/data/content'
import { useActiveSection } from '@/lib/useActiveSection'

const sectionIds = navLinks.map((link) => link.id)

const linkClass =
  'block border-b-2 border-transparent py-3 text-base text-muted transition-colors hover:text-text ' +
  'aria-[current=true]:border-primary aria-[current=true]:text-text ' +
  'md:inline-block md:py-0.5 md:text-[15px] md:font-medium'

const contactClass =
  'mt-3 block rounded-lg border-b-[3px] border-[#6D3FD1] bg-primary px-4 py-2 text-center text-base ' +
  'font-semibold text-white transition hover:brightness-110 ' +
  'md:mt-0 md:inline-block md:py-1.5 md:text-[15px]'

export function Nav() {
  const [open, setOpen] = useState(false)
  const active = useActiveSection(sectionIds)

  return (
    <nav aria-label="Primary" className="sticky top-0 z-40 border-b border-card bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-end px-6 md:justify-center">
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((value) => !value)}
          className="-mr-2 rounded-md p-2 text-text md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <ul
          id="nav-links"
          className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col border-b border-card bg-surface px-6 pb-4 md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0`}
        >
          {navLinks.map((link) => (
            <li key={link.id} className="border-b border-card last:border-0 md:border-0">
              <a
                href={`#${link.id}`}
                aria-current={active === link.id ? 'true' : undefined}
                onClick={() => setOpen(false)}
                className={link.id === 'contact' ? contactClass : linkClass}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

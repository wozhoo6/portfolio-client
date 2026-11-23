'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { contact } from '@/data/content'
import { pickEmailHref } from '@/lib/contact'
import { ghostButton, primaryButton } from '@/lib/ui'

const phoneQuery = '(max-width: 767px)'

function subscribePhone(onChange: () => void) {
  const query = window.matchMedia(phoneQuery)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

const fullWidthOnPhone = 'w-full justify-center sm:w-auto'

export function Contact() {
  const isPhone = useSyncExternalStore(
    subscribePhone,
    () => window.matchMedia(phoneQuery).matches,
    () => false,
  )
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  async function handleCopy() {
    clearTimeout(resetTimer.current)
    setCopyState('copied')
    try {
      await navigator.clipboard.writeText(contact.email)
    } catch {
      setCopyState('failed')
    }
    resetTimer.current = setTimeout(() => setCopyState('idle'), 3000)
  }

  const socials = [
    { label: 'LinkedIn', url: contact.linkedin },
    { label: 'GitHub', url: contact.github },
  ].filter((link) => link.url.trim() !== '')

  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-16">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="reveal mx-auto max-w-2xl rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-tech/10 p-8 text-center md:p-12">
          <h2 id="contact-heading" className="font-heading text-3xl font-semibold">
            {contact.heading}
          </h2>
          <p className="mt-3 text-base text-muted">{contact.blurb}</p>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {contact.inquiries.map((inquiry) => (
              <a
                key={inquiry.label}
                href={pickEmailHref({ to: contact.email, subject: inquiry.subject, isPhone })}
                {...(isPhone ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                className={`${inquiry.primary ? primaryButton : ghostButton} ${fullWidthOnPhone}`}
              >
                {inquiry.label}
              </a>
            ))}
            <button type="button" onClick={() => void handleCopy()} className={`${ghostButton} ${fullWidthOnPhone}`}>
              {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy email'}
            </button>
          </div>

          <p className="mt-4 select-all font-mono text-sm text-muted">{contact.email}</p>
          <p role="status" className="mt-1 min-h-5 text-sm text-muted">
            {copyState === 'copied' && 'Email address copied.'}
            {copyState === 'failed' && 'Could not copy. Select the address above and copy it.'}
          </p>

          {socials.length > 0 && (
            <ul className="mt-4 flex justify-center gap-6 text-sm font-semibold">
              {socials.map((link) => (
                <li key={link.label}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

'use client'

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { ApiError, getImpressions, postImpression } from '@/lib/api'
import { timeAgo } from '@/lib/format'
import type { Impression, Page } from '@/lib/types'

type ImpressionsProps = {
  projectSlug?: string
  heading: string
  label?: string
  onTotal?: (total: number) => void
}

type FieldErrors = { name?: string; message?: string; form?: string }
type FormValues = { name: string; message: string; isEmployer: boolean; website: string }
type SendResult = { ok: true } | { ok: false; errors: FieldErrors }

const RATE_LIMIT_TEXT = "You've sent a few notes already. Try again later."
const GENERIC_ERROR = "Couldn't send your note. Please try again."

const primaryButton =
  'inline-flex items-center rounded-lg border-b-[3px] border-[#6D3FD1] bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110'
const ghostButton =
  'inline-flex items-center rounded-lg border border-link/50 px-4 py-2 text-sm font-semibold text-link transition hover:bg-link/10'
const inputClass =
  'w-full rounded-lg border border-white/10 bg-bg px-3 py-2 text-text placeholder:text-muted focus:border-primary focus:outline-none'

function uniqueById(notes: Impression[]): Impression[] {
  const seen = new Set<number>()
  return notes.filter((note) => !seen.has(note.id) && seen.add(note.id))
}

export function Impressions({ projectSlug, heading, label, onTotal }: ImpressionsProps) {
  const [notes, setNotes] = useState<Impression[]>([])
  const totalRef = useRef(0)
  const [pageInfo, setPageInfo] = useState({ page: 0, lastPage: 0 })
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadingMore, setLoadingMore] = useState(false)
  const [moreFailed, setMoreFailed] = useState(false)

  const [attempt, setAttempt] = useState(0)

  const query = projectSlug ? { project: projectSlug } : { scope: 'portfolio' as const }

  const setTotalTo = useCallback(
    (next: number) => {
      totalRef.current = Math.max(0, next)
      onTotal?.(totalRef.current)
    },
    [onTotal],
  )

  const applyPage = useCallback(
    (result: Page<Impression>) => {
      setNotes((current) => uniqueById([...current, ...result.items]))
      setPageInfo({ page: result.page, lastPage: result.lastPage })
      setTotalTo(result.total)
    },
    [setTotalTo],
  )

  useEffect(() => {
    let cancelled = false
    getImpressions(projectSlug ? { project: projectSlug, page: 1 } : { scope: 'portfolio', page: 1 })
      .then((result) => {
        if (cancelled) return
        applyPage(result)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [projectSlug, attempt, applyPage])

  function retry() {
    setStatus('loading')
    setAttempt((current) => current + 1)
  }

  async function loadMore() {
    setLoadingMore(true)
    setMoreFailed(false)
    try {
      applyPage(await getImpressions({ ...query, page: pageInfo.page + 1 }))
    } catch {
      setMoreFailed(true)
    } finally {
      setLoadingMore(false)
    }
  }

  async function send(values: FormValues): Promise<SendResult> {
    const tempId = -Date.now()
    const temp: Impression = {
      id: tempId,
      name: values.name,
      is_employer: values.isEmployer,
      message: values.message,
      project_slug: projectSlug ?? null,
      created_at: new Date().toISOString(),
    }
    setNotes((current) => [temp, ...current])
    setTotalTo(totalRef.current + 1)

    try {
      const saved = await postImpression({ ...values, projectSlug })
      setNotes((current) => uniqueById(current.map((note) => (note.id === tempId ? (saved ?? note) : note))))
      return { ok: true }
    } catch (error) {
      setNotes((current) => current.filter((note) => note.id !== tempId))
      setTotalTo(totalRef.current - 1)
      if (error instanceof ApiError && error.status === 429) return { ok: false, errors: { form: RATE_LIMIT_TEXT } }
      if (error instanceof ApiError && error.status === 422 && error.errors) {
        const errors: FieldErrors = { name: error.errors.name?.[0], message: error.errors.message?.[0] }
        return { ok: false, errors: errors.name || errors.message ? errors : { form: GENERIC_ERROR } }
      }
      return { ok: false, errors: { form: GENERIC_ERROR } }
    }
  }

  return (
    <div>
      {label && <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-link">{label}</h2>}
      <h3 className="mb-5 font-heading text-2xl font-semibold">{heading}</h3>

      <div className="grid gap-8 md:grid-cols-2">
        <ImpressionForm onSend={send} />

        <div>
          {status === 'loading' && <p className="text-muted">Loading notes…</p>}

          {status === 'error' && (
            <p className="text-muted">
              Couldn&apos;t load notes right now.{' '}
              <button type="button" onClick={retry} className="font-semibold text-link underline">
                Try again
              </button>
            </p>
          )}

          {status === 'ready' && notes.length === 0 && (
            <p className="text-muted">No notes yet. Yours could be the first.</p>
          )}

          {notes.length > 0 && (
            <ul className="flex flex-col gap-3">
              {notes.map((note) => (
                <li key={note.id} className="rounded-xl bg-card p-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold">{note.name ?? 'Anonymous'}</span>
                    {note.is_employer && (
                      <span className="rounded border border-tech/40 px-2 py-0.5 text-xs font-medium text-tech">
                        Employer
                      </span>
                    )}
                    <span className="text-xs text-muted">{timeAgo(note.created_at)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-line break-words text-muted">{note.message}</p>
                </li>
              ))}
            </ul>
          )}

          {status === 'ready' && pageInfo.page < pageInfo.lastPage && (
            <div className="mt-4">
              <button type="button" onClick={() => void loadMore()} disabled={loadingMore} className={ghostButton}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
              {moreFailed && <p className="mt-2 text-sm text-muted">Couldn&apos;t load more notes. Try again.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ImpressionForm({ onSend }: { onSend: (values: FormValues) => Promise<SendResult> }) {
  const id = useId()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [isEmployer, setIsEmployer] = useState(false)
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const values = { name: name.trim(), message: message.trim(), isEmployer, website }

    const found: FieldErrors = {}
    if (!values.name) found.name = 'Please enter your name.'
    if (values.message.length < 3) found.message = 'Write at least 3 characters.'
    if (found.name || found.message) {
      setErrors(found)
      return
    }

    const snapshot = { name, message, isEmployer }
    setErrors({})
    setName('')
    setMessage('')
    setIsEmployer(false)

    const result = await onSend(values)
    if (!result.ok) {
      setName(snapshot.name)
      setMessage(snapshot.message)
      setIsEmployer(snapshot.isEmployer)
      setErrors(result.errors)
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className="flex flex-col gap-4 rounded-xl bg-card p-5">
      <div>
        <label htmlFor={`${id}-name`} className="mb-1 block text-sm font-medium">
          Name
        </label>
        <input
          id={`${id}-name`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={60}
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
          className={inputClass}
        />
        {errors.name && (
          <p id={`${id}-name-error`} role="alert" className="mt-1 text-sm text-red-400">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${id}-message`} className="mb-1 block text-sm font-medium">
          Note
        </label>
        <textarea
          id={`${id}-message`}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={500}
          rows={4}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${id}-message-error` : undefined}
          className={inputClass}
        />
        <div className="mt-1 flex items-start justify-between gap-3">
          {errors.message ? (
            <p id={`${id}-message-error`} role="alert" className="text-sm text-red-400">
              {errors.message}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted">{message.length}/500</span>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isEmployer}
          onChange={(event) => setIsEmployer(event.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        I&apos;m an employer / hiring
      </label>

      <div aria-hidden="true" className="sr-only">
        <input
          name="website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={primaryButton}>
          Send note
        </button>
        {errors.form && (
          <p role="alert" className="text-sm text-red-400">
            {errors.form}
          </p>
        )}
      </div>
    </form>
  )
}

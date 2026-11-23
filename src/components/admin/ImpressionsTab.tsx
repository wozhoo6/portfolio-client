'use client'

import { useEffect, useRef, useState } from 'react'
import type { AdminApi } from '@/lib/admin-api'
import { timeAgo } from '@/lib/format'
import type { AdminImpression, Page } from '@/lib/types'

const rowButton =
  'rounded-lg border border-link/50 px-3 py-1 text-xs font-semibold text-link transition-colors hover:bg-link/10 disabled:opacity-40'
const dangerButton =
  'rounded-lg border border-red-400/60 px-3 py-1 text-xs font-semibold text-red-400 transition-colors hover:bg-red-400/10'

export function ImpressionsTab({ api }: { api: AdminApi }) {
  const [data, setData] = useState<Page<AdminImpression> | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [page, setPage] = useState(1)
  const [message, setMessage] = useState('')
  const [confirmingId, setConfirmingId] = useState<number | null>(null)

  // Same-note clicks are ignored while that note's request runs.
  const inFlight = useRef(new Set<number>())

  useEffect(() => {
    let cancelled = false
    api
      .listImpressions(page)
      .then((result) => {
        if (cancelled) return
        setData(result)
        setLoadFailed(false)
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [api, page, attempt])

  function replaceRow(id: number, change: (note: AdminImpression) => AdminImpression) {
    setData((current) =>
      current ? { ...current, items: current.items.map((item) => (item.id === id ? change(item) : item)) } : current,
    )
  }

  async function setVisible(note: AdminImpression, visible: boolean) {
    if (inFlight.current.has(note.id)) return
    inFlight.current.add(note.id)
    setMessage('')

    replaceRow(note.id, (item) => ({ ...item, is_visible: visible }))
    try {
      const saved = await (visible ? api.showImpression(note.id) : api.hideImpression(note.id))
      replaceRow(note.id, () => saved)
    } catch {
      replaceRow(note.id, (item) => ({ ...item, is_visible: note.is_visible }))
      setMessage(`Couldn't ${visible ? 'show' : 'hide'} the note from ${note.name ?? 'Anonymous'}. Try again.`)
    } finally {
      inFlight.current.delete(note.id)
    }
  }

  async function remove(note: AdminImpression) {
    if (inFlight.current.has(note.id) || !data) return
    inFlight.current.add(note.id)
    setMessage('')
    setConfirmingId(null)

    const index = data.items.findIndex((item) => item.id === note.id)
    setData((current) =>
      current
        ? { ...current, items: current.items.filter((item) => item.id !== note.id), total: Math.max(0, current.total - 1) }
        : current,
    )
    try {
      await api.deleteImpression(note.id)
    } catch {
      setData((current) => {
        if (!current || current.items.some((item) => item.id === note.id)) return current
        const items = [...current.items]
        items.splice(Math.min(Math.max(index, 0), items.length), 0, note)
        return { ...current, items, total: current.total + 1 }
      })
      setMessage(`Couldn't delete the note from ${note.name ?? 'Anonymous'}. Try again.`)
    } finally {
      inFlight.current.delete(note.id)
    }
  }

  if (!data) {
    return loadFailed ? (
      <p className="text-muted">
        Couldn&apos;t load notes.{' '}
        <button type="button" onClick={() => setAttempt((count) => count + 1)} className="font-semibold text-link underline">
          Try again
        </button>
      </p>
    ) : (
      <p className="text-muted">Loading…</p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {message && (
        <p role="alert" className="text-sm text-red-400">
          {message}
        </p>
      )}
      {loadFailed && <p className="text-sm text-muted">Couldn&apos;t refresh. Showing the last results.</p>}

      {data.items.length === 0 ? (
        <p className="text-muted">No notes yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.items.map((note) => (
            <li key={note.id} className={`rounded-xl bg-card p-4 ${note.is_visible ? '' : 'opacity-70'}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="font-semibold">{note.name ?? 'Anonymous'}</span>
                {note.is_employer && (
                  <span className="rounded border border-tech/40 px-2 py-0.5 text-xs font-medium text-tech">Employer</span>
                )}
                <span className="text-muted">{note.project_slug ?? 'page'}</span>
                <span className="text-xs text-muted">{timeAgo(note.created_at)}</span>
                <span className={`text-xs font-semibold ${note.is_visible ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {note.is_visible ? 'Visible' : 'Hidden'}
                </span>
              </div>

              <p className="mt-2 whitespace-pre-line break-words text-sm text-muted">{note.message}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {confirmingId === note.id ? (
                  <>
                    <span className="text-sm">Delete this note?</span>
                    <button type="button" onClick={() => void remove(note)} className={dangerButton}>
                      Yes, delete
                    </button>
                    <button type="button" onClick={() => setConfirmingId(null)} className={rowButton}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => void setVisible(note, !note.is_visible)} className={rowButton}>
                      {note.is_visible ? 'Hide' : 'Show'}
                    </button>
                    <button type="button" onClick={() => setConfirmingId(note.id)} className={dangerButton}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-4 text-sm text-muted">
        <span>
          Page {data.page} of {data.lastPage} · {data.total.toLocaleString()} {data.total === 1 ? 'note' : 'notes'}
        </span>
        <span className="flex gap-2">
          <button type="button" onClick={() => setPage(data.page - 1)} disabled={data.page <= 1} className={rowButton}>
            Previous
          </button>
          <button type="button" onClick={() => setPage(data.page + 1)} disabled={data.page >= data.lastPage} className={rowButton}>
            Next
          </button>
        </span>
      </div>
    </div>
  )
}

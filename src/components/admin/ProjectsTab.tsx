'use client'

import { useEffect, useRef, useState } from 'react'
import type { AdminApi } from '@/lib/admin-api'
import type { AdminProject, Page } from '@/lib/types'

const field = 'rounded-lg border border-white/10 bg-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none'
const rowButton =
  'rounded-lg border border-link/50 px-3 py-1 text-xs font-semibold text-link transition-colors hover:bg-link/10'

export function ProjectsTab({ api }: { api: AdminApi }) {
  const [data, setData] = useState<Page<AdminProject> | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [message, setMessage] = useState('')

  const [status, setStatus] = useState('')
  const [featured, setFeatured] = useState('')
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Same-row clicks are ignored while that row's request runs.
  const inFlight = useRef(new Set<number>())

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchText])

  useEffect(() => {
    let cancelled = false
    api
      .listProjects({
        status: status === 'active' || status === 'inactive' ? status : undefined,
        featured: featured === '' ? undefined : featured === '1',
        search: search || undefined,
        page,
      })
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
  }, [api, status, featured, search, page, attempt])

  function replaceRow(id: number, change: (project: AdminProject) => AdminProject) {
    setData((current) =>
      current ? { ...current, items: current.items.map((item) => (item.id === id ? change(item) : item)) } : current,
    )
  }

  async function toggle(project: AdminProject) {
    if (inFlight.current.has(project.id)) return
    inFlight.current.add(project.id)
    setMessage('')

    const next = !project.is_published
    replaceRow(project.id, (item) => ({ ...item, is_published: next }))
    try {
      const saved = await (next ? api.activateProject(project.id) : api.deactivateProject(project.id))
      replaceRow(project.id, () => saved)
    } catch {
      replaceRow(project.id, (item) => ({ ...item, is_published: project.is_published }))
      setMessage(`Couldn't ${next ? 'activate' : 'deactivate'} "${project.title}". Try again.`)
    } finally {
      inFlight.current.delete(project.id)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-muted">
          Search title
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
            className={field}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Featured
          <select
            value={featured}
            onChange={(event) => {
              setFeatured(event.target.value)
              setPage(1)
            }}
            className={field}
          >
            <option value="">All</option>
            <option value="1">Featured</option>
            <option value="0">Not featured</option>
          </select>
        </label>
      </div>

      {message && (
        <p role="alert" className="text-sm text-red-400">
          {message}
        </p>
      )}

      {!data ? (
        loadFailed ? (
          <p className="text-muted">
            Couldn&apos;t load projects.{' '}
            <button type="button" onClick={() => setAttempt((count) => count + 1)} className="font-semibold text-link underline">
              Try again
            </button>
          </p>
        ) : (
          <p className="text-muted">Loading…</p>
        )
      ) : data.items.length === 0 ? (
        <p className="text-muted">No projects match.</p>
      ) : (
        <>
          {loadFailed && <p className="text-sm text-muted">Couldn&apos;t refresh. Showing the last results.</p>}
          <div className="overflow-x-auto rounded-xl bg-card p-4">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="text-muted">
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Featured</th>
                  <th className="pb-2 text-right font-medium">Views</th>
                  <th className="pb-2 text-right font-medium">Reactions</th>
                  <th className="pb-2 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((project) => (
                  <tr key={project.id} className="border-t border-white/10">
                    <td className="py-2 pr-4">
                      {project.title}
                      <span className="block font-mono text-xs text-muted">{project.slug}</span>
                    </td>
                    <td className="py-2 pr-4 text-muted">{project.type ?? '—'}</td>
                    <td className="py-2 pr-4">
                      <span className={project.is_published ? 'text-emerald-400' : 'text-muted'}>
                        {project.is_published ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{project.is_featured ? 'Yes' : '—'}</td>
                    <td className="py-2 text-right">{project.view_count.toLocaleString()}</td>
                    <td className="py-2 text-right">{project.reactions_count.toLocaleString()}</td>
                    <td className="py-2 pl-4 text-right">
                      <button type="button" onClick={() => void toggle(project)} className={rowButton}>
                        {project.is_published ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm text-muted">
            <span>
              Page {data.page} of {data.lastPage} · {data.total.toLocaleString()} {data.total === 1 ? 'project' : 'projects'}
            </span>
            <span className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage(data.page - 1)}
                disabled={data.page <= 1}
                className={`${rowButton} disabled:opacity-40`}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage(data.page + 1)}
                disabled={data.page >= data.lastPage}
                className={`${rowButton} disabled:opacity-40`}
              >
                Next
              </button>
            </span>
          </div>
        </>
      )}
    </div>
  )
}

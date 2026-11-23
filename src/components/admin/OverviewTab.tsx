'use client'

import { useEffect, useState } from 'react'
import type { AdminApi } from '@/lib/admin-api'
import type { Stats } from '@/lib/types'

const DAYS = 14

const card = 'rounded-xl bg-card p-4'
const label = 'text-xs font-semibold uppercase tracking-widest text-link'
const button =
  'rounded-lg border border-link/50 px-4 py-2 text-sm font-semibold text-link transition-colors hover:bg-link/10 disabled:opacity-60'

type Rollup = { state: 'idle' | 'running' | 'done' | 'error'; text: string }

export function OverviewTab({ api }: { api: AdminApi }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [rollup, setRollup] = useState<Rollup>({ state: 'idle', text: '' })

  useEffect(() => {
    let cancelled = false
    api
      .stats()
      .then((result) => {
        if (cancelled) return
        setStats(result)
        setLoadFailed(false)
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [api, attempt])

  function reload() {
    setLoadFailed(false)
    setAttempt((count) => count + 1)
  }

  async function handleRollup() {
    setRollup({ state: 'running', text: '' })
    try {
      const result = await api.runRollup()
      setRollup({ state: 'done', text: result.output || (result.ok ? 'Done.' : 'The rollup reported a problem.') })
      reload()
    } catch {
      setRollup({ state: 'error', text: "Couldn't run the rollup. Try again." })
    }
  }

  if (!stats) {
    return loadFailed ? (
      <p className="text-muted">
        Couldn&apos;t load the stats.{' '}
        <button type="button" onClick={reload} className="font-semibold text-link underline">
          Try again
        </button>
      </p>
    ) : (
      <p className="text-muted">Loading…</p>
    )
  }

  const tiles = [
    { name: 'Projects', value: stats.totals.projects },
    { name: 'Views', value: stats.totals.views },
    { name: 'Notes', value: stats.totals.impressions },
    { name: 'Hidden notes', value: stats.totals.hidden_impressions, warn: stats.totals.hidden_impressions > 0 },
    { name: 'Reactions', value: stats.totals.reactions },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted">{loadFailed && "Couldn't refresh. Showing the last numbers."}</p>
        <button type="button" onClick={reload} className="text-sm font-semibold text-link hover:underline">
          Refresh
        </button>
      </div>

      <section aria-label="Totals" className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.name} className={card}>
            <p className={label}>{tile.name}</p>
            <p className={`mt-2 font-heading text-3xl font-semibold ${tile.warn ? 'text-amber-400' : ''}`}>
              {tile.value.toLocaleString()}
            </p>
          </div>
        ))}
      </section>

      <section aria-labelledby="top-projects-heading">
        <h3 id="top-projects-heading" className={`${label} mb-3`}>
          Top projects
        </h3>
        {stats.top_projects.length === 0 ? (
          <p className="text-muted">No projects yet.</p>
        ) : (
          <div className={`${card} overflow-x-auto`}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-muted">
                  <th className="pb-2 font-medium">Project</th>
                  <th className="pb-2 text-right font-medium">Views</th>
                  <th className="pb-2 text-right font-medium">Reactions</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_projects.map((project) => (
                  <tr key={project.slug} className="border-t border-white/10">
                    <td className="py-2 pr-4">{project.title}</td>
                    <td className="py-2 text-right">{project.view_count.toLocaleString()}</td>
                    <td className="py-2 text-right">{project.reactions_count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="daily-heading">
        <h3 id="daily-heading" className={`${label} mb-3`}>
          Last {DAYS} days
        </h3>
        <DailyBars daily={stats.daily} />
        <p className="mt-2 text-xs text-muted">Only completed days appear: the rollup covers yesterday.</p>
      </section>

      <section aria-labelledby="rollup-heading">
        <h3 id="rollup-heading" className={`${label} mb-3`}>
          Rollup
        </h3>
        <button type="button" onClick={() => void handleRollup()} disabled={rollup.state === 'running'} className={button}>
          {rollup.state === 'running' ? 'Running…' : 'Run rollup (yesterday)'}
        </button>
        {rollup.text && (
          <p role="status" className={`mt-3 text-sm ${rollup.state === 'error' ? 'text-red-400' : 'text-muted'}`}>
            {rollup.text}
          </p>
        )}
      </section>
    </div>
  )
}

function lastDays(): string[] {
  const now = Date.now()
  return Array.from({ length: DAYS }, (_, index) =>
    new Date(now - (DAYS - 1 - index) * 86_400_000).toISOString().slice(0, 10),
  )
}

export function DailyBars({ daily }: { daily: Stats['daily'] }) {
  if (daily.length === 0) {
    return <p className="text-muted">No daily stats yet. Run the rollup after a day with views.</p>
  }

  const byDate = new Map(daily.map((row) => [row.stat_date.slice(0, 10), row]))
  const days = lastDays().map((date) => ({
    date,
    views: byDate.get(date)?.views ?? 0,
    visitors: byDate.get(date)?.unique_visitors ?? 0,
  }))
  const max = Math.max(1, ...days.flatMap((day) => [day.views, day.visitors]))

  return (
    <div className={card}>
      <div className="mb-3 flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-primary" /> Views
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-tech" /> Unique visitors
        </span>
      </div>

      <ol className="flex h-40 items-end gap-1 sm:gap-1.5">
        {days.map((day, index) => (
          <li
            key={day.date}
            role="img"
            aria-label={`${day.date}: ${day.views} views, ${day.visitors} visitors`}
            title={`${day.date}: ${day.views} views, ${day.visitors} visitors`}
            className="flex h-full min-w-0 flex-1 flex-col justify-end"
          >
            <div className="flex flex-1 items-end justify-center gap-0.5">
              <div className="w-1/2 max-w-3 rounded-t bg-primary" style={{ height: `${(day.views / max) * 100}%` }} />
              <div className="w-1/2 max-w-3 rounded-t bg-tech" style={{ height: `${(day.visitors / max) * 100}%` }} />
            </div>
            <span aria-hidden="true" className="mt-1 h-4 text-center text-[10px] text-muted">
              {index % 2 === 0 ? day.date.slice(5) : ''}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

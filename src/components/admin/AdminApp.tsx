'use client'

import { useState } from 'react'
import { LockScreen } from '@/components/admin/LockScreen'
import { OverviewTab } from '@/components/admin/OverviewTab'
import { ProjectsTab } from '@/components/admin/ProjectsTab'
import { useAdminSession } from '@/lib/useAdminSession'

const tabs = ['Overview', 'Projects', 'Impressions'] as const
type Tab = (typeof tabs)[number]

const lockButton = 'rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition-colors hover:text-text'

export function AdminApp() {
  const { status, api, unlock, lock } = useAdminSession()
  const [tab, setTab] = useState<Tab>('Overview')

  if (status === 'checking') return <p className="p-6 text-muted">Checking session…</p>
  if (status === 'locked' || !api) return <LockScreen onUnlock={unlock} />

  return (
    <div className="min-h-screen md:flex">
      <aside className="flex flex-col border-b border-white/10 bg-surface md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-3 md:py-5">
          <h1 className="font-heading text-lg font-semibold">Admin</h1>
          <button type="button" onClick={lock} className={`${lockButton} md:hidden`}>
            Lock
          </button>
        </div>

        <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible md:pb-0">
          {tabs.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setTab(name)}
              aria-current={tab === name ? 'page' : undefined}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:text-text aria-[current=page]:bg-card aria-[current=page]:text-text"
            >
              {name}
            </button>
          ))}
        </nav>

        <div className="hidden p-4 md:block">
          <button type="button" onClick={lock} className={`${lockButton} w-full`}>
            Lock
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <h2 className="mb-6 font-heading text-2xl font-semibold">{tab}</h2>
        {tab === 'Overview' && <OverviewTab api={api} />}
        {tab === 'Projects' && <ProjectsTab api={api} />}
        {tab === 'Impressions' && <p className="text-muted">Coming next.</p>}
      </main>
    </div>
  )
}

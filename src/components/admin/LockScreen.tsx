'use client'

import { useState, type FormEvent } from 'react'
import { ApiError } from '@/lib/api'

type LockScreenProps = {
  onUnlock: (token: string) => Promise<void>
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token.trim() || checking) return

    setChecking(true)
    setError('')
    try {
      await onUnlock(token.trim())
    } catch (caught) {
      setError(caught instanceof ApiError && caught.status === 401 ? 'Wrong token' : "Couldn't reach the API")
      setChecking(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-card p-6"
      >
        <h1 className="font-heading text-xl font-semibold">Admin</h1>

        <div>
          <label htmlFor="admin-token" className="mb-1 block text-sm font-medium">
            Admin token
          </label>
          <input
            id="admin-token"
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            autoComplete="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'admin-token-error' : undefined}
            className="w-full rounded-lg border border-white/10 bg-bg px-3 py-2 text-text focus:border-primary focus:outline-none"
          />
          {error && (
            <p id="admin-token-error" role="alert" className="mt-1 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={checking}
          className="rounded-lg border-b-[3px] border-[#6D3FD1] bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-60"
        >
          {checking ? 'Checking…' : 'Unlock'}
        </button>
      </form>
    </div>
  )
}

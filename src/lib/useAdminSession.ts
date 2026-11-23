import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { ApiError } from '@/lib/api'
import { createAdminApi, type AdminApi } from '@/lib/admin-api'

const STORAGE_KEY = 'admin-token'

type Session = { status: 'locked' | 'unlocked'; api: AdminApi | null }

function readToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeToken(token: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, token)
  } catch {
    // storage unavailable: the session just will not survive a reload
  }
}

function clearToken() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // nothing to clear
  }
}

const noSubscribe = () => () => {}

export function useAdminSession(): {
  status: 'checking' | 'locked' | 'unlocked'
  api: AdminApi | null
  unlock(token: string): Promise<void>
  lock(): void
} {
  // undefined on the server and during hydration, so the first render matches the server HTML.
  const stored = useSyncExternalStore<string | null | undefined>(noSubscribe, readToken, () => undefined)
  const [session, setSession] = useState<Session | null>(null)

  const lock = useCallback(() => {
    clearToken()
    setSession({ status: 'locked', api: null })
  }, [])

  const unlock = useCallback(
    async (token: string) => {
      const api = createAdminApi(token, lock)
      await api.stats()
      writeToken(token)
      setSession({ status: 'unlocked', api })
    },
    [lock],
  )

  useEffect(() => {
    if (!stored || session) return
    let cancelled = false
    const api = createAdminApi(stored, lock)
    api
      .stats()
      .then(() => {
        if (!cancelled) setSession({ status: 'unlocked', api })
      })
      .catch((error) => {
        // A 401 already called lock(); any other failure just shows the lock screen and keeps the token.
        if (!cancelled && !(error instanceof ApiError && error.status === 401)) {
          setSession({ status: 'locked', api: null })
        }
      })
    return () => {
      cancelled = true
    }
  }, [stored, session, lock])

  const status = session?.status ?? (stored === null ? 'locked' : 'checking')
  return { status, api: session?.api ?? null, unlock, lock }
}

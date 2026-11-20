import type { ReactionType } from '@/lib/api'

export const REACTION_TYPES: ReactionType[] = ['like', 'love', 'fire', 'clap']

const keyFor = (slug: string) => `reactions:${slug}`

/** Reactions this browser has made on a project. Never throws. */
export function getReacted(slug: string): ReactionType[] {
  try {
    const raw = localStorage.getItem(keyFor(slug))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return REACTION_TYPES.filter((type) => parsed.includes(type))
  } catch {
    return []
  }
}

/** Remembers (or forgets) one reaction for a project. Never throws. */
export function setReacted(slug: string, type: ReactionType, active: boolean): void {
  try {
    const current = new Set(getReacted(slug))
    if (active) current.add(type)
    else current.delete(type)
    const next = REACTION_TYPES.filter((t) => current.has(t))
    localStorage.setItem(keyFor(slug), JSON.stringify(next))
  } catch {
    // storage unavailable (private mode, quota): reactions still work, just not remembered
  }
}

'use client'

import { useRef, useState, useSyncExternalStore } from 'react'
import { Flame, Heart, PartyPopper, ThumbsUp, type LucideIcon } from 'lucide-react'
import * as m from 'motion/react-m'
import { ApiError, toggleReaction, type ReactionType } from '@/lib/api'
import { REACTION_TYPES, getReacted, setReacted } from '@/lib/reactions'

type ReactionBarProps = {
  slug: string
  initialTotal: number
  views: number
}

// Lucide has no clapping icon, so clap uses PartyPopper.
const BUTTONS: Record<ReactionType, { label: string; Icon: LucideIcon }> = {
  like: { label: 'Like', Icon: ThumbsUp },
  love: { label: 'Love', Icon: Heart },
  fire: { label: 'Fire', Icon: Flame },
  clap: { label: 'Clap', Icon: PartyPopper },
}

const baseButton =
  'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-b-[3px] shadow-md shadow-black/30 transition-colors duration-150'
const idleButton = 'border-primary/40 bg-card text-link hover:bg-primary/10'
const pressedButton = 'border-[#6D3FD1] bg-primary text-white hover:brightness-110'

const noSubscribe = () => () => {}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export function ReactionBar({ slug, initialTotal, views }: ReactionBarProps) {
  // The snapshot is a string because React compares snapshots with ===.
  const saved = useSyncExternalStore(
    noSubscribe,
    () => getReacted(slug).join(','),
    () => '',
  )
  const [changes, setChanges] = useState<Partial<Record<ReactionType, boolean>>>({})
  const [total, setTotal] = useState(initialTotal)
  const [message, setMessage] = useState('')
  // A ref so two quick clicks cannot both pass the check before the first is recorded.
  const inFlight = useRef(new Set<ReactionType>())

  async function handleClick(type: ReactionType, wasPressed: boolean) {
    if (inFlight.current.has(type)) return
    inFlight.current.add(type)
    setMessage('')

    const delta = wasPressed ? -1 : 1
    setChanges((current) => ({ ...current, [type]: !wasPressed }))
    setTotal((current) => Math.max(0, current + delta))

    try {
      const result = await toggleReaction(slug, type)
      setTotal(result.total)
      setChanges((current) => ({ ...current, [type]: result.active }))
      setReacted(slug, type, result.active)
    } catch (error) {
      setChanges((current) => ({ ...current, [type]: wasPressed }))
      setTotal((current) => Math.max(0, current - delta))
      setMessage(
        error instanceof ApiError && error.status === 429
          ? 'Slow down a little, try again in a minute.'
          : "Couldn't save that reaction, try again soon.",
      )
    } finally {
      inFlight.current.delete(type)
    }
  }

  const reactionText = total > 0 ? plural(total, 'reaction') : null
  const viewText = views > 0 ? plural(views, 'view') : null

  return (
    <div>
      <div role="group" aria-label="Reactions" className="flex gap-2">
        {REACTION_TYPES.map((type) => {
          const { label, Icon } = BUTTONS[type]
          const pressed = changes[type] ?? saved.split(',').includes(type)
          return (
            <m.button
              key={type}
              type="button"
              aria-label={label}
              aria-pressed={pressed}
              onClick={() => void handleClick(type, pressed)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className={`${baseButton} ${pressed ? pressedButton : idleButton}`}
            >
              <m.span
                initial={false}
                animate={{ scale: pressed ? [1, 1.4, 1] : 1, rotate: pressed ? [0, -12, 0] : 0 }}
                transition={{ duration: 0.4 }}
                className="flex"
              >
                <Icon size={20} aria-hidden="true" className={pressed ? 'fill-current' : ''} />
              </m.span>
            </m.button>
          )
        })}
      </div>
      {(reactionText || viewText) && (
        <p className="mt-2 text-sm text-muted">
          {reactionText && (
            <m.span
              key={total}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="inline-block"
            >
              {reactionText}
            </m.span>
          )}
          {reactionText && viewText && ' · '}
          {viewText}
        </p>
      )}
      <p role="status" className="mt-1 text-sm text-muted">
        {message}
      </p>
    </div>
  )
}

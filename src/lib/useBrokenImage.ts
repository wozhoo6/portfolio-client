import { useEffect, useRef, useState } from 'react'

/**
 * Tracks whether an <img> failed to load, so the caller can show a placeholder instead.
 * Attach `ref` and `onError` to the img.
 *
 * `onError` alone is not enough: a dead image can fail before React has hydrated the page,
 * and that error event is then never seen. So on mount we also check whether the browser
 * already gave up on the image.
 */
export function useBrokenImage() {
  const ref = useRef<HTMLImageElement>(null)
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    const img = ref.current
    if (img && img.complete && img.naturalWidth === 0) setBroken(true)
  }, [])

  return { ref, broken, onError: () => setBroken(true) }
}

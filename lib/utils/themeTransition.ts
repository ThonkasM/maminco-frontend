'use client'

import { flushSync } from 'react-dom'

export interface ThemeOrigin {
  x: number
  y: number
}

const TRANSITION_CLASS = 'theme-transition'
const TRANSITION_MS = 320

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Applies a theme change with a circular reveal starting at the click origin
 * (View Transitions API). Falls back to a short CSS color transition when the
 * API is unavailable, and skips animation when the user prefers reduced motion.
 */
export function applyThemeWithTransition(apply: () => void, origin?: ThemeOrigin): void {
  if (typeof document === 'undefined') {
    apply()
    return
  }

  const root = document.documentElement
  const reduced = prefersReducedMotion()
  const canReveal =
    typeof document.startViewTransition === 'function' && !!origin && !reduced

  if (canReveal && origin) {
    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    )
    root.style.setProperty('--theme-x', `${origin.x}px`)
    root.style.setProperty('--theme-y', `${origin.y}px`)
    root.style.setProperty('--theme-radius', `${radius}px`)

    const transition = document.startViewTransition(() => {
      flushSync(apply)
    })

    transition.finished.finally(() => {
      root.style.removeProperty('--theme-x')
      root.style.removeProperty('--theme-y')
      root.style.removeProperty('--theme-radius')
    })
    return
  }

  if (reduced) {
    apply()
    return
  }

  root.classList.add(TRANSITION_CLASS)
  apply()
  window.setTimeout(() => root.classList.remove(TRANSITION_CLASS), TRANSITION_MS)
}

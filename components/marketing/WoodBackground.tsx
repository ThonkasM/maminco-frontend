import { useId } from 'react'
import { cn } from '@/lib/utils/cn'

export function WoodBackground({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  const grain = `${id}-grain`
  const knots = `${id}-knots`
  const planks = `${id}-planks`

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
      viewBox="0 0 1440 760"
      className={cn('block size-full', className)}
    >
      <defs>
        <filter id={grain} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55 0.006" numOctaves="4" seed="11" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.30  0 0 0 0 0.17  0 0 0 0 0.10  0 0 0 1.6 -0.55"
          />
        </filter>
        <filter id={knots} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="turbulence" baseFrequency="0.04 0.004" numOctaves="2" seed="3" result="k" />
          <feColorMatrix
            in="k"
            type="matrix"
            values="0 0 0 0 0.05  0 0 0 0 0.03  0 0 0 0 0.02  0 0 0 2 -0.9"
          />
        </filter>
        <pattern id={planks} width="200" height="760" patternUnits="userSpaceOnUse">
          <rect width="200" height="760" fill="#24150f" />
          <rect width="200" height="760" filter={`url(#${grain})`} />
          <rect x="196" width="4" height="760" fill="#0a0604" opacity=".85" />
          <rect x="199" width="1" height="760" fill="#5b3a28" opacity=".35" />
        </pattern>
      </defs>
      <rect width="1440" height="760" fill={`url(#${planks})`} />
      <rect width="1440" height="760" filter={`url(#${knots})`} opacity=".7" />
    </svg>
  )
}

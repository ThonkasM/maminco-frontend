'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  // Keep the label stable during SSR / first paint (resolvedTheme is unknown on
  // the server) to avoid a hydration mismatch.
  const label = !mounted
    ? 'Cambiar tema'
    : isDark
      ? 'Cambiar a tema claro'
      : 'Cambiar a tema oscuro'
  const title = !mounted ? 'Tema' : isDark ? 'Tema claro' : 'Tema oscuro'

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={label}
      title={title}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {mounted ? (
        isDark ? (
          <Sun />
        ) : (
          <Moon />
        )
      ) : (
        <span className="size-4" aria-hidden="true" />
      )}
    </Button>
  )
}

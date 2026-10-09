import type { ReactNode } from 'react'

export function AppFrame({
  url,
  children,
  className = '',
}: {
  url: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-surface shadow-float ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-muted px-4 py-3">
        <span className="size-3 rounded-full bg-danger/70" />
        <span className="size-3 rounded-full bg-warning/70" />
        <span className="size-3 rounded-full bg-success/70" />
        <span className="ml-3 truncate font-mono text-xs text-muted-foreground">
          {url}
        </span>
      </div>
      {children}
    </div>
  )
}

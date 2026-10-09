'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { useTheme } from 'next-themes'
import { LogOut, Moon, Search, Sun, type LucideIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

export interface CommandPaletteItem {
  href: string
  label: string
  group: string
  icon: LucideIcon
}

interface CommandPaletteProps {
  items: CommandPaletteItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogout?: () => void
}

const itemClass =
  'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground data-[selected=true]:bg-surface-muted data-[selected=true]:text-foreground'

export function CommandPalette({
  items,
  open,
  onOpenChange,
  onLogout,
}: CommandPaletteProps) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  const groups = Array.from(new Set(items.map((item) => item.group)))
  const run = (action: () => void) => {
    onOpenChange(false)
    action()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Menú de comandos</DialogTitle>
        <Command
          label="Menú de comandos"
          className={cn(
            '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5',
            '[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold',
            '[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide',
            '[&_[cmdk-group-heading]]:text-muted-foreground',
          )}
        >
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder="Buscar página o acción..."
              className="h-12 w-full bg-transparent pr-8 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
              Sin resultados.
            </Command.Empty>

            {groups.map((group) => (
              <Command.Group key={group} heading={group}>
                {items
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const Icon = item.icon
                    return (
                      <Command.Item
                        key={item.href}
                        value={`${item.label} ${item.href}`}
                        onSelect={() => run(() => router.push(item.href))}
                        className={itemClass}
                      >
                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                        {item.label}
                      </Command.Item>
                    )
                  })}
              </Command.Group>
            ))}

            <Command.Group heading="Acciones">
              <Command.Item
                value="cambiar tema claro oscuro"
                onSelect={() =>
                  run(() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'))
                }
                className={itemClass}
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Moon className="size-4 shrink-0 text-muted-foreground" />
                )}
                Cambiar tema
              </Command.Item>
              {onLogout && (
                <Command.Item
                  value="cerrar sesion logout salir"
                  onSelect={() => run(onLogout)}
                  className={itemClass}
                >
                  <LogOut className="size-4 shrink-0 text-danger" />
                  Cerrar sesión
                </Command.Item>
              )}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { cn } from '@/lib/utils/cn'

const LINKS = [
  { href: '/#productos', label: 'Producto' },
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/#roles', label: 'Roles' },
  { href: '/#planes', label: 'Planes' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/nosotros', label: 'Nosotros' },
]

function useActiveSection(ids: string[], enabled: boolean) {
  const [active, setActive] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return undefined
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        })
        setActive(ids.findLast((id) => visible.has(id)) ?? null)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => {
      const node = document.getElementById(id)
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [ids, enabled])
  return enabled ? active : null
}

const SECTION_IDS = LINKS.filter((link) => link.href.startsWith('/#')).map((link) =>
  link.href.slice(2),
)

export function Navbar() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const active = useActiveSection(SECTION_IDS, pathname === '/')
  const isLinkActive = (href: string) =>
    href.startsWith('/#') ? active === href.slice(2) : pathname === href

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-[3px] border-brand-leaf bg-nav text-nav-foreground">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-4 sm:px-6 md:h-20">
        <Link href="/" className="flex items-center gap-3 pl-1" aria-label="Maminco inicio">
          <Image src="/maminco-logo-128.png" alt="" width={48} height={48} priority className="size-11 rounded-xl md:size-12" />
          <span className="text-xl font-semibold tracking-tight text-nav-foreground">Maminco</span>
        </Link>

        <nav className="hidden items-center lg:flex" aria-label="Principal">
          {LINKS.map((link) => {
            const isActive = isLinkActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-nav-foreground/10 text-nav-foreground'
                    : 'text-nav-foreground/85 hover:text-nav-foreground',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          <ThemeToggle className="text-nav-foreground hover:bg-nav-foreground/10 hover:text-nav-foreground focus-visible:ring-offset-nav" />
          <Link
            href="/auth/login"
            className={cn(
              buttonVariants({ variant: 'accent', size: 'sm', shape: 'pill' }),
              'bg-gradient-to-r from-brand-yellow to-brand-orange font-semibold text-brand-ink transition hover:brightness-110 focus-visible:ring-offset-nav',
            )}
          >
            Iniciar sesión
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle className="text-nav-foreground hover:bg-nav-foreground/10 hover:text-nav-foreground focus-visible:ring-offset-nav" />
          <Button
            variant="ghost"
            size="icon"
            shape="pill"
            className="text-nav-foreground hover:bg-nav-foreground/10 hover:text-nav-foreground focus-visible:ring-offset-nav"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <div
        id="mobile-nav"
        inert={!open}
        className={cn(
          'mx-auto grid max-w-6xl px-4 transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none sm:px-6 lg:hidden',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <nav
            className="mb-3 flex flex-col gap-1 rounded-2xl border border-nav-foreground/15 bg-nav p-3"
            aria-label="Móvil"
          >
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-nav-foreground/90 transition-colors hover:bg-nav-foreground/10 hover:text-nav-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid gap-2">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants({ variant: 'accent', shape: 'pill' }),
                  'bg-gradient-to-r from-brand-yellow to-brand-orange font-semibold text-brand-ink',
                )}
              >
                Iniciar sesión
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

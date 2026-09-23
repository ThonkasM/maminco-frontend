'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { cn } from '@/lib/utils/cn'

const LINKS = [
  { href: '#caracteristicas', label: 'Características' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#equipo', label: 'Equipo' },
]

export function Navbar() {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Maminco inicio">
          <Image
            src="/maminco-logo.png"
            alt=""
            width={32}
            height={32}
            priority
            className="size-8"
          />
          <span className="text-lg font-semibold tracking-tight">Maminco</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" shape="pill">
              Ir al panel
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'border-t border-border bg-background md:hidden',
          open ? 'block' : 'hidden',
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4" aria-label="Móvil">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <Link href="/auth/login" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <Button shape="pill" className="w-full">
                Ir al panel
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

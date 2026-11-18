'use client'

import * as React from 'react'
import {
  Check,
  ChefHat,
  ConciergeBell,
  LineChart,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

type Role = {
  id: string
  label: string
  icon: LucideIcon
  headline: string
  surface: string
  tasks: string[]
}

const ROLES: Role[] = [
  {
    id: 'admin',
    label: 'Administrador',
    icon: ShieldCheck,
    headline: 'Configura el restaurante y controla el acceso',
    surface: 'Panel web administrativo',
    tasks: [
      'Crea áreas, mesas, categorías y productos',
      'Gestiona usuarios y asigna roles',
      'Define métodos de pago y activa Cocina Digitalizada',
    ],
  },
  {
    id: 'manager',
    label: 'Gerente',
    icon: LineChart,
    headline: 'Supervisa ventas y decide con datos',
    surface: 'Panel web y app móvil',
    tasks: [
      'Revisa reportes por producto, categoría y área',
      'Consulta pronósticos de ventas y horas pico',
      'Audita órdenes y cierres de caja',
    ],
  },
  {
    id: 'cashier',
    label: 'Cajero',
    icon: Wallet,
    headline: 'Cobra rápido y cierra caja sin descuadres',
    surface: 'POS web',
    tasks: [
      'Cobra en efectivo, tarjeta o transferencia',
      'Aplica propinas y emite el ticket',
      'Cierra la caja al final del turno',
    ],
  },
  {
    id: 'waiter',
    label: 'Mesero',
    icon: ConciergeBell,
    headline: 'Toma la orden en la mesa, sin ir y volver',
    surface: 'POS web y app móvil',
    tasks: [
      'Abre la mesa y agrega productos al pedido',
      'Ve el estado de todas las mesas en vivo',
      'Imprime la precuenta cuando el cliente la pide',
    ],
  },
  {
    id: 'cook',
    label: 'Cocinero',
    icon: ChefHat,
    headline: 'Prepara en orden y avisa cuando está listo',
    surface: 'Pantalla de cocina',
    tasks: [
      'Recibe las órdenes abiertas al instante',
      'Avanza: Pendiente → En preparación → Listo',
      'Lee las notas del pedido de cada mesa',
    ],
  },
]

export function RolesSection() {
  const [activeId, setActiveId] = React.useState(ROLES[0].id)
  const active = ROLES.find((role) => role.id === activeId) ?? ROLES[0]
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    event.preventDefault()
    const next = (index + delta + ROLES.length) % ROLES.length
    setActiveId(ROLES[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="roles" className="dark scroll-mt-24 border-t-4 border-brand-leaf bg-nav py-24 text-foreground sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Para todo tu equipo"
          title="Cada rol ve exactamente lo que necesita"
          description="Cinco roles con permisos propios sobre los mismos datos. Nadie trabaja con información desactualizada."
        />

        <Reveal className="mt-12">
          <div
            role="tablist"
            aria-label="Roles del sistema"
            className="mask-fade-x -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 sm:[mask-image:none]"
          >
            {ROLES.map((role, index) => {
              const Icon = role.icon
              const selected = role.id === activeId
              return (
                <button
                  key={role.id}
                  ref={(node) => {
                    tabRefs.current[index] = node
                  }}
                  type="button"
                  role="tab"
                  id={`role-tab-${role.id}`}
                  aria-selected={selected}
                  aria-controls="role-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveId(role.id)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground shadow-elevated'
                      : 'border-border bg-surface text-muted-foreground hover:border-primary/30 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {role.label}
                </button>
              )
            })}
          </div>

          <div
            id="role-panel"
            role="tabpanel"
            aria-labelledby={`role-tab-${active.id}`}
            className="mt-6 grid overflow-hidden rounded-2xl border border-border bg-surface shadow-card md:grid-cols-[1fr_1.2fr]"
          >
            <div className="relative flex flex-col justify-between gap-10 overflow-hidden bg-primary p-8 text-primary-foreground">
              <active.icon
                key={`icon-${active.id}`}
                className="relative size-12 text-accent"
                aria-hidden="true"
              />
              <div className="relative">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
                  {active.surface}
                </p>
                <p
                  key={`headline-${active.id}`}
                  className="mt-3 text-2xl font-semibold tracking-tight motion-safe:animate-[role-in_400ms_ease-out]"
                >
                  {active.headline}
                </p>
              </div>
            </div>

            <ul key={active.id} className="divide-y divide-border p-2 sm:p-4">
              {active.tasks.map((task, index) => (
                <li
                  key={task}
                  className="flex items-center gap-4 p-4 motion-safe:animate-[role-in_400ms_ease-out_both]"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-foreground">{task}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

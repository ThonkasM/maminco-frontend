'use client'

import { useState } from 'react'
import { Banknote, Brain, Building2, Check, CreditCard, Minus, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { AppFrame } from './AppFrame'
import { formatBs } from './formatBs'

type StepId = 'config' | 'pos' | 'data' | 'kitchen'

const STEPS: {
  id: StepId
  number: string
  title: string
  description: string
  url: string
}[] = [
  {
    id: 'config',
    number: '01',
    title: 'Configura tu restaurante',
    description:
      'Crea áreas, mesas, categorías y productos en minutos con el panel administrativo.',
    url: 'app.maminco.bo/products',
  },
  {
    id: 'pos',
    number: '02',
    title: 'Opera desde el POS',
    description:
      'Toma órdenes y cobra con propina desde una interfaz pensada para el ritmo del servicio.',
    url: 'app.maminco.bo/pos/orders/mesa-3',
  },
  {
    id: 'data',
    number: '03',
    title: 'Decide con datos',
    description:
      'Revisa reportes, cierres de caja y pronósticos para optimizar precios, personal y compras.',
    url: 'app.maminco.bo/ai',
  },
  {
    id: 'kitchen',
    number: '04',
    title: 'Coordina la cocina',
    description:
      'Con Cocina Digitalizada, el equipo de cocina ve las órdenes abiertas y marca su avance en tiempo real.',
    url: 'app.maminco.bo/kitchen',
  },
]

function ConfigPanel() {
  const areas = [
    { name: 'Salón principal', type: 'Física', tables: 12, active: true },
    { name: 'Terraza', type: 'Física', tables: 8, active: true },
    { name: 'Barra', type: 'Virtual', tables: 4, active: false },
  ]
  const products = [
    { name: 'Sopa de maní', category: 'Entradas', price: 24, active: true },
    { name: 'Silpancho', category: 'Platos fuertes', price: 38, active: true },
    { name: 'Pique macho', category: 'Platos fuertes', price: 62, active: true },
    { name: 'Jugo natural', category: 'Bebidas', price: 14, active: false },
  ]

  return (
    <div className="p-5 sm:p-6">
      <p className="text-sm font-medium text-foreground">Áreas</p>
      <ul className="mt-2 divide-y divide-border rounded-md border border-border bg-background">
        {areas.map((area) => (
          <li
            key={area.name}
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{area.name}</p>
              <p className="text-xs text-muted-foreground">
                {area.type} · {area.tables} mesas
              </p>
            </div>
            <Badge variant={area.active ? 'success' : 'neutral'}>
              {area.active ? 'Activa' : 'Inactiva'}
            </Badge>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm font-medium text-foreground">Productos</p>
      <ul className="mt-2 divide-y divide-border rounded-md border border-border bg-background">
        {products.map((p) => (
          <li key={p.name} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.category}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm tabular-nums text-foreground">
                {formatBs(p.price)}
              </span>
              <Badge variant={p.active ? 'success' : 'neutral'}>
                {p.active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PosPanel() {
  const items = [
    { name: 'Pique macho', qty: 1, price: 62 },
    { name: 'Silpancho', qty: 2, price: 38 },
    { name: 'Jugo natural', qty: 3, price: 14 },
  ]
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0)
  const methods = [
    { name: 'Efectivo', icon: Banknote },
    { name: 'Tarjeta', icon: CreditCard },
    { name: 'Transferencia', icon: Building2 },
  ]

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="font-bold text-foreground">Mesa 3</p>
          <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Salón principal
          </span>
        </div>
        <Badge variant="info">Orden abierta</Badge>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Orden: #1042 · Abierta</p>

      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted p-3"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded border border-border bg-surface text-muted-foreground">
                <Minus className="size-3.5" aria-hidden="true" />
              </span>
              <span className="w-6 text-center font-mono text-sm font-bold tabular-nums text-foreground">
                {item.qty}
              </span>
              <span className="flex size-7 items-center justify-center rounded border border-border bg-surface text-muted-foreground">
                <Plus className="size-3.5" aria-hidden="true" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
              <p className="text-sm text-muted-foreground">{formatBs(item.price)}</p>
            </div>
            <span className="shrink-0 text-base font-bold tabular-nums text-foreground">
              {formatBs(item.qty * item.price)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm">
        <span className="text-muted-foreground">Subtotal:</span>
        <span className="text-lg font-bold tabular-nums text-foreground">
          {formatBs(subtotal)}
        </span>
      </div>

      <p className="mt-5 text-sm font-bold uppercase tracking-wide text-foreground">
        Métodos de pago
      </p>
      <div className="mt-2 space-y-2">
        {methods.map((method, i) => {
          const Icon = method.icon
          return (
            <div
              key={method.name}
              className={`flex items-center gap-3 rounded-lg border p-3 text-sm font-semibold ${
                i === 0
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface text-foreground'
              }`}
            >
              <Icon className="size-5" aria-hidden="true" />
              {method.name}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-center text-sm font-medium text-primary-foreground">
        <CreditCard className="size-4" aria-hidden="true" />
        Cerrar y cobrar
      </div>
    </div>
  )
}

function DataPanel() {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Pronóstico de ventas</p>
        <Badge>Datos de ejemplo</Badge>
      </div>

      <svg
        viewBox="0 0 280 120"
        className="mt-5 h-40 w-full"
        fill="none"
        role="img"
        aria-label="Pronóstico de ventas: el área sólida es el modelo y la línea punteada, el baseline de referencia"
      >
        <path
          d="M10 72 L53 66 L97 69 L140 58 L183 42 L227 26 L270 47 L270 120 L10 120 Z"
          fill="var(--primary)"
          fillOpacity="0.12"
        />
        <path
          d="M10 76 L53 70 L97 67 L140 63 L183 50 L227 36 L270 52"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5 5"
        />
        <path
          d="M10 72 L53 66 L97 69 L140 58 L183 42 L227 26 L270 47"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        {days.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-primary" />
          Modelo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-4 border-t border-dashed border-accent" />
          Baseline
        </span>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-md border border-border bg-background p-3">
        <Brain className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          El área sólida es el{' '}
          <span className="font-medium text-foreground">modelo</span>; la línea punteada, el{' '}
          <span className="font-medium text-foreground">baseline</span> de referencia. También
          incluye horas pico por hora del día.
        </p>
      </div>
    </div>
  )
}

function KitchenPanel() {
  const columns = [
    {
      status: 'Pendiente',
      dot: 'bg-warning',
      orders: [{ table: '3', items: ['2× Silpancho', '1× Jugo natural'] }],
    },
    {
      status: 'En preparación',
      dot: 'bg-primary',
      orders: [{ table: '5', items: ['1× Pique macho'] }],
    },
    {
      status: 'Listo',
      dot: 'bg-success',
      orders: [{ table: '2', items: ['3× Jugo natural'] }],
    },
  ]

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Órdenes abiertas</p>
        <Badge variant="info">En vivo</Badge>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {columns.map((column) => (
          <div key={column.status}>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span className={`size-2 rounded-full ${column.dot}`} />
              {column.status}
            </p>
            <div className="mt-2 space-y-2">
              {column.orders.map((order) => (
                <div
                  key={order.table}
                  className="rounded-md border border-border bg-background p-2.5"
                >
                  <p className="text-sm font-semibold text-foreground">
                    Mesa {order.table}
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {order.items.map((item) => (
                      <li key={item} className="text-xs text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex gap-1.5">
                    <span className="flex-1 rounded-md border border-border py-1 text-center text-[10px] font-medium text-muted-foreground">
                      Volver
                    </span>
                    <span className="flex-1 rounded-md bg-primary py-1 text-center text-[10px] font-medium text-primary-foreground">
                      Marcar listo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StepsShowcase() {
  const [active, setActive] = useState<StepId>('config')
  const current = STEPS.find((s) => s.id === active) ?? STEPS[0]

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          En marcha en cuatro pasos
        </h2>
        <p className="mt-4 text-muted-foreground">
          Elige un paso para ver cómo se ve en pantalla.
        </p>

        <ol className="mt-8 space-y-3">
          {STEPS.map((step) => {
            const isActive = step.id === active
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => setActive(step.id)}
                  aria-pressed={isActive}
                  className={`flex w-full gap-4 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? 'border-border bg-surface shadow-elevated'
                      : 'border-transparent hover:bg-surface/60'
                  }`}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-medium ${
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-surface text-primary'
                    }`}
                  >
                    {isActive ? <Check className="size-4" /> : step.number}
                  </span>
                  <span>
                    <span className="block font-semibold text-foreground">
                      {step.title}
                    </span>
                    <span
                      className={`mt-1 block text-sm text-muted-foreground ${
                        isActive ? '' : 'hidden sm:block'
                      }`}
                    >
                      {step.description}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <AppFrame url={current.url}>
        {/* Los tres paneles comparten la misma celda: la altura no salta y el cambio es un fundido. */}
        <div className="grid">
          {(
            [
              ['config', <ConfigPanel key="config" />],
              ['pos', <PosPanel key="pos" />],
              ['data', <DataPanel key="data" />],
              ['kitchen', <KitchenPanel key="kitchen" />],
            ] as const
          ).map(([id, panel]) => (
            <div
              key={id}
              aria-hidden={active !== id}
              className={`col-start-1 row-start-1 transition-opacity duration-300 motion-reduce:transition-none ${
                active === id ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              {panel}
            </div>
          ))}
        </div>
      </AppFrame>
    </div>
  )
}

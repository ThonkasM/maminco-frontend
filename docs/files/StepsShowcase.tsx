'use client'

import { useState } from 'react'
import { Brain, Check } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { AppFrame } from './AppFrame'

type StepId = 'config' | 'pos' | 'data'

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
    url: 'app.maminco.bo/admin/productos',
  },
  {
    id: 'pos',
    number: '02',
    title: 'Opera desde el POS',
    description:
      'Toma órdenes, envía a cocina y cobra con propina desde una interfaz pensada para el ritmo del servicio.',
    url: 'app.maminco.bo/pos/mesa-3',
  },
  {
    id: 'data',
    number: '03',
    title: 'Decide con datos',
    description:
      'Revisa reportes, cierres de caja y pronósticos para optimizar precios, personal y compras.',
    url: 'app.maminco.bo/reportes',
  },
]

function bs(value: number) {
  const [int, dec] = value.toFixed(2).split('.')
  return `Bs. ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`
}

function ConfigPanel() {
  const areas = ['Salón principal', 'Terraza', 'Barra']
  const products = [
    { name: 'Sopa de maní', category: 'Entradas', price: 24 },
    { name: 'Silpancho', category: 'Platos fuertes', price: 38 },
    { name: 'Pique macho', category: 'Platos fuertes', price: 62 },
    { name: 'Jugo natural', category: 'Bebidas', price: 14 },
  ]

  return (
    <div className="p-5 sm:p-6">
      <p className="text-sm font-medium text-foreground">Áreas</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {areas.map((area, i) => (
          <span
            key={area}
            className={`rounded-full border px-3 py-1 text-xs ${
              i === 0
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border text-muted-foreground'
            }`}
          >
            {area}
          </span>
        ))}
      </div>

      <p className="mt-6 text-sm font-medium text-foreground">Productos</p>
      <ul className="mt-2 divide-y divide-border rounded-md border border-border bg-background">
        {products.map((p) => (
          <li key={p.name} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.category}</p>
            </div>
            <span className="font-mono text-sm tabular-nums text-foreground">
              {bs(p.price)}
            </span>
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
  const tip = subtotal * 0.1
  const methods = ['Efectivo', 'Tarjeta', 'Transferencia']

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Mesa 3 · Orden abierta</p>
        <Badge variant="success">En cocina</Badge>
      </div>

      <ul className="mt-4 divide-y divide-border rounded-md border border-border bg-background">
        {items.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm text-foreground">
              <span className="mr-2 font-mono text-muted-foreground">{item.qty}×</span>
              {item.name}
            </span>
            <span className="font-mono text-sm tabular-nums text-foreground">
              {bs(item.qty * item.price)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <dt>Subtotal</dt>
          <dd className="font-mono tabular-nums">{bs(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <dt>Propina 10%</dt>
          <dd className="font-mono tabular-nums">{bs(tip)}</dd>
        </div>
        <div className="flex justify-between font-semibold text-foreground">
          <dt>Total</dt>
          <dd className="font-mono tabular-nums">{bs(subtotal + tip)}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        {methods.map((m, i) => (
          <span
            key={m}
            className={`rounded-full border px-3 py-1 text-xs ${
              i === 1
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border text-muted-foreground'
            }`}
          >
            {m}
          </span>
        ))}
      </div>
      <div className="mt-4 rounded-md bg-primary py-2.5 text-center text-sm font-medium text-primary-foreground">
        Cobrar
      </div>
    </div>
  )
}

function DataPanel() {
  const bars = [
    { label: 'Lun', value: 42, forecast: false },
    { label: 'Mar', value: 48, forecast: false },
    { label: 'Mié', value: 45, forecast: false },
    { label: 'Jue', value: 60, forecast: false },
    { label: 'Vie', value: 78, forecast: false },
    { label: 'Sáb', value: 92, forecast: false },
    { label: 'Dom', value: 66, forecast: false },
    { label: 'Lun', value: 46, forecast: true },
    { label: 'Mar', value: 52, forecast: true },
    { label: 'Mié', value: 50, forecast: true },
  ]

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Ventas por día</p>
        <Badge>Datos de ejemplo</Badge>
      </div>

      <div className="mt-5 flex h-40 items-end gap-2">
        {bars.map((bar, i) => (
          <div key={i} className="flex h-full flex-1 flex-col justify-end gap-2">
            <div
              className={`w-full rounded-t-sm ${
                bar.forecast
                  ? 'border border-dashed border-primary/60 bg-primary/10'
                  : 'bg-primary'
              }`}
              style={{ height: `${bar.value}%` }}
            />
            <span className="text-center text-[10px] text-muted-foreground">{bar.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-md border border-border bg-background p-3">
        <Brain className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          Las barras punteadas son el pronóstico. Hora pico prevista:{' '}
          <span className="font-medium text-foreground">13:00 a 15:00</span>.
        </p>
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
          En marcha en tres pasos
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
                    <span className="block font-semibold text-foreground">{step.title}</span>
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

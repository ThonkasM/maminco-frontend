'use client'

import { useEffect, useState } from 'react'
import { Armchair, MonitorSmartphone } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { AppFrame } from './AppFrame'

type Status = 'Ocupada' | 'Disponible' | 'Reservada'
type TableEvent = { table: number; to: Status; message: string; amount: number }

const STATUS_STYLE: Record<Status, { text: string; dot: string }> = {
  Ocupada: { text: 'text-warning', dot: 'bg-warning' },
  Disponible: { text: 'text-success', dot: 'bg-success' },
  Reservada: { text: 'text-primary', dot: 'bg-primary' },
}

const INITIAL: Status[] = [
  'Ocupada',
  'Disponible',
  'Ocupada',
  'Reservada',
  'Disponible',
  'Ocupada',
]

const BASE_TOTAL = 2480
const TICK_MS = 2400

const EVENTS: TableEvent[] = [
  { table: 1, to: 'Ocupada', message: 'Mesa 2 abrió una orden', amount: 0 },
  { table: 0, to: 'Disponible', message: 'Mesa 1 pagó', amount: 186 },
  { table: 3, to: 'Ocupada', message: 'Mesa 4 llegó con su reserva', amount: 0 },
  { table: 4, to: 'Reservada', message: 'Mesa 5 reservada para las 21:00', amount: 0 },
  { table: 2, to: 'Disponible', message: 'Mesa 3 pagó', amount: 242.5 },
  { table: 5, to: 'Disponible', message: 'Mesa 6 pagó', amount: 134 },
  { table: 0, to: 'Ocupada', message: 'Mesa 1 abrió una orden', amount: 0 },
  { table: 3, to: 'Disponible', message: 'Mesa 4 pagó', amount: 310 },
  { table: 1, to: 'Disponible', message: 'Mesa 2 pagó', amount: 98 },
  { table: 2, to: 'Ocupada', message: 'Mesa 3 abrió una orden', amount: 0 },
  { table: 3, to: 'Reservada', message: 'Mesa 4 reservada para las 22:00', amount: 0 },
  { table: 4, to: 'Disponible', message: 'Mesa 5 liberada', amount: 0 },
  { table: 5, to: 'Ocupada', message: 'Mesa 6 abrió una orden', amount: 0 },
]

const CYCLE_AMOUNT = EVENTS.reduce((sum, e) => sum + e.amount, 0)
const MAX_TICKS = EVENTS.length * 3

function formatBs(value: number) {
  const [int, dec] = value.toFixed(2).split('.')
  return `Bs. ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`
}

function stateAt(tick: number) {
  const applied = tick % EVENTS.length
  const tables = [...INITIAL]
  let total = BASE_TOTAL + CYCLE_AMOUNT * Math.floor(tick / EVENTS.length)

  for (let i = 0; i < applied; i++) {
    tables[EVENTS[i].table] = EVENTS[i].to
    total += EVENTS[i].amount
  }

  return { tables, total }
}

export function LiveAppPreview() {
  const [tick, setTick] = useState(0)
  const done = tick >= MAX_TICKS

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (done || reduceMotion) return undefined

    const id = setInterval(() => setTick((t) => t + 1), TICK_MS)
    return () => clearInterval(id)
  }, [done])

  const { tables, total } = stateAt(tick)
  const lastTable = tick > 0 ? EVENTS[(tick - 1) % EVENTS.length].table : -1
  const log = [1, 2, 3]
    .map((i) => tick - i)
    .filter((t) => t >= 0)
    .map((t) => ({ id: t, message: EVENTS[t % EVENTS.length].message }))

  return (
    <AppFrame url="app.maminco.bo/pos/mesas">
      <div
        role="img"
        aria-label="Vista previa del punto de venta de Maminco: mesas y ventas del turno actualizándose en vivo"
        className="p-5 sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MonitorSmartphone className="size-4 text-primary" />
            Salón principal
          </div>
          <Badge variant="success">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            En vivo
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tables.map((status, i) => (
            <div
              key={i}
              className={`rounded-md border bg-background p-3 transition-colors duration-500 ${
                i === lastTable ? 'border-primary/50' : 'border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <Armchair className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Mesa {i + 1}</span>
              </div>
              <p
                className={`mt-1 flex items-center gap-1.5 text-xs font-medium ${STATUS_STYLE[status].text}`}
              >
                <span className={`size-1.5 rounded-full ${STATUS_STYLE[status].dot}`} />
                {status}
              </p>
            </div>
          ))}
        </div>

        <ul className="mt-4 min-h-[4.5rem] space-y-1.5 text-xs text-muted-foreground">
          {log.length === 0 ? (
            <li>Turno abierto</li>
          ) : (
            log.map((entry, i) => (
              <li key={entry.id} className={i === 0 ? 'text-foreground' : ''}>
                {entry.message}
              </li>
            ))
          )}
        </ul>

        <div className="mt-2 flex items-center justify-between rounded-md bg-primary/10 px-4 py-3">
          <span className="text-sm text-primary">Ventas del turno</span>
          <span className="font-mono text-sm font-semibold tabular-nums text-primary">
            {formatBs(total)}
          </span>
        </div>
      </div>
    </AppFrame>
  )
}

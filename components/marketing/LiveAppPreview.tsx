'use client'

import { useEffect, useState } from 'react'
import { Armchair, ClipboardList, MonitorSmartphone } from 'lucide-react'
import { AppFrame } from './AppFrame'

type Status = 'Ocupada' | 'Disponible' | 'Reservada'
type TableEvent = { table: number; to: Status }

const STATUS_STYLE: Record<Status, string> = {
  Disponible: 'bg-success text-white',
  Ocupada: 'bg-danger text-white',
  Reservada: 'bg-warning text-white',
}

const STATUS_DOT: Record<Status, string> = {
  Disponible: 'bg-success',
  Ocupada: 'bg-danger',
  Reservada: 'bg-warning',
}

const INITIAL: Status[] = [
  'Ocupada',
  'Disponible',
  'Ocupada',
  'Reservada',
  'Disponible',
  'Ocupada',
]

const TICK_MS = 2400

const EVENTS: TableEvent[] = [
  { table: 1, to: 'Ocupada' },
  { table: 0, to: 'Disponible' },
  { table: 3, to: 'Ocupada' },
  { table: 4, to: 'Reservada' },
  { table: 2, to: 'Disponible' },
  { table: 5, to: 'Disponible' },
  { table: 0, to: 'Ocupada' },
  { table: 3, to: 'Disponible' },
  { table: 1, to: 'Disponible' },
  { table: 2, to: 'Ocupada' },
  { table: 3, to: 'Reservada' },
  { table: 4, to: 'Disponible' },
  { table: 5, to: 'Ocupada' },
]

// La demo corre 3 vueltas y se detiene: no gasta batería ni CPU en segundo plano.
const MAX_TICKS = EVENTS.length * 3

function stateAt(tick: number) {
  const applied = tick % EVENTS.length
  const tables = [...INITIAL]

  for (let i = 0; i < applied; i++) {
    tables[EVENTS[i].table] = EVENTS[i].to
  }

  return tables
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

  const tables = stateAt(tick)
  const lastTable = tick > 0 ? EVENTS[(tick - 1) % EVENTS.length].table : -1
  const available = tables.filter((status) => status === 'Disponible').length
  const occupied = tables.filter((status) => status === 'Ocupada').length

  return (
    <AppFrame url="app.maminco.bo/pos/tables">
      <div
        role="img"
        aria-label="Vista previa del punto de venta de Maminco: mesas del salón con su estado actualizándose en vivo"
        className="p-5 sm:p-6"
      >
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
          <MonitorSmartphone className="size-4 text-primary" />
          Centro de órdenes
        </div>

        <div className="grid grid-cols-3 gap-3">
          {tables.map((status, i) => (
            <div
              key={i}
              className={`relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-lg text-center font-bold text-white shadow-elevated transition-colors duration-500 ${
                STATUS_STYLE[status]
              } ${i === lastTable ? 'ring-2 ring-white/70' : ''}`}
            >
              {status === 'Ocupada' && (
                <span className="absolute right-2 top-2 rounded-full bg-white/25 p-1">
                  <ClipboardList className="size-3.5" aria-hidden="true" />
                </span>
              )}
              <Armchair className="mb-2 size-8" aria-hidden="true" />
              <span className="text-base leading-none">Mesa {i + 1}</span>
              <span className="mt-1 text-xs font-medium opacity-90">{status}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            {(['Disponible', 'Ocupada', 'Reservada'] as Status[]).map((status) => (
              <span key={status} className="flex items-center gap-1.5">
                <span className={`size-3 rounded ${STATUS_DOT[status]}`} />
                {status}
              </span>
            ))}
          </div>
          <span className="tabular-nums">
            {available} libres · {occupied} ocupadas
          </span>
        </div>
      </div>
    </AppFrame>
  )
}

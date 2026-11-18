import type { ReactNode } from 'react'
import {
  ArrowRight,
  BarChart3,
  Brain,
  CreditCard,
  Monitor,
  Radio,
  Server,
  Smartphone,
  Store,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

function bs(value: number) {
  const [int, dec] = value.toFixed(2).split('.')
  return `Bs. ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`
}

function IconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
      {children}
    </span>
  )
}

function TicketPreview() {
  const lines = [
    { name: 'Pique macho', amount: 62 },
    { name: 'Silpancho ×2', amount: 76 },
    { name: 'Jugo natural ×3', amount: 42 },
  ]
  const total = lines.reduce((sum, l) => sum + l.amount, 0) * 1.1

  return (
    <div
      aria-hidden="true"
      className="rounded-lg border border-border bg-background p-4 shadow-elevated"
    >
      <p className="text-xs font-medium text-muted-foreground">Mesa 3</p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {lines.map((line) => (
          <li key={line.name} className="flex justify-between gap-3 text-foreground">
            <span>{line.name}</span>
            <span className="font-mono tabular-nums text-muted-foreground">
              {bs(line.amount)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold text-foreground">
        <span>Total con propina</span>
        <span className="font-mono tabular-nums">{bs(total)}</span>
      </div>
    </div>
  )
}

function PhonePreview() {
  const rows = [
    { name: 'Mesa 2', status: 'Ocupada', dot: 'bg-warning' },
    { name: 'Mesa 4', status: 'Reservada', dot: 'bg-primary' },
    { name: 'Mesa 5', status: 'Disponible', dot: 'bg-success' },
  ]

  return (
    <div
      aria-hidden="true"
      className="mx-auto mt-8 w-52 rounded-t-[2rem] border-4 border-b-0 border-foreground/80 bg-background px-3 pb-12 pt-4 shadow-float"
    >
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />
      <p className="text-xs font-medium text-muted-foreground">Ventas de hoy</p>
      <p className="font-mono text-lg font-semibold tabular-nums text-primary">
        {bs(2480)}
      </p>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li
            key={row.name}
            className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-xs"
          >
            <span className="font-medium text-foreground">{row.name}</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className={`size-1.5 rounded-full ${row.dot}`} />
              {row.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Sparkline() {
  return (
    <svg
      viewBox="0 0 200 64"
      className="h-16 w-full text-primary"
      fill="none"
      role="img"
      aria-label="Gráfico de ventas con una línea punteada que muestra el pronóstico"
    >
      <path
        d="M0 48 L20 42 L40 47 L60 34 L80 38 L100 26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M100 26 L120 22 L140 28 L160 16 L180 12 L200 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 6"
        opacity="0.6"
      />
      <circle cx="100" cy="26" r="4" fill="currentColor" />
    </svg>
  )
}

const ALSO_INCLUDES = [
  { icon: Monitor, title: 'Panel web administrativo', text: 'Áreas, mesas, productos y usuarios en un solo lugar.' },
  { icon: CreditCard, title: 'Pagos y cierre de caja', text: 'Efectivo, tarjeta y transferencia, con cierre por turno.' },
  { icon: BarChart3, title: 'Reportes', text: 'Ventas por producto, categoría y área.' },
  { icon: Server, title: 'Nube u On-Premise', text: 'Con Docker, respaldos y monitoreo del servicio.' },
]

export function FeaturesBento() {
  return (
    <>
      <div className="mt-14 grid gap-4 lg:grid-cols-6">
        {/* POS */}
        <Card className="overflow-hidden lg:col-span-4">
          <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_16rem] md:items-center">
            <div>
              <IconBadge>
                <Store className="size-5" />
              </IconBadge>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">
                Cobra desde cualquier navegador
              </h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Toma órdenes, aplica propinas y descuentos, y cierra caja por turno. Con
                o sin hardware dedicado, sin instalaciones complicadas.
              </p>
            </div>
            <TicketPreview />
          </CardContent>
        </Card>

        <Card className="flex flex-col overflow-hidden lg:col-span-2 lg:row-span-2">
          <CardContent className="flex flex-1 flex-col p-6 pb-0">
            <IconBadge>
              <Smartphone className="size-5" />
            </IconBadge>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">
              Meseros y gerentes, desde el celular
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Toma órdenes en la mesa y supervisa ventas y pronósticos desde donde estés.
            </p>
            <div className="mt-auto">
              <PhonePreview />
            </div>
          </CardContent>
        </Card>

        {/* Tiempo real */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <IconBadge>
              <Radio className="size-5" />
            </IconBadge>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">Sala y cocina al mismo ritmo</h3>
            <div
              aria-hidden="true"
              className="mt-4 flex items-center gap-2 text-xs font-medium text-foreground"
            >
              <span className="rounded-full border border-border bg-background px-3 py-1">Mesa 4</span>
              <ArrowRight className="size-3.5 text-muted-foreground" />
              <span className="rounded-full border border-border bg-background px-3 py-1">Cocina</span>
              <ArrowRight className="size-3.5 text-muted-foreground" />
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
                Listo
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Mesas, meseros y cocina sincronizados al instante: menos errores, más rotación.
            </p>
          </CardContent>
        </Card>

        {/* IA */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <IconBadge>
              <Brain className="size-5" />
            </IconBadge>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">Pronósticos de ventas con IA</h3>
            <div className="mt-4">
              <Sparkline />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Anticipa la demanda y las horas pico para planificar compras y personal.
            </p>
          </CardContent>
        </Card>
      </div>

      <ul className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {ALSO_INCLUDES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3 border-t border-border pt-4">
            <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

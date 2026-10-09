import type { ReactNode } from 'react'
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChefHat,
  CreditCard,
  Monitor,
  Radio,
  Server,
  Smartphone,
  Store,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { formatBs } from './formatBs'

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
  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0)
  const tip = subtotal * 0.1
  const total = subtotal + tip

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
              {formatBs(line.amount)}
            </span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <dt>Subtotal</dt>
          <dd className="font-mono tabular-nums">{formatBs(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <dt>Propina</dt>
          <dd className="font-mono tabular-nums">{formatBs(tip)}</dd>
        </div>
        <div className="flex justify-between font-semibold text-foreground">
          <dt>Total</dt>
          <dd className="font-mono tabular-nums">{formatBs(total)}</dd>
        </div>
      </dl>
    </div>
  )
}

function PhonePreview() {
  const rows = [
    { name: 'Mesa 2', status: 'Ocupada', dot: 'bg-danger' },
    { name: 'Mesa 4', status: 'Reservada', dot: 'bg-warning' },
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
        {formatBs(2480)}
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
      className="h-16 w-full"
      fill="none"
      role="img"
      aria-label="Pronóstico del modelo (línea sólida) por encima de la referencia baseline (línea punteada)"
    >
      <path
        d="M0 54 L20 50 L40 52 L60 44 L80 46 L100 38 L120 36 L140 40 L160 30 L180 28 L200 22"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 6"
      />
      <path
        d="M0 50 L20 44 L40 48 L60 36 L80 40 L100 28 L120 24 L140 30 L160 18 L180 14 L200 8"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function KitchenPreview() {
  const columns = [
    {
      label: 'Pendiente',
      dot: 'bg-warning',
      orders: [
        { table: '3', items: 2 },
        { table: '6', items: 1 },
      ],
    },
    {
      label: 'En preparación',
      dot: 'bg-primary',
      orders: [{ table: '5', items: 3 }],
    },
    {
      label: 'Listo',
      dot: 'bg-success',
      orders: [{ table: '2', items: 4 }],
    },
  ]

  return (
    <div
      aria-hidden="true"
      className="rounded-lg border border-border bg-background p-3 shadow-elevated"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Cocina</span>
        <Badge variant="info">En vivo</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {columns.map((column) => (
          <div key={column.label}>
            <p className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
              <span className={`size-1.5 rounded-full ${column.dot}`} />
              {column.label}
            </p>
            <div className="mt-1.5 space-y-1.5">
              {column.orders.map((order) => (
                <div
                  key={order.table}
                  className="rounded-md border border-border bg-surface p-2"
                >
                  <p className="text-xs font-semibold text-foreground">
                    Mesa {order.table}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {order.items} ítems
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const ALSO_INCLUDES = [
  {
    icon: Monitor,
    title: 'Panel web administrativo',
    text: 'Áreas, mesas, productos y usuarios en un solo lugar.',
  },
  {
    icon: CreditCard,
    title: 'Pagos y cierre de caja',
    text: 'Efectivo, tarjeta y transferencia, con cierre por turno.',
  },
  {
    icon: BarChart3,
    title: 'Reportes',
    text: 'Ventas por producto, categoría y área.',
  },
  {
    icon: Server,
    title: 'Nube u On-Premise',
    text: 'Con Docker, respaldos y monitoreo del servicio.',
  },
]

export function FeaturesBento() {
  return (
    <>
      <div className="mt-14 grid gap-4 lg:grid-cols-6">
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

        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <IconBadge>
              <Radio className="size-5" />
            </IconBadge>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">
              Salón y caja al mismo ritmo
            </h3>
            <div
              aria-hidden="true"
              className="mt-4 flex items-center gap-2 text-xs font-medium text-foreground"
            >
              <span className="rounded-full border border-border bg-background px-3 py-1">
                Mesa 4
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground" />
              <span className="rounded-full border border-border bg-background px-3 py-1">
                Orden
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground" />
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
                Pagada
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Mesas, órdenes y pagos sincronizados al instante: menos errores, más rotación.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <IconBadge>
              <Brain className="size-5" />
            </IconBadge>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">
              Pronósticos de ventas con IA
            </h3>
            <div className="mt-4">
              <Sparkline />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Anticipa la demanda y las horas pico para planificar compras y personal.
            </p>
          </CardContent>
        </Card>

        {/* Cocina Digitalizada */}
        <Card
          id="cocina"
          className="scroll-mt-20 overflow-hidden lg:col-span-6"
        >
          <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_22rem] md:items-center">
            <div>
              <IconBadge>
                <ChefHat className="size-5" />
              </IconBadge>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">
                Cocina Digitalizada
              </h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Con el rol de cocinero y una pantalla dedicada, tu equipo ve las
                órdenes abiertas y su avance, sincronizado en tiempo real con el
                salón y la caja.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  'Órdenes abiertas en vivo',
                  'Estados por toque: Pendiente → En preparación → Listo',
                  'Notas del pedido visibles',
                  'Se activa o desactiva a voluntad',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <KitchenPreview />
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

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Armchair,
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  CreditCard,
  LineChart,
  Monitor,
  MonitorSmartphone,
  Radio,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Chatbot } from '@/components/marketing/Chatbot'
import { ContactSection } from '@/components/marketing/ContactSection'
import { FaqSection } from '@/components/marketing/FaqSection'

export const metadata: Metadata = {
  title: 'Software de gestión para restaurantes',
  description:
    'Maminco Software S.R.L. desarrolla POS, gestión de mesas, pagos y pronósticos con IA para restaurantes de Bolivia. Productos, planes y demo.',
}

const PRODUCTS = [
  {
    icon: Monitor,
    title: 'Panel web administrativo',
    description:
      'Administra áreas, mesas, categorías, productos, usuarios y configuración desde un único panel.',
  },
  {
    icon: Store,
    title: 'POS web (punto de venta)',
    description:
      'Toma órdenes y cobra desde cualquier navegador, con propinas, descuentos y cierre de caja por turno.',
  },
  {
    icon: Smartphone,
    title: 'App móvil gerencial',
    description:
      'Dashboard, métricas y pronósticos para supervisar ventas y desempeño desde el celular.',
  },
  {
    icon: UtensilsCrossed,
    title: 'App móvil mesero',
    description:
      'Mesas, órdenes y cobro en la mano, sincronizados en tiempo real con sala y caja.',
  },
  {
    icon: Brain,
    title: 'Servicio de IA de pronósticos',
    description:
      'Ventas futuras, demanda por producto, horas pico y detección de días anómalos.',
  },
  {
    icon: Server,
    title: 'Infraestructura y despliegue',
    description:
      'Nube o instalación local (On-Premise), con Docker, respaldos y monitoreo del servicio.',
  },
]

const FEATURES = [
  {
    icon: Store,
    title: 'Punto de venta (POS) web',
    description:
      'Cobra rápido desde cualquier navegador, con o sin hardware dedicado. Sin instalaciones complicadas.',
  },
  {
    icon: Radio,
    title: 'Mesas y órdenes en tiempo real',
    description:
      'Mesas, meseros y cocina sincronizados al instante. Menos errores, más rotación.',
  },
  {
    icon: CreditCard,
    title: 'Pagos y caja',
    description:
      'Efectivo, tarjeta y transferencia con propinas, denominaciones y cierre de caja por turno.',
  },
  {
    icon: BarChart3,
    title: 'Reportes y métricas',
    description:
      'Ventas por producto, categoría y área. Visualiza el desempeño de tu restaurante en segundos.',
  },
  {
    icon: Brain,
    title: 'Pronósticos de ventas con IA',
    description:
      'Anticipa la demanda y planifica compras e inventario con modelos de proyección de ventas.',
  },
  {
    icon: Smartphone,
    title: 'Móvil para gerentes y meseros',
    description:
      'Toma órdenes desde el celular y supervisa el negocio desde donde estés.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Configura tu restaurante',
    description:
      'Crea áreas, mesas, categorías y productos en minutos con el panel administrativo.',
  },
  {
    number: '02',
    title: 'Opera desde el POS',
    description:
      'Toma órdenes, envía a cocina y cobra con propina desde una interfaz pensada para el ritmo del servicio.',
  },
  {
    number: '03',
    title: 'Decide con datos',
    description:
      'Revisa reportes, cierres de caja y pronósticos para optimizar precios, personal y compras.',
  },
]

const STATS = [
  { value: '−35%', label: 'Tiempo de atención por mesa' },
  { value: '+18%', label: 'Rotación de mesas en hora punta' },
  { value: '99.9%', label: 'Disponibilidad objetivo del servicio' },
  { value: '24/7', label: 'Operación y respaldo en la nube' },
]

const PLANS = [
  {
    name: 'Freemium',
    price: 'Bs 0',
    period: 'siempre',
    description: 'Para probar el sistema sin compromiso.',
    features: ['1 sucursal', 'Hasta 3 mesas', 'POS básico', 'Sin IA'],
    highlighted: false,
  },
  {
    name: 'SaaS Básico',
    price: 'Bs 250',
    period: 'por mes',
    description: 'Ideal para un restaurante pequeño.',
    features: [
      '1 sucursal',
      'Hasta 10 mesas',
      'POS y pagos',
      'Reportes básicos',
    ],
    highlighted: false,
  },
  {
    name: 'SaaS Pro',
    price: 'Bs 450',
    period: 'por mes',
    description: 'Para un restaurante mediano en crecimiento.',
    features: [
      'Mesas ilimitadas',
      'Pronósticos con IA',
      'Reportes avanzados',
      'App móvil completa',
    ],
    highlighted: true,
  },
  {
    name: 'SaaS Cadena',
    price: 'Bs 900',
    period: 'por mes + Bs 150/sucursal',
    description: 'Franquicias y cadenas con varias sucursales.',
    features: [
      'Multi-sucursal',
      'Administración central',
      'Consolidación de reportes',
      'Soporte prioritario',
    ],
    highlighted: false,
  },
]

const ON_PREMISE_FEATURES = [
  'Instalación en tu propio equipo',
  'Licencia perpetua',
  'Operación local sin internet',
  'Soporte anual',
]

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-mesh relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="max-w-3xl">
            <Badge className="border-white/25 bg-white/10 text-white">
              <Sparkles className="size-3.5" />
              Maminco Software S.R.L. · Hecho en Bolivia
            </Badge>

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl">
              El sistema que ordena tu restaurante de punta a punta
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-white/80">
              Somos una software house boliviana. Construimos Maminco: punto de
              venta, mesas y órdenes en tiempo real, pagos, caja y reportes con
              pronósticos de ventas. Todo en una sola plataforma, para gerentes,
              cajeros y meseros.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href="#contacto">
                <Button variant="accent" size="lg" shape="pill">
                  Solicitar demo
                  <ArrowRight />
                </Button>
              </a>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="lg"
                  shape="pill"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Iniciar sesión
                </Button>
              </Link>
              <a href="#productos">
                <Button
                  variant="ghost"
                  size="lg"
                  shape="pill"
                  className="text-white hover:bg-white/10"
                >
                  Ver productos
                </Button>
              </a>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
              {['Sin hardware obligatorio', 'Tiempo real', 'Precios en Bs.'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-accent" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Products and services */}
      <section id="productos" className="scroll-mt-20 bg-background py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Productos y servicios
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Un ecosistema completo para tu operación
            </h2>
            <p className="mt-4 text-muted-foreground">
              Del salón a la administración: cada componente comparte los mismos
              datos y se adapta al tamaño de tu restaurante.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="transition-shadow hover:shadow-elevated">
                <CardHeader>
                  <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="mt-2">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="caracteristicas"
        className="scroll-mt-20 border-y border-border bg-surface-muted py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Características
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Todo lo que tu operación necesita
            </h2>
            <p className="mt-4 text-muted-foreground">
              Un único sistema para sala, caja y administración. Cada módulo
              comparte los mismos datos, sin planillas paralelas.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="transition-shadow hover:shadow-elevated">
                <CardHeader>
                  <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="mt-2">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works / screenshots */}
      <section id="como-funciona" className="scroll-mt-20 bg-background py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                Cómo funciona
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                En marcha en tres pasos
              </h2>

              <ol className="mt-8 space-y-6">
                {STEPS.map((step) => (
                  <li key={step.number} className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface font-mono text-sm font-medium text-primary">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <AppPreview />
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-brand-green py-16 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="planes" className="scroll-mt-20 bg-background py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Planes
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Suscripción por sucursal, sin sorpresas
            </h2>
            <p className="mt-4 text-muted-foreground">
              Precios en bolivianos (Bs.). Elige un plan SaaS y agrega módulos, o
              instala el sistema On-Premise si necesitas operar sin internet.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.highlighted
                    ? 'relative border-primary shadow-elevated'
                    : 'transition-shadow hover:shadow-elevated'
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.highlighted && <Badge variant="brand">Recomendado</Badge>}
                  </div>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-primary">
                    {plan.price}
                  </p>
                  <p className="text-xs text-muted-foreground">{plan.period}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Server className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      On-Premise
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Bs 8.000 – 12.000 pago único + Bs 1.500/año de soporte
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Para locales sin internet confiable: instala Maminco en tu propio
                  equipo con licencia perpetua y los datos en tu infraestructura.
                </p>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {ON_PREMISE_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection />

      {/* Team */}
      <section id="equipo" className="scroll-mt-20 bg-background py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Equipo
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Detrás de Maminco
            </h2>
            <p className="mt-4 text-muted-foreground">
              Construimos herramientas para que la hospitalidad sea el centro de tu
              negocio, no la operación.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-start gap-4 p-6">
                <span className="flex size-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                  JC
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">Jorge Carvajal</h3>
                  <p className="text-sm text-primary">
                    Fundador & Líder de producto
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Diseña y lidera Maminco con foco en la operación real del salón y
                  la caja.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <ContactSection />

      {/* Final CTA */}
      <section className="border-t border-border bg-surface-muted py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6">
          <span className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-6" />
          </span>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Empieza a ordenar tu restaurante hoy
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Accede al panel administrativo y al punto de venta con tus credenciales
            del restaurante, o solicita una demo guiada.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/auth/login">
              <Button size="lg" shape="pill">
                Iniciar sesión
                <ArrowRight />
              </Button>
            </Link>
            <a href="#contacto">
              <Button variant="outline" size="lg" shape="pill">
                Solicitar demo
              </Button>
            </a>
            <Link href="/dashboard">
              <Button variant="ghost" size="lg" shape="pill">
                Ir al panel
              </Button>
            </Link>
          </div>

          <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Datos bajo tu control
            </li>
            <li className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              Implementación rápida
            </li>
            <li className="flex items-center gap-2">
              <LineChart className="size-4 text-primary" />
              Reportes claros
            </li>
          </ul>
        </div>
      </section>

      <Chatbot />
    </>
  )
}

function AppPreview() {
  const tables = [
    { name: 'Mesa 1', status: 'Ocupada', tone: 'text-warning' },
    { name: 'Mesa 2', status: 'Disponible', tone: 'text-success' },
    { name: 'Mesa 3', status: 'Ocupada', tone: 'text-warning' },
    { name: 'Mesa 4', status: 'Reservada', tone: 'text-primary' },
    { name: 'Mesa 5', status: 'Disponible', tone: 'text-success' },
    { name: 'Mesa 6', status: 'Ocupada', tone: 'text-warning' },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-float">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-muted px-4 py-3">
        <span className="size-3 rounded-full bg-danger/70" />
        <span className="size-3 rounded-full bg-warning/70" />
        <span className="size-3 rounded-full bg-success/70" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">
          app.maminco.bo/pos/tables
        </span>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MonitorSmartphone className="size-4 text-primary" />
            Salón principal
          </div>
          <Badge variant="success">
            <Radio className="size-3" />
            En vivo
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tables.map((table) => (
            <div
              key={table.name}
              className="rounded-md border border-border bg-background p-3"
            >
              <div className="flex items-center gap-2">
                <Armchair className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {table.name}
                </span>
              </div>
              <p className={`mt-1 text-xs font-medium ${table.tone}`}>
                {table.status}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-md bg-primary/10 px-4 py-3">
          <span className="text-sm text-primary">Ventas del turno</span>
          <span className="font-mono text-sm font-semibold text-primary">
            Bs. 2.480,00
          </span>
        </div>
      </div>
    </div>
  )
}

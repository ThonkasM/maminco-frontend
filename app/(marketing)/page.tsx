import type { Metadata } from 'next'
import type { ComponentProps } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  ClipboardList,
  LineChart,
  Server,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Chatbot } from '@/components/marketing/Chatbot'
import { ContactSection } from '@/components/marketing/ContactSection'
import { FaqSection } from '@/components/marketing/FaqSection'
import { FeaturesBento } from '@/components/marketing/FeaturesBento'
import { LiveAppPreview } from '@/components/marketing/LiveAppPreview'
import { StepsShowcase } from '@/components/marketing/StepsShowcase'
import { cn } from '@/lib/utils/cn'

export const metadata: Metadata = {
  title: 'Software de gestión para restaurantes',
  description:
    'Maminco Software S.R.L. desarrolla POS, gestión de mesas, pagos y pronósticos con IA para restaurantes de Bolivia. Productos, planes y demo.',
}

const FACTS = [
  { value: 'Bs 0', label: 'Plan Freemium, sin límite de tiempo' },
  {
    value: '5 roles',
    label: 'Administrador, gerente, cajero, mesero y cocinero en un mismo sistema',
  },
  { value: '2 formas', label: 'En la nube (SaaS) o instalado en tu local' },
  { value: '99.9%', label: 'Disponibilidad objetivo del servicio' },
]

const PLANS = [
  {
    name: 'Freemium',
    price: 'Bs 0',
    period: 'siempre',
    description: 'Para probar el sistema sin compromiso.',
    includes: null,
    features: ['1 sucursal', 'Hasta 3 mesas', 'POS básico'],
    cta: 'Probar gratis',
    highlighted: false,
  },
  {
    name: 'SaaS Básico',
    price: 'Bs 250',
    period: 'por mes',
    description: 'Ideal para un restaurante pequeño.',
    includes: 'Todo lo de Freemium, más:',
    features: ['Hasta 10 mesas', 'Pagos y cierre de caja', 'Reportes básicos'],
    cta: 'Solicitar demo',
    highlighted: false,
  },
  {
    name: 'SaaS Pro',
    price: 'Bs 450',
    period: 'por mes',
    description: 'Para un restaurante mediano en crecimiento.',
    includes: 'Todo lo de Básico, más:',
    features: ['Mesas ilimitadas', 'Pronósticos con IA', 'Reportes avanzados', 'App móvil completa'],
    cta: 'Solicitar demo',
    highlighted: true,
  },
  {
    name: 'SaaS Cadena',
    price: 'Bs 900',
    period: 'por mes + Bs 150/sucursal',
    description: 'Franquicias y cadenas con varias sucursales.',
    includes: 'Todo lo de Pro, más:',
    features: ['Multi-sucursal', 'Administración central', 'Consolidación de reportes', 'Soporte prioritario'],
    cta: 'Hablar con ventas',
    highlighted: false,
  },
]

const ON_PREMISE_FEATURES = [
  'Instalación en tu propio equipo',
  'Licencia perpetua',
  'Operación local sin internet',
  'Soporte anual',
]

function LinkButton({
  href,
  variant,
  size,
  shape,
  className,
  children,
}: ComponentProps<typeof Button> & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size, shape }), className)}
    >
      {children}
    </Link>
  )
}

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-mesh relative overflow-hidden text-foreground dark:text-white">
        <div className="absolute inset-0 bg-white/30 dark:bg-black/20" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1fr_1.05fr] lg:py-32">
          <div>
            <Badge className="border-border bg-surface text-foreground dark:border-white/25 dark:bg-white/10 dark:text-white">
              <Sparkles className="size-3.5" />
              Maminco Software S.R.L. · Hecho en Bolivia
            </Badge>

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl xl:text-6xl">
              El sistema que ordena tu restaurante de punta a punta
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted-foreground dark:text-white/80">
              Maminco reúne punto de venta, mesas y órdenes en tiempo real, pagos, caja y
              pronósticos de ventas en una sola plataforma, para gerentes, cajeros y meseros.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <LinkButton href="#contacto" variant="accent" size="lg" shape="pill">
                Solicitar demo
                <ArrowRight />
              </LinkButton>
              <LinkButton
                href="/auth/login"
                variant="outline"
                size="lg"
                shape="pill"
                className="border-border text-foreground hover:bg-surface-muted dark:border-white/30 dark:text-white dark:hover:bg-white/10"
              >
                Iniciar sesión
              </LinkButton>
              <LinkButton
                href="#como-funciona"
                variant="ghost"
                size="lg"
                shape="pill"
                className="text-foreground hover:bg-surface-muted dark:text-white dark:hover:bg-white/10"
              >
                Ver cómo funciona
              </LinkButton>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground dark:text-white/70">
              {[
                'Sin hardware obligatorio',
                'Tiempo real',
                'Cocina digitalizada (opcional)',
                'Precios en Bs.',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-4 text-primary dark:text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative [perspective:1600px]">
            <div className="transition-transform duration-700 motion-reduce:transition-none lg:[transform:rotateY(-6deg)_rotateX(3deg)] lg:hover:[transform:none]">
              <LiveAppPreview />
            </div>
            <div className="absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-medium text-foreground shadow-float backdrop-blur dark:border-white/20 dark:bg-white/15 dark:text-white sm:flex">
              <ClipboardList className="size-4 text-primary dark:text-accent" />
              Nueva orden abierta
            </div>
          </div>
        </div>
      </section>

      {/* Productos y características */}
      <section id="productos" className="scroll-mt-20 bg-background py-24">
        <div id="caracteristicas" className="scroll-mt-20" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Todo lo que tu operación necesita
            </h2>
            <p className="mt-4 text-muted-foreground">
              Del salón a la administración: cada módulo comparte los mismos datos, sin
              planillas paralelas.
            </p>
          </div>

          <FeaturesBento />
        </div>
      </section>

      {/* Cómo funciona */}
      <section
        id="como-funciona"
        className="scroll-mt-20 border-y border-border bg-surface-muted py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <StepsShowcase />
        </div>
      </section>

      {/* Datos clave */}
      <section className="bg-primary py-14 text-primary-foreground">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4">
          {FACTS.map((fact) => (
            <div key={fact.label}>
              <dt className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {fact.value}
              </dt>
              <dd className="mt-2 text-sm text-primary-foreground/70">{fact.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Planes */}
      <section id="planes" className="scroll-mt-20 bg-background py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Suscripción por sucursal, sin sorpresas
            </h2>
            <p className="mt-4 text-muted-foreground">
              Precios en bolivianos (Bs.). Elige un plan SaaS y agrega módulos, o instala el
              sistema On-Premise si necesitas operar sin internet.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={`flex h-full flex-col ${
                  plan.highlighted
                    ? 'relative shadow-elevated ring-2 ring-primary lg:-translate-y-2'
                    : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.highlighted && <Badge variant="brand">Recomendado</Badge>}
                  </div>
                  <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-primary">
                    {plan.price}
                  </p>
                  <p className="text-xs text-muted-foreground">{plan.period}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-6">
                  <div>
                    {plan.includes && (
                      <p className="mb-3 text-xs font-medium text-foreground">
                        {plan.includes}
                      </p>
                    )}
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
                  </div>
                  <div className="mt-auto">
                    <LinkButton
                      href="#contacto"
                      variant={plan.highlighted ? undefined : 'outline'}
                      shape="pill"
                      className="w-full"
                    >
                      {plan.cta}
                    </LinkButton>
                  </div>
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
                    <h3 className="text-lg font-semibold tracking-tight">On-Premise</h3>
                    <p className="text-sm text-muted-foreground">
                      Bs 8.000 – 12.000 pago único + Bs 1.500/año de soporte
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Para locales sin internet confiable: instala Maminco en tu propio equipo con
                  licencia perpetua y los datos en tu infraestructura.
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

      {/* Equipo */}
      <section id="equipo" className="scroll-mt-20 bg-background py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Detrás de Maminco
            </h2>
            <p className="mt-4 text-muted-foreground">
              Construimos herramientas para que la hospitalidad sea el centro de tu negocio, no
              la operación.
            </p>
          </div>

          <Card className="mt-10 max-w-2xl">
            <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                JC
              </span>
              <div>
                <h3 className="font-semibold text-foreground">Jorge Carvajal</h3>
                <p className="text-sm text-primary">Fundador y líder de producto</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Diseña y lidera Maminco con foco en la operación real del salón y la caja.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contacto */}
      <ContactSection />

      {/* CTA final */}
      <section className="border-t border-border bg-surface-muted py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6">
          <span className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-6" />
          </span>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Empieza a ordenar tu restaurante hoy
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Solicita una demo guiada o accede al panel y al punto de venta con las credenciales
            de tu restaurante.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton href="#contacto" size="lg" shape="pill">
              Solicitar demo
              <ArrowRight />
            </LinkButton>
            <LinkButton href="/auth/login" variant="outline" size="lg" shape="pill">
              Iniciar sesión
            </LinkButton>
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

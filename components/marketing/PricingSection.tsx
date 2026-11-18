import { ArrowRight, Check, Server, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { LinkButton } from './LinkButton'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

const PLANS = [
  {
    name: 'Freemium',
    price: 'Bs 0',
    period: 'para siempre',
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
    cta: 'Contratar',
    highlighted: false,
  },
  {
    name: 'SaaS Pro',
    price: 'Bs 450',
    period: 'por mes',
    description: 'Para un restaurante mediano en crecimiento.',
    includes: 'Todo lo de Básico, más:',
    features: ['Mesas ilimitadas', 'Pronósticos con IA', 'Reportes avanzados', 'App móvil completa'],
    cta: 'Contratar',
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

export function PricingSection() {
  return (
    <section id="planes" className="relative scroll-mt-24 overflow-hidden bg-surface-muted py-24 sm:py-32">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          align="center"
          eyebrow="Planes"
          title="Suscripción por sucursal, sin sorpresas"
          description="Precios en bolivianos (Bs.). Empieza gratis, crece cuando lo necesites o instala Maminco en tu local para operar sin internet."
        />

        <div className="mt-16 grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, index) => (
            <Reveal
              key={plan.name}
              delay={index * 90}
              className={cn(
                'relative flex flex-col rounded-2xl border p-6',
                plan.highlighted
                  ? 'dark border-brand-leaf bg-nav text-foreground shadow-float lg:-my-4 lg:py-10'
                  : 'border-border bg-surface shadow-card',
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-brand-yellow to-brand-orange px-3 py-1 text-xs font-semibold text-brand-ink">
                  <Sparkles className="size-3" aria-hidden="true" />
                  Más elegido
                </span>
              )}

              <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <p className="mt-6 text-4xl font-semibold tracking-[-0.04em] tabular-nums">
                {plan.price}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{plan.period}</p>

              <LinkButton
                href="https://wa.me/59170000000"
                target="_blank"
                rel="noreferrer"
                variant={plan.highlighted ? 'primary' : 'outline'}
                className={cn(
                  'mt-6 w-full',
                  plan.highlighted &&
                    'bg-gradient-to-r from-brand-yellow to-brand-orange font-semibold text-brand-ink hover:brightness-110 focus-visible:ring-offset-nav',
                )}
              >
                {plan.cta}
              </LinkButton>

              <div className="mt-6 border-t border-border pt-6">
                {plan.includes && (
                  <p className="mb-3 text-xs font-medium">{plan.includes}</p>
                )}
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-tone-leaf" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Server className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">On-Premise</h3>
                  <p className="text-sm text-muted-foreground">
                    Bs 8.000 – 12.000 pago único + Bs 1.500/año de soporte
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Para locales sin internet confiable: Maminco en tu propio equipo, con licencia
                perpetua y los datos en tu infraestructura.
              </p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {ON_PREMISE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-tone-leaf" />
                  {feature}
                </li>
              ))}
            </ul>
            <LinkButton href="https://wa.me/59170000000" target="_blank" rel="noreferrer" variant="outline" className="group">
              Cotizar instalación
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

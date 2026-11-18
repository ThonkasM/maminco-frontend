import Image from 'next/image'
import { ArrowRight, Eye, Gauge, MapPin, Radio, ShieldCheck, Target } from 'lucide-react'
import { LinkButton } from './LinkButton'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'
import { WoodBackground } from './WoodBackground'

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Precisión',
    text: 'El dinero se calcula con exactitud: totales, propinas y vueltos sin margen de error.',
  },
  {
    icon: Radio,
    title: 'Tiempo real',
    text: 'Salón, caja y cocina trabajan sobre los mismos datos, siempre actualizados.',
  },
  {
    icon: Gauge,
    title: 'Simplicidad',
    text: 'Herramientas claras para el día a día del servicio, sin planillas paralelas.',
  },
  {
    icon: MapPin,
    title: 'Hecho en Bolivia',
    text: 'Precios en bolivianos y una operación pensada para la realidad local.',
  },
]

const TEAM = [
  {
    name: 'Jorge Carvajal',
    role: 'Fundador y líder de producto',
    bio: 'Diseña y lidera Maminco con foco en la operación real del salón y la caja.',
    photo: '/team/jorge-carvajal.jpg',
  },
]

const VALUE_TONES = ['text-tone-leaf', 'text-tone-amber', 'text-tone-orange', 'text-tone-emerald']

export function AboutPage() {
  return (
    <>
      <section className="dark relative isolate overflow-hidden border-b-4 border-brand-leaf bg-wood text-foreground">
        <WoodBackground className="absolute inset-0 -z-20" />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/60 to-black/25"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-36">
          <SectionHeading
            eyebrow="Nosotros"
            title="Tecnología boliviana para ordenar restaurantes"
            description="Maminco Software S.R.L. es una startup boliviana que desarrolla un sistema integral de punto de venta y gestión para restaurantes."
          />
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary-ink">
              Quiénes somos
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Nacimos en la operación de un restaurante
            </h2>
          </Reveal>
          <Reveal delay={100} className="space-y-4 text-pretty text-muted-foreground sm:text-lg">
            <p>
              Maminco empezó resolviendo los problemas de un restaurante real: comandas en papel,
              cobros a mano y decisiones tomadas “a ojo”. Ese restaurante sigue siendo nuestro
              cliente ancla y el lugar donde probamos cada mejora.
            </p>
            <p>
              Hoy ofrecemos un sistema con panel administrativo, punto de venta, cocina digitalizada,
              app móvil y pronósticos con inteligencia artificial, para que cada restaurante trabaje
              con información confiable y en tiempo real.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border bg-surface-muted py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-2">
          <Reveal className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Target className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">Misión</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              Digitalizar la operación de los restaurantes bolivianos con un sistema accesible,
              preciso y en tiempo real, que conecte el salón, la caja, la cocina y la gerencia, y
              que ayude a decidir con datos.
            </p>
          </Reveal>
          <Reveal
            delay={100}
            className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Eye className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">Visión</h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              Ser la plataforma de gestión de referencia para restaurantes pequeños y medianos de
              Bolivia, reconocida por su confiabilidad y por llevar la analítica predictiva a
              negocios que hoy operan con procesos manuales.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Valores" title="Lo que guía nuestro trabajo" />
          <ul className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }, index) => (
              <Reveal
                as="li"
                key={title}
                delay={index * 80}
                className="border-t border-border pt-4"
              >
                <Icon className={`size-5 ${VALUE_TONES[index % VALUE_TONES.length]}`} aria-hidden="true" />
                <p className="mt-3 font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="equipo" className="scroll-mt-24 border-t border-border bg-surface-muted py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Equipo"
            title="Las personas detrás de Maminco"
            description="Un equipo pequeño y multidisciplinario que desarrolla, prueba y opera el sistema."
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member) => (
              <Reveal
                as="li"
                key={member.name}
                className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
              >
                <Image
                  src={member.photo}
                  alt={`Retrato de ${member.name}`}
                  width={480}
                  height={480}
                  className="aspect-square w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-lg font-semibold tracking-tight">{member.name}</p>
                  <p className="text-sm font-medium text-primary-ink">{member.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-background px-4 py-20 text-center sm:px-6 sm:py-24">
        <Reveal className="mx-auto max-w-xl">
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            ¿Quieres Maminco en tu restaurante?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cuéntanos sobre tu restaurante y te respondemos.
          </p>
          <LinkButton href="https://wa.me/59170000000" target="_blank" rel="noreferrer" size="lg" className="group mt-8 shadow-elevated">
            Escríbenos por WhatsApp
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </LinkButton>
        </Reveal>
      </section>
    </>
  )
}

import { ArrowRight, Check, ChevronDown, PlayCircle } from 'lucide-react'
import { LinkButton } from './LinkButton'
import { LiveAppPreview } from './LiveAppPreview'
import { WoodBackground } from './WoodBackground'

const TRUST = ['Sin hardware obligatorio', 'Tiempo real', 'Precios en Bs.']

export function Hero() {
  return (
    <section className="dark relative isolate flex min-h-svh flex-col overflow-hidden border-b-4 border-brand-leaf bg-wood text-foreground">
      <WoodBackground className="absolute inset-0 -z-20" />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/60 to-black/25"
        aria-hidden="true"
      />

      <div className="mx-auto grid w-full max-w-6xl flex-1 content-center items-center gap-12 px-4 pb-28 pt-28 sm:px-6 sm:pt-32 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pt-28">
        <div>
          <h1 className="font-display text-5xl font-normal uppercase leading-[1.02] tracking-[0.005em] text-cream sm:text-6xl xl:text-7xl">
            Tu restaurante <span className="text-menu-green">en orden</span> de punta a punta
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg text-cream/85">
            Punto de venta, mesas y órdenes en vivo, cobros y cierre de caja, cocina y
            pronósticos con IA. Una sola plataforma para todo tu equipo, del salón a la
            gerencia.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <LinkButton
              href="#planes"
              size="lg"
              className="bg-menu-green text-white hover:bg-menu-green/90 focus-visible:ring-offset-wood"
            >
              Ver planes
              <ArrowRight />
            </LinkButton>
            <LinkButton
              href="#como-funciona"
              variant="outline"
              size="lg"
              className="border-cream/40 text-cream hover:bg-cream/10 hover:text-cream focus-visible:ring-offset-wood"
            >
              <PlayCircle />
              Ver cómo funciona
            </LinkButton>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream/75">
            {TRUST.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-4 text-menu-green" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="app-theme rounded-xl text-foreground shadow-float ring-1 ring-white/10">
          <LiveAppPreview />
        </div>
      </div>

      <a
        href="#productos"
        aria-label="Descubre Maminco"
        className="group absolute inset-x-0 bottom-6 mx-auto hidden w-full max-w-xl flex-col items-center gap-1.5 rounded-lg px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex"
      >
        <span className="flex w-full items-center gap-5" aria-hidden="true">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-menu-green" />
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-cream/80 transition-colors group-hover:text-cream">
            Descubre Maminco
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-menu-green" />
        </span>
        <ChevronDown
          className="size-5 text-menu-green motion-safe:animate-bounce"
          aria-hidden="true"
        />
      </a>
    </section>
  )
}

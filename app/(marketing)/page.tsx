import type { Metadata } from 'next'
import { Chatbot } from '@/components/marketing/Chatbot'
import { FaqSection } from '@/components/marketing/FaqSection'
import { FeaturesBento } from '@/components/marketing/FeaturesBento'
import { Hero } from '@/components/marketing/Hero'
import { PricingSection } from '@/components/marketing/PricingSection'
import { RolesSection } from '@/components/marketing/RolesSection'
import { SectionHeading } from '@/components/marketing/SectionHeading'
import { StepsShowcase } from '@/components/marketing/StepsShowcase'

export const metadata: Metadata = {
  title: 'Software de gestión para restaurantes',
  description:
    'Maminco Software S.R.L. desarrolla POS, gestión de mesas, pagos y pronósticos con IA para restaurantes de Bolivia. Productos y planes.',
}

export default function LandingPage() {
  return (
    <>
      <Hero />

      <section id="productos" className="scroll-mt-24 border-t border-border bg-surface-muted py-24 sm:py-32">
        <div id="caracteristicas" className="scroll-mt-24" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Producto"
            title="Todo lo que tu operación necesita"
            description="Del salón a la administración: cada módulo comparte los mismos datos, sin planillas paralelas."
          />
          <FeaturesBento />
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-24 bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <StepsShowcase />
        </div>
      </section>

      <RolesSection />
      <PricingSection />
      <FaqSection />
      <Chatbot />
    </>
  )
}

'use client'

import * as React from 'react'
import { MessageCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { OPEN_CHATBOT_EVENT } from './Chatbot'
import { FAQS, FAQ_CATEGORY_LABELS, type FaqCategory } from './faq'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

const CATEGORIES = Object.keys(FAQ_CATEGORY_LABELS) as FaqCategory[]

export function FaqSection() {
  const [category, setCategory] = React.useState<FaqCategory | 'all'>('all')
  const [openId, setOpenId] = React.useState<string | null>(FAQS[0]?.id ?? null)
  const items = category === 'all' ? FAQS : FAQS.filter((item) => item.category === category)

  return (
    <section id="faq" className="scroll-mt-24 bg-background py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            eyebrow="Preguntas frecuentes"
            title="Resolvemos tus dudas"
            description="Las respuestas más comunes de dueños y gerentes de restaurantes."
          />

          <Reveal delay={120} className="mt-8 rounded-2xl border border-border bg-surface-muted p-6">
            <p className="font-semibold text-foreground">¿No encuentras tu respuesta?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pregúntale al asistente o escríbenos y te respondemos.
            </p>
            <Button
              shape="pill"
              variant="outline"
              className="mt-4 bg-surface"
              onClick={() => window.dispatchEvent(new Event(OPEN_CHATBOT_EVENT))}
            >
              <MessageCircle aria-hidden="true" />
              Abrir asistente
            </Button>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
            {(['all', ...CATEGORIES] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={category === value}
                onClick={() => setCategory(value)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  category === value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-surface text-muted-foreground hover:text-foreground',
                )}
              >
                {value === 'all' ? 'Todas' : FAQ_CATEGORY_LABELS[value]}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {items.map((item) => {
              const isOpen = openId === item.id
              const triggerId = `faq-trigger-${item.id}`
              const panelId = `faq-panel-${item.id}`

              return (
                <div
                  key={item.id}
                  className={cn(
                    'rounded-xl border bg-surface transition-[border-color,box-shadow] duration-300',
                    isOpen ? 'border-primary/30 shadow-elevated' : 'border-border hover:border-primary/20',
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      id={triggerId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex-1 text-sm font-medium text-foreground sm:text-base">
                        {item.question}
                      </span>
                      <span
                        className={cn(
                          'flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300',
                          isOpen && 'rotate-45 border-primary bg-primary text-primary-foreground',
                        )}
                      >
                        <Plus className="size-4" aria-hidden="true" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    inert={!isOpen}
                    className={cn(
                      'grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-muted-foreground">{item.answer}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

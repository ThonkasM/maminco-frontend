'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'
import { FAQS, FAQ_CATEGORY_LABELS } from './faq'

export function FaqSection() {
  const [openId, setOpenId] = React.useState<string | null>(FAQS[0]?.id ?? null)

  return (
    <section id="faq" className="scroll-mt-20 bg-surface-muted py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            Preguntas frecuentes
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Resolvemos tus dudas
          </h2>
          <p className="mt-4 text-muted-foreground">
            Las respuestas más comunes de dueños y gerentes de restaurantes. Si
            necesitas algo más, usa el asistente o contáctanos.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
          {FAQS.map((item, index) => {
            const isOpen = openId === item.id
            const triggerId = `faq-trigger-${item.id}`
            const panelId = `faq-panel-${item.id}`

            return (
              <div
                key={item.id}
                className={cn(index > 0 && 'border-t border-border')}
              >
                <h3>
                  <button
                    type="button"
                    id={triggerId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex-1 text-sm font-medium text-foreground sm:text-base">
                      {item.question}
                    </span>
                    <Badge variant="neutral" className="hidden sm:inline-flex">
                      {FAQ_CATEGORY_LABELS[item.category]}
                    </Badge>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        'size-4 shrink-0 text-muted-foreground transition-transform',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  hidden={!isOpen}
                  className="px-5 pb-5"
                >
                  <p className="max-w-3xl text-sm text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

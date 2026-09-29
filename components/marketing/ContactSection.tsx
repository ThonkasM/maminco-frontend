'use client'

import * as React from 'react'
import { Mail, MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/shared/ToastProvider'

interface ContactErrors {
  name?: string
  contact?: string
  message?: string
}

export function ContactSection() {
  const [name, setName] = React.useState('')
  const [contact, setContact] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [errors, setErrors] = React.useState<ContactErrors>({})
  const [sent, setSent] = React.useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: ContactErrors = {}
    if (!name.trim()) nextErrors.name = 'Ingresa tu nombre.'
    if (!contact.trim()) nextErrors.contact = 'Ingresa un correo o teléfono.'
    if (!message.trim()) nextErrors.message = 'Cuéntanos qué necesitas.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSent(true)
    toast.success('Solicitud registrada. Te contactaremos para coordinar la demo.')
  }

  return (
    <section id="contacto" className="scroll-mt-20 bg-background py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            Contacto
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Conversemos sobre tu restaurante
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cuéntanos cuántas sucursales y mesas tienes y te recomendamos el plan
            adecuado. También coordinamos una demo guiada del panel y del POS.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Mail className="size-5" aria-hidden="true" />
              </span>
              <a
                href="mailto:contacto@maminco.bo"
                className="text-foreground transition-colors hover:text-primary"
              >
                contacto@maminco.bo
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <MessageCircle className="size-5" aria-hidden="true" />
              </span>
              <a
                href="https://wa.me/59170000000"
                target="_blank"
                rel="noreferrer"
                className="text-foreground transition-colors hover:text-primary"
              >
                WhatsApp: +591 700-00000
              </a>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#planes">
              <Button variant="outline" shape="pill">
                Ver planes
              </Button>
            </a>
            <a href="#productos">
              <Button variant="ghost" shape="pill">
                Conocer el producto
              </Button>
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
          {sent ? (
            <div className="flex h-full flex-col items-start justify-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
                <Send className="size-6" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight">
                Solicitud registrada
              </h3>
              <p className="text-sm text-muted-foreground">
                Gracias, {name.trim() || 'equipo'}. Te contactaremos para coordinar
                la demostración y resolver tus dudas.
              </p>
              <Button
                variant="outline"
                shape="pill"
                onClick={() => {
                  setSent(false)
                  setName('')
                  setContact('')
                  setMessage('')
                }}
              >
                Enviar otra solicitud
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <FormField label="Nombre" required error={errors.name}>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="name"
                />
              </FormField>

              <FormField label="Correo o teléfono" required error={errors.contact}>
                <Input
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  placeholder="correo@restaurante.bo o +591 700-00000"
                />
              </FormField>

              <FormField label="Mensaje" required error={errors.message}>
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Cuéntanos sobre tu restaurante y qué necesitas."
                  rows={4}
                />
              </FormField>

              <Button type="submit" shape="pill" size="lg" className="w-full">
                Solicitar demo
                <Send aria-hidden="true" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

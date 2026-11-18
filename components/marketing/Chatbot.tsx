'use client'

import * as React from 'react'
import Image from 'next/image'
import { MessageCircle, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils/cn'
import { respondWithFaq, FAQS, type ChatbotReply, type FaqItem } from './faq'

interface ChatMessage {
  id: number
  role: 'user' | 'bot'
  text: string
  suggestions?: FaqItem[]
}

export const OPEN_CHATBOT_EVENT = 'maminco:open-chatbot'

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 0,
    role: 'bot',
    text: 'Hola, soy el asistente de Maminco. Pregúntame sobre precios, funcionalidades, seguridad o soporte.',
    suggestions: FAQS.slice(0, 3),
  },
]

export interface ChatbotProps {
  /**
   * Extension point: replace the FAQ matcher with a future AI/RAG backend
   * without touching the widget UI.
   */
  responder?: (query: string) => ChatbotReply
}

export function Chatbot({ responder = respondWithFaq }: ChatbotProps) {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = React.useState('')
  const idRef = React.useRef(0)
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener(OPEN_CHATBOT_EVENT, handleOpen)
    return () => window.removeEventListener(OPEN_CHATBOT_EVENT, handleOpen)
  }, [])

  React.useEffect(() => {
    if (!open) return
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [open, messages])

  const send = React.useCallback(
    (value: string) => {
      const text = value.trim()
      if (!text) return

      const reply = responder(text)
      const userMessage: ChatMessage = {
        id: ++idRef.current,
        role: 'user',
        text,
      }
      const botMessage: ChatMessage = {
        id: ++idRef.current,
        role: 'bot',
        text: reply.answer,
        suggestions: reply.suggestions.length > 0 ? reply.suggestions : undefined,
      }

      setMessages((previous) => [...previous, userMessage, botMessage])
      setInput('')
    },
    [responder],
  )

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    send(input)
  }

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:right-6">
      {open && (
        <div
          id="maminco-chatbot-panel"
          role="dialog"
          aria-label="Asistente de Maminco"
          className="flex h-[30rem] w-[min(22rem,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-float motion-safe:animate-[role-in_250ms_ease-out]"
        >
          <div className="flex items-center gap-3 border-b-[3px] border-brand-leaf bg-nav px-4 py-3 text-nav-foreground">
            <Image src="/maminco-logo-128.png" alt="" width={36} height={36} className="size-9 rounded-lg" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Asistente Maminco</p>
              <p className="text-xs text-nav-foreground/70">
                Respuestas sobre el producto
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
              className="rounded-md p-1 transition-colors hover:bg-nav-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex flex-col gap-2',
                  message.role === 'user' ? 'items-end' : 'items-start',
                )}
              >
                <p
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'rounded-br-sm bg-menu-green text-white'
                      : 'rounded-bl-sm border border-border bg-surface text-foreground',
                  )}
                >
                  {message.text}
                </p>

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => send(suggestion.question)}
                        className="rounded-full border border-menu-green/50 bg-transparent px-3 py-1 text-left text-xs text-primary-ink transition-colors hover:bg-menu-green/15 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {suggestion.question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribe tu pregunta"
              aria-label="Pregunta para el asistente"
            />
            <Button
              type="submit"
              size="icon"
              shape="pill"
              aria-label="Enviar pregunta"
              disabled={input.trim().length === 0}
              className="shrink-0 bg-gradient-to-r from-brand-yellow to-brand-orange text-brand-ink hover:brightness-110"
            >
              <Send aria-hidden="true" />
            </Button>
          </form>
        </div>
      )}

      <Button
        type="button"
        shape="pill"
        size="lg"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="maminco-chatbot-panel"
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente de preguntas'}
        className="bg-gradient-to-r from-brand-yellow to-brand-orange font-semibold text-brand-ink shadow-float hover:brightness-110 focus-visible:ring-offset-background"
      >
        <MessageCircle aria-hidden="true" />
        <span className="hidden sm:inline">
          {open ? 'Cerrar asistente' : '¿Tienes dudas?'}
        </span>
      </Button>
    </div>
  )
}

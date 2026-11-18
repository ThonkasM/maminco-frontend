'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { ApiError } from '@/lib/http/client'
import { cn } from '@/lib/utils/cn'

const schema = z.object({
  email: z.string().trim().min(1, 'Ingresa tu correo').email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña').min(6, 'Mínimo 6 caracteres'),
})

type FormValues = z.infer<typeof schema>

function landingPathFor(role: string | undefined, from: string | null): string {
  if (role === 'COOK') return '/kitchen'
  if (from && from.startsWith('/') && !from.startsWith('//') && !from.startsWith('/auth')) {
    return from
  }
  return '/dashboard'
}

function loginErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.status === 401 ? 'Correo o contraseña incorrectos.' : err.message
  }
  if (err instanceof TypeError) return 'No se pudo conectar con el servidor. Intenta de nuevo.'
  if (err instanceof Error) return err.message
  return 'Error al iniciar sesión. Verifica tus credenciales.'
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const expired = searchParams.get('expired') === '1'
  const login = useAuth((s) => s.login)
  const logout = useAuth((s) => s.logout)
  const token = useAuth((s) => s.token)
  const redirectedRef = React.useRef(false)
  const [serverError, setServerError] = React.useState<string | null>(
    expired ? 'Tu sesión expiró. Inicia sesión nuevamente.' : null,
  )
  const [success, setSuccess] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [capsLock, setCapsLock] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  })

  React.useEffect(() => {
    if (token && !redirectedRef.current && !isSubmitting && !success) {
      redirectedRef.current = true
      router.push(landingPathFor(useAuth.getState().user?.role, from))
    }
  }, [token, isSubmitting, success, router, from])

  const submit = handleSubmit(async ({ email, password }) => {
    setServerError(null)
    try {
      await login(email, password)
      setSuccess(true)
      router.push(landingPathFor(useAuth.getState().user?.role, from))
    } catch (err: unknown) {
      setServerError(loginErrorMessage(err))
    }
  })

  const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(event.getModifierState('CapsLock'))
  }

  const busy = isSubmitting || success

  return (
    <div className="w-full">
      <div aria-live="polite">
        {serverError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-danger/25 bg-danger/10 p-4 motion-safe:animate-[role-in_250ms_ease-out]"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
            <p className="text-sm font-medium text-danger">{serverError}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-success/25 bg-success/10 p-4 motion-safe:animate-[role-in_250ms_ease-out]">
            <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
            <p className="text-sm font-medium text-success">Sesión iniciada. Redirigiendo…</p>
          </div>
        )}
      </div>

      <form method="post" onSubmit={submit} className="space-y-5" noValidate>
        <FormField label="Correo electrónico" error={errors.email?.message}>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="email"
              placeholder="correo@restaurante.bo"
              autoComplete="email"
              autoFocus
              disabled={busy}
              className="h-12 rounded-xl pl-10 text-base sm:text-sm"
              {...register('email')}
            />
          </div>
        </FormField>

        <FormField
          label="Contraseña"
          error={errors.password?.message}
          description={capsLock ? 'Bloq Mayús está activado' : undefined}
        >
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={busy}
              onKeyDown={handleKey}
              onKeyUp={handleKey}
              className="h-12 rounded-xl px-10 text-base sm:text-sm"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </FormField>

        <Button
          type="submit"
          size="lg"
          shape="pill"
          className={cn('group h-12 w-full shadow-elevated', success && 'bg-success-fill text-white hover:bg-success-fill')}
          disabled={busy}
        >
          {isSubmitting ? (
            <>
              <Spinner label="Iniciando sesión" />
              Iniciando sesión…
            </>
          ) : success ? (
            <>
              <CheckCircle2 aria-hidden="true" />
              Listo
            </>
          ) : (
            <>
              Iniciar sesión
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Olvidaste tu contraseña? Pídele al administrador de tu restaurante que la restablezca.
      </p>

      {token && !success && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          shape="pill"
          className="mx-auto mt-4 flex"
          onClick={() => {
            logout()
            reset()
          }}
        >
          Cerrar la sesión anterior
        </Button>
      )}
    </div>
  )
}

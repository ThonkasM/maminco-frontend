'use client'
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

function landingPathFor(role?: string): string {
  // COOK solo tiene la pantalla de cocina; el resto entra al panel.
  return role === 'COOK' ? '/kitchen' : '/dashboard'
}

export default function LoginPage() {
  const router = useRouter()
  const login = useAuth((s) => s.login)
  const logout = useAuth((s) => s.logout)
  const token = useAuth((s) => s.token)
  const redirectedRef = useRef(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Si ya hay sesión activa, redirige según el rol (solo una vez)
  useEffect(() => {
    if (token && !redirectedRef.current && !loading) {
      redirectedRef.current = true
      router.push(landingPathFor(useAuth.getState().user?.role))
    }
  }, [token, loading, router])

  // Validación en tiempo real de email
  useEffect(() => {
    if (!email) {
      setEmailError('')
      return
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    setEmailError(isValid ? '' : 'Email inválido')
  }, [email])

  // Validación en tiempo real de contraseña
  useEffect(() => {
    if (!password) {
      setPasswordError('')
      return
    }
    setPasswordError(password.length < 6 ? 'Mínimo 6 caracteres' : '')
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (emailError || passwordError || !email || !password) {
      setError('Por favor completa los campos correctamente')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      setSuccess(true)
      router.push(landingPathFor(useAuth.getState().user?.role))
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al iniciar sesión. Verifica tus credenciales.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <Image
            src="/maminco-logo.png"
            alt="Maminco"
            width={80}
            height={80}
            priority
            className="mb-4 size-20"
          />
          <Link
            href="/"
            className="text-4xl font-semibold tracking-tight text-foreground"
          >
            Maminco
          </Link>
          <p className="mt-2 text-muted-foreground">
            Sistema de gestión de restaurante
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-lg border border-border bg-surface p-8 shadow-elevated ring-1 ring-inset ring-black/[0.02] dark:ring-white/[0.03]">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-8">
            Iniciar sesión
          </h1>

          {/* Success Message */}
          {success && (
            <div className="mb-6 rounded-md border border-success/25 bg-success/10 p-4">
              <p className="text-sm font-medium text-success">
                Autenticación exitosa. Redirigiendo…
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-md border border-danger/25 bg-danger/10 p-4"
            >
              <p className="text-sm font-medium text-danger">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <FormField label="Email" error={emailError} required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                disabled={loading}
              />
            </FormField>

            <FormField label="Contraseña" error={passwordError} required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
            </FormField>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || success || !!emailError || !!passwordError}
            >
              {loading ? (
                <>
                  <Spinner label="Iniciando sesión" />
                  Iniciando sesión…
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>

          {/* Demo Info */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-4">
              Usa tus credenciales de restaurante para acceder al panel
            </p>
            {token && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => {
                  logout()
                  setEmail('')
                  setPassword('')
                }}
              >
                <Trash2 />
                Limpiar sesión anterior
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

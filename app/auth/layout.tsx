import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autenticación - Maminco',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

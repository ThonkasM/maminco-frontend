import type { Metadata } from 'next'
import { AboutPage } from '@/components/marketing/AboutPage'

export const metadata: Metadata = {
  title: 'Nosotros',
  description:
    'Conoce a Maminco Software S.R.L.: quiénes somos, nuestra misión y visión, y el equipo que desarrolla el sistema para restaurantes de Bolivia.',
}

export default function NosotrosPage() {
  return <AboutPage />
}

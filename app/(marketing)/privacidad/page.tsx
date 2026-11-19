import type { Metadata } from 'next'
import { LegalPage } from '@/components/marketing/LegalPage'
import { PRIVACY } from '@/components/marketing/legal/legal-content'

export const metadata: Metadata = {
  title: PRIVACY.title,
  description: PRIVACY.description,
}

export default function PrivacidadPage() {
  return <LegalPage document={PRIVACY} />
}

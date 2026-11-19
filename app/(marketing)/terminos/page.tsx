import type { Metadata } from 'next'
import { LegalPage } from '@/components/marketing/LegalPage'
import { TERMS } from '@/components/marketing/legal/legal-content'

export const metadata: Metadata = {
  title: TERMS.title,
  description: TERMS.description,
}

export default function TerminosPage() {
  return <LegalPage document={TERMS} />
}

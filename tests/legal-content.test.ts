import { describe, expect, it } from 'vitest'
import { CONTACT_EMAIL, LEGAL_DOCUMENTS } from '../components/marketing/legal/legal-content'

describe('legal content', () => {
  it('exposes the terms and privacy pages with unique slugs', () => {
    expect(LEGAL_DOCUMENTS.map((doc) => doc.slug)).toEqual(['terminos', 'privacidad'])
  })

  it.each(LEGAL_DOCUMENTS)('$slug has unique section ids and no leftover placeholders', (doc) => {
    const ids = doc.sections.map((section) => section.id)
    expect(new Set(ids).size).toBe(ids.length)
    const text = JSON.stringify(doc)
    expect(text).not.toMatch(/\[Por completar|\[Insertar|undefined/)
    expect(text).toContain(CONTACT_EMAIL)
  })
})

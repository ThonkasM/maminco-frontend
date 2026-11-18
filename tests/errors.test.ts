import { describe, expect, it } from 'vitest'
import { getErrorMessage } from '@/lib/utils/errors'
import { getUserDisplayName } from '@/lib/utils/getUserDisplayName'

describe('getErrorMessage', () => {
    it('uses Error.message', () => {
        expect(getErrorMessage(new Error('boom'), 'fallback')).toBe('boom')
    })

    it('uses non-empty strings', () => {
        expect(getErrorMessage('oops', 'fallback')).toBe('oops')
    })

    it('falls back for empty or unknown values', () => {
        expect(getErrorMessage(new Error(''), 'fallback')).toBe('fallback')
        expect(getErrorMessage('', 'fallback')).toBe('fallback')
        expect(getErrorMessage({ message: 'x' }, 'fallback')).toBe('fallback')
        expect(getErrorMessage(null, 'fallback')).toBe('fallback')
    })
})

describe('getUserDisplayName', () => {
    it('prefers trimmed name', () => {
        expect(getUserDisplayName({ name: '  Ana  ', email: 'a@b.com' })).toBe('Ana')
    })

    it('falls back to email prefix', () => {
        expect(getUserDisplayName({ name: ' ', email: 'maria@x.com' })).toBe('maria')
    })

    it('falls back to generic label', () => {
        expect(getUserDisplayName(null)).toBe('Usuario')
        expect(getUserDisplayName({})).toBe('Usuario')
    })
})
